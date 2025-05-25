var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
        v_VertPos = u_ModelMatrix * a_Position;
    }`

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos; 
    uniform vec3 u_lightColor;
    uniform vec3 u_spotlightPos; 
    uniform vec3 u_spotlightDirection; 
    uniform float u_spotlightCutoff;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_EnableSpecular;
    uniform bool u_lightOn;

    void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); // Use normal
        } else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor; // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV); // Use grid texture
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV); // Use skybox texture
        } else {
            gl_FragColor = vec4(1, 0.2, 0.2, 1); // Error, put Redish
        }


        vec3 pointLightVector = u_lightPos - vec3(v_VertPos);

        vec3 L_point = normalize(pointLightVector);
        vec3 N = normalize(v_Normal);

        float nDotL_point = max(dot(N, L_point), 0.0);

        vec3 R_point = reflect(-L_point, N);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

        float specular_point = pow(max(dot(E, R_point), 0.0), 10.0);

        vec3 diffuse_point = vec3(gl_FragColor) * nDotL_point * 0.7 * u_lightColor;
        vec3 ambient_point = vec3(gl_FragColor) * 0.3 * u_lightColor;

        vec3 spotlightVector = u_spotlightPos - vec3(v_VertPos);
        vec3 L_spot = normalize(spotlightVector);
        vec3 spotlightDir = normalize(u_spotlightDirection);
        float theta = dot(L_spot, -spotlightDir); 

        float epsilon = 0.01; // Soft edge for the spotlight
        float intensity = clamp((theta - u_spotlightCutoff) / epsilon, 0.0, 1.0);

        float nDotL_spot = max(dot(N, L_spot), 0.0);
        vec3 R_spot = reflect(-L_spot, N);
        float specular_spot = pow(max(dot(E, R_spot), 0.0), 10.0);

        vec3 diffuse_spot = vec3(gl_FragColor) * nDotL_spot * 0.7 * intensity * u_lightColor;
        vec3 ambient_spot = vec3(gl_FragColor) * 0.3 * intensity * u_lightColor;

        if (u_lightOn) {
            if (u_EnableSpecular) {
                gl_FragColor = vec4(specular_point + diffuse_point + ambient_point + diffuse_spot + ambient_spot, 1.0);
            } else {
                gl_FragColor = vec4(diffuse_point + ambient_point + diffuse_spot + ambient_spot, 1.0);
            }
        }
    }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor; 

let u_FragColor;
let u_ModelMatrix;
let u_NormalMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

let g_globalAngle = 0;

let g_normalOn = false;
let g_lightOn = true;

let g_lightPos = [0,3,2];
let g_lightColor = [1.0, 1.0, 1.0]; 

let spotlightPosition = [0, 3, 2];
let spotlightDirection = [0, -1, 0]; 
let spotlightCutoff = Math.cos(Math.PI / 6); 

let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_cameraAngleX = 0;
let g_cameraAngleY = 0;

let g_lastFrameTime = performance.now();
let g_fps = 0;

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

var camera = new Camera();

let keys = {
    'w': false, 
    'a': false, 
    's': false, 
    'd': false,
    'q': false,  
    'e': false   
};

let g_yaw = 0;      
let g_pitch = 0;    
const ROTATION_SPEED = 0.002; 
const MAX_PITCH = Math.PI/2 - 0.1; 

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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
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

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get the storage location of u_lightColor');
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

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
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

    u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
    u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
    u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
    if (!u_spotlightPos || !u_spotlightDirection || !u_spotlightCutoff) {
        console.log('Failed to get spotlight uniform locations');
        return;
    }
    
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmiUI() {
    document.getElementById('normalOn').onclick = function() { g_normalOn = true };
    document.getElementById('normalOff').onclick = function() { g_normalOn = false };

    document.getElementById('lightOn').onclick = function() { g_lightOn = true };
    document.getElementById('lightOff').onclick = function() { g_lightOn = false };

    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[0] = this.value/100; renderScene();}});
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[1] = this.value/100; renderScene();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[2] = this.value/100; renderScene();}});

    document.getElementById('spotlightSlideX').addEventListener('mousemove', function(ev) { 
        if(ev.buttons == 1){ 
            spotlightPosition[0] = this.value; 
            renderScene(); 
        }
    });
    document.getElementById('spotlightSlideY').addEventListener('mousemove', function(ev) { 
        if(ev.buttons == 1){ 
            spotlightPosition[1] = this.value; 
            renderScene(); 
        }
    });
    document.getElementById('spotlightSlideZ').addEventListener('mousemove', function(ev) { 
        if(ev.buttons == 1){ 
            spotlightPosition[2] = this.value; 
            renderScene(); 
        }
    });
}

function updateLightColor() {
    const hue = document.getElementById('lightColorHue').value;
    const h = hue / 60;
    const c = 1.0;
    const x = (1 - Math.abs(h % 2 - 1)) * c;
    
    let r, g, b;
    if (h <= 1) { [r, g, b] = [c, x, 0]; }
    else if (h <= 2) { [r, g, b] = [x, c, 0]; }
    else if (h <= 3) { [r, g, b] = [0, c, x]; }
    else if (h <= 4) { [r, g, b] = [0, x, c]; }
    else if (h <= 5) { [r, g, b] = [x, 0, c]; }
    else { [r, g, b] = [c, 0, x]; }
    
    g_lightColor = [r, g, b];
    renderScene();
}

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;

    checkMovement();

    let now = performance.now();
    let delta = now - g_lastFrameTime;
    g_lastFrameTime = now;

    g_fps = Math.round(1000 / delta);
    document.getElementById('fpsCounter').innerText = `FPS: ${g_fps}`;

    updateAnimation();
    
    renderScene();
    requestAnimationFrame(tick);
}

function updateAnimation() {
    g_lightPos[0] = 3*Math.cos(3*g_seconds);
}

function initTextures() {
    var gridImage = new Image();
    gridImage.onload = function(){ sendTextureToTEXTURE0(gridImage); };
    gridImage.src = 'grid.jpg';

    var skyboxImage = new Image();
    skyboxImage.onload = function(){ sendTextureToTEXTURE1(skyboxImage); };
    skyboxImage.src = 'sky.png'; 

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

function keydown(ev) {
    if (ev.keyCode == 87) keys['w'] = true; 
    if (ev.keyCode == 83) keys['s'] = true; 
    if (ev.keyCode == 65) keys['a'] = true; 
    if (ev.keyCode == 68) keys['d'] = true; 
    if (ev.keyCode == 81) keys['q'] = true; 
    if (ev.keyCode == 69) keys['e'] = true; 
}

function keyup(ev) {
    if (ev.keyCode == 87) keys['w'] = false; 
    if (ev.keyCode == 83) keys['s'] = false; 
    if (ev.keyCode == 65) keys['a'] = false; 
    if (ev.keyCode == 68) keys['d'] = false; 
    if (ev.keyCode == 81) keys['q'] = false; 
    if (ev.keyCode == 69) keys['e'] = false; 
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

function setupMouseControls() {
    canvas.addEventListener('click', function(e) {
        if (document.pointerLockElement !== canvas && 
            document.mozPointerLockElement !== canvas && 
            document.webkitPointerLockElement !== canvas) {
            
            canvas.requestPointerLock = canvas.requestPointerLock || 
                                      canvas.mozRequestPointerLock || 
                                      canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
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
        .loadOBJ('lamppost.obj'); 
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
    skybox.color = [0.2,0.2,0.2,1];
    skybox.textureNum = 1; 
    if(g_normalOn) skybox.textureNum = -3;
    skybox.matrix.scale(-10.0, -10.0, -10.0); 
    skybox.matrix.translate(-0.5, -0.5, -0.5);
    skybox.enableSpecular = false;
    //skybox.normalMatrix.setInverseOf(skybox.matrix).transpose();
    skybox.render();

    var floor = new Cube();
    floor.color = [0.7,0.7,0.7,1.0];
    floor.textureNum = 0;
    floor.matrix.translate(0.0, -0.75, 0.0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, 0.0, -0.5);
    floor.enableSpecular = false;
    //floor.normalMatrix.setInverseOf(floor.matrix).transpose();
    floor.render();

    
    if (lamppostModel && lamppostModel.isLoaded) {
        let coord = 2.5;
        for(x = 0; x < 2; x++) {
            lamppostModel.matrix.setIdentity();
            lamppostModel.matrix.setTranslate(-1.8, 0.14, coord);
            lamppostModel.color = [0.5, 0.5, 0.5, 1.0];
            lamppostModel.matrix.scale(0.002, 0.002, 0.002);
            lamppostModel.render();
            coord -= 5;
        }
        coord = 2.5;
        for(x = 0; x < 2; x++) {
            lamppostModel.matrix.setIdentity();
            lamppostModel.matrix.setTranslate(1.8, 0.14, coord);
            lamppostModel.color = [0.5, 0.5, 0.5, 1.0];
            lamppostModel.matrix.scale(0.002, 0.002, 0.002);
            lamppostModel.matrix.rotate(180, 0, 1, 0);
            lamppostModel.render();
            coord -= 5;

        }
    }
    
    var cube = new Cube();
    cube.color = [1.0,0.7,0.7,1.0];
    cube.textureNum = -3;
    cube.matrix.translate(1.0, -0.75, -1.0);
    cube.matrix.scale(1, 1, 1);
    cube.matrix.translate(-0.5, 0.0, -0.5);
    cube.enableSpecular = true;
    cube.render();

    var sphere = new Sphere();
    sphere.textureNum = -3;
    sphere.matrix.translate(-1.0, 0.0, -1.0);
    sphere.matrix.scale(1, 1, 1);
    sphere.matrix.translate(-0.5, 0.0, -0.5);
    sphere.enableSpecular = true;
    sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
    sphere.render();

    renderCreeper();

    gl.uniform3fv(u_lightColor, g_lightColor);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    var light = new Cube();
    light.textureNum = -2;
    light.color = [2.0, 2.0, 0.0, 1.0];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.render();

    gl.uniform3fv(u_spotlightPos, spotlightPosition);
    gl.uniform3fv(u_spotlightDirection, spotlightDirection);
    gl.uniform1f(u_spotlightCutoff, spotlightCutoff);

    var spotlightIndicator = new Cube();
    spotlightIndicator.textureNum = -2;
    spotlightIndicator.color = [1.0, 1.0, 1.0, 1.0]; 
    spotlightIndicator.matrix.setTranslate(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2]);
    spotlightIndicator.matrix.scale(-0.1, -0.1, -0.1);
    spotlightIndicator.render();

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

    renderScene();
    requestAnimationFrame(tick);
}
