import React, { useEffect, useState } from "react";
import UserLayout from "@/components/UserLayout";

type UserBalance = {
  id: string;
  email: string;
  address: string;
  localBalance: number;
  onChainBalance: number;
};

export default function BalancePage() {
  const [data, setData] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No session token found. Please log in again.");

        const res = await fetch("/api/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch balance");

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <UserLayout>
      <h1 className="text-2xl font-bold mb-4">Balance</h1>

      {loading && <p>Loading balance...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div className="space-y-2 mt-4">
          <p><b>Email:</b> {data.email}</p>
          <p><b>Wallet Address:</b> {data.address}</p>
          <p><b>Balance (off-chain):</b> {data.localBalance} LTXD</p>
          <p><b>Balance (on-chain):</b> {data.onChainBalance} LTXD</p>
        </div>
      )}
    </UserLayout>
  );
}
