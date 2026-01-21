import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl w-full text-center space-y-6">
      <div className="mx-auto my-32">
        <AuthCard
          title="Giriş Yap"
          description="Hesabınıza erişmek için bilgilerinizi girin"
          footer={
            <span>
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Kayıt olun
              </Link>
            </span>
          }
        >
          <LoginForm />
        </AuthCard>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} PlainLaw. Tüm hakları saklıdır.
      </p>
    </div>
  );
}
