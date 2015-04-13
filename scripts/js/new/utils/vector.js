(function() {
  var Vector;

  Vector = (function() {
    function Vector(x, y) {
      this.x = x;
      this.y = y;
    }

    Vector.prototype.add = function(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    };

    Vector.add = function(v1, v2) {
      return new Vector(v1.x + v2.x, v1.y + v2.y);
    };

    Vector.prototype.sub = function(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
    };

    Vector.sub = function(v1, v2) {
      return new Vector(v1.x - v2.x, v1.y - v2.y);
    };

    Vector.prototype.mult = function(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    };

    Vector.mult = function(vector, scalar) {
      return new Vector(vector.x * scalar, vector.y * scalar);
    };

    Vector.prototype.div = function(scalar) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    };

    Vector.div = function(vector, scalar) {
      return new Vector(vector.x / scalar, vector.y / scalar);
    };

    Vector.prototype.mag = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vector.prototype.normalize = function() {
      var mag;
      mag = this.mag();
      if (mag > 0 && mag !== 1) {
        this.div(mag);
      }
      return this;
    };

    Vector.prototype.limit = function(max) {
      if (this.mag() > max) {
        return this.normalize() && this.mult(max);
      }
    };

    Vector.prototype.distance = function(vector) {
      var dx, dy;
      dx = this.x - vector.x;
      dy = this.y - vector.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Vector.distance = function(v1, v2) {
      var dx, dy;
      dx = v1.x - v2.x;
      dy = v1.y - v2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Vector.prototype.clone = function() {
      return new Vector(this.x, this.y);
    };

    Vector.prototype.getAngle = function() {
      return Math.atan2(this.y, this.x);
    };

    Vector.fromAngle = function(angle, magnitude) {
      return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    };

    return Vector;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Vector = Vector;
  } else {
    exports.Vector = Vector;
  }

}).call(this);
