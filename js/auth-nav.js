(() => {
  const db = window.azCreateSupabase?.();
  const link = document.querySelector('[data-page="account"]');
  if(!link || !db) return;

  async function render(){
    const {data:{user}} = await db.auth.getUser();
    if(window.azIsPermanentUser(user)){
      link.textContent = "玩家中心";
      link.href = "account.html";
      link.classList.add("account-online");
    }else{
      link.textContent = "登入";
      link.href = "login.html";
      link.classList.remove("account-online");
    }
  }
  db.auth.onAuthStateChange(() => setTimeout(render, 0));
  render();
})();
