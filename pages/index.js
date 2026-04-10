import { useState, useEffect, useCallback } from "react";

const MEMBERSHIP_COUPONS = {
  "Individual Membership":          1,
  "Student Membership":             1,
  "Family Membership (2 adults)":   2,
  "Family Membership (3 adults)":   3,
  "Family Membership (4 adults)":   4,
};

const maskEmail = (email = "") => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return user.slice(0, 2) + "***@" + domain;
};

const S = {
  app:       { fontFamily: "Georgia, serif", minHeight: "100vh", background: "#f4f4f0" },
  header:    { background: "#fff", borderBottom: "1px solid #e5e5e0", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  logoWrap:  { display: "flex", alignItems: "center", gap: 10 },
  logoMark:  { width: 38, height: 38, borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "600", fontSize: 13, fontFamily: "sans-serif", flexShrink: 0, letterSpacing: "0.5px" },
  logoText:  { fontSize: 16, fontWeight: "500", color: "#1a1a1a", letterSpacing: "-0.3px" },
  logoSub:   { fontSize: 11, color: "#888", fontFamily: "sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" },
  nav:       { display: "flex", gap: 6, flexWrap: "wrap" },
  navBtn:    (a) => ({ padding: "7px 16px", borderRadius: 8, border: a ? "1.5px solid #1D9E75" : "1px solid #ddd", background: a ? "#E1F5EE" : "transparent", color: a ? "#0F6E56" : "#666", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", fontWeight: a ? "600" : "400" }),
  main:      { maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" },
  card:      { background: "#fff", borderRadius: 12, border: "1px solid #e5e5e0", padding: "1.5rem", marginBottom: "1rem" },
  lbl:       { fontSize: 11, color: "#888", fontFamily: "sans-serif", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 5, marginTop: 14, display: "block" },
  input:     { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#1a1a1a", fontSize: 15, fontFamily: "sans-serif", outline: "none" },
  codeInput: { width: "100%", padding: "14px 16px", borderRadius: 8, border: "1.5px solid #ddd", background: "#fff", color: "#1a1a1a", fontSize: 30, fontFamily: "monospace", letterSpacing: "0.35em", textAlign: "center", outline: "none" },
  btn:       (v = "primary") => ({ padding: "11px 20px", borderRadius: 8, border: "none", background: v === "primary" ? "#1D9E75" : v === "danger" ? "#E24B4A" : "#f0f0eb", color: v === "primary" || v === "danger" ? "#fff" : "#1a1a1a", cursor: "pointer", fontSize: 14, fontFamily: "sans-serif", fontWeight: "600", width: "100%", marginTop: 10 }),
  tag:       (t) => { const c = { success: ["#EAF3DE","#27500A"], warning: ["#FAEEDA","#633806"], danger: ["#FCEBEB","#791F1F"], info: ["#E6F1FB","#0C447C"] }; const [bg, col] = c[t] || c.info; return { background: bg, color: col, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontFamily: "sans-serif", fontWeight: "600", display: "inline-block" }; },
  row:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  metrics:   { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: "1.5rem" },
  metric:    (bg) => ({ background: bg || "#f8f8f5", borderRadius: 8, padding: "12px", textAlign: "center" }),
  metricNum: (col) => ({ fontSize: 26, fontWeight: "600", color: col || "#1a1a1a", display: "block", fontFamily: "sans-serif" }),
  metricLbl: { fontSize: 11, color: "#888", fontFamily: "sans-serif", letterSpacing: "0.4px", textTransform: "uppercase" },
  sec:       { fontSize: 12, fontWeight: "600", color: "#888", fontFamily: "sans-serif", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 14 },
  sel:       { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#1a1a1a", fontSize: 14, fontFamily: "sans-serif", outline: "none" },
  divider:   { borderTop: "1px solid #e5e5e0", margin: "1rem 0" },
  err:       { color: "#E24B4A", fontSize: 13, fontFamily: "sans-serif", marginTop: 6 },
  restBadge: { background: "#E1F5EE", color: "#0F6E56", borderRadius: 6, padding: "4px 12px", fontSize: 13, fontFamily: "sans-serif", fontWeight: "600", display: "inline-block" },
  flash:     (ok) => ({ background: ok ? "#EAF3DE" : "#FCEBEB", border: `1px solid ${ok ? "#9FE1CB" : "#F7C1C1"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: ok ? "#27500A" : "#791F1F", fontFamily: "sans-serif" }),
  spin:      { fontSize: 13, color: "#888", fontFamily: "sans-serif", textAlign: "center", padding: "1rem 0" },
};

// ── Restaurant Views ─────────────────────────────────────────────

function RestaurantLogin({ onLogin }) {
  const [pin, setPin]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!pin.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/restaurant-login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (res.ok) onLogin({ ...data, pin: pin.trim() });
      else setError(data.error || "Invalid PIN");
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={S.card}>
        <p style={{ fontSize: 20, fontWeight: "500", color: "#1a1a1a", margin: "0 0 6px" }}>Restaurant Login</p>
        <p style={{ fontSize: 14, color: "#666", fontFamily: "sans-serif", margin: 0 }}>Enter your restaurant's unique PIN assigned by KMA admin.</p>
      </div>
      <div style={S.card}>
        <label style={{ ...S.lbl, marginTop: 0 }}>Restaurant PIN</label>
        <input style={S.input} type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} placeholder="Enter your PIN" />
        {error && <p style={S.err}>{error}</p>}
        <button style={S.btn("primary")} onClick={attempt} disabled={loading}>{loading ? "Checking…" : "Sign in"}</button>
      </div>
      <p style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", textAlign: "center" }}>Contact KMA if you need your PIN.</p>
    </div>
  );
}

function RestaurantView() {
  const [restaurant, setRestaurant] = useState(null);
  const [code, setCode]         = useState("");
  const [member, setMember]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const lookup = async () => {
    if (code.length !== 5) return;
    setLoading(true); setError(""); setNotFound(false); setMember(null);
    try {
      const res = await fetch(`/api/lookup?code=${code.trim()}`);
      const data = await res.json();
      if (res.ok) setMember(data);
      else setNotFound(true);
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  const redeem = async () => {
    if (!member || !restaurant) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/redeem", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), restaurantPin: restaurant.pin }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || "Redemption failed");
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setCode(""); setMember(null); setNotFound(false); setResult(null); setError(""); };

  if (!restaurant) return <RestaurantLogin onLogin={setRestaurant} />;

  const remaining = member ? member.couponsRemaining : 0;

  return (
    <div>
      <div style={S.card}>
        <div style={S.row}>
          <div>
            <p style={{ fontSize: 20, fontWeight: "500", color: "#1a1a1a", margin: "0 0 4px" }}>Redeem Coupon</p>
            <span style={S.restBadge}>{restaurant.name}</span>
          </div>
          <button onClick={() => setRestaurant(null)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", color: "#666", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif" }}>Sign out</button>
        </div>
        <p style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif", margin: "10px 0 0" }}>
          Coupons redeemed here are logged under <strong style={{ fontWeight: "600" }}>{restaurant.name}</strong>.
        </p>
      </div>

      {!result && (
        <div style={S.card}>
          <label style={{ ...S.lbl, marginTop: 0 }}>Member's 5-digit code</label>
          <input style={S.codeInput} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))} onKeyDown={e => e.key === "Enter" && lookup()} placeholder="_ _ _ _ _" maxLength={5} />
          <button style={S.btn("primary")} onClick={lookup} disabled={code.length !== 5 || loading}>
            {loading ? "Looking up…" : "Look up member"}
          </button>
          {notFound && <p style={{ ...S.err, textAlign: "center", marginTop: 10 }}>No member found with that code.</p>}
          {error && <p style={{ ...S.err, textAlign: "center", marginTop: 10 }}>{error}</p>}
        </div>
      )}

      {member && !result && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: "500", margin: 0 }}>{member.name}</p>
              <p style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif", margin: "3px 0 0" }}>{member.kmaNumber} · {maskEmail(member.email)}</p>
            </div>
            <span style={S.tag("info")}>{member.membershipType}</span>
          </div>
          <div style={S.metrics}>
            <div style={S.metric()}><span style={S.metricNum()}>{member.couponsIssued}</span><span style={S.metricLbl}>Issued</span></div>
            <div style={S.metric()}><span style={S.metricNum()}>{member.couponsUsed}</span><span style={S.metricLbl}>Used</span></div>
            <div style={S.metric(remaining > 0 ? "#E1F5EE" : "#FCEBEB")}>
              <span style={S.metricNum(remaining > 0 ? "#0F6E56" : "#A32D2D")}>{remaining}</span>
              <span style={S.metricLbl}>Remaining</span>
            </div>
          </div>
          <div style={{ background: "#f8f8f5", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif" }}>Redeeming at</span>
            <span style={{ fontSize: 13, fontWeight: "600", fontFamily: "sans-serif", color: "#0F6E56" }}>{restaurant.name}</span>
          </div>
          {error && <p style={S.err}>{error}</p>}
          {remaining > 0
            ? <button style={S.btn("primary")} onClick={redeem} disabled={loading}>{loading ? "Processing…" : `Use 1 coupon at ${restaurant.name}`}</button>
            : <div style={{ background: "#FCEBEB", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ color: "#791F1F", fontSize: 14, fontFamily: "sans-serif", margin: 0 }}>No coupons remaining for this member.</p>
              </div>
          }
          <button style={S.btn("secondary")} onClick={reset}>Search again</button>
        </div>
      )}

      {result && (
        <div style={S.card}>
          <div style={{ textAlign: "center", padding: "1rem 0 1.5rem" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#0F6E56", fontSize: 24, fontFamily: "sans-serif" }}>✓</div>
            <p style={{ fontSize: 18, fontWeight: "500", color: "#0F6E56", margin: "0 0 4px" }}>Coupon redeemed!</p>
            <p style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif", margin: 0 }}>Emails sent to member, {restaurant.name}, and KMA.</p>
          </div>
          <div style={S.divider} />
          {[["Member", result.memberName], ["KMA number", result.kmaNumber], ["Redeemed at", result.restaurant], ["Date", result.date], ["Transaction ID", result.txnId]].map(([k, v]) => (
            <div key={k} style={S.row}>
              <span style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif" }}>{k}</span>
              <span style={{ fontSize: 13, fontFamily: "sans-serif" }}>{v}</span>
            </div>
          ))}
          <div style={S.row}>
            <span style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif" }}>Remaining after this</span>
            <span style={S.tag(result.remaining > 0 ? "success" : "danger")}>{result.remaining} left</span>
          </div>
          <button style={{ ...S.btn("primary"), marginTop: 16 }} onClick={reset}>Redeem another</button>
        </div>
      )}
    </div>
  );
}

// ── Admin Views ──────────────────────────────────────────────────

function AdminView() {
  const [pin, setPin]     = useState("");
  const [authed, setAuthed] = useState(false);
  const [pinErr, setPinErr] = useState(false);
  const [tab, setTab]     = useState("members");
  const [data, setData]   = useState({ members: [], restaurants: [], redemptions: [] });
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);
  const [newMember, setNewMember] = useState({ firstName: "", lastName: "", email: "", membershipType: "Individual Membership", expiryDate: "", zeffyNumber: "" });
  const [newRest, setNewRest]     = useState({ name: "", ownerName: "", ownerEmail: "", restPin: "" });
  const [saving, setSaving] = useState(false);

  const adminPin = pin;

  const showFlash = (msg, ok = true) => { setFlash({ msg, ok }); setTimeout(() => setFlash(null), 6000); };

  const loadData = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin-data?pin=${encodeURIComponent(p)}`);
      const d = await res.json();
      if (res.ok) setData(d);
      else { setPinErr(true); setAuthed(false); }
    } catch { showFlash("Failed to load data.", false); }
    finally { setLoading(false); }
  }, []);

  const adminLogin = async () => {
    setPinErr(false);
    await loadData(pin);
    setAuthed(true);
  };

  const addMember = async () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.membershipType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/add-member", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin, ...newMember }),
      });
      const d = await res.json();
      if (res.ok) {
        showFlash(`${newMember.firstName} ${newMember.lastName} added — code ${d.code} — ${d.couponsIssued} coupon(s). Welcome email sent.`);
        setNewMember({ firstName: "", lastName: "", email: "", membershipType: "Individual Membership", expiryDate: "", zeffyNumber: "" });
        await loadData(adminPin);
      } else showFlash(d.error || "Failed to add member.", false);
    } catch { showFlash("Connection error.", false); }
    finally { setSaving(false); }
  };

  const addRestaurant = async () => {
    if (!newRest.name || !newRest.ownerEmail || !newRest.restPin) return;
    setSaving(true);
    try {
      const res = await fetch("/api/add-restaurant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin, ...newRest }),
      });
      const d = await res.json();
      if (res.ok) {
        showFlash(`${newRest.name} added with PIN: ${newRest.restPin}`);
        setNewRest({ name: "", ownerName: "", ownerEmail: "", restPin: "" });
        await loadData(adminPin);
      } else showFlash(d.error || "Failed to add restaurant.", false);
    } catch { showFlash("Connection error.", false); }
    finally { setSaving(false); }
  };

  if (!authed) return (
    <div>
      <div style={S.card}>
        <p style={{ fontSize: 20, fontWeight: "500", color: "#1a1a1a", margin: "0 0 6px" }}>KMA Admin</p>
        <p style={{ fontSize: 14, color: "#666", fontFamily: "sans-serif", margin: 0 }}>Manage members, restaurant logins, and coupon allocations.</p>
      </div>
      <div style={S.card}>
        <label style={{ ...S.lbl, marginTop: 0 }}>Admin PIN</label>
        <input style={S.input} type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && adminLogin()} placeholder="••••••" />
        {pinErr && <p style={S.err}>Incorrect PIN.</p>}
        <button style={S.btn("primary")} onClick={adminLogin} disabled={loading}>{loading ? "Signing in…" : "Sign in as admin"}</button>
      </div>
    </div>
  );

  return (
    <div>
      {flash && <div style={S.flash(flash.ok)}>{flash.msg}</div>}
      {loading && <p style={S.spin}>Loading from Google Sheets…</p>}

      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {["members", "restaurants", "log"].map(t => (
          <button key={t} style={S.navBtn(tab === t)} onClick={() => setTab(t)}>
            {t === "log" ? "Redemption Log" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button onClick={() => loadData(adminPin)} style={{ ...S.navBtn(false), marginLeft: "auto" }}>↻ Refresh</button>
      </div>

      {tab === "members" && (
        <>
          <div style={S.card}>
            <p style={S.sec}>Add new member</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ ...S.lbl, marginTop: 0 }}>First name</label>
                <input style={S.input} value={newMember.firstName} onChange={e => setNewMember(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
              </div>
              <div>
                <label style={{ ...S.lbl, marginTop: 0 }}>Last name</label>
                <input style={S.input} value={newMember.lastName} onChange={e => setNewMember(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
              </div>
            </div>
            <label style={S.lbl}>Email</label>
            <input style={S.input} value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" type="email" />
            <label style={S.lbl}>Membership type</label>
            <select style={S.sel} value={newMember.membershipType} onChange={e => setNewMember(p => ({ ...p, membershipType: e.target.value }))}>
              {Object.entries(MEMBERSHIP_COUPONS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v} coupon{v > 1 ? "s" : ""}</option>
              ))}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.lbl}>Expiry date (optional)</label>
                <input style={S.input} value={newMember.expiryDate} onChange={e => setNewMember(p => ({ ...p, expiryDate: e.target.value }))} placeholder="e.g. 2027-02-27" />
              </div>
              <div>
                <label style={S.lbl}>Zeffy member # (optional)</label>
                <input style={S.input} value={newMember.zeffyNumber} onChange={e => setNewMember(p => ({ ...p, zeffyNumber: e.target.value }))} placeholder="e.g. 21" />
              </div>
            </div>
            <button style={S.btn("primary")} onClick={addMember} disabled={saving}>{saving ? "Adding…" : "Add member & send welcome email"}</button>
          </div>

          <div style={S.card}>
            <p style={S.sec}>All members ({data.members.length})</p>
            {data.members.length === 0 && <p style={{ fontSize: 14, color: "#666", fontFamily: "sans-serif" }}>No members yet.</p>}
            {data.members.map((m, i) => {
              const rem = m.couponsRemaining;
              return (
                <div key={i} style={{ paddingBottom: 12, borderBottom: "1px solid #e5e5e0", marginBottom: 12 }}>
                  <div style={S.row}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "500", fontFamily: "sans-serif" }}>{m.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>
                        {m.kmaNumber} · Code: <span style={{ fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: "600" }}>{m.code}</span>
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>{m.membershipType}</p>
                    </div>
                    <span style={S.tag(rem > 0 ? "success" : "danger")}>{rem}/{m.couponsIssued}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "restaurants" && (
        <>
          <div style={S.card}>
            <p style={S.sec}>Add restaurant / brand</p>
            <label style={{ ...S.lbl, marginTop: 0 }}>Restaurant name</label>
            <input style={S.input} value={newRest.name} onChange={e => setNewRest(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Spice Garden" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.lbl}>Owner name</label>
                <input style={S.input} value={newRest.ownerName} onChange={e => setNewRest(p => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" />
              </div>
              <div>
                <label style={S.lbl}>Owner email</label>
                <input style={S.input} value={newRest.ownerEmail} onChange={e => setNewRest(p => ({ ...p, ownerEmail: e.target.value }))} placeholder="owner@restaurant.com" type="email" />
              </div>
            </div>
            <label style={S.lbl}>Login PIN</label>
            <input style={S.input} value={newRest.restPin} onChange={e => setNewRest(p => ({ ...p, restPin: e.target.value }))} placeholder="e.g. spice1 (must be unique)" />
            <p style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif", marginTop: 6 }}>Share this PIN with the restaurant owner — they use it to sign in and can only redeem coupons under their brand.</p>
            <button style={S.btn("primary")} onClick={addRestaurant} disabled={saving}>{saving ? "Adding…" : "Add restaurant & set PIN"}</button>
          </div>

          <div style={S.card}>
            <p style={S.sec}>Participating restaurants ({data.restaurants.length})</p>
            {data.restaurants.length === 0 && <p style={{ fontSize: 14, color: "#666", fontFamily: "sans-serif" }}>No restaurants yet.</p>}
            {data.restaurants.map((r, i) => (
              <div key={i} style={{ paddingBottom: 12, borderBottom: "1px solid #e5e5e0", marginBottom: 12 }}>
                <div style={S.row}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "500", fontFamily: "sans-serif" }}>{r.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>{r.ownerEmail}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>PIN: <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{r.pin}</span></p>
                  </div>
                  <span style={S.tag(r.active ? "success" : "warning")}>{r.active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "log" && (
        <div style={S.card}>
          <p style={S.sec}>Redemption log ({data.redemptions.length} transactions)</p>
          {data.redemptions.length === 0 && <p style={{ fontSize: 14, color: "#666", fontFamily: "sans-serif" }}>No redemptions yet.</p>}
          {[...data.redemptions].reverse().map((l, i) => (
            <div key={i} style={{ paddingBottom: 14, borderBottom: "1px solid #e5e5e0", marginBottom: 14 }}>
              <div style={S.row}>
                <span style={{ fontSize: 14, fontWeight: "500", fontFamily: "sans-serif" }}>{l.memberName}</span>
                <span style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>{l.date} {l.time}</span>
              </div>
              <p style={{ margin: "2px 0 6px", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>{l.kmaNumber} · {l.restaurant}</p>
              <p style={{ margin: "2px 0 6px", fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{l.txnId}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={S.tag("warning")}>Used: {l.used}</span>
                <span style={S.tag(l.remaining > 0 ? "success" : "danger")}>Remaining: {l.remaining}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState("restaurant");
  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logoWrap}>
          <div style={S.logoMark}>KMA</div>
          <div>
            <div style={S.logoText}>Kamloops Malayali Association</div>
            <div style={S.logoSub}>Member Coupon System</div>
          </div>
        </div>
        <nav style={S.nav}>
          <button style={S.navBtn(view === "restaurant")} onClick={() => setView("restaurant")}>Restaurant</button>
          <button style={S.navBtn(view === "admin")}      onClick={() => setView("admin")}>Admin</button>
        </nav>
      </div>
      <div style={S.main}>
        {view === "restaurant" ? <RestaurantView /> : <AdminView />}
      </div>
    </div>
  );
}
