/* =========================================================
   NEXT DIGITAL — ABOUT PAGE BOOT
   =========================================================

   Blade renders every section server-side now. This keeps
   about.js's reveal / timeline-scrub / stat-counter logic
   verbatim, minus the loadPartial() fetch orchestration.
   ========================================================= */

"use strict";

const hasGsap =
    typeof window.gsap !== "undefined" &&
    typeof window.ScrollTrigger !== "undefined";

if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
} else {
    console.warn("GSAP or ScrollTrigger could not be loaded.");
}

const REVEAL_SELECTOR =
    ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, " +
    ".glass-card, .team-card, .telemetry-box, .timeline-item, .relative-box";

function initScrollReveals(prefersReducedMotion) {
    createScrollReveal(REVEAL_SELECTOR, { prefersReducedMotion });
}

function initTimelineScrub(prefersReducedMotion) {
    const timeline = document.querySelector(".futuristic-timeline");
    const spineGlow = document.querySelector(".timeline-spine-glow");

    if (!timeline || !spineGlow) {
        return;
    }

    if (prefersReducedMotion || !hasGsap) {
        gsap && gsap.set(spineGlow, { scaleY: 1 });
        return;
    }

    gsap.to(spineGlow, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: timeline,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6
        }
    });
}

function initStatCounters(prefersReducedMotion) {
    const counters = document.querySelectorAll(".stat-num[data-count-to]");

    if (!counters.length) {
        return;
    }

    counters.forEach(el => {
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || "";

        if (Number.isNaN(target)) {
            return;
        }

        if (prefersReducedMotion || !hasGsap) {
            el.textContent = target + suffix;
            return;
        }

        ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => {
                const counter = { value: 0 };

                gsap.to(counter, {
                    value: target,
                    duration: 1.6,
                    ease: "power2.out",
                    onUpdate: () => {
                        el.textContent = Math.round(counter.value) + suffix;
                    },
                    onComplete: () => {
                        el.textContent = target + suffix;
                    }
                });
            }
        });
    });
}

function initialize(name) {
    const initializer = window[name];

    if (typeof initializer !== "function") {
        console.warn(`${name}() was not found.`);
        return;
    }

    try {
        initializer();
    } catch (error) {
        console.error(`${name}() failed to initialize.`, error);
    }
}

async function bootAboutPage() {
    initialize("initFooter");
    // film-row.js self-boots on DOMContentLoaded via its own
    // MutationObserver-backed IIFE — no manual init needed here.

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    initScrollReveals(prefersReducedMotion);
    initTimelineScrub(prefersReducedMotion);
    initStatCounters(prefersReducedMotion);

    if (!hasGsap) {
        return;
    }

    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAboutPage, { once: true });
} else {
    bootAboutPage();
}
