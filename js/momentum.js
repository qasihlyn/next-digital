/* js/momentum.js */

window.initMomentum = function initMomentum() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (window.momentumCleanup) {
        window.momentumCleanup();
    }

    const section = document.querySelector(".momentum");

    if (!section) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        return;
    }

    const stages = gsap.utils.toArray(".momentum-stage", section);
    const words = gsap.utils.toArray(".stage-word", section);
    const metas = gsap.utils.toArray(".stage-meta", section);
    const copies = gsap.utils.toArray(".stage-copy", section);
    // Removed: `.stage-word::after` can't be matched by
    // querySelectorAll (it's a pseudo-element, not a real node),
    // so `underlines` was always an empty array and never
    // animated anywhere below. Same mistake as the removed
    // `titleAccent` selector in contact.js — if you want the
    // underline animated, give it a real element in the markup.

    const cursor = section.querySelector(".momentum-cursor");
    const progressFill = section.querySelector(".momentum-progress-fill");
    const progressLabel = section.querySelector(".momentum-progress-label");
    const progressValue = section.querySelector(".momentum-progress-value");
    const orbOne = section.querySelector(".momentum-orb-one");
    const orbTwo = section.querySelector(".momentum-orb-two");
    const intro = section.querySelector(".momentum-intro");

    const context = gsap.context(() => {
        gsap.set(stages, {
            autoAlpha: 0,
            filter: "blur(14px)"
        });

        gsap.set(words, {
            scale: 0.76,
            yPercent: 13,
            rotation: -2,
            transformOrigin: "50% 50%"
        });

        gsap.set(metas, {
            autoAlpha: 0,
            y: 18
        });

        gsap.set(copies, {
            autoAlpha: 0,
            y: 30,
            scale: 0.96
        });

        gsap.set(stages[0], {
            autoAlpha: 1,
            filter: "blur(0px)"
        });

        gsap.set(words[0], {
            scale: 1,
            yPercent: 0,
            rotation: 0
        });

        gsap.set(metas[0], {
            autoAlpha: 1,
            y: 0
        });

        gsap.set(copies[0], {
            autoAlpha: 1,
            y: 0,
            scale: 1
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.15,
                invalidateOnRefresh: true,
                onUpdate: self => {
                    const progress = self.progress;
                    const index = Math.min(3, Math.floor(progress * 4));
                    const current = index + 1;
                    const percentage = Math.round(25 + progress * 75);

                    if (progressFill) {
                        gsap.set(progressFill, {
                            scaleX: Math.max(0.25, progress)
                        });
                    }

                    if (progressLabel) {
                        progressLabel.textContent = `0${current} — 04`;
                    }

                    if (progressValue) {
                        progressValue.textContent = `${percentage}%`;
                    }

                    if (cursor) {
                        const x = 50 + Math.sin(progress * Math.PI * 3) * 28;
                        const y = 53 + Math.cos(progress * Math.PI * 2) * 22;

                        gsap.set(cursor, {
                            left: `${x}%`,
                            top: `${y}%`
                        });
                    }
                }
            }
        });

        stages.forEach((stage, index) => {
            const word = words[index];
            const meta = metas[index];
            const copy = copies[index];
            const start = index;
            const exit = index + 0.8;

            if (index > 0) {
                timeline
                    .to(stage, {
                        autoAlpha: 1,
                        filter: "blur(0px)",
                        duration: 0.18,
                        ease: "power2.out"
                    }, start)
                    .to(word, {
                        scale: 1,
                        yPercent: 0,
                        rotation: 0,
                        duration: 0.72,
                        ease: "power4.out"
                    }, start)
                    .to(meta, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.38,
                        ease: "power3.out"
                    }, start + 0.08)
                    .to(copy, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        ease: "power3.out"
                    }, start + 0.16);
            }

            if (index < stages.length - 1) {
                timeline
                    .to(word, {
                        scale: 0.72,
                        xPercent: index % 2 === 0 ? -13 : 13,
                        yPercent: -8,
                        rotation: index % 2 === 0 ? -3 : 3,
                        autoAlpha: 0.15,
                        filter: "blur(7px)",
                        duration: 0.72,
                        ease: "power3.inOut"
                    }, exit)
                    .to(meta, {
                        autoAlpha: 0.14,
                        y: -12,
                        duration: 0.36,
                        ease: "power2.inOut"
                    }, exit)
                    .to(copy, {
                        autoAlpha: 0,
                        y: -22,
                        scale: 0.96,
                        duration: 0.36,
                        ease: "power2.inOut"
                    }, exit)
                    .to(stage, {
                        autoAlpha: 1,
                        duration: 0.1
                    }, exit + 0.35);
            }
        });

        if (intro) {
            gsap.to(intro, {
                y: -35,
                autoAlpha: 0.28,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "42% top",
                    scrub: true
                }
            });
        }

        if (orbOne && orbTwo) {
            gsap.to(orbOne, {
                xPercent: -20,
                yPercent: 28,
                scale: 1.2,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.4
                }
            });

            gsap.to(orbTwo, {
                xPercent: 28,
                yPercent: -18,
                scale: 1.18,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.6
                }
            });
        }
    }, section);

    window.momentumCleanup = () => {
        context.revert();
    };
};