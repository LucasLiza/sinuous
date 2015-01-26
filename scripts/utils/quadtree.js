///*jslint plusplus: true*/
var Quadtree = function (treeBounds, maxObjects, maxLevels, level) {
	"use strict";
	this.maxObjects = maxObjects || 7;
	this.maxLevels = maxLevels || 4;
	this.level = level || 0;
	this.bounds = treeBounds;
	//console.log(this);
	this.objects = [];
	this.nodes = [];
};

//split the node into 4
Quadtree.prototype.split = function () {
	"use strict";
	var nextLevel = this.level + 1,
		subnodeWidth = Math.round(this.bounds.width / 2),
		subnodeHeight = Math.round(this.bounds.height / 2),
		x = Math.round(this.bounds.x),
		y = Math.round(this.bounds.y);

	//TOP-RIGHT
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

	//TOP-RIGHT

	//BOT-LEFT
	this.nodes[2] = new Quadtree({
		x: x,
		y: y + subnodeHeight,
		width: subnodeWidth,
		height: subnodeHeight
	}, this.maxObjects, this.maxLevels, nextLevel);

	//BOT-RIGHT
	this.nodes[3] = new Quadtree({
		x: x + subnodeWidth,
		y: y + subnodeHeight,
		width: subnodeWidth,
		height: subnodeHeight
	}, this.maxObjects, this.maxLevels, nextLevel);
};

Quadtree.prototype.clear = function () {
	"use strict";
	var i;
	this.objects = [];
	for (i = 0; i < this.nodes.length; i = i + 1) {
		if (typeof this.nodes[i] !== 'undefined') {
			this.nodes[i].clear();
		}
		delete this.nodes[i];
	}
};

//which quadrant the object belongs to
Quadtree.prototype.indexOf = function (rect) {
	"use strict";
	var nodeIndex = -1,
		verticalCenter = (this.bounds.x + (this.bounds.width / 2)),
		horizontalCenter = (this.bounds.y + (this.bounds.height / 2)),
		isOnTop = rect.position.y < horizontalCenter && rect.position.y + rect.radius < horizontalCenter,
		isOnBottom = rect.position.y > horizontalCenter;

	if (rect.position.x < verticalCenter && rect.position.x + rect.radius < verticalCenter) {
		if (isOnTop) {
			nodeIndex = 1;
		} else if (isOnBottom) {
			nodeIndex = 2;
		}
	} else if (rect.position.x > verticalCenter) {
		if (isOnTop) {
			nodeIndex = 0;
		} else if (isOnBottom) {
			nodeIndex = 3;
		}
	}

	return nodeIndex;
};

Quadtree.prototype.insert = function (rect) {
	"use strict";
	var i = 0,
		nodeIndex;

	//if subnodes exists
	if (typeof this.nodes[0] !== 'undefined') {
		nodeIndex = this.indexOf(rect);

		if (nodeIndex !== -1) {
			//console.log("inserted: " + rect.color + " at " + nodeIndex);
			this.nodes[nodeIndex].insert(rect);
			return;
		}
	}

	this.objects.push(rect);

	if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
		//if there is no subnodes, split!
		if (typeof this.nodes[0] === 'undefined') {
			this.split();
		}

		//add objects to their corresponding subnodes
		while (i < this.objects.length) {
			nodeIndex = this.indexOf(this.objects[i]);
			if (nodeIndex !== -1) {
				this.nodes[nodeIndex].insert(this.objects.splice(i, 1)[0]);
			} else {
				i = i + 1;
			}
		}
	}
};

Quadtree.prototype.retrieve = function (rect) {
	"use strict";
	var nodeIndex = this.indexOf(rect),
		returnObjects = this.objects,
		i;

	//if we have subnodes ...
	if (typeof this.nodes[0] !== 'undefined') {

		//if pRect fits into a subnode ..
		if (nodeIndex !== -1) {
			returnObjects = returnObjects.concat(this.nodes[nodeIndex].retrieve(rect));

			//if pRect does not fit into a subnode, check it against all subnodes
		} else {
			for (i = 0; i < this.nodes.length; i = i + 1) {
				returnObjects = returnObjects.concat(this.nodes[i].retrieve(rect));
			}
		}
	}

	return returnObjects;
};