class Octahedron {
    constructor() {
        this.type = 'octahedron';
        this.color = [1.0, 1.0, 1.0, 1.0]; 
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.size = 0.5;
        this.enableSpecular = false;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


        const vertices = [
            0, this.size, 0,
            -this.size, 0, -this.size,
            this.size, 0, -this.size,
            this.size, 0, this.size,
            -this.size, 0, this.size,
            0, -this.size, 0
        ];

        const faces = [
            { indices: [0, 1, 2], normal: [0, 0.707, -0.707] },  
            { indices: [0, 2, 3], normal: [0.707, 0.707, 0] },     
            { indices: [0, 3, 4], normal: [0, 0.707, 0.707] },    
            { indices: [0, 4, 1], normal: [-0.707, 0.707, 0] },  
            
            { indices: [5, 2, 1], normal: [0, -0.707, -0.707] },   
            { indices: [5, 3, 2], normal: [0.707, -0.707, 0] },    
            { indices: [5, 4, 3], normal: [0, -0.707, 0.707] },     
            { indices: [5, 1, 4], normal: [-0.707, -0.707, 0] }     
        ];

        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            const v1 = vertices.slice(face.indices[0]*3, face.indices[0]*3+3);
            const v2 = vertices.slice(face.indices[1]*3, face.indices[1]*3+3);
            const v3 = vertices.slice(face.indices[2]*3, face.indices[2]*3+3);
            
            const faceColor = [
                this.color[0],
                this.color[1],
                this.color[2],
                this.color[3]
            ];
            
            gl.uniform4f(u_FragColor, ...faceColor);
            drawTriangle3D([...v1, ...v2, ...v3]);
        }
    }
}
