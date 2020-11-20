const listModule = require('./list');
const cardModule = require('./card');
const tagModule = require('./tag');
const utilsModule = require('./utils');

// Grâce à Browserify (et aux bundlers de manière générale)
// on peut même aller chercher du code dans les node_modules!
// Et oui, browserify "connait" require, il va suivre l'instruction et rapatrier le code du module dans le bundle
const Sortable = require('sortablejs');

// on objet qui contient des fonctions
var app = {
   
    // fonction d'initialisation, lancée au chargement de la page
    init: function () {
        //console.log('app.init !');
        app.addListenerToActions();

        // chargement depuis l'API
        app.getListsFromAPI();
        app.getTagsFromAPI();

    },

    // ajoute les écouteurs aux boutons statiques et aux formulaires
    addListenerToActions: () => {
        // boutons "fermer les modales"
        let closeModalButtons = document.querySelectorAll('.close');
        for (let button of closeModalButtons) {
            button.addEventListener('click', utilsModule.hideModals);
        }

     
        // bouton "ajouter une liste"
        let addListButton = document.getElementById('addListButton');
        addListButton.addEventListener('click', listModule.showAddListModal);

        // formulaire "ajouter une liste"
        let addListForm = document.querySelector('#addListModal form');
        addListForm.addEventListener('submit', app.handleAddListForm);

        // bouton "supprimer une liste"
        let deleteListButtons = document.querySelectorAll('.button--delete-list');
        for (let button of deleteListButtons) {
            button.addEventListener('click', listModule.deleteList);
        }

      
        // boutons "ajouter une carte"
        let addCardButtons = document.querySelectorAll('.button--add-card');
        for (let button of addCardButtons) {
            button.addEventListener('click', cardModule.showAddCardModal);
        }

        // formulaire "ajouter une carte"
        let addCardForm = document.querySelector('#addCardModal form');
        addCardForm.addEventListener('submit', app.handleAddCardForm);

        // bouton "supprimer une carte"
        let deleteCardButtons = document.querySelectorAll('.button--delete-card');
        for (let button of deleteCardButtons) {
            button.addEventListener('click', cardModule.deleteCard);
        }

      
        // boutons "ajouter un tag"
        let addTagButton = document.querySelector('.button--add-tag');
        addTagButton.addEventListener('click', tagModule.showAddTagModal);

        // formulaire "ajouter un tag"
        let addTagForm = document.querySelector('#addTagModal form');
        addTagForm.addEventListener('submit', tagModule.handleAddTagForm);

        // boutons "ajouter un tag à une carte"
        let addTagToCardButton = document.querySelector('#showTagList form');
        addTagToCardButton.addEventListener('submit', tagModule.handleTagListForm);

    },

    // cache toutes les modales
    hideModals: () => {
        let modals = document.querySelectorAll('.modal');
        for (let modal of modals) {
            modal.classList.remove('is-active');
        }
    },

    // action formulaire : ajouter une liste
    handleAddListForm: async (event) => {
        event.preventDefault();
        // event.target contiendra toujours le formulaire
        let data = new FormData(event.target);

        // pour éviter "position can not be empty"
        let nbListes = document.querySelectorAll('.panel').length;
        data.set('position', nbListes);

        try {
            let response = await fetch(utilsModule.base_url + '/lists', {
                method: "POST",
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                const list = await response.json();
                // on appelle la méthode de création avec les bons paramètres.
                listModule.makeListInDom(list.name, list.id);
            }
        } catch (error) {
            alert("Impossible de créer une liste");
            console.error(error);
        }
        // on ferme les modales !
        utilsModule.hideModals();
    },

    // action formulaire : ajouter une carte
    handleAddCardForm: async (event) => {
        // on empeche le rechargement de la page
        event.preventDefault();
        // on récupère les infos dur form
        let data = new FormData(event.target);

        try {
            let response = await fetch(utilsModule.base_url + '/cards', {
                method: "POST",
                body: data
            });
            if (response.status != 200) {
                let error = await response.json();
                throw error;
            } else {
                let card = await response.json();
                // et on les passe à la bonne méthode
                cardModule.makeCardInDOM(card.content, card.list_id, card.id, card.color, card.tags);
            }
        } catch (error) {
            alert("Impossible de créer une carte");
            console.error(error);
        }

        // et on ferme les modales !
        utilsModule.hideModals();
    },

    /** Fonctions de récupération des données */
    getListsFromAPI: async () => {
        try {
            // console.log(utilsModule.base_url + "/lists");
            let response = await fetch(utilsModule.base_url + "/lists");
            // on teste le code HTTP
            if (response.status !== 200) {
                // si pas 200 => problème.
                // on récupère le corps de la réponse, et on le "throw" => il tombera dans le catch jsute après
                let error = await response.json();
                throw error;
            } else {
                // si tout c'est bien passé : on passe à la création des listes dans le DOM
                let lists = await response.json();
                // console.log(lists);
                for (let list of lists) {
                    listModule.makeListInDom(list.name, list.id);
                    // on a modifié la route de l'api pour inclure directement les cartes !
                    for (let card of list.cards) {
                        cardModule.makeCardInDOM(card.content, list.id, card.id, card.color, card.tags);
                    }
                }
            }
        } catch (error) {
            // en cas d'erreur, on affiche un message à l'utilisateur
            alert("Impossible de charger les listes depuis l'API.");
            // et on log l'erreur en console pour plus de détails
            console.error(error);
        }
    },

    getTagsFromAPI: async () => {
        try {
            // console.log(utilsModule.base_url + "/tags");
            let response = await fetch(utilsModule.base_url + "/tags");
            // on teste le code HTTP
            if (response.status !== 200) {
                // si pas 200 => problème.
                // on récupère le corps de la réponse, et on le "throw" => il tombera dans le catch jsute après
                let error = await response.json();
                throw error;
            } else {
                // si tout c'est bien passé : on passe à la création des listes dans le DOM
                let tags = await response.json();
                // console.log(lists);
                for (let tag of tags) {
                    tagModule.showTagInDOM(tag.name, tag.id, tag.color);
                }
            }
        } catch (error) {
            // en cas d'erreur, on affiche un message à l'utilisateur
            alert("Impossible de charger les tags depuis l'API.");
            // et on log l'erreur en console pour plus de détails
            console.error(error);
        }
    },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init);