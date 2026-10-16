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

    /* =====================================================
       MOBILE MENU — below 760px navbar.css hides the page
       links, so add a menu button that opens a glass panel
       with the same links. Built here so every page gets it
       without duplicating markup in each HTML file.
    ===================================================== */

    if (navRight && navlinks.length) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "nav-toggle";
        toggle.setAttribute("aria-label", "Open menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "mobile-menu");
        toggle.innerHTML =
            '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
            '<span class="nav-toggle-bar" aria-hidden="true"></span>';
        navRight.appendChild(toggle);

        const panel = document.createElement("nav");
        panel.className = "mobile-menu";
        panel.id = "mobile-menu";
        panel.setAttribute("aria-label", "Mobile");

        navlinks.forEach(link => {
            const item = document.createElement("a");
            item.className = "mobile-menu-link";
            item.href = link.getAttribute("href");
            item.textContent = link.textContent.trim();

            if (link === activeLink) {
                item.setAttribute("aria-current", "page");
            }

            panel.appendChild(item);
        });

        document.body.appendChild(panel);

        const setOpen = open => {
            panel.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        };

        const handleToggle = () => setOpen(!panel.classList.contains("is-open"));
        const handleOutside = event => {
            if (!panel.contains(event.target) && !toggle.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleKey = event => {
            if (event.key === "Escape" && panel.classList.contains("is-open")) {
                setOpen(false);
                toggle.focus();
            }
        };
        const handleLinkClick = () => setOpen(false);
        const desktopQuery = window.matchMedia("(min-width: 761px)");
        const handleBreakpoint = () => {
            if (desktopQuery.matches) {
                setOpen(false);
            }
        };

        toggle.addEventListener("click", handleToggle);
        document.addEventListener("click", handleOutside);
        document.addEventListener("keydown", handleKey);
        panel.addEventListener("click", handleLinkClick);
        desktopQuery.addEventListener("change", handleBreakpoint);

        cleanupFns.push(() => {
            toggle.removeEventListener("click", handleToggle);
            document.removeEventListener("click", handleOutside);
            document.removeEventListener("keydown", handleKey);
            panel.removeEventListener("click", handleLinkClick);
            desktopQuery.removeEventListener("change", handleBreakpoint);
            toggle.remove();
            panel.remove();
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
