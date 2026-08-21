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


/* =========================================================
   AZ V7.21 — STALE LOCK / COMPACT NAV CLICK SAFETY
   ========================================================= */
(() => {
  function reconcileLocks(){
    const rulesVisible = document.getElementById("azRulesModal")?.classList.contains("show");
    const annVisible = document.getElementById("announcementModal")?.classList.contains("show");

    if(!rulesVisible){
      document.documentElement.classList.remove("az-rules-locked");
    }
    if(!annVisible){
      document.documentElement.classList.remove("az-announcement-locked");
      document.body.classList.remove("az-announcement-locked");
    }
  }

  function wireCompactNav(){
    const menuBtn=document.getElementById("mobileMenu");
    const nav=document.getElementById("navLinks");
    if(!menuBtn || !nav) return;

    menuBtn.style.pointerEvents="auto";
    nav.style.pointerEvents="auto";

    nav.querySelectorAll("a").forEach(a=>{
      a.style.pointerEvents="auto";
      a.addEventListener("click",()=>{
        nav.classList.remove("open");
      });
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{
      reconcileLocks();
      wireCompactNav();
      setTimeout(reconcileLocks,300);
    },{once:true});
  }else{
    reconcileLocks();
    wireCompactNav();
    setTimeout(reconcileLocks,300);
  }

  window.addEventListener("resize",reconcileLocks);
})();


/* AZ V7.22 — nav breakpoint cleanup */
(() => {
  const nav=document.getElementById("navLinks");
  if(!nav) return;

  let lastCompact=window.innerWidth<=1600;
  window.addEventListener("resize",()=>{
    const compact=window.innerWidth<=1600;
    if(compact!==lastCompact){
      nav.classList.remove("open");
      lastCompact=compact;
    }
  });
})();


/* =========================================================
   AZ V7.23 — AUTHORITATIVE SOUND BUTTON
   One handler only; desktop + mobile.
   ========================================================= */
(() => {
  function initAzSound(){
    const video=document.getElementById("azHeroVideo");
    const btn=document.getElementById("azHeroSoundToggle");
    const icon=document.getElementById("azHeroSoundIcon");
    if(!video || !btn) return;

    /* prevent older listeners from surviving if browser cached DOM */
    const cleanBtn=btn.cloneNode(true);
    btn.replaceWith(cleanBtn);

    const button=document.getElementById("azHeroSoundToggle");
    const soundIcon=document.getElementById("azHeroSoundIcon");

    const saved=localStorage.getItem("az_video_sound");
    let wantsSound=saved===null ? true : saved==="on";

    video.controls=false;
    video.loop=true;
    video.autoplay=true;
    video.playsInline=true;

    function render(){
      if(soundIcon) soundIcon.textContent=video.muted ? "🔇" : "🔊";
      button.setAttribute("aria-pressed",video.muted ? "false" : "true");
      button.setAttribute("aria-label",video.muted ? "開啟背景音效" : "關閉背景音效");
      button.title=video.muted ? "開啟背景音效" : "關閉背景音效";
      button.disabled=false;
      button.style.pointerEvents="auto";
    }

    async function applyWanted(){
      video.muted=!wantsSound;
      try{
        await video.play();
      }catch(e){
        /* autoplay with sound may be blocked; keep preference ON,
           but start muted until user explicitly taps the sound button */
        video.muted=true;
        try{ await video.play(); }catch(_){}
      }
      render();
    }

    button.addEventListener("pointerup",async e=>{
      e.preventDefault();
      e.stopPropagation();

      wantsSound=video.muted;
      video.muted=!wantsSound;

      localStorage.setItem("az_video_sound",wantsSound ? "on" : "off");

      try{
        await video.play();
      }catch(_){}

      render();
    });

    applyWanted();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initAzSound,{once:true});
  }else{
    initAzSound();
  }
})();




/* =========================================================
   AZ V7.25 — SUPPORT FAB FINAL CLICK HANDLER
   Only real visible modals can block it.
   ========================================================= */
(() => {
  function initSupportFabV725(){
    const btn=document.getElementById("supportFab");
    const pop=document.getElementById("supportPopover");
    const close=document.getElementById("supportPopoverClose");
    if(!btn || !pop) return;

    function visible(el){
      if(!el) return false;
      if(!el.classList.contains("show")) return false;
      const cs=getComputedStyle(el);
      return cs.display!=="none" && cs.visibility!=="hidden" && cs.opacity!=="0";
    }

    function blockingModalOpen(){
      return visible(document.getElementById("azRulesModal")) ||
             visible(document.getElementById("announcementModal"));
    }

    function clearStaleLocks(){
      if(!visible(document.getElementById("azRulesModal"))){
        document.documentElement.classList.remove("az-rules-locked");
      }
      if(!visible(document.getElementById("announcementModal"))){
        document.documentElement.classList.remove("az-announcement-locked");
        document.body.classList.remove("az-announcement-locked");
      }
    }

    function openPop(){
      clearStaleLocks();
      if(blockingModalOpen()) return;
      pop.classList.add("show");
      pop.setAttribute("aria-hidden","false");
    }

    function closePop(){
      pop.classList.remove("show");
      pop.setAttribute("aria-hidden","true");
    }

    // Use capturing CLICK so hero/overlay layers cannot swallow it.
    btn.addEventListener("click",e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      pop.classList.contains("show") ? closePop() : openPop();
    },true);

    close?.addEventListener("click",e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      closePop();
    },true);

    document.addEventListener("click",e=>{
      if(!pop.classList.contains("show")) return;
      if(pop.contains(e.target) || btn.contains(e.target)) return;
      closePop();
    });

    btn.style.pointerEvents="auto";
    btn.style.cursor="pointer";
    pop.querySelectorAll("a,button").forEach(el=>{
      el.style.pointerEvents="auto";
      el.style.cursor="pointer";
    });

    clearStaleLocks();
    setTimeout(clearStaleLocks,300);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initSupportFabV725,{once:true});
  }else{
    initSupportFabV725();
  }
})();
