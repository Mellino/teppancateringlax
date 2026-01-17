// =============================
// Supabase setup
// =============================
const SUPABASE_URL = "https://klcwedkaivpppedltfdx.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3dlZGthaXZwcHBlZGx0ZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjcwMDUsImV4cCI6MjA4MjMwMzAwNX0.Ll5_OJMgJ1vH4mL5KL9PETi7TVBcdTbwFVz8ARV08WY"; 
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI elements
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const statusBox = document.getElementById("statusBox");

const togglePass = document.getElementById("togglePass");
const forgotLink = document.getElementById("forgotLink");

// Show / hide password
if (togglePass && passInput) {
  togglePass.addEventListener("click", () => {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";
    togglePass.textContent = isHidden ? "Hide" : "Show";
  });
}

// Helpers
function setStatus(msg, type = "") {
  statusBox.textContent = msg || "";
  statusBox.classList.remove("error", "success");
  if (type) statusBox.classList.add(type);
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Logging in..." : "Login";
}

// Handle login
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    const email = (emailInput?.value || "").trim();
    const password = passInput?.value || "";

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });

      if (error) {
        setStatus(error.message || "Login failed.", "error");
        setLoading(false);
        return;
      }

      setStatus("✅ Logged in successfully! Redirecting...", "success");

      // Redirect wherever you want employees to go after login:
      setTimeout(() => {
        window.location.href = "dashboard.html"; // change this later
      }, 900);

    } catch (err) {
      setStatus("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  });
}

// Forgot password (Supabase reset email)
if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    setStatus("");

    const email = (emailInput?.value || "").trim();
    if (!email) {
      setStatus("Enter your email first, then click Forgot password.", "error");
      return;
    }

    try {
      // You must set your redirect URL in Supabase Auth settings
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/Pages/login.html"
      });

      if (error) {
        setStatus(error.message || "Could not send reset email.", "error");
        return;
      }

      setStatus("📩 Password reset email sent. Check your inbox.", "success");
    } catch {
      setStatus("Could not send reset email. Try again.", "error");
    }
  });
}
