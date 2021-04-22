/**
 * Sets up Event image delete listeners to delete image buttons.
 */
function setupDeleteListeners() {
    document.querySelectorAll('.drop-zone--info__delete').forEach(button => {
        button.addEventListener('click', deleteEventImage);
    });
};

/**
 * Asynchronously deletes event image.
 * @param {Event} e 
 */
function deleteEventImage(e) {
    const button = e.target;
    const buttonParent = button.parentNode;
    const dropZone = button.previousSibling;
    const thumbElement = dropZone.querySelector('.drop-zone__thumb');
    const imageElement = dropZone.querySelector('.drop-zone__input');

    const prompt = document.createElement('span');
    prompt.classList.add('drop-zone__prompt');
    prompt.innerHTML = 'IMAGEN BORRADA<br><br>ARRASTRA LA IMÁGEN O HAZ CLICK PARA CARGAR';

    if(button.dataset.local == 'true') {
        buttonParent.removeChild(button);
        dropZone.removeChild(thumbElement);
        dropZone.insertBefore(prompt, imageElement);
        imageElement.value = '';
        return;
    }

    const data = {
        id: button.dataset.id,
        key: button.dataset.key,
    };

    const url = '/ajax/delete-event-image/';

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);

    xhr.onload = () => {
        buttonParent.removeChild(button);
        dropZone.removeChild(thumbElement);
        dropZone.insertBefore(prompt, imageElement);
        imageElement.value = '';
    };

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onerror = () => {
        console.log('Error deleting image!');
    };
};