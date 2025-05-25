class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -1;
        this.enableSpecular = true;
    }
    

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        gl.uniform1i(gl.getUniformLocation(gl.program, 'u_EnableSpecular'), this.enableSpecular ? 1 : 0);

        // Front 
        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

        // Top
        drawTriangle3DUVNormal([1,1,0, 1,1,1, 0,1,0],[1,0, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0,1,1, 1,1,1, 0,1,0],[0,1, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);

        // Right
        drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1],[0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1],[0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);

        // Left
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1],[1,0, 0,0, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1],[1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);

        // Bottom
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],[0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

        // Back
        drawTriangle3DUVNormal([1,0,1, 0,0,1, 0,1,1],[0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1],[0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
    }
}
