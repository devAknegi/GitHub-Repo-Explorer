document.addEventListener("DOMContentLoaded", function () {
  const githubForm = document.getElementById("form");
  const usernameInput = document.getElementById("username");
  const errorMessage = document.getElementById("error-message");
  const loader = document.getElementById("loader");
  const perPageSelect = document.getElementById("per-page-select");

  // -----------------------------------------------------------------------
  let perPage;
  const initialPage = 1;
  // ------------------------------------------------------------------------
  perPageSelect.addEventListener("change", function () {
    githubForm.dispatchEvent(new Event("submit"));
  });

  githubForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    perPage = perPageSelect.value;
    
    if (!username) {
      usernameInput.setCustomValidity("Please enter the Username first !!!"); 
      return;
    } 
    usernameInput.setCustomValidity("");
    loader.style.display = "block";

    fetchUserData(username, perPage, initialPage);
    githubForm.classList.add('was-validated');
  });

//----------------------------------------------------------------------------------------------   
  function fetchUserData(username, perPage, page) {
    const profile = document.querySelector(".profile");
    const repositoriesContainer = document.getElementById("repositories-container");
    fetch(`https://api.github.com/users/${username}`)
      .then((response) => {
        if (!response.ok) {

          errorMessage.innerHTML = "";
          errorMessage.textContent = "Username not found on GitHub Database!!!";
          errorMessage.classList.add("error-message");
          throw new Error(`User not found (${response.status})`);
        }
        else{
          errorMessage.innerHTML = "";
          errorMessage.classList.remove("error-message");
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
  
        return fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`);
      })
      .then((reposResponse) => {
        if (!reposResponse.ok) {
          throw new Error('Failed to fetch repositories');
        }

        const linkHeader = reposResponse.headers.get('Link');
        const totalPages = pageHeader(linkHeader);
        pagination(username, perPage, totalPages);

        return reposResponse.json();
      })
      .then((repos) => {
        repositoriesContainer.innerHTML = "";

        const repositoriesGrid = document.createElement('div');
        repositoriesGrid.classList.add('repositories-grid');

        repos.forEach((repo) => {
          const repoBox = document.createElement("div");
          repoBox.classList.add("repository-box");

          repoBox.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description available."}</p>
            <div class="tech-stack"></div>
          `;

          repoBox.addEventListener("click", () => {
            window.location.href = repo.html_url;
          });
          
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
            repositoriesGrid.appendChild(repoBox);
          });
          repositoriesContainer.appendChild(repositoriesGrid);
      })
      .catch((e) => {
        console.error("Error:", e);
        loader.style.display = "none";
        profile.classList.add("d-none");
      });
  };

  const pageHeader = (linkHeader) => {
    if (!linkHeader) {
      return 1;
    }
    const matches = linkHeader.match(/&page=(\d+)[^>]*>; rel="last"/);
    if (matches && matches[1]) {
      return parseInt(matches[1]);
    }  
    return 1;
  };

  function pagination(username, perPage, totalPages){
    const paginationContainer = document.getElementById("pagination-container");
    if (!paginationContainer) {
      console.error("Pagination container not found.");
      return;
    }
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageDiv = document.createElement("div");
      pageDiv.classList.add("page-number");
      pageDiv.innerText = i;
      pageDiv.addEventListener("click", () => {
        fetchUserData(username, perPage, i);
      });
      paginationContainer.appendChild(pageDiv);
    }
  };
});