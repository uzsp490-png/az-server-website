(() => {
  const cfg = window.AZ_SUPPORT || {};
  const form = document.getElementById("ticketForm");
  const cats = document.getElementById("ticketCategory");
  const myTickets = document.getElementById("myTickets");
  const mode = document.getElementById("ticketMode");
  const modeDesc = document.getElementById("ticketModeDesc");
  const success = document.getElementById("ticketSuccess");
  const successId = document.getElementById("createdTicketId");
  const successNote = document.getElementById("createdTicketNote");
  const STORAGE_KEY = "az_support_tickets_v1";

  (cfg.categories || []).forEach(c => {
    const o = document.createElement("option"); o.value = c; o.textContent = c; cats?.appendChild(o);
  });

  ["supportLine"].forEach(id => { const a=document.getElementById(id); if(a) a.href=cfg.lineUrl||"#"; });
  ["supportDiscord"].forEach(id => { const a=document.getElementById(id); if(a) a.href=cfg.discordUrl||"#"; });

  if (cfg.submitMode === "api") {
    if(mode) mode.textContent = "LIVE MODE";
    if(modeDesc) modeDesc.textContent = "工單將送至 AshZone 客服後端。";
  }

  function getTickets(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e){ return []; }
  }
  function saveTickets(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  function renderTickets(){
    if(!myTickets) return;
    const list = getTickets().slice(0,6);
    myTickets.innerHTML = list.length ? list.map(t => `
      <div class="my-ticket">
        <div><b>${t.id}</b><span>${t.date}</span></div>
        <p>${t.title}</p>
        <small>${t.category} · ${t.status || "已建立"}</small>
      </div>`).join("") : `<div class="ticket-empty">尚未建立任何工單。</div>`;
  }

  function createId(){
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const rand = Math.floor(1000 + Math.random()*9000);
    return `AZ-${date}-${rand}`;
  }

  async function submitApi(ticket){
    const res = await fetch(cfg.apiEndpoint,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(ticket)
    });
    if(!res.ok) throw new Error("submit failed");
    return await res.json().catch(()=>({}));
  }

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const ticket = {
      id:createId(),
      date:new Date().toLocaleString("zh-TW"),
      status:"已建立",
      ...data
    };

    if(cfg.submitMode === "api" && cfg.apiEndpoint){
      try {
        const result = await submitApi(ticket);
        if(result?.id) ticket.id = result.id;
        successNote.textContent = "工單已送達 AshZone 客服系統。";
      } catch(err) {
        alert("工單送出失敗，請稍後再試或直接使用 LINE / Discord 聯繫客服。");
        return;
      }
    } else {
      const list = getTickets();
      list.unshift(ticket);
      saveTickets(list.slice(0,20));
      successNote.textContent = "目前為展示模式，資料只保存在這個瀏覽器，尚未真正傳送給客服。";
    }

    successId.textContent = ticket.id;
    success.classList.add("show");
    form.reset();
    renderTickets();
  });

  document.getElementById("ticketSuccessClose")?.addEventListener("click",()=>success.classList.remove("show"));
  document.querySelector(".ticket-success-bg")?.addEventListener("click",()=>success.classList.remove("show"));

  renderTickets();
})();