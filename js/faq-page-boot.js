/* =========================================================
   NEXT DIGITAL — FAQ PAGE BOOT
   =========================================================

   Blade renders every section server-side now. Keeps the
   accordion + reveal logic from faq-page.js, minus the
   loadPartial() fetch orchestration.
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

function initFaqAccordion() {
    const items = Array.from(document.querySelectorAll(".faq-item"));

    if (!items.length) {
        return;
    }

    items.forEach(item => {
        const toggle = item.querySelector(".faq-toggle");

        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            items.forEach(other => {
                other.classList.remove("is-open");
                other.querySelector(".faq-toggle").setAttribute("aria-expanded", "false");
            });

            if (!isOpen) {
                item.classList.add("is-open");
                toggle.setAttribute("aria-expanded", "true");
            }
        });
    });
}

async function bootFaqPage() {
    initialize("initFooter");
    initFaqAccordion();

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    createScrollReveal(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .faq-item",
        { prefersReducedMotion }
    );

    if (!hasGsap) {
        return;
    }

    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootFaqPage, { once: true });
} else {
    bootFaqPage();
}
