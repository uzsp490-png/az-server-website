(() => {
  const cfg=window.AZ_SUPABASE||{};
  if(!cfg.enabled){location.href="admin-login.html";return}
  const db=window.supabase.createClient(cfg.url,cfg.publishableKey);

  const list=document.getElementById("playerAdminList");
  const detail=document.getElementById("playerAdminDetail");
  const search=document.getElementById("playerAdminSearch");
  const filters=[...document.querySelectorAll("#playerFilters button")];

  let players=[], filter="全部", active=null;
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

  async function boot(){
    const {data:{user}}=await db.auth.getUser();
    if(!user){location.href="admin-login.html";return}

    const {data:a}=await db.from("az_admin_users")
      .select("display_name")
      .eq("user_id",user.id)
      .maybeSingle();

    if(!a){
      await db.auth.signOut();
      location.href="admin-login.html";
      return;
    }

    document.getElementById("adminIdentity").textContent=a.display_name||user.email;
    await load();
  }

  async function load(){
    list.innerHTML='<div class="admin-empty">讀取玩家中...</div>';

    const {data,error}=await db.from("az_player_profiles")
      .select("user_id,display_name,steam_id,account_status,created_at,last_seen_at")
      .order("created_at",{ascending:false});

    if(error){
      list.innerHTML='<div class="admin-empty">無法讀取玩家資料。</div>';
      return;
    }

    players=data||[];

    // V7.12: attach current rules acceptance to each player.
    try{
      const {data:rulesRows}=await db.from("az_rules_acceptance")
        .select("user_id,rules_version,accepted_at");
      const rulesMap=new Map((rulesRows||[]).map(r=>[r.user_id,r]));
      players=players.map(p=>({...p,rules_acceptance:rulesMap.get(p.user_id)||null}));
    }catch(e){
      players=players.map(p=>({...p,rules_acceptance:null}));
    }

    renderStats();
    renderList();

    if(active && players.some(p=>p.user_id===active)) openPlayer(active);
  }

  function renderStats(){
    const total=players.length;
    const normal=players.filter(p=>p.account_status==="正常").length;
    const limited=players.filter(p=>p.account_status==="限制").length;
    const suspended=players.filter(p=>p.account_status==="停權").length;
    const currentRules=window.AZ_RULES_CONFIG?.version||"2026.08-v1";
    const accepted=players.filter(p=>p.rules_acceptance?.rules_version===currentRules).length;

    document.getElementById("playerAdminStats").innerHTML=`
      <div><small>全部帳號</small><b>${total}</b></div>
      <div><small>正常</small><b>${normal}</b></div>
      <div><small>限制</small><b>${limited}</b></div>
      <div><small>停權</small><b>${suspended}</b></div>
      <div><small>規章已確認</small><b>${accepted}</b></div>`;
  }

  function filtered(){
    const q=(search.value||"").trim().toLowerCase();
    return players.filter(p=>{
      const statusOK=filter==="全部" || p.account_status===filter;
      const hay=`${p.display_name||""} ${p.steam_id||""} ${p.user_id}`.toLowerCase();
      return statusOK && (!q || hay.includes(q));
    });
  }

  function renderList(){
    const rows=filtered();

    list.innerHTML=rows.length ? rows.map(p=>`
      <button class="player-row ${active===p.user_id?"active":""}" data-id="${p.user_id}">
        <div>
          <b>${esc(p.display_name||"未設定名稱")}</b>
          <span class="player-status ${esc(p.account_status)}">${esc(p.account_status)}</span>
        </div>
        <p>Steam：${esc(p.steam_id||"未綁定")}</p>
        <p class="rules-mini ${p.rules_acceptance?.rules_version===(window.AZ_RULES_CONFIG?.version||"2026.08-v1")?"ok":""}">
          規章：${p.rules_acceptance?.rules_version===(window.AZ_RULES_CONFIG?.version||"2026.08-v1")?"已確認":"未確認"}
        </p>
        <small>${new Date(p.created_at).toLocaleString("zh-TW")}</small>
      </button>`).join("") : '<div class="admin-empty">目前沒有符合條件的玩家。</div>';

    document.querySelectorAll(".player-row").forEach(b=>b.onclick=()=>openPlayer(b.dataset.id));
  }

  async function openPlayer(id){
    active=id;
    renderList();
    const p=players.find(x=>x.user_id===id);
    if(!p)return;

    // auth.users email cannot be safely selected from browser-side public schema.
    // We display UUID/profile info only here.
    detail.innerHTML=`
      <div class="player-detail-head">
        <span class="eyebrow">PLAYER PROFILE</span>
        <h2>${esc(p.display_name||"未設定名稱")}</h2>
        <p class="player-uuid">${esc(p.user_id)}</p>
      </div>

      <div class="detail-info player-info-grid">
        <div><small>Steam 17 位 ID</small><b>${esc(p.steam_id||"未綁定")}</b></div>
        <div><small>帳號狀態</small><b>${esc(p.account_status)}</b></div>
        <div><small>註冊日期</small><b>${new Date(p.created_at).toLocaleString("zh-TW")}</b></div>
        <div><small>最近活動</small><b>${p.last_seen_at?new Date(p.last_seen_at).toLocaleString("zh-TW"):"尚無紀錄"}</b></div>
        <div><small>規章驗證</small><b>${p.rules_acceptance?.rules_version===(window.AZ_RULES_CONFIG?.version||"2026.08-v1")
          ? `✅ ${esc(p.rules_acceptance.rules_version)} · ${new Date(p.rules_acceptance.accepted_at).toLocaleString("zh-TW")}`
          : "⚠ 尚未確認目前規章"}</b></div>
      </div>

      <section class="player-admin-box">
        <small>ACCOUNT CONTROL</small>
        <h3>帳號狀態</h3>
        <div class="player-status-control">
          <select id="playerStatusSelect">
            ${["正常","限制","停權"].map(x=>`<option ${x===p.account_status?"selected":""}>${x}</option>`).join("")}
          </select>
          <button id="savePlayerStatus">儲存狀態</button>
        </div>
        <p>「停權」會阻止玩家登入 AshZone 玩家中心；不會刪除帳號或歷史工單。</p>
      </section>

      <section class="player-admin-box">
        <small>SEND NOTIFICATION</small>
        <h3>發送網站通知</h3>
        <form id="adminNotifyForm">
          <label>類型
            <select id="notifyType">
              <option value="system">系統</option>
              <option value="event">活動</option>
              <option value="account">帳號</option>
              <option value="support">客服</option>
            </select>
          </label>
          <label>標題<input id="notifyTitle" required maxlength="80" placeholder="例如：帳號資料提醒"></label>
          <label>內容<textarea id="notifyMessage" rows="5" required placeholder="輸入要傳給玩家的通知內容"></textarea></label>
          <label>連結（可留空）<input id="notifyLink" placeholder="例如：news.html"></label>
          <button type="submit">傳送通知</button>
        </form>
        <div class="auth-message" id="notifyResult"></div>
      </section>`;

    document.getElementById("savePlayerStatus").onclick=async()=>{
      const value=document.getElementById("playerStatusSelect").value;
      const {error}=await db.from("az_player_profiles")
        .update({account_status:value})
        .eq("user_id",id);

      if(error){alert("更新失敗："+error.message);return}
      await load();
    };

    document.getElementById("adminNotifyForm").onsubmit=async e=>{
      e.preventDefault();
      const result=document.getElementById("notifyResult");
      result.textContent="傳送中...";

      const {error}=await db.from("az_player_notifications").insert({
        user_id:id,
        type:document.getElementById("notifyType").value,
        title:document.getElementById("notifyTitle").value.trim(),
        message:document.getElementById("notifyMessage").value.trim(),
        link:document.getElementById("notifyLink").value.trim()||null
      });

      if(error){result.textContent="傳送失敗："+error.message;return}

      result.textContent="通知已傳送。";
      e.target.reset();
    };
  }

  filters.forEach(b=>b.onclick=()=>{
    filters.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    filter=b.dataset.status;
    renderList();
  });

  search.oninput=renderList;
  document.getElementById("adminPlayerRefresh").onclick=load;
  document.getElementById("adminPlayerLogout").onclick=async()=>{
    await db.auth.signOut();
    location.href="admin-login.html";
  };

  boot();
})();