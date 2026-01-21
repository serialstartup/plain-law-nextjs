"use server"

import { analyzeTextChunks } from "@/lib/ai/analyze"
import { extractPdfText } from "@/lib/pdf/extract-text"
import { extractDocxText } from "@/lib/docx/extract-text"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ==================== READ ACTIONS ====================

export async function getRecentContracts(limit: number = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { contracts: [], error: 'Unauthorized' }

  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to load contracts:', error)
    return { contracts: [], error: error.message }
  }

  return { contracts: contracts ?? [], error: null }
}

export interface ContractsListParams {
  search?: string
  sort?: 'date' | 'risk'
  dir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export async function getContractsList(params: ContractsListParams = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { contracts: [], count: 0, error: 'Unauthorized' }

  const { search = '', sort = 'date', dir = 'desc', page = 1, pageSize = 5 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const ascending = dir === 'asc'
  const sortColumn = sort === 'risk' ? 'risk_score' : 'analyzed_at'

  let query = supabase
    .from('contracts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (search.trim()) {
    query = query.ilike('file_name', `%${search.trim()}%`)
  }

  const { data: contracts, count, error } = await query
    .order(sortColumn, { ascending, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (error) {
    console.error('Failed to load contracts list:', error)
    return { contracts: [], count: 0, error: error.message }
  }

  return { contracts: contracts ?? [], count: count ?? 0, error: null }
}

export async function getUserQuota() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { quota: null, error: 'Unauthorized' }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('quota_limit, quota_used')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Failed to load user quota:', error)
    return { quota: null, error: error.message }
  }

  return { quota: profile, error: null }
}

// ==================== WRITE ACTIONS ====================

export async function uploadContract(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // ✨ YENİ: Quota kontrolü
  const { data: canAnalyze } = await supabase
    .rpc('check_quota', { user_id: user.id })

  if (!canAnalyze) {
    throw new Error('Quota has been exceeded')
  }

  const file = formData.get('file') as File

  if (!file) throw new Error('No file provided')
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (!allowed.includes(file.type)) {
    throw new Error('Invalid file type (allowed: PDF, DOCX)')
  }

  // ✨ YENİ: File size check (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File too large (max 50MB)')
  }

  const fileId = randomUUID()
  const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
  const filePath = `${user.id}/${fileId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600'
    })

  if (uploadError) throw uploadError

  // ✨ YENİ: file_name ve file_size kaydet
  const { error: dbError } = await supabase
    .from('contracts')
    .insert({
      id: fileId,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      status: 'uploaded'
    })

  if (dbError) throw dbError

  revalidatePath('/contracts')
  redirect(`/contracts/${fileId}`)
}

export async function analyzeContract(contractId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .eq('user_id', user.id)
    .single()

  if (!contract) throw new Error('Contract not found or unauthorized')

  // ✨ YENİ: Status update to 'analyzing'
  await supabase
    .from('contracts')
    .update({ status: 'analyzing' })
    .eq('id', contractId)

  revalidatePath(`/contracts/${contractId}`)

  try {
    const { data: file } = await supabase.storage
      .from('contracts')
      .download(contract.file_path)

    if (!file) throw new Error('File not found')

    let fullText = ''
    if (contract.file_path.endsWith('.pdf')) {
      fullText = await extractPdfText(file)
    } else if (contract.file_path.endsWith('.docx')) {
      fullText = await extractDocxText(file)
    } else {
      throw new Error('Unsupported file type')
    }
    const analysis = await analyzeTextChunks(fullText)

    // ✨ YENİ: risk_score ve analyzed_at kaydet
    await supabase
      .from('contracts')
      .update({
        analysis: analysis,
        risk_score: analysis.riskScore,
        status: 'analyzed',
        analyzed_at: new Date().toISOString()
      })
      .eq('id', contractId)

    // ✨ YENİ: Clause details kaydet (optional)
    if (analysis.clauses?.length > 0) {
      const clauseDetails = analysis.clauses.map((clause) => ({
        contract_id: contractId,
        clause_number: clause.number,
        clause_title: clause.title,
        clause_text: clause.text,
        risk_level: clause.riskLevel,
        risk_description: clause.description,
        recommendations: clause.recommendations
      }))

      await supabase.from('analysis_details').insert(clauseDetails)
    }

    // ✨ YENİ: Quota increment (user already verified at function start)
    await supabase.rpc('increment_quota_used', { user_id: user.id })

    revalidatePath(`/contracts/${contractId}`)
    revalidatePath('/contracts')

  } catch (error) {
    await supabase
      .from('contracts')
      .update({ status: 'failed' })
      .eq('id', contractId)

    // Ensure UI reflects failure state
    revalidatePath(`/contracts/${contractId}`)
    revalidatePath('/contracts')

    throw error
  }
}
