const menu=document.getElementById("menuBtn"),nav=document.getElementById("navLinks");menu?.addEventListener("click",()=>nav?.classList.toggle("open"));const page=(location.pathname.split("/").pop()||"index.html").replace(".html","");document.querySelectorAll(".nav-actions a[data-page]").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});function pad(n){return String(n).padStart(2,"0")}let secs=5542;setInterval(()=>{secs--;if(secs<0)secs=21600;const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;const e=document.getElementById("restart");if(e)e.textContent=`${pad(h)}:${pad(m)}:${pad(s)}`},1000);setInterval(()=>{const e=document.getElementById("players");if(e)e.textContent=`${38+Math.floor(Math.random()*13)} / 80`},7000);

/* AZ V4.2 current navigation highlight */
(() => {
  const current = (location.pathname.split("/").pop() || "index.html")
    .replace(".html","")
    .toLowerCase();
  document.querySelectorAll(".topnav .nav-actions a[data-page]").forEach(a => {
    if ((a.dataset.page || "").toLowerCase() === current) {
      a.classList.add("active");
    }
  });
})();
