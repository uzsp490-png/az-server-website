(() => {
  'use strict';
  function filterList(prefix, attribute, noun) {
    const search = document.getElementById(prefix + '-search');
    const group = document.getElementById(prefix + '-group');
    const count = document.getElementById(prefix + '-count');
    const empty = document.getElementById(prefix + '-empty');
    const entries = Array.from(document.querySelectorAll('[' + attribute + ']'));
    function apply() {
      const q = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const entry of entries) {
        const match = (group.value === 'all' || entry.getAttribute(attribute) === group.value) &&
          (!q || entry.dataset.search.toLocaleLowerCase().includes(q) || entry.textContent.toLocaleLowerCase().includes(q));
        entry.hidden = !match;
        if (match) visible++;
      }
      count.textContent = visible + ' / ' + entries.length + ' ' + noun;
      empty.hidden = visible !== 0;
    }
    search.addEventListener('input', apply);
    group.addEventListener('change', apply);
    document.getElementById(prefix + '-clear').addEventListener('click', () => {
      search.value = ''; group.value = 'all'; apply(); search.focus();
    });
    apply();
  }
  filterList('recipe', 'data-recipe-group', '筆配方');
  filterList('atlas', 'data-atlas-group', '張');
  const dialog = document.getElementById('atlas-dialog');
  const preview = document.getElementById('dialog-image');
  const title = document.getElementById('dialog-title');
  document.querySelectorAll('.atlas-card').forEach(card => card.addEventListener('click', () => {
    preview.src = card.dataset.image;
    preview.alt = card.dataset.name;
    title.textContent = card.dataset.name;
    dialog.showModal();
  }));
  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  const links = Array.from(document.querySelectorAll('.guide-toc a:not(.back-top)'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!current) return;
      links.forEach(a => {
        const active = a.hash === '#' + current.target.id;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('.guide-section').forEach(s => observer.observe(s));
  }
})();
