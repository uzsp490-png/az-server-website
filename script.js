const glow = document.querySelector(".cursor-glow");
document.addEventListener("mousemove", (e) => {
  if (!glow) return;
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
}

document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => navLinks?.classList.remove("open"));
});

function pad(num) {
  return String(num).padStart(2, "0");
}

let seconds = 5542;

function updateTimers() {
  seconds--;
  if (seconds < 0) seconds = 6 * 60 * 60;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const text = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const t1 = document.getElementById("restartTimer");
  const t2 = document.getElementById("restartTimer2");
  if (t1) t1.textContent = text;
  if (t2) t2.textContent = text;
}

setInterval(updateTimers, 1000);

setInterval(() => {
  const el = document.getElementById("onlinePlayers");
  if (!el) return;
  const current = 38 + Math.floor(Math.random() * 14);
  el.textContent = `${current} / 80`;
}, 6000);
