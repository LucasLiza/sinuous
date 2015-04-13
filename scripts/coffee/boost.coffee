class Boost extends Particle
  constructor: (@name, @action, @duration = 100, radius, color, position, velocity, accel) ->
    @id = @name[0]
    super radius, color, position, velocity, accel

  draw: (context) ->
    context.beginPath()
    context.arc @position.x, @position.y, @radius, 0, 2 * Math.PI, false
    context.fillStyle = @color
    context.fill()
    context.closePath()
    context.fillStyle = "white"
    context.font = @radius * 1.5 + "px Helvetica";
    context.fillText @id, @position.x - @radius / 2, @position.y + @radius / 2
    return

  doAction: ->
    if @duration > 0
      @action()
    else
      --@duration
    return

  active: ->
    @duration > 0

if window? then window.Boost = Boost else exports.Boost = Boost
