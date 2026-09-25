/* =========================================================
   NEXT DIGITAL — FEATURES BENTO ANIMATION
   ========================================================= */

window.initFeatures = function initFeatures() {

    if (typeof gsap === "undefined") {
        console.warn("GSAP is required for Features animations.");
        return;
    }

    if (typeof ScrollTrigger === "undefined") {
        console.warn("GSAP ScrollTrigger is required.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector(".features");

    if (!section) return;

    const header = section.querySelector(".features-header");
    const cards = gsap.utils.toArray(section.querySelectorAll(".bcard"));
    const mediaCard = section.querySelector(".b2.feature-media");

    /* =====================================================
       HEADER REVEAL
       ===================================================== */

    if (header) {

        gsap.fromTo(
            header,

            {
                opacity: 0,
                y: 55,
                filter: "blur(10px)"
            },

            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",

                duration: 1.1,

                ease: "power4.out",

                scrollTrigger: {
                    trigger: section,
                    start: "top 78%",
                    once: true
                }
            }
        );
    }


    /* =====================================================
       BENTO CARD STAGGER
       ===================================================== */

    if (cards.length) {

        gsap.fromTo(
            cards,

            {
                opacity: 0,
                y: 80,
                scale: 0.92,
                filter: "blur(10px)"
            },

            {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",

                duration: 1.05,

                stagger: {
                    each: 0.14,
                    from: "start"
                },

                ease: "power4.out",

                scrollTrigger: {
                    trigger: section,
                    start: "top 65%",
                    once: true,

                    onEnter: () => {
                        cards.forEach(card => {
                            card.classList.add("is-visible");
                        });
                    }
                }
            }
        );
    }


    /* =====================================================
       LARGE IMAGE CARD — CINEMATIC PARALLAX
       ===================================================== */

    if (mediaCard) {

        gsap.fromTo(
            mediaCard,

            {
                y: 45
            },

            {
                y: -35,

                ease: "none",

                scrollTrigger: {
                    trigger: section,

                    start: "top bottom",
                    end: "bottom top",

                    scrub: 1.5
                }
            }
        );

    }


    /* =====================================================
       IMAGE FLOAT
       ===================================================== */

    if (mediaCard) {

        const image = mediaCard.querySelector("img");

        if (image) {

            gsap.to(image, {

                y: -10,

                duration: 2.8,

                repeat: -1,
                yoyo: true,

                ease: "sine.inOut"

            });

        }

    }


    /* =====================================================
       CARD PARALLAX
       ===================================================== */

    cards.forEach((card, index) => {

        if (card.classList.contains("feature-media")) return;

        const direction = index % 2 === 0 ? 1 : -1;

        gsap.to(card, {

            y: direction * -18,

            ease: "none",

            scrollTrigger: {

                trigger: section,

                start: "top bottom",
                end: "bottom top",

                scrub: 2

            }

        });

    });


    /* =====================================================
       MOUSE FOLLOW GLOW
       ===================================================== */

    cards.forEach(card => {

        if (card.classList.contains("feature-media")) return;

        card.addEventListener("pointermove", event => {

            const rect = card.getBoundingClientRect();

            const x =
                ((event.clientX - rect.left) / rect.width) * 100;

            const y =
                ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty("--mouse-x", `${x}%`);
            card.style.setProperty("--mouse-y", `${y}%`);

        });

        card.addEventListener("pointerleave", () => {

            card.style.setProperty("--mouse-x", "50%");
            card.style.setProperty("--mouse-y", "50%");

        });

    });


    /* =====================================================
       REFRESH AFTER IMAGES LOAD
       ===================================================== */

    window.addEventListener("load", () => {

        ScrollTrigger.refresh();

    });

};