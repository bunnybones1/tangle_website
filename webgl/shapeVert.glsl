precision highp float;
attribute vec2 coordinates;
uniform float uAspect;
uniform float uScale;
uniform vec3 uXYA;

mat2 rotationMatrix(float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, -s, s, c);
}

void main(void) {
  vec2 pos = coordinates * rotationMatrix(-uXYA.z);
  pos = pos * vec2(1.0, uAspect) * uScale + uXYA.xy;
  gl_Position = vec4(pos, 0.0, 1.0);
}