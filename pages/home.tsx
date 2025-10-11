// pages/home.tsx
import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Lintrix — Home</title>
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(1200px 900px at 80% -10%, #22252b 0%, #13151a 40%, #0d0e10 70%) no-repeat fixed, var(--bg)",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div className="card p-6" style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", marginBottom: 12 }}>
              <div
                className="lx-logo"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 28,
                  margin: "0 auto",
                }}
              >
                L
              </div>
            </div>

            <h1 className="text-2xl font-bold mt-4">Welcome to Lintrix</h1>
            <p className="text-gray-400 mt-2">
              Sign in or create an account to manage your LTXD wallet.
            </p>

            <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
              <Link href="/auth/login" className="btn primary w-full">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn ghost w-full">
                Create account
              </Link>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link href="/"
                className="text-sm"
                style={{ color: "var(--muted)", textDecoration: "underline" }}
              >
                Admin dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
