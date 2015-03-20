(function() {
  var Quadtree;

  Quadtree = (function() {
    function Quadtree(bounds, maxObjects, maxLevels, level) {
      this.bounds = bounds;
      this.maxObjects = maxObjects != null ? maxObjects : 7;
      this.maxLevels = maxLevels != null ? maxLevels : 4;
      this.level = level != null ? level : 0;
      this.objects = [];
      this.nodes = [];
    }

    Quadtree.prototype.split = function() {
      var nextLevel, subnodeHeight, subnodeWidth, x, y;
      nextLevel = this.level + 1;
      subnodeWidth = Math.round(this.bounds.width / 2);
      subnodeHeight = Math.round(this.bounds.height / 2);
      x = Math.round(this.bounds.x);
      y = Math.round(this.bounds.y);
      this.nodes[0] = new Quadtree({
        x: x + subnodeWidth,
        y: y,
        width: subnodeWidth,
        height: subnodeHeight
      }, this.maxObjects, this.maxLevels, nextLevel);
      this.nodes[1] = new Quadtree({
        x: x,
        y: y,
        width: subnodeWidth,
        height: subnodeHeight
      }, this.maxObjects, this.maxLevels, nextLevel);
      this.nodes[2] = new Quadtree({
        x: x,
        y: y + subnodeHeight,
        width: subnodeWidth,
        height: subnodeHeight
      }, this.maxObjects, this.maxLevels, nextLevel);
      this.nodes[3] = new Quadtree({
        x: x + subnodeWidth,
        y: y + subnodeHeight,
        width: subnodeWidth,
        height: subnodeHeight
      }, this.maxObjects, this.maxLevels, nextLevel);
      return this;
    };

    Quadtree.prototype.clear = function() {
      var currentNode, element, _i, _len, _ref;
      this.objects = [];
      _ref = this.nodes;
      for (currentNode = _i = 0, _len = _ref.length; _i < _len; currentNode = ++_i) {
        element = _ref[currentNode];
        if (typeof element !== void 0) {
          this.nodes[currentNode].clear();
        } else {
          delete this.nodes[currentNode];
        }
      }
      return this;
    };

    return Quadtree;

  })();

}).call(this);
