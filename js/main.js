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


/* AZ V4.4 video audio switch */
(() => {
  const video = document.querySelector(".hero-video");
  const btn = document.getElementById("soundToggle");
  const label = document.getElementById("soundLabel");
  if (!video || !btn || !label) return;

  video.muted = true;
  btn.addEventListener("click", async () => {
    video.muted = !video.muted;
    if (!video.muted) {
      try { await video.play(); } catch (e) {}
    }
    const on = !video.muted;
    btn.classList.toggle("audio-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "關閉影片聲音" : "開啟影片聲音");
    label.textContent = on ? "聲音 ON" : "聲音 OFF";
  });
})();
