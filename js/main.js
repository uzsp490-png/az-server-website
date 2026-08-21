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


/* AZ V5.0 global support widget */
(() => {
  const cfg = window.AZ_SUPPORT || {};
  const fab = document.getElementById("supportFab");
  const pop = document.getElementById("supportPopover");
  const close = document.getElementById("supportPopoverClose");

  const line = document.getElementById("globalLine");
  const discord = document.getElementById("globalDiscord");
  if(line) line.href = cfg.lineUrl || "#";
  if(discord) discord.href = cfg.discordUrl || "#";

  fab?.addEventListener("click",e=>{
    e.stopPropagation();
    pop?.classList.toggle("open");
  });
  close?.addEventListener("click",()=>pop?.classList.remove("open"));
  document.addEventListener("click",e=>{
    if(pop?.classList.contains("open") && !pop.contains(e.target) && !fab?.contains(e.target)){
      pop.classList.remove("open");
    }
  });
})();


/* =========================================================
   AZ V7.5 — 首頁公告「今日不再顯示」
   ========================================================= */
(() => {
  const KEY = "az_announcement_hide_date";

  function todayKey(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,"0");
    const day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  function getAnnouncementModal(){
    return document.querySelector(
      "#announcementModal, #noticeModal, .announcement-modal, .home-announcement, .announcement-popup"
    );
  }

  function hideModal(modal){
    if(!modal) return;
    modal.classList.remove("show","open","active");
    modal.style.display="none";
    modal.setAttribute("aria-hidden","true");
  }

  function shouldHideToday(){
    return localStorage.getItem(KEY) === todayKey();
  }

  function storeTodayIfChecked(){
    const cb=document.getElementById("todayHideAnnouncement");
    if(cb?.checked){
      localStorage.setItem(KEY,todayKey());
    }
  }

  function setup(){
    if(location.pathname !== "/" && !location.pathname.endsWith("/index.html")) return;

    const modal=getAnnouncementModal();
    if(!modal) return;

    if(shouldHideToday()){
      hideModal(modal);
      return;
    }

    // Ensure checkbox exists even if the HTML structure changed.
    let cb=document.getElementById("todayHideAnnouncement");
    if(!cb){
      const actionArea =
        modal.querySelector(".announcement-actions, .modal-actions, .notice-actions, .announcement-footer") ||
        modal.querySelector("button")?.parentElement;

      if(actionArea){
        const label=document.createElement("label");
        label.className="announcement-today-hide";
        label.innerHTML='<input type="checkbox" id="todayHideAnnouncement"><span>今日不再顯示此公告</span>';
        actionArea.insertBefore(label,actionArea.firstChild);
        cb=document.getElementById("todayHideAnnouncement");
      }
    }

    modal.querySelectorAll("button").forEach(btn=>{
      const txt=(btn.textContent||"").trim();
      if(/我知道了|關閉|確認|確定|進入/.test(txt) || /close|confirm|ok/i.test(btn.id||"") || /close|confirm|ok/i.test(btn.className||"")){
        btn.addEventListener("click",storeTodayIfChecked);
      }
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",setup);
  }else{
    setup();
  }
})();








/* =========================================================
   AZ V7.11 — TOP-RIGHT HERO VIDEO SOUND CONTROL
   ========================================================= */
(() => {
  function initHeroSound(){
    const video=document.getElementById("azHeroVideo");
    const btn=document.getElementById("azHeroSoundToggle");
    const icon=document.getElementById("azHeroSoundIcon");
    const label=document.getElementById("azHeroSoundLabel");
    if(!video||!btn) return;

    video.controls=false;
    video.autoplay=true;
    video.loop=true;
    video.playsInline=true;

    const pref=localStorage.getItem("az_video_sound");
    video.muted=pref!=="on";

    function render(){
      if(icon) icon.textContent=video.muted?"🔇":"🔊";
      if(label) label.textContent="影片聲音";
      btn.setAttribute("aria-pressed",video.muted?"false":"true");
      btn.title=video.muted?"開啟影片聲音":"關閉影片聲音";
      btn.disabled=false;
    }

    function play(){
      video.play().catch(()=>{
        video.muted=true;
        localStorage.setItem("az_video_sound","off");
        render();
        video.play().catch(()=>{});
      });
    }

    render();
    play();

    btn.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();
      video.muted=!video.muted;
      localStorage.setItem("az_video_sound",video.muted?"off":"on");
      render();
      play();
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initHeroSound);
  else initHeroSound();
})();
