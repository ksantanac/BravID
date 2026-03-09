// Mobile menu toggle
const toggle = document.getElementById('mobile-toggle');
const menu = document.getElementById('mobile-menu');
if (toggle) {
  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
}

// Smooth scroll for nav buttons — custom easing for a slower, smoother effect
function smoothScrollToId(id, duration = 900) {
  const el = document.getElementById(id);
  if (!el) return;
  const nav = document.getElementById('site-nav');
  const navHeight = nav ? nav.offsetHeight : 0;
  const start = window.scrollY || window.pageYOffset;
  const targetY = el.getBoundingClientRect().top + start - navHeight - 12; // small offset
  const distance = targetY - start;
  const startTime = performance.now();

  function easeInOutCubic(t){
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  function step(now){
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, start + distance * eased);
    if (elapsed < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-target');
    if (!id) return;
    // on index page, perform smooth scroll; otherwise navigate to index with hash
    const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '';
    if (isIndex) {
      e.preventDefault();
      // Ensure partials are loaded before attempting to scroll so target exists
      loadPartials().then(() => {
        // If target exists now, scroll; otherwise poll briefly for it
        const el = document.getElementById(id);
        if (el) return smoothScrollToId(id, 950);
        const start = performance.now();
        const tryPoll = () => {
          const found = document.getElementById(id);
          if (found) return smoothScrollToId(id, 950);
          if (performance.now() - start < 800) return requestAnimationFrame(tryPoll);
        };
        tryPoll();
      }).catch(()=>{});
    } else {
      // navigate to index with hash so browser scrolls on load
      location.href = 'index.html#' + id;
    }
    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
  });
});
// Load HTML partials into elements with `data-include` attributes
// This function is idempotent — once loaded it will not re-fetch and replace the DOM.
let PARTIALS_LOADED = false;
function loadPartials(){
  if (PARTIALS_LOADED) return Promise.resolve();
  const includes = Array.from(document.querySelectorAll('[data-include]'));
  if (!includes.length) {
    PARTIALS_LOADED = true;
    return Promise.resolve();
  }
  const loads = includes.map(el => {
    const url = el.getAttribute('data-include');
    if (!url) return Promise.resolve();
    return fetch(url).then(r => {
      if (!r.ok) return '';
      return r.text();
    }).then(html => {
      el.innerHTML = html;
    }).catch(()=>{});
  });
  return Promise.all(loads).then(() => { PARTIALS_LOADED = true; });
}

// Consolidated initialization: load partials, then run reveal/highlight and handle hash
document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  setupSectionReveal();
  setupNavHighlights();

  // If page loaded with a fragment, scroll to it after partials are in place
  const hash = window.location.hash;
  if (hash) {
    const id = hash.replace('#', '');
    setTimeout(() => smoothScrollToId(id, 950), 120);
  }
  // Show floating WhatsApp FAB (if present) after partials are injected
  const fab = document.querySelector('.whatsapp-fab');
  if (fab) setTimeout(() => fab.classList.add('whatsapp-fab--visible'), 320);
});

// FAB attention behavior: pulse on scroll and enlarge near page end
(() => {
  let fab = null;
  let pulseTimer = null;
  let idleTimer = null;
  function ensureFab(){ if (!fab) fab = document.querySelector('.whatsapp-fab'); return !!fab }

  function setIdle(){
    if (!ensureFab()) return;
    fab.classList.remove('whatsapp-fab--pulse');
    fab.classList.add('whatsapp-fab--idle');
  }

  function triggerPulse(){
    if (!ensureFab()) return;
    fab.classList.remove('whatsapp-fab--idle');
    fab.classList.add('whatsapp-fab--pulse');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(()=>{
      fab.classList.remove('whatsapp-fab--pulse');
      // return to idle after a short delay
      clearTimeout(idleTimer);
      idleTimer = setTimeout(()=>fab.classList.add('whatsapp-fab--idle'), 700);
    }, 900);
  }

  function checkNearEnd(){
    if (!ensureFab()) return;
    const near = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 420);
    if (near) fab.classList.add('whatsapp-fab--large'); else fab.classList.remove('whatsapp-fab--large');
  }

  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!ensureFab()) return;
    const cur = window.scrollY;
    // Pulse on user scroll activity
    triggerPulse();
    // show/hide behavior: ensure visible (no hide implemented but we could)
    // adjust size when near page end
    checkNearEnd();
    lastScroll = cur;
  }, {passive:true});

  // Try to initialize if partials already loaded
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{
      if (ensureFab()){
        // make it idle after it is shown
        setTimeout(setIdle, 700);
        checkNearEnd();
      }
    }, 420);
  });
})();

// Enhance FAB interactions: tilt and focus on pointer
(function(){
  function bindFabInteractions(){
    const f = document.querySelector('.whatsapp-fab');
    if (!f) return;
    let rect = null;
    function onEnter(){
      f.classList.add('whatsapp-fab--focus');
      rect = f.getBoundingClientRect();
    }
    function onMove(e){
      if (!rect) rect = f.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / (rect.width/2);
      const dy = (e.clientY - cy) / (rect.height/2);
      const rotX = (dy * -6).toFixed(2);
      const rotY = (dx * 8).toFixed(2);
      f.style.transform = `perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0) scale(1.06)`;
    }
    function onLeave(){
      f.classList.remove('whatsapp-fab--focus');
      f.style.transform = '';
      rect = null;
    }
    f.addEventListener('pointerenter', onEnter);
    f.addEventListener('pointermove', onMove);
    f.addEventListener('pointerleave', onLeave);
  }
  // Try binding after partials load
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(bindFabInteractions, 500);
  });
})();

// Add scrolled class to nav
const nav = document.getElementById('site-nav');
function onScroll() {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', onScroll);

// Section reveal: add class to sections when they enter the viewport
function setupSectionReveal(){
  const sections = document.querySelectorAll('main section');
  if (!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(s => {
    s.classList.add('section-reveal');
    obs.observe(s);
  });
}


// Navigation highlight: mark nav-link that points to the section in view
function setupNavHighlights(){
  const sections = document.querySelectorAll('main section');
  if (!sections.length) return;

  function setActive(id){
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.dataset.target || (link.getAttribute('href')||'').split('#')[1];
      if (target === id) link.classList.add('active'); else link.classList.remove('active');
    });
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.5 });

  sections.forEach(s => obs.observe(s));
}

// (setupSectionReveal and setupNavHighlights are called after partials load)
