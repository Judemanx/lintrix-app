// pages/index.tsx
import { useEffect, useMemo, useState } from "react";
import {
  useContract,
  useAddress,
  useTokenBalance,
  useNetworkMismatch,
  useSwitchChain,
  useChain,
  ConnectWallet,
} from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { motion, AnimatePresence, Variants } from "framer-motion";

type TabKey = "dashboard" | "transfer" | "burn" | "history" | "docs";

export default function Home() {
  // Web3 / thirdweb
  const address = useAddress();
  const chain = useChain();
  const isMismatch = useNetworkMismatch();
  const switchChain = useSwitchChain();

  // Contrato ERC-20 LTXD
  const { contract } = useContract(
    "0x9862daBb54231db9dcbbe1F9F65186AfC0D100c0",
    "token"
  );
  const { data: tokenBalance, refetch: refetchBalance } = useTokenBalance(
    contract,
    address
  );

  // Estado UI
  const [active, setActive] = useState<TabKey>("dashboard");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<string[]>([]);

  // Balance USD (1:1 temporal)
  const usdEquivalent = useMemo(() => {
    const v = parseFloat(tokenBalance?.displayValue || "0");
    return isNaN(v) ? 0 : v * 1;
  }, [tokenBalance]);

  // Helper
  const shortAddr = (a?: string | null) =>
    a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";

  // Auto-cambiar a BNB Smart Chain si la red no coincide
  useEffect(() => {
    if (isMismatch) {
      toast.warn("⚠️ Red incorrecta. Cambiando a Binance Smart Chain...");
      switchChain(56); // BNB Smart Chain
    }
  }, [isMismatch, switchChain]);

  // Acciones
  const transferTokens = async () => {
    if (!contract) return toast.error("⚠️ Contrato no conectado");
    if (!address) return toast.error("⚠️ Conecta tu wallet");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return toast.error("❌ Cantidad inválida");
    if (!toAddress || toAddress.length < 10)
      return toast.error("❌ Dirección destino inválida");
    const current = parseFloat(tokenBalance?.displayValue || "0");
    if (current < parsedAmount) return toast.error("❌ Saldo insuficiente");

    try {
      setIsProcessing(true);
      const tx = await contract.erc20.transfer(toAddress, parsedAmount);
      toast.success("✅ Transferencia enviada a la red");
      toast.info("⌛ Confirmando en la blockchain...");
      // quitamos tx.wait?.()
      toast.success(`✅ Transferidos ${parsedAmount} LTXD a ${shortAddr(toAddress)}`);
      setTransactions((prev) => [
        `➜ ${new Date().toLocaleString()} • Transferidos ${parsedAmount} LTXD a ${toAddress}`,
        ...prev,
      ]);
      setToAddress("");
      setAmount("");
      refetchBalance?.();
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Error al transferir tokens");
    } finally {
      setIsProcessing(false);
    }
  };

  const burnTokens = async () => {
    if (!contract) return toast.error("⚠️ Contrato no conectado");
    if (!address) return toast.error("⚠️ Conecta tu wallet");

    const parsedBurnAmount = parseFloat(burnAmount);
    if (isNaN(parsedBurnAmount) || parsedBurnAmount <= 0)
      return toast.error("❌ Cantidad inválida");
    const current = parseFloat(tokenBalance?.displayValue || "0");
    if (current < parsedBurnAmount) return toast.error("❌ Saldo insuficiente");

    try {
      setIsProcessing(true);
      const tx = await contract.erc20.burn(parsedBurnAmount);
      toast.success("🔥 Quema enviada a la red");
      toast.info("⌛ Confirmando en la blockchain...");
      // quitamos tx.wait?.()
      toast.success(`🔥 Quemados ${parsedBurnAmount} LTXD`);
      setTransactions((prev) => [
        `🔥 ${new Date().toLocaleString()} • Quemados ${parsedBurnAmount} LTXD`,
        ...prev,
      ]);
      setBurnAmount("");
      refetchBalance?.();
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Error al quemar tokens");
    } finally {
      setIsProcessing(false);
    }
  };

    // ✅ Animaciones corregidas (válido para TypeScript + framer-motion)
  const fadeSlide = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.18 },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.18 },
    },
  };


  return (
    <div className="lx-app">
      {/* Sidebar */}
      <aside className="lx-sidebar">
        <div className="lx-brand">
          <div className="lx-logo">L</div>
          <div className="lx-brandtext">
            <span>Lintrix</span>
            <small>Wallet Suite</small>
          </div>
        </div>

        <nav className="lx-nav">
          <button
            className={`lx-nav-item ${active === "dashboard" ? "active" : ""}`}
            onClick={() => setActive("dashboard")}
          >
            <i className="icon i-dashboard" /> <span>Dashboard</span>
          </button>
          <button
            className={`lx-nav-item ${active === "transfer" ? "active" : ""}`}
            onClick={() => setActive("transfer")}
          >
            <i className="icon i-send" /> <span>Transferir</span>
          </button>
          <button
            className={`lx-nav-item ${active === "burn" ? "active" : ""}`}
            onClick={() => setActive("burn")}
          >
            <i className="icon i-burn" /> <span>Quemar</span>
          </button>
          <button
            className={`lx-nav-item ${active === "history" ? "active" : ""}`}
            onClick={() => setActive("history")}
          >
            <i className="icon i-history" /> <span>Historial</span>
          </button>
          <button
            className={`lx-nav-item ${active === "docs" ? "active" : ""}`}
            onClick={() => setActive("docs")}
          >
            <i className="icon i-doc" /> <span>Whitepaper</span>
          </button>
        </nav>

        <div className="lx-sidebar-footer">
          <div className="lx-net">
            <span className="dot" />
            <div>
              <div>{chain?.name || "BNB Smart Chain"}</div>
              <small className="muted">
                {address ? shortAddr(address) : "Wallet desconectada"}
              </small>
            </div>
          </div>
          <div>Lintrix © 2025</div>
        </div>
      </aside>

      {/* Main */}
      <main className="lx-main">
        {/* Header */}
        <header className="lx-header">
          <div className="lx-breadcrumb">
            <span className="muted">Lintrix</span> / <b>{active.toUpperCase()}</b>
          </div>
          <div className="lx-walletpill">
            <div className="avatar">💼</div>
            <div>
              <div className="addr">{address ? shortAddr(address) : "Conecta tu wallet"}</div>
              <div className="sub">{chain?.name || "BNB Smart Chain"}</div>
            </div>
            <ConnectWallet />
          </div>
        </header>

        {/* Grid */}
        <section className="lx-grid">
          {/* Dashboard Balance */}
          <AnimatePresence mode="wait">
            {active === "dashboard" && (
              <motion.div key="balance" className="card card-balance" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">Tu saldo</div>
                  <div className="tag tag-safe">Contrato activo</div>
                </div>
                <div className="card-body">
                  <div className="balance-amount">
                    {tokenBalance?.displayValue || "0.0"}
                    <span className="ticker">LTXD</span>
                  </div>
                  <div className="balance-usd">≈ ${usdEquivalent.toFixed(2)} USD</div>
                </div>
                <div className="card-foot">
                  Consejo: usa los accesos rápidos para transferir o quemar tokens.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Acciones rápidas */}
          <AnimatePresence mode="wait">
            {active === "dashboard" && (
              <motion.div key="qa" className="card" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">Acciones rápidas</div>
                </div>
                <div className="card-body">
                  <div className="quick-actions">
                    <button className="btn primary" onClick={() => setActive("transfer")}>
                      Transferir
                    </button>
                    <button className="btn warning" onClick={() => setActive("burn")}>
                      Quemar
                    </button>
                    <button className="btn ghost" onClick={() => setActive("history")}>
                      Ver historial
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <AnimatePresence mode="wait">
            {active === "dashboard" && (
              <motion.div key="info" className="card card-info" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">Información</div>
                </div>
                <div className="card-body">
                  <ul className="bullets">
                    <li>Red: {chain?.name || "BNB Smart Chain (56)"}</li>
                    <li>Token: LTXD (ERC-20)</li>
                    <li>Contrato: 0x9862...00c0</li>
                  </ul>
                  <span className="hint">
                    Si cambias de red en tu wallet, la app intentará reconectarte automáticamente.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transferir */}
          <AnimatePresence mode="wait">
            {active === "transfer" && (
              <motion.div key="transfer" className="card span-2 card-form" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">🔁 Transferir LTXD</div>
                </div>
                <div className="card-body">
                  <label className="lbl">Dirección destino</label>
                  <input
                    className="inp"
                    type="text"
                    placeholder="0x..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                  />
                  <label className="lbl">Cantidad</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="any"
                  />

                  <button
                    className={`btn primary w100 ${isProcessing ? "disabled" : ""}`}
                    onClick={transferTokens}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Procesando..." : "Enviar Tokens"}
                  </button>
                </div>
                <div className="card-foot">
                  Disponible: {tokenBalance?.displayValue || "0.0"} LTXD
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quemar */}
          <AnimatePresence mode="wait">
            {active === "burn" && (
              <motion.div key="burn" className="card span-2 card-form" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">🔥 Quemar LTXD</div>
                </div>
                <div className="card-body">
                  <label className="lbl">Cantidad a quemar</label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="0.0"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    min="0"
                    step="any"
                  />

                  <button
                    className={`btn warning w100 ${isProcessing ? "disabled" : ""}`}
                    onClick={burnTokens}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Procesando..." : "Quemar Tokens"}
                  </button>
                </div>
                <div className="card-foot">
                  Disponible: {tokenBalance?.displayValue || "0.0"} LTXD
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historial */}
          <AnimatePresence mode="wait">
            {active === "history" && (
              <motion.div key="history" className="card span-2 card-table" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">📜 Historial de transacciones</div>
                </div>
                <div className="card-body tablewrap">
                  {transactions.length === 0 ? (
                    <div className="empty">No hay transacciones aún.</div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, idx) => (
                          <tr key={idx}>
                            <td>{tx}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Whitepaper */}
          <AnimatePresence mode="wait">
            {active === "docs" && (
              <motion.div key="docs" className="card span-2" {...fadeSlide}>
                <div className="card-head">
                  <div className="card-title">📄 Whitepaper</div>
                </div>
                <div className="card-body">
                  <p className="hint">Descarga el documento oficial de Lintrix.</p>
                  <a href="/whitepaper.pdf" download className="btn primary" style={{ marginTop: 8 }}>
                    Descargar Whitepaper
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
