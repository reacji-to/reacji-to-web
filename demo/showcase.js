// Presentation timing only. Picker, chips, placement, dragging and saves belong to the shared app.
export function startShowcase(app) {
  const root = document.querySelector('.reaction-demo');
  const tabs = [...root.querySelectorAll('[role=tab]')], posts = [...root.querySelectorAll('.sample-post')];
  const cursor = root.querySelector('.demo-cursor'), stage = root.querySelector('.demo-stage');
  const play = root.querySelector('.demo-play'), motion = matchMedia('(prefers-reduced-motion: reduce)');
  const host = root.querySelector('.address-host'), path = root.querySelector('.address-path');
  const toast = root.querySelector('.automation-toast'), status = root.querySelector('.demo-status');
  let index = 0, playing = !motion.matches, visible = false, timer, step = 0, generation = 0, scripted = false;
  let webRecord;
  const current = () => posts[index];
  const record = () => index === 3 ? webRecord : app.recordFor(current());
  const trigger = () => index === 3 ? current().querySelector('.web-quote') : record()?.button;
  function sync() { play.dataset.playing = String(playing); play.setAttribute('aria-label', playing ? 'Pause demo' : 'Play demo'); }
  function cancel() { generation++; clearTimeout(timer); cursor.hidden = true; toast.hidden = true; }
  // A pretend automation run, so each scripted reaction shows what it could trigger.
  function automate(post, run) {
    toast.querySelector('.toast-emoji').textContent = post.dataset.reaction;
    toast.querySelector('.toast-title').textContent = status.textContent = post.dataset.working;
    toast.querySelector('.toast-detail').textContent = '';
    toast.toggleAttribute('data-link', post.hasAttribute('data-detail-link'));
    toast.dataset.state = 'working'; toast.hidden = false;
    setTimeout(() => {
      if (run !== generation) return;
      toast.querySelector('.toast-title').textContent = post.dataset.done;
      toast.querySelector('.toast-detail').textContent = post.dataset.detail;
      status.textContent = `${post.dataset.done} ${post.dataset.detail}`;
      toast.dataset.state = 'done';
    }, 1300);
  }
  // The browser viewport scrolls on its own; keep the scripted target in view without moving the page.
  function reveal(el) {
    const box = el.getBoundingClientRect(), view = stage.getBoundingClientRect();
    const delta = box.bottom > view.bottom - 16 ? box.bottom - view.bottom + 16 : box.top < view.top + 16 ? box.top - view.top - 16 : 0;
    if (delta) stage.scrollBy({ top: delta, behavior: motion.matches ? 'auto' : 'smooth' });
  }
  function pause() { if (scripted) return; playing = false; cancel(); sync(); }
  function show(i) {
    scripted = true; app.close(); scripted = false;
    index = i; step = 0;
    posts.forEach((post,n) => { post.hidden = n !== index; });
    tabs.forEach((tab,n) => { tab.setAttribute('aria-selected',String(n === index)); tab.tabIndex = n === index ? 0 : -1; });
    host.textContent = tabs[index].dataset.host; path.textContent = tabs[index].dataset.path;
    stage.scrollTop = 0; toast.hidden = true;
    // The shared app observes geometry on scroll, including pins on hidden examples.
    window.dispatchEvent(new Event('resize'));
  }
  function point(el) {
    if (!el) return;
    reveal(el);
    const box = el.getBoundingClientRect(), parent = stage.getBoundingClientRect();
    cursor.hidden = false;
    cursor.style.transform = `translate(${box.left-parent.left+box.width*.6}px,${box.top-parent.top+stage.scrollTop+box.height*.6}px)`;
  }
  // The shared picker returns focus to its trigger on close; scripted runs should not leave a focus ring.
  function release() { const host = document.activeElement; if (host && root.contains(host)) (host.shadowRoot?.activeElement || host).blur(); }
  function schedule(ms) { if (playing && visible && !document.hidden) timer = setTimeout(advance, ms); }
  async function advance() {
    if (!playing || !visible || document.hidden) return;
    const run = generation;
    scripted = true;
    try {
      if (step === 0) {
        // Every autoplay pass demonstrates an unreacted post before choosing an emoji.
        const currentRecord = record();
        if (currentRecord) {
          currentRecord.visibility = 'local';
          await app.choose(currentRecord, null);
          if (run !== generation) return;
        }
        point(trigger()); step = 1; schedule(1000);
      }
      else if (step === 1) {
        if (index === 3) {
          const target = trigger(), box = target.getBoundingClientRect();
          webRecord = await app.place({target,x:box.left+box.width*.6,y:box.top+box.height*.5,href:location.href},{focus:false});
        } else await app.open(record(), false, {focus:false});
        if (run !== generation) return;
        cursor.hidden = true; step = 2; schedule(1000);
      } else if (step === 2) {
        const search = app.active?.panel.querySelector('.search');
        if (search) { search.value = current().dataset.reaction; search.dispatchEvent(new Event('input')); }
        step = 3; schedule(1200);
      } else if (step === 3) {
        if (record()) await app.choose(record(), current().dataset.reaction, undefined, {trackUsage:false});
        if (run !== generation) return;
        release(); automate(current(), run);
        requestAnimationFrame(() => { const row = record()?.rowEl; if (run === generation && row && !row.hidden) reveal(row); });
        step = 4; schedule(3400);
      } else {
        // Clear the outgoing example before it can appear in another loop.
        toast.hidden = true;
        if (record()) await app.choose(record(), null);
        if (run !== generation) return;
        release();
        show((index+1)%posts.length); schedule(1000);
      }
    } finally { scripted = false; }
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => { pause(); show(i); });
    tab.addEventListener('keydown', event => {
      const next = {ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if (next === undefined) return;
      event.preventDefault(); pause(); show(next); tabs[next].focus();
    });
  });
  // Capture before the shared picker handles the event. Autoplay must never resume over user input.
  document.addEventListener('pointerdown', event => { if(event.isTrusted && !play.contains(event.target)) pause(); }, true);
  document.addEventListener('keydown', event => { if(event.isTrusted && event.target !== play) { if(event.key === 'Alt' && playing) app.close(); pause(); } }, true);
  document.addEventListener('reacji-demo-interaction', () => { pause(); app.close(); });
  play.addEventListener('click', () => { if (playing) return pause(); playing = true; cancel(); show(index); sync(); schedule(500); });
  function resume() { cancel(); if (playing) { scripted = true; app.close(); scripted = false; step = 0; schedule(1200); } }
  document.addEventListener('visibilitychange', resume);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }, {threshold:.3}).observe(root);
  motion.addEventListener('change', () => { if (motion.matches) { pause(); app.close(); } });
  root.querySelectorAll('.post-avatar img,.tab-icon img').forEach(img => { img.addEventListener('error',()=>img.hidden=true); if(img.complete&&!img.naturalWidth)img.hidden=true; });
  const devCard = root.querySelector('#post-devnull');
  devCard.addEventListener('click', event => { if (!event.composedPath().some(el => el.localName === 'reacji-to-reactions') && !event.target.closest('a,button')) devCard.querySelector('.dev-card-top').click(); });
  sync();
  return pause;
}
