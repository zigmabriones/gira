/**
 * Make Events tr's Clickable
 */
function setupEventTable() {
    const events = document.querySelectorAll('.event-table__clickable');
    events.forEach(event => {
        event.addEventListener('click', () => {
            const href = event.dataset.href;
            if (href) {
                window.location.assign(href);
            }
        });
    });
};

/**
 * Setup Carousels
 */
function setupCarousel() {
    // Carousel Buttons Functionality
    const radioBtns = document.querySelectorAll('.carousel__navigation-button');
    const firstPage = document.querySelector('.carousel__media--first');
    radioBtns.forEach(button => {
        button.addEventListener('click', () => {
            const clickedBtnNumber = button.htmlFor.substring(5);
            const moveLeftBy = clickedBtnNumber * -20;
            firstPage.style.cssText = `margin-left: ${moveLeftBy}%;`;

            // Show selected button
            radioBtns.forEach(radioBtn => {
                radioBtn.style.backgroundColor = '#888888';
            });
            button.style.backgroundColor = '#000';
        });
    });
};