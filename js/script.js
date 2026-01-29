const $ = (id) => document.getElementById(id);

function sanitize(str) {
  return String(str || "").replace(/[<>]/g, "");
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function show(el, yes) {
  if (!el) return;
  el.classList.toggle("hidden", !yes);
  // untuk modal: juga set flex biar center
  if (el.id === "welcomeModal") {
    el.classList.toggle("flex", yes);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDigitsOnly(s) {
  return /^[0-9]+$/.test(s);
}

document.addEventListener("DOMContentLoaded", () => {
  // year
  const yearEl = $("yearNow");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile menu
  const btnMobile = $("btnMobile");
  const mobileMenu = $("mobileMenu");
  if (btnMobile && mobileMenu) {
    btnMobile.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // ===== Welcome once (Modal) =====
  const KEY = "riceSolutionVisitorName";

  const greetName = $("greetName");
  const welcomeModal = $("welcomeModal");
  const welcomeName = $("welcomeName");
  const btnWelcomeSave = $("btnWelcomeSave");
  const welcomeError = $("welcomeError");

  function applyName(name) {
    if (greetName) greetName.textContent = name ? sanitize(name) : "Guest";
  }

  const savedName = localStorage.getItem(KEY);

  if (!savedName) {
    // first time open → show modal
    show(welcomeModal, true);
    if (welcomeName) welcomeName.focus();
  } else {
    applyName(savedName);
  }

  if (btnWelcomeSave) {
  btnWelcomeSave.addEventListener("click", () => {
    setText("welcomeError", "");

    const raw = sanitize(welcomeName?.value).trim();
    const name = raw ? raw : "Guest";

    localStorage.setItem(KEY, name);
    applyName(name);
    show(welcomeModal, false);
  });
}

  // Reset name button (biar bisa munculin modal lagi)
  const btnResetName = $("btnResetName");
  if (btnResetName) {
    btnResetName.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      applyName("");
      // munculin modal lagi
      if (welcomeName) welcomeName.value = "";
      setText("welcomeError", "");
      show(welcomeModal, true);
      if (welcomeName) welcomeName.focus();
    });
  }

  // ===== Form Validation + Output =====
  const form = $("contactForm");
  const btnReset = $("btnReset");
  const statusBadge = $("statusBadge");
  const messageLog = $("messageLog");

  const logItems = [];

  function clearErrors() {
    setText("eName", "");
    setText("eEmail", "");
    setText("ePhone", "");
    setText("eMessage", "");
  }

  function setOutput(data) {
    setText("oName", data.name || "-");
    setText("oEmail", data.email || "-");
    setText("oPhone", data.phone || "-");
    setText("oMessage", data.message || "-");
  }

  function renderLog() {
    if (!messageLog) return;

    if (logItems.length === 0) {
      messageLog.innerHTML = `<p class="text-slate-500">Belum ada pesan masuk.</p>`;
      return;
    }

    messageLog.innerHTML = logItems
      .slice()
      .reverse()
      .map((item) => `
        <div class="rounded-2xl border border-black/10 bg-white p-3">
          <p class="font-extrabold">${sanitize(item.name)} <span class="text-slate-400 font-bold">•</span> <span class="text-slate-600">${sanitize(item.phone)}</span></p>
          <p class="text-slate-600">${sanitize(item.email)}</p>
          <p class="mt-2">${sanitize(item.message)}</p>
          <p class="mt-2 text-xs text-slate-400">${sanitize(item.time)}</p>
        </div>
      `)
      .join("");
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const name = sanitize($("fName")?.value).trim();
      const email = sanitize($("fEmail")?.value).trim();
      const phone = sanitize($("fPhone")?.value).trim();
      const message = sanitize($("fMessage")?.value).trim();

      let ok = true;

      if (!name) { setText("eName", "Name wajib diisi."); ok = false; }

      if (!email) { setText("eEmail", "Email wajib diisi."); ok = false; }
      else if (!isValidEmail(email)) { setText("eEmail", "Format email tidak valid."); ok = false; }

      if (!phone) { setText("ePhone", "Phone number wajib diisi."); ok = false; }
      else if (!isDigitsOnly(phone)) { setText("ePhone", "Phone number harus angka saja."); ok = false; }
      else if (phone.length < 10 || phone.length > 13) { setText("ePhone", "Panjang 10–13 digit."); ok = false; }

      if (!message) { setText("eMessage", "Message wajib diisi."); ok = false; }
      else if (message.length < 10) { setText("eMessage", "Minimal 10 karakter."); ok = false; }

      if (!ok) {
        show(statusBadge, false);
        return;
      }

      setOutput({ name, email, phone, message });
      show(statusBadge, true);

      const time = new Date().toLocaleString("id-ID");
      logItems.push({ name, email, phone, message, time });
      renderLog();

      form.reset();
    });
  }

  if (btnReset && form) {
    btnReset.addEventListener("click", () => {
      form.reset();
      clearErrors();
      setOutput({ name: "-", email: "-", phone: "-", message: "-" });
      show(statusBadge, false);
    });
  }

  renderLog();
});
