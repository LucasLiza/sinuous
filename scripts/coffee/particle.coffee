class Particle
  constructor: (@radius, @color, @position, @velocity, @accel) ->

  draw: (context) ->
    context.beginPath()
    context.arc @position.x, @position.y, @radius, 0, 2 * Math.PI, no
    context.fillStyle = @color
    context.fill()
    context.closePath()

  applyVelocity: (newVelocity) ->
    @velocity = newVelocity.clone()

  update: ->
    @position.add Vector.add(@velocity, @accel)

  clone: ->
    new Particle @radius, @color, @position, @velocity, @accel
