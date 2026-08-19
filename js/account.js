(() => {
  const db=window.azCreateSupabase();
  if(!db){location.replace("login.html");return}
  const esc=window.azEscape;

  let user=null, profile=null;
  async function boot(){
    const {data:{user:u}}=await db.auth.getUser();
    if(!window.azIsPermanentUser(u)){location.replace("login.html");return}
    user=u;
    document.getElementById("accountEmail").textContent=u.email;
    document.getElementById("profileEmail").value=u.email;
    document.getElementById("accountCreated").textContent=new Date(u.created_at).toLocaleDateString("zh-TW");

    const {data,error}=await db.from("az_player_profiles").select("*").eq("user_id",u.id).maybeSingle();
    if(error){document.getElementById("profileMessage").textContent="讀取玩家資料失敗："+error.message;return}
    profile=data;
    const name=profile?.display_name || u.user_metadata?.display_name || "AshZone Survivor";
    document.getElementById("accountName").textContent=name;
    document.getElementById("profileName").value=name;
    document.getElementById("profileSteam").value=profile?.steam_id || "";
    document.getElementById("accountSteam").textContent=profile?.steam_id || "尚未綁定";
    document.getElementById("accountStatus").textContent=profile?.account_status || "正常";
    await loadTickets();
  }

  document.getElementById("profileForm").onsubmit=async e=>{
    e.preventDefault();
    const name=document.getElementById("profileName").value.trim();
    const steam=document.getElementById("profileSteam").value.trim();
    const msg=document.getElementById("profileMessage");
    if(steam && !/^\d{17}$/.test(steam)){msg.textContent="Steam ID 必須是 17 位數字，或留空。";return}
    msg.textContent="儲存中...";
    const {error}=await db.from("az_player_profiles").update({
      display_name:name,steam_id:steam||null
    }).eq("user_id",user.id);
    if(error){msg.textContent="儲存失敗："+error.message;return}
    await db.auth.updateUser({data:{display_name:name}});
    msg.textContent="玩家資料已更新。";
    document.getElementById("accountName").textContent=name;
    document.getElementById("accountSteam").textContent=steam||"尚未綁定";
  };

  async function loadTickets(){
    const root=document.getElementById("accountTickets");
    root.innerHTML='<div class="account-empty">讀取工單中...</div>';
    const {data,error}=await db.from("az_support_tickets")
      .select("id,ticket_no,title,category,status,created_at,message")
      .order("created_at",{ascending:false});
    if(error){root.innerHTML='<div class="account-empty">無法讀取工單。</div>';return}
    root.innerHTML=data?.length ? data.map(t=>`
      <button class="account-ticket" data-id="${t.id}">
        <div><b>${esc(t.ticket_no)}</b><span class="account-ticket-status">${esc(t.status)}</span></div>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.category)}</p>
        <small>${new Date(t.created_at).toLocaleString("zh-TW")}</small>
      </button>`).join("") : '<div class="account-empty">目前沒有客服工單。</div>';
    document.querySelectorAll(".account-ticket").forEach(b=>b.onclick=()=>openTicket(b.dataset.id));
  }

  async function openTicket(id){
    const [{data:t},{data:r}]=await Promise.all([
      db.from("az_support_tickets").select("*").eq("id",id).single(),
      db.from("az_support_replies").select("*").eq("ticket_id",id).order("created_at")
    ]);
    if(!t)return;
    document.getElementById("accountTicketDetail").innerHTML=`
      <span class="eyebrow">${esc(t.ticket_no)} · ${esc(t.status)}</span>
      <h2>${esc(t.title)}</h2>
      <div class="account-original">${esc(t.message)}</div>
      <div class="account-replies">${(r||[]).map(x=>`
        <div class="ticket-message ${x.author_role}">
          <small>${x.author_role==="admin"?"ASHZONE 客服":"玩家"} · ${new Date(x.created_at).toLocaleString("zh-TW")}</small>
          <p>${esc(x.message)}</p>
        </div>`).join("")||'<div class="account-empty">目前尚無客服回覆。</div>'}</div>`;
    document.getElementById("accountTicketModal").classList.add("show");
  }

  document.querySelectorAll(".account-tabs button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".account-tabs button").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".account-pane").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); document.getElementById("pane-"+b.dataset.tab).classList.add("active");
  });
  document.getElementById("accountTicketClose").onclick=()=>document.getElementById("accountTicketModal").classList.remove("show");
  document.querySelector(".account-ticket-bg").onclick=()=>document.getElementById("accountTicketModal").classList.remove("show");
  document.getElementById("accountLogout").onclick=async()=>{await db.auth.signOut();location.href="index.html"};

  boot();
})();