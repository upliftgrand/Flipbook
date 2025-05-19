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
    flipbook.innerHTML = `<img src="${images[index]}" alt="Page ${index + 1}">`;
    currentPage = index;
  }
}

function nextPage() {
  showPage(currentPage + 1);
}

function prevPage() {
  showPage(currentPage - 1);
}

showPage(currentPage);
