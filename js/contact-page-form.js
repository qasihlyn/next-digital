/* =========================================================
   NEXT DIGITAL — STANDALONE CONTACT PAGE FORM
   =========================================================

   Real fetch() POST to /contact, replacing contact-page.js's
   old setTimeout fake-success.
   ========================================================= */

"use strict";

window.initContactPageForm = function initContactPageForm() {
    const form = document.getElementById("contact-page-form");

    if (!form) {
        return;
    }

    const submitButton = form.querySelector(".contact-page-submit");
    const response = form.querySelector(".contact-page-response");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        submitButton.disabled = true;
        submitButton.querySelector("span").textContent = "Sending…";

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

            if (response) {
                response.textContent = "Thanks — we'll get back to you within 24 hours.";
            }

            form.reset();
        } catch (error) {
            console.error("Contact form submission failed.", error);

            if (response) {
                response.textContent = "Something went wrong — please try again.";
            }
        } finally {
            submitButton.disabled = false;
            submitButton.querySelector("span").textContent = "Send message";
        }
    });
};
