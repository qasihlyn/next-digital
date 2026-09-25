/* ============ HERO ============
   Camera-frame scroll sequence + scroll-panel reveal animations
   for the .camera-section hero. Called by main.js once
   sections/hero.html has been injected into the page. */

window.initHero = function initHero() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger is required for the hero animation.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Re-init safety, matching contact.js/momentum.js — without
    // this, a second call stacks a second "resize" listener with
    // no way to remove the first.
    if (window.heroCleanup) {
        window.heroCleanup();
    }

    const cameraSection = document.querySelector(".camera-section");
    const canvas = document.getElementById("camera-frame");

    if (!cameraSection || !canvas) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

  /* ---- camera frame sequence ---- */
    const context = canvas.getContext("2d");
    const frameCount = 240;
    const currentFrame = i => `./frames/frame_${String(i + 1).padStart(3, "0")}.webp`;
    const images = [];
    const cameraSequence = { frame: 0 };

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    }
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < frameCount; i++) { const img = new Image(); img.src = currentFrame(i); images.push(img); }

    // Bug fix: attaching onload AFTER the loop above misses the
    // event entirely when frame 0 loads from cache (it can fire
    // synchronously during the loop, before this handler exists),
    // leaving a blank canvas until the user scrolls. Check
    // `.complete` first and only fall back to the load event.
    if (images[0].complete) {
      resizeCanvas();
      render();
    } else {
      images[0].onload = () => { resizeCanvas(); render(); };
    }

    function render() {
      const img = images[cameraSequence.frame];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = window.innerWidth, ch = window.innerHeight;
      const ir = img.width / img.height, cr = cw / ch;
      let w, h, x, y;
      if (ir > cr) { h = ch; w = h * ir; x = (cw - w) / 2; y = 0; }
      else { w = cw; h = w / ir; x = 0; y = (ch - h) / 2; }
      context.clearRect(0, 0, cw, ch);
      context.drawImage(img, x, y, w, h);
    }

    if (reducedMotion) {
      // Show the final frame and every panel in place, with no
      // scroll-driven motion, instead of skipping the section.
      cameraSequence.frame = frameCount - 1;
      render();
      document.querySelectorAll(".scroll-panel").forEach(panel => {
        gsap.set(panel, { opacity: 1, y: 0 });
      });
      window.heroCleanup = () => {
        window.removeEventListener("resize", resizeCanvas);
      };
      return;
    }

    gsap.to(cameraSequence, {
      frame: frameCount - 1, snap: "frame", ease: "none",
      scrollTrigger: { trigger: ".camera-section", start: "top top", end: "bottom bottom", scrub: .5 },
      onUpdate: render
    });

    document.querySelectorAll(".scroll-panel").forEach((panel, i) => {
      gsap.to(panel, { opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: ".camera-section", start: `${20 + i * 23}% center`, end: `${28 + i * 23}% center`, scrub: true } });
    });

    gsap.to(".hero-content", { y: -140, opacity: 0, scrollTrigger: { trigger: ".camera-section", start: "top top", end: "35% top", scrub: true } });
    gsap.to(".hero-card", { y: 90, opacity: 0, scrollTrigger: { trigger: ".camera-section", start: "top top", end: "30% top", scrub: true } });
    gsap.to(".scroll-indicator", { opacity: 0, scrollTrigger: { trigger: ".camera-section", start: "top top", end: "10% top", scrub: true } });

    window.heroCleanup = () => {
        window.removeEventListener("resize", resizeCanvas);
    };
};