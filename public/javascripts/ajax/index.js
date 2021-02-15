function setupCTA() {
    document.getElementById('js-cta-form-button').addEventListener('click', ctaAjax);
};

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

    console.log(data);

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
        }
    };

    xhr.onerror = () => {

    };

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

};

function validationErrorMessage(errors) {
    const homeTextElement = document.getElementById('call-to-action').querySelector('.home-text');

    const errorContainer = document.createElement('div');
    errorContainer.classList.add('validation-errors', 'validation--register', 'validation--cta');

    const strongElement = document.createElement('strong');
    strongElement.innerHTML = 'Por favor corrija los siguientes errores:'

    const ulElement = document.createElement('ul');

    console.log(errors);

};