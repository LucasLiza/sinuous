(function() {
  var Enemy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Enemy = (function(_super) {
    __extends(Enemy, _super);

    function Enemy(position, velocity, accel) {
      var generateSize, rand;
      rand = function(min, max) {
        var offset, range;
        offset = min;
        range = (max - min) + 1;
        return Math.floor(Math.random() * range) + offset;
      };
      generateSize = function() {
        return rand(3, 5);
      };
      Enemy.__super__.constructor.call(this, generateSize(), 'red', position, velocity, accel);
    }

    Enemy.prototype.update = function() {
      this.position.add(Vector.add(this.velocity, this.accel));
    };

    return Enemy;

  })(Particle);

  if (typeof window !== "undefined" && window !== null) {
    window.Enemy = Enemy;
  } else {
    exports.Enemy = Enemy;
  }

}).call(this);
