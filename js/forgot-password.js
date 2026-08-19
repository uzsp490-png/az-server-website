(() => {
  const db=window.azCreateSupabase(), form=document.getElementById("forgotForm"), msg=document.getElementById("forgotMessage");
  if(!db){msg.textContent="Supabase 尚未連線。";return}
  form.onsubmit=async e=>{
    e.preventDefault(); msg.textContent="寄送中...";
    const email=document.getElementById("forgotEmail").value.trim();
    const redirectTo=(window.AZ_AUTH?.siteUrl||location.origin)+"/reset-password.html";
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo});
    if(error){msg.textContent="無法寄送："+error.message;return}
    msg.innerHTML="已送出重設信。請檢查你的 <b>Email 收件匣與垃圾郵件</b>。";
  };
})();