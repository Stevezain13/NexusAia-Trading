import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar } from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  void: "#020508",
  deep: "#060d18",
  navy: "#081428",
  slate: "#0c1f38",
  panel: "rgba(8,20,40,0.85)",
  glass: "rgba(14,30,60,0.6)",
  glassLight: "rgba(20,50,90,0.4)",
  border: "rgba(0,180,255,0.12)",
  borderBright: "rgba(0,220,255,0.3)",
  cyan: "#00e5ff",
  cyanDim: "#00b4cc",
  blue: "#0090ff",
  blueDim: "#0060cc",
  neon: "#00ffcc",
  neonDim: "#00cc99",
  green: "#00ff88",
  red: "#ff3366",
  orange: "#ff9900",
  gold: "#ffd700",
  text: "#e8f4ff",
  textDim: "#7a9fbf",
  textMuted: "#3a5f80",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const equityCurve = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  equity: 98000 + Math.sin(i * 0.3) * 3000 + i * 120 + Math.random() * 800,
  balance: 97000 + i * 110,
}));

const regimenData = [
  { label: "MON", bull: 72, bear: 18, vol: 45 },
  { label: "TUE", bull: 65, bear: 25, vol: 60 },
  { label: "WED", bull: 58, bear: 32, vol: 75 },
  { label: "THU", bull: 80, bear: 12, vol: 38 },
  { label: "FRI", bull: 74, bear: 16, vol: 52 },
  { label: "SAT", bull: 68, bear: 22, vol: 44 },
  { label: "SUN", bull: 76, bear: 14, vol: 48 },
];

const radarData = [
  { metric: "Trend", A: 82 },
  { metric: "Momentum", A: 67 },
  { metric: "Volatility", A: 45 },
  { metric: "Volume", A: 78 },
  { metric: "Sentiment", A: 71 },
  { metric: "Regime", A: 88 },
];

const openTrades = [
  { id: "T-4821", symbol: "EURUSD", dir: "BUY", lots: 0.5, entry: 1.0842, current: 1.0878, pnl: +45.20, tp: 1.0920, sl: 1.0800 },
  { id: "T-4822", symbol: "GBPJPY", dir: "SELL", lots: 0.3, entry: 189.42, current: 188.98, pnl: +132.60, tp: 188.00, sl: 190.20 },
  { id: "T-4823", symbol: "XAUUSD", dir: "BUY", lots: 0.1, entry: 2318.50, current: 2312.40, pnl: -61.00, tp: 2350.00, sl: 2295.00 },
  { id: "T-4824", symbol: "USDJPY", dir: "BUY", lots: 0.4, entry: 154.22, current: 154.68, pnl: +184.00, tp: 155.50, sl: 153.50 },
];

const journalEntries = [
  { id: "J-291", time: "09:14", symbol: "EURUSD", regime: "BULLISH", confidence: 87, result: "+$124", reason: "HMM Bull regime confirmed, London breakout", exit: "TP Hit", quality: 92 },
  { id: "J-290", time: "07:32", symbol: "GBPUSD", regime: "NEUTRAL", confidence: 61, result: "-$38", reason: "False breakout, high spread detected", exit: "SL Hit", quality: 44 },
  { id: "J-289", time: "22:48", symbol: "USDJPY", regime: "BEARISH", confidence: 79, result: "+$217", reason: "NFP reaction, momentum confirmed", exit: "Trailing", quality: 88 },
];

const users = [
  { id: "USR-001", name: "Amir Hassan", email: "amir@fx.com", plan: "Premium", status: "Active", trades: 284, pnl: "+$4,820", joined: "Jan 2024" },
  { id: "USR-002", name: "Elena Petrova", email: "elena@trade.io", plan: "Free", status: "Active", trades: 12, pnl: "+$210", joined: "Mar 2024" },
  { id: "USR-003", name: "Marcus Webb", email: "m.webb@hedgex.com", plan: "Premium", status: "Suspended", trades: 891, pnl: "+$18,420", joined: "Nov 2023" },
  { id: "USR-004", name: "Yuki Tanaka", email: "yuki@alphabot.jp", plan: "Enterprise", status: "Active", trades: 1240, pnl: "+$32,100", joined: "Aug 2023" },
];

const notifications = [
  { type: "trade", icon: "▲", color: C.green, msg: "EURUSD BUY opened — Lot: 0.50, Entry: 1.0842", time: "2m ago" },
  { type: "regime", icon: "⬡", color: C.cyan, msg: "Regime shift detected: NEUTRAL → BULLISH (87% conf.)", time: "8m ago" },
  { type: "warn", icon: "⚠", color: C.orange, msg: "Drawdown alert: -4.2% approaching limit", time: "15m ago" },
  { type: "news", icon: "◈", color: C.red, msg: "HIGH IMPACT: FOMC in 45 min — bot paused", time: "22m ago" },
  { type: "system", icon: "◉", color: C.neon, msg: "MT5 reconnected: FxPesa Server #2 — Latency: 12ms", time: "31m ago" },
];

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────
const Pulse = ({ color = C.cyan, size = 8 }) => (
  <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
    <span style={{
      position: "absolute", inset: 0, borderRadius: "50%", background: color,
      animation: "pulse 2s ease-in-out infinite", opacity: 0.4,
    }} />
    <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: color }} />
  </span>
);

const GlassCard = ({ children, style = {}, glow = false, onClick }) => (
  <div onClick={onClick} style={{
    background: C.glass,
    border: `1px solid ${glow ? C.borderBright : C.border}`,
    borderRadius: 16,
    backdropFilter: "blur(20px)",
    boxShadow: glow
      ? `0 0 30px rgba(0,229,255,0.15), inset 0 1px 0 rgba(0,229,255,0.1)`
      : `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
    padding: 16,
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s ease",
    ...style,
  }}>{children}</div>
);

const MetricTile = ({ label, value, sub, color = C.cyan, icon, delta }) => (
  <div style={{
    background: C.glass, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
    boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.5 }}>{value}</div>
    {(sub || delta !== undefined) && (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {sub && <span style={{ fontSize: 10, color: C.textDim }}>{sub}</span>}
        {delta !== undefined && (
          <span style={{ fontSize: 10, color: delta >= 0 ? C.green : C.red, fontWeight: 600 }}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
    )}
  </div>
);

const Badge = ({ label, color = C.cyan }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}44`,
    color, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
    padding: "2px 8px", borderRadius: 20, textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  }}>{label}</span>
);

const ProgressBar = ({ value, max = 100, color = C.cyan, height = 4, label, showVal }) => (
  <div style={{ width: "100%" }}>
    {(label || showVal) && (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        {label && <span style={{ fontSize: 10, color: C.textDim }}>{label}</span>}
        {showVal && <span style={{ fontSize: 10, color, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round((value / max) * 100)}%</span>}
      </div>
    )}
    <div style={{ width: "100%", height, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: `0 0 8px ${color}88`,
        transition: "width 0.6s ease",
      }} />
    </div>
  </div>
);

const Toggle = ({ checked, onChange, color = C.cyan }) => (
  <div onClick={onChange} style={{
    width: 42, height: 24, borderRadius: 99, cursor: "pointer",
    background: checked ? `linear-gradient(90deg, ${color}88, ${color})` : "rgba(255,255,255,0.1)",
    border: `1px solid ${checked ? color : "rgba(255,255,255,0.15)"}`,
    position: "relative", transition: "all 0.3s ease",
    boxShadow: checked ? `0 0 12px ${color}66` : "none",
  }}>
    <div style={{
      position: "absolute", top: 2, left: checked ? 20 : 2,
      width: 18, height: 18, borderRadius: "50%",
      background: checked ? "#fff" : "rgba(255,255,255,0.4)",
      transition: "left 0.3s ease",
      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    }} />
  </div>
);

const NavIcon = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    cursor: "pointer", padding: "8px 12px", borderRadius: 12,
    background: active ? `${C.cyan}15` : "transparent",
    border: active ? `1px solid ${C.cyan}30` : "1px solid transparent",
    transition: "all 0.2s ease",
  }}>
    <span style={{ fontSize: 18, filter: active ? `drop-shadow(0 0 6px ${C.cyan})` : "none", transition: "filter 0.2s" }}>{icon}</span>
    <span style={{ fontSize: 9, color: active ? C.cyan : C.textMuted, fontWeight: active ? 700 : 400, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</span>
  </div>
);

// ─── SCREENS ──────────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }) => {
  const [broker, setBroker] = useState("FxPesa");
  const [server, setServer] = useState("FxPesa-Demo");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState(0);

  const handleConnect = () => {
    setConnecting(true);
    setStep(1);
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1600);
    setTimeout(() => onLogin(), 2400);
  };

  const brokers = ["FxPesa", "IC Markets", "Pepperstone", "FTMO", "FP Markets", "XM Global"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.void, position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div style={{
        position: "absolute", top: -100, left: -100, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,144,255,0.08) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -80, width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
      }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
            background: "linear-gradient(135deg, rgba(0,144,255,0.3), rgba(0,229,255,0.2))",
            border: `1px solid ${C.borderBright}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 40px rgba(0,229,255,0.2)`,
          }}>
            <span style={{ fontSize: 36 }}>⬡</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>
            NEXUS<span style={{ color: C.cyan }}>AI</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>
            Institutional Trading Intelligence
          </div>
        </div>

        {/* Login Card */}
        <GlassCard style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: 0.5 }}>Connect MT5 Account</div>

          {/* Broker Select */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, letterSpacing: 1.5, textTransform: "uppercase" }}>Broker</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {brokers.map(b => (
                <div key={b} onClick={() => setBroker(b)} style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                  background: broker === b ? `${C.cyan}20` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${broker === b ? C.cyan + "60" : "rgba(255,255,255,0.1)"}`,
                  color: broker === b ? C.cyan : C.textDim,
                  fontWeight: broker === b ? 700 : 400, transition: "all 0.2s",
                }}>{b}</div>
              ))}
            </div>
          </div>

          {[
            { label: "MT5 Server", value: server, onChange: setServer, placeholder: "e.g. FxPesa-Live" },
            { label: "Account Number", value: account, onChange: setAccount, placeholder: "MT5 account number" },
            { label: "Password", value: password, onChange: setPassword, placeholder: "••••••••••", type: "password" },
          ].map(({ label, value, onChange, placeholder, type }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
              <input
                type={type || "text"}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13,
                  outline: "none", boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          ))}

          {connecting && (
            <div style={{ marginBottom: 16 }}>
              {[
                { step: 1, label: "Establishing encrypted connection..." },
                { step: 2, label: "Authenticating MT5 credentials..." },
                { step: 3, label: "Loading account data..." },
              ].map(({ step: s, label }) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12 }}>
                    {step > s ? "✓" : step === s ? "⟳" : "○"}
                  </span>
                  <span style={{
                    fontSize: 11, color: step > s ? C.green : step === s ? C.cyan : C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleConnect} disabled={connecting} style={{
            width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
            background: connecting
              ? "rgba(255,255,255,0.05)"
              : `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
            color: connecting ? C.textMuted : "#000",
            fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: connecting ? "none" : `0 4px 20px rgba(0,229,255,0.3)`,
            transition: "all 0.3s",
          }}>
            {connecting ? "Connecting..." : "Connect & Launch"}
          </button>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
            {["🔐 AES-256", "🛡 JWT Auth", "👁 Biometric"].map(f => (
              <span key={f} style={{ fontSize: 10, color: C.textMuted }}>{f}</span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ─── HOME DASHBOARD ───────────────────────────────────────────────────────────
const HomeDashboard = ({ onNav }) => {
  const [botActive, setBotActive] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  const equity = (107420.50 + Math.sin(tick * 0.5) * 80).toFixed(2);
  const fpnl = (1820.40 + Math.sin(tick * 0.7) * 40).toFixed(2);

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>
            NEXUS<span style={{ color: C.cyan }}>AI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <Pulse color={C.green} size={7} />
            <span style={{ fontSize: 10, color: C.textDim }}>FxPesa · Account #48201</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge label="LIVE" color={C.green} />
          <Badge label={botActive ? "BOT ON" : "BOT OFF"} color={botActive ? C.cyan : C.textMuted} />
          <Toggle checked={botActive} onChange={() => setBotActive(b => !b)} />
        </div>
      </div>

      {/* Main equity card */}
      <GlassCard glow style={{ textAlign: "center", padding: "20px 16px" }}>
        <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Portfolio Equity</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1 }}>
          ${Number(equity).toLocaleString()}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>▲ +$1,820.40</span>
          <span style={{ fontSize: 13, color: C.textDim }}>today</span>
        </div>
        <div style={{ height: 60, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurve.slice(-20)}>
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.cyan} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="equity" stroke={C.cyan} fill="url(#eq)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Account metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MetricTile label="Balance" value="$105,600" color={C.text} icon="💰" />
        <MetricTile label="Margin Used" value="$2,840" sub="Free: $102,760" color={C.blue} icon="📊" />
        <MetricTile label="Float PnL" value={`+$${fpnl}`} color={C.green} delta={1.72} icon="📈" />
        <MetricTile label="Daily PnL" value="+$820.40" color={C.green} delta={0.78} icon="🗓" />
      </div>

      {/* AI Regime */}
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>AI Regime Monitor</div>
          <Badge label="BULLISH" color={C.green} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {[
            { label: "Bullish", value: 74, color: C.green },
            { label: "Bearish", value: 16, color: C.red },
            { label: "Volatility", value: 48, color: C.orange },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: C.textMuted }}>{label}</span>
                <span style={{ fontSize: 9, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>
              </div>
              <ProgressBar value={value} color={color} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>AI Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}>87%</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>Persistence</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.neon, fontFamily: "'JetBrains Mono', monospace" }}>0.92</div>
          </div>
        </div>
      </GlassCard>

      {/* Open Trades */}
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Open Positions</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: C.textDim }}>4 trades</span>
            <Badge label="+$300.80" color={C.green} />
          </div>
        </div>
        {openTrades.map(t => (
          <div key={t.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.symbol}</span>
                <Badge label={t.dir} color={t.dir === "BUY" ? C.green : C.red} />
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                {t.lots} lot · Entry: {t.entry}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.pnl >= 0 ? C.green : C.red, fontFamily: "'JetBrains Mono', monospace" }}>
                {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{t.current}</div>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Bot metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <MetricTile label="Win Rate" value="74.2%" color={C.green} />
        <MetricTile label="Drawdown" value="-4.2%" color={C.orange} />
        <MetricTile label="P Factor" value="2.18" color={C.cyan} />
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
};

// ─── AI REGIME SCREEN ─────────────────────────────────────────────────────────
const AIRegimeScreen = () => (
  <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>AI Regime Engine</div>
      <Badge label="HMM Active" color={C.cyan} />
    </div>

    {/* Current regime */}
    <GlassCard glow>
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, marginBottom: 8 }}>CURRENT MARKET REGIME</div>
        <div style={{
          fontSize: 32, fontWeight: 900, color: C.green, letterSpacing: 2,
          textShadow: `0 0 30px ${C.green}88`,
        }}>BULLISH</div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>Confidence: 87% · Persistence: 0.92</div>
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Strategy: London Breakout Momentum</div>
      </div>
    </GlassCard>

    {/* Radar Chart */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Signal Strength Matrix</div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: C.textDim, fontSize: 10 }} />
            <Radar dataKey="A" stroke={C.cyan} fill={C.cyan} fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>

    {/* Transition Matrix */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Transition Probability Matrix</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 1, fontSize: 10 }}>
        {["", "→Bull", "→Bear", "→Neut"].map(h => (
          <div key={h} style={{ padding: "6px 10px", color: C.textMuted, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{h}</div>
        ))}
        {[
          ["Bull", "0.82", "0.09", "0.09"],
          ["Bear", "0.11", "0.78", "0.11"],
          ["Neut", "0.22", "0.18", "0.60"],
        ].map(([from, ...vals]) => (
          <>
            <div style={{ padding: "6px 8px", color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{from}</div>
            {vals.map((v, i) => {
              const val = parseFloat(v);
              const isHigh = val > 0.5;
              return (
                <div key={i} style={{
                  padding: "6px 8px", textAlign: "center",
                  background: isHigh ? `${C.cyan}18` : "rgba(255,255,255,0.03)",
                  borderRadius: 6, color: isHigh ? C.cyan : C.textDim,
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: isHigh ? 700 : 400,
                }}>{v}</div>
              );
            })}
          </>
        ))}
      </div>
    </GlassCard>

    {/* Weekly regime history */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Weekly Regime History</div>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regimenData} barGap={2}>
            <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 10 }} />
            <Bar dataKey="bull" fill={C.green} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            <Bar dataKey="bear" fill={C.red} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            <Bar dataKey="vol" fill={C.orange} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {[["Bullish", C.green], ["Bearish", C.red], ["Volatility", C.orange]].map(([l, c]) => (
          <div key={l} style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 9, color: C.textDim }}>{l}</span>
          </div>
        ))}
      </div>
    </GlassCard>

    {/* Session filter */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Session & News Filter</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["London", true, C.green], ["New York", true, C.green], ["Tokyo", false, C.textMuted], ["Sydney", false, C.textMuted]].map(([s, act, c]) => (
          <div key={s} style={{
            flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10,
            background: act ? `${c}15` : "rgba(255,255,255,0.04)",
            border: `1px solid ${act ? c + "40" : C.border}`,
          }}>
            <div style={{ fontSize: 8, color: act ? c : C.textMuted, fontWeight: 700 }}>{act ? "●" : "○"}</div>
            <div style={{ fontSize: 9, color: act ? c : C.textMuted, marginTop: 4 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.text, marginBottom: 8 }}>Upcoming High-Impact News</div>
      {[
        { time: "14:30", event: "FOMC Statement", impact: "HIGH" },
        { time: "16:00", event: "US NFP", impact: "HIGH" },
        { time: "09:00", event: "ECB Rate Decision", impact: "MED" },
      ].map(n => (
        <div key={n.event} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 0", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</span>
            <span style={{ fontSize: 11, color: C.text }}>{n.event}</span>
          </div>
          <Badge label={n.impact} color={n.impact === "HIGH" ? C.red : C.orange} />
        </div>
      ))}
    </GlassCard>

    <div style={{ height: 16 }} />
  </div>
);

// ─── TRADE EXECUTION SCREEN ───────────────────────────────────────────────────
const TradeScreen = () => {
  const [mode, setMode] = useState("semi");
  const [symbol, setSymbol] = useState("EURUSD");
  const [lots, setLots] = useState("0.50");
  const [dir, setDir] = useState("BUY");
  const symbols = ["EURUSD", "GBPJPY", "XAUUSD", "USDJPY", "GBPUSD", "BTCUSD"];

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Trade Execution</div>
        <Badge label="MT5 Live" color={C.green} />
      </div>

      {/* Mode selector */}
      <GlassCard>
        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>Trading Mode</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["manual", "Manual"], ["semi", "Semi-Auto"], ["auto", "Full AI"]].map(([val, label]) => (
            <div key={val} onClick={() => setMode(val)} style={{
              flex: 1, textAlign: "center", padding: "9px 4px", borderRadius: 10, cursor: "pointer",
              background: mode === val ? `${C.cyan}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${mode === val ? C.cyan + "60" : C.border}`,
              color: mode === val ? C.cyan : C.textDim,
              fontSize: 11, fontWeight: mode === val ? 700 : 400, transition: "all 0.2s",
            }}>{label}</div>
          ))}
        </div>
      </GlassCard>

      {/* Market data */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <MetricTile label="Spread" value="1.2" sub="pips" color={C.cyan} />
        <MetricTile label="Volatility" value="HIGH" color={C.orange} />
        <MetricTile label="Quality" value="92/100" color={C.green} />
      </div>

      {/* Symbol select */}
      <GlassCard>
        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>Symbol</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {symbols.map(s => (
            <div key={s} onClick={() => setSymbol(s)} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11,
              background: symbol === s ? `${C.cyan}20` : "rgba(255,255,255,0.05)",
              border: `1px solid ${symbol === s ? C.cyan + "60" : C.border}`,
              color: symbol === s ? C.cyan : C.textDim, fontWeight: symbol === s ? 700 : 400,
            }}>{s}</div>
          ))}
        </div>

        {/* Price display */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>BID</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>1.0842</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>SPREAD</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textDim }}>1.2</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>ASK</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>1.0843</div>
          </div>
        </div>
      </GlassCard>

      {/* Lot size */}
      <GlassCard>
        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>Position Size</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={lots} onChange={e => setLots(e.target.value)} style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 16,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, outline: "none",
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["0.10", "0.50", "1.00", "2.00"].map(v => (
              <div key={v} onClick={() => setLots(v)} style={{
                padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10,
                background: lots === v ? `${C.cyan}20` : "rgba(255,255,255,0.05)",
                border: `1px solid ${lots === v ? C.cyan + "50" : C.border}`,
                color: lots === v ? C.cyan : C.textDim,
              }}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={parseFloat(lots) * 10} max={20} color={C.cyan} label="Risk: 2.4% of balance" showVal />
        </div>
      </GlassCard>

      {/* ATR levels */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>ATR Risk Levels</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Stop Loss", value: "1.0800", color: C.red },
            { label: "Take Profit", value: "1.0920", color: C.green },
            { label: "ATR (14)", value: "42 pips", color: C.orange },
            { label: "Risk:Reward", value: "1:2.4", color: C.cyan },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* BUY / SELL buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setDir("BUY")} style={{
          padding: "18px 0", borderRadius: 14, border: `1px solid ${C.green}60`,
          background: dir === "BUY" ? `linear-gradient(135deg, ${C.green}30, ${C.green}20)` : "rgba(255,255,255,0.04)",
          color: C.green, fontSize: 15, fontWeight: 800, letterSpacing: 2, cursor: "pointer",
          boxShadow: dir === "BUY" ? `0 0 20px ${C.green}30` : "none", transition: "all 0.2s",
        }}>▲ BUY</button>
        <button onClick={() => setDir("SELL")} style={{
          padding: "18px 0", borderRadius: 14, border: `1px solid ${C.red}60`,
          background: dir === "SELL" ? `linear-gradient(135deg, ${C.red}30, ${C.red}20)` : "rgba(255,255,255,0.04)",
          color: C.red, fontSize: 15, fontWeight: 800, letterSpacing: 2, cursor: "pointer",
          boxShadow: dir === "SELL" ? `0 0 20px ${C.red}30` : "none", transition: "all 0.2s",
        }}>▼ SELL</button>
      </div>

      <button style={{
        padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
        color: "#000", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
        boxShadow: `0 4px 20px rgba(0,229,255,0.3)`,
      }}>
        EXECUTE {dir} · {lots} LOT
      </button>

      <div style={{ height: 16 }} />
    </div>
  );
};

// ─── RISK MANAGEMENT SCREEN ───────────────────────────────────────────────────
const RiskScreen = () => {
  const [ddProt, setDdProt] = useState(true);
  const [streakProt, setStreakProt] = useState(true);
  const [corrMon, setCorrMon] = useState(false);

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Risk Management</div>
        <Badge label="Protected" color={C.green} />
      </div>

      {/* Risk overview */}
      <GlassCard glow>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Daily Risk Exposure</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>Used: $1,840 / $5,000 limit</span>
          <span style={{ fontSize: 10, color: C.orange }}>36.8%</span>
        </div>
        <ProgressBar value={36.8} color={C.orange} height={8} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          <MetricTile label="Max DD" value="-4.2%" color={C.orange} />
          <MetricTile label="Open Risk" value="2.8%" color={C.cyan} />
          <MetricTile label="Sharpe" value="2.84" color={C.green} />
        </div>
      </GlassCard>

      {/* Risk toggles */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>Protection Systems</div>
        {[
          { label: "Drawdown Protection", sub: "Pause at -5% daily DD", val: ddProt, set: setDdProt, color: C.cyan },
          { label: "Loss Streak Protection", sub: "Halt after 3 consecutive losses", val: streakProt, set: setStreakProt, color: C.cyan },
          { label: "Correlation Monitor", sub: "Block correlated pair stacking", val: corrMon, set: setCorrMon, color: C.cyan },
        ].map(({ label, sub, val, set, color }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ fontSize: 12, color: C.text }}>{label}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{sub}</div>
            </div>
            <Toggle checked={val} onChange={() => set(v => !v)} color={color} />
          </div>
        ))}
      </GlassCard>

      {/* Exposure */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Position Exposure</div>
        {[
          { symbol: "EURUSD", exposure: 68, risk: "$540" },
          { symbol: "GBPJPY", exposure: 42, risk: "$336" },
          { symbol: "XAUUSD", exposure: 28, risk: "$224" },
          { symbol: "USDJPY", exposure: 55, risk: "$440" },
        ].map(({ symbol, exposure, risk }) => (
          <div key={symbol} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{symbol}</span>
              <span style={{ fontSize: 10, color: C.textDim }}>{risk}</span>
            </div>
            <ProgressBar
              value={exposure}
              color={exposure > 60 ? C.orange : C.cyan}
              height={6}
              showVal
            />
          </div>
        ))}
      </GlassCard>

      {/* Risk settings sliders */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>Risk Parameters</div>
        {[
          { label: "Max Risk Per Trade", value: 2, unit: "%" },
          { label: "Daily Loss Limit", value: 5, unit: "%" },
          { label: "Max Open Trades", value: 6, unit: "" },
          { label: "Max Lot Size", value: 2, unit: "L" },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.textDim }}>{label}</span>
              <span style={{ fontSize: 11, color: C.cyan, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{value}{unit}</span>
            </div>
            <input type="range" min={0} max={10} defaultValue={value} style={{ width: "100%", accentColor: C.cyan }} />
          </div>
        ))}
      </GlassCard>

      <div style={{ height: 16 }} />
    </div>
  );
};

// ─── BOT CONTROL CENTER ───────────────────────────────────────────────────────
const BotScreen = () => {
  const [botOn, setBotOn] = useState(true);
  const [mode, setMode] = useState("balanced");
  const [symbols, setSymbols] = useState(["EURUSD", "GBPJPY"]);
  const allSymbols = ["EURUSD", "GBPUSD", "GBPJPY", "USDJPY", "XAUUSD", "BTCUSD"];

  const toggleSym = (s) => setSymbols(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Bot Control Center</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: botOn ? C.green : C.red }}>{botOn ? "RUNNING" : "STOPPED"}</span>
          <Toggle checked={botOn} onChange={() => setBotOn(b => !b)} color={C.green} />
        </div>
      </div>

      {/* Bot status */}
      <GlassCard glow={botOn}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: botOn ? `linear-gradient(135deg, ${C.cyan}30, ${C.blue}20)` : "rgba(255,255,255,0.05)",
            border: `1px solid ${botOn ? C.cyan + "60" : C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            boxShadow: botOn ? `0 0 20px ${C.cyan}30` : "none",
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: botOn ? C.cyan : C.textDim }}>
              NexusAI Engine v4.2
            </div>
            <div style={{ fontSize: 10, color: C.textMuted }}>HMM · ATR · Adaptive Trailing</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <Badge label={botOn ? "LIVE" : "STOPPED"} color={botOn ? C.green : C.red} />
              <Badge label="FxPesa" color={C.blue} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Mode */}
      <GlassCard>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>Trading Mode</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["conservative", "Conservative", "🛡", C.blue],
            ["balanced", "Balanced", "⚖", C.cyan],
            ["aggressive", "Aggressive", "⚡", C.orange],
            ["adaptive", "AI Adaptive", "⬡", C.neon],
          ].map(([val, label, icon, color]) => (
            <div key={val} onClick={() => setMode(val)} style={{
              padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center",
              background: mode === val ? `${color}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${mode === val ? color + "50" : C.border}`,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 10, color: mode === val ? color : C.textDim, fontWeight: mode === val ? 700 : 400 }}>{label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Symbol selection */}
      <GlassCard>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>Active Symbols</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allSymbols.map(s => {
            const active = symbols.includes(s);
            return (
              <div key={s} onClick={() => toggleSym(s)} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11,
                background: active ? `${C.cyan}20` : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? C.cyan + "60" : C.border}`,
                color: active ? C.cyan : C.textDim, fontWeight: active ? 700 : 400,
              }}>{s}</div>
            );
          })}
        </div>
      </GlassCard>

      {/* AI Parameters */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>AI Configuration</div>
        {[
          { label: "AI Sensitivity", desc: "Regime detection threshold" },
          { label: "Trailing Aggressiveness", desc: "ATR multiplier for trailing stop" },
          { label: "Entry Confirmation", desc: "Signal strength required" },
        ].map(({ label, desc }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: C.text }}>{label}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>{desc}</div>
              </div>
              <span style={{ fontSize: 11, color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}>0.72</span>
            </div>
            <input type="range" min={0} max={100} defaultValue={72} style={{ width: "100%", accentColor: C.cyan }} />
          </div>
        ))}
      </GlassCard>

      {/* VPS Status */}
      <GlassCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>VPS & System Monitor</div>
        {[
          { label: "VPS Status", value: "Online", color: C.green, icon: "🖥" },
          { label: "MT5 Connection", value: "Active — 12ms", color: C.green, icon: "🔗" },
          { label: "Server Uptime", value: "99.98%", color: C.cyan, icon: "⏱" },
          { label: "Heartbeat", value: "Normal", color: C.green, icon: "💓" },
          { label: "Auto Reconnect", value: "Enabled", color: C.neon, icon: "🔄" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0", borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 11, color: C.textDim }}>{label}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Pulse color={color} size={6} />
              <span style={{ fontSize: 11, color, fontWeight: 600 }}>{value}</span>
            </div>
          </div>
        ))}
      </GlassCard>

      <div style={{ height: 16 }} />
    </div>
  );
};

// ─── JOURNAL SCREEN ───────────────────────────────────────────────────────────
const JournalScreen = () => (
  <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>AI Trade Journal</div>
      <Badge label="291 entries" color={C.blue} />
    </div>

    {/* Performance summary */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      <MetricTile label="Win Rate" value="74.2%" color={C.green} />
      <MetricTile label="Avg Win" value="+$184" color={C.green} />
      <MetricTile label="Avg Loss" value="-$68" color={C.red} />
    </div>

    {/* Equity chart */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Equity Curve</div>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityCurve}>
            <defs>
              <linearGradient id="eq2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.neon} stopOpacity={0.3} />
                <stop offset="100%" stopColor={C.neon} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 10 }} />
            <Area type="monotone" dataKey="equity" stroke={C.neon} fill="url(#eq2)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>

    {/* Journal entries */}
    <GlassCard>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Recent Trades</div>
      {journalEntries.map(j => (
        <div key={j.id} style={{
          padding: "14px 0", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{j.symbol}</span>
                <Badge label={j.regime} color={j.regime === "BULLISH" ? C.green : j.regime === "BEARISH" ? C.red : C.orange} />
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{j.time} · {j.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: j.result.startsWith("+") ? C.green : C.red, fontFamily: "'JetBrains Mono', monospace" }}>{j.result}</div>
              <div style={{ fontSize: 9, color: C.textMuted }}>Quality: {j.quality}/100</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>📝 {j.reason}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div>
              <span style={{ fontSize: 9, color: C.textMuted }}>Exit: </span>
              <span style={{ fontSize: 9, color: C.cyan }}>{j.exit}</span>
            </div>
            <div>
              <span style={{ fontSize: 9, color: C.textMuted }}>Confidence: </span>
              <span style={{ fontSize: 9, color: C.neon }}>{j.confidence}%</span>
            </div>
          </div>
          <ProgressBar value={j.quality} height={3} color={j.quality > 70 ? C.green : j.quality > 40 ? C.orange : C.red} style={{ marginTop: 8 }} />
        </div>
      ))}
    </GlassCard>

    <div style={{ height: 16 }} />
  </div>
);

// ─── NOTIFICATIONS SCREEN ─────────────────────────────────────────────────────
const NotifScreen = () => (
  <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Notifications</div>
      <Badge label="5 new" color={C.orange} />
    </div>

    <GlassCard>
      {notifications.map((n, i) => (
        <div key={i} style={{
          display: "flex", gap: 12, padding: "14px 0",
          borderBottom: i < notifications.length - 1 ? `1px solid ${C.border}` : "none",
          alignItems: "flex-start",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${n.color}18`, border: `1px solid ${n.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: n.color,
          }}>{n.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{n.msg}</div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </GlassCard>
  </div>
);

// ─── OWNER/ADMIN DASHBOARD ────────────────────────────────────────────────────
const OwnerDashboard = ({ onBack }) => {
  const [tab, setTab] = useState("overview");
  const [emergencyStop, setEmergencyStop] = useState(false);

  const tabs = [
    ["overview", "Overview"],
    ["users", "Users"],
    ["bots", "Bots"],
    ["logs", "Logs"],
    ["control", "Control"],
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.void, position: "relative", overflow: "hidden" }}>
      {/* Background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,50,50,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,50,50,0.02) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div style={{
        position: "absolute", top: -150, right: -150, width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,50,50,0.05) 0%, transparent 70%)",
      }} />

      {/* Owner header */}
      <div style={{
        padding: "16px 16px 14px",
        background: "linear-gradient(180deg, rgba(40,0,0,0.8), transparent)",
        borderBottom: `1px solid rgba(255,50,50,0.2)`, position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>👑</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
                OWNER <span style={{ color: C.red }}>COMMAND</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>Unrestricted Master Access · All systems</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge label="SUPER ADMIN" color={C.gold} />
            <div onClick={onBack} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
              fontSize: 11, color: C.textDim,
            }}>← Exit</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {tabs.map(([val, label]) => (
            <div key={val} onClick={() => setTab(val)} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap",
              background: tab === val ? "rgba(255,50,50,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === val ? "rgba(255,50,50,0.5)" : C.border}`,
              color: tab === val ? C.red : C.textDim, fontWeight: tab === val ? 700 : 400,
            }}>{label}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0", position: "relative", zIndex: 1 }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MetricTile label="Total Users" value="1,284" color={C.gold} delta={12.4} icon="👥" />
              <MetricTile label="Active Now" value="248" color={C.green} icon="🟢" />
              <MetricTile label="MT5 Accounts" value="892" color={C.cyan} icon="🔗" />
              <MetricTile label="Bot Instances" value="641" color={C.neon} icon="⬡" />
            </div>

            {/* Revenue */}
            <GlassCard style={{ border: "1px solid rgba(255,215,0,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 4 }}>💰 Revenue Analytics</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>$48,240</div>
              <div style={{ fontSize: 11, color: C.green }}>▲ +18.4% this month</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                {[["Premium", "842", C.cyan], ["Free", "442", C.textMuted], ["Enterprise", "24", C.gold]].map(([plan, count, color]) => (
                  <div key={plan} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, color: C.textMuted }}>{plan}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Global metrics */}
            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Global Platform Status</div>
              {[
                { label: "Server Health", value: "98.4%", color: C.green, icon: "🖥" },
                { label: "Total Trade Volume", value: "$12.4M", color: C.cyan, icon: "📊" },
                { label: "Global Drawdown", value: "-2.1%", color: C.orange, icon: "⚠" },
                { label: "Active Subscriptions", value: "866", color: C.neon, icon: "✓" },
                { label: "VPS Instances", value: "12 Online", color: C.green, icon: "⚡" },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ fontSize: 11, color: C.textDim }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
              ))}
            </GlassCard>

            {/* Emergency controls */}
            <GlassCard style={{ border: "1px solid rgba(255,50,50,0.3)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 12 }}>⚠ Emergency Master Controls</div>
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <button onClick={() => setEmergencyStop(!emergencyStop)} style={{
                  padding: "14px 0", borderRadius: 12, border: `1px solid ${emergencyStop ? C.green + "60" : C.red + "60"}`,
                  background: emergencyStop ? `${C.green}15` : `${C.red}15`,
                  color: emergencyStop ? C.green : C.red, fontSize: 13, fontWeight: 800,
                  letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase",
                }}>
                  {emergencyStop ? "✓ BOTS STOPPED — Click to Resume" : "⬛ GLOBAL EMERGENCY STOP"}
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Force Close All", C.red],
                    ["Pause Trading", C.orange],
                    ["Restart Servers", C.blue],
                    ["Reset Risk", C.cyan],
                  ].map(([label, color]) => (
                    <button key={label} style={{
                      padding: "10px 0", borderRadius: 10, border: `1px solid ${color}40`,
                      background: `${color}10`, color, fontSize: 10, fontWeight: 700,
                      cursor: "pointer", letterSpacing: 1,
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>User Management</div>
              {users.map(u => (
                <div key={u.id} style={{
                  padding: "14px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{u.email} · {u.id}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <Badge label={u.plan} color={u.plan === "Enterprise" ? C.gold : u.plan === "Premium" ? C.cyan : C.textMuted} />
                        <Badge label={u.status} color={u.status === "Active" ? C.green : C.red} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>{u.pnl}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{u.trades} trades</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {[["Grant Premium", C.cyan], ["Suspend", C.orange], ["Reset", C.blue], ["Ban", C.red]].map(([label, color]) => (
                      <div key={label} style={{
                        padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 9,
                        background: `${color}15`, border: `1px solid ${color}40`, color, fontWeight: 700,
                      }}>{label}</div>
                    ))}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {tab === "bots" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MetricTile label="Running Bots" value="641" color={C.green} />
              <MetricTile label="Total Trades" value="8,402" color={C.cyan} />
              <MetricTile label="Global PnL" value="+$124K" color={C.neon} />
              <MetricTile label="Avg Win Rate" value="72.8%" color={C.green} />
            </div>

            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Bot Activity by User</div>
              {users.map(u => (
                <div key={u.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.text }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: C.green }}>{u.pnl}</span>
                  </div>
                  <ProgressBar value={Math.random() * 100} color={C.cyan} height={5} showVal />
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {tab === "logs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Live System Logs</div>
              <div style={{
                background: "#000", borderRadius: 10, padding: 12,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                border: `1px solid ${C.border}`, maxHeight: 320, overflowY: "auto",
              }}>
                {[
                  { t: "14:22:01", level: "INFO", msg: "MT5 heartbeat OK — FxPesa-Server2" },
                  { t: "14:22:00", level: "TRADE", msg: "USR-001 EURUSD BUY 0.5 @ 1.0842 opened" },
                  { t: "14:21:58", level: "AI", msg: "Regime transition: NEUTRAL → BULLISH (87.4%)" },
                  { t: "14:21:45", level: "RISK", msg: "Drawdown check passed: -3.8% (limit: -5%)" },
                  { t: "14:21:30", level: "WARN", msg: "Spread spike detected GBPJPY: 4.8 pips" },
                  { t: "14:21:10", level: "INFO", msg: "News filter activated: FOMC in 44 min" },
                  { t: "14:20:52", level: "TRADE", msg: "USR-004 XAUUSD SELL 0.2 @ 2318.50 SL hit" },
                  { t: "14:20:40", level: "AUTH", msg: "USR-003 login attempt from IP 182.44.21.88" },
                  { t: "14:20:22", level: "INFO", msg: "VPS-01 CPU: 24% RAM: 41% DISK: 18%" },
                  { t: "14:20:01", level: "AI", msg: "HMM recalibration complete — 3 regimes active" },
                ].map((log, i) => {
                  const colors = { INFO: C.textDim, TRADE: C.green, AI: C.cyan, RISK: C.orange, WARN: C.red, AUTH: C.gold };
                  return (
                    <div key={i} style={{ marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: C.textMuted }}>{log.t}</span>
                      <span style={{ color: colors[log.level] || C.textDim, fontWeight: 700, minWidth: 44 }}>[{log.level}]</span>
                      <span style={{ color: C.textDim }}>{log.msg}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "control" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GlassCard style={{ border: "1px solid rgba(255,215,0,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 4 }}>👑 Owner Privileges Active</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>You have unrestricted access to all platform features.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {["No Payment", "No Limits", "No Restrictions", "All Features", "Override Control"].map(f => (
                  <Badge key={f} label={f} color={C.gold} />
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>Role & Permission Control</div>
              {[["Owner", C.gold], ["Super Admin", C.red], ["Admin", C.orange], ["Premium User", C.cyan], ["Free User", C.textMuted]].map(([role, color]) => (
                <div key={role} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 11, color: C.text }}>{role}</span>
                  </div>
                  <button style={{
                    padding: "4px 12px", borderRadius: 6, border: `1px solid ${color}40`,
                    background: `${color}10`, color, fontSize: 10, fontWeight: 700, cursor: "pointer",
                  }}>Configure</button>
                </div>
              ))}
            </GlassCard>

            <GlassCard>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>Subscription Management</div>
              {[
                { label: "Create New Plan", icon: "+" },
                { label: "Grant Lifetime Premium", icon: "★" },
                { label: "Enable/Disable Trials", icon: "◎" },
                { label: "Reset User Account", icon: "↺" },
                { label: "Manage Feature Flags", icon: "⚙" },
              ].map(({ label, icon }) => (
                <div key={label} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "12px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: `${C.cyan}15`,
                    border: `1px solid ${C.cyan}30`, display: "flex", alignItems: "center",
                    justifyContent: "center", color: C.cyan, fontSize: 16,
                  }}>{icon}</div>
                  <span style={{ fontSize: 12, color: C.text }}>{label}</span>
                  <span style={{ marginLeft: "auto", color: C.textMuted, fontSize: 14 }}>›</span>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState("home");
  const [ownerMode, setOwnerMode] = useState(false);
  const [ownerCodeInput, setOwnerCodeInput] = useState("");
  const [showOwnerPrompt, setShowOwnerPrompt] = useState(false);

  const screens = {
    home: <HomeDashboard />,
    regime: <AIRegimeScreen />,
    trade: <TradeScreen />,
    risk: <RiskScreen />,
    bot: <BotScreen />,
    journal: <JournalScreen />,
    notif: <NotifScreen />,
  };

  const navItems = [
    { id: "home", icon: "⬛", label: "Home" },
    { id: "regime", icon: "⬡", label: "AI" },
    { id: "trade", icon: "⇅", label: "Trade" },
    { id: "risk", icon: "🛡", label: "Risk" },
    { id: "bot", icon: "◉", label: "Bot" },
    { id: "journal", icon: "📋", label: "Journal" },
    { id: "notif", icon: "🔔", label: "Alerts" },
  ];

  if (!loggedIn) return (
    <div style={{ width: "100%", height: "100vh", background: C.void, fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(2.5); opacity: 0; } }
        input:focus { border-color: rgba(0,229,255,0.4) !important; box-shadow: 0 0 0 2px rgba(0,229,255,0.1) !important; }
      `}</style>
      <LoginScreen onLogin={() => setLoggedIn(true)} />
    </div>
  );

  if (ownerMode) return (
    <div style={{ width: "100%", height: "100vh", background: C.void, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(2.5); opacity: 0; } }
      `}</style>
      <OwnerDashboard onBack={() => setOwnerMode(false)} />
    </div>
  );

  return (
    <div style={{
      width: "100%", height: "100vh", background: C.void,
      fontFamily: "'JetBrains Mono', monospace", display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(2.5); opacity: 0; } }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 99px; background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #00e5ff; box-shadow: 0 0 8px #00e5ff66; cursor: pointer; }
      `}</style>

      {/* Status bar */}
      <div style={{
        padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${C.border}`, background: C.deep, flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Pulse color={C.green} size={6} />
          <span style={{ fontSize: 9, color: C.textMuted }}>FxPesa · #48201</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.textMuted }}>Latency: 12ms</span>
          <span style={{ fontSize: 9, color: C.textMuted }}>13:48 UTC</span>
          <div onClick={() => setShowOwnerPrompt(true)} style={{
            padding: "3px 8px", borderRadius: 6, cursor: "pointer",
            background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)",
            fontSize: 9, color: C.gold, fontWeight: 700,
          }}>👑 OWNER</div>
        </div>
      </div>

      {/* Owner code prompt */}
      {showOwnerPrompt && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <GlassCard style={{ width: "100%", maxWidth: 340, border: "1px solid rgba(255,215,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>OWNER ACCESS</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Enter master override code</div>
            </div>
            <input
              type="password"
              placeholder="••••••••••"
              value={ownerCodeInput}
              onChange={e => setOwnerCodeInput(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,215,0,0.05)", border: `1px solid ${C.gold}40`,
                borderRadius: 10, padding: "12px 14px", color: C.gold, fontSize: 16,
                outline: "none", fontFamily: "'JetBrains Mono', monospace", textAlign: "center",
                letterSpacing: 4, marginBottom: 14,
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => { setShowOwnerPrompt(false); setOwnerCodeInput(""); }} style={{
                padding: "12px 0", borderRadius: 10, border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.04)", color: C.textDim, fontSize: 12, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => { setOwnerMode(true); setShowOwnerPrompt(false); setOwnerCodeInput(""); }} style={{
                padding: "12px 0", borderRadius: 10, border: `1px solid ${C.gold}60`,
                background: `linear-gradient(135deg, ${C.gold}30, ${C.gold}15)`,
                color: C.gold, fontSize: 12, fontWeight: 800, cursor: "pointer",
              }}>Authenticate</button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {screens[screen]}
      </div>

      {/* Bottom navigation */}
      <div style={{
        display: "flex", justifyContent: "space-around", padding: "8px 8px 12px",
        background: C.deep, borderTop: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        {navItems.map(({ id, icon, label }) => (
          <NavIcon
            key={id}
            icon={icon}
            label={label}
            active={screen === id}
            onClick={() => setScreen(id)}
          />
        ))}
      </div>
    </div>
  );
}
