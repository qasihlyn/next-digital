/* =========================================================
   NEXT DIGITAL — CONTACT PAGE BOOT
   =========================================================

   Blade renders every section server-side now. Form submit
   posts to the real /contact route (see contact-page-form.js
   below) instead of contact-page.js's old setTimeout fake.
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

async function bootContactPage() {
    initialize("initFooter");
    initialize("initContactPageForm");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    createScrollReveal(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .contact-info-card",
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
    document.addEventListener("DOMContentLoaded", bootContactPage, { once: true });
} else {
    bootContactPage();
}
