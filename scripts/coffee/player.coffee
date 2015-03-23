class Player
  constructor: (@size, @color) ->
    @boosts = []
    @trail = []
    @position = new Vector 0, 0

  draw: (context) ->
    for element in @boosts
      switch element.name
        when "diff"
          context.beginPath()
          context.arc @position.x, @position.y, @radius * 8, 0, 2 * Math.PI, no
          context.fillStyle = 'rgba(250,250,250,0.5)'
          context.fill()
          context.closePath()
        when "gravity"
          context.beginPath()
          context.arc @position.x, @position.y, @radius * 8, 0, 2 * Math.PI, no
          context.fillStyle = 'rgba(0,0,255,0.3)'
          context.fill()
          context.closePath()
        when "clear"
          context.beginPath()
          context.arc @position.x, @position.y, @radius * 8, 0, 2 * Math.PI, no
          context.fillStyle = 'purple'
          context.fill()
          context.closePath()

    context.beginPath()
    context.arc @position.x, @position.y, @radius, 0, 2 * Math.PI, no
    context.fillStyle = this.color
    context.fill()
    context.closePath()
    this

  drawTrail: (context) ->
    context.fillStyle = 'rgba(0,0,0,0.05)'
    context.beginPath()
    context.strokeStyle = 'rgba(20,100,50,0.70)'
    context.lineWidth = 3

    for element in @trail
      context.lineTo(element.x, element.y)

    context.stroke()
    context.closePath()
    this

  update: (position, gameVelocity) ->
    @position.x += (position.x - @position.x) * 0.13
    @position.y += (position.y - @position.y) * 0.13
    @trail.push @position.clone()

    if @trail.length > 40
      @trail.shift()

    #Activate Boosts
    for element, index in @boosts
      if element.active()
        element.doAction()
      else
        @boosts.splice index, 1

    for element in @trail
      element.add gameVelocity

    return

if window? then window.Player = Player else exports.Player = Player
