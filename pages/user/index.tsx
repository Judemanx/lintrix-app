// pages/user/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import UserLayout from "@/components/UserLayout";
import {
  useAddress,
  useContract,
  useTokenBalance,
} from "@thirdweb-dev/react";

export default function UserDashboardPage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("username"); // 👈 lo mismo que en UserLayout
    if (stored) setUsername(stored);
  }, []);

  // 👉 Conectar contrato ERC-20 LTXD
  const address = useAddress();
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

  return (
    <UserLayout>
      <h1>Dashboard</h1>
      <p>
        {username ? `Welcome back, ${username} 🚀` : "Welcome to your account 🚀"}
      </p>

      <section style={{ marginTop: "20px" }}>
        <h2>Quick Overview</h2>
        <ul>
          <li>
            Balance:{" "}
            {tokenBalance
              ? `${tokenBalance.displayValue} LTXD ≈ $${usdEquivalent.toFixed(
                  2
                )} USD`
              : "(connect your wallet)"}
          </li>
          <li>Last transaction: (coming soon)</li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>Shortcuts</h2>
        <p>
          Use the sidebar to access your balance, deposit, withdraw, transfer, and history.
        </p>
      </section>
    </UserLayout>
  );
}
