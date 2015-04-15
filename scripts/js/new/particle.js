(function() {
  var Particle;

  Particle = (function() {
    function Particle(radius, color, position, velocity, accel) {
      this.radius = radius;
      this.color = color;
      this.position = position;
      this.velocity = velocity;
      this.accel = accel;
    }

    Particle.prototype.draw = function(context) {
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
      context.fillStyle = this.color;
      context.fill();
      context.closePath();
    };

    Particle.prototype.applyVelocity = function(newVelocity) {
      this.velocity = newVelocity.clone();
    };

    Particle.prototype.update = function() {
      if (typeof this.position == 'undefined')
        debugger
      this.position.add(Vector.add(this.velocity, this.accel));
    };

    Particle.prototype.clone = function() {
      return new Particle(this.radius, this.color, this.position, this.velocity, this.accel);
    };

    return Particle;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Particle = Particle;
  } else {
    exports.Particle = Particle;
  }

}).call(this);
