mouse = new Vector(100, 100)

documentMouseMoveHandler = (event) ->
  mouse = new Vector(event.clientX, event.clientY)
  return

if window.addEventListener
  # Handle window's `load` event.
  window.addEventListener 'load', ->
    'use strict'
    # Wire up the `focus` and `blur` event handlers.
    window.addEventListener 'focus', @game.resume
    window.addEventListener 'blur', @game.pause
    return
document.addEventListener 'mousemove', documentMouseMoveHandler, false

class Sinuous

  constructor: (@canvas) ->
  dt = 0
  SCREEN_WIDTH = 0
  SCREEN_HEIGHT = 0
  ENEMIES_FACTOR = 0
  playing = no
  animating = no
  quadtree = undefined
  player = undefined
  action = undefined
  time = undefined
  context = undefined
  now = undefined
  returnObjects = []
  enemies = []
  boosts = []
  explosions = []
  hud = []

  timestamp = ->
    if window.performance and window.performance.now then window.performance.now() else (new Date).getTime()
  last = timestamp()

  rand = (min, max) ->
    offset = min
    range = (max - min) + 1
    Math.floor(Math.random() * range) + offset

  generateStartVelocity = ->
    Vector.mult(DEFAULT_VELOCITY, 6)

  generatePosition = ->
    position = new Vector 0, 0
    if Math.random() > 0.5
      #
      position.x = Math.round(Math.random() * SCREEN_WIDTH)
      position.y = -20
    else
      position.x = SCREEN_WIDTH + 20
      position.y = Math.floor(-SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 1.2)
    position

  createEnemies = ->
    numberOfEnemies = rand(10, 15)
    while --numberOfEnemies >= 0
      accel = rand(1,5)
      enemies.push new Enemy(generatePosition(), generateStartVelocity(), new Vector(-accel, accel))
    return

  createBoost = ->
    position = generatePosition()
    accel = rand(0.4, 1)
    clearAction = ->
      for enemy in enemies
        explosions.push new Explosion(enemy.color, enemy.position, enemy.velocity, 3).emit 2
      player.score += ENEMY_SCORE * enemies.length
      enemies.splice(0, enemies.length)
    gravityAction = ->
      i = 0
      while i < returnObjects.length
        if Vector.distance(returnObjects[i].position, player.position) <= player.size * 8 + returnObjects[i].radius
          if returnObjects[i] instanceof Particle
            diffVector = Vector.sub(player.position, returnObjects[i].position)
            force = -player.size * 8 * returnObjects[i].radius / diffVector.mag() ** 3
          returnObjects[i].accel.add Vector.mult(diffVector, force)
        i++
      return
    clearBoost = new Boost("clear", clearAction, 200, 10, "purple", position, DEFAULT_VELOCITY, new Vector(accel, accel))
    gravityBoost = new Boost("gravity", gravityAction, 200, 10, "green", position, DEFAULT_VELOCITY, new Vector(accel, accel))
    availableBoosts = [gravityBoost, clearBoost]
    return availableBoosts[rand(0, availableBoosts.length - 1)]

  drawObjects = ->
    context.fillStyle = "black"
    @canvas.width = @canvas.width

    player.draw context
    player.drawTrail context

    for own enemy of enemies
        enemies[enemy].draw context

    for own boost of boosts
        boosts[boost].draw context

    for own explosion of explosions
        for own particle of explosions[explosion]
            explosions[explosion][particle].draw context
    return

  updateObjects = (playerPosition, velocity, step) ->
    if playerPosition? and not animating
      player.update playerPosition, velocity
      player.updateDifficulty 0.0008

    for own enemy of enemies
        enemies[enemy].applyVelocity(velocity)
        enemies[enemy].update()
        quadtree.insert(enemies[enemy])

    for own boost of boosts
        boosts[boost].update()
        quadtree.insert(boosts[boost])

    for own explosion of explosions
        for own particle of explosions[explosion]
            explosions[explosion][particle].update()
    return

  isOutOfScreen = (position) ->
    position.x < 0 or position.x > SCREEN_WIDTH + 20 or position.y < -20 || position.y > SCREEN_HEIGHT + 20

  clearObjects = ->
    for own enemy of enemies
        currentPosition = enemies[enemy].position
        if isOutOfScreen currentPosition
          enemies.splice(enemy, 1)

    for own boost of boosts
        if isOutOfScreen boosts[boost].position
          boosts.splice(boost,1)
          console.log('Boosts',enemies.length)

    for own explosion of explosions
        for own particle of explosions[explosion]
            currentPosition = explosions[explosion][particle].position
            if isOutOfScreen(currentPosition)
              explosions[explosion].splice(particle,1)
            if explosions[explosion].length == 0
              explosions.splice(explosion, 1)
    return

  updateScore = ->
    lastPlayerPosition = player.trail[player.trail.length - 1] or player.position
    player.score += 0.4 * player.difficulty
    player.score += Vector.distance(lastPlayerPosition, player.position) * 10

  updateHUD = ->
    currentTime = new Date()
    timePassed = currentTime.getTime() - time.getTime()
    scoreText = "Score: #{Math.floor player.score}"
    timeText = " Time: #{(timePassed/1000).toFixed(2)}s"

    hud[0].innerHTML = scoreText
    hud[1].innerHTML = timeText
    return

  gameOver = ->
    explosions.push new Explosion(player.color, player.position, generateStartVelocity(), 3).emit(player.size)
    playing = false
    return

  removeBoost = (boost) ->
    index = boosts.indexOf(boost)
    boosts.splice(index, 1) if index > -1
    return

  checkCollision = (objs, target) ->
    for obj in objs
      if Vector.distance(obj.position, target.position) <= target.size + obj.radius
        if obj instanceof Enemy
          gameOver()
        else if obj instanceof Boost
          player.acquire(obj)
          removeBoost(obj)
    return

  gameLoop = ->
    chanceOfBoost = Math.random()
    id = window.requestAnimationFrame(gameLoop)
    if playing
      now = timestamp()
      dt = dt + Math.min(1, (now - last) / 1000)
      while dt > step
        dt = dt - step
        updateScore()
        diffVelocity = Vector.mult(DEFAULT_VELOCITY, player.difficulty)

        if enemies.length < Math.min(30, ENEMIES_FACTOR * player.difficulty)
          createEnemies()

        if chanceOfBoost > 0.9975
          boosts.push createBoost()

        updateObjects mouse, diffVelocity, step
        returnObjects = quadtree.retrieve(player)
        checkCollision returnObjects, player
        quadtree.clear()
        clearObjects()

      updateHUD()
      drawObjects dt
      last = now
    else
      if !playing
        @canvas.width = @canvas.width
        action.call window
        return window.cancelAnimationFrame(id)
    return

  start: ->
    window.requestAnimationFrame(gameLoop)
    return

  init: (act) ->
    action = act
    player = new Player(5, 'green')
    hud.push(document.getElementById("score"))
    hud.push(document.getElementById("time"))
    player.score = 0
    SCREEN_HEIGHT = @canvas.height
    SCREEN_WIDTH = @canvas.width
    ENEMIES_FACTOR = (SCREEN_WIDTH / SCREEN_HEIGHT) * 30
    context = @canvas.getContext("2d")
    time = new Date()
    last = timestamp()
    enemies = []
    boosts = []
    explosions = []
    quadtree = new Quadtree ({x: 0,  y: 0,  width: @canvas.width, height: @canvas.height})
    playing = yes
    return

if window? then window.Sinuous = Sinuous



