document.addEventListener("DOMContentLoaded", main);

function main() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");
  
    if (!gl) {
      alert("WebGL not supported");
      return;
    }
  
    // Vertex shader
    const vsSource = `
      attribute vec4 aPosition;
      attribute vec4 aColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying vec4 vColor;
  
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        vColor = aColor;
      }
    `;
  
    // Fragment shader
    const fsSource = `
      precision mediump float;
      varying vec4 vColor;
  
      void main() {
        gl_FragColor = vColor;
      }
    `;
  
    // Compile shader
    function loadShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
  
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  
    // Create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Program link failed:", gl.getProgramInfoLog(shaderProgram));
      return;
    }
  
    gl.useProgram(shaderProgram);
  
    const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    const aColor = gl.getAttribLocation(shaderProgram, "aColor");
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  
    // Cube vertices and colors
    const positions = new Float32Array([
      // Front face
      -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
      // Back face
      -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
      // Top face
      -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
      // Bottom face
      -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
      // Right face
       1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
      // Left face
      -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1,
    ]);
  
    const colors = new Float32Array([
      // Front - red
      1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
      // Back - green
      0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
      // Top - blue
      0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
      // Bottom - yellow
      1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
      // Right - magenta
      1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
      // Left - cyan
      0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
    ]);
  
    const indices = new Uint16Array([
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // back
      8, 9,10,   8,10,11,    // top
     12,13,14,  12,14,15,    // bottom
     16,17,18,  16,18,19,    // right
     20,21,22,  20,22,23     // left
    ]);
  
    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  
    // Color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  
    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
    // Matrices
    function createMatrix(angle) {
      const rad = angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
  
      return new Float32Array([
        cos, 0, sin, 0,
        0,   1, 0,   0,
       -sin,0, cos, 0,
        0,   0, 0,   1
      ]);
    }
  
    const projectionMatrix = new Float32Array([
      2 / canvas.width, 0, 0, 0,
      0, -2 / canvas.height, 0, 0,
      0, 0, -1, 0,
      -1, 1, 0, 1
    ]);
  
    let angle = 0;
  
    function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
      
        gl.useProgram(shaderProgram); // Ensure the correct program is active
      
        // Rebind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      
        // Rebind color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
      
        // Rebind index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      
        angle += 1;
        const modelViewMatrix = createMatrix(angle);
      
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
      
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      
        requestAnimationFrame(render);
      }
      
  
    render();
  }
  main();