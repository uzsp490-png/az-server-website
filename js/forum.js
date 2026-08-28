(()=>{
  const cfg=window.AZ_SUPABASE||{};
  const gate=document.getElementById("forumLoginGate"), app=document.getElementById("forumApp");
  if(!cfg.enabled||!cfg.url||!cfg.publishableKey){ gate.hidden=false; gate.querySelector("p").textContent="討論區目前尚未完成資料庫設定。"; return; }
  const db=window.azCreateSupabase?window.azCreateSupabase():window.supabase.createClient(cfg.url,cfg.publishableKey);
  const esc=window.azEscape||((v)=>String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])));
  let user=null, displayName="Survivor", posts=[], category="全部", editingId=null;
  const list=document.getElementById("forumPostList"), count=document.getElementById("forumCount"), search=document.getElementById("forumSearch");
  const postModal=document.getElementById("forumPostModal"), threadModal=document.getElementById("forumThreadModal");
  const fmt=d=>new Date(d).toLocaleString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});

  async function boot(){
    const {data:{user:u}}=await db.auth.getUser();
    if(!u||!window.azIsPermanentUser?.(u)){ gate.hidden=false; app.hidden=true; return; }
    user=u; gate.hidden=true; app.hidden=false;
    const {data:p}=await db.from("az_player_profiles").select("display_name").eq("user_id",user.id).maybeSingle();
    displayName=(p&&p.display_name)||user.user_metadata?.display_name||user.email?.split("@")[0]||"Survivor";
    document.getElementById("forumIdentity").textContent=`登入身份：${displayName}`;
    await loadPosts();
    const qs=new URLSearchParams(location.search); if(qs.get("post")) openThread(qs.get("post"));
  }

  async function loadPosts(){
    list.innerHTML='<div class="forum-empty">讀取討論主題...</div>';
    const {data,error}=await db.from("az_forum_posts").select("*").order("created_at",{ascending:false});
    if(error){ list.innerHTML=`<div class="forum-empty error">讀取失敗：${esc(error.message)}</div>`; return; }
    posts=data||[]; render();
  }
  function filtered(){
    const q=(search.value||"").trim().toLowerCase();
    return posts.filter(x=>(category==="全部"||x.category===category)&&(!q||`${x.title} ${x.body} ${x.author_name}`.toLowerCase().includes(q)));
  }
  function render(){
    const rows=filtered(); count.textContent=`${rows.length} 個主題`;
    list.innerHTML=rows.length?rows.map(x=>`<button class="forum-post-row" data-id="${x.id}"><div class="forum-post-main"><span class="forum-cat">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc(x.body).slice(0,150)}${x.body.length>150?"…":""}</p></div><div class="forum-post-meta"><b>${esc(x.author_name)}</b><span>${fmt(x.created_at)}</span><small>${x.reply_count||0} 回覆</small></div></button>`).join(""):'<div class="forum-empty">目前沒有符合條件的主題。</div>';
    list.querySelectorAll(".forum-post-row").forEach(b=>b.onclick=()=>openThread(b.dataset.id));
  }

  function openPostModal(post=null){
    editingId=post?.id||null;
    document.getElementById("forumPostModalTitle").textContent=post?"編輯主題":"發表新主題";
    document.getElementById("forumPostCategory").value=post?.category||"綜合討論";
    document.getElementById("forumPostTitle").value=post?.title||"";
    document.getElementById("forumPostBody").value=post?.body||"";
    document.getElementById("forumPostMessage").textContent="";
    postModal.hidden=false; document.body.classList.add("forum-modal-open");
  }
  function closePostModal(){postModal.hidden=true;document.body.classList.remove("forum-modal-open");editingId=null;}
  document.getElementById("forumNewPost").onclick=()=>openPostModal();
  document.querySelectorAll("[data-forum-close]").forEach(x=>x.onclick=closePostModal);

  document.getElementById("forumPostForm").onsubmit=async e=>{
    e.preventDefault(); const msg=document.getElementById("forumPostMessage"); msg.textContent="送出中...";
    const payload={category:document.getElementById("forumPostCategory").value,title:document.getElementById("forumPostTitle").value.trim(),body:document.getElementById("forumPostBody").value.trim(),author_name:displayName};
    if(!payload.title||!payload.body){msg.textContent="請填寫標題與內容。";return;}
    let error;
    if(editingId) ({error}=await db.from("az_forum_posts").update(payload).eq("id",editingId).eq("user_id",user.id));
    else ({error}=await db.from("az_forum_posts").insert({...payload,user_id:user.id}));
    if(error){msg.textContent=`送出失敗：${error.message}`;return;}
    closePostModal(); await loadPosts();
  };

  async function openThread(id){
    const post=posts.find(x=>x.id===id)||((await db.from("az_forum_posts").select("*").eq("id",id).maybeSingle()).data);
    if(!post)return;
    const {data:replies,error}=await db.from("az_forum_replies").select("*").eq("post_id",id).order("created_at");
    if(error)return alert(error.message);
    const mine=post.user_id===user.id;
    document.getElementById("forumThreadContent").innerHTML=`
      <div class="forum-thread-head"><span class="forum-cat">${esc(post.category)}</span><h2>${esc(post.title)}</h2><div class="forum-thread-by">${esc(post.author_name)} · ${fmt(post.created_at)}</div>${mine?`<div class="forum-owner-actions"><button id="forumEditPost">編輯</button><button id="forumDeletePost" class="danger">刪除</button></div>`:""}</div>
      <div class="forum-thread-body">${esc(post.body).replace(/\n/g,"<br>")}</div>
      <div class="forum-reply-title"><b>回覆</b><span>${(replies||[]).length} 則</span></div>
      <div class="forum-replies">${(replies||[]).map(r=>`<div class="forum-reply"><div><b>${esc(r.author_name)}</b><small>${fmt(r.created_at)}</small>${r.user_id===user.id?`<button class="forum-reply-delete" data-reply="${r.id}">刪除</button>`:""}</div><p>${esc(r.body).replace(/\n/g,"<br>")}</p></div>`).join("")||'<div class="forum-empty">還沒有回覆，成為第一個回覆的人。</div>'}</div>
      <form id="forumReplyForm" class="forum-reply-form"><textarea id="forumReplyBody" maxlength="3000" rows="4" required placeholder="輸入你的回覆..."></textarea><button type="submit">送出回覆</button></form>`;
    threadModal.hidden=false; document.body.classList.add("forum-modal-open"); history.replaceState(null,"",`forum.html?post=${id}`);
    if(mine){
      document.getElementById("forumEditPost").onclick=()=>{closeThread();openPostModal(post)};
      document.getElementById("forumDeletePost").onclick=async()=>{if(!confirm("確定刪除這篇主題？所有回覆也會一起刪除。"))return;const {error}=await db.from("az_forum_posts").delete().eq("id",id).eq("user_id",user.id);if(error)alert(error.message);else{closeThread();await loadPosts();}};
    }
    document.querySelectorAll(".forum-reply-delete").forEach(b=>b.onclick=async()=>{if(!confirm("刪除這則回覆？"))return;const {error}=await db.from("az_forum_replies").delete().eq("id",b.dataset.reply).eq("user_id",user.id);if(error)alert(error.message);else openThread(id)});
    document.getElementById("forumReplyForm").onsubmit=async e=>{e.preventDefault();const body=document.getElementById("forumReplyBody").value.trim();if(!body)return;const {error}=await db.from("az_forum_replies").insert({post_id:id,user_id:user.id,author_name:displayName,body});if(error){alert(error.message);return;}await db.rpc("az_forum_refresh_reply_count",{p_post_id:id});await loadPosts();openThread(id)};
  }
  function closeThread(){threadModal.hidden=true;document.body.classList.remove("forum-modal-open");history.replaceState(null,"","forum.html")}
  document.querySelectorAll("[data-thread-close]").forEach(x=>x.onclick=closeThread);
  document.getElementById("forumCategories").querySelectorAll("button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#forumCategories button").forEach(x=>x.classList.remove("active"));b.classList.add("active");category=b.dataset.category;render()});
  search.oninput=render;
  boot();
})();