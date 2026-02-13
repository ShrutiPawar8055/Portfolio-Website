function sendMail(){
    let params = {
        name : document.getElementById("name-field").value,
        email : document.getElementById("email-field").value,
        message : document.getElementById("message-field").value,
        subject : document.getElementById("subject-field").value
    };
    
    emailjs.send("service_dt4km5i", "template_1m9p8rp", params).then(alert("Success! " + res.status));
}