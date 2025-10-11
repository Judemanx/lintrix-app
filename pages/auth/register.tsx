// pages/auth/register.tsx
import { useState } from "react";
import AuthLayout from "../../components/AuthLayout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // 👈 nuevo
  const [walletAddress, setWalletAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,          // 👈 nuevo
          password,
          address: walletAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // redirect to login after successful registration
      window.location.href = "/auth/login";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to access your wallet">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert error">{error}</div>
        )}

        <label className="lbl">Email</label>
        <input
          className="inp"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="lbl">Username</label> {/* 👈 nuevo */}
        <input
          className="inp"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
        />

        <label className="lbl">Wallet Address</label>
        <input
          className="inp"
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          required
        />

        <label className="lbl">Password</label>
        <input
          className="inp"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="lbl">Confirm Password</label>
        <input
          className="inp"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="btn primary w100" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
