"use client";

import { Mesh, Program, Renderer, Texture, Triangle, type OGLRenderingContext } from "ogl";
import { useEffect, useRef } from "react";

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform vec2 uMouse;
uniform sampler2D uGradient;
uniform int uColorCount;
uniform float uDistort;
uniform int uRayCount;

float hash21(vec2 p) {
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30() { return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx) {
  vec2 p = mod(fragPx + vec2(uTime * 24.0, -uTime * 17.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

vec3 rayDir(vec2 frag, vec2 res) {
  float focal = res.y;
  return normalize(vec3(2.0 * frag - res, focal));
}

float edgeFade(vec2 frag, vec2 res) {
  vec2 toC = frag - 0.5 * res;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  return clamp(pow(q * 0.5, 1.35), 0.0, 1.0);
}

mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c);
}

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c);
}

mat3 rotZ(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0);
}

vec3 sampleGradient(float t) {
  return texture(uGradient, vec2(clamp(t, 0.0, 1.0), 0.5)).rgb;
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t) {
  return 0.8 * sin(q.x * 0.55 + t * 0.6)
       + 0.7 * sin(q.y * 0.50 - t * 0.5)
       + 0.6 * sin(q.z * 0.60 + t * 0.7);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  vec3 dir = rayDir(frag, uResolution);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  mat3 rot3dMat = rotZ(t * 0.11) * rotY(t * 0.15) * rotX(t * 0.09);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));
    Pl = rot3dMat * Pl;

    float stepLen = min(rad - 0.3, n * 0.055) + 0.1;
    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);

    float rayPattern = smoothstep(
      0.5, 0.7,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
      sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = pow(0.5 + 0.5 * cos(float(uRayCount) * ang), 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    float saw = fract(marchT * 0.25);
    float tRay = saw * saw * (3.0 - 2.0 * saw);
    vec3 spectral = 1.85 * sampleGradient(tRay);
    vec3 base = (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral;
    col += base * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution);
  col *= uIntensity;
  col = clamp(col, 0.0, 1.0);
  float alpha = clamp(max(max(col.r, col.g), col.b) * 1.35, 0.0, 0.92);
  fragColor = vec4(col, alpha);
}`;

const colors = ["#0ea5e9", "#2563eb", "#60a5fa", "#ec4899", "#f0abfc"];

export function PrismaticBurstBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const renderer = new Renderer({ alpha: true, antialias: false, dpr: 1.5 });
    const gl = renderer.gl;
    gl.canvas.style.position = "absolute";
    gl.canvas.style.inset = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    root.appendChild(gl.canvas);

    const gradient = createGradientTexture(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: 1.28 },
        uSpeed: { value: 0.16 },
        uMouse: { value: [0.5, 0.5] },
        uGradient: { value: gradient },
        uColorCount: { value: colors.length },
        uDistort: { value: 0.48 },
        uRayCount: { value: 18 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(root.clientWidth || 1, root.clientHeight || 1);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    let frame = 0;
    const started = performance.now();
    const render = (now: number) => {
      program.uniforms.uTime.value = (now - started) * 0.001;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeChild(gl.canvas);
    };
  }, []);

  return <div aria-hidden="true" className="absolute inset-0 overflow-hidden" ref={rootRef} />;
}

function createGradientTexture(gl: OGLRenderingContext) {
  const data = new Uint8Array(colors.flatMap(hexToRgba));
  const texture = new Texture(gl, {
    generateMipmaps: false,
    height: 1,
    image: data,
    width: colors.length,
  });
  texture.minFilter = gl.LINEAR;
  texture.magFilter = gl.LINEAR;
  texture.wrapS = gl.CLAMP_TO_EDGE;
  texture.wrapT = gl.CLAMP_TO_EDGE;
  return texture;
}

function hexToRgba(hex: string) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255, 255];
}
