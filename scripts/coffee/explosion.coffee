class Explosion
  constructor: (@color, @origin, @velocity, @spread = Math.PI / 32) ->

  emit: (amount) ->
    for i of amount
      angle = @velocity.getAngle() + @spread - (Math.random() * @spread * 2)
      magnitude = @velocity.mag()
      position = @position.clone()
      velocity = Vector.fromAngle(angle, magnitude)
      new Particle(1, @color, position, velocity, new Vector(1,1))

if window? then window.Explosion = Explosion else exports.Explosion = Explosion
