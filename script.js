document.addEventListener('DOMContentLoaded', function () {
    const githubForm = document.getElementById('form');
    const usernameInput = document.getElementById('username');
    const loader = document.getElementById('loader');
    githubForm.addEventListener('submit', function(event){
        event.preventDefault();
        const profile = document.querySelector('.profile');
        const username = usernameInput.value.trim();
        if(!username){
            usernameInput.setCustomValidity('Please fill in the Github Username');
        }
        else{
            usernameInput.setCustomValidity('');
            
            loader.style.display = 'block';

            fetch(`https://api.github.com/users/${username}`)
                .then(response => response.json())
                .then(user => {
                        loader.style.display = 'none';
                        document.getElementById('profile_pic').src = user.avatar_url;
                        document.getElementById('user_username').innerText = user.login;
                        document.getElementById('name').innerText = user.name || '';
                        document.getElementById('bio').innerText = user.bio || '';
                        document.getElementById('location').innerText = user.location || '';
                        document.getElementById('link').href = user.html_url;
    
                        profile.classList.remove('d-none');
                        profile.scrollIntoView({behavior:'smooth'});
                        return fetch(`https://api.github.com/users/${username}/repos`);
                })
                .then(response => response.json())
                .then(repositories => {
                    const repositoriesContainer = document.getElementById('repositories-container');
                    repositoriesContainer.innerHTML = '';

                    const repositoriesGrid = document.createElement('div');
                    repositoriesGrid.classList.add('repositories-grid');

                    repositories.forEach(repo => {
                        const repoBox = document.createElement('div');
                        repoBox.classList.add('repository-box');

                        repoBox.innerHTML = `
                            <h3>${repo.name}</h3>
                            <p>${repo.description || 'No description available.'}</p>

                            <div class="tech-stack"></div>
                        `;
                        // <a href="${repo.html_url}" target="_blank">View on GitHub</a>

                        fetch(repo.languages_url)
                        .then(response => response.json())
                        .then(languages => {
                            const techStackContainer = repoBox.querySelector('.tech-stack');

                            Object.keys(languages).forEach(language => {
                                const techStackBox = document.createElement('div');
                                techStackBox.classList.add('tech-stack-box');
                                techStackBox.innerText = language;
                                techStackContainer.appendChild(techStackBox);
                            });
                        });
                        repositoriesGrid.appendChild(repoBox);
                    });
                    repositoriesContainer.appendChild(repositoriesGrid);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    loader.style.display = 'none';
                    profile.classList.add('d-none');
                });
            githubForm.classList.add('was-validated');
         }
    });
});