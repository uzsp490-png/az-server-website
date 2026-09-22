(()=>{
const gallery=document.getElementById('material-gallery');if(!gallery)return;
const search=document.getElementById('m767-gallery-search');
const counter=document.getElementById('m767-gallery-count');
const empty=document.getElementById('m767-noresults');
const buttons=[...document.querySelectorAll('[data-gallery-filter]')];
const cards=[...gallery.querySelectorAll('.m767-gallerycard')];
let filter='all';
function apply(){
 const q=(search?.value||'').trim().toLocaleLowerCase();let visible=0;
 for(const card of cards){
  const match=(filter==='all'||card.dataset.category===filter)&&(!q||card.dataset.search.toLocaleLowerCase().includes(q));
  card.hidden=!match;card.style.display=match?'':'none';if(match)visible++;
 }
 if(counter)counter.textContent=`${visible} / ${cards.length} 張`;
 if(empty)empty.hidden=visible!==0;
}
buttons.forEach(btn=>btn.addEventListener('click',()=>{
 filter=btn.dataset.galleryFilter;buttons.forEach(b=>b.classList.toggle('active',b===btn));apply();
}));
search?.addEventListener('input',apply);
apply();
})();
