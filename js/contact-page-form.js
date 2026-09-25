/* =========================================================
   NEXT DIGITAL — STANDALONE CONTACT PAGE FORM
   =========================================================

   Writes submissions to Cloud Firestore (collection
   `contactSubmissions`) via js/firebase-init.js, replacing the
   old fetch() POST to a form endpoint.

   Loaded as <script type="module"> in contact.html.
   ========================================================= */

"use strict";

import { addContactSubmission } from "./firebase-init.js";

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

        submitButton.disabled = true;
        submitButton.querySelector("span").textContent = "Sending…";

        try {
            const fields = new FormData(form);

            await addContactSubmission({
                name: (fields.get("name") || "").toString().trim(),
                email: (fields.get("email") || "").toString().trim(),
                subject: (fields.get("subject") || "").toString().trim(),
                message: (fields.get("message") || "").toString().trim(),
                source: (fields.get("source") || "contact_page").toString()
            });

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
