class OBJModel {
    constructor() {
        this.vertices = [];  
        this.normals = [];   
        this.texCoords = []; 
        this.indices = [];  
        
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.texCoordBuffer = null;
        this.indexBuffer = null;
        
        this.isLoaded = false;
        this.matrix = new Matrix4();
        this.textureNum = -2;  
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.enableSpecular = true;  
    }
    
    loadOBJ(objFileUrl) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', objFileUrl, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.parseOBJ(xhr.responseText);
                this.setupBuffers();
                this.isLoaded = true;
                console.log(`OBJ file '${objFileUrl}' loaded successfully`);
            }
        };
        xhr.onerror = () => {
            console.error(`Failed to load OBJ file '${objFileUrl}'`);
        };
        xhr.send();
        return this;
    }
    
    parseOBJ(objText) {
        const tempVertices = [];
        const tempNormals = [];
        const tempTexCoords = [];
        const faces = [];

        const lines = objText.split('\n');
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '' || line.startsWith('#')) continue;
            
            const elements = line.split(/\s+/);
            const command = elements[0];
            
            switch (command) {
                case 'v': 
                    tempVertices.push(
                        parseFloat(elements[1]),
                        parseFloat(elements[2]),
                        parseFloat(elements[3])
                    );
                    break;
                    
                case 'vn':  
                    tempNormals.push(
                        parseFloat(elements[1]),
                        parseFloat(elements[2]),
                        parseFloat(elements[3])
                    );
                    break;
                    
                case 'vt':  
                    tempTexCoords.push(
                        parseFloat(elements[1]),
                        parseFloat(elements[2])
                    );
                    break;
                    
                case 'f':  
                    const faceVertices = [];
                    for (let j = 1; j < elements.length; j++) {
                        const vertexData = elements[j].split('/');
                        const vIndex = parseInt(vertexData[0]) - 1;
                        
                        const vertex = {
                            v: vIndex,
                            vt: vertexData[1] ? parseInt(vertexData[1]) - 1 : -1,
                            vn: vertexData[2] ? parseInt(vertexData[2]) - 1 : -1
                        };
                        faceVertices.push(vertex);
                    }
                    
                    for (let j = 1; j < faceVertices.length - 1; j++) {
                        faces.push([
                            faceVertices[0],
                            faceVertices[j],
                            faceVertices[j + 1]
                        ]);
                    }
                    break;
            }
        }
    
        const indexMap = new Map(); 
        let currentIndex = 0;
        
        for (const face of faces) {
            for (const vertex of face) {
                const key = `${vertex.v}/${vertex.vt}/${vertex.vn}`;
                
                if (!indexMap.has(key)) {
                    indexMap.set(key, currentIndex++);
                    
                    this.vertices.push(
                        tempVertices[vertex.v * 3],
                        tempVertices[vertex.v * 3 + 1],
                        tempVertices[vertex.v * 3 + 2]
                    );
                    
                    if (vertex.vt >= 0 && tempTexCoords.length > 0) {
                        this.texCoords.push(
                            tempTexCoords[vertex.vt * 2],
                            tempTexCoords[vertex.vt * 2 + 1]
                        );
                    } else {
                        this.texCoords.push(0, 0);
                    }
                    
                    if (vertex.vn >= 0 && tempNormals.length > 0) {
                        this.normals.push(
                            tempNormals[vertex.vn * 3],
                            tempNormals[vertex.vn * 3 + 1],
                            tempNormals[vertex.vn * 3 + 2]
                        );
                    } else {
                        this.normals.push(0, 0, 0);
                    }
                }
                
                this.indices.push(indexMap.get(key));
            }
        }
        
        if (tempNormals.length === 0 || this.normals.some(n => n === 0)) {
            this.generateNormals();
        }
        
        if (tempTexCoords.length === 0) {
            this.generatePlanarTexCoords();
        }
    }
    
    generateNormals() {
        this.normals = new Array(this.vertices.length).fill(0);
        
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i] * 3;
            const i1 = this.indices[i + 1] * 3;
            const i2 = this.indices[i + 2] * 3;
            
            const v0 = [this.vertices[i0], this.vertices[i0 + 1], this.vertices[i0 + 2]];
            const v1 = [this.vertices[i1], this.vertices[i1 + 1], this.vertices[i1 + 2]];
            const v2 = [this.vertices[i2], this.vertices[i2 + 1], this.vertices[i2 + 2]];
            
            const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
            const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
            
            const nx = edge1[1] * edge2[2] - edge1[2] * edge2[1];
            const ny = edge1[2] * edge2[0] - edge1[0] * edge2[2];
            const nz = edge1[0] * edge2[1] - edge1[1] * edge2[0];
            
            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if (length > 0) {
                const normal = [nx / length, ny / length, nz / length];
                
                for (let j = 0; j < 3; j++) {
                    const idx = this.indices[i + j] * 3;
                    this.normals[idx] += normal[0];
                    this.normals[idx + 1] += normal[1];
                    this.normals[idx + 2] += normal[2];
                }
            }
        }
        
        for (let i = 0; i < this.normals.length; i += 3) {
            const nx = this.normals[i];
            const ny = this.normals[i + 1];
            const nz = this.normals[i + 2];
            
            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if (length > 0) {
                this.normals[i] /= length;
                this.normals[i + 1] /= length;
                this.normals[i + 2] /= length;
            }
        }
    }
    
    generatePlanarTexCoords() {
        this.texCoords = [];
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < this.vertices.length; i += 3) {
            minX = Math.min(minX, this.vertices[i]);
            maxX = Math.max(maxX, this.vertices[i]);
            minY = Math.min(minY, this.vertices[i + 1]);
            maxY = Math.max(maxY, this.vertices[i + 1]);
            minZ = Math.min(minZ, this.vertices[i + 2]);
            maxZ = Math.max(maxZ, this.vertices[i + 2]);
        }
        
        const sizeX = maxX - minX;
        const sizeY = maxY - minY;
        const sizeZ = maxZ - minZ;
        
        const largestAxis = Math.max(sizeX, sizeY, sizeZ) === sizeX ? 'x' :
                           Math.max(sizeY, sizeZ) === sizeY ? 'y' : 'z';
        
        for (let i = 0; i < this.vertices.length; i += 3) {
            if (largestAxis === 'x') {
                this.texCoords.push(
                    (this.vertices[i + 2] - minZ) / sizeZ,
                    (this.vertices[i + 1] - minY) / sizeY
                );
            } else if (largestAxis === 'y') {
                this.texCoords.push(
                    (this.vertices[i] - minX) / sizeX,
                    (this.vertices[i + 2] - minZ) / sizeZ
                );
            } else {
                this.texCoords.push(
                    (this.vertices[i] - minX) / sizeX,
                    (this.vertices[i + 1] - minY) / sizeY
                );
            }
        }
    }
    
    setupBuffers() {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
        
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
    
    render() {
        if (!this.isLoaded || this.indices.length === 0) {
            return;
        }

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let normalMatrix = new Matrix4(this.matrix); 
        normalMatrix.invert();                      
        normalMatrix.transpose();                   


        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);


        gl.uniform1i(u_whichTexture, this.textureNum);
        if (this.textureNum === -2) {
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        }

        gl.uniform1i(gl.getUniformLocation(gl.program, 'u_EnableSpecular'), this.enableSpecular ? 1 : 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
