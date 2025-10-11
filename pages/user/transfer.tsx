import React, { useState } from "react";
import UserLayout from "@/components/UserLayout";
import axios from "axios";
import { toast } from "react-toastify";

export default function TransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0)
        throw new Error("Invalid amount");

      if (!to || to.length < 4)
        throw new Error("Invalid receiver (must be user ID or wallet)");

      // 🔹 Llamada off-chain al backend
      const res = await axios.post(
        "/api/wallet/transfer",
        { to, amount: parsedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Transfer successful");
      toast.success(res.data.message || "✅ Transfer successful");
      setTo("");
      setAmount("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err.message || "Transfer failed";
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Transfer Funds</h1>
        <form onSubmit={handleTransfer} className="space-y-4">
          <input
            type="text"
            placeholder="Receiver ID or Wallet Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-700 bg-gray-800 text-white p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-700 bg-gray-800 text-white p-2 rounded"
            min="0"
            step="0.01"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Transfer"}
          </button>
        </form>

        {message && <p className="mt-3 text-green-400">{message}</p>}
        {error && <p className="mt-3 text-red-400">{error}</p>}
      </div>
    </UserLayout>
  );
}
