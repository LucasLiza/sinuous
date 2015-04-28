(function() {
  var Explosion;

  Explosion = (function() {
    function Explosion(color, origin, velocity, spread) {
      this.color = color;
      this.origin = origin;
      this.velocity = velocity;
      this.spread = spread != null ? spread : Math.PI / 32;
    }

    Explosion.prototype.emit = function(amount) {
      var angle, i, magnitude, position, velocity, _results;
      _results = [];
      for (i in amount) {
        angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);
        magnitude = this.velocity.mag();
        position = this.position.clone();
        velocity = Vector.fromAngle(angle, magnitude);
        _results.push(new Particle(1, this.color, position, velocity, new Vector(1, 1)));
      }
      return _results;
    };

    return Explosion;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Explosion = Explosion;
  } else {
    exports.Explosion = Explosion;
  }

}).call(this);
