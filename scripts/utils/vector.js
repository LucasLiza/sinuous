"use strict";
var Vector = function (x, y) {
	this.x = x;
	this.y = y;

	this.add = function (vector) {
		this.x += vector.x;
		this.y += vector.y;
	};

	this.sub = function (vector) {
		this.x -= vector.x;
		this.y -= vector.y;
	};

	this.mult = function (scalar) {
		this.x *= scalar;
		this.y *= scalar;
	};

	this.div = function (scalar) {
		this.x /= scalar;
		this.y /= scalar;
	};

	this.mag = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	this.normalize = function () {
		var mag = this.mag();

		if (mag > 0 && mag !== 1) {
			this.div(mag);
		}

		return this;
	};

	this.limit = function (max) {
		if (this.mag() > max) {
			return this.normalize() && this.mult(max);
		}
	};

	this.distance = function (vector) {
		var dx, dy;
		dx = this.x - vector.x;
		dy = this.y - vector.y;

		return Math.sqrt(dx * dx + dy * dy);
	};

	this.clone = function () {
		return new Vector(this.x, this.y);
	};

	// Gets the angle accounting for the quadrant we're in
	this.getAngle = function () {
		return Math.atan2(this.y, this.x);
	};
};

// class functions, so we can do
// v1 = new Vector(1,1)
// v2 = new Vector(1,1)
// v3 = Vector.add(v1,v2);
Vector.add = function (vect1, vect2) {
	return new Vector(vect1.x + vect2.x, vect1.y + vect2.y);
};

Vector.sub = function (vect1, vect2) {
	return new Vector(vect1.x - vect2.x, vect1.y - vect2.y);
};

Vector.mult = function (vect, scalar) {
	return new Vector(vect.x * scalar, vect.y * scalar);
};

Vector.div = function (vect, scalar) {
	return new Vector(vect.x / scalar, vect.y / scalar);
};

Vector.distance = function (v1, v2) {
	var dx, dy;
	dx = v1.x - v2.x;
	dy = v1.y - v2.y;
	return Math.sqrt(dx * dx + dy * dy);
};

// Allows us to get a new vector from angle and magnitude
Vector.fromAngle = function (angle, magnitude) {
	return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};