/* Flipbook container */
.flipbook-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120vh;
  perspective: 1000px; /* Enhanced 3D effect */
}

/* Flipbook display area */
#flipbook {
  max-width: 100%;
  max-height: 90vh; /* Fixed missing semicolon */
  overflow: hidden;
  position: relative;
}

/* Flip animation enhancement */
.flipping {
  transform: rotateY(-30deg); /* More noticeable*
