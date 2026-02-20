"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   MOCK API LAYER  (swap these for real fetch calls)
   ───────────────────────────────────────────── */
const MOCK_QUESTIONS = {
  physics: [
    { id: "p1", subject: "physics", exam: "jee", text: "A ball is projected at 30° with speed 20 m/s. What is the range? (g = 10 m/s²)", options: ["20√3 m", "34.6 m", "40 m", "Both A & B"], correct: 3, difficulty: "Medium", topic: "Projectile Motion", baseRating: 1280 },
    { id: "p2", subject: "physics", exam: "jee", text: "Two blocks of masses 3 kg and 5 kg are connected by a string over a frictionless pulley. Acceleration of the system is:", options: ["2.5 m/s²", "3.27 m/s²", "4.9 m/s²", "1.96 m/s²"], correct: 0, difficulty: "Hard", topic: "Newton's Laws", baseRating: 1350 },
    { id: "p3", subject: "physics", exam: "jee", text: "The escape velocity from Earth's surface is approximately:", options: ["7.9 km/s", "11.2 km/s", "15.0 km/s", "9.8 km/s"], correct: 1, difficulty: "Easy", topic: "Gravitation", baseRating: 1100 },
  ],
  chemistry: [
    { id: "c1", subject: "chemistry", exam: "jee", text: "Which element has the highest electronegativity?", options: ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"], correct: 2, difficulty: "Easy", topic: "Periodic Properties", baseRating: 1050 },
    { id: "c2", subject: "chemistry", exam: "jee", text: "The hybridization of carbon in benzene is:", options: ["sp³", "sp²", "sp", "sp³d"], correct: 1, difficulty: "Medium", topic: "Chemical Bonding", baseRating: 1200 },
  ],
  mathematics: [
    { id: "m1", subject: "mathematics", exam: "jee", text: "∫₀² (x² + 3x + 2)dx = ?", options: ["34/3", "32/3", "12", "10"], correct: 0, difficulty: "Hard", topic: "Integral Calculus", baseRating: 1380 },
    { id: "m2", subject: "mathematics", exam: "jee", text: "The number of solutions of sin x = x/π in [0, 2π] is:", options: ["1", "2", "3", "4"], correct: 0, difficulty: "Hard", topic: "Trigonometry", baseRating: 1420 },
  ],
};

const MOCK_LEADERBOARD = [
  { rank: 1, userId: "u1", name: "Priya Kapoor", rating: 1842, tier: "Legend", streak: 34, solved: 1204, delta: 42, avatar: "P" },
  { rank: 2, userId: "u2", name: "Rahul Verma", rating: 1791, tier: "Legend", streak: 28, solved: 1098, delta: 31, avatar: "R" },
  { rank: 3, userId: "u3", name: "Ananya Singh", rating: 1723, tier: "Master", streak: 21, solved: 987, delta: 18, avatar: "A" },
  { rank: 4, userId: "u4", name: "Rohan Mehta", rating: 1680, tier: "Master", streak: 15, solved: 876, delta: 12, avatar: "R" },
  { rank: 5, userId: "u5", name: "Deepa Nair", rating: 1612, tier: "Master", streak: 19, solved: 802, delta: 25, avatar: "D" },
  { rank: 6, userId: "u6", name: "Vikram Rao", rating: 1540, tier: "Grandmaster", streak: 12, solved: 743, delta: 8, avatar: "V" },
  { rank: 7, userId: "u7", name: "Sneha Joshi", rating: 1489, tier: "Grandmaster", streak: 7, solved: 698, delta: -3, avatar: "S" },
  { rank: 8, userId: "me", name: "Aryan Sharma", rating: 1248, tier: "Grandmaster", streak: 12, solved: 521, delta: 18, avatar: "A" },
];

/* Simulated API calls */
const api = {
  getQuestion: async (subject = "physics", exam = "jee") => {
    await delay(400);
    const pool = MOCK_QUESTIONS[subject] || MOCK_QUESTIONS.physics;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  submitAnswer: async ({ userId, questionId, selectedOption, timeTaken }) => {
    await delay(500);
    const allQ = Object.values(MOCK_QUESTIONS).flat();
    const q = allQ.find(x => x.id === questionId);
    const correct = q ? selectedOption === q.correct : false;
    const speedBonus = timeTaken < 30 ? 5 : timeTaken < 60 ? 3 : 0;
    const ratingDelta = correct ? 15 + speedBonus : -7;
    const streakDelta = correct ? 1 : 0;
    return { correct, correctIndex: q?.correct, ratingDelta, speedBonus, streakDelta, explanation: correct ? "Great work! You got it right." : `The correct answer was: ${q?.options[q?.correct]}` };
  },
  getLeaderboard: async () => {
    await delay(300);
    return MOCK_LEADERBOARD;
  },
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─────────────────────────────────────────────  THEME  */
const T = {
  bg: "#080c08",
  sidebar: "#0b0f0b",
  card: "#0f140f",
  cardBorder: "#182018",
  green: "#00ff41",
  greenDim: "#00cc33",
  glow: "rgba(0,255,65,0.12)",
  text: "#ddeedd",
  muted: "#4d7a4d",
  dim: "#2a4a2a",
  red: "#ff4455",
  redBg: "rgba(255,68,85,0.08)",
  blue: "#44aaff",
  purple: "#aa55ff",
  gold: "#ffcc00",
  white: "#ffffff",
};

const tierColors = { Legend: T.gold, Master: T.purple, Grandmaster: T.green, Expert: T.blue };
const diffColors = { Easy: T.green, Medium: T.gold, Hard: T.red };

/* ─────────────────────────────────────────────  UTILS  */
function tag(color, text) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, background: `${color}18`, color, border: `1px solid ${color}33` }}>
      {text}
    </span>
  );
}

function ProgressBar({ pct, color = T.green, h = 4 }) {
  return (
    <div style={{ height: h, background: T.cardBorder, borderRadius: h, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: h, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Sparkline({ data, color = T.green, w = 200, h = 60 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`).join(" ");
  const poly = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={poly} fill={`url(#sg${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => i === data.length - 1 && (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * (h - 10) - 5} r="4" fill={color} />
      ))}
    </svg>
  );
}

function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 12, padding: 20,
      boxShadow: glow ? `0 0 30px ${T.glow}` : "none", ...style,
    }}>{children}</div>
  );
}

function Btn({ children, variant = "primary", onClick, disabled, style = {} }) {
  const base = {
    padding: "10px 20px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
    transition: "all 0.2s", opacity: disabled ? 0.4 : 1, textTransform: "uppercase",
  };
  const variants = {
    primary: { background: T.green, color: "#000" },
    outline: { background: "transparent", color: T.green, border: `1px solid ${T.green}44` },
    danger: { background: T.redBg, color: T.red, border: `1px solid ${T.red}44` },
    ghost: { background: "transparent", color: T.muted, border: `1px solid ${T.dim}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

/* ─────────────────────────────────────────────  TOAST  */
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Courier New', monospace",
          background: t.type === "success" ? `${T.green}18` : t.type === "error" ? T.redBg : `${T.gold}18`,
          border: `1px solid ${t.type === "success" ? T.green : t.type === "error" ? T.red : T.gold}55`,
          color: t.type === "success" ? T.green : t.type === "error" ? T.red : T.gold,
          animation: "slideIn 0.3s ease",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────  RESULT OVERLAY  */
function ResultOverlay({ result, question, onNext, onStay }) {
  if (!result) return null;
  const { correct, ratingDelta, speedBonus, streakDelta, explanation } = result;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ width: 480, animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)" }}>
        <Card glow style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{correct ? "✅" : "❌"}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: correct ? T.green : T.red, marginBottom: 4 }}>
            {correct ? "Correct!" : "Incorrect"}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>{explanation}</div>

          {/* Deltas */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Rating", val: `${ratingDelta > 0 ? "+" : ""}${ratingDelta}`, color: ratingDelta > 0 ? T.green : T.red },
              ...(speedBonus > 0 ? [{ label: "Speed Bonus", val: `+${speedBonus}`, color: T.gold }] : []),
              ...(streakDelta > 0 ? [{ label: "Streak", val: "+1 🔥", color: T.green }] : []),
            ].map(d => (
              <div key={d.label} style={{ padding: "10px 16px", background: `${d.color}12`, border: `1px solid ${d.color}33`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: d.color }}>{d.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="outline" onClick={onStay}>Review Answer</Btn>
            <Btn onClick={onNext}>Next Question →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────  LEADERBOARD MODAL  */
function LeaderboardModal({ entries, onClose, myUserId = "me" }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ width: 640, maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "popIn 0.3s ease" }}>
        <Card style={{ overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>🏆 Global Leaderboard</div>
            <Btn variant="ghost" onClick={onClose} style={{ padding: "6px 12px" }}>✕ Close</Btn>
          </div>
          <div style={{ overflow: "auto" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 90px 70px 60px", gap: 10, padding: "6px 12px", marginBottom: 6 }}>
              {["#", "Player", "Rating", "Tier", "Streak", "Today"].map(h => (
                <div key={h} style={{ fontSize: 9, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {entries.map((u, i) => {
              const isMe = u.userId === myUserId;
              return (
                <div key={u.rank} style={{
                  display: "grid", gridTemplateColumns: "44px 1fr 90px 90px 70px 60px",
                  gap: 10, padding: "12px", borderRadius: 8, marginBottom: 4, alignItems: "center",
                  background: isMe ? `${T.green}08` : i % 2 === 0 ? `${T.cardBorder}55` : "transparent",
                  border: isMe ? `1px solid ${T.green}33` : "1px solid transparent",
                }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : T.muted }}>
                    {i < 3 ? ["🥇","🥈","🥉"][i] : u.rank}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${isMe ? T.green : T.muted}22`, border: `1px solid ${isMe ? T.green : T.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: isMe ? T.green : T.muted }}>
                      {u.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isMe ? T.green : T.text }}>{u.name}{isMe && " (You)"}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{u.solved} solved</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{u.rating}</div>
                  {tag(tierColors[u.tier] || T.green, u.tier)}
                  <div style={{ fontSize: 13, color: T.green }}>🔥 {u.streak}d</div>
                  <div style={{ fontWeight: 900, color: u.delta >= 0 ? T.green : T.red }}>{u.delta >= 0 ? `+${u.delta}` : u.delta}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────  SOLVE PAGE  */
function SolvePage({ userId, onRatingChange, addToast }) {
  const [subject, setSubject] = useState("physics");
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const timerRef = useRef(null);

  const loadQuestion = useCallback(async (subj = subject) => {
    setLoading(true);
    setSelected(null);
    setResult(null);
    setShowResult(false);
    setTimer(90);
    setTimerActive(false);
    clearInterval(timerRef.current);
    try {
      const q = await api.getQuestion(subj);
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadQuestion(); }, []);

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const handleStart = () => { setTimerActive(true); setStartTime(Date.now()); };

  const handleSelect = (i) => {
    if (!result && timerActive) { setSelected(i); }
    if (!timerActive && !result) { setTimerActive(true); setStartTime(Date.now()); setSelected(i); }
  };

  const handleSubmit = async () => {
    if (selected === null || !question) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    setTimerActive(false);
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 90;
    try {
      const res = await api.submitAnswer({ userId, questionId: question.id, selectedOption: selected, timeTaken });
      setResult(res);
      setShowResult(true);
      onRatingChange(res.ratingDelta);
      if (res.correct) addToast(`+${res.ratingDelta} Rating${res.speedBonus > 0 ? ` (⚡ +${res.speedBonus} speed bonus!)` : ""}`, "success");
      else addToast(`${res.ratingDelta} Rating`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    setShowResult(false);
    await loadQuestion(subject);
  };

  const openLeaderboard = async () => {
    const data = await api.getLeaderboard();
    setLeaderboard(data);
    setShowLeaderboard(true);
  };

  const timerPct = (timer / 90) * 100;
  const timerColor = timer > 45 ? T.green : timer > 20 ? T.gold : T.red;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {showResult && <ResultOverlay result={result} question={question} onNext={handleNext} onStay={() => setShowResult(false)} />}
      {showLeaderboard && <LeaderboardModal entries={leaderboard} onClose={() => setShowLeaderboard(false)} />}

      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["physics", "chemistry", "mathematics"].map(s => (
            <button key={s} onClick={() => { setSubject(s); loadQuestion(s); }} style={{
              padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "capitalize",
              background: subject === s ? T.green : T.card, color: subject === s ? "#000" : T.muted,
              border: subject === s ? "none" : `1px solid ${T.cardBorder}`, transition: "all 0.2s",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" onClick={openLeaderboard} style={{ padding: "8px 14px" }}>🏆 Leaderboard</Btn>
          <Btn variant="ghost" onClick={() => loadQuestion()} style={{ padding: "8px 14px" }}>↻ Skip</Btn>
        </div>
      </div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 13, color: T.muted, letterSpacing: 2 }}>▌▌ LOADING QUESTION...</div>
        </Card>
      ) : question && (
        <>
          {/* Meta */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            {tag(diffColors[question.difficulty] || T.green, question.difficulty)}
            {tag(T.blue, question.topic)}
            {tag(T.muted, `Q-Rating: ${question.baseRating}`)}
            <div style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>ID: {question.id}</div>
          </div>

          {/* Timer */}
          <Card style={{ marginBottom: 14, padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: timerColor, fontVariantNumeric: "tabular-nums", minWidth: 52 }}>
                {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}><ProgressBar pct={timerPct} color={timerColor} h={6} /></div>
              {!timerActive && !result && <Btn onClick={handleStart} style={{ padding: "8px 16px" }}>▶ Start</Btn>}
              {timerActive && <div style={{ fontSize: 11, color: T.muted }}>Timer running...</div>}
              {timer === 0 && !result && <div style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>TIME'S UP!</div>}
            </div>
          </Card>

          {/* Question */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, lineHeight: 1.75, fontWeight: 500, color: T.text }}>{question.text}</div>
          </Card>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {question.options.map((opt, i) => {
              let bg = T.card, border = T.cardBorder, color = T.text;
              if (result) {
                if (i === result.correctIndex) { bg = `${T.green}12`; border = T.green; color = T.green; }
                else if (i === selected && !result.correct) { bg = T.redBg; border = T.red; color = T.red; }
                else { color = T.muted; }
              } else if (selected === i) { bg = T.glow; border = T.green; color = T.green; }
              return (
                <div key={i} onClick={() => handleSelect(i)} style={{
                  padding: "14px 20px", background: bg, border: `1px solid ${border}`,
                  borderRadius: 10, color, cursor: result ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
                  fontFamily: "'Courier New', monospace",
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0, background: selected === i && !result ? T.green : "transparent", color: selected === i && !result ? "#000" : color }}>
                    {["A","B","C","D"][i]}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{opt}</div>
                  {result && i === result.correctIndex && <div style={{ marginLeft: "auto", fontSize: 18 }}>✓</div>}
                  {result && i === selected && !result.correct && <div style={{ marginLeft: "auto", fontSize: 18 }}>✗</div>}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {!result ? (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={handleSubmit} disabled={selected === null || submitting} style={{ padding: "13px 32px" }}>
                {submitting ? "▌▌ Checking..." : "Submit Answer"}
              </Btn>
              {timer > 0 && !timerActive && selected !== null && (
                <Btn variant="outline" onClick={handleStart}>Start Timer</Btn>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={handleNext}>Next Question →</Btn>
              <Btn variant="outline" onClick={() => setShowResult(true)}>View Result</Btn>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────  ATTEMPT HISTORY  */
function AttemptHistory({ attempts }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? attempts : attempts.filter(a => a.subject === filter);

  const accuracy = attempts.length ? Math.round(attempts.filter(a => a.correct).length / attempts.length * 100) : 0;
  const totalRating = attempts.reduce((s, a) => s + a.ratingDelta, 0);
  const avgTime = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.timeTaken || 45), 0) / attempts.length) : 0;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Attempt History</div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { l: "Total Attempts", v: attempts.length, color: T.green },
          { l: "Accuracy", v: `${accuracy}%`, color: T.blue },
          { l: "Net Rating", v: `${totalRating >= 0 ? "+" : ""}${totalRating}`, color: totalRating >= 0 ? T.green : T.red },
          { l: "Avg Time", v: `${avgTime}s`, color: T.purple },
        ].map(s => (
          <Card key={s.l} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.v}</div>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["all", "physics", "chemistry", "mathematics"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "capitalize",
            background: filter === f ? T.green : T.card, color: filter === f ? "#000" : T.muted,
            border: filter === f ? "none" : `1px solid ${T.cardBorder}`, transition: "all 0.2s",
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 13, color: T.muted }}>No attempts yet. Start solving questions!</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 80px 70px 60px 70px", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
            {["", "Question", "Topic", "Subject", "Time", "Rating", "Speed"].map(h => (
              <div key={h} style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {filtered.slice().reverse().map((a, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "36px 1fr 100px 80px 70px 60px 70px",
              gap: 12, padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, alignItems: "center",
              background: i % 2 === 0 ? `${T.cardBorder}33` : "transparent",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: a.correct ? `${T.green}20` : T.redBg, border: `1px solid ${a.correct ? T.green : T.red}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: a.correct ? T.green : T.red }}>
                {a.correct ? "✓" : "✗"}
              </div>
              <div style={{ fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.questionText}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{a.topic}</div>
              {tag(diffColors[a.difficulty] || T.green, a.difficulty)}
              <div style={{ fontSize: 12, color: T.muted }}>{a.timeTaken || "—"}s</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: a.ratingDelta >= 0 ? T.green : T.red }}>{a.ratingDelta >= 0 ? `+${a.ratingDelta}` : a.ratingDelta}</div>
              {a.speedBonus > 0 ? tag(T.gold, `⚡+${a.speedBonus}`) : <span style={{ color: T.dim, fontSize: 11 }}>—</span>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────  DASHBOARD  */
function Dashboard({ rating, attempts, streak }) {
  const ratingHistory = [1180, 1195, 1210, 1205, 1220, 1235, rating];
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const subjectStats = {
    physics: attempts.filter(a => a.subject === "physics"),
    chemistry: attempts.filter(a => a.subject === "chemistry"),
    mathematics: attempts.filter(a => a.subject === "mathematics"),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 9, letterSpacing: 2, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>Rating Overview</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: T.white, lineHeight: 1 }}>{rating}</div>
            <div style={{ color: T.green, fontSize: 13, fontWeight: 700 }}>▲ +18 today</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Sparkline data={ratingHistory} w={300} h={70} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {days.map(d => <span key={d} style={{ fontSize: 9, color: T.muted }}>{d}</span>)}
            </div>
          </div>
        </Card>

        <div style={{ background: T.green, borderRadius: 12, padding: 24, color: "#000", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 90, height: 90, borderRadius: "50%", border: "2px dashed rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⚙</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, maxWidth: 260 }}>Next Rated Challenge</div>
          <div style={{ fontSize: 12, marginBottom: 16, opacity: 0.7, maxWidth: 260 }}>Step up to the Grandmaster queue. Win +25 Rating points.</div>
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            {[["TOPIC","Mechanics"],["DIFFICULTY","Hard"],["Q-RATING","1350 Elo"]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 1 }}>{l}</div><div style={{ fontWeight: 700, fontSize: 14 }}>{v}</div></div>
            ))}
          </div>
          <button style={{ padding: "12px 24px", background: "#000", color: T.green, border: "none", borderRadius: 8, fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 11, letterSpacing: 2, cursor: "pointer" }}>
            ENTER RANKED QUEUE ►
          </button>
        </div>
      </div>

      {/* Subject performance */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Subject Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[
            { name: "Physics", icon: "⚡", color: T.blue, rating: 1280, pct: 72, weakness: "Rotational Dynamics", attempts: subjectStats.physics },
            { name: "Chemistry", icon: "⚗", color: "#00ddaa", rating: 1150, pct: 58, weakness: "Organic Reactions", attempts: subjectStats.chemistry },
            { name: "Mathematics", icon: "∑", color: T.purple, rating: 1310, pct: 80, weakness: "Integral Calculus", attempts: subjectStats.mathematics },
          ].map(s => (
            <Card key={s.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Rating</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.white }}>{s.rating}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10, marginBottom: 8 }}>{s.name}</div>
              <ProgressBar pct={s.pct} color={s.color} />
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4, marginBottom: 10 }}>{s.attempts.length} attempted this session</div>
              <div style={{ background: T.redBg, border: `1px solid ${T.red}22`, borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: T.red, fontWeight: 700, letterSpacing: 1.5, marginBottom: 2 }}>CRITICAL WEAKNESS</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.weakness}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent attempts */}
      {attempts.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Activity</div>
          {attempts.slice(-5).reverse().map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.cardBorder}` : "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: a.correct ? `${T.green}20` : T.redBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: a.correct ? T.green : T.red, flexShrink: 0 }}>
                {a.correct ? "✓" : "✗"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.questionText}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{a.subject} · {a.topic}</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, color: a.ratingDelta >= 0 ? T.green : T.red }}>{a.ratingDelta >= 0 ? `+${a.ratingDelta}` : a.ratingDelta}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────  LEADERBOARD PAGE  */
function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getLeaderboard().then(d => { setEntries(d); setLoading(false); }); }, []);
  if (loading) return <Card style={{ textAlign: "center", padding: 60 }}><div style={{ color: T.muted, letterSpacing: 2 }}>▌▌ LOADING...</div></Card>;
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Global Leaderboard</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[{ l: "Your Rank", v: "#8", s: "Top 12% globally" }, { l: "Rating", v: "1248", s: "+18 this week" }, { l: "Solved", v: "521", s: "Questions" }].map(s => (
          <Card key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{s.l}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.white, marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.s}</div>
          </Card>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 90px 70px 60px", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
          {["#","Player","Rating","Tier","Streak","Today"].map(h => <div key={h} style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</div>)}
        </div>
        {entries.map((u, i) => {
          const isMe = u.userId === "me";
          return (
            <div key={u.rank} style={{
              display: "grid", gridTemplateColumns: "44px 1fr 90px 90px 70px 60px",
              gap: 12, padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}`, alignItems: "center",
              background: isMe ? `${T.green}08` : i % 2 === 0 ? `${T.cardBorder}33` : "transparent",
              border: isMe ? `1px solid ${T.green}22` : undefined,
            }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : T.muted }}>
                {i < 3 ? ["🥇","🥈","🥉"][i] : u.rank}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${isMe ? T.green : T.muted}20`, border: `1px solid ${isMe ? T.green : T.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: isMe ? T.green : T.muted }}>{u.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isMe ? T.green : T.text }}>{u.name}{isMe && " ←"}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{u.solved} solved</div>
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{u.rating}</div>
              {tag(tierColors[u.tier] || T.green, u.tier)}
              <div style={{ color: T.green, fontSize: 13 }}>🔥 {u.streak}d</div>
              <div style={{ fontWeight: 900, color: u.delta >= 0 ? T.green : T.red }}>{u.delta >= 0 ? `+${u.delta}` : u.delta}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────  AUTH  */
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setError("");
    if (mode === "signup" && !form.name) return setError("Name is required.");
    if (!form.email || !form.password) return setError("All fields required.");
    if (mode === "signup" && form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ name: form.name || "Aryan Sharma", email: form.email, userId: "me" }); }, 900);
  };

  const inp = (ph, k, type = "text") => (
    <input type={type} placeholder={ph} value={form[k]}
      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
      onKeyDown={e => e.key === "Enter" && submit()}
      style={{ width: "100%", padding: "12px 14px", background: "#080c08", border: `1px solid ${T.cardBorder}`, borderRadius: 8, color: T.text, fontFamily: "'Courier New', monospace", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12, transition: "border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = T.green} onBlur={e => e.target.style.borderColor = T.cardBorder}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.035, backgroundImage: `linear-gradient(${T.green} 1px, transparent 1px), linear-gradient(90deg, ${T.green} 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ width: 420, position: "relative", zIndex: 1 }}>
        <Card glow style={{ padding: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 50, height: 50, background: T.green, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#000", fontSize: 22, margin: "0 auto 12px" }}>R</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.white }}>RankUp</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3, letterSpacing: 1 }}>JEE / NEET PREP PLATFORM</div>
          </div>

          <div style={{ display: "flex", background: "#0b0f0b", borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", background: mode === m ? T.green : "transparent", color: mode === m ? "#000" : T.muted, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", transition: "all 0.2s" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && inp("Full Name", "name")}
          {inp("Email Address", "email", "email")}
          {inp("Password", "password", "password")}
          {mode === "signup" && inp("Confirm Password", "confirm", "password")}

          {error && <div style={{ color: T.red, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}

          <button onClick={submit} style={{ width: "100%", padding: 14, background: T.green, color: "#000", border: "none", borderRadius: 8, fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase", opacity: loading ? 0.7 : 1 }}>
            {loading ? "▌▌ Authenticating..." : mode === "login" ? "► Enter Platform" : "► Create Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: T.muted }}>
            {mode === "login" ? <>No account? <span onClick={() => setMode("signup")} style={{ color: T.green, cursor: "pointer" }}>Sign up free</span></> : <>Have an account? <span onClick={() => setMode("login")} style={{ color: T.green, cursor: "pointer" }}>Log in</span></>}
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: T.dim }}>Demo: any credentials work ↑</div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────  PROGRESS PAGE  */
function ProgressPage({ attempts }) {
  const weekly = [42, 65, 38, 71, 55, 82, 48 + Math.min(attempts.length, 10)];
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const max = Math.max(...weekly);
  const acc = attempts.length ? Math.round(attempts.filter(a => a.correct).length / attempts.length * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>Progress Tracker</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { l: "Total Solved", v: 521 + attempts.filter(a => a.correct).length, c: T.green },
          { l: "Accuracy", v: `${acc || 74}%`, c: T.blue },
          { l: "Best Streak", v: "34d", c: T.gold },
          { l: "Speed Bonus Earned", v: `+${attempts.reduce((s,a) => s + (a.speedBonus||0), 0)}`, c: T.purple },
        ].map(s => (
          <Card key={s.l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.c, marginTop: 4 }}>{s.v}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Questions Solved — This Week</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
          {weekly.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>{v}</div>
              <div style={{ width: "100%", height: `${(v / max) * 90}px`, background: i === 6 ? T.green : `${T.green}40`, borderRadius: "4px 4px 0 0", transition: "height 0.6s ease" }} />
              <div style={{ fontSize: 10, color: T.muted }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Rating Milestones</div>
        {[
          { name: "Beginner (0–800)", done: true },
          { name: "Intermediate (800–1000)", done: true },
          { name: "Expert (1000–1200)", done: true },
          { name: "Grandmaster (1200–1400)", done: false, current: true },
          { name: "Master (1400–1600)", done: false },
          { name: "Legend (1600+)", done: false },
        ].map((m, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${m.done ? T.green : m.current ? T.gold : T.cardBorder}`, background: m.done ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: m.done ? "#000" : m.current ? T.gold : T.muted, flexShrink: 0 }}>
              {m.done ? "✓" : m.current ? "◉" : "○"}
            </div>
            <div style={{ fontSize: 13, color: m.done ? T.text : m.current ? T.gold : T.muted, fontWeight: m.current ? 700 : 400 }}>
              {m.name}{m.current && <span style={{ fontSize: 10, color: T.green, marginLeft: 8 }}>← Current</span>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────  BADGES  */
const BADGE_DEFS = [
  { id: "first_blood", icon: "⚡", name: "First Blood", desc: "Answer your first question", condition: (a) => a.length >= 1 },
  { id: "streak5", icon: "🔥", name: "On Fire", desc: "5 correct in a row", condition: (a) => { let c = 0, max = 0; a.forEach(x => { if (x.correct) { c++; max = Math.max(max, c); } else c = 0; }); return max >= 5; } },
  { id: "speedster", icon: "💨", name: "Speedster", desc: "Earn a speed bonus", condition: (a) => a.some(x => x.speedBonus > 0) },
  { id: "tensolves", icon: "🎯", name: "Sharp Shooter", desc: "Solve 10 questions", condition: (a) => a.length >= 10 },
  { id: "accuracy80", icon: "🏅", name: "Precision", desc: "Maintain 80%+ accuracy", condition: (a) => a.length >= 5 && a.filter(x => x.correct).length / a.length >= 0.8 },
  { id: "multisub", icon: "🌐", name: "All-Rounder", desc: "Attempt all 3 subjects", condition: (a) => new Set(a.map(x => x.subject)).size >= 3 },
];

function BadgesPage({ attempts }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Badges & Achievements</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {BADGE_DEFS.map(b => {
          const earned = b.condition(attempts);
          return (
            <Card key={b.id} style={{ textAlign: "center", padding: 24, opacity: earned ? 1 : 0.45, border: earned ? `1px solid ${T.green}44` : `1px solid ${T.cardBorder}`, background: earned ? `${T.green}06` : T.card }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{b.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{b.desc}</div>
              {earned && <div style={{ marginTop: 10, fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: 1 }}>EARNED ✓</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────  ROOT APP  */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Dashboard");
  const [rating, setRating] = useState(1248);
  const [streak, setStreak] = useState(12);
  const [attempts, setAttempts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const handleRatingChange = (delta) => {
    setRating(r => r + delta);
    if (delta > 0) setStreak(s => s + 1);
  };

  const handleSolveRecord = (attempt) => {
    setAttempts(a => [...a, attempt]);
  };

  // Wrap SolvePage to capture attempts
  const SolveWithRecord = () => (
    <SolvePage
      userId={user?.userId || "me"}
      onRatingChange={(delta, extra) => {
        handleRatingChange(delta);
      }}
      addToast={addToast}
      onAttempt={handleSolveRecord}
    />
  );

  const nav = [
    { id: "Dashboard", icon: "⊞" },
    { id: "Solve", icon: "⊙" },
    { id: "Leaderboard", icon: "▦" },
    { id: "History", icon: "◫" },
    { id: "Progress", icon: "▲" },
    { id: "Badges", icon: "✦" },
    { id: "Profile", icon: "◯" },
  ];

  const pages = {
    Dashboard: <Dashboard rating={rating} attempts={attempts} streak={streak} />,
    Solve: <SolveWithRecord />,
    Leaderboard: <LeaderboardPage />,
    History: <AttemptHistory attempts={attempts} />,
    Progress: <ProgressPage attempts={attempts} />,
    Badges: <BadgesPage attempts={attempts} />,
    Profile: (
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Profile</div>
        <Card style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${T.green}20`, border: `3px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: T.green, margin: "0 auto 12px" }}>
            {(user?.name||"A")[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{user?.name || "Aryan Sharma"}</div>
          <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{user?.email || "aryan@example.com"}</div>
          <div style={{ marginTop: 10 }}>{tag(T.green, "GRANDMASTER TIER")}</div>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Session Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["Rating", rating],["Streak", `${streak}d 🔥`],["Solved This Session", attempts.length],["Session Accuracy", attempts.length ? `${Math.round(attempts.filter(a=>a.correct).length/attempts.length*100)}%` : "—"]].map(([l,v]) => (
              <div key={l} style={{ padding: "12px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <button onClick={() => { setAuthed(false); setUser(null); setPage("Dashboard"); setAttempts([]); setRating(1248); }} style={{ width: "100%", padding: 14, background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 8, color: T.red, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1.5 }}>
          ⏻ LOG OUT
        </button>
      </div>
    ),
  };

  if (!authed) return <AuthPage onLogin={u => { setUser(u); setAuthed(true); }} />;

  const earnedBadges = BADGE_DEFS.filter(b => b.condition(attempts)).length;

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "'Courier New', monospace", color: T.text, overflow: "hidden" }}>
      <style>{`
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.dim}; border-radius: 2px; }
      `}</style>

      <Toast toasts={toasts} />

      {/* bg grid */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${T.green} 1px, transparent 1px), linear-gradient(90deg, ${T.green} 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />

      {/* SIDEBAR */}
      <div style={{ width: 210, background: T.sidebar, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", padding: "20px 0", position: "relative", zIndex: 2, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 18px 22px", borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, background: T.green, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#000", fontSize: 16, flexShrink: 0 }}>R</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.white }}>RankUp</div>
            <div style={{ fontSize: 10, color: T.muted }}>JEE/NEET Prep</div>
          </div>
        </div>

        {nav.map(n => {
          const active = page === n.id;
          return (
            <div key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
              cursor: "pointer", borderRadius: "0 10px 10px 0", marginRight: 10, marginBottom: 2,
              background: active ? T.glow : "transparent",
              borderLeft: `3px solid ${active ? T.green : "transparent"}`,
              color: active ? T.green : T.muted, fontSize: 13, fontWeight: active ? 700 : 400,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              <span>{n.id}</span>
              {n.id === "Badges" && earnedBadges > 0 && (
                <span style={{ marginLeft: "auto", background: T.green, color: "#000", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 900 }}>{earnedBadges}</span>
              )}
            </div>
          );
        })}

        <div style={{ margin: "auto 14px 0", background: `${T.green}08`, border: `1px solid ${T.green}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🏅</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: T.green, letterSpacing: 1.5 }}>GRANDMASTER</div>
          <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>Top 0.1% Globally</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Topbar */}
        <div style={{ height: 58, background: T.sidebar, borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 20, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Rating</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.white }}>{rating}</div>
            </div>
            <div style={{ width: 56, height: 5, background: T.cardBorder, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${((rating - 1200) / 200) * 100}%`, height: "100%", background: T.green, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: T.cardBorder }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.green, fontWeight: 700, fontSize: 13 }}>
            🔥 {streak} Day Streak
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            {/* Notification bell */}
            <div onClick={() => setNotifOpen(o => !o)} style={{ position: "relative", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 14 }}>🔔</div>
              {attempts.length > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: T.red }} />}
              {notifOpen && (
                <div style={{ position: "absolute", top: 40, right: 0, width: 260, background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: 12, zIndex: 100 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 10, letterSpacing: 1 }}>NOTIFICATIONS</div>
                  {attempts.length === 0 ? <div style={{ fontSize: 12, color: T.dim }}>No notifications yet.</div> : attempts.slice(-3).reverse().map((a, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.cardBorder}` : "none", fontSize: 12 }}>
                      <span style={{ color: a.correct ? T.green : T.red }}>{a.correct ? "✓" : "✗"}</span> {a.questionText?.slice(0, 40)}... <span style={{ color: a.ratingDelta >= 0 ? T.green : T.red, fontWeight: 700 }}>{a.ratingDelta >= 0 ? `+${a.ratingDelta}` : a.ratingDelta}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div onClick={() => setPage("Profile")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{user?.name || "Aryan Sharma"}</div>
                <div style={{ fontSize: 9, color: T.green, letterSpacing: 1.5 }}>PREMIUM</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${T.green}20`, border: `2px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: T.green, fontSize: 13 }}>
                {(user?.name||"A")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
