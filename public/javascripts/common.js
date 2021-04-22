/**
 * Make Events tr's Clickable
 */
function setupEventTable() {
    const events = document.querySelectorAll('.event-table__clickable');
    events.forEach(event => {
        event.addEventListener('click', () => {
            const href = event.dataset.href;
            if (href) {
                window.location.assign(href);
            }
        });
    });
};

/**
 * Setup Carousels
 */
function setupCarousel() {
    // Carousel Buttons Functionality
    const radioBtns = document.querySelectorAll('.carousel__navigation-button');
    const firstPage = document.querySelector('.carousel__media--first');
    radioBtns.forEach(button => {
        button.addEventListener('click', () => {
            const clickedBtnNumber = button.htmlFor.substring(5);
            // const moveLeftBy = clickedBtnNumber * -20;
            const moveLeftBy = clickedBtnNumber * -12.5;
            firstPage.style.cssText = `margin-left: ${moveLeftBy}%;`;

            // Show selected button
            radioBtns.forEach(radioBtn => {
                radioBtn.style.backgroundColor = '#888888';
            });
            button.style.backgroundColor = '#000';
        });
    });
};

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement HTML div element with `drop-zone` class
 * @param {File} file Actual file to be uploaded
 */
 function updateThumbnail(dropZoneElement, file) {
    // console.log(dropZoneElement);
    // console.log(file);
    let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

    // First time - remove the prompt
    if(dropZoneElement.querySelector('.drop-zone__prompt')) dropZoneElement.querySelector('.drop-zone__prompt').remove();

    // First time  - there is no thumbnail element, so create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement('div');
        thumbnailElement.classList.add('drop-zone__thumb');
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }

    if(dropZoneElement.parentNode.querySelector('.drop-zone--info__delete')) return;
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('button', 'drop-zone--info__delete');
    deleteButton.setAttribute('type', 'button');
    deleteButton.setAttribute('data-local', 'true');
    deleteButton.innerHTML = 'BORRAR';
    deleteButton.addEventListener('click', deleteEventImage);
    dropZoneElement.parentNode.appendChild(deleteButton)
};

/**
 * Sets up drop-zone elements. These elements must be structured as follows:
 * ```html
 * <div class="drop-zone">
 *  <span class="drop-zone__prompt">Drop file here or click to upload</span>
 *  <input class="drop-zone__input" type="file" name="<name>" />
 * </div>
 * ```
 * On file upload, the function updates the structure to display as follows:
 * ```html
 * <div class="drop-zone">
 *  <div class="drop-zone__thumb" data-label="imageName.txt"> </div>
 *  <input class="drop-zone__input" type="file" name="<name>" />
 * </div>
 * ```
 */
function dropZoneSetup() {
    document.querySelectorAll('.drop-zone__input').forEach(inputElement => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        // Click to Upload
        dropZoneElement.addEventListener('click', e => inputElement.click());

        inputElement.addEventListener('change', e => {
            if(inputElement.files.length == 1) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        // Change dashed line to solid line and back
        dropZoneElement.addEventListener('dragover', e => {
            e.preventDefault();
            dropZoneElement.classList.add('drop-zone--over');
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZoneElement.addEventListener(type, e => {
                dropZoneElement.classList.remove('drop-zone--over');
            });
        });

        // Drop to Upload
        dropZoneElement.addEventListener('drop', e => {
            e.preventDefault();
            //- console.log(e.dataTransfer.files);
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove('drop-zone--over');
        });
    });
};
