class Particle
  constructor: (@radius, @color, @position, @velocity, @accel) ->

  draw: (context) ->
    context.beginPath()
    context.arc @position.x, @position.y, @radius, 0, 2 * Math.PI, no
    context.fillStyle = @color
    context.fill()
    context.closePath()
    return

  applyVelocity: (newVelocity) ->
    @velocity = newVelocity.clone()
    return

  update: ->
    @position.add Vector.add(@velocity, @accel)
    return

  clone: ->
    new Particle @radius, @color, @position, @velocity, @accel

if window? then window.Particle = Particle else exports.Particle = Particle
