function setupDeleteListeners() {
    document.querySelectorAll('.tmp-edit-images__image-delete').forEach(button => {
        button.addEventListener('click', deleteEventImage);
    });
};

function deleteEventImage(e) {
    const button = e.target;
    const buttonParent = button.parentNode;
    const imageElement = button.parentElement.children[1];

    const data = {
        id: button.dataset.id,
        key: button.dataset.key,
    };

    const url = '/ajax/delete-event-image/';

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);

    xhr.onload = () => {
        buttonParent.removeChild(button);
        buttonParent.removeChild(imageElement);
        buttonParent.innerHTML = '<p>Imagen Borrada</p>';
    };

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onerror = () => {
        console.log('Error deleting image!');
    };
};