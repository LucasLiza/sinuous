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

    Quadtree.prototype.indexOf = function(rect) {
      var horizontalCenter, isOnBottom, isOnTop, nodeIndex, verticalCenter;
      nodeIndex = -1;
      verticalCenter = this.bounds.x + (this.bounds.width / 2);
      horizontalCenter = this.bounds.y + (this.bounds.height / 2);
      isOnTop = rect.position.y < horizontalCenter && rect.position.y + rect.radius < horizontalCenter;
      isOnBottom = rect.position.y > horizontalCenter;
      if (rect.position.x < verticalCenter && rect.position.x + rect.radius < verticalCenter) {
        if (isOnTop) {
          nodeIndex = 1;
        } else if (isOnBottom) {
          nodeIndex = 2;
        } else if (rect.position.x > verticalCenter) {
          if (isOnTop) {
            nodeIndex = 0;
          } else if (isOnBottom) {
            nodeIndex = 3;
          }
        }
      }
      return nodeIndex;
    };

    Quadtree.prototype.insert = function(rect) {
      var i, nodeIndex;
      if (typeof this.nodes[0] !== 'undefined') {
        nodeIndex = this.indexOf(rect);
        if (nodeIndex !== -1) {
          this.nodes[nodeIndex].insert(rect);
          return;
        }
      }
      this.objects.push(rect);
      if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
        if (typeof this.nodes[0] === 'undefined') {
          this.split();
        }
        i = 0;
        while (i < this.objects.length) {
          nodeIndex = this.indexOf(this.objects[i]);
          if (this.nodeIndex !== -1) {
            this.nodes[nodeIndex].insert(this.objects.splice(i, 1)[0]);
          } else {
            i = i + 1;
          }
        }
      }
      return this;
    };

    Quadtree.prototype.retrieve = function(rect) {
      var curr, nodeIndex, returnObjects;
      nodeIndex = this.indexOf(rect);
      returnObjects = this.objects;
      if (typeof this.nodes[0] !== 'undefined') {
        if (nodeIndex !== -1) {
          returnObjects = returnObjects.concat(this.nodes[nodeIndex].retrieve(rect));
        } else {
          curr = 0;
          while (curr < this.nodes.length) {
            returnObjects = returnObjects.concat(this.nodes[curr].retrieve(rect));
            curr = curr + 1;
          }
        }
      }
      return returnObjects;
    };

    return Quadtree;

  })();

}).call(this);
