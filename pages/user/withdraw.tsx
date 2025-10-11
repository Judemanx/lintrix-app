import React, { useState } from "react";
import axios from "axios";
import UserLayout from "@/components/UserLayout";
import { toast } from "react-toastify";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not authenticated");

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0)
        throw new Error("Invalid amount");

      // 🔹 Llamada off-chain al backend
      const res = await axios.post(
        "/api/wallet/withdraw",
        { amount: parsedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Withdraw successful");
      toast.success(res.data.message || "✅ Withdraw successful");
      setAmount("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err.message || "Withdraw failed";
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Withdraw Funds</h1>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <input
            type="number"
            placeholder="Enter amount"
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
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>

        {message && <p className="mt-3 text-green-400">{message}</p>}
        {error && <p className="mt-3 text-red-400">{error}</p>}
      </div>
    </UserLayout>
  );
}
