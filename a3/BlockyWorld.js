var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform int u_whichTexture;
    void main() {

        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;                  // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use skybox texture
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);  // Use street texture
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);  // Use ground texture
        } else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);  // Use ground texture
        } else if (u_whichTexture == 5) {
            gl_FragColor = texture2D(u_Sampler5, v_UV);  // Use bank texture
        } else if (u_whichTexture == 6) {
            gl_FragColor = texture2D(u_Sampler6, v_UV);  // Use bomb texture
        } else {
            gl_FragColor = vec4(1,.2,.2,1);              // Error, put Redish
        }
    }`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_whichTexture;

let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

let g_globalAngle = 0;

let g_walkAnimation = false;

let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_cameraAngleX = 0;
let g_cameraAngleY = 0;

let g_lastFrameTime = performance.now();
let g_fps = 0;

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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
        return;
    }

    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    if (!u_Sampler6) {
        console.log('Failed to get the storage location of u_Sampler6');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
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

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
 
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmiUI() {

}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;

    checkMovement();

    let now = performance.now();
    let delta = now - g_lastFrameTime;
    g_lastFrameTime = now;

    g_fps = Math.round(1000 / delta);
    document.getElementById('fpsCounter').innerText = `FPS: ${g_fps}`;
    
    renderScene();
    requestAnimationFrame(tick);
}

function initTextures() {
    var sidewalkImage = new Image();
    sidewalkImage.onload = function(){ sendTextureToTEXTURE0(sidewalkImage); };
    sidewalkImage.src = 'sidewalk.jpg';

    var skyboxImage = new Image();
    skyboxImage.onload = function(){ sendTextureToTEXTURE1(skyboxImage); };
    skyboxImage.src = 'sky.png'; 

    var streetImage = new Image();
    streetImage.onload = function(){ sendTextureToTEXTURE2(streetImage); };
    streetImage.src = 'street.jpg'; 

    var groundImage = new Image();
    groundImage.onload = function(){ sendTextureToTEXTURE3(groundImage); };
    groundImage.src = 'ground.jpg'; 

    var skyscraperImage = new Image();
    skyscraperImage.onload = function(){ sendTextureToTEXTURE4(skyscraperImage); };
    skyscraperImage.src = 'skyscraper.jpg'; 

    var bankImage = new Image();
    bankImage.onload = function(){ sendTextureToTEXTURE5(bankImage); };
    bankImage.src = 'bank.jpg'; 

    var bombImage = new Image();
    bombImage.onload = function(){ sendTextureToTEXTURE6(bombImage); };
    bombImage.src = 'bomb.png'; 
}
  

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTEXTURE1(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler3, 3);
}

function sendTextureToTEXTURE4(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler4, 4);
}

function sendTextureToTEXTURE5(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler5, 5);
}

function sendTextureToTEXTURE6(image) {
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler6, 6);
}


var camera = new Camera();
let keys = {
    'w': false, 
    'a': false, 
    's': false, 
    'd': false,
    'q': false,  
    'e': false   
};

function keydown(ev) {
    if (ev.keyCode == 87) keys['w'] = true; // W
    if (ev.keyCode == 83) keys['s'] = true; // S
    if (ev.keyCode == 65) keys['a'] = true; // A
    if (ev.keyCode == 68) keys['d'] = true; // D
    if (ev.keyCode == 81) keys['q'] = true; // Q - turn left
    if (ev.keyCode == 69) keys['e'] = true; // E - turn right
}

function keyup(ev) {
    if (ev.keyCode == 87) keys['w'] = false; // W
    if (ev.keyCode == 83) keys['s'] = false; // S
    if (ev.keyCode == 65) keys['a'] = false; // A
    if (ev.keyCode == 68) keys['d'] = false; // D
    if (ev.keyCode == 81) keys['q'] = false; // Q
    if (ev.keyCode == 69) keys['e'] = false; // E
}

function checkMovement() {
    if (keys['w']) camera.forward();
    if (keys['s']) camera.back();
    if (keys['a']) camera.left();
    if (keys['d']) camera.right();
    
    if (keys['q']) camera.turnLeft();
    if (keys['e']) camera.turnRight();

    if (Object.values(keys).some(v => v)) {
        renderScene();
    }
}

let g_yaw = 0;      
let g_pitch = 0;    
const ROTATION_SPEED = 0.002; 
const MAX_PITCH = Math.PI/2 - 0.1; 

function setupMouseControls() {
    canvas.addEventListener('click', function(e) {
        if (document.pointerLockElement !== canvas && 
            document.mozPointerLockElement !== canvas && 
            document.webkitPointerLockElement !== canvas) {
            
            canvas.requestPointerLock = canvas.requestPointerLock || 
                                      canvas.mozRequestPointerLock || 
                                      canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        } else {
            const [x, y, z] = calculatePlacementPosition();
            placeCube(x, y, z);
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (document.pointerLockElement === canvas || 
            document.mozPointerLockElement === canvas || 
            document.webkitPointerLockElement === canvas) {
            
            const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
            
            g_yaw += movementX * ROTATION_SPEED;
            g_pitch -= movementY * ROTATION_SPEED;
            
            g_pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, g_pitch));
            
            updateCameraDirection();
        }
    });
}

function updateCameraDirection() {
    const direction = new Vector3([
        Math.sin(g_yaw) * Math.cos(g_pitch),
        Math.sin(g_pitch),
        -Math.cos(g_yaw) * Math.cos(g_pitch)
    ]);
    
    direction.normalize();
    camera.at = new Vector3([
        camera.eye.elements[0] + direction.elements[0],
        camera.eye.elements[1] + direction.elements[1],
        camera.eye.elements[2] + direction.elements[2]
    ]);
}

let lamppostModel;

function loadOBJModels() {
    lamppostModel = new OBJModel()
        .setColor(0.7, 0.7, 0.7, 1.0)  
        .loadOBJ('lamppost.obj'); 
}


let g_placedCubes = []; 

function placeCube(x, y, z) {
    const newCube = {
        position: [x, y, z],
        color: [1.0, 1.0, 1.0, 1.0],
        scale: [0.1, 0.2, 0.3], 
        rotation: 0
    };
    
    g_placedCubes.push(newCube);
    
    renderScene();
}

function calculatePlacementPosition() {
    const eyeX = camera.eye.elements[0];
    const eyeY = camera.eye.elements[1];
    const eyeZ = camera.eye.elements[2];
    
    const dirX = camera.at.elements[0] - eyeX;
    const dirY = camera.at.elements[1] - eyeY;
    const dirZ = camera.at.elements[2] - eyeZ;
    
    const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
    const normDirX = dirX / length;
    const normDirY = dirY / length;
    const normDirZ = dirZ / length;
    
    const distance = 1.0;
    const posX = eyeX + normDirX * distance;
    const posY = eyeY + normDirY * distance;
    const posZ = eyeZ + normDirZ * distance;
    
    return [posX, posY, posZ];
}

function drawPlacedCubes() {
    for (let i = 0; i < g_placedCubes.length; i++) {
        const cube = g_placedCubes[i];
        
        const placedCube = new Cube();
        placedCube.color = cube.color;
        placedCube.textureNum = 6; 
        
        placedCube.matrix.translate(cube.position[0], cube.position[1], cube.position[2]);
        if (cube.rotation) {
            placedCube.matrix.rotate(cube.rotation, 0, 1, 0);
        }
        placedCube.matrix.scale(cube.scale[0], cube.scale[1], cube.scale[2]);
        placedCube.matrix.translate(-0.5, -0.5, -0.5); 
        
        placedCube.render();
    }
}

function drawSidewalk() {
    let coord = 10.5;
    for(x = 0; x < 32; x++) {
        var sidewalk = new Cube();
        sidewalk.color = [0.5,0.5,0.5,1.0];
        sidewalk.textureNum = 0;
        sidewalk.matrix.translate(1.35, -0.75, coord);
        sidewalk.matrix.scale(0.7, 0, 0.7);
        sidewalk.matrix.translate(-0.5, 0.0, -0.5);
        sidewalk.render();

        coord -= 0.7;
    }

    coord = 10.5;
    for(x = 0; x < 32; x++) {
        var sidewalk = new Cube();
        sidewalk.color = [0.5,0.5,0.5,1.0];
        sidewalk.textureNum = 0;
        sidewalk.matrix.translate(-1.35, -0.75, coord);
        sidewalk.matrix.scale(0.7, 0, 0.7);
        sidewalk.matrix.translate(-0.5, 0.0, -0.5);
        sidewalk.render();

        coord -= 0.7;
    }

}

function renderScene() {
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(
        camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
        camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
        camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMatY = new Matrix4().rotate(g_cameraAngleY, 0, 1, 0);
    var globalRotMatX = new Matrix4().rotate(g_cameraAngleX, 1, 0, 0);
    var globalRotMat = new Matrix4().multiply(globalRotMatY).multiply(globalRotMatX);
    
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var skybox = new Cube();
    skybox.color = [1,1,1,1];
    skybox.textureNum = 1; 
    skybox.matrix.scale(50, 50, 50); 
    skybox.matrix.translate(-0.5, -0.5, -0.5);
    skybox.render();

    var floor = new Cube();
    floor.color = [0.5,0.5,0.5,1.0];
    floor.textureNum = -2;
    floor.matrix.translate(0, -0.75, 0.0);
    floor.matrix.scale(10.0, 0, 10.0);
    floor.matrix.translate(-0.5, 0.0, -0.5);
    //floor.render();

    var floor2 = new Cube();
    floor2.color = [0.0,0.5,0.5,1.0];
    floor2.textureNum = 2;
    floor2.matrix.translate(0, -0.75, -0.35);
    floor2.matrix.scale(2.0, 0, 22.4);
    floor2.matrix.translate(-0.5, 0.0, -0.5);
    floor2.render();

    drawSidewalk()

    var floor3 = new Cube();
    floor3.color = [0.3,0.3,0.3,1.0];
    floor3.textureNum = -2;
    floor3.matrix.translate(5.7, -0.75, -0.35);
    floor3.matrix.scale(8.0, 0, 22.4);
    floor3.matrix.translate(-0.5, 0.0, -0.5);
    floor3.render();

    var floor4 = new Cube();
    floor4.color = [0.3,0.3,0.3,1.0];
    floor4.textureNum = -2;
    floor4.matrix.translate(-5.7, -0.75, -0.35);
    floor4.matrix.scale(8.0, 0, 22.4);
    floor4.matrix.translate(-0.5, 0.0, -0.5);
    floor4.render();

    var bank = new Cube();
    bank.color = [0.3,0.3,0.3,1.0];
    bank.textureNum = 5;
    bank.matrix.translate(-7.0, -0.75, 7.0);
    bank.matrix.scale(5.0,3.0,5.0);
    bank.matrix.translate(-0.5, 0.0, -0.5);
    bank.matrix.rotate(90, 0, 1, 0);
    bank.render();

    var skyscraper1 = new Skyscraper()
    .setPosition(5, -0.75, -5)
    .setSize(3, 10, 3)
    .setColor(0.2, 0.2, 0.3, 1)
    skyscraper1.render();

    var skyscraper2 = new Skyscraper()
    .setPosition(-5, -0.75, -4)
    .setSize(3, 10, 3)
    .setColor(0.2, 0.2, 0.3, 1)
    skyscraper2.render();

    var skyscraper3 = new Skyscraper()
    .setPosition(-7, -0.75, 8)
    .setSize(3, 10, 3)
    .setColor(0.2, 0.2, 0.3, 1)
    skyscraper3.render();

    var skyscraper4 = new Skyscraper()
    .setPosition(7, -0.75, 3)
    .setSize(3, 10, 3)
    .setColor(0.2, 0.2, 0.3, 1)
    skyscraper4.render();

    var skyscraper5 = new Skyscraper()
    .setPosition(8, -0.75, 8)
    .setSize(3, 10, 3)
    .setColor(0.2, 0.2, 0.3, 1)
    skyscraper5.render();

    if (lamppostModel && lamppostModel.isLoaded) {
        let coord = 7.0
        for(x = 0; x < 4; x++) {
            lamppostModel.setPosition(-1.8, 0.14, coord)
                    .setScale(0.002, 0.002, 0.002)
                    .setColor(0.5, 0.5, 0.5, 1.0)
                    .render();
            coord -= 5;
        }
        coord = 8.0
        for(x = 0; x < 4; x++) {
            lamppostModel.setPosition(1.8, 0.14, coord)
                    .setScale(0.002, 0.002, 0.002)
                    .setColor(0.5, 0.5, 0.5, 1.0)
                    .rotate(180, 0, 1, 0)
                    .render();
            coord -= 5;
        }
    }

    drawPlacedCubes();
}

function main() {
    setupWebGl();
    connectVariblesToGLSL();
    addActionsForHtmiUI();

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    setupMouseControls();

    initTextures();
    loadOBJModels();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);

    renderScene();
    requestAnimationFrame(tick);
}