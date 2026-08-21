(() => {
  const cfg = window.AZ_RULES_CONFIG || {};
  if(!cfg.version) return;

  /* AZ V7.16: rules version migration.
     v2 intentionally forces every browser/account to confirm once again. */
  try{
    if(localStorage.getItem("az_rules_migrated_2026_08_v2")!=="1"){
      Object.keys(localStorage).forEach(k=>{
        if(k.startsWith("az_rules_guest_2026.08-v1") || k.includes("_2026.08-v1")){
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem("az_rules_migrated_2026_08_v2","1");
    }
  }catch(e){}


  const db = window.azCreateSupabase?.();
  if(!db) return;

  let currentUser = null;
  let currentAccepted = false;

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  }

  async function getUser(){
    const {data:{user}} = await db.auth.getUser();
    return window.azIsPermanentUser?.(user) ? user : null;
  }

  async function getAcceptance(user){
    const {data,error} = await db.from("az_rules_acceptance")
      .select("rules_version,accepted_at")
      .eq("user_id",user.id)
      .maybeSingle();

    if(error){
      // Table/policy not installed yet: don't break the website.
      console.warn("[AZ Rules] acceptance query failed:", error.message);
      return {installed:false, accepted:false, row:null};
    }

    return {
      installed:true,
      accepted:data?.rules_version === cfg.version,
      row:data || null
    };
  }

  function buildModal(){
    if(document.getElementById("azRulesModal")) return document.getElementById("azRulesModal");

    const root=document.createElement("div");
    root.id="azRulesModal";
    root.className="az-rules-modal";
    root.innerHTML=`
      <div class="az-rules-backdrop"></div>
      <section class="az-rules-dialog forced" role="dialog" aria-modal="true" aria-labelledby="azRulesTitle">
        <div class="az-rules-dialog-head">
          <div><small>SERVER RULES VERIFICATION</small><h2 id="azRulesTitle">${esc(cfg.title||"伺服器規章")}</h2></div>
          <span class="az-rules-version">${esc(cfg.version)}</span>
        </div>
        <div class="az-rules-scroll" id="azRulesScroll">
          <div class="az-rules-popup-intro">
            <b>重要規章摘要</b>
            <p>以下為加入 AshZone 前必須知道的重點。完整規章可於「伺服器規章」頁查看。</p>
          </div>

          <article><b>01｜公平遊戲</b><p>禁止外掛、作弊、惡意利用 BUG / 漏洞、複製物品及其他非正常方式取得利益。</p></article>

          <article><b>02｜PVE / PVP</b><p>PVE 區域全面禁止偷竊；PVP 區域允許一般偷竊，但商城裝備與商城載具不得偷竊。</p></article>

          <article><b>03｜基地與安全區</b><p>禁止違規建設、浮空基地、阻塞道路；安全區禁止偷竊、埋藏物品、騷擾與阻擋商人或停車格。</p></article>

          <article><b>04｜載具風險</b><p>DayZ 載具可能因 BUG、不同步、碰撞、重啟或模組問題造成損失，原則上不予補償。</p></article>

          <article><b>05｜社群與爭議處理</b><p>禁止辱罵、騷擾、引戰、冒充管理員。問題與檢舉請使用客服中心、工單、LINE 或 Discord 指定管道。</p></article>

          <article><b>06｜補償與管理判定</b><p>一般 BUG、模組更新、重啟、斷線、延遲與非管理人為因素造成的損失原則上不補償。重大系統錯誤由管理團隊依紀錄與證據判定。</p></article>

          <div class="az-rules-end">
            <b>已閱讀規章摘要</b>
            <p>完整規章仍具有同等效力。到達這裡後才可進行確認。</p>
            <a href="${esc(cfg.rulesUrl||"rules.html")}" target="_blank" rel="noopener">查看完整伺服器規章 ↗</a>
          </div>
        </div>
        <div class="az-rules-progress"><span id="azRulesProgressText">請閱讀規章至最下方</span><i id="azRulesProgressBar"></i></div>
        <label class="az-rules-check locked" id="azRulesCheckLabel">
          <input id="azRulesCheckbox" type="checkbox" disabled>
          <span>我已閱讀並同意 AshZone 目前版本的伺服器規章。</span>
        </label>
        <button id="azRulesAcceptBtn" type="button" disabled>確認並進入網站</button>
        <p class="az-rules-error" id="azRulesError"></p>
      </section>`;
    document.body.appendChild(root);

    const cb=root.querySelector("#azRulesCheckbox");
    const btn=root.querySelector("#azRulesAcceptBtn");
    const scroll=root.querySelector("#azRulesScroll");
    const progressText=root.querySelector("#azRulesProgressText");
    const progressBar=root.querySelector("#azRulesProgressBar");
    const checkLabel=root.querySelector("#azRulesCheckLabel");
    let reachedBottom=false;

    function updateProgress(){
      const max=Math.max(1,scroll.scrollHeight-scroll.clientHeight);
      const pct=Math.min(100,Math.round((scroll.scrollTop/max)*100));
      progressBar.style.width=pct+"%";
      if(!reachedBottom && scroll.scrollTop+scroll.clientHeight >= scroll.scrollHeight-12){
        reachedBottom=true;
        cb.disabled=false;
        checkLabel.classList.remove("locked");
        progressText.textContent="規章已閱讀到底，可以進行確認";
      }else if(!reachedBottom){
        progressText.textContent=`閱讀進度 ${pct}%`;
      }
    }
    scroll.addEventListener("scroll",updateProgress);
    setTimeout(updateProgress,60);
    cb.onchange=()=>btn.disabled=!(reachedBottom&&cb.checked);

    btn.onclick=async()=>{
      btn.disabled=true;
      btn.textContent="確認中...";
      const err=root.querySelector("#azRulesError");

      // Guest visitors: confirm locally for the current rules version.
      if(window.__azRulesGuestMode){
        localStorage.setItem("az_rules_guest_"+cfg.version,"1");
        currentAccepted=true;
        root.classList.remove("show");
        document.documentElement.classList.remove("az-rules-locked");
        window.dispatchEvent(new CustomEvent("az:rules-accepted"));
        return;
      }

      // Logged-in fallback when the Supabase rules table/policy is not installed yet.
      if(window.__azRulesLocalFallback && currentUser){
        localStorage.setItem("az_rules_local_"+currentUser.id+"_"+cfg.version,"1");
        currentAccepted=true;
        root.classList.remove("show");
        document.documentElement.classList.remove("az-rules-locked");
        window.dispatchEvent(new CustomEvent("az:rules-accepted"));
        return;
      }

      const payload={
        user_id:currentUser.id,
        rules_version:cfg.version,
        accepted_at:new Date().toISOString()
      };

      const {error}=await db.from("az_rules_acceptance")
        .upsert(payload,{onConflict:"user_id"});

      if(error){
        err.textContent="規章確認失敗："+error.message;
        btn.disabled=false;
        btn.textContent="確認並繼續";
        return;
      }

      currentAccepted=true;
      root.classList.remove("show");
      document.documentElement.classList.remove("az-rules-locked");
      updateRulesPageUI({rules_version:cfg.version,accepted_at:payload.accepted_at}); window.dispatchEvent(new CustomEvent("az:rules-accepted"));
    };

    return root;
  }

  function showModal(){
    const modal=buildModal();
    modal.classList.add("show");
    document.documentElement.classList.add("az-rules-locked");
    window.dispatchEvent(new CustomEvent("az:rules-opened"));
  }

  function updateRulesPageUI(row){
    const version=document.getElementById("rulesPageVersion");
    const status=document.getElementById("rulesPageStatus");
    const accept=document.getElementById("rulesPageAccept");

    if(version) version.textContent=cfg.version;

    if(!currentUser){
      if(status) status.textContent="尚未登入";
      if(accept){
        accept.textContent="登入後確認規章";
        accept.onclick=()=>location.href="login.html";
      }
      return;
    }

    const ok=row?.rules_version===cfg.version;
    if(status){
      status.textContent=ok
        ? `已確認 · ${new Date(row.accepted_at).toLocaleString("zh-TW")}`
        : "尚未確認";
      status.classList.toggle("ok",ok);
    }

    if(accept){
      if(ok){
        accept.textContent="目前版本已確認";
        accept.disabled=true;
      }else{
        accept.textContent="確認目前規章";
        accept.disabled=false;
        accept.onclick=showModal;
      }
    }
  }

  async function boot(){
    currentUser=await getUser();

    // Guests: force reading too, remember locally for this rules version.
    if(!currentUser){
      const guestKey="az_rules_guest_"+cfg.version;
      const guestAccepted=localStorage.getItem(guestKey)==="1";
      updateRulesPageUI(null);

      const currentPage=(location.pathname.split("/").pop()||"index.html").toLowerCase();
      const exempt=["rules.html","login.html","register.html","forgot-password.html","reset-password.html","admin.html","admin-login.html","player-admin.html"];

      if(!guestAccepted && !exempt.includes(currentPage)){
        window.__azRulesGuestMode=true;
        showModal();
      }
      return;
    }

    const state=await getAcceptance(currentUser);

    // If SQL/table is not installed, still force locally instead of silently doing nothing.
    if(!state.installed){
      const localKey="az_rules_local_"+currentUser.id+"_"+cfg.version;
      const localAccepted=localStorage.getItem(localKey)==="1";
      updateRulesPageUI(null);

      const currentPage=(location.pathname.split("/").pop()||"index.html").toLowerCase();
      const exempt=["rules.html","login.html","register.html","forgot-password.html","reset-password.html","admin.html","admin-login.html","player-admin.html"];

      if(!localAccepted && !exempt.includes(currentPage)){
        window.__azRulesLocalFallback=true;
        showModal();
      }
      return;
    }

    currentAccepted=state.accepted;
    updateRulesPageUI(state.row);

    const currentPage=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    const exempt=["rules.html","login.html","register.html","forgot-password.html","reset-password.html","admin.html","admin-login.html","player-admin.html"];

    if(!state.accepted && !exempt.includes(currentPage)){
      showModal();
    }
  }

  db.auth.onAuthStateChange(()=>setTimeout(boot,0));
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();