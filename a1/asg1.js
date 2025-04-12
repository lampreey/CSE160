var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'uniform float u_Size;' +
    'void main() {' +
    '  gl_Position = a_Position;' +
    '  gl_PointSize = u_Size;' +
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
let u_Size;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PADDLE = 3;
const BALL = 4;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedSize = 5;
let g_selectedSegment = 10;
let g_selectedType = POINT;
let g_shapesList = [];

let g_pongMode = false;
let g_leftPaddleY = 0;
let g_rightPaddleY = 0;
let g_ballPos = [0, 0];
let g_ballVel = [0.01, 0.01];
let g_playerScore = 0;
let g_computerScore = 0;
let g_animationId = null;

function setupWebGl() {
    canvas = document.getElementById('webgl');

    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function addActionsForHtmiUI() {
    document.getElementById('artButton').onclick = function() { drawArt(); };
    document.getElementById('clearButton').onclick = function() { 
        if (g_pongMode) {
            g_pongMode = false;
            if (g_animationId) {
                cancelAnimationFrame(g_animationId);
                g_animationId = null;
            }
        }
        g_shapesList = []; 
        renderAllShapes();

        sendTextToHTML("numdot 0 ms: 0 fps: 0", "numdot");
    };

    document.getElementById('pointButton').onclick = function() { g_selectedType = POINT };
    document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE };
    
    document.getElementById('pongButton').onclick = function() { 
        g_pongMode = !g_pongMode;
        if (g_pongMode) {
            g_shapesList = [];
            initPong();
            animatePong();
        } else {
            if (g_animationId) {
                cancelAnimationFrame(g_animationId);
                g_animationId = null;
            }
            g_shapesList = [];
            renderAllShapes();
            sendTextToHTML("numdot 0 ms: 0 fps: 0", "numdot");
        }
    };

    document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value/100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value; });
}

function main() {
    setupWebGl();
    connectVariblesToGLSL();
    addActionsForHtmiUI();

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
    if (g_pongMode) {
        let [x, y] = convertCoordinatesEventToGl(ev);
        g_leftPaddleY = y;
        return;
    }
    
    let [x,y] = convertCoordinatesEventToGl(ev);
    let point;

    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segment = g_selectedSegment;
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesEventToGl(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x,y]);
}

function renderAllShapes() {
    var startTime = performance.now();

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    if (!g_pongMode) {
        sendTextToHTML("numdot " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
    }
}

function sendTextToHTML(text, htmlID) { 
    var htmlElement = document.getElementById(htmlID);
    if(!htmlElement) {
        console.log("failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElement.innerHTML = text;
}

function initPong() {
    g_shapesList = [];
    g_leftPaddleY = 0;
    g_rightPaddleY = 0;
    g_ballPos = [0, 0];
    g_ballVel = [0.01, 0.01 * (Math.random() > 0.5 ? 1 : -1)];
    g_playerScore = 0;
    g_computerScore = 0;
    
    sendTextToHTML(`Player: ${g_playerScore} - Computer: ${g_computerScore}`, "numdot");
}

function animatePong() {
    if (!g_pongMode) {
        return;
    }
    
    updatePong();
    renderPong();
    g_animationId = requestAnimationFrame(animatePong);
}

function updatePong() {
    if (!g_pongMode) {
        return;
    }

    g_ballPos[0] += g_ballVel[0];
    g_ballPos[1] += g_ballVel[1];
    
    if (g_ballPos[1] > 0.9 || g_ballPos[1] < -0.9) {
        g_ballVel[1] = -g_ballVel[1];
    }
    
    if (g_ballPos[0] < -0.9 && 
        g_ballPos[0] > -0.95 && 
        g_ballPos[1] > g_leftPaddleY - 0.1 && 
        g_ballPos[1] < g_leftPaddleY + 0.1) {
        g_ballVel[0] = -g_ballVel[0] * 1.05;
        g_ballVel[1] += (g_ballPos[1] - g_leftPaddleY) * 0.05;
    }

    if (g_ballPos[0] > 0.9 && 
        g_ballPos[0] < 0.95 && 
        g_ballPos[1] > g_rightPaddleY - 0.1 && 
        g_ballPos[1] < g_rightPaddleY + 0.1) {
        g_ballVel[0] = -g_ballVel[0] * 1.05;
        g_ballVel[1] += (g_ballPos[1] - g_rightPaddleY) * 0.05;
    }
    
    if (g_ballPos[0] > 0) {
        if (g_ballPos[1] > g_rightPaddleY + 0.05) {
            g_rightPaddleY += 0.02;
        } else if (g_ballPos[1] < g_rightPaddleY - 0.05) {
            g_rightPaddleY -= 0.02;
        }
    }
    
    if (g_ballPos[0] < -1.0) {
        g_computerScore++;
        resetBall();
    } else if (g_ballPos[0] > 1.0) {
        g_playerScore++;
        resetBall();
    }
    
    sendTextToHTML(`Player: ${g_playerScore} - Computer: ${g_computerScore}`, "numdot");
}

function resetBall() {
    g_ballPos = [0, 0];
    g_ballVel = [0.01 * (Math.random() > 0.5 ? 1 : -1), 0.01 * (Math.random() > 0.5 ? 1 : -1)];
}

function renderPong() {
    g_shapesList = [];
    
    let leftPaddleTop = new DrawTriangle();
    leftPaddleTop.position = [-0.95, g_leftPaddleY - 0.1, -0.95, g_leftPaddleY + 0.1, -0.9, g_leftPaddleY + 0.1];
    leftPaddleTop.color = [1.0, 1.0, 1.0, 1.0];
    g_shapesList.push(leftPaddleTop);
    
    let leftPaddleBottom = new DrawTriangle();
    leftPaddleBottom.position = [-0.95, g_leftPaddleY - 0.1, -0.9, g_leftPaddleY - 0.1, -0.9, g_leftPaddleY + 0.1];
    leftPaddleBottom.color = [1.0, 1.0, 1.0, 1.0];
    g_shapesList.push(leftPaddleBottom);
    
    let rightPaddleTop = new DrawTriangle();
    rightPaddleTop.position = [0.95, g_rightPaddleY - 0.1, 0.95, g_rightPaddleY + 0.1, 0.9, g_rightPaddleY + 0.1];
    rightPaddleTop.color = [1.0, 1.0, 1.0, 1.0];
    g_shapesList.push(rightPaddleTop);
    
    let rightPaddleBottom = new DrawTriangle();
    rightPaddleBottom.position = [0.95, g_rightPaddleY - 0.1, 0.9, g_rightPaddleY - 0.1, 0.9, g_rightPaddleY + 0.1];
    rightPaddleBottom.color = [1.0, 1.0, 1.0, 1.0];
    g_shapesList.push(rightPaddleBottom);
    
    let ball = new Circle();
    ball.position = g_ballPos;
    ball.color = [1.0, 1.0, 1.0, 1.0];
    ball.size = 10;
    ball.segment = 20;
    g_shapesList.push(ball);
    
    renderAllShapes();
}

function drawArt() {
    g_shapesList = [];
    
    let t1 = new DrawTriangle();
    t1.position = [0, 0.1, -0.045, -0.23, 0, -0.23];
    t1.color = [0.0, 0.5, 0.5, 1.0];
    let t14 = new DrawTriangle();
    t14.position = [0, 0.1, 0.045, -0.23, 0, -0.23];
    t14.color = [0.0, 0.5, 0.5, 1.0];
    let t15 = new DrawTriangle();
    t15.position = [0.045, -0.23, 0, -0.3, -0.045, -0.23];
    t15.color = [0.0, 0.5, 0.5, 1.0];
    let t2 = new DrawTriangle();
    t2.position = [-0.05, 0, -0.035, -0.04, -0.01, 0];
    t2.color = [0.0, 0.5, 0.5, 1.0];    
    let t3 = new DrawTriangle();
    t3.position = [0.01, 0, 0.035, -0.04, 0.05, 0];
    t3.color = [0.0, 0.5, 0.5, 1.0];    
    
    let t4 = new DrawTriangle();
    t4.position = [0, 0.1, -0.17, -0.3, 0.17, -0.3];
    t4.color = [0.5, 0.5, 0.5, 1.0];
    let t16 = new DrawTriangle();
    t16.position = [0, 0.1, -0.185, -0.32, 0.185, -0.32];
    t16.color = [0, 0, 0, 1.0];
    let t17 = new DrawTriangle();
    t17.position = [0, 0.1, -0.185, -0.33, 0.185, -0.33];
    t17.color = [0.0, 0.5, 0.5, 1.0];

    let t5 = new DrawTriangle();
    t5.position = [-0.2, 0, 0, 0.2, 0.2, 0];
    t5.color = [1.0, 0.8, 0.6, 1.0];
    let t6 = new DrawTriangle();
    t6.position = [0, 0.2, 0.2, 0.2, 0.2, 0];
    t6.color = [1.0, 0.8, 0.6, 1.0];
    let t7 = new DrawTriangle();
    t7.position = [0, 0.2, -0.2, 0.2, -0.2, 0];
    t7.color = [1.0, 0.8, 0.6, 1.0];

    let t8 = new DrawTriangle();
    t8.position = [-0.23, 0.23, -0.12, 0.23, -0.23, -0.05];
    t8.color = [0, 1.0, 1.0, 1.0];
    let t9 = new DrawTriangle();
    t9.position = [0.23, 0.23, 0.12, 0.23, 0.23, -0.05];
    t9.color = [0, 1.0, 1.0, 1.0];
    let t10 = new DrawTriangle();
    t10.position = [-0.19, 0.23, 0.03, 0.23, -0.02, 0.1];
    t10.color = [0, 1.0, 1.0, 1.0];
    let t11 = new DrawTriangle();
    t11.position = [-0.1, 0.23, 0.19, 0.23, 0.09, 0.12];
    t11.color = [0, 1.0, 1.0, 1.0];
    let t12 = new DrawTriangle();
    t12.position = [-0.3, 0.2, -0.3, -0.23, -0.23, 0.2];
    t12.color = [0, 1.0, 1.0, 1.0];
    let t13 = new DrawTriangle();
    t13.position = [0.3, 0.2, 0.3, -0.23, 0.23, 0.2];
    t13.color = [0, 1.0, 1.0, 1.0];

    let t21 = new DrawTriangle();
    t21.position = [0, 0.03, -0.02, 0.01, 0.02, 0.01];
    t21.color = [0, 0, 0, 1.0];

    let t22 = new DrawTriangle();
    t22.position = [-0.2, -0.14, -0.05, -0.1, -0.01, 0];
    t22.color = [1.0, 0.8, 0.6, 1.0];
    let t23 = new DrawTriangle();
    t23.position = [0.2, -0.14, 0.05, -0.1, 0.01, 0];
    t23.color = [1.0, 0.8, 0.6, 1.0];

    
    let t24 = new DrawTriangle();
    t24.position = [-0.08, -0.25, -0.12, -0.38, -0.04, -0.38];
    t24.color = [0.0, 0.5, 0.5, 1.0];
    let t25 = new DrawTriangle();
    t25.position = [0.08, -0.25, 0.12, -0.38, 0.04, -0.38];
    t25.color = [0.0, 0.5, 0.5, 1.0];
    
    
    g_shapesList.push(t22);
    g_shapesList.push(t23);

    g_shapesList.push(t24);
    g_shapesList.push(t25);

    g_shapesList.push(t17);
    g_shapesList.push(t16);
    g_shapesList.push(t4);

    g_shapesList.push(t1);
    g_shapesList.push(t14);
    g_shapesList.push(t15);
    g_shapesList.push(t2);
    g_shapesList.push(t3);

    g_shapesList.push(t5);
    g_shapesList.push(t6);
    g_shapesList.push(t7);

    g_shapesList.push(t8);
    g_shapesList.push(t9);
    g_shapesList.push(t10);
    g_shapesList.push(t11);
    g_shapesList.push(t12);
    g_shapesList.push(t13);
    g_shapesList.push(t21);


    var centerX = 0.1;
    var centerY = 0.07;
    var radiusX = 0.02;
    var radiusY = 0.04;
    var segments = 40; 
    var color = [0.0, 0.0, 0.0, 1.0]; 

    for (let i = 0; i < segments; i++) {
        var angle1 = (i / segments) * 2 * Math.PI;
        var angle2 = ((i + 1) / segments) * 2 * Math.PI;
        
        var x1 = centerX;
        var y1 = centerY;
        var x2 = centerX + Math.cos(angle1) * radiusX;
        var y2 = centerY + Math.sin(angle1) * radiusY;
        var x3 = centerX + Math.cos(angle2) * radiusX;
        var y3 = centerY + Math.sin(angle2) * radiusY;    

        t19 = new DrawTriangle();
        t19.position = [x1, y1, x2, y2, x3, y3];
        t19.color = color;
        g_shapesList.push(t19);
    }

    var center1X = -0.1;
    var center1Y = 0.07;
    var radius1X = 0.02;
    var radius1Y = 0.04;
    var segments1 = 40; 
    var color1 = [0.0, 0.0, 0.0, 1.0]; 

    for (let i = 0; i < segments1; i++) {
        var angle1 = (i / segments1) * 2 * Math.PI;
        var angle2 = ((i + 1) / segments1) * 2 * Math.PI;
        
        var x1 = center1X;
        var y1 = center1Y;
        var x2 = center1X + Math.cos(angle1) * radius1X;
        var y2 = center1Y + Math.sin(angle1) * radius1Y;
        var x3 = center1X + Math.cos(angle2) * radius1X;
        var y3 = center1Y + Math.sin(angle2) * radius1Y;    

        t20 = new DrawTriangle();
        t20.position = [x1, y1, x2, y2, x3, y3];
        t20.color = color1;
        g_shapesList.push(t20);
    }

    renderAllShapes();
}