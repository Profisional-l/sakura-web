import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl mb-2">{SITE_NAME}</h1>
      <p className="text-white/50 mb-8">Admin Login</p>
      <LoginForm />
    </div>
  );
}
