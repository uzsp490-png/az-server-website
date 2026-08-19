(() => {
  const db=window.azCreateSupabase();
  if(!db){location.replace("login.html");return}
  const esc=window.azEscape;

  let user=null, profile=null;


  function playSupportDing(){
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return false;
      const ctx=new AudioCtx(), now=ctx.currentTime, gain=ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001,now);
      gain.gain.exponentialRampToValueAtTime(0.14,now+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+0.62);
      const a=ctx.createOscillator(), b=ctx.createOscillator();
      a.type="sine"; b.type="sine";
      a.frequency.value=880; b.frequency.value=1174.66;
      a.connect(gain); b.connect(gain);
      a.start(now); a.stop(now+0.2);
      b.start(now+0.22); b.stop(now+0.5);
      return true;
    }catch(e){ return false; }
  }

  function showSupportToast(count){
    let t=document.getElementById("azNotifyToast");
    if(!t){
      t=document.createElement("div");
      t.id="azNotifyToast";
      t.className="az-notify-toast";
      t.innerHTML='<small>ASHZONE NOTIFICATION</small><b>你有新的客服回覆</b><p id="azNotifyToastText"></p><button type="button">查看通知</button>';
      document.body.appendChild(t);
      t.querySelector("button").onclick=()=>setTab("notifications");
    }
    t.querySelector("#azNotifyToastText").textContent=`目前有 ${count} 則未讀客服通知。`;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),6500);
  }

  async function notifyUnreadSupport(){
    const {count}=await db.from("az_player_notifications")
      .select("id",{count:"exact",head:true})
      .eq("user_id",user.id)
      .eq("type","support")
      .eq("is_read",false);
    if((count||0)<=0)return;
    showSupportToast(count||0);
    if(!playSupportDing()){
      const once=()=>playSupportDing();
      document.addEventListener("pointerdown",once,{once:true});
    }
  }

  async function boot(){
    const {data:{user:u}}=await db.auth.getUser();
    if(!window.azIsPermanentUser(u)){location.replace("login.html");return}
    user=u;

    const {data,error}=await db.from("az_player_profiles")
      .select("*")
      .eq("user_id",u.id)
      .maybeSingle();

    if(error){location.replace("login.html");return}
    profile=data;

    if(profile?.account_status==="停權"){
      await db.auth.signOut();
      alert("此帳號目前已停權。");
      location.replace("login.html");
      return;
    }

    await db.from("az_player_profiles")
      .update({last_seen_at:new Date().toISOString()})
      .eq("user_id",u.id);

    document.getElementById("accountEmail").textContent=u.email;
    document.getElementById("profileEmail").value=u.email;
    document.getElementById("accountCreated").textContent=new Date(u.created_at).toLocaleDateString("zh-TW");

    const name=profile?.display_name || u.user_metadata?.display_name || "AshZone Survivor";
    document.getElementById("accountName").textContent=name;
    document.getElementById("profileName").value=name;
    document.getElementById("profileSteam").value=profile?.steam_id || "";
    document.getElementById("accountSteam").textContent=profile?.steam_id || "尚未綁定";
    document.getElementById("accountStatus").textContent=profile?.account_status || "正常";
    document.getElementById("securityAccountStatus").textContent=profile?.account_status || "正常";
    document.getElementById("lastSeenAt").textContent=
      profile?.last_seen_at ? new Date(profile.last_seen_at).toLocaleString("zh-TW") : "首次登入";

    await Promise.all([loadTickets(),loadNotifications()]);
    await notifyUnreadSupport();
    openTabFromUrl();
  }

  document.getElementById("profileForm").onsubmit=async e=>{
    e.preventDefault();
    const name=document.getElementById("profileName").value.trim();
    const steam=document.getElementById("profileSteam").value.trim();
    const msg=document.getElementById("profileMessage");

    if(steam && !/^\d{17}$/.test(steam)){
      msg.textContent="Steam ID 必須是 17 位數字，或留空。";
      return;
    }

    msg.textContent="儲存中...";
    const {error}=await db.from("az_player_profiles").update({
      display_name:name,
      steam_id:steam||null,
      last_seen_at:new Date().toISOString()
    }).eq("user_id",user.id);

    if(error){msg.textContent="儲存失敗："+error.message;return}

    await db.auth.updateUser({data:{display_name:name}});
    msg.textContent="玩家資料已更新。";
    document.getElementById("accountName").textContent=name;
    document.getElementById("accountSteam").textContent=steam||"尚未綁定";
  };

  async function loadNotifications(){
    const root=document.getElementById("accountNotifications");
    const badge=document.getElementById("accountUnreadBadge");
    const summary=document.getElementById("notificationSummary");
    root.innerHTML='<div class="account-empty">讀取通知中...</div>';

    const {data,error}=await db.from("az_player_notifications")
      .select("*")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(50);

    if(error){
      root.innerHTML='<div class="account-empty">無法讀取通知。</div>';
      return;
    }

    const unread=(data||[]).filter(n=>!n.is_read).length;
    if(summary) summary.textContent = unread ? `${unread} 則未讀` : "目前沒有未讀通知";
    if(badge){
      badge.textContent=unread ? (unread>9?"9+":String(unread)) : "";
      badge.classList.toggle("show",unread>0);
    }

    root.innerHTML=data?.length ? data.map(n=>`
      <button class="notification-item ${n.is_read?"":"unread"}" data-id="${n.id}" data-link="${esc(n.link||"")}">
        <div class="notification-icon ${esc(n.type)}">${n.type==="support"?"客服":n.type==="event"?"活動":n.type==="account"?"帳號":"系統"}</div>
        <div>
          <div class="notification-title-row">
            <h3>${esc(n.title)}</h3>
            ${n.is_read?"":'<span>NEW</span>'}
          </div>
          <p>${esc(n.message)}</p>
          <small>${new Date(n.created_at).toLocaleString("zh-TW")}</small>
        </div>
      </button>`).join("") : '<div class="account-empty">目前沒有通知。</div>';

    document.querySelectorAll(".notification-item").forEach(b=>b.onclick=async()=>{
      await db.from("az_player_notifications").update({is_read:true}).eq("id",b.dataset.id);
      const link=b.dataset.link;
      if(link){
        location.href=link;
      }else{
        await loadNotifications();
      }
    });
  }

  document.getElementById("markAllRead")?.addEventListener("click",async()=>{
    await db.from("az_player_notifications")
      .update({is_read:true})
      .eq("user_id",user.id)
      .eq("is_read",false);
    await loadNotifications();
  });

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
    const closed=["已完成","已關閉"].includes(t.status);

    document.getElementById("accountTicketDetail").innerHTML=`
      <span class="eyebrow">${esc(t.ticket_no)} · ${esc(t.status)}</span>
      <h2>${esc(t.title)}</h2>
      <div class="account-original">${esc(t.message)}</div>
      <div class="account-replies">${(r||[]).map(x=>`
        <div class="ticket-message ${x.author_role}">
          <small>${x.author_role==="admin"?"ASHZONE 客服":"玩家"} · ${new Date(x.created_at).toLocaleString("zh-TW")}</small>
          <p>${esc(x.message)}</p>
        </div>`).join("")||'<div class="account-empty">目前尚無客服回覆。</div>'}</div>
      ${closed
        ? `<div class="account-empty">此工單目前為「${esc(t.status)}」，如仍有問題請建立新工單。</div>`
        : `<form class="account-reply-form" id="accountReplyForm">
            <label>回覆客服</label>
            <textarea id="accountReplyText" required placeholder="補充問題內容、回覆客服或提供更多資訊..."></textarea>
            <button type="submit">送出回覆</button>
            <div class="reply-note">送出後客服後台會立即看到你的新回覆。</div>
          </form>`}`;

    if(!closed){
      const form=document.getElementById("accountReplyForm");
      form.onsubmit=async e=>{
        e.preventDefault();
        const text=document.getElementById("accountReplyText").value.trim();
        if(!text)return;
        const btn=form.querySelector("button");
        btn.disabled=true; btn.textContent="送出中...";
        const {error}=await db.from("az_support_replies").insert({
          ticket_id:id,user_id:user.id,author_role:"player",message:text
        });
        if(error){
          alert("回覆失敗："+error.message);
          btn.disabled=false; btn.textContent="送出回覆";
          return;
        }
        await db.from("az_support_tickets").update({status:"待處理"}).eq("id",id);
        await openTicket(id);
        await loadTickets();
      };
    }
    document.getElementById("accountTicketModal").classList.add("show");
  }

  document.getElementById("changePasswordForm")?.addEventListener("submit",async e=>{
    e.preventDefault();
    const p1=document.getElementById("securityPassword").value;
    const p2=document.getElementById("securityPassword2").value;
    const msg=document.getElementById("securityMessage");

    if(p1!==p2){msg.textContent="兩次輸入的新密碼不同。";return}
    if(p1.length<8){msg.textContent="密碼至少需要 8 個字元。";return}

    msg.textContent="更新密碼中...";
    const {error}=await db.auth.updateUser({password:p1});
    if(error){msg.textContent="修改失敗："+error.message;return}

    msg.textContent="密碼已更新。";
    e.target.reset();
  });

  document.getElementById("logoutAllDevices")?.addEventListener("click",async()=>{
    if(!confirm("確定要登出所有裝置嗎？你需要重新登入。")) return;
    try{
      await db.auth.signOut({scope:"global"});
    }catch(e){
      await db.auth.signOut();
    }
    location.href="login.html";
  });

  function setTab(name){
    document.querySelectorAll(".account-tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
    document.querySelectorAll(".account-pane").forEach(x=>x.classList.remove("active"));
    document.getElementById("pane-"+name)?.classList.add("active");
  }

  document.querySelectorAll(".account-tabs button").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

  function openTabFromUrl(){
    const p=new URLSearchParams(location.search);
    const tab=p.get("tab");
    if(["profile","notifications","tickets","security"].includes(tab)) setTab(tab);
  }

  document.getElementById("accountTicketClose").onclick=()=>document.getElementById("accountTicketModal").classList.remove("show");
  document.querySelector(".account-ticket-bg").onclick=()=>document.getElementById("accountTicketModal").classList.remove("show");
  document.getElementById("accountLogout").onclick=async()=>{await db.auth.signOut();location.href="index.html"};

  boot();
})();