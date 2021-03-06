import React, { useCallback, useState } from 'react'
import Simulation from './Simulation'
import { Canvas } from 'react-three-fiber'
import ThreeRenderer from './Renderer'
import useDimensions from 'react-use-dimensions'
import { scalePow } from 'd3'

const radiusScale = scalePow(1.2)
  .domain([1, 10])
  .range([32, 7])

function createRootNode(center, radius) {
  const node = {}
  node.fx = center.x
  node.fy = center.y
  node.cx = node.fx
  node.cy = node.fy
  node.fixed = true
  node.r = radius
  node.id = 0
  return node
}

function addNode(mouse, center, id, rootRadius) {
  const angle = Math.atan2(mouse.y, mouse.x)
  const centroid = Math.floor(angle * (Math.PI * 2)) / (Math.PI * 2)
  const r = radiusScale(id % 10) //Math.random()* 20 * (id % 5) + 10

  const cx = center.x + (Math.cos(centroid) * (1.15 * rootRadius + r / 2) - r / 2) + Math.random()
  const cy = center.y + (Math.sin(centroid) * (1.15 * rootRadius + r / 2) - r / 2) + Math.random()

  let node = {
    id,
    cx: cx,
    cy: cy,
    centroid,
    r
    //parent: currentNode ? currentNode.id : null
  }

  //   if (id === 1) {
  //     node = createRootNode()
  //     node.id = id
  //   }

  return node
}

export default function Graph({ data: initialData = [], type = 'dom' }) {
  const [canvasRef, { width, height }] = useDimensions()
  const [data, setData] = useState(() => {
    return initialData
  }, [])

  const onAddNode = useCallback(
    ({ mouse, center }) => {
      let node

      // root node
      if (!data.length) {
        node = createRootNode(
          {
            x: width / 2,
            y: height / 2
          },
          width * 0.125
        )
      } else {
        node = addNode(mouse, center, data.length + 1, width * 0.125)
      }

      setData([...data, node])
    },
    [data, width, height]
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
      ref={canvasRef}>
      <Canvas gl={{ alpha: false }} orthographic>
        <Simulation data={data} onAddNode={onAddNode} width={width} height={height}>
          <ThreeRenderer />
        </Simulation>
      </Canvas>
    </div>
  )
}
