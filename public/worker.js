/* eslint-disable */
importScripts('https://d3js.org/d3.v5.min.js')

onmessage = function(e) {
  var nodes = e.data.nodes

  var simulation = d3
    .forceSimulation()
    .force(
      'x',
      d3.forceX((d, i) => {
        if (i === 0) return 500
        return d.cx
      })
    )
    .force(
      'y',
      d3.forceY((d, i) => {
        if (i === 0) return 500
        return d.cy
      })
    )
    .force(
      'collide',
      d3
        .forceCollide()
        .radius(d => d.r + 1)
        .strength(0.1)
    )
    .stop()

  simulation.nodes(nodes)

  for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick()
  }

  postMessage({ nodes: simulation.nodes() })
}
