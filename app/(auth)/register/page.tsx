import { AuthCard } from '@/components/auth/AuthCard'
import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-12 lg:py-16 grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-primary/10 text-gray-600 px-3 py-1 text-xs font-medium">Hukuk profesyonelleri tarafından güveniliyor</span>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-lime-800 tracking-tight">Sözleşme inceleme sürecinizi basitleştirin.</h1>
            <p className="text-muted-foreground text-base">Karmaşık hukuki dokümanları dakikalar içinde net ve uygulanabilir özetlere dönüştürün. İmzalamadan önce riskleri ve yükümlülükleri tespit edin.</p>
          </div>

          <ul className="space-y-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary mt-1 size-5" />
              <div>
                <p className="font-medium">Yapay zekâ destekli özetler</p>
                <p className="text-muted-foreground text-sm">Önemli maddeleri ve yükümlülükleri otomatik olarak çıkarır.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary mt-1 size-5" />
              <div>
                <p className="font-medium">Risk tespiti</p>
                <p className="text-muted-foreground text-sm">Standart dışı şartları ve olası sorumlulukları belirler.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary mt-1 size-5" />
              <div>
                <p className="font-medium">Güvenli ve gizli</p>
                <p className="text-muted-foreground text-sm">Belgeleriniz işletme seviyesinde güvenlikle korunur.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="w-full max-w-md md:ml-auto">
          <AuthCard
            title="Hesap oluştur"
            description="Hukuki incelemelerde zamandan tasarruf eden binlerce kullanıcıya katılın"
            footer={<span>Zaten hesabınız var mı? <Link href="/login" className="text-primary hover:underline">Giriş yapın</Link></span>}
          >
            <RegisterForm />
          </AuthCard>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4" />
        <span>Güvenli ve gizli analiz</span>
      </div>
      <p className="text-center mt-2 text-xs text-muted-foreground">© {new Date().getFullYear()} PlainLaw. Tüm hakları saklıdır.</p>
    </div>
  )
}
