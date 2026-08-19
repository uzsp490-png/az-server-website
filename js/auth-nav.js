(() => {
  const db = window.azCreateSupabase?.();
  const link = document.querySelector('[data-page="account"]');
  const badge = document.getElementById("navNotifyBadge");
  if(!link || !db) return;

  async function render(){
    const {data:{user}} = await db.auth.getUser();

    if(window.azIsPermanentUser(user)){
      // Application-level account status guard
      const {data:profile} = await db.from("az_player_profiles")
        .select("account_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if(profile?.account_status === "停權"){
        await db.auth.signOut();
        link.textContent = "登入";
        link.href = "login.html";
        return;
      }

      link.childNodes[0].nodeValue = "玩家中心";
      link.href = "account.html";
      link.classList.add("account-online");

      const {count} = await db.from("az_player_notifications")
        .select("id",{count:"exact",head:true})
        .eq("user_id",user.id)
        .eq("is_read",false);

      if(badge){
        if((count||0)>0){
          badge.textContent = count > 9 ? "9+" : String(count);
          badge.classList.add("show");
        }else{
          badge.textContent = "";
          badge.classList.remove("show");
        }
      }
    }else{
      link.innerHTML = '登入<span class="nav-notify-badge" id="navNotifyBadge"></span>';
      link.href = "login.html";
      link.classList.remove("account-online");
    }
  }

  db.auth.onAuthStateChange(() => setTimeout(render, 0));
  render();
})();