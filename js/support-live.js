(() => {
  const cfg = window.AZ_SUPABASE || {};
  const form = document.getElementById("ticketForm");
  const category = document.getElementById("ticketCategory");
  const myTickets = document.getElementById("myTickets");
  const mode = document.getElementById("ticketMode");
  const modeDesc = document.getElementById("ticketModeDesc");
  const success = document.getElementById("ticketSuccess");
  const successId = document.getElementById("createdTicketId");
  const successNote = document.getElementById("createdTicketNote");

  const categories = [
    "帳號問題","新人福利申請","BUG 回報","物品 / 載具異常",
    "贊助問題","檢舉 / 申訴","其他"
  ];
  categories.forEach(c => {
    const o=document.createElement("option"); o.value=c; o.textContent=c; category?.appendChild(o);
  });

  const line=document.getElementById("supportLine");
  const discord=document.getElementById("supportDiscord");
  if(line) line.href=cfg.lineUrl||"#";
  if(discord) discord.href=cfg.discordUrl||"#";

  if(!cfg.enabled || !cfg.url || cfg.url.includes("PASTE_") || !cfg.publishableKey || cfg.publishableKey.includes("PASTE_")){
    if(mode) mode.textContent="SETUP REQUIRED";
    if(modeDesc) modeDesc.textContent="請先設定 js/supabase-config.js 並執行 SUPABASE_SETUP.sql。";
    if(form){
      form.addEventListener("submit",e=>{
        e.preventDefault();
        alert("客服系統尚未連線。請管理員先完成 Supabase 設定。");
      });
    }
    if(myTickets) myTickets.innerHTML='<div class="ticket-empty">客服資料庫尚未設定。</div>';
    return;
  }

  const db = window.supabase.createClient(cfg.url,cfg.publishableKey,{
    auth:{persistSession:true,autoRefreshToken:true}
  });

  async function ensureUser(){
    const {data:{session}}=await db.auth.getSession();
    if(session?.user) return session.user;
    const {data,error}=await db.auth.signInAnonymously();
    if(error) throw error;
    return data.user;
  }

  function ticketNo(){
    const d=new Date();
    const day=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    return `AZ-${day}-${Math.floor(1000+Math.random()*9000)}`;
  }

  async function renderTickets(){
    if(!myTickets) return;
    myTickets.innerHTML='<div class="ticket-empty">讀取中...</div>';
    try{
      await ensureUser();
      const {data,error}=await db.from("az_support_tickets")
        .select("id,ticket_no,title,category,status,created_at,updated_at")
        .order("created_at",{ascending:false}).limit(10);
      if(error) throw error;
      myTickets.innerHTML=data?.length ? data.map(t=>`
        <button class="my-ticket live-ticket" data-id="${t.id}" type="button">
          <div><b>${t.ticket_no}</b><span>${new Date(t.created_at).toLocaleString("zh-TW")}</span></div>
          <p>${escapeHtml(t.title)}</p>
          <small>${escapeHtml(t.category)} · <strong>${escapeHtml(t.status)}</strong></small>
        </button>`).join("") : '<div class="ticket-empty">尚未建立任何工單。</div>';
      document.querySelectorAll(".live-ticket").forEach(b=>b.onclick=()=>openTicket(b.dataset.id));
    }catch(e){
      myTickets.innerHTML='<div class="ticket-empty">無法讀取工單，請稍後再試。</div>';
    }
  }

  function escapeHtml(v){
    return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  }

  let viewer=document.getElementById("playerTicketViewer");
  if(!viewer){
    viewer=document.createElement("div");
    viewer.id="playerTicketViewer";
    viewer.className="player-ticket-viewer";
    viewer.innerHTML=`<div class="player-ticket-bg"></div><article>
      <button class="player-ticket-close" type="button">×</button>
      <div id="playerTicketHeader"></div>
      <div id="playerTicketMessages" class="player-ticket-messages"></div>
      <form id="playerReplyForm">
        <textarea id="playerReplyText" rows="4" placeholder="補充資訊或回覆客服..." required></textarea>
        <button type="submit">送出回覆</button>
      </form>
    </article>`;
    document.body.appendChild(viewer);
    viewer.querySelector(".player-ticket-close").onclick=()=>viewer.classList.remove("show");
    viewer.querySelector(".player-ticket-bg").onclick=()=>viewer.classList.remove("show");
  }
  let activeTicketId=null;

  async function openTicket(id){
    activeTicketId=id;
    const [{data:t,error:te},{data:r,error:re}]=await Promise.all([
      db.from("az_support_tickets").select("*").eq("id",id).single(),
      db.from("az_support_replies").select("*").eq("ticket_id",id).order("created_at")
    ]);
    if(te){alert("無法讀取工單。");return;}
    document.getElementById("playerTicketHeader").innerHTML=`
      <span class="eyebrow">${escapeHtml(t.ticket_no)} · ${escapeHtml(t.status)}</span>
      <h2>${escapeHtml(t.title)}</h2>
      <p>${escapeHtml(t.message)}</p>`;
    document.getElementById("playerTicketMessages").innerHTML=(r||[]).map(x=>`
      <div class="ticket-message ${x.author_role}">
        <small>${x.author_role==="admin"?"ASHZONE 客服":"玩家"} · ${new Date(x.created_at).toLocaleString("zh-TW")}</small>
        <p>${escapeHtml(x.message)}</p>
      </div>`).join("") || '<div class="ticket-empty">目前尚無客服回覆。</div>';
    viewer.classList.add("show");
  }

  document.getElementById("playerReplyForm")?.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!activeTicketId)return;
    const text=document.getElementById("playerReplyText").value.trim();
    if(!text)return;
    const user=await ensureUser();
    const {error}=await db.from("az_support_replies").insert({
      ticket_id:activeTicketId,user_id:user.id,author_role:"player",message:text
    });
    if(error){alert("回覆送出失敗。");return;}
    document.getElementById("playerReplyText").value="";
    await openTicket(activeTicketId);
  });

  form?.addEventListener("submit",async e=>{
    e.preventDefault();
    const btn=form.querySelector(".ticket-submit");
    btn.disabled=true;
    try{
      const user=await ensureUser();
      const fd=Object.fromEntries(new FormData(form).entries());
      let no=ticketNo();
      let payload={
        ticket_no:no,
        user_id:user.id,
        player_name:fd.playerName,
        steam_id:fd.steamId||null,
        category:fd.category,
        contact_type:fd.contactType||null,
        contact_value:fd.contactValue||null,
        title:fd.title,
        message:fd.message
      };
      let {data,error}=await db.from("az_support_tickets").insert(payload).select("ticket_no").single();
      if(error && String(error.message).includes("duplicate")){
        payload.ticket_no=ticketNo();
        ({data,error}=await db.from("az_support_tickets").insert(payload).select("ticket_no").single());
      }
      if(error) throw error;
      successId.textContent=data.ticket_no;
      successNote.textContent="工單已真正送達 AshZone 客服系統，可在「我的工單」查看處理狀態與客服回覆。";
      success.classList.add("show");
      form.reset();
      await renderTickets();
    }catch(err){
      alert("工單送出失敗："+(err?.message||"未知錯誤"));
    }finally{
      btn.disabled=false;
    }
  });

  document.getElementById("ticketSuccessClose")?.addEventListener("click",()=>success.classList.remove("show"));
  document.querySelector(".ticket-success-bg")?.addEventListener("click",()=>success.classList.remove("show"));

  ensureUser().then(renderTickets).catch(()=>{
    if(mode) mode.textContent="AUTH ERROR";
    if(modeDesc) modeDesc.textContent="請確認 Supabase 已啟用 Anonymous Sign-Ins。";
  });
})();
/* AZ V7.0 support/account integration */
(async()=>{
  const cfg=window.AZ_SUPABASE||{};
  if(!cfg.enabled)return;
  const db=window.azCreateSupabase?.() || window.supabase.createClient(cfg.url,cfg.publishableKey);
  const {data:{user}}=await db.auth.getUser();
  const mode=document.getElementById("ticketModeDesc");
  if(mode && window.azIsPermanentUser?.(user)){
    mode.textContent="已登入玩家帳號；此工單會永久綁定你的帳號，可跨裝置查看。";
  }
})();
