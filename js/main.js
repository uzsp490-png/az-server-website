const menu=document.getElementById("menuBtn"),nav=document.getElementById("navLinks");menu?.addEventListener("click",()=>nav?.classList.toggle("open"));const page=(location.pathname.split("/").pop()||"index.html").replace(".html","");document.querySelectorAll(".nav-actions a[data-page]").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});function pad(n){return String(n).padStart(2,"0")}let secs=5542;setInterval(()=>{secs--;if(secs<0)secs=21600;const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;const e=document.getElementById("restart");if(e)e.textContent=`${pad(h)}:${pad(m)}:${pad(s)}`},1000);setInterval(()=>{const e=document.getElementById("players");if(e)e.textContent=`${38+Math.floor(Math.random()*13)} / 80`},7000);









/* AZ V7.19 — safe rules-first announcement queue */
(() => {
  const modal=document.getElementById("announcementModal");
  if(!modal) return;

  if(window.AZ_RULES_GATE_SHOULD_SHOW){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");

    window.addEventListener("az:rules-accepted",()=>{
      setTimeout(()=>{
        modal.classList.add("show");
        modal.setAttribute("aria-hidden","false");
      },180);
    },{once:true});
  }
})();
