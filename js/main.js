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

  // Force the footer visible even if an older stylesheet accidentally hid it.
  if (actions) {
    actions.style.setProperty("display", "flex", "important");
    actions.style.setProperty("align-items", "center", "important");
    actions.style.setProperty("justify-content", "flex-end", "important");
    actions.style.setProperty("gap", "14px", "important");
    actions.style.setProperty("flex-wrap", "wrap", "important");
    actions.style.setProperty("padding", "16px 36px 24px", "important");
    actions.style.setProperty("border-top", "1px solid rgba(240,189,85,.16)", "important");
  }
  const hideLabel = actions?.querySelector(".announcement-today-hide");
  if (hideLabel) {
    hideLabel.style.setProperty("display", "inline-flex", "important");
    hideLabel.style.setProperty("align-items", "center", "important");
    hideLabel.style.setProperty("gap", "8px", "important");
    hideLabel.style.setProperty("margin-right", "auto", "important");
    hideLabel.style.setProperty("cursor", "pointer", "important");
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

/* AZ Furniture Search nav sync V3 */
(function () {
  function addFurnitureSearchNav() {
    document.querySelectorAll('.az-nav-group[data-nav-group="game"] .az-nav-dropdown').forEach(function (menu) {
      if (menu.querySelector('a[href="furniture-search.html"]')) return;
      var mining = menu.querySelector('a[href="mining.html"]');
      var a = document.createElement('a');
      a.setAttribute('data-page', 'furniture-search');
      a.href = 'furniture-search.html';
      a.innerHTML = '<b>家具物資搜尋</b><small>搜尋家具、噪音量表與通知說明</small>';
      if (mining && mining.nextSibling) menu.insertBefore(a, mining.nextSibling);
      else if (mining) menu.appendChild(a);
      else menu.appendChild(a);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFurnitureSearchNav);
  else addFurnitureSearchNav();
})();



/* =========================================================
   AZ 2026-10-29 — TEST NOTICE / NEW PLAYER MOTORCYCLE
   IMPORTANT: preserves the site's existing announcement.js and news.js.
   Existing serial-code announcement content is intentionally not replaced.
   ========================================================= */
(()=>{
  const EXTRA_NEWS=[
    {
      id:"nonwipe-test-20261029",
      type:"system",
      badge:"SYSTEM",
      date:"2026-10-29",
      title:"ASHZONE 不刪檔測試公告",
      summary:"伺服器於 2026/10/29 00:00 起進行不刪檔測試。",
      content:`<p><strong>ASHZONE 伺服器於 2026/10/29 00:00 起進行不刪檔測試。</strong></p><p>測試期間將持續觀察伺服器穩定性、遊戲平衡、任務、經濟與角色成長系統。</p><p>若發現異常或問題，請透過官方客服回報；後續調整以官方網站最新公告為準。</p>`,
      pinned:true
    },
    {
      id:"new-player-motorcycle-test",
      type:"event",
      badge:"BENEFIT",
      date:"2026-10-29",
      title:"測試期間新人福利｜加入送隨機摩托載具",
      summary:"測試期間加入的新玩家，可申請隨機摩托載具 ×1。",
      content:`<p><strong>測試期間加入的新玩家，可獲得隨機摩托載具 ×1。</strong></p><p>完成加入後，請依官方客服流程提供 Steam 17 位數 ID 申請。</p><p>實際發放車款為隨機，不提供指定車款；每位符合資格的新玩家限領一次。</p>`,
      pinned:true
    }
  ];

  function mergeNews(){
    if(!Array.isArray(window.AZ_NEWS)) window.AZ_NEWS=[];
    const ids=new Set(window.AZ_NEWS.map(n=>n&&n.id));
    for(let i=EXTRA_NEWS.length-1;i>=0;i--){
      const item=EXTRA_NEWS[i];
      if(!ids.has(item.id)) window.AZ_NEWS.unshift(item);
    }
  }

  function appendPopupNotice(){
    const content=document.getElementById("announcementContent");
    if(!content || document.getElementById("az-test-20261029-extra")) return;
    const block=document.createElement("div");
    block.id="az-test-20261029-extra";
    block.style.cssText="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);line-height:1.8";
    block.innerHTML=`
      <div style="margin-bottom:10px">
        <b style="display:block;color:#f6d27e;margin-bottom:3px">不刪檔測試</b>
        <span>伺服器於 <strong>2026/10/29 00:00</strong> 起進行不刪檔測試。</span>
      </div>
      <div>
        <b style="display:block;color:#f6d27e;margin-bottom:3px">測試期間新人福利</b>
        <span>測試期間加入的新玩家，可申請 <strong>隨機摩托載具 ×1</strong>。完成加入後請依官方客服流程提供 Steam 17 位數 ID。</span>
      </div>`;
    content.appendChild(block);
  }

  // main.js is loaded after the site's original announcement.js/news.js.
  // Merge only the new notices and leave every existing announcement intact.
  mergeNews();
  appendPopupNotice();

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{
      mergeNews();
      appendPopupNotice();
    },{once:true});
  }
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

