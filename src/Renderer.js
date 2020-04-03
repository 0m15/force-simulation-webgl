import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'
import { CircleBufferGeometry } from 'three'
import lerp from 'lerp'
import image from './texture.jpg'

const Shader = {
  uniforms: {
    texture1: {},
    textureDivision: { value: new THREE.Vector2(4, 4) },
    time: { value: 0 }
  },
  vertexShader: `
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;
    uniform vec2 textureDivision;

    attribute vec3 position;
    attribute vec4 translate;
    attribute vec2 uv;
    attribute vec2 instanceUv;

    varying vec2 vUv;
    varying float vScale;

    void main() {
        float scale = translate.w;
        vec3 t = vec3(translate.x, translate.y, 0.0);
        vec4 mvPosition = modelViewMatrix * vec4( t, 1.0 );
        vScale = scale;
        mvPosition.xyz += position*scale;

        vec2 slices = vec2(1.0) / textureDivision;
        //vUv = uv;
        vUv = slices * instanceUv + slices * uv;

        gl_Position = projectionMatrix * mvPosition;

    }
  `,
  fragmentShader: `
    precision highp float;
    uniform sampler2D texture1;
    varying vec2 vUv;
    void main() {
        gl_FragColor = texture2D(texture1, vUv);
        //gl_FragColor = vec4(1.0, 0.0,0.0, 1.0);
    }
  `,
  depthTest: true,
  depthWrite: true
}

export default function ThreeRenderer({ nodes, onClickCanvas, onClickNode, simulation, width, height }) {
  const [selected, set] = useState(undefined)
  const previous = useRef()
  useEffect(() => {
    previous.current = selected
  }, [selected])

  useEffect(() => {
    const onclick = evt => {
      if (selected !== undefined) {
        onClickNode(nodes[selected / 2])(evt)
        return
      }
      onClickCanvas(evt)
    }
    document.addEventListener('click', onclick)
    return () => {
      document.removeEventListener('click', onclick)
    }
  }, [onClickCanvas, selected, nodes, onClickNode])

  const texture = useMemo(() => {
    return new THREE.TextureLoader().load(image)
  }, [])

  const geometry = useMemo(() => {
    return new CircleBufferGeometry(32, 128)
  }, [])

  const [translateArray, uvArray] = useMemo(() => {
    return [new Float32Array(1000 * 4), new Float32Array(1000 * 2)]
  }, [])

  // compute vertex normals
  useMemo(() => {
    // var planeGeom = new THREE.PlaneBufferGeometry(2, 2)
    geometry.computeVertexNormals()
    //geometry.scale(0.5, 0.5, 0.5)

    for (let i = 0, i3 = 0, l = 1000; i < l; i++, i3 += 4) {
      if (nodes[i] && nodes[i].x) {
        translateArray[i3 + 0] = nodes[i].x - window.innerWidth / 2
        translateArray[i3 + 1] = nodes[i].y - window.innerHeight / 2
        translateArray[i3 + 2] = 0
        translateArray[i3 + 3] = 0.5
      }
    }

    for (let i = 0, i3 = 0, l = 1000; i < l; i++, i3 += 2) {
      if (nodes[i] && nodes[i].x) {
        uvArray[i3 + 0] = (i % 4) / 4
        uvArray[i3 + 1] = (i % 4) / 4
      }
    }

    geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 4))

    geometry.setAttribute('instanceUv', new THREE.InstancedBufferAttribute(uvArray, 2))
  }, [geometry, nodes, translateArray, uvArray])

  const animations = useRef({})

  useEffect(() => {}, [nodes])

  // Compute per-frame instance positions
  const ref = useRef()

  useFrame((state, delta) => {
    let x = 0
    let y = 0

    for (var i = 0, i3 = 0, l = 1000; i < l; i++, i3 += 4) {
      if (!nodes[i] || isNaN(nodes[i].x)) {
        break
      }

      const node = nodes[i]

      x = node.x - window.innerWidth / 2
      y = node.y - window.innerHeight / 2

      if (!animations.current[node.id]) {
        animations.current[node.id] = {
          x: node.cx - window.innerWidth / 2,
          y: node.cy - window.innerHeight / 2,
          scale: 0.5
        }
      }

      const anim = animations.current[node.id]

      anim.x = lerp(anim.x, x, delta * 2)
      anim.y = lerp(anim.y, y, delta * 2)
      anim.scale = lerp(anim.scale, 1, delta * 2)

      translateArray[i3 + 0] = anim.x
      translateArray[i3 + 1] = -anim.y
      translateArray[i3 + 3] = anim.scale * (node.r / 32)
    }
    geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 4))
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, null, 1000]}
      onPointerMove={e => {
        console.log({ e })
      }}
      onPointerOut={e => set(undefined)}>
      {/* <meshBasicMaterial attach="material" /> */}
      <rawShaderMaterial attach="material" args={[Shader]} uniforms-texture1-value={texture} />
    </instancedMesh>
  )
}
