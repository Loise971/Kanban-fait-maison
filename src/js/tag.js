const utilsModule = require('./utils');

var tagModule = {

    // Affiche les tags dans une liste
    showTagInDOM: (tagName, tagId, tagColor) => {
        // récupérer le template
        let template = document.getElementById('template-tag');
        // créer une nouvelle copie
        let newTag = document.importNode(template.content, true);
        // changer les valeurs qui vont bien
        newTag.querySelector('.tag-name').textContent = tagName;
        newTag.querySelector('.tag-radio').setAttribute('tag-id', tagId);
        newTag.querySelector('input[type="radio"]').setAttribute('value', tagId);
        newTag.querySelector('input[type="hidden"]').setAttribute('value', tagId);


        // ajouter les event Listener !
        newTag.querySelector('.button--edit-tag').addEventListener('click', tagModule.showEditTagForm);
        newTag.querySelector('.button--delete-tag').addEventListener('click', tagModule.deleteTag);

        // insérer la nouvelle liste derrière les autres
        let tagList = document.querySelector('.tag-listing');
        tagList.appendChild(newTag);
        // console.log(tagList);
        let tagLabel = tagList.querySelector(`label[tag-id="${tagId}"]`);
        tagLabel.querySelector('.tag-name').style.backgroundColor = tagColor;
    },

    // affiche la modale "créer un tag"
    showTagListModal: (event) => {
        // console.log(event.target);
        let modal = document.getElementById('showTagList');
        modal.classList.add('is-active');
        let cardId = event.target.closest('.box').getAttribute('card-id');
        // console.log('Card Id', cardId);
        modal.querySelector('input[class="card-id"]').value = cardId;
    },

    // Gère l'ajout d'un tag à une carte
    handleTagListForm: async (event) => {
        event.preventDefault();

        // Je cible le bon formulaire pour récupérer au moins l'id du tag dans le FormData
        let formElement = document.getElementById('showTagList').querySelector('form');
        let cardId = formElement.querySelector('.card-id').value;
        let data = new FormData(event.target);

        // Je récupère l'id du tag
        data.append('tagId', data.get('radio-tag'));
        let tagId = data.get('tagId');

        // Je récupère le nom du tag dans son contenu
        let tagLabel = document.querySelector(`label[tag-id="${tagId}"]`);
        let tagContent = tagLabel.querySelector('span').textContent;

        // Je récupère la couleur du tag dans son style
        let tagSpan = tagLabel.querySelector('span');
        let tagColor = tagSpan.style.backgroundColor;

        try {
            let response = await fetch(utilsModule.base_url + '/cards/' + cardId + '/tags/', {
                method: "POST",
                body: data
            });
            if (response.status != 200) {
                let error = await response.json();
                throw error;
            } else {
                // Comme lors de la création des cards dans le DOM, je vais cibler
                // la bonne carte, la bonne zone et récupérée les données du tag
                // Pour les afficher côté utilisateur
                let theGoodCard = document.querySelector(`[card-id="${cardId}"]`);
                let tagArea = theGoodCard.querySelector('.card-tags');
                let template = document.getElementById('template-tag-in-card');
                let newTag = document.importNode(template.content, true);
                newTag.querySelector('.tag').setAttribute('tag-id', tagId);
                newTag.querySelector('.tag-name').textContent = tagContent;
                newTag.querySelector(`[tag-id="${tagId}"]`).style.background = tagColor;
                newTag.querySelector('.button--delete-tag-from-card').addEventListener('click', tagModule.deteleteTagFromCard);
                tagArea.appendChild(newTag);
            }

        } catch (error) {
            alert('Impossible de lier le tag à la carte');
            console.error(error);
        }

        utilsModule.hideModals();
    },

    // affiche la modale "créer un tag"
    showAddTagModal: (event) => {
        event.preventDefault();
        let modal = document.getElementById('addTagModal');
        modal.classList.add('is-active');
    },

    // Gérer la création d'un nouveau Tag
    handleAddTagForm: async (event) => {
        event.preventDefault();

        let data = new FormData(event.target);
        console.log(data.get('name'));
        console.log(data.get('color'));

        try {
            let response = await fetch(utilsModule.base_url + '/tags', {
                method: "POST",
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                let createdTag = await response.json();
                console.log(createdTag);

                // récupérer le template
                let template = document.getElementById('template-tag');
                // créer une nouvelle copie
                let newTag = document.importNode(template.content, true);
                // changer les valeurs qui vont bien
                newTag.querySelector('.tag-name').textContent = createdTag.name;
                newTag.querySelector('.tag-radio').setAttribute('tag-id', createdTag.id);
                newTag.querySelector('input[type="radio"]').setAttribute('value', createdTag.id);
                newTag.querySelector('input[type="hidden"]').setAttribute('value', createdTag.id);


                // ajouter les event Listener !
                newTag.querySelector('.button--edit-tag').addEventListener('click', tagModule.showEditTagForm);
                newTag.querySelector('.button--delete-tag').addEventListener('click', tagModule.deleteTag);

                // insérer la nouvelle liste derrière les autres
                let tagList = document.querySelector('.tag-listing');
                tagList.appendChild(newTag);
                // console.log(tagList);
                let tagLabel = tagList.querySelector(`label[tag-id="${createdTag.id}"]`);
                tagLabel.querySelector('.tag-name').style.backgroundColor = createdTag.color;

            }

        } catch (error) {
            alert('Impossible de créer le tag');
            console.log(error);
        }

        utilsModule.hideModals();
    },

    // affiche le formulaire "modifier un tag" (fonctionne)
    showEditTagForm: (event) => {
        // récupérer tous les éléments
        let tagElement = event.target.closest('.tag-radio');
        let formElement = tagElement.querySelector('form');
        let textElement = tagElement.querySelector('.tag-name');
        console.log(textElement);
        let colorElement = tagElement.querySelector('.tag-name').style.backgroundColor;
        console.log(colorElement);

        // mettre la valeur existante dans l'input
        formElement.querySelector('input[name="name"]').value = textElement.textContent;

        // afficher/masquer
        event.target.classList.add('is-hidden');
        formElement.classList.remove('is-hidden');
        formElement.addEventListener('submit', tagModule.handleEditTagForm);
    },

    // Garer la modification d'un Tag
    handleEditTagForm: async (event) => {
        event.preventDefault();

        console.log('tag modifié');
        let data = new FormData(event.target);
        let tagId = data.get('tag-id');
        let tagName = data.get('name');
        let tagColor = data.get('color');

        try {
            let response = await fetch(utilsModule.base_url + '/tags/' + tagId, {
                method: 'PATCH',
                body: data
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                // Je modifie dans la liste des tags
                let tagToModify = document.querySelector(`label[tag-id="${tagId}"]`);
                let tagEdit = tagToModify.querySelector('span');
                tagEdit.textContent = tagName;
                tagEdit.style.backgroundColor = tagColor;

                let formElement = tagToModify.querySelector('form');
                console.log(formElement);

                // afficher/masquer
                let pencilEdit = tagToModify.querySelector('.fa-pencil-alt');
                pencilEdit.classList.remove('is-hidden');
                formElement.classList.add('is-hidden');
                formElement.addEventListener('submit', tagModule.handleEditTagForm);

                // Je modifie l'affichage du tag dans la carte
                let allTagsToModify = document.querySelectorAll(`div[tag-id="${tagId}"]`);
                for (let tag of allTagsToModify) {
                    tag.querySelectorAll('span').textContent = tagName;
                    tag.style.backgroundColor = tagColor;
                }
            }
        } catch (error) {
            alert("Impossible de modifier le tag");
            console.error(error);
        }
    },

    // Supprimer un tag (fonctionnel)
    deleteTag: async (event) => {
        // event.preventDefault();

        console.log(event.target);
        let tagElement = event.target.closest('.tag-radio');
        console.log(tagElement);
        // Je récupère la valeur de card-id pour avoir l'id de la card
        let tagId = tagElement.getAttribute('tag-id');
        console.log(tagId);

        try {
            let response = await fetch(utilsModule.base_url + '/tags/' + tagId, {
                method: 'DELETE'
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                tagElement.parentNode.removeChild(tagElement);
            }
        } catch (error) {
            alert("Impossible de supprimer le tag");
            console.error(error);
        }
    },

    //supprimer un tag d'une carte
    deteleteTagFromCard: async (event) => {
        // console.log('Tag supprimé ! (bientôt)');
        // console.log(event.target);
        let cardId = event.target.closest('.box').getAttribute('card-id');
        // console.log('cardId',cardId);
        let tagId = event.target.closest('.tag').getAttribute('tag-id');
        // console.log('tagId', tagId);
        let tagElement = event.target.closest('.tag');
        try {
            let response = await fetch(utilsModule.base_url + '/cards/' + cardId + '/tags/' + tagId, {
                method: 'DELETE'
            });
            if (response.status !== 200) {
                let error = await response.json();
                throw error;
            } else {
                tagElement.parentNode.removeChild(tagElement);
            }
        } catch (error) {
            alert("Impossible de supprimer le tag de la carte");
            console.error(error);
        }
    }
};

module.exports = tagModule;