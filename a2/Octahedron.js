// Octahedron.js with face shading
class Octahedron {
    constructor() {
        this.type = 'octahedron';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Base color (white by default)
        this.matrix = new Matrix4();
        this.size = 0.5;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Vertices of an octahedron
        const vertices = [
            // Top point (0)
            0, this.size, 0,
            
            // Base square points (counter-clockwise)
            // Front-left (1)
            -this.size, 0, -this.size,
            // Front-right (2)
            this.size, 0, -this.size,
            // Back-right (3)
            this.size, 0, this.size,
            // Back-left (4)
            -this.size, 0, this.size,
            
            // Bottom point (5)
            0, -this.size, 0
        ];

        // Face definitions with normal vectors
        const faces = [
            { indices: [0, 1, 2], normal: [0, 0.707, -0.707] },  // Front top
            { indices: [0, 2, 3], normal: [0.707, 0.707, 0] },     // Right top
            { indices: [0, 3, 4], normal: [0, 0.707, 0.707] },     // Back top
            { indices: [0, 4, 1], normal: [-0.707, 0.707, 0] },    // Left top
            
            { indices: [5, 2, 1], normal: [0, -0.707, -0.707] },    // Front bottom
            { indices: [5, 3, 2], normal: [0.707, -0.707, 0] },     // Right bottom
            { indices: [5, 4, 3], normal: [0, -0.707, 0.707] },     // Back bottom
            { indices: [5, 1, 4], normal: [-0.707, -0.707, 0] }     // Left bottom
        ];

        // Draw all faces with shading
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            const v1 = vertices.slice(face.indices[0]*3, face.indices[0]*3+3);
            const v2 = vertices.slice(face.indices[1]*3, face.indices[1]*3+3);
            const v3 = vertices.slice(face.indices[2]*3, face.indices[2]*3+3);
            
            // Simple shading based on face normal
            const shading = 0.7 + 0.3 * (face.normal[1] * 0.5 + 0.5); // Emphasize vertical shading
            const faceColor = [
                this.color[0] * shading,
                this.color[1] * shading,
                this.color[2] * shading,
                this.color[3]
            ];
            
            gl.uniform4f(u_FragColor, ...faceColor);
            drawTriangle3D([...v1, ...v2, ...v3]);
        }
    }
}