// pages/auth/login.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        alert(body.error || "Login failed");
        return;
      }

      // Save token, username and email in localStorage
      localStorage.setItem("token", body.token);
      if (body.user?.username) {
        localStorage.setItem("username", body.user.username);
      }
      if (body.user?.email) {
        localStorage.setItem("email", body.user.email);
      }

      router.push("/user"); // go to user dashboard
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in to Lintrix" subtitle="Access your wallet">
      <form onSubmit={handleSubmit}>
        <label className="lbl">Email</label>
        <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="lbl">Password</label>
        <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button className="btn primary w100" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link href="/auth/register">Create an account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
