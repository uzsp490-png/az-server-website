(() => {
  const db=window.azCreateSupabase();
  const form=document.getElementById("registerForm"), msg=document.getElementById("registerMessage");
  if(!db){msg.textContent="Supabase 尚未連線。";return}

  form.onsubmit=async e=>{
    e.preventDefault();
    const name=document.getElementById("registerName").value.trim();
    const email=document.getElementById("registerEmail").value.trim();
    const p1=document.getElementById("registerPassword").value;
    const p2=document.getElementById("registerPassword2").value;
    if(p1!==p2){msg.textContent="兩次輸入的密碼不同。";return}
    msg.textContent="建立帳號中...";

    // If current session is anonymous, sign it out before creating a permanent account.
    const {data:{user:current}}=await db.auth.getUser();
    if(current?.is_anonymous) await db.auth.signOut();

    const redirectTo=(window.AZ_AUTH?.siteUrl||location.origin)+"/account.html";
    const {data,error}=await db.auth.signUp({
      email,password:p1,
      options:{data:{display_name:name},emailRedirectTo:redirectTo}
    });
    if(error){msg.textContent="註冊失敗："+error.message;return}

    if(data.session){
      location.href="account.html";
    }else{
      msg.innerHTML="帳號已建立。<b>請到 Email 收取驗證信</b>，完成驗證後再登入。";
      form.reset();
    }
  };
})();