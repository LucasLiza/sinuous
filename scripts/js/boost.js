(function() {
  var Boost,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Boost = (function(_super) {
    __extends(Boost, _super);

    function Boost(name, action, duration, radius, color, position, velocity, accel) {
      this.name = name;
      this.action = action;
      this.duration = duration != null ? duration : 100;
      this.id = this.name[0];
      Boost.__super__.constructor.call(this, radius, color, position, velocity, accel);
    }

    Boost.prototype.draw = function(context) {
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
      context.fillStyle = this.color;
      context.fill();
      context.closePath();
      context.fillStyle = "white";
      context.font = this.radius * 1.5 + "px Helvetica";
      context.fillText(this.id, this.position.x - this.radius / 2, this.position.y + this.radius / 2);
    };

    Boost.prototype.doAction = function() {
      if (this.duration > 0) {
        this.action();
      } else {
        --this.duration;
      }
    };

    Boost.prototype.active = function() {
      return this.duration > 0;
    };

    return Boost;

  })(Particle);

  if (typeof window !== "undefined" && window !== null) {
    window.Boost = Boost;
  } else {
    exports.Boost = Boost;
  }

}).call(this);
