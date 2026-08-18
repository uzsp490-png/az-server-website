const menu=document.getElementById("menuBtn"),nav=document.getElementById("navLinks");menu?.addEventListener("click",()=>nav?.classList.toggle("open"));const page=(location.pathname.split("/").pop()||"index.html").replace(".html","");document.querySelectorAll(".nav-actions a[data-page]").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});function pad(n){return String(n).padStart(2,"0")}let secs=5542;setInterval(()=>{secs--;if(secs<0)secs=21600;const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;const e=document.getElementById("restart");if(e)e.textContent=`${pad(h)}:${pad(m)}:${pad(s)}`},1000);setInterval(()=>{const e=document.getElementById("players");if(e)e.textContent=`${38+Math.floor(Math.random()*13)} / 80`},7000);

/* AZ V4.2 current navigation highlight */
(() => {
  const current = (location.pathname.split("/").pop() || "index.html")
    .replace(".html","")
    .toLowerCase();
  document.querySelectorAll(".topnav .nav-actions a[data-page]").forEach(a => {
    if ((a.dataset.page || "").toLowerCase() === current) {
      a.classList.add("active");
    }
  });
})();














/* AZ V4.8 — simple persistent sound switch for current page */
(() => {
  const video = document.querySelector(".hero-video");
  const btn = document.getElementById("soundToggle");
  const label = document.getElementById("soundLabel");
  const symbol = document.getElementById("soundSymbol");
  if (!video || !btn || !label) return;

  video.muted = true;
  video.loop = true;

  const render = () => {
    const on = !video.muted;
    btn.classList.toggle("audio-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "關閉影片聲音" : "開啟影片聲音");
    label.textContent = on ? "聲音 ON" : "聲音 OFF";
    if (symbol) symbol.textContent = on ? "🔊" : "🔇";
  };

  btn.addEventListener("click", async () => {
    video.muted = !video.muted;
    try { await video.play(); } catch(e) {}
    render();
  });

  render();
})();

/* AZ V4.8 — configurable entry announcement */
(() => {
  const cfg = window.AZ_ANNOUNCEMENT || {};
  const modal = document.getElementById("announcementModal");
  if (!modal || cfg.enabled === false) return;

  const storageKey = "az_announcement_seen_" + (cfg.version || "default");
  const shouldShow =
    cfg.showMode === "once_per_version"
      ? localStorage.getItem(storageKey) !== "1"
      : true;

  if (!shouldShow) return;

  const badge = document.getElementById("announcementBadge");
  const title = document.getElementById("announcementTitle");
  const date = document.getElementById("announcementDate");
  const content = document.getElementById("announcementContent");
  const primary = document.getElementById("announcementPrimary");
  const discord = document.getElementById("announcementDiscord");
  const close = document.getElementById("announcementClose");

  if (badge) badge.textContent = cfg.badge || "SERVER ANNOUNCEMENT";
  if (title) title.textContent = cfg.title || "ASHZONE 伺服器公告";
  if (date) date.textContent = cfg.date || "";
  if (content) content.innerHTML = cfg.content || "";
  if (primary) primary.textContent = cfg.primaryButtonText || "我知道了";

  if (discord) {
    discord.textContent = cfg.discordButtonText || "前往 Discord";
    discord.href = cfg.discordUrl || "#";
    if (!cfg.discordUrl || cfg.discordUrl === "#") {
      discord.style.display = "none";
    }
  }

  const dismiss = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (cfg.showMode === "once_per_version") {
      localStorage.setItem(storageKey, "1");
    }
  };

  primary?.addEventListener("click", dismiss);
  close?.addEventListener("click", dismiss);
  modal.querySelector(".announcement-backdrop")?.addEventListener("click", dismiss);

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
})();
