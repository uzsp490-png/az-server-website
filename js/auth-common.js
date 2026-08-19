window.AZ_AUTH = {
  siteUrl: "https://az-server-website.vercel.app"
};

window.azCreateSupabase = function(){
  const c = window.AZ_SUPABASE || {};
  if(!c.enabled || !c.url || !c.publishableKey) return null;
  return window.supabase.createClient(c.url, c.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
};

window.azIsPermanentUser = function(user){
  if(!user) return false;
  return user.is_anonymous !== true && !!user.email;
};

window.azEscape = function(v){
  return String(v ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
};
