class Vector
  constructor: (@x, @y) ->

  add: (vector)  ->
    @x += vector.x
    @y += vector.y
    this

  @add: (v1, v2) ->
    new Vector v1.x + v2.x, v1.y + v2.y

  sub: (vector) ->
    @x -= vector.x
    @y -= vector.y
    this

  @sub: (v1, v2) ->
    new Vector v1.x - v2.x, v1.y - v2.y

  mult: (scalar) ->
    @x *= scalar
    @y *= scalar
    this

  @mult: (vector, scalar) ->
    new Vector vector.x * scalar, vector.y * scalar

  div: (scalar) ->
    @x /= scalar
    @y /= scalar
    this

  @div: (vector, scalar) ->
    new Vector vector.x / scalar, vector.y / scalar

  mag: ->
    Math.sqrt(@x * @x + @y * @y)

  normalize: ->
    mag = @mag()
    @div mag if mag > 0 and mag isnt 1
    this

  limit: (max) ->
    @normalize() and @mult max if @mag() > max

  distance: (vector) ->
    dx = @x - vector.x
    dy = @y - vector.y
    Math.sqrt dx * dx + dy * dy

  @distance: (v1, v2) ->
    dx = v1.x - v2.x
    dy = v1.y - v2.y
    Math.sqrt dx * dx + dy * dy

  clone: ->
    new Vector @x, @y

  getAngle: ->
    Math.atan2 @y, @x

  @fromAngle: (angle, magnitude) ->
    new Vector magnitude * Math.cos(angle), magnitude * Math.sin(angle)

if window? then window.Vector = Vector else exports.Vector = Vector
