import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from 'react-three-fiber'
import { Object3D, CircleBufferGeometry } from 'three'
import lerp from 'lerp'
//import image from './texture.jpg'

const dummy = new Object3D()

/*
const Shader = {
  uniforms: {
    texture1: {},
    textureDivision: { value: new THREE.Vector2(2, 2) },
    time: { value: 0 }
  },
  vertexShader: `
    precision highp float;

    void main(){
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
  `,
  fragmentShader: `
    precision highp float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0,0.0, 1.0);
    }
  `
}
*/

export default function Renderer({ nodes, onClickCanvas, simulation }) {
  useEffect(() => {
    document.addEventListener('click', onClickCanvas)
    return () => {
      document.removeEventListener('click', onClickCanvas)
    }
  }, [onClickCanvas])

  //const texture = useMemo(() => {
  //  return new THREE.TextureLoader().load(image)
  //}, [])

  const geometry = useMemo(() => {
    return new CircleBufferGeometry(32, 128)
  }, [])

  // compute vertex normals
  useMemo(() => {
    geometry.computeVertexNormals()
    geometry.scale(0.5, 0.5, 0.5)
  }, [geometry])

  const animations = useRef({})

  useEffect(() => {}, [nodes])

  // Compute per-frame instance positions
  const ref = useRef()

  useFrame((state, delta) => {
    let x = 0
    let y = 0

    for (let i = 0; i < 1000; i++) {
      if (!nodes[i]) {
        break
      }

      const d = Object.assign({}, nodes[i], {})

      x = d.x - window.innerWidth / 2
      y = d.y - window.innerHeight / 2

      if (!animations.current[d.id]) {
        animations.current[d.id] = {
          x: d.cx - window.innerWidth / 2,
          y: d.cy - window.innerHeight / 2,
          scale: 0.5
        }
      }

      const anim = animations.current[d.id]
      anim.x = lerp(anim.x, x, delta * 2)
      anim.y = lerp(anim.y, y, delta * 2)
      anim.scale = lerp(anim.scale, 1, delta * 2)

      dummy.position.set(anim.x, -anim.y, 0)
      dummy.scale.set((d.r / 32) * anim.scale * 2, (d.r / 32) * anim.scale * 2, (d.r / 32) * anim.scale * 2)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i++, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  console.log({ nodes })

  return (
    <instancedMesh ref={ref} args={[geometry, null, 1000]}>
      <meshBasicMaterial attach="material" />
      {/*<shaderMaterial
        attach="material"
        args={[Shader]}
      />*/}
    </instancedMesh>
  )
}
