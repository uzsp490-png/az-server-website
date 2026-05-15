function pad(num) {
  return String(num).padStart(2, "0");
}

let seconds = 5542;

function tickRestart() {
  seconds--;
  if (seconds < 0) seconds = 6 * 60 * 60;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const el = document.getElementById("restartTimer");
  if (el) el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

setInterval(tickRestart, 1000);

setInterval(() => {
  const el = document.getElementById("onlinePlayers");
  if (!el) return;
  const current = 38 + Math.floor(Math.random() * 12);
  el.textContent = `${current} / 80`;
}, 6000);
