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

    return

  clear: ->
    @objects = []
    for element, currentNode in @nodes
      if element?
        @nodes[currentNode].clear()
      else
        delete @nodes[currentNode]
    return

  indexOf: (rect) ->
    nodeIndex = -1
    verticalCenter = @bounds.x + (@bounds.width / 2)
    horizontalCenter = @bounds.y + (@bounds.height / 2)
    isOnTop = rect.position.y < horizontalCenter and rect.position.y + rect.radius < horizontalCenter
    isOnBottom = rect.position.y > horizontalCenter;

    if rect.position.x < verticalCenter and rect.position.x + rect.radius < verticalCenter
      if isOnTop
        nodeIndex = 1
      else if isOnBottom
        nodeIndex = 2
    else if rect.position.x > verticalCenter
      if isOnTop
        nodeIndex = 0
      else if isOnBottom
        nodeIndex = 3
    nodeIndex

  insert: (rect) ->
    if @nodes[0]?
      nodeIndex = @indexOf(rect)

      if nodeIndex isnt -1
        @nodes[nodeIndex].insert(rect);
        return

    @objects.push(rect)

    if @objects.length > @maxObjects and @level < @maxLevels
      if not @nodes[0]?
        @split()

      i = 0
      while i < @objects.length
        nodeIndex = @indexOf(@objects[i])
        if nodeIndex isnt -1
          @nodes[nodeIndex].insert(@objects.splice(i,1)[0]);
        else
          i = i + 1

    return

  retrieve: (rect) ->
    nodeIndex = @indexOf(rect)
    returnObjects = @objects
    if @nodes[0]?
      if nodeIndex isnt -1
        returnObjects = returnObjects.concat(@nodes[nodeIndex].retrieve(rect))
      else
        curr = 0
        while curr < @nodes.length
          returnObjects = returnObjects.concat(@nodes[curr].retrieve(rect))
          curr = curr + 1

    returnObjects

if window? then window.Quadtree = Quadtree else exports.Quadtree = Quadtree
