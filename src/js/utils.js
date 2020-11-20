
const utilsModule = {
    // l'url "de base" de notre api !
    base_url: 'http://localhost:5050',

    // cache toutes les modales
    hideModals: () => {
        let modals = document.querySelectorAll('.modal');
        for (let modal of modals) {
            modal.classList.remove('is-active');
        }
    },
};

module.exports = utilsModule;