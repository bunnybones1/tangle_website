import { bindAttribute } from "./bindAttribute";
import { getShapeShader } from "./getShapeShader";

export function makeWebGLCircleRenderer(gl: WebGLRenderingContext) {
  const fans = 36;
  const totalVerts = fans + 2;
  const vertices = [0, 0];
  for (let i = 0; i <= fans; i++) {
    const ratio = i / fans;
    const a = ratio * Math.PI * 2;
    vertices.push(Math.cos(a), Math.sin(a));
  }

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const flareColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, flareColorBuffer);

  const shapeShaderProgram = getShapeShader(gl);

  return {
    render(
      aspect: number,
      x: number,
      y: number,
      angle: number,
      radius: number,
      color: number[]
    ) {
      bindAttribute(gl, shapeShaderProgram, vertexBuffer, "coordinates", 2);

      gl.useProgram(shapeShaderProgram);
      gl.uniform1f(gl.getUniformLocation(shapeShaderProgram, "uScale"), radius);
      gl.uniform1f(
        gl.getUniformLocation(shapeShaderProgram, "uAspect"),
        aspect
      );
      gl.uniform3fv(gl.getUniformLocation(shapeShaderProgram, "uColor"), color);
      gl.uniform3fv(gl.getUniformLocation(shapeShaderProgram, "uXYA"), [
        x,
        y,
        angle,
      ]);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, totalVerts);
    },
  };
}
