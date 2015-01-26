/*jslint plusplus: true*/
var Quadtree = function (treeBounds, maxObjects, maxLevels, level) {
	"use strict";
	this.maxObjects = maxObjects || 5;
	this.maxLevels = maxLevels || 4;
	this.level = level || 0;
	this.bounds = treeBounds;
	
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
			
	//TOP-LEFT 
	this.nodes[0] = new Quadtree({
		x: x,
		y: y,
		width: subnodeWidth,
		height: subnodeHeight
	}, this.maxObjects, this.maxLevels, nextLevel);
	
	//TOP-RIGHT
	this.nodes[1] = new Quadtree({
		x: x + subnodeWidth,
		y: y,
		width: subnodeWidth,
		height: subnodeHeight
	}, this.maxObjects, this.maxLevels, nextLevel);
	
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
	for (i = 0; i < this.nodes.length; i++) {
		if (typeof this.nodes[i] !== 'undefined') {
			this.nodes[i].clear();
			delete this.nodes[i];
		}
	}
};

//which quadrant the object belongs to
Quadtree.prototype.indexOf = function (rect) {
	"use strict";
	var nodeIndex = -1,
		verticalCenter = (this.bounds.x + (this.bounds.width / 2)),
		horizontalCenter = (this.bounds.y + (this.bounds.height / 2)),
		isOnTop = rect.y < horizontalCenter,
		isOnBottom = rect.y > horizontalCenter;
	
	if (rect.x < verticalCenter) {
		if (isOnTop) {
			nodeIndex = 0;
		} else {
			nodeIndex = 2;
		}
	}
	
	if (rect.x > verticalCenter) {
		if (isOnTop) {
			nodeIndex = 1;
		} else {
			nodeIndex = 3;
		}
	}
	
	return nodeIndex;
};

Quadtree.prototype.insert = function (rect) {
	"use strict";
	
};