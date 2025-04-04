function main() {  
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  var v1 = new Vector3([2.5, 2.5, 0])
  drawVector(v1, 'red', ctx);
}

function drawVector(v, color, ctx) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(20 * v.elements[0] + 200, -20 * v.elements[1] + 200);
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var V1X = document.getElementById("v1x").value;
  var V1Y = document.getElementById("v1y").value;
  var v1 = new Vector3([V1X, V1Y, 0]);
  drawVector(v1, 'red', ctx);

  var V2X = document.getElementById("v2x").value;
  var V2Y = document.getElementById("v2y").value;
  var v2 = new Vector3([V2X, V2Y, 0]);
  drawVector(v2, 'blue', ctx);
}

function handleDrawEventOperation() {
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var V1X = document.getElementById("v1x").value;
  var V1Y = document.getElementById("v1y").value;
  var v1 = new Vector3([V1X, V1Y, 0]);
  drawVector(v1, 'red', ctx);

  var V2X = document.getElementById("v2x").value;
  var V2Y = document.getElementById("v2y").value;
  var v2 = new Vector3([V2X, V2Y, 0]);
  drawVector(v2, 'blue', ctx);

  var type = document.getElementById("operations").value;
  var scalar = document.getElementById("scalar").value;

  if (type == 'add'){
    v1.add(v2);
    drawVector(v1, "green", ctx);
  } else if (type == 'sub') {
    v1.sub(v2);
    drawVector(v1, "green", ctx);
  } else if (type == 'div') {
    v1.div(scalar);
    drawVector(v1, "green", ctx);
    v2.div(scalar);
    drawVector(v2, "green", ctx);
  } else if (type == 'mult') {
    v1.mul(scalar);
    drawVector(v1, "green", ctx);
    v2.mul(scalar);
    drawVector(v2, "green", ctx);
  } else if (type == 'mag') {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } else if (type == 'norm') {
    v1.normalize();
    drawVector(v1, "green", ctx);
    v2.normalize();
    drawVector(v2, "green", ctx);
  } else if (type == 'angle') {
    angleBetween(v1, v2)
  } else if (type == 'area') {
    areaTriangle(v1, v2)
  }
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const magProduct = v1.magnitude() * v2.magnitude();
  const angle = Math.acos(Math.min(1, Math.max(-1, dot / magProduct))) * 180 / Math.PI;

  console.log("Angle between vectors: " + angle );
}

function areaTriangle(v1, v2) {
  var triangleArea = Vector3.cross(v1, v2).magnitude() / 2;

  console.log("Area of triangle: " + triangleArea);
}

