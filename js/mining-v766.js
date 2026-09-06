(()=>{
  const gallery=document.getElementById('material-gallery');
  if(!gallery) return;
  const ids=[]; for(let n=1276;n<=1399;n++){if(n!==1335) ids.push(n)}
  const groups=(n)=> n<=1319?'fusion':n<=1364?'gems':n<=1388?'nodes':'tools';
  const labels={fusion:'融合與金屬',gems:'寶石與工具',nodes:'礦脈與礦粒',tools:'十字鎬與礦石'};
  const tile=220, cols=16, atlasW=3520, atlasH=1760;
  ids.forEach((n,i)=>{
    const a=document.createElement('span');
    a.className='m766-atlas-item'; a.dataset.group=groups(n);
    a.title=labels[groups(n)];
    const x=(i%cols)*tile, y=Math.floor(i/cols)*tile;
    a.style.backgroundPosition=`-${x}px -${y}px`;
    gallery.appendChild(a);
  });
  document.querySelectorAll('[data-gallery-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-gallery-filter]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); const f=btn.dataset.galleryFilter;
    gallery.querySelectorAll('.m766-atlas-item').forEach(el=>el.style.display=(f==='all'||el.dataset.group===f)?'block':'none');
  }));
})();
