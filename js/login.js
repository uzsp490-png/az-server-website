(() => {
  const db=window.azCreateSupabase();
  const form=document.getElementById("loginForm"), msg=document.getElementById("loginMessage");
  if(!db){msg.textContent="Supabase 尚未連線。";return}

  (async()=>{
    const {data:{user}}=await db.auth.getUser();
    if(window.azIsPermanentUser(user)) location.replace("account.html");
  })();

  form.onsubmit=async e=>{
    e.preventDefault(); msg.textContent="登入中...";
    const email=document.getElementById("loginEmail").value.trim();
    const password=document.getElementById("loginPassword").value;
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error){msg.textContent="登入失敗："+error.message;return}
    location.href="account.html";
  };
})();