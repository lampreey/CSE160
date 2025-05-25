let g_frontLeftLegAngle = -70;
let g_frontRightLegAngle = 70;
let g_backLeftLegAngle = -70;
let g_backRightLegAngle = 70;

let g_frontLeftLegAngle2 = 90;
let g_frontRightLegAngle2 = -90;
let g_backLeftLegAngle2 = 90;
let g_backRightLegAngle2 = -90;

function renderCreeper() {
    
    // Colors
    const creeperGreen = [0.0, 0.8, 0.2, 1.0];
    const creeperGreen2 = [0.0, 0.7, 0.2, 1.0];
    const creeperDark = [0.0, 0.5, 0.1, 1.0];
    const black = [0.0, 0.0, 0.0, 1.0];
    const red = [1.0, 0.0, 0.0, 1.0];
    const darkGray = [0.1, 0.1, 0.1, 1.0];

    // Body
    var body = new Cube();
    body.textureNum = -2;
    body.color = creeperGreen2;
    body.matrix.translate(0.2, -0.4, 2.0);
    body.matrix.rotate(180, 0, 1, 0);
    var bodyCoordinateMat = new Matrix4(body.matrix);
    body.matrix.scale(0.2, 0.4, 0.1);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.render();

    // Body2
    var body2 = new Cube();
    body2.textureNum = -2;
    body2.color = creeperGreen2;
    body2.matrix = new Matrix4(bodyCoordinateMat);
    body2.matrix.translate(-0.001, 0.3, 0.0);
    var body2CoordinateMat = new Matrix4(body2.matrix);
    body2.matrix.rotate(-70, 1, 0, 0);
    body2.matrix.scale(0.203, 0.2, 0.1);  
    body2.normalMatrix.setInverseOf(body2.matrix).transpose();
    body2.render();

    // Body3
    var body3 = new Cube();
    body3.textureNum = -2;
    body3.color = creeperGreen2;
    body3.matrix = new Matrix4(bodyCoordinateMat);
    body3.matrix.translate(0.0, 0.0, 0.1);
    var body3CoordinateMat = new Matrix4(body3.matrix);
    body3.matrix.rotate(240, 1, 0, 0);
    body3.matrix.scale(0.203, 0.2, 0.1);  
    body3.normalMatrix.setInverseOf(body3.matrix).transpose();
    body3.render();

    // Head
    var head = new Cube();
    head.textureNum = -2;
    head.color = creeperGreen;
    head.matrix = body2CoordinateMat;
    head.matrix.translate(0.0, 0.07, -0.35);
    var headCoordinateMat = new Matrix4(head.matrix);
    head.matrix.scale(0.2, 0.2, 0.2);
    head.normalMatrix.setInverseOf(head.matrix).transpose();
    head.render();

    // Connect1 (Front Left Leg)
    var connect1 = new Cube();
    connect1.textureNum = -2;
    connect1.color = creeperGreen2;
    connect1.matrix = new Matrix4(body3CoordinateMat);
    connect1.matrix.translate(0.0, -0.1, -0.18);
    connect1.matrix.rotate(90, 0, 1, 0);
    connect1.matrix.rotate(g_frontLeftLegAngle, 1, 0, 0);
    connect1.matrix.rotate(-20, 0, 0, 1);
    var connect1CoordinateMat = new Matrix4(connect1.matrix);
    connect1.matrix.scale(0.1, 0.2, 0.1);  
    connect1.normalMatrix.setInverseOf(connect1.matrix).transpose();
    connect1.render();

    // Connect2 (Front Right Leg)
    var connect2 = new Cube();
    connect2.textureNum = -2;
    connect2.color = creeperGreen2;
    connect2.matrix = new Matrix4(body3CoordinateMat);
    connect2.matrix.translate(0.17, 0, -0.18);
    connect2.matrix.rotate(90, 0, 1, 0);
    connect2.matrix.rotate(g_frontRightLegAngle, 1, 0, 0);
    connect2.matrix.rotate(-20, 0, 0, 1);
    var connect2CoordinateMat = new Matrix4(connect2.matrix);
    connect2.matrix.scale(0.1, 0.2, 0.1);  
    connect2.normalMatrix.setInverseOf(connect2.matrix).transpose();
    connect2.render();

    // Connect3 (Back Left Leg)
    var connect3 = new Cube();
    connect3.textureNum = -2;
    connect3.color = creeperGreen2;
    connect3.matrix = new Matrix4(body3CoordinateMat);
    connect3.matrix.translate(0.0, -0.1, 0.05);
    connect3.matrix.rotate(90, 0, 1, 0);
    connect3.matrix.rotate(g_backLeftLegAngle, 1, 0, 0);
    connect3.matrix.rotate(20, 0, 0, 1);
    var connect3CoordinateMat = new Matrix4(connect3.matrix);
    connect3.matrix.scale(0.1, 0.2, 0.1); 
    connect3.normalMatrix.setInverseOf(connect3.matrix).transpose();
    connect3.render();

    // Connect4 (Back Right Leg)
    var connect4 = new Cube();
    connect4.textureNum = -2;
    connect4.color = creeperGreen2;
    connect4.matrix = new Matrix4(body3CoordinateMat);
    connect4.matrix.translate(0.17, 0, 0.05);
    connect4.matrix.rotate(90, 0, 1, 0);
    connect4.matrix.rotate(g_backRightLegAngle, 1, 0, 0);
    connect4.matrix.rotate(20, 0, 0, 1);
    var connect4CoordinateMat = new Matrix4(connect4.matrix);
    connect4.matrix.scale(0.1, 0.2, 0.1); 
    connect4.normalMatrix.setInverseOf(connect4.matrix).transpose(); 
    connect4.render();

    // Leg1 (Front Left)
    var leg1 = new Cube();
    leg1.textureNum = -2;
    leg1.color = creeperGreen2;
    leg1.matrix = connect1CoordinateMat;
    leg1.matrix.translate(0.0, 0.3, -0.1);
    leg1.matrix.rotate(g_frontLeftLegAngle2, 1, 0, 0);
    var leg1CoordinateMat = new Matrix4(leg1.matrix);
    leg1.matrix.scale(0.1, 0.2, 0.1);
    leg1.normalMatrix.setInverseOf(leg1.matrix).transpose(); 
    leg1.render();

    // Leg2 (Front Right)
    var leg2 = new Cube();
    leg2.textureNum = -2;
    leg2.color = creeperGreen2;
    leg2.matrix = connect2CoordinateMat;
    leg2.matrix.translate(0.0, 0.2, 0.2);
    leg2.matrix.rotate(g_frontRightLegAngle2, 1, 0, 0);
    var leg2CoordinateMat = new Matrix4(leg2.matrix);
    leg2.matrix.scale(0.1, 0.2, 0.1);
    leg2.normalMatrix.setInverseOf(leg2.matrix).transpose(); 
    leg2.render();

    // Leg3 (Back Left)
    var leg3 = new Cube();
    leg3.textureNum = -2;
    leg3.color = creeperGreen2;
    leg3.matrix = connect3CoordinateMat;
    leg3.matrix.translate(0.0, 0.3, -0.1);
    leg3.matrix.rotate(g_backLeftLegAngle2, 1, 0, 0);
    var leg3CoordinateMat = new Matrix4(leg3.matrix);
    leg3.matrix.scale(0.1, 0.2, 0.1);
    leg3.normalMatrix.setInverseOf(leg3.matrix).transpose(); 
    leg3.render();

    // Leg4 (Back Right)
    var leg4 = new Cube();
    leg4.textureNum = -2;
    leg4.color = creeperGreen2;
    leg4.matrix = connect4CoordinateMat;
    leg4.matrix.translate(0.0, 0.2, 0.2);
    leg4.matrix.rotate(g_backRightLegAngle2, 1, 0, 0);
    var leg4CoordinateMat = new Matrix4(leg4.matrix);
    leg4.matrix.scale(0.1, 0.2, 0.1);
    leg4.normalMatrix.setInverseOf(leg4.matrix).transpose(); 
    leg4.render();

    // Foot1 (Front Left)
    var foot1 = new Cube();
    foot1.textureNum = -2;
    foot1.color = darkGray;
    foot1.matrix = leg1CoordinateMat;
    foot1.matrix.translate(0.0, -0.075, 0.0);
    foot1.matrix.scale(0.1, 0.075, 0.1);
    foot1.normalMatrix.setInverseOf(foot1.matrix).transpose(); 
    foot1.render();

    // Foot2 (Front Right)
    var foot2 = new Cube();
    foot2.textureNum = -2;
    foot2.color = darkGray;
    foot2.matrix = leg2CoordinateMat;
    foot2.matrix.translate(0.0, -0.075, 0.0);
    foot2.matrix.scale(0.1, 0.075, 0.1);
    foot2.normalMatrix.setInverseOf(foot2.matrix).transpose(); 
    foot2.render();

    // Foot3 (Back Left)
    var foot3 = new Cube();
    foot3.textureNum = -2;
    foot3.color = darkGray;
    foot3.matrix = leg3CoordinateMat;
    foot3.matrix.translate(0.0, -0.075, 0.0);  
    foot3.matrix.scale(0.1, 0.075, 0.1);
    foot3.normalMatrix.setInverseOf(foot3.matrix).transpose(); 
    foot3.render();

    // Foot4 (Back Right)
    var foot4 = new Cube();
    foot4.textureNum = -2;
    foot4.color = darkGray;
    foot4.matrix = leg4CoordinateMat;
    foot4.matrix.translate(0.0, -0.075, 0.0);
    foot4.matrix.scale(0.1, 0.075, 0.1);
    foot4.normalMatrix.setInverseOf(foot4.matrix).transpose(); 
    foot4.render();

    // Mouth parts
    var mouth1 = new Cube();
    mouth1.textureNum = -2;
    mouth1.color = black;
    mouth1.matrix = new Matrix4(headCoordinateMat);
    mouth1.matrix.translate(0.132, 0.1, -0.01);
    mouth1.matrix.scale(0.05, 0.05, 0.025);
    mouth1.normalMatrix.setInverseOf(mouth1.matrix).transpose(); 
    mouth1.render();

    var mouth2 = new Cube();
    mouth2.textureNum = -2;
    mouth2.color = black;
    mouth2.matrix = new Matrix4(headCoordinateMat);
    mouth2.matrix.translate(0.02, 0.1, -0.01);
    mouth2.matrix.scale(0.05, 0.05, 0.025);
    mouth2.normalMatrix.setInverseOf(mouth2.matrix).transpose(); 
    mouth2.render();

    var mouth3 = new Cube();
    mouth3.textureNum = -2;
    mouth3.color = black;
    mouth3.matrix = new Matrix4(headCoordinateMat);
    mouth3.matrix.translate(0.072, 0.04, -0.01);
    mouth3.matrix.scale(0.06, 0.06, 0.025);
    mouth3.normalMatrix.setInverseOf(mouth2.matrix).transpose(); 
    mouth3.render();

    var mouth4 = new Cube();
    mouth4.textureNum = -2;
    mouth4.color = black;
    mouth4.matrix = new Matrix4(headCoordinateMat);
    mouth4.matrix.translate(0.13, 0.0, -0.01);
    mouth4.matrix.scale(0.025, 0.075, 0.025);
    mouth4.normalMatrix.setInverseOf(mouth4.matrix).transpose(); 
    mouth4.render();

    var mouth5 = new Cube();
    mouth5.textureNum = -2;
    mouth5.color = black;
    mouth5.matrix = new Matrix4(headCoordinateMat);
    mouth5.matrix.translate(0.05, 0.0, -0.01);
    mouth5.matrix.scale(0.025, 0.075, 0.025);
    mouth5.normalMatrix.setInverseOf(mouth5.matrix).transpose(); 
    mouth5.render();

    // Eyes
    var eye1 = new Octahedron();
    eye1.textureNum = -2;
    eye1.color = red;
    eye1.matrix = new Matrix4(headCoordinateMat);
    eye1.matrix.translate(0.047, 0.125, -0.005);
    eye1.matrix.scale(0.015, 0.025, 0.025);
    eye1.normalMatrix.setInverseOf(eye1.matrix).transpose(); 
    eye1.render();

    var eye2 = new Octahedron();
    eye2.textureNum = -2;
    eye2.color = red;
    eye2.matrix = new Matrix4(headCoordinateMat);
    eye2.matrix.translate(0.158, 0.125, -0.005);
    eye2.matrix.scale(0.015, 0.025, 0.025);
    eye2.normalMatrix.setInverseOf(eye2.matrix).transpose(); 
    eye2.render();
}
