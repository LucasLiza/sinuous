class Enemy extends Particle
  constructor: (position, velocity, accel) ->
    rand = (min, max) ->
      offset = min
      range = (max - min) + 1
      Math.floor(Math.random() * range) + offset

    generateSize = ->
      rand 3, 5

    super generateSize(), 'red', position, velocity, accel
  update: () ->
    @position.add(Vector.add @velocity, @accel)
    return
if window? then window.Enemy = Enemy else exports.Enemy = Enemy
