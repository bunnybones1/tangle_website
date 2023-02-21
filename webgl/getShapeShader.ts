import fragmentShader from "./shapeFrag.glsl";
import vertexShader from "./shapeVert.glsl";
import { makeShader } from "./makeShader";
let shapeShader: WebGLProgram | undefined;
export function getShapeShader(gl: WebGLRenderingContext) {
  if (!shapeShader) {
    shapeShader = makeShader(gl, vertexShader, fragmentShader);
  }
  return shapeShader;
}
