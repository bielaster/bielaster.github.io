// Wyłączanie przyciągania po pierwszym przewinięciu
let snapDisabled = false;
const mainContentThreshold = 100; 

window.addEventListener('scroll', () => {
    if (snapDisabled) {
        return;
    }
    if (window.scrollY > mainContentThreshold) {
        document.documentElement.style.scrollSnapType = 'none';
        snapDisabled = true;
    }
});