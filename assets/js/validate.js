/**
 * Simple AJAX Contact Form
 * Open Source – MIT-style usage
 */

(function () {
  "use strict";

  const forms = document.querySelectorAll('.php-email-form');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const loading = form.querySelector('.loading');
      const errorMessage = form.querySelector('.error-message');
      const sentMessage = form.querySelector('.sent-message');

      loading.classList.add('d-block');
      errorMessage.classList.remove('d-block');
      sentMessage.classList.remove('d-block');

      const formData = new FormData(form);

      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          loading.classList.remove('d-block');

          if (data.ok) {
            sentMessage.classList.add('d-block');
            form.reset();
          } else {
            errorMessage.innerHTML = data.error || 'Form submission failed.';
            errorMessage.classList.add('d-block');
          }
        })
        .catch(() => {
          loading.classList.remove('d-block');
          errorMessage.innerHTML = 'Server error. Please try again later.';
          errorMessage.classList.add('d-block');
        });
    });
  });

})();
