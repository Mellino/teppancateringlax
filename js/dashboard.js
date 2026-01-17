// =============================
// Supabase setup (same as login.js)
// =============================
const SUPABASE_URL = "https://klcwedkaivpppedltfdx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3dlZGthaXZwcHBlZGx0ZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjcwMDUsImV4cCI6MjA4MjMwMzAwNX0.Ll5_OJMgJ1vH4mL5KL9PETi7TVBcdTbwFVz8ARV08WY"; 
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.getElementById("status");

function setStatus(msg, type=""){
  if (!statusEl) return;
  statusEl.textContent = msg || "";
  statusEl.classList.remove("error","success");
  if (type) statusEl.classList.add(type);
}

// Protect page (redirect if not logged in)
async function protectDashboard(){
  const { data, error } = await sb.auth.getSession();

  if (error || !data?.session){
    window.location.href = "login.html";
    return;
  }

  const email = data.session.user?.email || "Unknown";
  if (userEmail) userEmail.textContent = email;
}

protectDashboard();

// Logout
if (logoutBtn){
  logoutBtn.addEventListener("click", async () => {
    setStatus("");
    const { error } = await sb.auth.signOut();
    if (error){
      setStatus(error.message || "Could not log out.", "error");
      return;
    }
    setStatus("Logged out. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
  });
}
