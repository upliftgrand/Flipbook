const images = [
  'images/page1.png',
  'images/page2.png',
  'images/page3.png',
  'images/page4.png',
  // Add more pages as needed
];

let currentPage = 0;

const flipbook = document.getElementById('flipbook');

function showPage(index) {
  if (index >= 0 && index < images.length) {
    const imgElement = document.createElement("img");
    imgElement.src = images[index];
        imgElement.alt = `Page ${index + 1}`;

    // Add animation
    imgElement.classList.add("flipping");

    flipbook.innerHTML = ""; // clear previous content
    flipbook.appendChild(imgElement);

    currentPage = index;
  }
}

document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 0) showPage(currentPage - 1);
});

document.getElementById("next").addEventListener("click", () => {
  if (currentPage < images.length - 1) showPage(currentPage + 1);
});

showPage(currentPage);
