import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const MOCK_API_EXPENSES = [
  { id: 1, description: "Grocery Shopping", amount: 4500, category: "Food", date: "2025-03-01" },
  { id: 2, description: "Uber Ride", amount: 1200, category: "Transport", date: "2025-03-02" },
  { id: 3, description: "Netflix", amount: 4990, category: "Entertainment", date: "2025-03-03" },
  { id: 4, description: "Electricity Bill", amount: 8500, category: "Utilities", date: "2025-03-04" },
  { id: 5, description: "Lunch at Eatery", amount: 2300, category: "Food", date: "2025-03-05" },
];

const CATEGORIES = ["Food", "Transport", "Entertainment", "Utilities", "Health", "Education", "Other"];

const CATEGORY_COLORS = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Entertainment: "#a855f7",
  Utilities: "#10b981",
  Health: "#ef4444",
  Education: "#f59e0b",
  Other: "#6b7280",
};

const fetchMockExpenses = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_API_EXPENSES), 800));

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ description: "", amount: "", category: "Food", date: "" });
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const descriptionRef = useRef(null);

  useEffect(() => {
    fetchMockExpenses().then((data) => {
      setExpenses(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) descriptionRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!form.description.trim() || !form.amount || !form.date) {
      setToast({ type: "error", msg: "Please fill in all fields." });
      return;
    }
    const newExpense = {
      id: Date.now(),
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setForm({ description: "", amount: "", category: "Food", date: "" });
    setToast({ type: "success", msg: "Expense added!" });
    descriptionRef.current?.focus();
  }, [form]);

  const handleDelete = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setToast({ type: "info", msg: "Expense removed." });
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = filterCategory === "All" || e.category === filterCategory;
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [expenses, filterCategory, search]);

  const totals = useMemo(() => {
    const byCategory = {};
    let grand = 0;
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      grand += e.amount;
    });
    return { byCategory, grand };
  }, [expenses]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(totals.byCategory);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  }, [totals]);

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {toast && (
        <div style={{ ...s.toast, background: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#6366f1" }}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "i"}&nbsp;&nbsp;{toast.msg}
        </div>
      )}

      <div style={s.container}>
        <header style={s.header}>
          <div>
            <div style={s.headerLabel}>PERSONAL FINANCE</div>
            <h1 style={s.title}>Expense Tracker</h1>
          </div>
          <div style={s.totalPill}>
            <span style={s.totalLabel}>Total Spent</span>
            <span style={s.totalAmt}>₦{totals.grand.toLocaleString()}</span>
          </div>
        </header>

        <div style={s.grid}>
          <div style={s.left}>
            <section style={s.card}>
              <h2 style={s.cardTitle}>Add Expense</h2>
              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <input
                  ref={descriptionRef}
                  style={s.input}
                  name="description"
                  placeholder="What did you spend on?"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ ...s.formGroup, flex: 1 }}>
                  <label style={s.label}>Amount (₦)</label>
                  <input
                    style={s.input}
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div style={{ ...s.formGroup, flex: 1 }}>
                  <label style={s.label}>Date</label>
                  <input
                    style={s.input}
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Category</label>
                <div style={s.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm((p) => ({ ...p, category: cat }))}
                      style={{
                        ...s.catBtn,
                        background: form.category === cat ? CATEGORY_COLORS[cat] : "#1e293b",
                        color: form.category === cat ? "#fff" : "#94a3b8",
                        borderColor: form.category === cat ? CATEGORY_COLORS[cat] : "#334155",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button style={s.addBtn} onClick={handleAdd}>+ Add Expense</button>
            </section>

            <section style={s.card}>
              <h2 style={s.cardTitle}>Spending by Category</h2>
              {Object.keys(totals.byCategory).length === 0 ? (
                <p style={s.empty}>No data yet.</p>
              ) : (
                Object.entries(totals.byCategory).map(([cat, amt]) => (
                  <div key={cat} style={s.barRow}>
                    <div style={s.barLabel}>
                      <span style={{ color: CATEGORY_COLORS[cat], fontWeight: 600 }}>{cat}</span>
                      <span style={s.barAmt}>₦{amt.toLocaleString()}</span>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{
                        ...s.barFill,
                        width: `${(amt / totals.grand) * 100}%`,
                        background: CATEGORY_COLORS[cat],
                      }} />
                    </div>
                  </div>
                ))
              )}
              {topCategory && (
                <div style={s.topCatNote}>
                  🔥 Highest spend: <strong>{topCategory[0]}</strong> — ₦{topCategory[1].toLocaleString()}
                </div>
              )}
            </section>
          </div>

          <div style={s.right}>
            <section style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ ...s.cardTitle, margin: 0 }}>Expenses</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...s.input, width: 140, padding: "7px 12px", fontSize: 13 }}
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    style={{ ...s.input, width: 130, padding: "7px 12px", fontSize: 13 }}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="All">All</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={s.loadingWrap}>
                  <div style={s.spinner} />
                  <p style={s.loadingText}>Fetching expenses...</p>
                </div>
              ) : filtered.length === 0 ? (
                <p style={s.empty}>No expenses found.</p>
              ) : (
                <div style={s.expenseList}>
                  {filtered.map((e) => (
                    <div key={e.id} style={s.expenseItem}>
                      <div style={{ ...s.catDot, background: CATEGORY_COLORS[e.category] }} />
                      <div style={s.expenseInfo}>
                        <span style={s.expenseDesc}>{e.description}</span>
                        <span style={s.expenseMeta}>{e.category} · {e.date}</span>
                      </div>
                      <span style={s.expenseAmt}>₦{e.amount.toLocaleString()}</span>
                      <button style={s.deleteBtn} onClick={() => handleDelete(e.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(-20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', sans-serif",
    color: "#e2e8f0",
    padding: "0 0 60px",
  },
  toast: {
    position: "fixed", top: 20, right: 20, zIndex: 999,
    padding: "12px 20px", borderRadius: 10,
    color: "#fff", fontWeight: 600, fontSize: 13,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease",
  },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 20px" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    padding: "40px 0 28px", borderBottom: "1px solid #1e293b",
    marginBottom: 28, flexWrap: "wrap", gap: 16,
  },
  headerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#475569", marginBottom: 6 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  totalPill: {
    background: "linear-gradient(135deg, #1e3a5f, #10b981)",
    borderRadius: 14, padding: "14px 24px", textAlign: "right",
  },
  totalLabel: { display: "block", fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  totalAmt: { display: "block", fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" },
  grid: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  left: { flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 20 },
  right: { flex: 1, minWidth: 280 },
  card: {
    background: "#0f172a", borderRadius: 16,
    padding: 24, border: "1px solid #1e293b",
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 16,
    fontWeight: 700, color: "#f1f5f9", marginBottom: 20,
  },
  formGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, letterSpacing: 0.5 },
  input: {
    width: "100%", padding: "10px 14px",
    background: "#1e293b", border: "1.5px solid #334155",
    borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  },
  categoryGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  catBtn: {
    padding: "6px 12px", borderRadius: 20,
    border: "1.5px solid", fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  },
  addBtn: {
    width: "100%", padding: 13,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4,
  },
  barRow: { marginBottom: 14 },
  barLabel: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 },
  barAmt: { color: "#94a3b8" },
  barTrack: { height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.5s ease" },
  topCatNote: {
    marginTop: 16, padding: "10px 14px",
    background: "#1e293b", borderRadius: 8, fontSize: 13, color: "#94a3b8",
  },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 14 },
  spinner: {
    width: 32, height: 32, border: "3px solid #1e293b",
    borderTop: "3px solid #10b981", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: { color: "#475569", fontSize: 13 },
  empty: { color: "#475569", fontSize: 13, textAlign: "center", padding: "30px 0" },
  expenseList: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" },
  expenseItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", background: "#1e293b",
    borderRadius: 10, transition: "background 0.15s",
  },
  catDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  expenseInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 3 },
  expenseDesc: { fontSize: 14, fontWeight: 600, color: "#f1f5f9" },
  expenseMeta: { fontSize: 12, color: "#64748b" },
  expenseAmt: { fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#10b981", fontSize: 15, whiteSpace: "nowrap" },
  deleteBtn: {
    background: "none", border: "none", color: "#475569",
    cursor: "pointer", fontSize: 13, padding: "4px 6px",
    borderRadius: 6, transition: "color 0.15s",
  },
};