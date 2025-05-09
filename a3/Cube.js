class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }
 
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0],  
            [0.0, 0.0,       1.0, 1.0,       1.0, 0.0]          
        );
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],
            [0.0, 0.0,       0.0, 1.0,       1.0, 1.0]
        );

        drawTriangle3DUV(
            [0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], 
            [0.0, 0.0,       1.0, 0.0,       1.0, 1.0]
        );
        drawTriangle3DUV(
            [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0], 
            [0.0, 0.0,       1.0, 1.0,       0.0, 1.0]
        );

        gl.uniform4f(u_FragColor, rgba[0]-.20, rgba[1]-.20, rgba[2]-.20, rgba[3]);

        drawTriangle3DUV(
            [0.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0],
            [0.0, 0.0,       1.0, 1.0,       1.0, 0.0]
        );
        drawTriangle3DUV(
            [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0],
            [0.0, 0.0,       0.0, 1.0,       1.0, 1.0]
        );

        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 0.0, 0.0],
            [0.0, 0.0,       1.0, 1.0,       1.0, 0.0]
        );
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0],
            [0.0, 0.0,       0.0, 1.0,       1.0, 1.0]
        );

        gl.uniform4f(u_FragColor, rgba[0]-.10, rgba[1]-.10, rgba[2]-.10, rgba[3]);

        drawTriangle3DUV(
            [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0],
            [0.0, 0.0,       1.0, 0.0,       1.0, 1.0]
        );
        drawTriangle3DUV(
            [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0],
            [0.0, 0.0,       1.0, 1.0,       0.0, 1.0]
        );
            
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0],
            [0.0, 0.0,       1.0, 1.0,       1.0, 0.0]
        );
        drawTriangle3DUV(
            [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0],
            [0.0, 0.0,       0.0, 1.0,       1.0, 1.0]
        );
    }
}