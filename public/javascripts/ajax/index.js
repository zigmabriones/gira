/**
 * Sets up CTA form submit listener on home page.
 */
function setupCTA() {
    document.getElementById('js-cta-form-button').addEventListener('click', ctaAjax);
};

/**
 * Asynchronously uploads user's information into mailinglist collection
 */
function ctaAjax() {
    const form = document.getElementById('js-cta-form');
    const data = {
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        email: form.email.value,
        phone_number: form.phone_number.value,
        age: form.age.value,
        gender: form.gender.value,
        institution: form.institution.value
    };

    const url = '/ajax/cta-register';

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);

    xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 409) {
            // Validation Errors
            validationErrorMessage(res);
        } else if (xhr.status === 201) {
            // No validation errors
            validationSuccessMessage(res.first_name, res.email)
        }
    };

    xhr.onerror = () => {
        console.log('Error del Servidor!');
        const homeTextElement = document.getElementById('call-to-action').querySelector('.home-text');

        const errorContainer = document.createElement('div');
        errorContainer.classList.add('validation-errors', 'validation--register', 'validation--cta');

        const strongElement = document.createElement('strong');
        strongElement.innerHTML = 'Estamos experimentando problemas con tu registro, por favor intenta más tarde o mándanos un correo.';
        errorContainer.appendChild(strongElement);
        homeTextElement.appendChild(errorContainer);
    };

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

};

/**
 * Modifies DOM to output CTA form validation error messages.
 * @param {Object} errors 
 */
function validationErrorMessage(errors) {
    const homeTextElement = document.getElementById('call-to-action').querySelector('.home-text');

    const errorContainer = document.createElement('div');
    errorContainer.classList.add('validation-errors', 'validation--register', 'validation--cta');

    const strongElement = document.createElement('strong');
    strongElement.innerHTML = 'Por favor corrija los siguientes errores:';
    errorContainer.appendChild(strongElement);

    const ulElement = document.createElement('ul');
    for (const error of errors) {
        const liElement = document.createElement('li');
        liElement.innerHTML = error.msg;
        ulElement.appendChild(liElement);
    }
    errorContainer.appendChild(ulElement);

    homeTextElement.appendChild(errorContainer);
};

/**
 * Modifies DOM to show a CTA signup success message.
 * @param {String} name 
 * @param {String} email 
 */
function validationSuccessMessage(name, email) {
    const ctaElement = document.getElementById('call-to-action');
    const formElement = document.getElementById('js-cta-form');

    const successContainer = document.createElement('div');
    successContainer.classList.add('validation-errors', 'validation--register', 'validation--cta');
    successContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
    successContainer.style.borderColor = 'rgba(15, 150, 15, 0.5)';

    const strongElement = document.createElement('strong');
    strongElement.innerHTML = `Gracias por registrarte, ${name}! Te mantendremos informado de Gira a través de tu correo, ${email}`;
    successContainer.appendChild(strongElement);

    ctaElement.removeChild(formElement);
    ctaElement.appendChild(successContainer);
};