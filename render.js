const canvas = document.getElementById('webglCanvas');
let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
  alert("WebGL not supported");
} else {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set background to black
  gl.clear(gl.COLOR_BUFFER_BIT);    // Clear the canvas
}