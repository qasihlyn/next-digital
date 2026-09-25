/* =========================================================
   NEXT DIGITAL — SHARED SCROLL-REVEAL ENGINE
   =========================================================

   Used by about.html and contact.html. Batches elements
   matching `selector` and adds ".in" once each batch enters
   the viewport, with a small stagger so a row of cards doesn't
   pop in as one flat block. Fires once per element — this is
   for marketing pages, not UI a visitor returns to all day.

   Falls back to instantly marking everything "in" when GSAP/
   ScrollTrigger aren't available or prefers-reduced-motion is
   set.
   ========================================================= */

"use strict";

function createScrollReveal(selector, options) {
    options = options || {};

    const prefersReducedMotion =
        typeof options.prefersReducedMotion === "boolean"
            ? options.prefersReducedMotion
            : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stagger =
        typeof options.stagger === "number" ? options.stagger : 0.06;

    const start = options.start || "top 85%";

    const hasGsap =
        typeof window.gsap !== "undefined" &&
        typeof window.ScrollTrigger !== "undefined";

    const targets = document.querySelectorAll(selector);

    if (!targets.length) {
        return;
    }

    if (prefersReducedMotion || !hasGsap) {
        targets.forEach(el => el.classList.add("in"));
        return;
    }

    ScrollTrigger.batch(selector, {
        start,
        once: true,
        onEnter: batch => {
            batch.forEach((el, index) => {
                gsap.delayedCall(index * stagger, () => {
                    el.classList.add("in");
                });
            });
        }
    });
}

window.createScrollReveal = createScrollReveal;
