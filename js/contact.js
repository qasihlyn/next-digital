/* js/contact.js */

window.initContact = function initContact() {
    if (window.contactCleanup) {
        window.contactCleanup();
    }

    const section = document.querySelector(".contact-cta");

    if (!section) {
        return;
    }

    const form = section.querySelector(".contact-form");
    const selectField = section.querySelector(".form-select");
    const select = section.querySelector("#contact-service");
    const response = section.querySelector(".contact-response");
    const backToTop = section.querySelector(".back-to-top");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const updateSelectState = () => {
        if (!selectField || !select) {
            return;
        }

        selectField.classList.toggle(
            "has-value",
            Boolean(select.value)
        );
    };

    updateSelectState();

    if (select) {
        select.addEventListener("change", updateSelectState);
    }

    const handleSubmit = async event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitButton = form.querySelector(".contact-submit");
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const result = await fetch(form.action, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    Accept: "application/json"
                },
                body: new FormData(form)
            });

            if (!result.ok) {
                throw new Error(`HTTP ${result.status}`);
            }

            response.textContent = "Thanks — your message is ready to send.";
            form.classList.add("is-submitted");
            form.reset();
        } catch (error) {
            console.error("Contact form submission failed.", error);
            response.textContent = "Something went wrong — please try again.";
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    };

    if (form) {
        form.addEventListener("submit", handleSubmit);
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

    const eyebrow = section.querySelector(".contact-eyebrow");
    const titleLines = gsap.utils.toArray(
        ".contact-title-line > span",
        section
    );
    // Note: a `::after` pseudo-element can't be selected with
    // querySelector — it always returns null and was never
    // animated. Give the accent underline a real element (e.g.
    // <span class="contact-title-accent-underline">) in the markup
    // if you want to animate it; removed the dead selector for now.
    const description = section.querySelector(".contact-description");
    const email = section.querySelector(".contact-email");
    const formCard = section.querySelector(".contact-form-card");
    const formItems = gsap.utils.toArray(
        ".form-field, .budget-group, .contact-submit-wrap",
        section
    );
    const shapes = gsap.utils.toArray(
        ".contact-orb, .contact-glass-shape",
        section
    );

    const context = gsap.context(() => {
        gsap.set(titleLines, {
            yPercent: 115,
            rotate: 2,
            autoAlpha: 0
        });

        gsap.set(
            [eyebrow, description, email],
            {
                y: 25,
                autoAlpha: 0,
                filter: "blur(6px)"
            }
        );

        gsap.set(formCard, {
            y: 70,
            autoAlpha: 0,
            scale: 0.97,
            filter: "blur(10px)"
        });

        gsap.set(formItems, {
            y: 22,
            autoAlpha: 0
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true
            }
        });

        timeline
            .to(eyebrow, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.7,
                ease: "power3.out"
            })
            .to(titleLines, {
                yPercent: 0,
                rotate: 0,
                autoAlpha: 1,
                stagger: 0.1,
                duration: 1.05,
                ease: "power4.out"
            }, "-=0.35")
            .to(description, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.72,
                ease: "power3.out"
            }, "-=0.55")
            .to(email, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.62,
                ease: "power3.out"
            }, "-=0.48")
            .to(formCard, {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 1,
                ease: "power4.out"
            }, "-=0.9")
            .to(formItems, {
                y: 0,
                autoAlpha: 1,
                stagger: 0.075,
                duration: 0.56,
                ease: "power3.out"
            }, "-=0.5");

        gsap.to(shapes, {
            xPercent: index => (index % 2 === 0 ? -12 : 10),
            yPercent: index => (index % 2 === 0 ? 12 : -8),
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5
            }
        });
    }, section);

    window.contactCleanup = () => {
        context.revert();

        if (select) {
            select.removeEventListener("change", updateSelectState);
        }

        if (form) {
            form.removeEventListener("submit", handleSubmit);
        }

        if (backToTop) {
            backToTop.removeEventListener("click", handleBackToTop);
        }
    };
};