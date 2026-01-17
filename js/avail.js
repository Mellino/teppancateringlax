/* =========================================
   Availability (color-only)
   Defaults:
     Fri/Sat/Sun -> GREEN (available)
     Mon–Thu     -> YELLOW (pending)
   Tap a date to toggle:
     pending -> available
     available -> unavailable
     unavailable -> available
========================================= */

const SUPABASE_URL = "https://klcwedkaivpppedltfdx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3dlZGthaXZwcHBlZGx0ZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjcwMDUsImV4cCI6MjA4MjMwMzAwNX0.Ll5_OJMgJ1vH4mL5KL9PETi7TVBcdTbwFVz8ARV08WY"; 

// Your Supabase table
const TABLE = "business_availability";
const COL_DATE = "day";
const COL_AVAILABLE = "is_available";
const COL_NOTE = "note";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI
const monthTitle = document.getElementById("monthTitle");
const monthGrid = document.getElementById("monthGrid");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const btnToday = document.getElementById("btnToday");
const btnClearMonth = document.getElementById("btnClearMonth");
const dbStatus = document.getElementById("dbStatus");
const dbDot = document.getElementById("dbDot");

let cursor = new Date();
cursor.setDate(1);

let selectedKey = null;

// DB overrides map: yyyy-mm-dd -> { is_available: bool, note: string }
let overrides = new Map();

/* ---------- helpers ---------- */
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthLabel(d) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function startDow(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay(); // 0 Sun
}

/* ---------- default rule ---------- */
/**
 * Default status:
 * - Fri/Sat/Sun = available (green)
 * - Mon–Thu = pending (yellow)
 */
function defaultStatus(dateObj) {
  const dow = dateObj.getDay();
  if (dow === 0 || dow === 5 || dow === 6) return "available";
  return "pending";
}

/**
 * Returns: "available" | "unavailable" | "pending"
 * If there is a DB override row, it becomes available/unavailable.
 * If not, it uses defaultStatus().
 */
function statusFor(dateObj) {
  const key = ymd(dateObj);

  if (overrides.has(key)) {
    return overrides.get(key).is_available ? "available" : "unavailable";
  }

  return defaultStatus(dateObj);
}

function setDbStatus(text, state) {
  dbStatus.textContent = text;
  dbDot.classList.remove("ok", "bad");
  if (state === "ok") dbDot.classList.add("ok");
  if (state === "bad") dbDot.classList.add("bad");
}

/* ---------- DB ---------- */
async function loadMonth() {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const startKey = ymd(start);
  const endKey = ymd(end);

  setDbStatus("Loading…", null);

  const { data, error } = await sb
    .from(TABLE)
    .select(`${COL_DATE}, ${COL_AVAILABLE}, ${COL_NOTE}`)
    .gte(COL_DATE, startKey)
    .lt(COL_DATE, endKey);

  if (error) {
    console.error(error);
    setDbStatus("DB error (check console)", "bad");
    return;
  }

  overrides = new Map();
  (data || []).forEach((row) => {
    overrides.set(row[COL_DATE], {
      is_available: !!row[COL_AVAILABLE],
      note: row[COL_NOTE] || "",
    });
  });

  setDbStatus("Synced ✅", "ok");
  render();
}

/* ---------- render ---------- */
function render() {
  monthTitle.textContent = monthLabel(cursor);
  monthGrid.innerHTML = "";

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const padStart = startDow(year, month);
  const totalDays = daysInMonth(year, month);

  // leading muted blanks (prev month days)
  const prevMonthIdx = month - 1 < 0 ? 11 : month - 1;
  const prevYear = month - 1 < 0 ? year - 1 : year;
  const prevMonthDays = daysInMonth(prevYear, prevMonthIdx);

  for (let i = 0; i < padStart; i++) {
    const dayNum = prevMonthDays - (padStart - 1 - i);
    const cell = document.createElement("div");
    cell.className = "day muted";
    cell.innerHTML = `<div class="num">${dayNum}</div>`;
    monthGrid.appendChild(cell);
  }

  // current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const key = ymd(d);
    const state = statusFor(d); // available | unavailable | pending

    const cell = document.createElement("div");
    cell.className = "day";
    cell.classList.add(state);
    if (selectedKey === key) cell.classList.add("selected");

    cell.innerHTML = `<div class="num">${day}</div>`;

    cell.addEventListener("click", async () => {
      selectedKey = key;

      // Toggle rules:
      // pending -> available
      // available -> unavailable
      // unavailable -> available
      const current = statusFor(d);
      let next;
      if (current === "pending") next = "available";
      else if (current === "available") next = "unavailable";
      else next = "available";

      setDbStatus("Saving…", null);

      // Save override row to DB (requires COL_DATE unique for onConflict)
      const payload = {
        [COL_DATE]: key,
        [COL_AVAILABLE]: next === "available",
        [COL_NOTE]: "",
      };

      const { error } = await sb.from(TABLE).upsert(payload, { onConflict: COL_DATE });

      if (error) {
        console.error(error);
        setDbStatus("Save failed", "bad");
        return;
      }

      overrides.set(key, { is_available: next === "available", note: "" });
      setDbStatus("Saved ✅", "ok");
      render();
    });

    monthGrid.appendChild(cell);
  }

  // trailing blanks (next month days)
  const totalCells = padStart + totalDays;
  const trailing = (7 - (totalCells % 7)) % 7;

  for (let i = 0; i < trailing; i++) {
    const cell = document.createElement("div");
    cell.className = "day muted";
    cell.innerHTML = `<div class="num">${i + 1}</div>`;
    monthGrid.appendChild(cell);
  }
}

/* ---------- controls ---------- */
prevMonth.addEventListener("click", async () => {
  cursor.setMonth(cursor.getMonth() - 1);
  await loadMonth();
});

nextMonth.addEventListener("click", async () => {
  cursor.setMonth(cursor.getMonth() + 1);
  await loadMonth();
});

btnToday.addEventListener("click", async () => {
  cursor = new Date();
  cursor.setDate(1);
  selectedKey = ymd(new Date());
  await loadMonth();
});

btnClearMonth.addEventListener("click", async () => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startKey = ymd(new Date(year, month, 1));
  const endKey = ymd(new Date(year, month + 1, 1));

  if (!confirm("Clear THIS month overrides? It will reset to default colors.")) return;

  setDbStatus("Clearing…", null);

  const { error } = await sb
    .from(TABLE)
    .delete()
    .gte(COL_DATE, startKey)
    .lt(COL_DATE, endKey);

  if (error) {
    console.error(error);
    setDbStatus("Clear failed", "bad");
    return;
  }

  overrides = new Map();
  setDbStatus("Cleared ✅", "ok");
  render();
});



/* ---------- init ---------- */
(async function init() {
  try {
    setDbStatus("Connecting…", null);
    await loadMonth();
  } catch (e) {
    console.error(e);
    setDbStatus("Init failed", "bad");
  }
})();


