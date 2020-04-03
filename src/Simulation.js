import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { forceSimulation, forceX, forceY, forceCollide } from 'd3'

export default function Simulation({ data, onAddNode, children, width, height }) {
  const [nodes, setNodes] = useState(() => [], [])
  const [selectedNode, setSelectedNode] = useState(null)

  const worker = useMemo(() => {
    const worker = new Worker('/worker.js')
    worker.onmessage = e => {
      setNodes(e.data.nodes)
    }
    return worker
  }, [])

  // sim
  /*const simulation = useMemo(() => {
    const simulation = forceSimulation()
      .force('x', forceX((d, i) => d.cx))
      .force('y', forceY((d, i) => d.cy))
      .force(
        'collide',
        forceCollide()
          .radius(d => d.r + 1)
          .strength(0.5)
      )
      .stop()
    return simulation
  }, [width, height])*/

  /*const update = useMemo(() => {
    return () => {
      simulation.alpha(1)
      for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick()
      }
    }
  }, [simulation])*/

  const onClickCanvas = useCallback(
    evt => {
      const center = { x: width / 2, y: height / 2 }
      const mouse = { x: evt.clientX - center.x, y: evt.clientY - center.y }

      if (selectedNode) {
        worker.postMessage({ nodes: data })
        setSelectedNode(state => null)
        return
      }

      onAddNode({ parent: null, mouse, center })
    },
    [worker, onAddNode, data, selectedNode, width, height]
  )

  const onClickNode = useCallback(
    node => evt => {
      evt.stopPropagation()

      const centroid = node.centroid
      const filtered = data.filter(d => d.centroid === centroid)

      const related = data.map((d, i) => {
        const dx = node.x - d.x
        const dy = node.y - d.y
        const dist = Math.sqrt(dy * dy + dx * dx) / 500

        const isSelected = d.id === node.id
        const isSibling = filtered.indexOf(d) > -1
        const isRoot = i === 0

        const updated = {
          ...d,
          r: (1.0 - dist) * 2.25 * d.r,
          cx: isSibling ? d.cx - Math.cos(node.centroid) * 50 : width / 2 - Math.cos(node.centroid) * 240,
          cy: isSibling ? d.cy - Math.sin(node.centroid) * 50 : height / 2 - Math.sin(node.centroid) * 240
          //   cy: d.cy + 50 * dist
        }

        if (isSelected) {
          updated.cx = width / 2
          updated.cy = height / 2
          updated.fx = updated.cx
          updated.fy = updated.cy
          updated.fixed = true
          updated.r = 160
        }

        // root
        if (isRoot) {
          updated.cx = width / 2 - Math.cos(node.centroid) * 100
          updated.cy = height / 2 - Math.sin(node.centroid) * 100
          delete updated.fx
          delete updated.fy
          updated.fixed = false
          updated.r = 40
        }

        return updated
      })

      // magnify nodes
      //simulation.nodes(related)
      worker.postMessage({ nodes: related })

      //update()

      //setNodes(related)
      setSelectedNode(state => node)
    },
    [worker, data, width, height]
  )

  // update on data change
  useEffect(() => {
    worker.postMessage({ nodes: data })
  }, [data, worker])

  const child = React.Children.only(children)
  return React.cloneElement(child, {
    onClickNode,
    onClickCanvas,
    nodes
  })
}
