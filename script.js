document.addEventListener("DOMContentLoaded", function () {
  const githubForm = document.getElementById("form");
  const usernameInput = document.getElementById("username");
  const loader = document.getElementById("loader");
  const perPageSelect = document.getElementById("per-page-select");

  // -----------------------------------------------------------------------
  let perPage;
  // ------------------------------------------------------------------------
  
  perPageSelect.addEventListener("change", function () {
    githubForm.dispatchEvent(new Event("submit"));
  });

  githubForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    perPage = perPageSelect.value;

    if (!username) {
      usernameInput.setCustomValidity("Please fill in the Github Username");
    } 
    else {
      usernameInput.setCustomValidity("");
      loader.style.display = "block";

      fetchUserData(username, perPage);
    } 
    githubForm.classList.add("was-validated");
  });
   
  const fetchUserData = (username, perPage) => {
    const profile = document.querySelector(".profile");
    const repositoriesGrid = document.createElement("div");
    repositoriesGrid.classList.add("repositories-grid");
    const repositoriesContainer = document.getElementById("repositories-container");

    fetch(`https://api.github.com/users/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((user) => {
        loader.style.display = "none";
        document.getElementById("profile_pic").src = user.avatar_url;
        document.getElementById("user_username").innerText = user.login;
        document.getElementById("name").innerText = user.name || "";
        document.getElementById("bio").innerText = user.bio || "";
        document.getElementById("location").innerText = user.location || "";
        document.getElementById("link").href = user.html_url;
  
        profile.classList.remove("d-none");
        profile.scrollIntoView({ behavior: "smooth" });
  
        return fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}`);
      })
      .then((reposResponse) => {
        if (!reposResponse.ok) {
          throw new Error('Failed to fetch repositories');
        }
        return reposResponse.json();
      })
      .then((repos) => {
        repositoriesContainer.innerHTML = "";
        repos.forEach((repo) => {
          const repoBox = document.createElement("div");
          repoBox.classList.add("repository-box");
          repoBox.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description available."}</p>
            <div class="tech-stack"></div>
          `;
          fetch(repo.languages_url)
            .then((response) => response.json())
            .then((languages) => {
              const techStackContainer = repoBox.querySelector(".tech-stack");

              Object.keys(languages).forEach((language) => {
                const techStackBox = document.createElement("div");
                techStackBox.classList.add("tech-stack-box");
                techStackBox.innerText = language;
                techStackContainer.appendChild(techStackBox);
              });
            });
          repositoriesContainer.appendChild(repoBox);
        });
        
      })
      .catch((e) => {
        console.error("Error:", e);
        loader.style.display = "none";
        profile.classList.add("d-none");
      });
  };
});
