import { openai } from './openai'
import { ANALYSIS_SYSTEM_PROMPT, createAnalysisPrompt } from './prompts'
import type { ContractAnalysis } from './types'

export async function analyzeTextChunks(fullText: string): Promise<ContractAnalysis> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: createAnalysisPrompt(fullText) }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No analysis generated')

  return JSON.parse(content)
}