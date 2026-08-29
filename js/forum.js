(()=>{
  const cfg=window.AZ_SUPABASE||{};
  const gate=document.getElementById("forumLoginGate"), app=document.getElementById("forumApp");
  if(!cfg.enabled||!cfg.url||!cfg.publishableKey){
    gate.hidden=false;
    gate.querySelector("p").textContent="討論區目前尚未完成資料庫設定。";
    return;
  }

  const db=window.azCreateSupabase?window.azCreateSupabase():window.supabase.createClient(cfg.url,cfg.publishableKey);
  const esc=window.azEscape||((v)=>String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])));
  const BUCKET="az-forum-images";
  const POST_MAX=5, REPLY_MAX=3, MAX_BYTES=5*1024*1024;
  const ALLOWED=new Set(["image/jpeg","image/png","image/webp"]);

  let user=null, displayName="Survivor", posts=[], category="全部", editingId=null, isAdmin=false;
  let postExistingPaths=[], postNewFiles=[];
  const signedCache=new Map();

  const list=document.getElementById("forumPostList"), count=document.getElementById("forumCount"), search=document.getElementById("forumSearch");
  const postModal=document.getElementById("forumPostModal"), threadModal=document.getElementById("forumThreadModal");
  const postFileInput=document.getElementById("forumPostImages");
  const postPreview=document.getElementById("forumPostImagePreview");
  const fmt=d=>new Date(d).toLocaleString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});

  function extOf(file){
    const t=file.type;
    if(t==="image/png") return "png";
    if(t==="image/webp") return "webp";
    return "jpg";
  }
  function validFiles(files,max){
    const arr=[...files];
    if(arr.length>max) throw new Error(`最多只能選擇 ${max} 張圖片。`);
    for(const f of arr){
      if(!ALLOWED.has(f.type)) throw new Error("只支援 JPG、PNG、WebP 圖片。");
      if(f.size>MAX_BYTES) throw new Error(`「${f.name}」超過 5MB。`);
    }
    return arr;
  }

  async function signPath(path){
    if(!path) return "";
    if(signedCache.has(path)) return signedCache.get(path);
    const {data,error}=await db.storage.from(BUCKET).createSignedUrl(path,3600);
    const url=error?"":(data?.signedUrl||"");
    signedCache.set(path,url);
    return url;
  }

  async function imageGrid(paths, extraClass=""){
    if(!Array.isArray(paths)||!paths.length) return "";
    const urls=await Promise.all(paths.map(signPath));
    const cells=urls.map((u,i)=>u?`<button type="button" class="forum-image-thumb" data-full="${esc(u)}" aria-label="查看圖片 ${i+1}"><img src="${esc(u)}" alt="討論圖片 ${i+1}" loading="lazy"></button>`:"").join("");
    return cells?`<div class="forum-image-grid ${extraClass}">${cells}</div>`:"";
  }

  function bindLightbox(root=document){
    root.querySelectorAll(".forum-image-thumb").forEach(btn=>{
      btn.onclick=()=>{
        const src=btn.dataset.full;
        if(!src) return;
        let lb=document.getElementById("forumImageLightbox");
        if(!lb){
          lb=document.createElement("div");
          lb.id="forumImageLightbox";
          lb.className="forum-image-lightbox";
          lb.innerHTML='<div class="forum-image-lightbox-bg"></div><button class="forum-image-lightbox-x" type="button">×</button><img alt="討論圖片">';
          document.body.appendChild(lb);
          lb.querySelector(".forum-image-lightbox-bg").onclick=()=>lb.classList.remove("open");
          lb.querySelector(".forum-image-lightbox-x").onclick=()=>lb.classList.remove("open");
        }
        lb.querySelector("img").src=src;
        lb.classList.add("open");
      };
    });
  }

  async function uploadFiles(files,scopeId){
    if(!files.length) return [];
    const uploaded=[];
    for(const file of files){
      const name=`${crypto.randomUUID()}.${extOf(file)}`;
      const path=`${user.id}/${scopeId}/${name}`;
      const {error}=await db.storage.from(BUCKET).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
      if(error){
        // best-effort rollback this batch
        if(uploaded.length) await db.storage.from(BUCKET).remove(uploaded);
        throw error;
      }
      uploaded.push(path);
    }
    return uploaded;
  }

  async function removePaths(paths){
    if(!Array.isArray(paths)||!paths.length) return;
    try{ await db.storage.from(BUCKET).remove(paths); }catch(_){}
    paths.forEach(p=>signedCache.delete(p));
  }

  async function boot(){
    const {data:{user:u}}=await db.auth.getUser();
    if(!u||!window.azIsPermanentUser?.(u)){ gate.hidden=false; app.hidden=true; return; }
    user=u; gate.hidden=true; app.hidden=false;
    const {data:p}=await db.from("az_player_profiles").select("display_name").eq("user_id",user.id).maybeSingle();
    displayName=(p&&p.display_name)||user.user_metadata?.display_name||user.email?.split("@")[0]||"Survivor";
    document.getElementById("forumIdentity").textContent=`登入身份：${displayName}`;
    try{
      const {data:a}=await db.rpc("az_is_admin");
      isAdmin=!!a;
    }catch(_){ isAdmin=false; }
    await loadPosts();
    const qs=new URLSearchParams(location.search); if(qs.get("post")) openThread(qs.get("post"));
  }

  async function loadPosts(){
    list.innerHTML='<div class="forum-empty">讀取討論主題...</div>';
    const {data,error}=await db.from("az_forum_posts").select("*").order("created_at",{ascending:false});
    if(error){ list.innerHTML=`<div class="forum-empty error">讀取失敗：${esc(error.message)}</div>`; return; }
    posts=data||[]; await render();
  }

  function filtered(){
    const q=(search.value||"").trim().toLowerCase();
    return posts.filter(x=>(category==="全部"||x.category===category)&&(!q||`${x.title} ${x.body} ${x.author_name}`.toLowerCase().includes(q)));
  }

  async function render(){
    const rows=filtered();
    count.textContent=`${rows.length} 個主題`;
    const html=await Promise.all(rows.map(async x=>{
      const hasImages=Array.isArray(x.image_paths)&&x.image_paths.length;
      let preview="";
      if(hasImages){
        const u=await signPath(x.image_paths[0]);
        if(u) preview=`<div class="forum-row-image"><img src="${esc(u)}" alt="" loading="lazy"><span>${x.image_paths.length>1?`+${x.image_paths.length-1}`:""}</span></div>`;
      }
      return `<button class="forum-post-row" data-id="${x.id}">
        <div class="forum-post-main">
          <div class="forum-row-titleline"><span class="forum-cat">${esc(x.category)}</span>${hasImages?'<span class="forum-has-image">▧ 圖片</span>':""}</div>
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.body).slice(0,150)}${x.body.length>150?"…":""}</p>
        </div>
        ${preview}
        <div class="forum-post-meta"><b>${esc(x.author_name)}</b><span>${fmt(x.created_at)}</span><small>${x.reply_count||0} 回覆</small></div>
      </button>`;
    }));
    list.innerHTML=html.length?html.join(""):'<div class="forum-empty">目前沒有符合條件的主題。</div>';
    list.querySelectorAll(".forum-post-row").forEach(b=>b.onclick=()=>openThread(b.dataset.id));
  }

  async function renderPostPreview(){
    if(!postPreview) return;
    const existing=await Promise.all(postExistingPaths.map(async (p,i)=>{
      const u=await signPath(p);
      return u?`<div class="forum-upload-preview-item"><img src="${esc(u)}" alt=""><button type="button" data-existing="${i}" title="移除">×</button></div>`:"";
    }));
    const news=postNewFiles.map((f,i)=>{
      const u=URL.createObjectURL(f);
      return `<div class="forum-upload-preview-item"><img src="${u}" alt=""><button type="button" data-new="${i}" title="移除">×</button></div>`;
    });
    postPreview.innerHTML=[...existing,...news].join("");
    postPreview.querySelectorAll("[data-existing]").forEach(b=>b.onclick=()=>{
      postExistingPaths.splice(Number(b.dataset.existing),1);
      renderPostPreview();
    });
    postPreview.querySelectorAll("[data-new]").forEach(b=>b.onclick=()=>{
      postNewFiles.splice(Number(b.dataset.new),1);
      renderPostPreview();
    });
  }

  async function openPostModal(post=null){
    editingId=post?.id||null;
    postExistingPaths=Array.isArray(post?.image_paths)?[...post.image_paths]:[];
    postNewFiles=[];
    document.getElementById("forumPostModalTitle").textContent=post?"編輯主題":"發表新主題";
    document.getElementById("forumPostCategory").value=post?.category||"綜合討論";
    document.getElementById("forumPostTitle").value=post?.title||"";
    document.getElementById("forumPostBody").value=post?.body||"";
    if(postFileInput) postFileInput.value="";
    document.getElementById("forumPostMessage").textContent="";
    await renderPostPreview();
    postModal.hidden=false;
    document.body.classList.add("forum-modal-open");
  }

  function closePostModal(){
    postModal.hidden=true;
    document.body.classList.remove("forum-modal-open");
    editingId=null;
    postExistingPaths=[];
    postNewFiles=[];
    if(postFileInput) postFileInput.value="";
    if(postPreview) postPreview.innerHTML="";
  }

  document.getElementById("forumNewPost").onclick=()=>openPostModal();
  document.querySelectorAll("[data-forum-close]").forEach(x=>x.onclick=closePostModal);

  if(postFileInput){
    postFileInput.onchange=async()=>{
      try{
        const room=POST_MAX-postExistingPaths.length;
        const selected=validFiles(postFileInput.files,room);
        if(postNewFiles.length+selected.length>room) throw new Error(`這篇主題最多 ${POST_MAX} 張圖片。`);
        postNewFiles.push(...selected);
        postFileInput.value="";
        await renderPostPreview();
      }catch(e){
        alert(e.message||String(e));
        postFileInput.value="";
      }
    };
  }

  document.getElementById("forumPostForm").onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById("forumPostMessage");
    msg.textContent="送出中...";
    const title=document.getElementById("forumPostTitle").value.trim();
    const body=document.getElementById("forumPostBody").value.trim();
    const cat=document.getElementById("forumPostCategory").value;
    if(!title||!body){msg.textContent="請填寫標題與內容。";return;}
    if(postExistingPaths.length+postNewFiles.length>POST_MAX){msg.textContent=`最多 ${POST_MAX} 張圖片。`;return;}

    try{
      const scopeId=editingId||crypto.randomUUID();
      const newPaths=await uploadFiles(postNewFiles,scopeId);
      const image_paths=[...postExistingPaths,...newPaths];
      const payload={category:cat,title,body,author_name:displayName,image_paths};
      let error;

      if(editingId){
        const original=posts.find(x=>x.id===editingId);
        const removed=(original?.image_paths||[]).filter(p=>!postExistingPaths.includes(p));
        ({error}=await db.from("az_forum_posts").update(payload).eq("id",editingId).eq("user_id",user.id));
        if(error){
          await removePaths(newPaths);
          throw error;
        }
        await removePaths(removed);
      }else{
        ({error}=await db.from("az_forum_posts").insert({...payload,id:scopeId,user_id:user.id}));
        if(error){
          await removePaths(newPaths);
          throw error;
        }
      }
      closePostModal();
      await loadPosts();
    }catch(err){
      msg.textContent=`送出失敗：${err.message||err}`;
    }
  };

  async function openThread(id){
    const post=posts.find(x=>x.id===id)||((await db.from("az_forum_posts").select("*").eq("id",id).maybeSingle()).data);
    if(!post)return;
    const {data:replies,error}=await db.from("az_forum_replies").select("*").eq("post_id",id).order("created_at");
    if(error)return alert(error.message);

    const mine=post.user_id===user.id;
    const canDelete=mine||isAdmin;
    const postImages=await imageGrid(post.image_paths||[],"forum-thread-images");
    const replyBlocks=await Promise.all((replies||[]).map(async r=>{
      const imgs=await imageGrid(r.image_paths||[],"forum-reply-images");
      return `<div class="forum-reply">
        <div><b>${esc(r.author_name)}</b><small>${fmt(r.created_at)}</small>${(r.user_id===user.id||isAdmin)?`<button class="forum-reply-delete" data-reply="${r.id}">刪除</button>`:""}</div>
        <p>${esc(r.body).replace(/\n/g,"<br>")}</p>${imgs}
      </div>`;
    }));

    document.getElementById("forumThreadContent").innerHTML=`
      <div class="forum-thread-head"><span class="forum-cat">${esc(post.category)}</span><h2>${esc(post.title)}</h2><div class="forum-thread-by">${esc(post.author_name)} · ${fmt(post.created_at)}</div>${(mine||canDelete)?`<div class="forum-owner-actions">${mine?'<button id="forumEditPost">編輯</button>':""}${canDelete?'<button id="forumDeletePost" class="danger">刪除</button>':""}</div>`:""}</div>
      <div class="forum-thread-body">${esc(post.body).replace(/\n/g,"<br>")}</div>
      ${postImages}
      <div class="forum-reply-title"><b>回覆</b><span>${(replies||[]).length} 則</span></div>
      <div class="forum-replies">${replyBlocks.join("")||'<div class="forum-empty">還沒有回覆，成為第一個回覆的人。</div>'}</div>
      <form id="forumReplyForm" class="forum-reply-form">
        <textarea id="forumReplyBody" maxlength="3000" rows="4" placeholder="輸入你的回覆..."></textarea>
        <label class="forum-image-upload forum-reply-upload">附加圖片 <span class="forum-upload-hint">最多 ${REPLY_MAX} 張・單張 5MB</span>
          <input id="forumReplyImages" type="file" accept="image/jpeg,image/png,image/webp" multiple>
        </label>
        <div class="forum-image-preview" id="forumReplyImagePreview"></div>
        <button type="submit">送出回覆</button>
      </form>`;

    threadModal.hidden=false;
    document.body.classList.add("forum-modal-open");
    history.replaceState(null,"",`forum.html?post=${id}`);
    bindLightbox(document.getElementById("forumThreadContent"));

    if(mine){
      document.getElementById("forumEditPost")?.addEventListener("click",()=>{closeThread();openPostModal(post)});
    }
    if(canDelete){
      document.getElementById("forumDeletePost")?.addEventListener("click",async()=>{
        if(!confirm(isAdmin&&!mine?"確定以管理員身份刪除這篇主題？所有回覆也會一起刪除。":"確定刪除這篇主題？所有回覆也會一起刪除。"))return;
        const replyPaths=(replies||[]).flatMap(r=>Array.isArray(r.image_paths)?r.image_paths:[]);
        const allPaths=[...(post.image_paths||[]),...replyPaths];
        let q=db.from("az_forum_posts").delete().eq("id",id);
        if(!isAdmin) q=q.eq("user_id",user.id);
        const {error}=await q;
        if(error) alert(error.message);
        else{
          await removePaths(allPaths);
          closeThread();
          await loadPosts();
        }
      });
    }
      };
    }

    document.querySelectorAll(".forum-reply-delete").forEach(b=>b.onclick=async()=>{
      if(!confirm("刪除這則回覆？"))return;
      const reply=(replies||[]).find(r=>r.id===b.dataset.reply);
      let q=db.from("az_forum_replies").delete().eq("id",b.dataset.reply);
      if(!isAdmin) q=q.eq("user_id",user.id);
      const {error}=await q;
      if(error) alert(error.message);
      else{
        await removePaths(reply?.image_paths||[]);
        openThread(id);
      }
    });

    let replyFiles=[];
    const replyInput=document.getElementById("forumReplyImages");
    const replyPreview=document.getElementById("forumReplyImagePreview");

    function renderReplyPreview(){
      replyPreview.innerHTML=replyFiles.map((f,i)=>`<div class="forum-upload-preview-item"><img src="${URL.createObjectURL(f)}" alt=""><button type="button" data-new="${i}">×</button></div>`).join("");
      replyPreview.querySelectorAll("[data-new]").forEach(b=>b.onclick=()=>{
        replyFiles.splice(Number(b.dataset.new),1);
        renderReplyPreview();
      });
    }

    replyInput.onchange=()=>{
      try{
        replyFiles=validFiles(replyInput.files,REPLY_MAX);
        renderReplyPreview();
      }catch(e){
        alert(e.message||String(e));
        replyFiles=[];
        replyInput.value="";
        renderReplyPreview();
      }
    };

    document.getElementById("forumReplyForm").onsubmit=async e=>{
      e.preventDefault();
      const body=document.getElementById("forumReplyBody").value.trim();
      if(!body&&!replyFiles.length) return alert("請輸入回覆內容或選擇圖片。");
      let paths=[];
      try{
        const replyId=crypto.randomUUID();
        paths=await uploadFiles(replyFiles,`reply-${replyId}`);
        const {error}=await db.from("az_forum_replies").insert({id:replyId,post_id:id,user_id:user.id,author_name:displayName,body:body||" ",image_paths:paths});
        if(error){
          await removePaths(paths);
          throw error;
        }
        await db.rpc("az_forum_refresh_reply_count",{p_post_id:id});
        await loadPosts();
        openThread(id);
      }catch(err){
        alert(`回覆失敗：${err.message||err}`);
      }
    };
  }

  function closeThread(){
    threadModal.hidden=true;
    document.body.classList.remove("forum-modal-open");
    history.replaceState(null,"","forum.html");
  }

  document.querySelectorAll("[data-thread-close]").forEach(x=>x.onclick=closeThread);
  document.getElementById("forumCategories").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("#forumCategories button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    category=b.dataset.category;
    render();
  });
  search.oninput=render;

  // V7.52: allow community dropdowns to open a forum category directly.
  const requestedCategory=new URLSearchParams(location.search).get("category");
  if(requestedCategory){
    const target=[...document.querySelectorAll("#forumCategories button")].find(b=>b.dataset.category===requestedCategory);
    if(target){
      document.querySelectorAll("#forumCategories button").forEach(x=>x.classList.remove("active"));
      target.classList.add("active");
      category=requestedCategory;
    }
  }
  boot();
})();