const tagModule = require('./tag');
const utilsModule = require('./utils');


var cardModule = {

    // affiche la modale "créer une carte"
    showAddCardModal: (event) => {
        // event.target contient la cible du click
        let listElement = event.target.closest('.panel');
        // on récupère l'id de la liste cible
        const listId = listElement.getAttribute('list-id');

        let modal = document.getElementById('addCardModal');
        // on récupère l'input 
        let input = modal.querySelector('input[name="list_id"]');
        // on change sa valeur
        input.value = listId;
        // on a plus qu'à afficher la modale
        modal.classList.add('is-active');
    },

    // Affiche les cartes dans la liste
    makeCardInDOM: (cardContent, listId, cardId, cardColor, cardTags) => {
        // récupérer le template
        let template = document.getElementById('template-card');
        // créer une nouvelle copie
        let newCard = document.importNode(template.content, true);
        // changer les valeurs qui vont bien
        newCard.querySelector('.card-name').textContent = cardContent;
        let box = newCard.querySelector('.box');
        box.setAttribute('card-id', cardId);
        box.setAttribute('style', 'background-color: ' + cardColor);
        // ajouter les eventListener
        newCard.querySelector('.button--add-tag').addEventListener('click', tagModule.showTagListModal);
        newCard.querySelector('.button--edit-card').addEventListener('click', cardModule.showEditCardForm);
        newCard.querySelector('form').addEventListener('submit', cardModule.handleEditCardForm);
        newCard.querySelector('.button--delete-card').addEventListener('click', cardModule.deleteCard);

        // insérer la nouvelle carte dans la bonne liste
        let theGoodList = document.querySelector(`[list-id="${listId}"]`);
        theGoodList.querySelector('.panel-block').appendChild(newCard);

        let theGoodCard = document.querySelector(`[card-id="${cardId}"]`);
        // console.log(`carte id ${cardId}`, theGoodCard);
        let tagArea = theGoodCard.querySelector('.card-tags');
        // console.log(tagArea);

        if (cardTags) {
            if (cardTags.length > 0) {
                for (let oneTag of cardTags) {
                    let template = document.getElementById('template-tag-in-card');
                    let newTag = document.importNode(template.content, true);
                    newTag.querySelector('.tag').setAttribute('tag-id', oneTag.id);
                    newTag.querySelector('.tag-name').textContent = oneTag.name;
                    newTag.querySelector(`[tag-id="${oneTag.id}"]`).style.background = oneTag.color;
                    newTag.querySelector('.button--delete-tag-from-card').addEventListener('click', tagModule.deteleteTagFromCard);
                    tagArea.appendChild(newTag);
                }
            }
        }
    },

    // afficher le formulaire d'edition du titre d'une carte
    showEditCardForm: (event) => {
        // récupérer tous les éléments
        let cardElement = event.target.closest('.box');
        let formElement = cardElement.querySelector('form');
        let contentElement = cardElement.querySelector('.card-name');

        // mettre la valeur existante dans l'input
        formElement.querySelector('input[name="content"]').value = contentElement.textContent;

        // afficher/masquer
        contentElement.classList.add('is-hidden');
        formElement.classList.remove('is-hidden');
    },

    // Gère la modification de carte
    handleEditCardForm: async (event) => {
        event.preventDefault();

        // récupérer les données
        let data = new FormData(event.target);
        console.log(data.get('color'));
        // récupérer l'id de la liste
        let cardElement = event.target.closest('.box');
        const cardId = cardElement.getAttribute('card-id');
        //appeler l'API
        try {
            let response = await fetch(utilsModule.base_url + '/cards/' + cardId, {
                method: "PATCH",
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                let card = await response.json();
                // on met à jour le h2
                cardElement.querySelector('.card-name').textContent = card.content;
                cardElement.querySelector('.card-name').closest('.box').style.background = card.color;
            }
        } catch (error) {
            alert("Impossible de modifier la carte");
            console.error(error);
        }
        // quoi qu'il se passe, on cache le formulaire
        event.target.classList.add('is-hidden');
        // et on réaffiche le title
        cardElement.querySelector('.card-name').classList.remove('is-hidden');
    },

    // Supprime la carte de la liste
    deleteCard: async (event) => {
        // event.preventDefault();

        // Je crée mon formData
        let data = new FormData();
        console.log(event.target);
        // Je récupère mon élément card
        let cardElement = event.target.closest('.box');
        // console.log(cardElement);
        // Je récupère la valeur de card-id pour avoir l'id de la card
        let cardId = cardElement.getAttribute('card-id');
        // J'injecte l'id dans une propriété de mon formData
        data.append('card_id', cardId);
        // console.log(cardToDelete.get('card_id'));

        try {
            let response = await fetch(utilsModule.base_url + '/cards/' + cardId, {
                method: 'DELETE',
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                cardElement.parentNode.removeChild(cardElement);
            }
        } catch (error) {
            alert("Impossible de supprimer la carte");
            console.error(error);
        }
    },

    // cette méthode est déclenchée par Sortable, lorsque l'on lache une carte, après déplacement
    updateAllCards: (event) => {
        console.log(event);
        // event.to contient la liste d'arrivée
        // event.from contient la liste de départ
        // Note: ces propriétés, on ne les a pas inventées, elles viennent de la doc de SortableJS ! 
        // https://github.com/SortableJS/Sortable#options

        // ici, on va faire un peu les bourrins : on va lister toutes les cartes des listes de départ et d'arrivée
        // et les mettre à jour avec leur nouvelle position
        // list d'arrivée
        cardModule.updateCardsInList(event.to);
        // liste de départ
        cardModule.updateCardsInList(event.from);
    },

    updateCardsInList: (list) => {
        // récupérer l'id de la liste
        const listId = list.closest('.panel').getAttribute('list-id');
        // lister les cartes de la liste
        const cardList = list.querySelectorAll('.box');
        // pour chaque carte, on fait un fetch 'PATCH'
        cardList.forEach((card, index) => {
            // j'ai ma carte => je peux récupérer son id
            const cardId = card.getAttribute('card-id');
            // j'ai mon index, qui correspond à la position de la carte dans la liste 
            // Il me reste à créer le formData pour pouvoir lancer un fetch
            const data = new FormData();

            data.set('list_id', listId);
            data.set('position', index);

            fetch(utilsModule.base_url + '/cards/' + cardId, {
                method: 'PATCH',
                body: data
            });

        });
    }

};

module.exports = cardModule;

