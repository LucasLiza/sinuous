class Quadtree
  constructor: (@bounds, @maxObjects = 7, @maxLevels = 4, @level = 0) ->
    @objects = []
    @nodes = []

  split: ->
    nextLevel = @level + 1
    subnodeWidth = Math.round @bounds.width / 2
    subnodeHeight = Math.round @bounds.height / 2
    x = Math.round @bounds.x
    y = Math.round @bounds.y

    @nodes[0] = new Quadtree({
      x: x + subnodeWidth
      y: y
      width: subnodeWidth
      height: subnodeHeight
    }, @maxObjects, @maxLevels, nextLevel)

    @nodes[1] = new Quadtree({
      x: x
      y: y
      width: subnodeWidth
      height: subnodeHeight
    }, @maxObjects, @maxLevels, nextLevel)

    @nodes[2] = new Quadtree({
      x: x
      y: y + subnodeHeight
      width: subnodeWidth
      height: subnodeHeight
    }, @maxObjects, @maxLevels, nextLevel)

    @nodes[3] = new Quadtree({
      x: x + subnodeWidth
      y: y + subnodeHeight
      width: subnodeWidth
      height: subnodeHeight
    }, @maxObjects, @maxLevels, nextLevel)

    this

  clear: ->
    @objects = []
    for element, currentNode in @nodes
      if typeof element isnt undefined
        @nodes[currentNode].clear()
      else
        delete @nodes[currentNode]
    this

