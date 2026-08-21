const menu=document.getElementById("menuBtn"),nav=document.getElementById("navLinks");menu?.addEventListener("click",()=>nav?.classList.toggle("open"));const page=(location.pathname.split("/").pop()||"index.html").replace(".html","");document.querySelectorAll(".nav-actions a[data-page]").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});function pad(n){return String(n).padStart(2,"0")}let secs=5542;setInterval(()=>{secs--;if(secs<0)secs=21600;const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;const e=document.getElementById("restart");if(e)e.textContent=`${pad(h)}:${pad(m)}:${pad(s)}`},1000);setInterval(()=>{const e=document.getElementById("players");if(e)e.textContent=`${38+Math.floor(Math.random()*13)} / 80`},7000);











/* =========================================================
   AZ V7.20 — REAL HOMEPAGE ANNOUNCEMENT
   規章優先 → 福利公告 → 正常網站
   ========================================================= */
(() => {
  const cfg = window.AZ_ANNOUNCEMENT || {};
  const modal = document.getElementById("announcementModal");
  if (!modal || cfg.enabled === false) return;

  const badge = document.getElementById("announcementBadge");
  const title = document.getElementById("announcementTitle");
  const date = document.getElementById("announcementDate");
  const content = document.getElementById("announcementContent");
  const primary = document.getElementById("announcementPrimary");
  const discord = document.getElementById("announcementDiscord");
  const close = document.getElementById("announcementClose");
  const todayBox = document.getElementById("todayHideAnnouncement");

  const version = cfg.version || "default";
  const onceKey = "az_announcement_seen_" + version;
  const today = new Date();
  const todayKey = "az_announcement_hide_" + version + "_" +
    today.getFullYear() + "-" +
    String(today.getMonth()+1).padStart(2,"0") + "-" +
    String(today.getDate()).padStart(2,"0");

  const hiddenToday = localStorage.getItem(todayKey) === "1";
  const seenVersion = localStorage.getItem(onceKey) === "1";

  let shouldShow = !hiddenToday;
  if (cfg.showMode === "once_per_version") shouldShow = shouldShow && !seenVersion;

  if (badge) badge.textContent = cfg.badge || "SERVER ANNOUNCEMENT";
  if (title) title.textContent = cfg.title || "ASHZONE 伺服器公告";
  if (date) date.textContent = cfg.date || "";
  if (content) content.innerHTML = cfg.content || "";
  if (primary) primary.textContent = cfg.primaryButtonText || "我知道了";

  if (discord) {
    discord.textContent = cfg.discordButtonText || "前往 Discord";
    discord.href = cfg.discordUrl || "#";
    discord.style.display = (!cfg.discordUrl || cfg.discordUrl === "#") ? "none" : "";
  }

  function lockPage(){
    document.documentElement.classList.add("az-announcement-locked");
    document.body.classList.add("az-announcement-locked");
  }

  function unlockPage(){
    document.documentElement.classList.remove("az-announcement-locked");
    document.body.classList.remove("az-announcement-locked");
  }

  function show(){
    if (!shouldShow) return;
    // Rules gate always wins.
    if (window.AZ_RULES_GATE_SHOULD_SHOW &&
        document.getElementById("azRulesModal")?.classList.contains("show")) {
      return;
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    lockPage();
  }

  function dismiss(){
    if (todayBox?.checked) localStorage.setItem(todayKey,"1");
    if (cfg.showMode === "once_per_version") localStorage.setItem(onceKey,"1");

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    unlockPage();
  }

  primary?.addEventListener("click", dismiss);
  close?.addEventListener("click", dismiss);

  // Don't close by clicking the dark background: prevent accidental dismissals.
  modal.querySelector(".announcement-backdrop")?.addEventListener("click", e => {
    e.preventDefault();
  });

  // If rules must be confirmed first, wait for that event.
  if (window.AZ_RULES_GATE_SHOULD_SHOW) {
    window.addEventListener("az:rules-accepted", () => {
      setTimeout(show,180);
    }, {once:true});
  } else {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", () => setTimeout(show,50), {once:true});
    else
      setTimeout(show,50);
  }
})();
