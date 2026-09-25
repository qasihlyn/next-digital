/* =========================================================
   NEXT DIGITAL
   FILM ROW + PHONE SYNC
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initFilmRow() {

        const filmRow =
            document.getElementById("filmrow");

        const track =
            document.getElementById("filmTrack");

        const phone =
            document.getElementById("phoneMedia");

        const phoneImage =
            document.getElementById("phoneMediaImage");

        const nextButton =
            document.getElementById("filmNext");

        const backButton =
            document.getElementById("filmBack");


        /*
         * If the partial hasn't loaded yet,
         * don't crash the entire site.
         */

        if (
            !filmRow ||
            !track ||
            !phone ||
            !phoneImage
        ) {

            return false;

        }


        /* =================================================
           READ ORIGINAL FILM ITEMS
        ================================================= */

        const originalItems =
            Array.from(
                track.querySelectorAll(
                    ".film-item[data-card-id]"
                )
            );


        if (!originalItems.length) {

            console.warn(
                "Film Row: No film items found."
            );

            return false;

        }


        /* =================================================
           BUILD CARD DATA
        ================================================= */

        const cards =
            originalItems.map(item => {

                const image =
                    item.querySelector("img");

                return {

                    id:
                        item.dataset.cardId,

                    src:
                        image
                            ? image.src
                            : "",

                    alt:
                        image
                            ? image.alt
                            : ""

                };

            });


        /* =================================================
           CREATE INFINITE MARQUEE
        ================================================= */

        const copies = 4;

        const sequence = [];


        for (
            let i = 0;
            i < copies;
            i++
        ) {

            cards.forEach(card => {

                sequence.push(card);

            });

        }


        /*
         * Replace the original HTML
         * with the duplicated sequence.
         */

        track.innerHTML = "";


        sequence.forEach(card => {

            const item =
                document.createElement("div");

            item.className =
                "film-item";

            item.dataset.cardId =
                card.id;

            item.tabIndex = 0;


            const img =
                document.createElement("img");

            img.src =
                card.src;

            img.alt =
                card.alt;

            img.loading =
                "lazy";


            item.appendChild(img);

            track.appendChild(item);

        });


        const items =
            Array.from(
                track.querySelectorAll(".film-item")
            );


        /* =================================================
           STATE
        ================================================= */

        let activeIndex = 0;

        let position = 0;

        let setWidth = 0;

        let dragging = false;

        let dragStartX = 0;

        let dragStartPosition = 0;

        let lastTimestamp = null;

        let autoScroll = true;


        /* =================================================
           MEASURE ONE COMPLETE SET
        ================================================= */

        function measure() {

            if (
                items.length <=
                cards.length
            ) {

                return;

            }


            const first =
                items[0]
                    .getBoundingClientRect();


            const nextSet =
                items[cards.length]
                    .getBoundingClientRect();


            setWidth =
                nextSet.left -
                first.left;

        }


        /*
         * Wait until layout has been painted.
         */

        requestAnimationFrame(() => {

            measure();

        });


        window.addEventListener(
            "resize",
            measure
        );


        /* =================================================
           WRAP MARQUEE
        ================================================= */

        function wrapPosition() {

            if (setWidth <= 0) {

                return;

            }


            while (
                position <= -setWidth
            ) {

                position += setWidth;

            }


            while (
                position > 0
            ) {

                position -= setWidth;

            }

        }


        /* =================================================
           CENTER DETECTION
        ================================================= */

        function getCenterCard() {

            const rowRect =
                filmRow.getBoundingClientRect();


            const centerX =
                rowRect.left +
                rowRect.width / 2;


            let closest =
                null;

            let closestDistance =
                Infinity;


            items.forEach(item => {

                const rect =
                    item.getBoundingClientRect();


                /*
                 * Ignore cards completely
                 * outside the viewport.
                 */

                if (
                    rect.right <
                    rowRect.left ||

                    rect.left >
                    rowRect.right
                ) {

                    return;

                }


                const itemCenter =
                    rect.left +
                    rect.width / 2;


                const distance =
                    Math.abs(
                        itemCenter -
                        centerX
                    );


                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closest =
                        item;

                }

            });


            return closest;

        }


        /* =================================================
           PHONE UPDATE
        ================================================= */

        function updatePhone(
            cardId,
            animate = true
        ) {

            const cardIndex =
                cards.findIndex(
                    card =>
                        card.id === cardId
                );


            if (
                cardIndex === -1
            ) {

                return;

            }


            const card =
                cards[cardIndex];


            activeIndex =
                cardIndex;


            /*
             * Update active film cards.
             */

            items.forEach(item => {

                item.classList.toggle(
                    "is-active",
                    item.dataset.cardId ===
                    cardId
                );

            });


            /* =============================================
               PHONE ANIMATION
            ============================================= */

            if (animate) {

                phone.classList.add(
                    "is-changing"
                );


                setTimeout(() => {

                    phoneImage.src =
                        card.src;

                    phoneImage.alt =
                        card.alt;


                    requestAnimationFrame(() => {

                        phone.classList.remove(
                            "is-changing"
                        );

                    });

                }, 180);

            } else {

                phoneImage.src =
                    card.src;

                phoneImage.alt =
                    card.alt;

            }

        }


        /* =================================================
           INITIAL PHONE
        ================================================= */

        updatePhone(
            cards[0].id,
            false
        );


        /* =================================================
           ANIMATION LOOP
        ================================================= */

        const speed =
            0.024;


        function animate(timestamp) {

            if (
                lastTimestamp === null
            ) {

                lastTimestamp =
                    timestamp;

            }


            const delta =
                timestamp -
                lastTimestamp;


            lastTimestamp =
                timestamp;


            if (
                !dragging &&
                autoScroll
            ) {

                position -=
                    speed * delta;

                wrapPosition();

            }


            track.style.transform =
                `translate3d(${position}px,0,0)`;


            /*
             * Detect center card.
             */

            if (
                autoScroll &&
                !dragging
            ) {

                const centered =
                    getCenterCard();


                if (centered) {

                    const id =
                        centered.dataset.cardId;


                    if (
                        id !==
                        cards[activeIndex].id
                    ) {

                        updatePhone(id);

                    }

                }

            }


            requestAnimationFrame(
                animate
            );

        }


        requestAnimationFrame(
            animate
        );


        /* =================================================
           HOVER
        ================================================= */

        items.forEach(item => {

            item.addEventListener(
                "mouseenter",
                () => {

                    autoScroll = false;

                    updatePhone(
                        item.dataset.cardId
                    );

                }
            );


            item.addEventListener(
                "focus",
                () => {

                    autoScroll = false;

                    updatePhone(
                        item.dataset.cardId
                    );

                }
            );

        });


        filmRow.addEventListener(
            "mouseleave",
            () => {

                autoScroll = true;

            }
        );


        /* =================================================
           NEXT / BACK
        ================================================= */

        function changeCard(direction) {

            autoScroll = false;


            activeIndex =
                (
                    activeIndex +
                    direction +
                    cards.length
                ) %
                cards.length;


            const card =
                cards[activeIndex];


            updatePhone(
                card.id
            );


            /*
             * Move marquee toward selected card.
             */

            const matchingItem =
                items.find(
                    item =>
                        item.dataset.cardId ===
                        card.id
                );


            if (matchingItem) {

                const rowRect =
                    filmRow.getBoundingClientRect();


                const itemRect =
                    matchingItem.getBoundingClientRect();


                const rowCenter =
                    rowRect.left +
                    rowRect.width / 2;


                const itemCenter =
                    itemRect.left +
                    itemRect.width / 2;


                position +=
                    rowCenter -
                    itemCenter;


                wrapPosition();

            }

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    changeCard(1);

                }
            );

        }


        if (backButton) {

            backButton.addEventListener(
                "click",
                () => {

                    changeCard(-1);

                }
            );

        }


        /* =================================================
           MOUSE DRAG
        ================================================= */

        function startDrag(x) {

            dragging = true;

            autoScroll = false;

            dragStartX = x;

            dragStartPosition =
                position;

            filmRow.classList.add(
                "is-dragging"
            );

        }


        function moveDrag(x) {

            if (!dragging) {

                return;

            }


            position =
                dragStartPosition +
                (x - dragStartX);


            wrapPosition();

        }


        function endDrag() {

            if (!dragging) {

                return;

            }


            dragging = false;

            filmRow.classList.remove(
                "is-dragging"
            );

        }


        filmRow.addEventListener(
            "mousedown",
            event => {

                startDrag(
                    event.pageX
                );

            }
        );


        window.addEventListener(
            "mousemove",
            event => {

                if (!dragging) {

                    return;

                }


                event.preventDefault();

                moveDrag(
                    event.pageX
                );

            }
        );


        window.addEventListener(
            "mouseup",
            endDrag
        );


        /* =================================================
           TOUCH DRAG
        ================================================= */

        filmRow.addEventListener(
            "touchstart",
            event => {

                startDrag(
                    event.touches[0].pageX
                );

            },
            {
                passive: true
            }
        );


        filmRow.addEventListener(
            "touchmove",
            event => {

                moveDrag(
                    event.touches[0].pageX
                );

            },
            {
                passive: true
            }
        );


        filmRow.addEventListener(
            "touchend",
            endDrag
        );


        /* =================================================
           SUCCESS
        ================================================= */

        console.log(
            "✓ Film Row initialized"
        );


        return true;

    }


    /* =====================================================
       WAIT FOR PARTIAL
    ===================================================== */

    function boot() {

        if (
            document.getElementById(
                "filmrow"
            )
        ) {

            initFilmRow();

            return;

        }


        /*
         * Your main.js loads HTML partials
         * asynchronously.
         *
         * So wait for it.
         */

        const observer =
            new MutationObserver(
                () => {

                    if (
                        document.getElementById(
                            "filmrow"
                        )
                    ) {

                        observer.disconnect();

                        initFilmRow();

                    }

                }
            );


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /*
     * Run after DOM is ready.
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }

})();