document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("nav a");
  const contentDiv = document.getElementsByClassName("content");

  links.forEach((link) => {
    link.addEventListener("click", function () {
      const page = this.getAttribute("data-page");
      fetch(`${page}.html`)
        .then((response) => response.text())
        .then((data) => (contentDiv.innerHTML = data))
        .catch((error) => console.error("Error loading page:", error));
    });
  });
});
