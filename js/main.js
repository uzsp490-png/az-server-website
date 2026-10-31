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

  // V7 popup action recovery: if the footer was lost from index.html, rebuild it here.
  let actions = modal.querySelector(".announcement-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "announcement-actions";
    const panel = modal.querySelector(".announcement-panel");
    if (panel) panel.appendChild(actions);
  }

  let todayBox = document.getElementById("todayHideAnnouncement");
  if (!todayBox && actions) {
    const label = document.createElement("label");
    label.className = "announcement-today-hide";
    label.innerHTML = '<input id="todayHideAnnouncement" type="checkbox"><span>今日不再顯示</span>';
    actions.appendChild(label);
    todayBox = label.querySelector("input");
  }

  let primaryRecovered = document.getElementById("announcementPrimary");
  if (!primaryRecovered && actions) {
    primaryRecovered = document.createElement("button");
    primaryRecovered.className = "announcement-primary";
    primaryRecovered.id = "announcementPrimary";
    primaryRecovered.type = "button";
    primaryRecovered.textContent = cfg.primaryButtonText || "我知道了";
    actions.appendChild(primaryRecovered);
  }

  // V8: keep the footer permanently visible even when announcement content is very long.
  // The panel becomes a flex column: header + scrollable body + fixed footer.
  const panel = modal.querySelector(".announcement-panel");
  const topLine = modal.querySelector(".announcement-topline");
  const body = modal.querySelector(".announcement-body");

  if (panel) {
    panel.style.setProperty("display", "flex", "important");
    panel.style.setProperty("flex-direction", "column", "important");
    panel.style.setProperty("width", "min(920px, calc(100vw - 28px))", "important");
    panel.style.setProperty("max-height", "calc(100vh - 32px)", "important");
    panel.style.setProperty("overflow", "hidden", "important");
  }
  if (topLine) {
    topLine.style.setProperty("flex", "0 0 auto", "important");
  }
  if (body) {
    body.style.setProperty("flex", "1 1 auto", "important");
    body.style.setProperty("min-height", "0", "important");
    body.style.setProperty("overflow-y", "auto", "important");
    body.style.setProperty("overscroll-behavior", "contain", "important");
    body.style.setProperty("scrollbar-gutter", "stable", "important");
  }
  if (actions) {
    // Move the actions to the very end of the panel in case an older template placed them elsewhere.
    if (panel && actions.parentElement !== panel) panel.appendChild(actions);
    else if (panel) panel.appendChild(actions);

    actions.style.setProperty("display", "flex", "important");
    actions.style.setProperty("flex", "0 0 auto", "important");
    actions.style.setProperty("align-items", "center", "important");
    actions.style.setProperty("justify-content", "flex-end", "important");
    actions.style.setProperty("gap", "14px", "important");
    actions.style.setProperty("flex-wrap", "wrap", "important");
    actions.style.setProperty("width", "100%", "important");
    actions.style.setProperty("box-sizing", "border-box", "important");
    actions.style.setProperty("padding", "16px 36px 20px", "important");
    actions.style.setProperty("border-top", "1px solid rgba(240,189,85,.22)", "important");
    actions.style.setProperty("background", "rgba(7,10,7,.98)", "important");
    actions.style.setProperty("position", "relative", "important");
    actions.style.setProperty("z-index", "20", "important");
    actions.style.setProperty("visibility", "visible", "important");
    actions.style.setProperty("opacity", "1", "important");
  }
  const hideLabel = actions?.querySelector(".announcement-today-hide");
  if (hideLabel) {
    hideLabel.style.setProperty("display", "inline-flex", "important");
    hideLabel.style.setProperty("align-items", "center", "important");
    hideLabel.style.setProperty("gap", "9px", "important");
    hideLabel.style.setProperty("margin-right", "auto", "important");
    hideLabel.style.setProperty("cursor", "pointer", "important");
    hideLabel.style.setProperty("color", "#d9d9d2", "important");
    hideLabel.style.setProperty("font-size", "14px", "important");
  }
  if (todayBox) {
    todayBox.style.setProperty("width", "17px", "important");
    todayBox.style.setProperty("height", "17px", "important");
    todayBox.style.setProperty("accent-color", "#d9aa32", "important");
  }

  // Force the main confirmation button to be visible regardless of older CSS.
  const footerPrimary = document.getElementById("announcementPrimary");
  if (footerPrimary) {
    footerPrimary.style.setProperty("display", "inline-flex", "important");
    footerPrimary.style.setProperty("align-items", "center", "important");
    footerPrimary.style.setProperty("justify-content", "center", "important");
    footerPrimary.style.setProperty("min-width", "118px", "important");
    footerPrimary.style.setProperty("min-height", "42px", "important");
    footerPrimary.style.setProperty("padding", "10px 22px", "important");
    footerPrimary.style.setProperty("border", "1px solid rgba(240,189,85,.55)", "important");
    footerPrimary.style.setProperty("border-radius", "10px", "important");
    footerPrimary.style.setProperty("background", "rgba(240,189,85,.13)", "important");
    footerPrimary.style.setProperty("color", "#f0bd55", "important");
    footerPrimary.style.setProperty("font-weight", "800", "important");
    footerPrimary.style.setProperty("cursor", "pointer", "important");
    footerPrimary.style.setProperty("visibility", "visible", "important");
    footerPrimary.style.setProperty("opacity", "1", "important");
  }

  // Use the recovered button when the original node was missing.
  const actualPrimary = primaryRecovered || primary;

  const version = cfg.version || "default";
  const onceKey = "az_announcement_seen_" + version;
  const today = new Date();
  const todayKey = "az_announcement_hide_" + version + "_" +
    today.getFullYear() + "-" +
    String(today.getMonth()+1).padStart(2,"0") + "-" +
    String(today.getDate()).padStart(2,"0");

  // Always begin from an unlocked state; show() will re-lock only with a real visible modal.
  document.documentElement.classList.remove("az-announcement-locked");
  document.body.classList.remove("az-announcement-locked");

  const hiddenToday = localStorage.getItem(todayKey) === "1";
  const seenVersion = localStorage.getItem(onceKey) === "1";

  let shouldShow = !hiddenToday;
  if (cfg.showMode === "once_per_version") shouldShow = shouldShow && !seenVersion;

  if (badge) badge.textContent = cfg.badge || "SERVER ANNOUNCEMENT";
  if (title) title.textContent = cfg.title || "ASHZONE 伺服器公告";
  if (date) date.textContent = cfg.date || "";
  if (content) content.innerHTML = cfg.content || "";
  if (actualPrimary) actualPrimary.textContent = cfg.primaryButtonText || "我知道了";

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

    // ANNOUNCEMENT_VISIBILITY_GUARD — if panel failed to render, remove backdrop + lock.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const panel=modal.querySelector(".announcement-panel");
      const cs=panel?getComputedStyle(panel):null;
      const r=panel?.getBoundingClientRect();
      const visible=!!panel && cs?.display!=="none" && cs?.visibility!=="hidden" && Number(cs?.opacity||1)>0 && (r?.width||0)>10 && (r?.height||0)>10;
      if(!visible){
        console.warn("ANNOUNCEMENT_VISIBILITY_GUARD: panel is not visible; releasing page lock");
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden","true");
        unlockPage();
      }
    }));
  }

  function dismiss(){
    if (todayBox?.checked) localStorage.setItem(todayKey,"1");
    if (cfg.showMode === "once_per_version") localStorage.setItem(onceKey,"1");

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    unlockPage();
  }

  actualPrimary?.addEventListener("click", dismiss);
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
   AZ V7.26 — SUPPORT FAB FINAL / AUDITED
   CSS uses .open (not .show)
   ========================================================= */
(() => {
  function initSupportFabV726(){
    const btn=document.getElementById("supportFab");
    const pop=document.getElementById("supportPopover");
    const close=document.getElementById("supportPopoverClose");

    if(!btn || !pop) return;

    function isVisibleModal(el){
      if(!el || !el.classList.contains("show")) return false;
      const cs=getComputedStyle(el);
      return cs.display!=="none" &&
             cs.visibility!=="hidden" &&
             Number(cs.opacity || "1")>0;
    }

    function blockingModalOpen(){
      return isVisibleModal(document.getElementById("azRulesModal")) ||
             isVisibleModal(document.getElementById("announcementModal"));
    }

    function clearStaleLocks(){
      if(!isVisibleModal(document.getElementById("azRulesModal"))){
        document.documentElement.classList.remove("az-rules-locked");
      }

      if(!isVisibleModal(document.getElementById("announcementModal"))){
        document.documentElement.classList.remove("az-announcement-locked");
        document.body.classList.remove("az-announcement-locked");
      }
    }

    function openPopover(){
      clearStaleLocks();
      if(blockingModalOpen()) return;

      pop.classList.add("open");
      pop.setAttribute("aria-hidden","false");
      btn.setAttribute("aria-expanded","true");
    }

    function closePopover(){
      pop.classList.remove("open");
      pop.setAttribute("aria-hidden","true");
      btn.setAttribute("aria-expanded","false");
    }

    // Normalize starting state.
    closePopover();

    btn.setAttribute("aria-expanded","false");
    btn.style.pointerEvents="auto";
    btn.style.cursor="pointer";

    // Capture phase = prevent Hero/overlay from eating the event.
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if(pop.classList.contains("open")){
        closePopover();
      }else{
        openPopover();
      }
    }, true);

    close?.addEventListener("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closePopover();
    }, true);

    document.addEventListener("click", e => {
      if(!pop.classList.contains("open")) return;
      if(pop.contains(e.target) || btn.contains(e.target)) return;
      closePopover();
    });

    // ESC closes support popover only.
    document.addEventListener("keydown", e => {
      if(e.key==="Escape" && pop.classList.contains("open")){
        closePopover();
      }
    });

    pop.querySelectorAll("a,button").forEach(el => {
      el.style.pointerEvents="auto";
    });

    clearStaleLocks();
    setTimeout(clearStaleLocks,250);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initSupportFabV726,{once:true});
  }else{
    initSupportFabV726();
  }
})();


/* =========================================================
   AZ V7.33 — NAV SCROLL STATE
   ========================================================= */
(() => {
  function initStickyTopNav(){
    const nav=document.querySelector(".topnav.v76-nav");
    if(!nav) return;

    let ticking=false;

    function update(){
      nav.classList.toggle("az-nav-scrolled",window.scrollY>48);
      ticking=false;
    }

    window.addEventListener("scroll",()=>{
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(update);
    },{passive:true});

    update();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initStickyTopNav,{once:true});
  }else{
    initStickyTopNav();
  }
})();


/* =========================================================
   AZ V7.51 — responsive nav behavior
   ========================================================= */
(()=>{
  const menu=document.getElementById("menuBtn");
  const nav=document.getElementById("navLinks");
  if(!menu||!nav)return;

  nav.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click",()=>nav.classList.remove("open"));
  });

  document.addEventListener("click",e=>{
    if(window.innerWidth>1350)return;
    if(!nav.classList.contains("open"))return;
    if(nav.contains(e.target)||menu.contains(e.target))return;
    nav.classList.remove("open");
  });

  window.addEventListener("resize",()=>{
    if(window.innerWidth>1350) nav.classList.remove("open");
  });
})();


/* =========================================================
   AZ V7.52 — grouped nav dropdown behavior
   ========================================================= */
(()=>{
  const nav=document.getElementById('navLinks');
  if(!nav)return;
  const groups=[...nav.querySelectorAll('.az-nav-group')];
  const closeGroups=(except=null)=>groups.forEach(g=>{if(g!==except){g.classList.remove('open');g.querySelector('.az-nav-trigger')?.setAttribute('aria-expanded','false')}});
  groups.forEach(g=>{
    const trigger=g.querySelector('.az-nav-trigger');
    if(!trigger)return;
    trigger.addEventListener('click',e=>{
      if(window.innerWidth>1350)return;
      e.preventDefault();e.stopPropagation();
      const willOpen=!g.classList.contains('open');
      closeGroups(g);g.classList.toggle('open',willOpen);trigger.setAttribute('aria-expanded',String(willOpen));
    });
  });
  document.addEventListener('click',e=>{if(!nav.contains(e.target))closeGroups()});
  window.addEventListener('resize',()=>{if(window.innerWidth>1350)closeGroups()});
})();

/* AZ Game Content nav sync V10 */
(function () {
  function syncGameContentNav() {
    document.querySelectorAll('.az-nav-group[data-nav-group="game"] .az-nav-dropdown').forEach(function (menu) {
      // Mining guide is disabled: remove stale entries from older HTML files.
      menu.querySelectorAll('a[href="mining.html"], a[data-page="mining"]').forEach(function (el) { el.remove(); });

      // Vehicle license system.
      var license = menu.querySelector('a[href="vehicle-license.html"]');
      if (!license) {
        license = document.createElement('a');
        license.setAttribute('data-page', 'vehicle-license');
        license.href = 'vehicle-license.html';
        license.innerHTML = '<b>載具駕照系統</b><small>學習駕照並解鎖對應載具駕駛資格</small>';
        var furniture = menu.querySelector('a[href="furniture-search.html"]');
        var map = menu.querySelector('a[href="map.html"]');
        if (furniture) menu.insertBefore(license, furniture);
        else if (map) menu.insertBefore(license, map);
        else menu.appendChild(license);
      }

      // Furniture search system.
      var fs = menu.querySelector('a[href="furniture-search.html"]');
      if (!fs) {
        fs = document.createElement('a');
        fs.setAttribute('data-page', 'furniture-search');
        fs.href = 'furniture-search.html';
        fs.innerHTML = '<b>家具物資搜尋</b><small>搜尋家具、噪音量表與通知說明</small>';
        var mapLink = menu.querySelector('a[href="map.html"]');
        if (mapLink) menu.insertBefore(fs, mapLink);
        else menu.appendChild(fs);
      }

      // Active state for dynamically inserted links.
      var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      menu.querySelectorAll('a[data-page]').forEach(function(a){
        if ((a.getAttribute('href')||'').split('?')[0].toLowerCase() === current) a.classList.add('active');
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncGameContentNav);
  else syncGameContentNav();
})();




/* =========================================================
   AZ V5 — TOP NAV: 商城預覽 / 伺服規章
   - 商城預覽改為頂部獨立分頁，位於伺服規章前
   - 從「遊戲內容」下拉移除商城預覽
   - 伺服器規章顯示名稱縮短為「伺服規章」
   ========================================================= */
(()=>{
  function setRulesLabel(a){
    if(!a) return;
    const icon=a.querySelector('.az-nav-rules-icon');
    if(icon){
      [...a.childNodes].forEach(n=>{ if(n.nodeType===3) n.remove(); });
      a.appendChild(document.createTextNode('伺服規章'));
    }else{
      a.textContent='伺服規章';
    }
  }
  function applyShopAndRulesNav(){
    // 商城預覽不再出現在「遊戲內容」下拉選單
    document.querySelectorAll('.az-nav-group[data-nav-group="game"] .az-nav-dropdown a[href="shop.html"]').forEach(a=>a.remove());

    document.querySelectorAll('.nav-actions').forEach(nav=>{
      const rules=[...nav.children].find(el=>el.matches && el.matches('a[href="rules.html"]')) || nav.querySelector(':scope > a.az-nav-rules');
      if(!rules) return;
      setRulesLabel(rules);

      let shop=[...nav.children].find(el=>el.matches && el.matches('a[href="shop.html"]'));
      if(!shop){
        shop=document.createElement('a');
        shop.href='shop.html';
        shop.dataset.page='shop';
        shop.className='az-nav-shop';
        shop.textContent='商城預覽';
        nav.insertBefore(shop,rules);
      }else if(shop.nextElementSibling!==rules){
        nav.insertBefore(shop,rules);
      }
      const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
      shop.classList.toggle('active',current==='shop.html');
      rules.classList.toggle('active',current==='rules.html');
    });

    // 頁尾或其他純文字規章連結同步改成四字名稱
    document.querySelectorAll('footer a[href="rules.html"], .foot-links a[href="rules.html"]').forEach(a=>a.textContent='伺服規章');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyShopAndRulesNav,{once:true});
  else applyShopAndRulesNav();
})();

