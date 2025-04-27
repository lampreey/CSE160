var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'uniform mat4 u_ModelMatrix;' +
    'uniform mat4 u_GlobalRotateMatrix;' +
    'void main() {' +
    '  gl_Position =  u_GlobalRotateMatrix * u_ModelMatrix * a_Position;' +
    '}';

var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform vec4 u_FragColor;' +  
    'void main() {' +
    '  gl_FragColor = u_FragColor;' +
    '}';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle = 0;

let g_frontLeftLegAngle = -70;
let g_frontRightLegAngle = 70;
let g_backLeftLegAngle = -70;
let g_backRightLegAngle = 70;

let g_frontLeftLegAngle2 = 90;
let g_frontRightLegAngle2 = -90;
let g_backLeftLegAngle2 = 90;
let g_backRightLegAngle2 = -90;

let g_walkAnimation = false;

let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_cameraAngleX = 0;
let g_cameraAngleY = 0;

let g_lastFrameTime = performance.now();
let g_fps = 0;

// Explosion variables
let g_exploded = false;
let g_explosionTime = 0;
let g_explosionSpeed = 2.0;
let g_originalPositions = new Map();

let g_explosionGifVisible = false;
let g_explosionGifElement;
let g_explosionGifSize = 200; // Size of the GIF in pixels


function setupWebGl() {
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariblesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmiUI() {
    document.getElementById('animationWalkOffButton').onclick = function() { g_walkAnimation = false };
    document.getElementById('animationWalkOnButton').onclick = function() { g_walkAnimation = true };
    document.getElementById('resetButton').onclick = resetExplosion;

    document.getElementById('walkSlide').addEventListener('mousemove', function() { 
        g_frontLeftLegAngle = -this.value;
        g_frontRightLegAngle = this.value;
        g_backLeftLegAngle = -this.value;
        g_backRightLegAngle = this.value;
        renderScene();
    });

    document.getElementById('walk2Slide').addEventListener('mousemove', function() { 
        g_frontLeftLegAngle2 = this.value;
        g_frontRightLegAngle2 = -this.value;
        g_backLeftLegAngle2 = this.value;
        g_backRightLegAngle2 = -this.value;
        renderScene();
    });
    
    document.getElementById('angleSlide').addEventListener('mousemove', function() {  
        g_cameraAngleY = parseFloat(this.value); 
        renderScene(); 
    });
}

const EXPLOSION_GIF_URL = "https://media.tenor.com/0QryMX5yo2kAAAAj/explosion-minecraft.gif";

// Modify the showExplosionGifAtCreeper function
function showExplosionGifAtCreeper() {
    if (!g_explosionGifElement) {
        g_explosionGifElement = document.getElementById('explosionGif');
    }
    
    const gifImage = document.getElementById('explosionGifImage');
    // Force reload by adding timestamp
    gifImage.src = EXPLOSION_GIF_URL + '?t=' + new Date().getTime();
    
    const canvas = document.getElementById('webgl');
    const canvasRect = canvas.getBoundingClientRect();
    
    const centerX = (canvasRect.left + canvas.width / 2 - g_explosionGifSize / 2) - 190;
    const centerY = (canvasRect.top + canvas.height / 2 - g_explosionGifSize / 2) + 70;
    
    g_explosionGifElement.style.left = `${centerX}px`;
    g_explosionGifElement.style.top = `${centerY}px`;
    g_explosionGifElement.style.display = 'block';
    g_explosionGifVisible = true;
    
    setTimeout(hideExplosionGif, 1500);
}

function hideExplosionGif() {
    if (g_explosionGifElement) {
        g_explosionGifElement.style.display = 'none';
        g_explosionGifVisible = false;
    }
}

// Update the resetExplosion function to hide the GIF
function resetExplosion() {
    g_exploded = false;
    g_originalPositions.clear();
    hideExplosionGif();
    renderScene();
}

function handleMouseDown(event) {
    g_mouseDown = true;
    g_lastMouseX = event.clientX;
    g_lastMouseY = event.clientY;
    
    // Detect shift-click
    if (event.shiftKey) {
        g_exploded = !g_exploded;
        g_explosionTime = performance.now();
        if (g_exploded) {
            g_originalPositions.clear(); // Clear previous positions
            // Show explosion GIF at creeper's position
            showExplosionGifAtCreeper();
        } else {
            // Hide explosion GIF if we're toggling off
            hideExplosionGif();
        }
    }
}


function handleMouseUp(event) {
    g_mouseDown = false;
}

function handleMouseOut(event) {
    g_mouseDown = false;
}

function handleMouseMove(event) {
    if (!g_mouseDown) {
        return;
    }
    
    let newX = event.clientX;
    let newY = event.clientY;
    
    let deltaX = newX - g_lastMouseX;
    let deltaY = newY - g_lastMouseY;
    
    g_cameraAngleY += deltaX * 0.5; 
    g_cameraAngleX += deltaY * 0.5; 
    g_cameraAngleX = Math.max(-90, Math.min(90, g_cameraAngleX));
    
    g_lastMouseX = newX;
    g_lastMouseY = newY;
    
    renderScene();
}

function applyExplosionTransform(modelMatrix, partId) {
    if (!g_exploded) return new Matrix4(modelMatrix);
    
    // Store original position if not already stored
    if (!g_originalPositions.has(partId)) {
        g_originalPositions.set(partId, {
            matrix: new Matrix4(modelMatrix),
            direction: [
                Math.random() * 2 - 1,  // Random between -1 and 1
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            ]
        });
    }
    
    const partData = g_originalPositions.get(partId);
    const elapsed = (performance.now() - g_explosionTime) / 1000;
    const progress = Math.min(1, elapsed * g_explosionSpeed);
    
    // Normalize the random direction
    const direction = partData.direction;
    const length = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);
    const normalizedDir = [
        direction[0] / length,
        direction[1] / length,
        direction[2] / length
    ];
    
    const explosionDistance = 2.0 * progress;
    
    const explodedMat = new Matrix4(partData.matrix);
    explodedMat.elements[12] += normalizedDir[0] * explosionDistance;
    explodedMat.elements[13] += normalizedDir[1] * explosionDistance;
    explodedMat.elements[14] += normalizedDir[2] * explosionDistance;
    
    return explodedMat;
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    
    let now = performance.now();
    let delta = now - g_lastFrameTime;
    g_lastFrameTime = now;

    g_fps = Math.round(1000 / delta);
    document.getElementById('fpsCounter').innerText = `FPS: ${g_fps}`;
    
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_walkAnimation) {
        const speed = 10;       // Animation speed
        const swing = 10;      // How much the legs swing back and forth

        const speed2 = 10;       // Animation speed
        const swing2 = 5;      // How much the legs swing back and forth

        // Base angles (resting positions)
        const frontLeftBase = -70;
        const frontRightBase = 70;
        const backLeftBase = -70;
        const backRightBase = 70;

        const frontLeftBase2 = 90;
        const frontRightBase2 = -90;
        const backLeftBase2 = 90;
        const backRightBase2 = -90;

        // Apply sine wave motion while preserving the base angles
        g_frontLeftLegAngle = frontLeftBase + swing * Math.sin(speed * g_seconds);
        g_frontRightLegAngle = frontRightBase + swing * Math.sin(speed * g_seconds + Math.PI);
        g_backLeftLegAngle = backLeftBase + swing * Math.sin(speed * g_seconds + Math.PI);
        g_backRightLegAngle = backRightBase + swing * Math.sin(speed * g_seconds);

        g_frontLeftLegAngle2 = frontLeftBase2 + swing2 * Math.sin(speed2 * g_seconds);
        g_frontRightLegAngle2 = frontRightBase2 + swing2 * Math.sin(speed2 * g_seconds + Math.PI);
        g_backLeftLegAngle2 = backLeftBase2 + swing2 * Math.sin(speed2 * g_seconds + Math.PI);
        g_backRightLegAngle2 = backRightBase2 + swing2 * Math.sin(speed2 * g_seconds);
    }
}

function renderScene() {
    var globalRotMatY = new Matrix4().rotate(g_cameraAngleY, 0, 1, 0);
    var globalRotMatX = new Matrix4().rotate(g_cameraAngleX, 1, 0, 0);
    var globalRotMat = new Matrix4().multiply(globalRotMatY).multiply(globalRotMatX);
    
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Colors
    const creeperGreen = [0.0, 0.8, 0.2, 1.0];
    const creeperGreen2 = [0.0, 0.7, 0.2, 1.0];
    const creeperDark = [0.0, 0.5, 0.1, 1.0];
    const black = [0.0, 0.0, 0.0, 1.0];
    const red = [1.0, 0.0, 0.0, 1.0];
    const darkGray = [0.1, 0.1, 0.1, 1.0];

    // Body
    var body = new Cube();
    body.color = creeperGreen2;
    body.matrix.translate(-0.2, -0.4, -0.05);
    var bodyCoordinateMat = new Matrix4(body.matrix);
    body.matrix.scale(0.2, 0.4, 0.1);
    body.matrix = applyExplosionTransform(body.matrix, 'body');
    body.render();

    // Body2
    var body2 = new Cube();
    body2.color = creeperGreen2;
    body2.matrix = new Matrix4(bodyCoordinateMat);
    body2.matrix.translate(-0.001, 0.3, 0.0);
    var body2CoordinateMat = new Matrix4(body2.matrix);
    body2.matrix.rotate(-70, 1, 0, 0);
    body2.matrix.scale(0.203, 0.2, 0.1);  
    body2.matrix = applyExplosionTransform(body2.matrix, 'body2');
    body2.render();

    // Body3
    var body3 = new Cube();
    body3.color = creeperGreen2;
    body3.matrix = new Matrix4(bodyCoordinateMat);
    body3.matrix.translate(0.0, 0.0, 0.1);
    var body3CoordinateMat = new Matrix4(body3.matrix);
    body3.matrix.rotate(240, 1, 0, 0);
    body3.matrix.scale(0.203, 0.2, 0.1);  
    body3.matrix = applyExplosionTransform(body3.matrix, 'body3');
    body3.render();

    // Head
    var head = new Cube();
    head.color = creeperGreen;
    head.matrix = body2CoordinateMat;
    head.matrix.translate(0.0, 0.07, -0.35);
    var headCoordinateMat = new Matrix4(head.matrix);
    head.matrix.scale(0.2, 0.2, 0.2);
    head.matrix = applyExplosionTransform(head.matrix, 'head');
    head.render();

    // Connect1 (Front Left Leg)
    var connect1 = new Cube();
    connect1.color = creeperGreen2;
    connect1.matrix = new Matrix4(body3CoordinateMat);
    connect1.matrix.translate(0.0, -0.1, -0.18);
    connect1.matrix.rotate(90, 0, 1, 0);
    connect1.matrix.rotate(g_frontLeftLegAngle, 1, 0, 0);
    connect1.matrix.rotate(-20, 0, 0, 1);
    var connect1CoordinateMat = new Matrix4(connect1.matrix);
    connect1.matrix.scale(0.1, 0.2, 0.1);  
    connect1.matrix = applyExplosionTransform(connect1.matrix, 'connect1');
    connect1.render();

    // Connect2 (Front Right Leg)
    var connect2 = new Cube();
    connect2.color = creeperGreen2;
    connect2.matrix = new Matrix4(body3CoordinateMat);
    connect2.matrix.translate(0.17, 0, -0.18);
    connect2.matrix.rotate(90, 0, 1, 0);
    connect2.matrix.rotate(g_frontRightLegAngle, 1, 0, 0);
    connect2.matrix.rotate(-20, 0, 0, 1);
    var connect2CoordinateMat = new Matrix4(connect2.matrix);
    connect2.matrix.scale(0.1, 0.2, 0.1);  
    connect2.matrix = applyExplosionTransform(connect2.matrix, 'connect2');
    connect2.render();

    // Connect3 (Back Left Leg)
    var connect3 = new Cube();
    connect3.color = creeperGreen2;
    connect3.matrix = new Matrix4(body3CoordinateMat);
    connect3.matrix.translate(0.0, -0.1, 0.05);
    connect3.matrix.rotate(90, 0, 1, 0);
    connect3.matrix.rotate(g_backLeftLegAngle, 1, 0, 0);
    connect3.matrix.rotate(20, 0, 0, 1);
    var connect3CoordinateMat = new Matrix4(connect3.matrix);
    connect3.matrix.scale(0.1, 0.2, 0.1);  
    connect3.matrix = applyExplosionTransform(connect3.matrix, 'connect3');
    connect3.render();

    // Connect4 (Back Right Leg)
    var connect4 = new Cube();
    connect4.color = creeperGreen2;
    connect4.matrix = new Matrix4(body3CoordinateMat);
    connect4.matrix.translate(0.17, 0, 0.05);
    connect4.matrix.rotate(90, 0, 1, 0);
    connect4.matrix.rotate(g_backRightLegAngle, 1, 0, 0);
    connect4.matrix.rotate(20, 0, 0, 1);
    var connect4CoordinateMat = new Matrix4(connect4.matrix);
    connect4.matrix.scale(0.1, 0.2, 0.1);  
    connect4.matrix = applyExplosionTransform(connect4.matrix, 'connect4');
    connect4.render();

    // Leg1 (Front Left)
    var leg1 = new Cube();
    leg1.color = creeperGreen2;
    leg1.matrix = connect1CoordinateMat;
    leg1.matrix.translate(0.0, 0.3, -0.1);
    leg1.matrix.rotate(g_frontLeftLegAngle2, 1, 0, 0);
    var leg1CoordinateMat = new Matrix4(leg1.matrix);
    leg1.matrix.scale(0.1, 0.2, 0.1);
    leg1.matrix = applyExplosionTransform(leg1.matrix, 'leg1');
    leg1.render();

    // Leg2 (Front Right)
    var leg2 = new Cube();
    leg2.color = creeperGreen2;
    leg2.matrix = connect2CoordinateMat;
    leg2.matrix.translate(0.0, 0.2, 0.2);
    leg2.matrix.rotate(g_frontRightLegAngle2, 1, 0, 0);
    var leg2CoordinateMat = new Matrix4(leg2.matrix);
    leg2.matrix.scale(0.1, 0.2, 0.1);
    leg2.matrix = applyExplosionTransform(leg2.matrix, 'leg2');
    leg2.render();

    // Leg3 (Back Left)
    var leg3 = new Cube();
    leg3.color = creeperGreen2;
    leg3.matrix = connect3CoordinateMat;
    leg3.matrix.translate(0.0, 0.3, -0.1);
    leg3.matrix.rotate(g_backLeftLegAngle2, 1, 0, 0);
    var leg3CoordinateMat = new Matrix4(leg3.matrix);
    leg3.matrix.scale(0.1, 0.2, 0.1);
    leg3.matrix = applyExplosionTransform(leg3.matrix, 'leg3');
    leg3.render();

    // Leg4 (Back Right)
    var leg4 = new Cube();
    leg4.color = creeperGreen2;
    leg4.matrix = connect4CoordinateMat;
    leg4.matrix.translate(0.0, 0.2, 0.2);
    leg4.matrix.rotate(g_backRightLegAngle2, 1, 0, 0);
    var leg4CoordinateMat = new Matrix4(leg4.matrix);
    leg4.matrix.scale(0.1, 0.2, 0.1);
    leg4.matrix = applyExplosionTransform(leg4.matrix, 'leg4');
    leg4.render();

    // Foot1 (Front Left)
    var foot1 = new Cube();
    foot1.color = darkGray;
    foot1.matrix = leg1CoordinateMat;
    foot1.matrix.translate(0.0, -0.075, 0.0);
    foot1.matrix.scale(0.1, 0.075, 0.1);
    foot1.matrix = applyExplosionTransform(foot1.matrix, 'foot1');
    foot1.render();

    // Foot2 (Front Right)
    var foot2 = new Cube();
    foot2.color = darkGray;
    foot2.matrix = leg2CoordinateMat;
    foot2.matrix.translate(0.0, -0.075, 0.0);
    foot2.matrix.scale(0.1, 0.075, 0.1);
    foot2.matrix = applyExplosionTransform(foot2.matrix, 'foot2');
    foot2.render();

    // Foot3 (Back Left)
    var foot3 = new Cube();
    foot3.color = darkGray;
    foot3.matrix = leg3CoordinateMat;
    foot3.matrix.translate(0.0, -0.075, 0.0);  
    foot3.matrix.scale(0.1, 0.075, 0.1);
    foot3.matrix = applyExplosionTransform(foot3.matrix, 'foot3');
    foot3.render();

    // Foot4 (Back Right)
    var foot4 = new Cube();
    foot4.color = darkGray;
    foot4.matrix = leg4CoordinateMat;
    foot4.matrix.translate(0.0, -0.075, 0.0);
    foot4.matrix.scale(0.1, 0.075, 0.1);
    foot4.matrix = applyExplosionTransform(foot4.matrix, 'foot4');
    foot4.render();

    // Mouth parts
    var mouth1 = new Cube();
    mouth1.color = black;
    mouth1.matrix = new Matrix4(headCoordinateMat);
    mouth1.matrix.translate(0.132, 0.1, -0.01);
    mouth1.matrix.scale(0.05, 0.05, 0.025);
    mouth1.matrix = applyExplosionTransform(mouth1.matrix, 'mouth1');
    mouth1.render();

    var mouth2 = new Cube();
    mouth2.color = black;
    mouth2.matrix = new Matrix4(headCoordinateMat);
    mouth2.matrix.translate(0.02, 0.1, -0.01);
    mouth2.matrix.scale(0.05, 0.05, 0.025);
    mouth2.matrix = applyExplosionTransform(mouth2.matrix, 'mouth2');
    mouth2.render();

    var mouth3 = new Cube();
    mouth3.color = black;
    mouth3.matrix = new Matrix4(headCoordinateMat);
    mouth3.matrix.translate(0.072, 0.04, -0.01);
    mouth3.matrix.scale(0.06, 0.06, 0.025);
    mouth3.matrix = applyExplosionTransform(mouth3.matrix, 'mouth3');
    mouth3.render();

    var mouth4 = new Cube();
    mouth4.color = black;
    mouth4.matrix = new Matrix4(headCoordinateMat);
    mouth4.matrix.translate(0.13, 0.0, -0.01);
    mouth4.matrix.scale(0.025, 0.075, 0.025);
    mouth4.matrix = applyExplosionTransform(mouth4.matrix, 'mouth4');
    mouth4.render();

    var mouth5 = new Cube();
    mouth5.color = black;
    mouth5.matrix = new Matrix4(headCoordinateMat);
    mouth5.matrix.translate(0.05, 0.0, -0.01);
    mouth5.matrix.scale(0.025, 0.075, 0.025);
    mouth5.matrix = applyExplosionTransform(mouth5.matrix, 'mouth5');
    mouth5.render();

    // Eyes
    var eye1 = new Octahedron();
    eye1.color = red;
    eye1.matrix = new Matrix4(headCoordinateMat);
    eye1.matrix.translate(0.047, 0.125, -0.005);
    eye1.matrix.scale(0.015, 0.025, 0.025);
    eye1.matrix = applyExplosionTransform(eye1.matrix, 'eye1');
    eye1.render();

    var eye2 = new Octahedron();
    eye2.color = red;
    eye2.matrix = new Matrix4(headCoordinateMat);
    eye2.matrix.translate(0.158, 0.125, -0.005);
    eye2.matrix.scale(0.015, 0.025, 0.025);
    eye2.matrix = applyExplosionTransform(eye2.matrix, 'eye2');
    eye2.render();
}

function main() {
    setupWebGl();
    connectVariblesToGLSL();
    addActionsForHtmiUI();

    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    canvas.onmousedown = handleMouseDown;
    canvas.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    canvas.onmouseout = handleMouseOut;

    renderScene();
    requestAnimationFrame(tick);
}