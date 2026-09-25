/* =========================================================
   NEXT DIGITAL — HOME PAGE BOOT
   =========================================================

   Blade renders every section server-side now, so this
   replaces main.js's loadPartial() orchestration with a
   plain boot: initialize each section module, run the
   generic reveal system, then refresh ScrollTrigger.
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

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

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

/* =========================================================
   GENERIC REVEAL SYSTEM (from main.js)
   ========================================================= */

function initRevealElements() {
    const targets = document.querySelectorAll(".reveal");

    if (!targets.length) {
        return;
    }

    if (prefersReducedMotion) {
        targets.forEach(target => target.classList.add("in-view"));
        return;
    }

    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("in-view");
                revealObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.18, rootMargin: "0px 0px -5% 0px" }
    );

    targets.forEach(target => revealObserver.observe(target));
}

function initSectionScrollAnimations() {
    if (!hasGsap || prefersReducedMotion) {
        return;
    }

    gsap.utils.toArray(".section-title, .eyebrow").forEach(element => {
        if (
            element.closest(".features") ||
            element.closest(".momentum") ||
            element.closest(".camera-section") ||
            element.closest(".contact-cta") ||
            element.closest(".converts-cyber")
        ) {
            return;
        }

        gsap.fromTo(
            element,
            { y: 35, autoAlpha: 0, filter: "blur(5px)" },
            {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: { trigger: element, start: "top 88%", once: true }
            }
        );
    });
}

/* =========================================================
   MAIN BOOT
   ========================================================= */

async function bootPage() {
    document.documentElement.classList.add("js");

    initialize("initHero");
    initialize("initConverts");
    initialize("initMomentum");
    initialize("initFeatures");
    initialize("initContact");
    initialize("initFooter");
    initialize("initNavbar");

    initRevealElements();
    initSectionScrollAnimations();

    if (!hasGsap) {
        return;
    }

    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });

    const pageImages = Array.from(document.images);

    await Promise.all(
        pageImages.map(image => {
            if (image.complete) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
            });
        })
    );

    ScrollTrigger.refresh();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPage, { once: true });
} else {
    bootPage();
}
