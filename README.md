A webgl rendered force simulation.

See online on https://codesandbox.io/s/d3-force-react-three-fiber-instanced-mesh-8zrp4
(Click on canvas to add nodes)

## Motivation

Exploring use cases of threejs and react-three-fiber for performant data visualizations.

## Techniques

- Computation of forces is done on the cpu with a web worker to not block the UI thread, allowing for smooth transitions.

- A 4d `Float32Array` is used to store position and radius of each circle.

- At each frame nodes positions are linearly interpolated to their final values.

- A texture with equal subdivision is used as a sprite.

- A custom shader material takes care of translation and coloring.

## Made with:

- [d3](http://d3js.org)
- [react-three-fiber](https://github.com/react-spring/react-three-fiber)
- [three](http://threejs.org)
- [lerp](http://github.com/mattdesl/lerp)
- web workers
- glsl
