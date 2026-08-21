(() => {
  const cfg = window.AZ_RULES_CONFIG || {};
  if(!cfg.version) return;

  const GUEST_KEY = "az_rules_guest_" + cfg.version;
  let db = null;
  try { db = window.azCreateSupabase?.() || null; } catch(e) {}

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g,m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function createGate(){
    if(document.getElementById("azRulesModal")) return;

    const root=document.createElement("div");
    root.id="azRulesModal";
    root.className="az-rules-modal show";
    root.innerHTML=`
      <div class="az-rules-backdrop"></div>
      <section class="az-rules-dialog forced" role="dialog" aria-modal="true">
        <div class="az-rules-dialog-head">
          <div><small>SERVER RULES VERIFICATION</small><h2>伺服器規章</h2></div>
          <span class="az-rules-version">${esc(cfg.version)}</span>
        </div>

        <div class="az-rules-scroll" id="azRulesScroll">
          <div class="az-rules-popup-intro">
            <b>重要規章摘要</b>
            <p>以下為加入 AshZone 前必須知道的重點。</p>
          </div>
          <article><b>01｜公平遊戲</b><p>禁止外掛、作弊、惡意利用 BUG / 漏洞、複製物品及其他非正常方式取得利益。</p></article>
          <article><b>02｜PVE / PVP</b><p>PVE 區域全面禁止偷竊；PVP 區域允許一般偷竊，但商城裝備與商城載具不得偷竊。</p></article>
          <article><b>03｜基地與安全區</b><p>禁止違規建設、浮空基地、阻塞道路；安全區禁止偷竊、埋藏物品、騷擾與阻擋商人或停車格。</p></article>
          <article><b>04｜載具風險</b><p>DayZ 載具可能因 BUG、不同步、碰撞、重啟或模組問題造成損失，原則上不予補償。</p></article>
          <article><b>05｜社群與爭議</b><p>禁止辱罵、騷擾、引戰、冒充管理員。問題與檢舉請使用官方客服管道。</p></article>
          <article><b>06｜補償與管理判定</b><p>一般 BUG、更新、重啟、斷線、延遲造成的損失原則上不補償；重大系統錯誤由管理團隊依紀錄與證據判定。</p></article>
          <div class="az-rules-end">
            <b>已閱讀規章摘要</b>
            <p>完整規章仍具有同等效力。</p>
            <a href="rules.html" target="_blank" rel="noopener">查看完整伺服器規章 ↗</a>
          </div>
        </div>

        <div class="az-rules-progress">
          <span id="azRulesProgressText">請閱讀規章至最下方</span>
          <i id="azRulesProgressBar"></i>
        </div>

        <label class="az-rules-check locked" id="azRulesCheckLabel">
          <input id="azRulesCheckbox" type="checkbox" disabled>
          <span>我已閱讀並同意 AshZone 目前版本的伺服器規章。</span>
        </label>

        <button id="azRulesAcceptBtn" type="button" disabled>確認並進入網站</button>
      </section>`;

    document.body.appendChild(root);
    document.documentElement.classList.add("az-rules-locked");

    const scroll=root.querySelector("#azRulesScroll");
    const cb=root.querySelector("#azRulesCheckbox");
    const btn=root.querySelector("#azRulesAcceptBtn");
    const label=root.querySelector("#azRulesCheckLabel");
    const text=root.querySelector("#azRulesProgressText");
    const bar=root.querySelector("#azRulesProgressBar");
    let bottom=false;

    const update=()=>{
      const max=Math.max(1,scroll.scrollHeight-scroll.clientHeight);
      const pct=Math.min(100,Math.round((scroll.scrollTop/max)*100));
      bar.style.width=pct+"%";
      if(!bottom && scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-10){
        bottom=true;
        cb.disabled=false;
        label.classList.remove("locked");
        text.textContent="已閱讀到底，可以確認";
      }else if(!bottom){
        text.textContent="閱讀進度 "+pct+"%";
      }
    };
    scroll.addEventListener("scroll",update,{passive:true});
    setTimeout(update,50);

    cb.addEventListener("change",()=>btn.disabled=!(bottom&&cb.checked));

    btn.addEventListener("click",async()=>{
      btn.disabled=true;
      btn.textContent="確認中...";

      // Always save locally first so UI can never freeze on DB.
      localStorage.setItem(GUEST_KEY,"1");

      // Best-effort account persistence, never block UI.
      try{
        if(db){
          const {data:{user}}=await db.auth.getUser();
          if(window.azIsPermanentUser?.(user)){
            db.from("az_rules_acceptance").upsert({
              user_id:user.id,
              rules_version:cfg.version,
              accepted_at:new Date().toISOString()
            },{onConflict:"user_id"}).then(()=>{}).catch(()=>{});
          }
        }
      }catch(e){}

      root.remove();
      document.documentElement.classList.remove("az-rules-locked");
      window.dispatchEvent(new CustomEvent("az:rules-accepted"));
    });
  }

  function shouldShow(){
    const page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    if(["rules.html","login.html","register.html","forgot-password.html","reset-password.html","admin.html","admin-login.html","player-admin.html"].includes(page)){
      return false;
    }
    return localStorage.getItem(GUEST_KEY)!=="1";
  }

  window.AZ_RULES_GATE_SHOULD_SHOW = shouldShow();

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{
      if(window.AZ_RULES_GATE_SHOULD_SHOW) createGate();
    },{once:true});
  }else if(window.AZ_RULES_GATE_SHOULD_SHOW){
    createGate();
  }
})();