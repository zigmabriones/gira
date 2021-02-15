/**
 * Opens Desktop Nav Slide Menu
 */
function openSlideMenu() {
    const menu = document.getElementById('menu');
    menu.childNodes.forEach(child => child.style.display = 'block');
    menu.style.width = '350px';
    menu.style.boxShadow = '10px 0 50px 10px rgba(0, 0, 0, 0.4)';
};

/**
 * Closes Desktop Nav Slide Menu
 */
function closeSlideMenu() {
    const menu = document.getElementById('menu');
    menu.childNodes.forEach(child => child.style.display = 'none');
    menu.style.width = '0px';
    menu.style.boxShadow = 'none';
};

/**
 * Opens Mobile Nav Slide Menu
 */
function openMobileSlideMenu() {
    document.body.style.overflow = 'hidden';
    const menu = document.getElementById('menu--mobile');
    menu.childNodes.forEach(child => child.style.display = 'block');
    menu.style.height = '100vh';
};

/**
 * Closes Mobile Nav Slide Menu
 */
function closeMobileSlideMenu() {
    document.body.style.overflow = 'visible';
    const menu = document.getElementById('menu--mobile');
    menu.childNodes.forEach(child => child.style.display = 'none');
    menu.style.height = '';
};

/**
 * Sets up nav fade animation
 */
function navFade() {
    const startFade = 380;
    const checkpoint = 700;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const side = document.querySelector('.side--hidden');
        const mobileNav = document.querySelector('.side--mobile--hidden');

        if (currentScroll < startFade) {
            side.style.opacity = 0;
            side.style.display = 'none';
            mobileNav.style.opacity = 0;
            mobileNav.style.display = 'none';
            return;
        }
        side.style.display = 'block';
        mobileNav.style.display = 'flex';
        if (currentScroll <= checkpoint) {
            var opacity = 0 + (currentScroll - startFade) / checkpoint;
        } else {
            var opacity = 1;
        }
        side.style.opacity = opacity;
        mobileNav.style.opacity = opacity;
    });
};

/**
 * Sets up Mobile Nav
 */
function setupMobileNav() {
    document.querySelectorAll('.menu__item--mobile').forEach(item => {
        item.addEventListener('click', () => {
            closeMobileSlideMenu();
        });
    });
}