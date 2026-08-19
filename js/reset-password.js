(() => {
  const db=window.azCreateSupabase(), form=document.getElementById("resetForm"), hint=document.getElementById("resetHint"), msg=document.getElementById("resetMessage");
  if(!db){msg.textContent="Supabase 尚未連線。";return}

  let recovery=false;
  const show=()=>{recovery=true;form.hidden=false;hint.textContent="驗證成功，請設定新密碼。"};

  db.auth.onAuthStateChange((event)=>{
    if(event==="PASSWORD_RECOVERY") show();
  });

  db.auth.getSession().then(({data:{session}})=>{
    if(session) show();
    else setTimeout(()=>{if(!recovery) hint.textContent="此重設連結無效或已過期，請重新申請。";},1200);
  });

  form.onsubmit=async e=>{
    e.preventDefault();
    const p1=document.getElementById("resetPassword").value,p2=document.getElementById("resetPassword2").value;
    if(p1!==p2){msg.textContent="兩次輸入的密碼不同。";return}
    msg.textContent="更新中...";
    const {error}=await db.auth.updateUser({password:p1});
    if(error){msg.textContent="更新失敗："+error.message;return}
    msg.textContent="密碼更新成功，正在返回玩家中心...";
    setTimeout(()=>location.href="account.html",900);
  };
})();