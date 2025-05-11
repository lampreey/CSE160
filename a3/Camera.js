class Camera {
   constructor() {
       this.eye = new Vector3([0, 0.5, 3]);
       this.at = new Vector3([0, 0, -100]);
       this.up = new Vector3([0, 1, 0]);
       this.speed = 0.1;
       this.turnSpeed = 0.1;
   }

   forward() {
       let f = new Vector3();
       f.elements[0] = this.at.elements[0] - this.eye.elements[0];
       f.elements[1] = this.at.elements[1] - this.eye.elements[1];
       f.elements[2] = this.at.elements[2] - this.eye.elements[2];
       f.normalize();
       
       this.eye.elements[0] += f.elements[0] * this.speed;
       this.eye.elements[1] += f.elements[1] * this.speed;
       this.eye.elements[2] += f.elements[2] * this.speed;
       
       this.at.elements[0] += f.elements[0] * this.speed;
       this.at.elements[1] += f.elements[1] * this.speed;
       this.at.elements[2] += f.elements[2] * this.speed;
   }

   back() {
       let b = new Vector3();
       b.elements[0] = this.eye.elements[0] - this.at.elements[0];
       b.elements[1] = this.eye.elements[1] - this.at.elements[1];
       b.elements[2] = this.eye.elements[2] - this.at.elements[2];
       b.normalize();
       
       this.eye.elements[0] += b.elements[0] * this.speed;
       this.eye.elements[1] += b.elements[1] * this.speed;
       this.eye.elements[2] += b.elements[2] * this.speed;
       
       this.at.elements[0] += b.elements[0] * this.speed;
       this.at.elements[1] += b.elements[1] * this.speed;
       this.at.elements[2] += b.elements[2] * this.speed;
   }

   left() {
       let f = new Vector3();
       f.elements[0] = this.at.elements[0] - this.eye.elements[0];
       f.elements[1] = this.at.elements[1] - this.eye.elements[1];
       f.elements[2] = this.at.elements[2] - this.eye.elements[2];
       
       let s = new Vector3();
       s.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
       s.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
       s.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
       s.normalize();
       
       this.eye.elements[0] += s.elements[0] * this.speed;
       this.eye.elements[1] += s.elements[1] * this.speed;
       this.eye.elements[2] += s.elements[2] * this.speed;
       
       this.at.elements[0] += s.elements[0] * this.speed;
       this.at.elements[1] += s.elements[1] * this.speed;
       this.at.elements[2] += s.elements[2] * this.speed;
   }

    right() {
        let f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];
        
        let s = new Vector3();
        s.elements[0] = f.elements[1] * this.up.elements[2] - f.elements[2] * this.up.elements[1];
        s.elements[1] = f.elements[2] * this.up.elements[0] - f.elements[0] * this.up.elements[2];
        s.elements[2] = f.elements[0] * this.up.elements[1] - f.elements[1] * this.up.elements[0];
        s.normalize();
        
        this.eye.elements[0] += s.elements[0] * this.speed;
        this.eye.elements[1] += s.elements[1] * this.speed;
        this.eye.elements[2] += s.elements[2] * this.speed;
        
        this.at.elements[0] += s.elements[0] * this.speed;
        this.at.elements[1] += s.elements[1] * this.speed;
        this.at.elements[2] += s.elements[2] * this.speed;
    }

    turnLeft() {
        const f = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ]);

        const r = Math.sqrt(f.elements[0] * f.elements[0] + f.elements[2] * f.elements[2]);
        let theta = Math.atan2(f.elements[0], f.elements[2]);

        theta += this.turnSpeed;

        f.elements[0] = r * Math.sin(theta);
        f.elements[2] = r * Math.cos(theta);

        this.at = new Vector3([
            this.eye.elements[0] + f.elements[0],
            this.eye.elements[1] + f.elements[1],
            this.eye.elements[2] + f.elements[2]
        ]);
    }

    turnRight() {
        const f = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ]);

        const r = Math.sqrt(f.elements[0] * f.elements[0] + f.elements[2] * f.elements[2]);
        let theta = Math.atan2(f.elements[0], f.elements[2]);

        theta -= this.turnSpeed;

        f.elements[0] = r * Math.sin(theta);
        f.elements[2] = r * Math.cos(theta);

        this.at = new Vector3([
            this.eye.elements[0] + f.elements[0],
            this.eye.elements[1] + f.elements[1],
            this.eye.elements[2] + f.elements[2]
        ]);
    }
}
