document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const loading = contactForm.querySelector('.loading');
        const errorMessage = contactForm.querySelector('.error-message');
        const sentMessage = contactForm.querySelector('.sent-message');

        // Show loading state
        loading.classList.add('d-block');
        errorMessage.classList.remove('d-block');
        sentMessage.classList.remove('d-block');

        let params = {
            name: document.getElementById("name-field").value,
            email: document.getElementById("email-field").value,
            subject: document.getElementById("subject-field").value,
            message: document.getElementById("message-field").value
        };

        emailjs.send("service_dt4km5i", "template_1m9p8rp", params)
            .then(function(res) {
                loading.classList.remove('d-block');
                sentMessage.classList.add('d-block');
                contactForm.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    sentMessage.classList.remove('d-block');
                }, 5000);
            })
            .catch(function(error) {
                loading.classList.remove('d-block');
                errorMessage.innerHTML = "Failed to send message. Please try again later.";
                errorMessage.classList.add('d-block');
                console.error('EmailJS Error:', error);
            });
    });
});
