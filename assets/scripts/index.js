document.addEventListener('DOMContentLoaded', function () {

  // Obtention des éléments de la galerie et des filtres
  const gallery = document.querySelector(".gallery");
  const filters = document.querySelector(".filters");
  //pour la déconnexion
  const loginLink = document.querySelector('.logout');


  // Fonction pour obtenir les travaux
  const getWorks = async () => {
    // On envoie une requête GET à l'API pour obtenir les travaux
    const response = await fetch("http://localhost:5678/api/works");
    // On retourne les données obtenues
    return await response.json();
  }
  // L'affichage dans le DOM
  const displayWorks = async () => {
    // On obtient les travaux grâce à la fonction créée précédemment
    const worksArray = await getWorks();
    // On vide la galerie
    gallery.innerHTML = "";
    // Pour chaque travail dans la liste, on crée une image dans la galerie
    worksArray.forEach(work => {
      createWork(work);
    });
  }

  // Fonction pour obtenir les catégories
  const getCategories = async () => {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
  }

  // Afficher les boutons de catégorie
  const showCategoriesButtons = async () => {
    // On obtient les catégories grâce à la fonction créée précédemment
    const categories = await getCategories();

    // Pour chaque catégorie dans la liste, on crée un bouton dans les filtres
    categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.textContent = category.name.toUpperCase();
      btn.id = category.id;
      btn.className = "filtersbutton";
      filters.appendChild(btn);
    });
  }

  // Affichage des boutons de catégorie lors de l'initialisation
  showCategoriesButtons();

  // Le filtre fonctionne sur le clic de la catégorie
  const filterByCategory = async () => {
    // On obtient les travaux grâce à la fonction créée précédemment
    const works = await getWorks();

    // On écoute le clic sur les boutons de catégorie
    const buttons = document.querySelectorAll(".filters button");

    // Pour chaque bouton, on filtre les travaux et on affiche les images correspondantes
    buttons.forEach(button => {
      button.addEventListener("click", async (e) => {
        const works = await getWorks();
        const btnID = e.target.id;
        gallery.innerHTML = "";
        if (btnID !== "0") {
          const worksFilteredByCategory = works.filter((work) => {
            return work.categoryId == btnID;
          });
          worksFilteredByCategory.forEach((work) => {
            createWork(work);
          });
        } else {
          // Si le bouton "Tous" est cliqué, afficher tous les travaux
          works.forEach((work) => {
            createWork(work);
          });
        }
      });
    });
  }

  // Le filtre fonctionne sur le clic de la catégorie lors de l'initialisation
  filterByCategory();

  // afficher les images au chargemement de la page
  displayWorks();
  // Fonction permettant de faire apparaître la gallerie 
  const createWork = (work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = work.imageUrl;
    figcaption.textContent = work.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  }

  // si je suis connecté 
  // 
  const logged = window.sessionStorage.getItem("token");
  const editionBanner = document.getElementById('editionBanner');
  const projectModificationButton = document.getElementById('projectModificationButton');

  const setConnectionLinkDay = () => {
    // si je suis connecté
    if (logged) {
      loginLink.textContent = "logout";
      //fonction pour se déconnecter 
      loginLink.addEventListener("click", () => {
        // on supprime le token
        window.sessionStorage.removeItem("token");

        // on recharge la page
        window.location.reload();
      });
    } else {
      editionBanner.style.display = 'none';
      loginLink.textContent = "login";
      projectModificationButton.style.display = 'none';
    }
  }
  setConnectionLinkDay();

  // Gestion de modal d'édition
  const toggleModal = (event) => {
    if (event.target === editionModal) {
      editionModal.style.display = 'none';
      document.removeEventListener('click', toggleModal);
    }
  }

  // Main edition modal
  const editionOpenButton = document.getElementById('editionOpenButton');
  const editionModal = document.getElementById('editionModal');
  const editionModalCloseButton = document.querySelector('.close__modal__button');
  const galleryModal = document.querySelector(".gallery__modal");
  const addWorkButton = document.getElementById('addWorkButton');
  const mainModal = document.querySelector('.modal-index');

  // Add new work modal
  const addNewWorkModal = document.querySelector('.modal-add');
  const addNewWorkModalCloseButton = document.getElementById('modalAddCloseButton');
  const addNewWorkModalReturnButton = document.getElementById('modalAddReturnButton');
  const modalAddForm = document.getElementById('modalAddForm');
  const modalAddImageCategory = document.getElementById('modalAddImageCategory');

  const uploadButton = document.querySelector('.input-file-trigger');
  const uploadButtonText = document.querySelector('.image-input-group>p');

  const addNewWorkErrorMessage = document.getElementById('newWorkErrorMessage');

  const uploadSubmitButton = document.querySelector('#modalAddForm>button[type="submit"]');

  /**
   * Fonction createModalImage qui permet de créer une image dans la modal d'édition
   */
  const createModalImage = (imageData) => {
    // Si les données d'images ne sont pas valides, on ne fait rien
    if (!imageData || !imageData.id || !imageData.imageUrl || !imageData.title) {
      return false;
    }

    // On crée la div qui contiendra l'image et le bouton de suppression
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    // On crée l'image
    const img = document.createElement('img');
    img.src = imageData.imageUrl;
    img.alt = imageData.title;

    // On crée le bouton de suppression
    const button = document.createElement('button');

    // On écoute le clic sur le bouton de suppression
    button.addEventListener('click', async (event) => {
      // On demande à l'utilisateur si il souhaite vraiment supprimer l'image sélectionnée
      const confirm = window.confirm("Voulez-vous vraiment supprimer cette image ?");

      // Si il ne souhaite pas supprimer l'image, on ne fait rien
      if (!confirm) {
        return;
      }

      // On envoie une requête DELETE à l'API pour supprimer l'image
      await fetch(`http://localhost:5678/api/works/${imageData.id}`, {
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${window.sessionStorage.getItem("token")}`,
        }
      }).then((response) => {
        // On réinitialise la galerie et on la remplit à nouveau
        displayWorks();
        // On réinitialise la galerie de la modal d'édition et on la remplit à nouveau
        fillModalGallery(galleryModal);
        return true;
      }).catch((error) => {
        // Si on a une erreur, on l'affiche dans la console
        console.log("ERROR :", error);
      });
    })

    // On crée l'icône de la corbeille
    const i = document.createElement('i');
    i.className = 'fas fa-trash';

    // On ajoute l'icône au bouton de suppression
    button.appendChild(i);
    galleryItem.appendChild(img);
    galleryItem.appendChild(button);

    // On retourne la div contenant l'image et le bouton de suppression
    return galleryItem;
  }

  /**
   * Fonction fillModalGallery qui permet de remplir la galerie de la modal d'édition
   */
  const fillModalGallery = async (element) => {
    // On vide la galerie
    element.innerHTML = '';

    // On récupère les images depuis l'API
    const worksArray = await getWorks();

    // Si on n'a pas d'images, on affiche simplement la modal d'édition
    if (!worksArray || !worksArray.length) {
      editionModal.style.display = 'flex';
      return;
    }

    // Si nous avons les images, pour chaque image dans la liste, on crée une image dans la galerie
    worksArray?.map((work) => {
      // On crée l'image grâce à la fonction créée précédemment
      const modalImage = createModalImage(work);

      // Si l'élement HTML n'est pas valide, on ne fait rien
      if (!modalImage) {
        return;
      }

      // Sinon on ajoute l'image à la galerie
      return element.appendChild(modalImage);
    })
  }

  /**
   * Fonction openModal qui permet d'ouvrir la modal d'édition
   */
  const openModal = async () => {
    // On vérifie si l'utilisateur est connecté
    const logged = window.sessionStorage.getItem("token");

    // Si il n'est pas connecté, on l'invite à se connecter
    if (!logged) {
      alert("Vous devez être connecté pour effectuer cette action");
      window.location.href = "login.html";
      return;
    }

    // On remplit la galerie de la modal d'édition
    fillModalGallery(galleryModal);

    // On cache la modal d'ajout
    addNewWorkModal.style.display = 'none';
    // On affiche la modal d'édition
    mainModal.style.display = 'flex';
    // On affiche la modal d'édition
    editionModal.style.display = 'flex';

    document.addEventListener('click', toggleModal);
  }

  /**
  
   */
  editionOpenButton.addEventListener('click', () => openModal());
  projectModificationButton.addEventListener('click', () => openModal());

  /**
   
   */
  editionModalCloseButton.addEventListener('click', () => {
    if (editionModal.style.display !== 'none') {
      document.removeEventListener('click', toggleModal);
      return editionModal.style.display = 'none';
    }
  });

  /**
  
   */
  addWorkButton.addEventListener('click', () => {
    // On cache la modal d'édition
    mainModal.style.display = 'none';
    // On affiche la modal d'ajout
    addNewWorkModal.style.display = 'flex';

    // On réinitialise le formulaire si on voit que le bouton de soumission est désactivé
    if (uploadButton.style.display === 'none') {
      // On réinitialise le formulaire
      modalAddForm.reset();

      // On réinitialise l'image
      imagePlaceholder.innerHTML = '';

      const i = document.createElement('i');
      i.className = 'fa-solid fa-image';

      imagePlaceholder.appendChild(i);

      uploadButton.style.display = 'block';
      uploadButtonText.style.display = 'block';

      // On réinitialise le bouton de soumission
      uploadSubmitButton.classList.remove('valid');
    }

    // On cache le message d'erreur
    addNewWorkErrorMessage.style.display = 'none';

    // On remplit le select avec les catégories
    fillSelect();
  });

  /**
   
   */
  addNewWorkModalCloseButton.addEventListener('click', () => {
    // On cache la modal d'ajout si on voit qu'elle est affichée
    if (editionModal.style.display !== 'none') {
      document.removeEventListener('click', toggleModal);
      return editionModal.style.display = 'none';
    }
  });

  /**
  
   */
  addNewWorkModalReturnButton.addEventListener('click', () => {
    // On cache la modal d'ajout
    addNewWorkModal.style.display = 'none';
    // On affiche la modal d'édition
    mainModal.style.display = 'flex';
  })

  /**
   * Fonction fillSelect qui permet de remplir le select avec les catégories depuis l'API
   */
  const fillSelect = async () => {
    // On récupère les catégories depuis l'API grâce à la fonction créée précédemment
    const categories = await getCategories();

    // Si on n'a pas de catégories, on ne fait rien
    if (!categories || !categories.length) {
      return;
    }

    // On vide le select
    modalAddImageCategory.innerHTML = '';

    // Pour chaque catégorie obtenu depuis l'API, on crée une option dans le select
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;

      modalAddImageCategory.appendChild(option);
    })
  }

  // On récupère la div qui doit contenir l'image
  const imagePlaceholder = document.querySelector('.image-placeholder');
  // On récupère l'input de type file
  const imageInput = document.getElementById('modalAddImageInput');

  // Fonction qui permet de vérifier le format et la taille max du fichier
  const checkImage = (file) => {
    // On vérifie si le fichier est bien une image
    // Types : image/png, image/jpeg
    console.log("Type de fichier:", file.type);

    if (!(file.type.includes('image/png') || file.type.includes('image/jpeg'))) {
      alert("Le fichier doit être une image au format PNG ou JPEG");
      return false;
    }
    
    

    // On vérifie si la taille du fichier est inférieure à 4Mo
    if (file.size > 4 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 4Mo")
      return false;
    }

    // Si tout est bon, on retourne true
    return true;
  }

  // On écoute le changement de l'input de type file
  imageInput.addEventListener('change', (event) => {
    // On récupère le fichier
    const file = event.target.files[0];

    // Si on n'a pas de fichier, on ne fait rien
    if (!file) {
      return;
    }

    // On vérifie le format et la taille du fichier
    if (!checkImage(file)) {
      return;
    }

    // On crée un objet FileReader pour lire le fichier et le convertir en base64
    const reader = new FileReader();

    // On écoute le chargement du fichier
    reader.addEventListener('load', (event) => {
      // Lorsque le fichier est chargé, on crée une image et on l'ajoute à la div
      imagePlaceholder.innerHTML = '';
      const img = document.createElement('img');
      img.src = event.target.result;
      imagePlaceholder.appendChild(img);

      // On cache le bouton d'upload et le texte
      uploadButton.style.display = 'none';
      uploadButtonText.style.display = 'none';

      // On change le style du bouton de soumission
      uploadSubmitButton.classList.add('valid');
    });

    // On lit le fichier
    reader.readAsDataURL(file);
  });

  // On écoute l'envoi du formulaire
  modalAddForm.addEventListener('submit', async (event) => {
    // On empêche le comportement par défaut du formulaire (rechargement de la page)
    event.preventDefault();

    // On récupère les données du formulaire grâce à l'objet FormData
    const formData = new FormData(modalAddForm);

    // On cache le message d'erreur lors de chaque envoi
    addNewWorkErrorMessage.style.display = 'none';

    // On envoie les données à l'API
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${window.sessionStorage.getItem("token")}`,
      },
      body: formData,
    }).then((response) => response.json()).catch((error) => console.log(error));

    // Si on n'a pas de réponse ou que la réponse est invalide, on affiche un message d'erreur
    if (Object.keys(response).length <= 1) {
      return addNewWorkErrorMessage.style.display = 'block';
    }

    // On réinitialise la galerie et on la remplit à nouveau
    displayWorks();
    // On réinitialise la galerie de la modal d'édition et on la remplit à nouveau
    fillModalGallery(galleryModal);

    // On cache la modal d'ajout
    addNewWorkModal.style.display = 'none';

    // On affiche la modal d'édition
    mainModal.style.display = 'flex';

    // On réinitialise le formulaire
    modalAddForm.reset();
  })
});
