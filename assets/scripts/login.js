document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('form');
  const errorLogin = document.querySelector('.errorLogin');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Vérification basique côté client
    if (!email || !password) {
      errorLogin.textContent = 'Veuillez remplir tous les champs.';
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        // Connexion réussie
        window.sessionStorage.setItem('token', data.token);  // Stocke le token dans la session
        console.log('Token enregistré dans la session:', data.token);
        window.location.href = 'index.html'; //Redirige vers index
      } else {
        // Gère l'erreur de connexion
        errorLogin.textContent = data.message || 'Erreur de connexion';
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      errorLogin.textContent = "Une erreur inattendue s'est produite.";
    }
  });
});
