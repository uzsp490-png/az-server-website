(() => {
  const db=window.azCreateSupabase();
  const form=document.getElementById("loginForm"), msg=document.getElementById("loginMessage");
  if(!db){msg.textContent="Supabase 尚未連線。";return}

  async function validateUser(user){
    if(!window.azIsPermanentUser(user)) return false;

    const {data:profile,error} = await db.from("az_player_profiles")
      .select("account_status")
      .eq("user_id",user.id)
      .maybeSingle();

    if(error) return true;

    if(profile?.account_status === "停權"){
      await db.auth.signOut();
      msg.textContent="此帳號目前已停權，如有疑問請聯絡 AshZone 客服。";
      return false;
    }
    return true;
  }

  (async()=>{
    const {data:{user}}=await db.auth.getUser();
    if(await validateUser(user)) location.replace("account.html");
  })();

  form.onsubmit=async e=>{
    e.preventDefault(); msg.textContent="登入中...";
    const email=document.getElementById("loginEmail").value.trim();
    const password=document.getElementById("loginPassword").value;

    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error){msg.textContent="登入失敗：Email 或密碼錯誤。";return}

    if(!(await validateUser(data.user))) return;

    await db.from("az_player_profiles")
      .update({last_seen_at:new Date().toISOString()})
      .eq("user_id",data.user.id);

    location.href="account.html";
  };
})();