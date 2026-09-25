/* js/navbar.js
   -------------------------------------------------------------------------
   Drives the full-width liquid-glass navbar:
     • .active-pill  — springy sliding highlight that sits under the
       current-page link and follows hover
     • .liquid-glare — pointer-tracked light glare across the glass
     • .magnetic     — subtle pointer pull on the CTA

   Safe to call more than once (home-boot.js calls initNavbar() explicitly;
   every other page relies on the self-boot at the bottom of this file).
   ------------------------------------------------------------------------- */

window.initNavbar = function initNavbar() {
    if (window.navbarCleanup) {
        window.navbarCleanup();
    }

    const nav = document.querySelector(".nav");

    if (!nav) {
        return;
    }

    const navRight = nav.querySelector(".nav-right");
    const pill = nav.querySelector(".active-pill");
    const navlinks = Array.from(nav.querySelectorAll(".navlink"));
    const glare = nav.querySelector(".liquid-glare");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    const cleanupFns = [];

    /* =====================================================
       ACTIVE-PILL — slide a highlight under the current or
       hovered link. Pure transform/width animation in CSS.
    ===================================================== */

    const here = window.location.pathname.replace(/\/+$/, "") || "/";

    const linkPath = href => {
        try {
            return new URL(href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
        } catch (error) {
            return null;
        }
    };

    /* A link is "active" when it points at this exact page. Pure-hash
       links back to the home page (e.g. "/#platform") are ignored so
       nothing lights up on "/" itself. Prefer the hash-free link when
       several point at the same path (e.g. "/about" over
       "/about#film-showcase"). */
    const isActive = link => {
        const href = link.getAttribute("href") || "";
        const path = linkPath(href);

        if (path === null || path !== here) {
            return false;
        }

        return !href.includes("#") || path !== "/";
    };

    const activeLink =
        navlinks.find(link => isActive(link) && !link.getAttribute("href").includes("#")) ||
        navlinks.find(isActive) ||
        null;

    if (activeLink) {
        activeLink.classList.add("active");
        activeLink.setAttribute("aria-current", "page");
    }

    const movePillTo = link => {
        if (!pill || !link) {
            return;
        }

        pill.style.width = `${link.offsetWidth}px`;
        pill.style.transform =
            `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
        pill.classList.add("is-visible");
    };

    const resetPill = () => {
        if (!pill) {
            return;
        }

        if (activeLink) {
            movePillTo(activeLink);
        } else {
            pill.classList.remove("is-visible");
        }
    };

    if (pill && navlinks.length) {
        // No transition on the very first placement — it should just
        // appear under the active link, not fly in from the corner.
        const prevTransition = pill.style.transition;
        pill.style.transition = "none";
        resetPill();
        // Force reflow so the transition removal takes effect before we
        // restore it.
        void pill.offsetWidth;
        pill.style.transition = prevTransition;

        if (hoverCapable) {
            navlinks.forEach(link => {
                const enter = () => movePillTo(link);
                link.addEventListener("mouseenter", enter);
                cleanupFns.push(() => link.removeEventListener("mouseenter", enter));
            });

            navRight.addEventListener("mouseleave", resetPill);
            cleanupFns.push(() => navRight.removeEventListener("mouseleave", resetPill));
        }

        let resizeRaf = 0;
        const handleResize = () => {
            if (resizeRaf) {
                return;
            }

            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                resetPill();
            });
        };

        window.addEventListener("resize", handleResize, { passive: true });
        cleanupFns.push(() => {
            window.removeEventListener("resize", handleResize);

            if (resizeRaf) {
                cancelAnimationFrame(resizeRaf);
            }
        });
    }

    /* =====================================================
       LIQUID GLARE — track the pointer across the glass.
       CSS handles the fade via .nav:hover; JS only feeds
       the --x / --y position.
    ===================================================== */

    if (glare && hoverCapable && !reducedMotion) {
        const handleGlare = event => {
            const rect = nav.getBoundingClientRect();
            glare.style.setProperty("--x", `${event.clientX - rect.left}px`);
            glare.style.setProperty("--y", `${event.clientY - rect.top}px`);
        };

        nav.addEventListener("mousemove", handleGlare);
        cleanupFns.push(() => nav.removeEventListener("mousemove", handleGlare));
    }

    /* =====================================================
       MAGNETIC — subtle pointer-tracked translate on the
       CTA, bounded to a small radius. Touch / reduced-motion
       opt out entirely.
    ===================================================== */

    if (!reducedMotion && hoverCapable) {
        const magneticEls = Array.from(nav.querySelectorAll(".magnetic"));

        magneticEls.forEach(el => {
            const strength = 0.25;
            const hasGsapQuickTo =
                typeof window.gsap !== "undefined" &&
                typeof gsap.quickTo === "function";

            const moveX = hasGsapQuickTo
                ? gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" })
                : null;
            const moveY = hasGsapQuickTo
                ? gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" })
                : null;

            const handleMove = event => {
                const rect = el.getBoundingClientRect();
                const relX = (event.clientX - rect.left - rect.width / 2) * strength;
                const relY = (event.clientY - rect.top - rect.height / 2) * strength;

                if (moveX && moveY) {
                    moveX(relX);
                    moveY(relY);
                } else {
                    el.style.transform = `translate3d(${relX}px, ${relY}px, 0)`;
                }
            };

            const handleLeave = () => {
                if (moveX && moveY) {
                    moveX(0);
                    moveY(0);
                } else {
                    el.style.transform = "";
                }
            };

            el.addEventListener("mousemove", handleMove);
            el.addEventListener("mouseleave", handleLeave);

            cleanupFns.push(() => {
                el.removeEventListener("mousemove", handleMove);
                el.removeEventListener("mouseleave", handleLeave);
                el.style.transform = "";
            });
        });
    }

    window.navbarCleanup = () => {
        cleanupFns.forEach(fn => fn());
        window.navbarCleanup = null;
    };
};

/* Self-boot for pages that don't run an explicit initNavbar() call. */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initNavbar, { once: true });
} else {
    window.initNavbar();
}
