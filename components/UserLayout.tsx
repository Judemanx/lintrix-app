// components/UserLayout.tsx
import React, { ReactNode, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ConnectWallet,
  useAddress,
  useChain,
  useContract,
  useTokenBalance,
} from "@thirdweb-dev/react";
import LogoutButton from "./LogoutButton";

type Props = {
  children: ReactNode;
};

export default function UserLayout({ children }: Props) {
  const router = useRouter();
  const address = useAddress();
  const chain = useChain();

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
  }, []);

  // 👉 Conectar contrato ERC-20 LTXD
  const { contract } = useContract(
    "0x9862daBb54231db9dcbbe1F9F65186AfC0D100c0", // contrato Lintrix
    "token"
  );
  const { data: tokenBalance } = useTokenBalance(contract, address);

  // Balance en USD (1 LTXD = 1 USD temporal)
  const usdEquivalent = useMemo(() => {
    const v = parseFloat(tokenBalance?.displayValue || "0");
    return isNaN(v) ? 0 : v * 1;
  }, [tokenBalance]);

  const shortAddr = (a?: string | null) =>
    a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";

  const nav = [
    { key: "dashboard", label: "Dashboard", href: "/user" },
    { key: "balance", label: "Balance", href: "/user/balance" },
    { key: "deposit", label: "Deposit", href: "/user/deposit" },
    { key: "withdraw", label: "Withdraw", href: "/user/withdraw" },
    { key: "transfer", label: "Transfer", href: "/user/transfer" },
    { key: "history", label: "History", href: "/user/history" },
  ];

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href);

  return (
    <div className="lx-app">
      {/* Sidebar */}
      <aside className="lx-sidebar">
        <div className="lx-brand">
          <div className="lx-logo">L</div>
          <div className="lx-brandtext">
            <span>Lintrix</span>
            <small>Wallet</small>
          </div>
        </div>

        <nav className="lx-nav">
          {nav.map((n) => (
            <Link key={n.key} href={n.href} legacyBehavior>
              <a
                className={`lx-nav-item ${isActive(n.href) ? "active" : ""}`}
                aria-current={isActive(n.href) ? "page" : undefined}
              >
                <span>{n.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="lx-sidebar-footer">
          <div className="lx-net">
            <span className="dot" />
            <div>
              <div>{chain?.name || "BNB Smart Chain"}</div>
              <small className="muted">
                {address ? shortAddr(address) : "Wallet disconnected"}
              </small>
            </div>
          </div>
          <div>Lintrix © 2025</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lx-main">
        <header className="lx-header">
          <div className="lx-breadcrumb">
            <span className="muted">Lintrix</span> /{" "}
            <b>
              {username
                ? username
                : router.pathname.replace("/user/", "").toUpperCase() ||
                  "DASHBOARD"}
            </b>
          </div>

          <div
            className="lx-walletpill"
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
          >
            <div className="avatar">💼</div>
            <div>
              <div className="addr">
                {username || (address ? shortAddr(address) : "Connect your wallet")}
              </div>
              <div className="sub">{chain?.name || "BNB Smart Chain"}</div>
              {tokenBalance && (
                <div style={{ fontSize: "0.85rem", color: "#0f0" }}>
                  {tokenBalance.displayValue} LTXD ≈ ${usdEquivalent.toFixed(2)} USD
                </div>
              )}
            </div>
            <ConnectWallet />
            <LogoutButton />
          </div>
        </header>

        <div style={{ padding: 26 }}>{children}</div>
      </main>
    </div>
  );
}
