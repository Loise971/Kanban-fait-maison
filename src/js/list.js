const cardModule = require('./card');
// const tagModule = require('./tag');
const utilsModule = require('./utils');
const Sortable = require('sortablejs');


var listModule = {

    // affiche la modale "créer une liste"
    showAddListModal: () => {
        let modal = document.getElementById('addListModal');
        modal.classList.add('is-active');
    },

    // création d'une liste dans le DOM
    makeListInDom: (listName, listId) => {
        // récupérer le template
        let template = document.getElementById('template-list');
        // créer une nouvelle copie
        let newList = document.importNode(template.content, true);
        // changer les valeurs qui vont bien
        newList.querySelector('h2').textContent = listName;
        newList.querySelector('.panel').setAttribute('list-id', listId);
        // ajouter les event Listener !
        newList.querySelector('.button--add-card').addEventListener('click', cardModule.showAddCardModal);
        newList.querySelector('h2').addEventListener('dblclick', listModule.showEditListForm);
        newList.querySelector('.button--delete-list').addEventListener('click', listModule.deleteList);

        // on profite de la création de la liste pour utiliser le plugin Sortable, et rendre les cartes "draggable"
        // il faut cibler le conteneur des éléménts "draggable". ici, avec notre structure HTML, ce conteneur c'est ".panel-block"
        const container = newList.querySelector('.panel-block');
        Sortable.create(container, {
            group: "lists",
            onEnd: cardModule.updateAllCards
        });

        // insérer la nouvelle liste derrière les autres
        document.querySelector('.card-lists').append(newList);
    },

    // afficher le formulaire d'édition du nom d'une liste
    showEditListForm: (event) => {
        // récupérer tous les éléments
        let listElement = event.target.closest('.panel');
        let formElement = listElement.querySelector('form');

        // mettre la valeur existante dans l'input
        formElement.querySelector('input[name="name"]').value = event.target.textContent;

        // afficher/masquer
        event.target.classList.add('is-hidden');
        formElement.classList.remove('is-hidden');

    },

    // formulaire d'édition du nom d'une liste
    handleEditListForm: async (event) => {
        event.preventDefault();

        // récupérer les données
        let data = new FormData(event.target);
        // récupérer l'id de la liste
        let listElement = event.target.closest('.panel');
        const listId = listElement.getAttribute('list-id');
        //appeler l'API
        try {
            let response = await fetch(utilsModule.base_url + '/lists/' + listId, {
                method: "PATCH",
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                let list = await response.json();
                // on met à jour le h2
                listElement.querySelector('h2').textContent = list.name;
            }
        } catch (error) {
            alert("Impossible de modifier la liste");
            console.error(error);
        }
        // quoi qu'il se passe, on cache le formulaire
        event.target.classList.add('is-hidden');
        // et on réaffiche le <h2>
        listElement.querySelector('h2').classList.remove('is-hidden');
    },

    deleteList: async (event) => {
        event.preventDefault();

        // Je crée mon formData
        let data = new FormData();
        // Je récupère mon élément List
        let listElement = event.target.closest('.is-one-quarter');
        // Je récupère l'id en question
        let listId = listElement.getAttribute('list-id');
        data.append('list_id', listId);

        try {
            let response = await fetch(utilsModule.base_url + '/lists/' + listId, {
                method: 'DELETE',
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                listElement.parentNode.removeChild(listElement);
            }
        }
        catch (error) {
            alert("Impossible de supprimer la liste");
            console.error(error);
        }
    }

};

module.exports = listModule;
