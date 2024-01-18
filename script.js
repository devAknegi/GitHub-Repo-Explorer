document.addEventListener('DOMContentLoaded', function () {
    const githubForm = document.getElementById('github-form');
    const usernameInput = document.getElementById('username');
    githubForm.addEventListener('submit', function(event){
        event.preventDefault();
        // const username = document.getElementById('username').value;
        // console.log(username);
        const profile = document.querySelector('.profile');
        const username = usernameInput.value.trim();
        if(!username){
            usernameInput.setCustomValidity('Please fill in the Github Username');
        }
        else{
            usernameInput.setCustomValidity('');

            fetch(`https://api.github.com/users/${username}`)
                .then(response => response.json())
                .then(user => {
                    // Display user information
                    document.getElementById('profile_pic').src = user.avatar_url;
                    document.getElementById('username').innerText = user.login;
                    document.getElementById('name').innerText = user.name || '';
                    document.getElementById('bio').innerText = user.bio || '';
                    document.getElementById('location').innerText = user.location || '';
                    document.getElementById('github-link').href = user.html_url;

                profile.classList.remove('d-none');
                    // Fetch repositories
                    return fetch(`https://api.github.com/users/${username}/repos`);
                })
                .then(response => response.json())
                .then(repositories => {
                    const repositoriesContainer = document.getElementById('repositories-container');
                    repositoriesContainer.innerHTML = '';

                    repositories.forEach(repo => {
                        const repoBox = document.createElement('div');
                        repoBox.classList.add('repository-box');
                        repoBox.innerHTML = `
                            <h3>${repo.name}</h3>
                            <p>${repo.description || 'No description available.'}</p>
                            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
                        `;
                        repositoriesContainer.appendChild(repoBox);
                    });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    profile.classList.add('d-none');
                });
            githubForm.classList.add('was-validated');
         }
    });
});