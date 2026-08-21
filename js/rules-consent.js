(() => {
  const cfg = window.AZ_RULES_CONFIG || {};
  if(!cfg.version) return;

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
      <section class="az-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="azRulesTitle">
        <div class="az-rules-dialog-head">
          <div><small>SERVER RULES VERIFICATION</small><h2 id="azRulesTitle">${esc(cfg.title||"伺服器規章")}</h2></div>
          <span class="az-rules-version">${esc(cfg.version)}</span>
        </div>
        <div class="az-rules-summary">
          <p>規章版本已更新，請先閱讀目前的 AshZone 伺服器規章。</p>
          <ul>
            <li>禁止外掛、作弊與惡意利用漏洞。</li>
            <li>安全區禁止偷竊、騷擾與惡意干擾。</li>
            <li>PVP、活動與抄家規則以官方公告為準。</li>
            <li>規章更新後需要重新確認。</li>
          </ul>
          <a href="${esc(cfg.rulesUrl||"rules.html")}" target="_blank" rel="noopener">開啟完整伺服器規章 ↗</a>
        </div>
        <label class="az-rules-check">
          <input id="azRulesCheckbox" type="checkbox">
          <span>我已閱讀並同意 AshZone 目前版本的伺服器規章。</span>
        </label>
        <button id="azRulesAcceptBtn" type="button" disabled>確認並繼續</button>
        <p class="az-rules-error" id="azRulesError"></p>
      </section>`;
    document.body.appendChild(root);

    const cb=root.querySelector("#azRulesCheckbox");
    const btn=root.querySelector("#azRulesAcceptBtn");
    cb.onchange=()=>btn.disabled=!cb.checked;
    btn.onclick=async()=>{
      btn.disabled=true;
      btn.textContent="確認中...";
      const err=root.querySelector("#azRulesError");

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
      updateRulesPageUI({rules_version:cfg.version,accepted_at:payload.accepted_at});
    };

    return root;
  }

  function showModal(){
    const modal=buildModal();
    modal.classList.add("show");
    document.documentElement.classList.add("az-rules-locked");
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
    if(!currentUser){
      updateRulesPageUI(null);
      return;
    }

    const state=await getAcceptance(currentUser);
    if(!state.installed){
      updateRulesPageUI(null);
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