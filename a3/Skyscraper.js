class Skyscraper {
    constructor() {
        this.position = [0, 0, 0];  
        this.size = [1, 5, 1];      
        this.color = [0.3, 0.3, 0.3, 1.0];  
        this.textureNum = 4; 
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
        return this;
    }

    setSize(width, height, depth) {
        this.size = [width, height, depth];
        return this;
    }

    setColor(r, g, b, a) {
        this.color = [r, g, b, a];
        return this;
    }

    render() {
        var building = new Cube();
        building.color = this.color;
        building.textureNum = this.textureNum;
        building.matrix.setIdentity();
        building.matrix.translate(this.position[0], this.position[1], this.position[2]);
        building.matrix.scale(this.size[0], this.size[1], this.size[2]);
        building.matrix.translate(-0.5, 0, -0.5); 
        building.render();
    }
}