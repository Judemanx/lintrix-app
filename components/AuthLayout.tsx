// components/AuthLayout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function AuthLayout({
  children,
  title = "Welcome to Lintrix",
  subtitle = "Securely manage your LTXD",
}: Props) {
  return (
    <>
      <Head>
        <title>{title} — Lintrix</title>
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
        <div
          style={{
            maxWidth: 960,
            width: "100%",
            display: "flex",
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Branding / Left column */}
          <div style={{ flex: 1, minWidth: 280, textAlign: "center", color: "var(--ink)" }}>
            <div style={{ display: "inline-block", marginBottom: 12 }}>
              <div className="lx-logo" style={{ width: 72, height: 72, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 28 }}>
                L
              </div>
            </div>

            <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>{subtitle}</p>

            <div style={{ marginTop: 16 }}>
              <Link href="/home" legacyBehavior>
                <a className="btn ghost">Back to Home</a>
              </Link>
            </div>
          </div>

          {/* Card / Right column (form goes here as children) */}
          <div style={{ flex: "0 0 420px", width: "100%", maxWidth: 420 }}>
            <div className="card">
              <div className="card-body">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
