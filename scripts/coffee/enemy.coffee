class Enemy extends Particle
  constructor: (position, velocity, accel) ->
    rand: (min, max) ->
      offset = min
      range = (max - min) + 1
      Math.floor(Math.random() * range) + offset

    generateSize: ->
      rand 3, 5

    generatePosition: ->
    super generateSize(), 'red', position, velocity, accel
