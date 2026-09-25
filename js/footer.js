/* js/footer.js */

window.initFooter = function initFooter() {
    if (window.footerCleanup) {
        window.footerCleanup();
    }

    const footer = document.querySelector(".footer");

    if (!footer) {
        return;
    }

    const year = footer.querySelector(".footer-year");
    const backToTop = footer.querySelector(".footer-top-button");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const handleBackToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "auto" : "smooth"
        });
    };

    if (backToTop) {
        backToTop.addEventListener("click", handleBackToTop);
    }

    if (
        reducedMotion ||
        typeof gsap === "undefined" ||
        typeof ScrollTrigger === "undefined"
    ) {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const top = footer.querySelector(".footer-top");
    const word = footer.querySelector(".footer-word");
    const bottom = footer.querySelector(".footer-bottom");
    const columns = gsap.utils.toArray(
        ".footer-brand, .footer-cta, .footer-col",
        footer
    );
    const orbs = gsap.utils.toArray(".footer-orb", footer);

    const context = gsap.context(() => {
        gsap.set(columns, {
            y: 34,
            autoAlpha: 0,
            filter: "blur(6px)"
        });

        gsap.set(word, {
            yPercent: 22,
            autoAlpha: 0
        });

        gsap.set(bottom, {
            y: 20,
            autoAlpha: 0
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: footer,
                start: "top 78%",
                once: true
            }
        });

        timeline
            .to(columns, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                stagger: 0.09,
                duration: 0.85,
                ease: "power3.out"
            })
            .to(word, {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1.15,
                ease: "power4.out"
            }, "-=0.42")
            .to(bottom, {
                y: 0,
                autoAlpha: 1,
                duration: 0.65,
                ease: "power3.out"
            }, "-=0.6");

        gsap.to(word, {
            yPercent: -10,
            ease: "none",
            scrollTrigger: {
                trigger: footer,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.3
            }
        });

        gsap.to(orbs, {
            xPercent: index => (index === 0 ? -18 : 16),
            yPercent: index => (index === 0 ? 14 : -12),
            ease: "none",
            scrollTrigger: {
                trigger: footer,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5
            }
        });
    }, footer);

    window.footerCleanup = () => {
        context.revert();

        if (backToTop) {
            backToTop.removeEventListener("click", handleBackToTop);
        }
    };
};