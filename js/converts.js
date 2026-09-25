/* ============ CONVERTS ============
   Interactive "advertising that converts" section: card tilt, phone
   parallax, particle field, and the beam animation between cards
   and the phone. Called by main.js once sections/about.html has
   been injected into the page. */

window.initConverts = function convertsEngine() {
      // Re-init safety: kill any listeners/RAF loops from a
      // previous call before wiring up a fresh set (this file had
      // no cleanup path before, unlike contact.js/momentum.js).
      if (window.convertsCleanup) {
        window.convertsCleanup();
      }

      const section = document.querySelector('.converts-cyber');
      if (!section) return;

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const row = document.getElementById('convertsRow');
      const cards = Array.from(document.querySelectorAll('.convert-card'));
      const phone = document.getElementById('phone');
      const phoneScreen = document.getElementById('phoneScreen');
      const videoA = document.getElementById('videoA');
      const videoB = document.getElementById('videoB');
      const hudTitle = document.getElementById('hudTitle');
      const hudMeta1 = document.getElementById('hudMeta1');
      const hudMeta2 = document.getElementById('hudMeta2');
      if (!row || !phoneScreen || !videoA || !videoB) return;

      const cleanupFns = [];

      let activeVideo = videoA, idleVideo = videoB;
      let activeCardId = cards[0]?.dataset.cardId;
      if (cards[0]) cards[0].classList.add('is-active');

      /* particle field — skip entirely for reduced-motion users,
         and track the RAF id + resize listener so a re-init (or
         navigating away) can actually stop the loop. Previously
         this ran forever with no way to cancel it, and stacked a
         second uncancellable loop on any re-init. */
      const canvas = document.getElementById('particleField');
      if (canvas && !reducedMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let rafId = null;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        function spawnParticle(rect) {
          return { x: Math.random() * rect.width, y: Math.random() * rect.height, r: Math.random() * 1.4 + .4,
            vy: -(Math.random() * .18 + .04), vx: (Math.random() - .5) * .06, a: Math.random() * .5 + .15 };
        }
        function sizeCanvas() {
          const rect = section.getBoundingClientRect();
          canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
          canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const count = Math.round((rect.width * rect.height) / 26000);
          particles = Array.from({ length: count }, () => spawnParticle(rect));
        }
        function tickParticles() {
          const rect = section.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.fillStyle = '#b8ff31';
          for (const p of particles) {
            p.x += p.vx; p.y += p.vy;
            if (p.y < -4) { p.y = rect.height + 4; p.x = Math.random() * rect.width; }
            ctx.globalAlpha = p.a;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
          rafId = requestAnimationFrame(tickParticles);
        }
        sizeCanvas();
        rafId = requestAnimationFrame(tickParticles);
        window.addEventListener('resize', sizeCanvas);
        cleanupFns.push(() => {
          if (rafId) cancelAnimationFrame(rafId);
          window.removeEventListener('resize', sizeCanvas);
        });
      }

      /* card tilt — skip for reduced-motion users */
      if (!reducedMotion) {
        const handleCardMove = e => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - .5;
          const py = (e.clientY - rect.top) / rect.height - .5;
          card.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-6px)`;
        };
        const handleCardLeave = e => { e.currentTarget.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)'; };
        cards.forEach(card => {
          card.addEventListener('mousemove', handleCardMove);
          card.addEventListener('mouseleave', handleCardLeave);
        });
        cleanupFns.push(() => {
          cards.forEach(card => {
            card.removeEventListener('mousemove', handleCardMove);
            card.removeEventListener('mouseleave', handleCardLeave);
          });
        });

        /* phone parallax */
        if (phone) {
          const handlePhoneMove = e => {
            const rect = section.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - .5;
            const py = (e.clientY - rect.top) / rect.height - .5;
            phone.style.transform = `rotateY(${(px * 10).toFixed(2)}deg) rotateX(${(-py * 8).toFixed(2)}deg)`;
          };
          const handlePhoneLeave = () => { phone.style.transform = 'rotateY(0) rotateX(0)'; };
          section.addEventListener('mousemove', handlePhoneMove);
          section.addEventListener('mouseleave', handlePhoneLeave);
          cleanupFns.push(() => {
            section.removeEventListener('mousemove', handlePhoneMove);
            section.removeEventListener('mouseleave', handlePhoneLeave);
          });
        }
      }

      /* beam animation */
      function getCenter(el) {
        const r = el.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rowRect.left, y: r.top + r.height / 2 - rowRect.top };
      }
      function fireBeam(card) {
        const isLeft = cards.indexOf(card) === 0;
        const pathEl = document.getElementById(isLeft ? 'beamPathLeft' : 'beamPathRight');
        const pulseEl = document.getElementById(isLeft ? 'beamPulseLeft' : 'beamPulseRight');
        if (!pathEl || !pulseEl) return;
        const start = getCenter(card.querySelector('.card-thumb') || card);
        const end = getCenter(phoneScreen);
        const midX = (start.x + end.x) / 2;
        pathEl.setAttribute('d', `M ${start.x} ${start.y} Q ${midX} ${start.y - 60}, ${end.x} ${end.y}`);
        pathEl.classList.remove('is-active'); void pathEl.offsetWidth; pathEl.classList.add('is-active');
        animatePulseAlongPath(pathEl, pulseEl);
      }
      function animatePulseAlongPath(pathEl, pulseEl) {
        const len = pathEl.getTotalLength();
        const duration = 780;
        const startTime = performance.now();
        pulseEl.classList.add('is-active'); pulseEl.style.opacity = 1;
        function step(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const point = pathEl.getPointAtLength(t * len);
          pulseEl.setAttribute('cx', point.x); pulseEl.setAttribute('cy', point.y);
          if (t < 1) requestAnimationFrame(step);
          else { pulseEl.style.opacity = 0; onBeamArrive(); }
        }
        requestAnimationFrame(step);
      }

      let pendingVideoUrl = null, pendingMeta = null;
      function onBeamArrive() {
        phoneScreen.classList.add('is-charging', 'is-flicker');
        setTimeout(() => { phoneScreen.classList.remove('is-flicker'); swapVideo(); }, 160);
        setTimeout(() => phoneScreen.classList.remove('is-charging'), 900);
      }
      function swapVideo() {
        if (!pendingVideoUrl) return;
        idleVideo.src = pendingVideoUrl; idleVideo.currentTime = 0; idleVideo.play().catch(() => {});
        idleVideo.classList.add('is-visible'); activeVideo.classList.remove('is-visible');
        if (hudTitle && pendingMeta) hudTitle.textContent = pendingMeta.title;
        if (hudMeta1 && pendingMeta) hudMeta1.textContent = pendingMeta.meta1;
        if (hudMeta2 && pendingMeta) hudMeta2.textContent = pendingMeta.meta2;
        const tmp = activeVideo; activeVideo = idleVideo; idleVideo = tmp;
        setTimeout(() => idleVideo.pause(), 600);
      }
      function activateCard(card) {
        if (card.dataset.cardId === activeCardId) return;
        activeCardId = card.dataset.cardId;
        cards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        pendingVideoUrl = card.dataset.video || null;
        pendingMeta = { title: card.dataset.title, meta1: card.dataset.meta1, meta2: card.dataset.meta2 };
        fireBeam(card);
      }
      const handleCardClick = e => activateCard(e.currentTarget);
      const handleCardKeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateCard(e.currentTarget); }
      };
      cards.forEach(card => {
        card.addEventListener('click', handleCardClick);
        card.addEventListener('keydown', handleCardKeydown);
      });
      cleanupFns.push(() => {
        cards.forEach(card => {
          card.removeEventListener('click', handleCardClick);
          card.removeEventListener('keydown', handleCardKeydown);
        });
      });

      /* reveal on scroll — `.eyebrow.reveal` is intentionally left
         out here: main.js's generic `.reveal` IntersectionObserver
         already owns every `.reveal`-tagged element site-wide, and
         observing it a second time here just duplicated work
         without changing the outcome. */
      if (reducedMotion) {
        [document.querySelector('.cc-title'), ...cards, document.querySelector('.phone-stage')]
          .forEach(el => el && el.classList.add('in-view'));
      } else {
        const revealTargets = [document.querySelector('.cc-title'), ...cards, document.querySelector('.phone-stage')];
        const io = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); }
          });
        }, { threshold: .2 });
        revealTargets.forEach(el => el && io.observe(el));
        cleanupFns.push(() => io.disconnect());
      }

      window.convertsCleanup = () => {
        cleanupFns.forEach(fn => fn());
      };
};