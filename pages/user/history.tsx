"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import UserLayout from "@/components/UserLayout";

interface Party {
  id: string;
  email: string | null;
  address: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  from: Party | null;
  to: Party | null;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string | null; address: string | null } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/wallet/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(res.data.transactions);
        setUser({
          id: res.data.userId,
          email: res.data.userEmail,
          address: res.data.userAddress,
        });
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const isSameUser = (a: Party | null, b: Party | null) => {
    if (!a || !b) return false;
    return (
      (a.id && b.id && a.id === b.id) ||
      (a.email && b.email && a.email === b.email) ||
      (a.address && b.address && a.address === b.address)
    );
  };

  const renderTransaction = (tx: Transaction) => {
    let label = "";
    let sign = "";
    let color = "";

    const isOutgoing = user && isSameUser(tx.from, user);
    const isIncoming = user && isSameUser(tx.to, user);

    switch (tx.type) {
      case "DEPOSIT":
        label = "Deposit";
        sign = "+";
        color = "text-green-500";
        break;

      case "WITHDRAW":
        label = "Withdraw";
        sign = "-";
        color = "text-red-500";
        break;

      case "TRANSFER":
        if (isOutgoing) {
          label = `Sent → ${tx.to?.email || tx.to?.address || "Unknown"}`;
          sign = "-";
          color = "text-red-500";
        } else if (isIncoming) {
          label = `Received ← ${tx.from?.email || tx.from?.address || "Unknown"}`;
          sign = "+";
          color = "text-green-500";
        } else {
          label = "Transfer (unrelated)";
          sign = "";
          color = "text-gray-400";
        }
        break;

      default:
        label = tx.type;
        sign = "";
        color = "text-gray-400";
    }

    return (
      <div
        key={tx.id}
        className="p-3 rounded-xl bg-gray-900 border border-gray-700 flex justify-between"
      >
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-gray-400">
            {new Date(tx.createdAt).toLocaleString()}
          </p>
        </div>
        <div className={`font-bold ${color}`}>
          {sign}
          {tx.amount} LTXD
        </div>
      </div>
    );
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions found.</p>
        ) : (
          <div className="space-y-3">{transactions.map(renderTransaction)}</div>
        )}
      </div>
    </UserLayout>
  );
}
