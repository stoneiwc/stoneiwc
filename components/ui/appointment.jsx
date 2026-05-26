import { useState } from "react";

const timeSlots = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"];

const services = [
  { id: 1, name: "Consultation", duration: "30 min", price: "$50" },
  { id: 2, name: "Full Session", duration: "60 min", price: "$95" },
  { id: 3, name: "Extended Review", duration: "90 min", price: "$130" },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

export default function AppointmentBooker() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [confirmed, setConfirmed] = useState(false);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isPast = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleConfirm = () => {
    if (form.name && form.email) setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✦</div>
          <h2 style={styles.successTitle}>Appointment Confirmed</h2>
          <div style={styles.successDetails}>
            <div style={styles.detail}><span style={styles.label}>SERVICE</span><span style={styles.value}>{services.find(s=>s.id===selectedService)?.name}</span></div>
            <div style={styles.detail}><span style={styles.label}>DATE</span><span style={styles.value}>{monthNames[currentMonth]} {selectedDate}, {currentYear}</span></div>
            <div style={styles.detail}><span style={styles.label}>TIME</span><span style={styles.value}>{selectedTime}</span></div>
            <div style={styles.detail}><span style={styles.label}>NAME</span><span style={styles.value}>{form.name}</span></div>
          </div>
          <p style={styles.successNote}>A confirmation has been sent to {form.email}</p>
          <button style={styles.btnPrimary} onClick={() => { setConfirmed(false); setStep(1); setSelectedDate(null); setSelectedTime(null); setSelectedService(null); setForm({ name: "", email: "", notes: "" }); }}>
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <span style={styles.brand}>APPT</span>
            <div style={styles.steps}>
              {[1,2,3].map(s => (
                <div key={s} style={{ ...styles.stepDot, ...(step >= s ? styles.stepActive : {}) }}>
                  {s < step ? "✓" : s}
                </div>
              ))}
            </div>
          </div>
          <h1 style={styles.title}>
            {step === 1 ? "Choose a service" : step === 2 ? "Pick a date & time" : "Your details"}
          </h1>
        </div>

        {/* Step 1: Service */}
        {step === 1 && (
          <div style={styles.body}>
            <div style={styles.serviceGrid}>
              {services.map(s => (
                <div key={s.id} onClick={() => setSelectedService(s.id)}
                  style={{ ...styles.serviceCard, ...(selectedService === s.id ? styles.serviceSelected : {}) }}>
                  <div style={styles.serviceName}>{s.name}</div>
                  <div style={styles.serviceMeta}>{s.duration} · {s.price}</div>
                  {selectedService === s.id && <div style={styles.checkmark}>✦</div>}
                </div>
              ))}
            </div>
            <button style={{ ...styles.btnPrimary, ...(selectedService ? {} : styles.btnDisabled) }}
              onClick={() => selectedService && setStep(2)} disabled={!selectedService}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Calendar + Time */}
        {step === 2 && (
          <div style={styles.body}>
            <div style={styles.calendarHeader}>
              <button onClick={prevMonth} style={styles.calNav}>‹</button>
              <span style={styles.monthLabel}>{monthNames[currentMonth]} {currentYear}</span>
              <button onClick={nextMonth} style={styles.calNav}>›</button>
            </div>
            <div style={styles.calGrid}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <div key={d} style={styles.dayLabel}>{d}</div>
              ))}
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const isWeekend = new Date(currentYear, currentMonth, day).getDay() % 6 === 0;
                const past = isPast(day);
                const sel = selectedDate === day;
                return (
                  <div key={day} onClick={() => !past && !isWeekend && setSelectedDate(day)}
                    style={{ ...styles.dayCell, ...(past || isWeekend ? styles.dayCellDisabled : styles.dayCellActive), ...(sel ? styles.dayCellSelected : {}) }}>
                    {day}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div>
                <div style={styles.timesLabel}>Available times · {monthNames[currentMonth]} {selectedDate}</div>
                <div style={styles.timesGrid}>
                  {timeSlots.map(t => (
                    <div key={t} onClick={() => setSelectedTime(t)}
                      style={{ ...styles.timeSlot, ...(selectedTime === t ? styles.timeSlotSelected : {}) }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.btnRow}>
              <button style={styles.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button style={{ ...styles.btnPrimary, ...(selectedDate && selectedTime ? {} : styles.btnDisabled) }}
                onClick={() => selectedDate && selectedTime && setStep(3)} disabled={!selectedDate || !selectedTime}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div style={styles.body}>
            <div style={styles.summaryBar}>
              <span>{services.find(s=>s.id===selectedService)?.name}</span>
              <span style={styles.dot}>·</span>
              <span>{monthNames[currentMonth]} {selectedDate}</span>
              <span style={styles.dot}>·</span>
              <span>{selectedTime}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name *</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jane Smith" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email Address *</label>
              <input style={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@example.com" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Notes (optional)</label>
              <textarea style={{ ...styles.input, ...styles.textarea }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Anything we should know..." />
            </div>
            <div style={styles.btnRow}>
              <button style={styles.btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button style={{ ...styles.btnPrimary, ...(form.name && form.email ? {} : styles.btnDisabled) }}
                onClick={handleConfirm} disabled={!form.name || !form.email}>
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Georgia', serif" },
  card: { background: "#161616", border: "1px solid #2a2a2a", borderRadius: "2px", width: "100%", maxWidth: "480px", overflow: "hidden" },
  header: { padding: "28px 32px 20px", borderBottom: "1px solid #222" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  brand: { fontSize: "11px", letterSpacing: "4px", color: "#c9a96e", fontFamily: "monospace" },
  steps: { display: "flex", gap: "8px" },
  stepDot: { width: "24px", height: "24px", borderRadius: "50%", background: "#222", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#555", fontFamily: "monospace" },
  stepActive: { background: "#c9a96e", border: "1px solid #c9a96e", color: "#0e0e0e", fontWeight: "bold" },
  title: { fontSize: "22px", color: "#f0ece4", margin: 0, fontWeight: "normal", letterSpacing: "-0.3px" },
  body: { padding: "24px 32px 32px" },
  serviceGrid: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  serviceCard: { padding: "16px 20px", border: "1px solid #252525", borderRadius: "2px", cursor: "pointer", position: "relative", transition: "all 0.15s", background: "#1a1a1a" },
  serviceSelected: { border: "1px solid #c9a96e", background: "#1e1b14" },
  serviceName: { fontSize: "15px", color: "#e8e4dc", marginBottom: "4px" },
  serviceMeta: { fontSize: "12px", color: "#666", fontFamily: "monospace" },
  checkmark: { position: "absolute", top: "16px", right: "16px", color: "#c9a96e", fontSize: "14px" },
  calendarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  calNav: { background: "none", border: "1px solid #2a2a2a", color: "#aaa", cursor: "pointer", width: "32px", height: "32px", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" },
  monthLabel: { fontSize: "14px", color: "#c9a96e", fontFamily: "monospace", letterSpacing: "1px" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "20px" },
  dayLabel: { textAlign: "center", fontSize: "10px", color: "#444", padding: "4px 0", fontFamily: "monospace" },
  dayCell: { textAlign: "center", fontSize: "13px", padding: "8px 4px", borderRadius: "2px", cursor: "pointer", transition: "all 0.1s" },
  dayCellActive: { color: "#c8c4bc", border: "1px solid transparent" },
  dayCellDisabled: { color: "#333", cursor: "default" },
  dayCellSelected: { background: "#c9a96e", color: "#0e0e0e", fontWeight: "bold" },
  timesLabel: { fontSize: "11px", color: "#555", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "10px", textTransform: "uppercase" },
  timesGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "24px" },
  timeSlot: { padding: "8px 4px", textAlign: "center", fontSize: "12px", border: "1px solid #252525", borderRadius: "2px", cursor: "pointer", color: "#999", fontFamily: "monospace", transition: "all 0.1s" },
  timeSlotSelected: { border: "1px solid #c9a96e", background: "#1e1b14", color: "#c9a96e" },
  summaryBar: { background: "#1a1a1a", border: "1px solid #222", padding: "12px 16px", borderRadius: "2px", marginBottom: "20px", fontSize: "12px", color: "#888", fontFamily: "monospace", display: "flex", gap: "8px", flexWrap: "wrap" },
  dot: { color: "#444" },
  formGroup: { marginBottom: "16px" },
  formLabel: { display: "block", fontSize: "11px", color: "#555", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", background: "#1a1a1a", border: "1px solid #252525", borderRadius: "2px", padding: "10px 12px", color: "#e0dcd4", fontSize: "14px", fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box" },
  textarea: { height: "80px", resize: "vertical" },
  btnRow: { display: "flex", gap: "10px", marginTop: "8px" },
  btnPrimary: { flex: 1, padding: "12px", background: "#c9a96e", border: "none", color: "#0e0e0e", fontSize: "13px", fontFamily: "monospace", letterSpacing: "1px", cursor: "pointer", borderRadius: "2px", fontWeight: "bold" },
  btnSecondary: { padding: "12px 16px", background: "none", border: "1px solid #2a2a2a", color: "#666", fontSize: "13px", fontFamily: "monospace", cursor: "pointer", borderRadius: "2px" },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  successIcon: { textAlign: "center", fontSize: "32px", color: "#c9a96e", padding: "40px 0 16px" },
  successTitle: { textAlign: "center", fontSize: "22px", color: "#f0ece4", fontWeight: "normal", margin: "0 0 28px" },
  successDetails: { margin: "0 32px 24px", borderTop: "1px solid #1e1e1e", borderBottom: "1px solid #1e1e1e", padding: "16px 0" },
  detail: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a" },
  label: { fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "2px" },
  value: { fontSize: "13px", color: "#c8c4bc" },
  successNote: { textAlign: "center", fontSize: "12px", color: "#555", fontFamily: "monospace", margin: "0 32px 24px" },
};