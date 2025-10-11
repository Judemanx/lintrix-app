import { useState } from "react";
import UserLayout from "@/components/UserLayout";
import axios from "axios";
import { toast } from "react-toastify";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No session token found");

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0)
        throw new Error("Invalid amount");

      // 🔹 Llamada off-chain al backend
      const res = await axios.post(
        "/api/wallet/deposit",
        { amount: parsedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || `✅ Deposit successful (${parsedAmount} LTXD off-chain)`);
      toast.success(res.data.message || `✅ Deposit successful (${parsedAmount} LTXD)`);
      setAmount("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err.message || "Deposit failed";
      toast.error(`❌ ${msg}`);
      setMessage(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Deposit Funds</h1>
        <form onSubmit={handleDeposit} className="space-y-4">
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
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </form>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </UserLayout>
  );
}
