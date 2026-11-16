// Continues the component or data expression so its related values and behavior stay grouped together.
"use client"

/**
 * Nimbus UI · Liquid Navbar — "Waterline"
 * A pill of water. The active drop stretches toward the item you pick, splits into
 * droplets on long jumps and merges back with a ripple. The cursor lifts a meniscus,
 * every tap sends a wave along the pill, and each icon plays its own little scene.
 * Water is drawn by a tiny WebGL shader (only inside the pill, paused off-screen);
 * without WebGL it falls back to a CSS drop. No dependencies besides React.
 * by guglielmogiannattasio.it
 */

// Imports * as React from react so this module can reuse that component, helper, or library.
import * as React from "react"

// Continues the component or data expression so its related values and behavior stay grouped together.
export type NimbusFx = "plane" | "drop" | "spin" | "glow" | "wave" | "pop" | "none"

// Continues the component or data expression so its related values and behavior stay grouped together.
export type LiquidNavItem = {
  // Sets the label field so the surrounding object or component receives this setting.
  label: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  href?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  icon?: React.ReactNode
  /** the little scene the icon plays when tapped */
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fx?: NimbusFx
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export type LiquidNavbarProps = {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  items?: LiquidNavItem[]
  // Continues the component or data expression so its related values and behavior stay grouped together.
  defaultActive?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  active?: number
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  onChange?: (index: number, item: LiquidNavItem) => void
  /** "light" water for bright backgrounds, "dark" for dark ones */
  // Continues the component or data expression so its related values and behavior stay grouped together.
  tone?: "light" | "dark"
  /** icons only */
  // Continues the component or data expression so its related values and behavior stay grouped together.
  compact?: boolean
  /** soft synthesized "plip" on tap (no audio files) */
  // Continues the component or data expression so its related values and behavior stay grouped together.
  sound?: boolean
  // Continues the component or data expression so its related values and behavior stay grouped together.
  className?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  style?: React.CSSProperties
// Closes the current block or object so the grouped statements or settings end here.
}

/* ---------- icons ---------- */
// Stores the value in I so later lines can reuse this data or behavior for the current feature.
const I = (d: React.ReactNode) => (
  // Continues the component or data expression so its related values and behavior stay grouped together.
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {d}
  {/* Closes the <svg> element so later content is no longer part of this region. */}
  </svg>
// Closes this function call or grouped expression so the surrounding code can continue.
)
// Stores the value in NimbusIcons so later lines can reuse this data or behavior for the current feature.
export const NimbusIcons = {
  // Sets the home field so the surrounding object or component receives this setting.
  home: I(<><path d="M3.5 11.2 12 4l8.5 7.2" /><path d="M6 9.6V20h12V9.6" /><path className="nv-door" d="M10 20v-5h4v5Z" /></>),
  // Sets the globe field so the surrounding object or component receives this setting.
  globe: I(<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" /></>),
  // Sets the plane field so the surrounding object or component receives this setting.
  plane: I(<path d="M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13" />),
  // Sets the drop field so the surrounding object or component receives this setting.
  drop: I(<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />),
  // Sets the user field so the surrounding object or component receives this setting.
  user: I(<><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" /></>),
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in DEFAULT_ITEMS so later lines can reuse this data or behavior for the current feature.
const DEFAULT_ITEMS: LiquidNavItem[] = [
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { label: "Home", icon: NimbusIcons.home, fx: "glow" },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { label: "Explore", icon: NimbusIcons.globe, fx: "spin" },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { label: "Flights", icon: NimbusIcons.plane, fx: "plane" },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { label: "Weather", icon: NimbusIcons.drop, fx: "drop" },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { label: "Profile", icon: NimbusIcons.user, fx: "wave" },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Stores the value in PAD so later lines can reuse this data or behavior for the current feature.
const PAD = 14 // canvas bleed around the pill, for shadows and ripples

/* ---------- styles ---------- */
const NIMBUS_CSS = `
.nimbus-nav{--n-tint:rgba(255,255,255,.14);--n-fg:#0B132B;--n-fg-soft:rgba(11,19,43,.6);--n-rim:rgba(255,255,255,.7);
  position:relative;display:inline-flex;align-items:center;gap:2px;padding:6px;border-radius:999px;isolation:isolate;
  font-family:ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(10,18,40,.26);--n-fg:#F1F7FF;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(255,255,255,.34)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint);
  -webkit-backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);
  box-shadow:inset 0 1px 1px var(--n-rim),inset 0 0 0 1px rgba(255,255,255,.2),0 12px 32px -14px rgba(0,40,90,.5),0 2px 6px rgba(0,40,90,.1)}
.nimbus-nav[data-refract="on"] .nimbus-glass{-webkit-backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08);backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08)}
.nimbus-water{position:absolute;left:${-PAD}px;top:${-PAD}px;z-index:-1;pointer-events:none}
.nimbus-nav[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:6px;bottom:6px;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width;
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.95),inset 0 -2px 6px rgba(0,162,255,.22),inset 0 0 0 1px rgba(255,255,255,.55),0 6px 16px -6px rgba(0,70,140,.45)}
.nimbus-nav[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[aria-current="page"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #00A2FF;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[aria-current="page"] .nv-ico svg{transform:translateY(-1px) scale(1.08)}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.2)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"]::after{content:"";position:absolute;left:55%;top:48%;height:2px;width:46px;border-radius:2px;transform-origin:0 50%;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95));animation:nvTrail 1.15s ease-out both;pointer-events:none}
@keyframes nvTrail{0%,8%{opacity:0;transform:rotate(-22deg) scaleX(0)}30%{opacity:.9;transform:rotate(-22deg) scaleX(1)}55%,100%{opacity:0;transform:rotate(-22deg) translateX(30px) scaleX(.2)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"]::before,.nv-ico[data-fx="drop"]::after{content:"";position:absolute;bottom:0;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor;opacity:0;pointer-events:none}
.nv-ico[data-fx="drop"]::before{animation:nvSplashL .95s ease-out both}
.nv-ico[data-fx="drop"]::after{animation:nvSplashR .95s ease-out both}
@keyframes nvSplashL{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(-5px,-6px)}75%,100%{opacity:0;transform:translate(-11px,1px) scale(.4)}}
@keyframes nvSplashR{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(5px,-7px)}75%,100%{opacity:0;transform:translate(12px,1px) scale(.4)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#FFF3A8}100%{fill:rgba(126,232,255,.6)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nimbus-nav[data-compact="true"] .nimbus-item{padding:0 13px}
.nimbus-nav[data-compact="true"] .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{padding:0 13px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@media (prefers-reduced-motion:reduce){.nv-ico svg,.nv-ico::before,.nv-ico::after,.nv-door{animation:none!important;transition:none}}
`

/* ---------- the water shader ---------- */
// Stores the value in VERT so later lines can reuse this data or behavior for the current feature.
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`

// Continues the component or data expression so its related values and behavior stay grouped together.
type Body = { x: number; v: number }
// Continues the component or data expression so its related values and behavior stay grouped together.
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number }
// Continues the component or data expression so its related values and behavior stay grouped together.
type Rip = { x: number; y: number; age: number; amp: number }

// Defines makeState so this module can perform its named task when needed.
function makeState() {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the a field so the surrounding object or component receives this setting.
    a: { x: 0, v: 0 } as Body,
    // Sets the b field so the surrounding object or component receives this setting.
    b: { x: 0, v: 0 } as Body,
    // Sets the sy field so the surrounding object or component receives this setting.
    sy: { s: 1, v: 0 },
    // Sets the lead field so the surrounding object or component receives this setting.
    lead: 0 as 0 | 1,
    // Sets the lagFrom field so the surrounding object or component receives this setting.
    lagFrom: 0,
    // Sets the sats field so the surrounding object or component receives this setting.
    sats: [] as Sat[],
    // Sets the rips field so the surrounding object or component receives this setting.
    rips: [] as Rip[],
    // Sets the t field so the surrounding object or component receives this setting.
    t: { x: 0, cy: 0, q: 0, r: 21 },
    // Sets the q field so the surrounding object or component receives this setting.
    q: 0,
    // Sets the mouse field so the surrounding object or component receives this setting.
    mouse: { x: 0, y: 0, s: 0, on: false },
    // Sets the moving field so the surrounding object or component receives this setting.
    moving: false,
    // Sets the split field so the surrounding object or component receives this setting.
    split: false,
    // Sets the ready field so the surrounding object or component receives this setting.
    ready: false,
    // Sets the w field so the surrounding object or component receives this setting.
    w: 0,
    // Sets the h field so the surrounding object or component receives this setting.
    h: 0,
    // Sets the visible field so the surrounding object or component receives this setting.
    visible: true,
    // Sets the reduce field so the surrounding object or component receives this setting.
    reduce: false,
    // Sets the raf field so the surrounding object or component receives this setting.
    raf: 0,
    // Sets the last field so the surrounding object or component receives this setting.
    last: 0,
    // Sets the time field so the surrounding object or component receives this setting.
    time: 0,
    // Sets the glc field so the surrounding object or component receives this setting.
    glc: null as null | { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> },
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines initGL so this module can perform its named task when needed.
function initGL(canvas: HTMLCanvasElement) {
  // Stores the value in gl so later lines can reuse this data or behavior for the current feature.
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) as WebGLRenderingContext | null
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!gl) return null
  // Stores the value in sh so later lines can reuse this data or behavior for the current feature.
  const sh = (type: number, src: string) => {
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = gl.createShader(type)!
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    gl.shaderSource(s, src)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    gl.compileShader(s)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in vs so later lines can reuse this data or behavior for the current feature.
  const vs = sh(gl.VERTEX_SHADER, VERT)
  // Stores the value in fs so later lines can reuse this data or behavior for the current feature.
  const fs = sh(gl.FRAGMENT_SHADER, FRAG)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!vs || !fs) return null
  // Stores the value in p so later lines can reuse this data or behavior for the current feature.
  const p = gl.createProgram()!
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.attachShader(p, vs)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.attachShader(p, fs)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.linkProgram(p)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.useProgram(p)
  // Stores the value in buf so later lines can reuse this data or behavior for the current feature.
  const buf = gl.createBuffer()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  // Stores the value in loc so later lines can reuse this data or behavior for the current feature.
  const loc = gl.getAttribLocation(p, "a")
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.enableVertexAttribArray(loc)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  // Stores the value in u so later lines can reuse this data or behavior for the current feature.
  const u: Record<string, WebGLUniformLocation | null> = {}
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  for (const n of ["uRes", "uDpr", "uTime", "uPill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb"]) u[n] = gl.getUniformLocation(p, n)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return { gl, u }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines supportsRefraction so this module can perform its named task when needed.
function supportsRefraction() {
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (typeof window === "undefined" || typeof CSS === "undefined") return false
  // Stores the value in ua so later lines can reuse this data or behavior for the current feature.
  const ua = navigator.userAgent
  // Returns the result so the caller or React receives the value or interface this function provides.
  return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua) && !!(CSS as any).supports?.("backdrop-filter", "url(#a)")
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines LiquidNavbar so this module can perform its named task when needed.
export function LiquidNavbar({
  // Continues the component or data expression so its related values and behavior stay grouped together.
  items = DEFAULT_ITEMS,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  defaultActive = 0,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  active,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  onChange,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  tone = "light",
  // Continues the component or data expression so its related values and behavior stay grouped together.
  compact,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  sound = false,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  className,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  style,
// Continues the component or data expression so its related values and behavior stay grouped together.
}: LiquidNavbarProps) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [inner, setInner] = React.useState(defaultActive)
  // Stores the value in current so later lines can reuse this data or behavior for the current feature.
  const current = active ?? inner
  // Stores the value in navRef so later lines can reuse this data or behavior for the current feature.
  const navRef = React.useRef<HTMLElement>(null)
  // Stores the value in canvasRef so later lines can reuse this data or behavior for the current feature.
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  // Stores the value in dropRef so later lines can reuse this data or behavior for the current feature.
  const dropRef = React.useRef<HTMLSpanElement>(null)
  // Stores the value in itemRefs so later lines can reuse this data or behavior for the current feature.
  const itemRefs = React.useRef<(HTMLElement | null)[]>([])
  // Stores the value in iconRefs so later lines can reuse this data or behavior for the current feature.
  const iconRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  // Stores the value in audio so later lines can reuse this data or behavior for the current feature.
  const audio = React.useRef<AudioContext | null>(null)
  // Stores the value in st so later lines can reuse this data or behavior for the current feature.
  const st = React.useRef(makeState())
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [gl, setGl] = React.useState<"on" | "off">("on")
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [refract, setRefract] = React.useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [fx, setFx] = React.useState({ i: -1, n: 0 })
  // Stores the value in dark so later lines can reuse this data or behavior for the current feature.
  const dark = tone === "dark" ? 1 : 0
  // Stores the value in darkRef so later lines can reuse this data or behavior for the current feature.
  const darkRef = React.useRef(dark)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  darkRef.current = dark

  /* ---- drawing ---- */
  // Stores the value in draw so later lines can reuse this data or behavior for the current feature.
  const draw = React.useCallback(() => {
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Stores the value in T so later lines can reuse this data or behavior for the current feature.
    const T = s.t
    // Stores the value in sep so later lines can reuse this data or behavior for the current feature.
    const sep = Math.abs(s.a.x - s.b.x)
    // Stores the value in thin so later lines can reuse this data or behavior for the current feature.
    const thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1)
    // Stores the value in r so later lines can reuse this data or behavior for the current feature.
    const r = T.r * (1 - 0.3 * thin)
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (s.glc) {
      // Continues the component or data expression so its related values and behavior stay grouped together.
      const { gl: g, u } = s.glc
      // Stores the value in dpr so later lines can reuse this data or behavior for the current feature.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform1f(u.uDpr, dpr)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform1f(u.uTime, s.time)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h)
      // Stores the value in blobs so later lines can reuse this data or behavior for the current feature.
      const blobs = new Float32Array(24)
      // Stores the value in sy so later lines can reuse this data or behavior for the current feature.
      const sy = new Float32Array(6).fill(1)
      // Stores the value in head so later lines can reuse this data or behavior for the current feature.
      const head = s.lead === 0 ? s.a : s.b, tail = s.lead === 0 ? s.b : s.a
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      blobs.set([head.x, T.cy, s.q * (1 - 0.25 * thin), T.r * (1 - 0.12 * thin), tail.x, T.cy, s.q * (1 - 0.8 * thin), T.r * (1 - 0.5 * thin)], 0)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      sy[0] = sy[1] = s.sy.s
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform4fv(u.uBlob, blobs)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform1fv(u.uSy, sy)
      // Stores the value in rips so later lines can reuse this data or behavior for the current feature.
      const rips = new Float32Array(24)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform4fv(u.uRip, rips)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform1f(u.uDark, darkRef.current)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.uniform1f(u.uAmb, s.reduce ? 0 : 1)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.clearColor(0, 0, 0, 0)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.clear(g.COLOR_BUFFER_BIT)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.drawArrays(g.TRIANGLES, 0, 3)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } else if (dropRef.current) {
      // Stores the value in left so later lines can reuse this data or behavior for the current feature.
      const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD
      // Stores the value in width so later lines can reuse this data or behavior for the current feature.
      const width = sep + 2 * (s.q + r)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      dropRef.current.style.width = `${width}px`
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      dropRef.current.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  /* ---- physics ---- */
  // Stores the value in step so later lines can reuse this data or behavior for the current feature.
  const step = React.useCallback((dt: number, now: number) => {
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Stores the value in T so later lines can reuse this data or behavior for the current feature.
    const T = s.t
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.time += dt
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.q += (T.q - s.q) * Math.min(1, dt * 12)
    // Stores the value in bodies so later lines can reuse this data or behavior for the current feature.
    const bodies = [s.a, s.b]
    // Stores the value in still so later lines can reuse this data or behavior for the current feature.
    let still = true
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (s.reduce) {
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = []
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } else {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      bodies.forEach((B, i) => {
        // Stores the value in lead so later lines can reuse this data or behavior for the current feature.
        const lead = i === s.lead
        // Stores the value in k so later lines can reuse this data or behavior for the current feature.
        const k = lead ? 210 : 72
        // Stores the value in c so later lines can reuse this data or behavior for the current feature.
        const c = lead ? 25 : 13
        // Stores the value in f so later lines can reuse this data or behavior for the current feature.
        const f = !lead && now < s.lagFrom ? 0.08 : 1
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f
        // Continues the component or data expression so its related values and behavior stay grouped together.
        B.x += B.v * dt
        // Stores the value in lo so later lines can reuse this data or behavior for the current feature.
        const lo = PAD + 6 + s.q + T.r - 3, hi = PAD + s.w - 6 - s.q - T.r + 3
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (B.x < lo || B.x > hi) {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          B.x = Math.max(lo, Math.min(hi, B.x))
          // Continues the component or data expression so its related values and behavior stay grouped together.
          B.v *= -0.25
        // Closes the current block or object so the grouped statements or settings end here.
        }
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Stores the value in L so later lines can reuse this data or behavior for the current feature.
      const L = bodies[s.lead]
      // Stores the value in syT so later lines can reuse this data or behavior for the current feature.
      const syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.sy.s += s.sy.v * dt
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false
      // break the neck: spawn droplets between head and tail
      // Stores the value in sep so later lines can reuse this data or behavior for the current feature.
      const sep = Math.abs(s.a.x - s.b.x)
      // Stores the value in r so later lines can reuse this data or behavior for the current feature.
      const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1))
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        // Continues the component or data expression so its related values and behavior stay grouped together.
        s.split = true
        // Stores the value in lo so later lines can reuse this data or behavior for the current feature.
        const lo = bodies[1 - s.lead], hi = bodies[s.lead]
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ;[0.3, 0.5, 0.72].forEach((t, j) => {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          s.sats.push({
            // Sets the x field so the surrounding object or component receives this setting.
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            // Sets the y field so the surrounding object or component receives this setting.
            y: T.cy + (Math.random() - 0.5) * 10,
            // Sets the vx field so the surrounding object or component receives this setting.
            vx: (lo.v + hi.v) * 0.45,
            // Sets the vy field so the surrounding object or component receives this setting.
            vy: (Math.random() - 0.5) * 60,
            // Sets the r field so the surrounding object or component receives this setting.
            r: 5 + Math.random() * 3 - j * 0.5,
            // Sets the k field so the surrounding object or component receives this setting.
            k: 70 + Math.random() * 90,
          // Continues the component or data expression so its related values and behavior stay grouped together.
          })
        // Continues the component or data expression so its related values and behavior stay grouped together.
        })
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Keeps only items matching this condition so the result contains relevant data.
      s.sats = s.sats.filter((d) => {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt
        // Continues the component or data expression so its related values and behavior stay grouped together.
        d.x += d.vx * dt
        // Continues the component or data expression so its related values and behavior stay grouped together.
        d.y += d.vy * dt
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x))
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y))
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26
        // Returns the result so the caller or React receives the value or interface this function provides.
        return d.r > 0.6
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (s.sats.length) still = false
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (s.moving && still) {
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.moving = false
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 })
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.rips.forEach((p) => (p.age += dt))
    // Keeps only items matching this condition so the result contains relevant data.
    s.rips = s.rips.filter((p) => p.age < 2.4)
    // Stores the value in target so later lines can reuse this data or behavior for the current feature.
    const target = s.mouse.on ? 1 : 0
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  // Stores the value in loop so later lines can reuse this data or behavior for the current feature.
  const loop = React.useCallback(() => {
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (s.raf) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.last = performance.now()
    // Stores the value in tick so later lines can reuse this data or behavior for the current feature.
    const tick = (now: number) => {
      // Stores the value in dt so later lines can reuse this data or behavior for the current feature.
      const dt = Math.min((now - s.last) / 1000, 1 / 30)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.last = now
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      step(dt, now)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      draw()
      // Stores the value in busy so later lines can reuse this data or behavior for the current feature.
      const busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01
      // ambient water keeps moving while visible; reduced-motion only animates on change
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick)
      // Handles the alternative branch when the preceding condition was not met.
      else s.raf = 0
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.raf = requestAnimationFrame(tick)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [draw, step])

  /* ---- layout ---- */
  // Stores the value in measure so later lines can reuse this data or behavior for the current feature.
  const measure = React.useCallback(() => {
    // Stores the value in nav so later lines can reuse this data or behavior for the current feature.
    const nav = navRef.current
    // Stores the value in el so later lines can reuse this data or behavior for the current feature.
    const el = itemRefs.current[current]
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!nav || !el) return
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.w = nav.offsetWidth
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.h = nav.offsetHeight
    // Stores the value in T so later lines can reuse this data or behavior for the current feature.
    const T = s.t
    // Continues the component or data expression so its related values and behavior stay grouped together.
    T.r = el.offsetHeight / 2
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    T.q = Math.max(0, el.offsetWidth / 2 - T.r)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    T.cy = PAD + el.offsetTop + el.offsetHeight / 2
    // Stores the value in nx so later lines can reuse this data or behavior for the current feature.
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!s.ready) {
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.a.x = s.b.x = nx
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.q = T.q
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.ready = true
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } else if (Math.abs(nx - T.x) > 0.5) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      s.lagFrom = performance.now() + 70
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.moving = true
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.split = false
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    T.x = nx
    // Stores the value in cv so later lines can reuse this data or behavior for the current feature.
    const cv = canvasRef.current
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (cv) {
      // Stores the value in dpr so later lines can reuse this data or behavior for the current feature.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Stores the value in W so later lines can reuse this data or behavior for the current feature.
      const W = s.w + PAD * 2, Hh = s.h + PAD * 2
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        cv.width = Math.round(W * dpr)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        cv.height = Math.round(Hh * dpr)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        cv.style.width = `${W}px`
        // Continues the component or data expression so its related values and behavior stay grouped together.
        cv.style.height = `${Hh}px`
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    loop()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [current, loop])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  React.useEffect(() => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setRefract(supportsRefraction())
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    // Stores the value in cv so later lines can reuse this data or behavior for the current feature.
    const cv = canvasRef.current
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.glc = cv ? initGL(cv) : null
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!s.glc) setGl("off")
    // Stores the value in lost so later lines can reuse this data or behavior for the current feature.
    const lost = (e: Event) => { e.preventDefault(); s.glc = null; setGl("off") }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    cv?.addEventListener("webglcontextlost", lost)
    // Stores the value in io so later lines can reuse this data or behavior for the current feature.
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop() })
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (navRef.current) io.observe(navRef.current)
    // Stores the value in vis so later lines can reuse this data or behavior for the current feature.
    const vis = () => { s.visible = document.visibilityState === "visible"; if (s.visible) loop() }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    document.addEventListener("visibilitychange", vis)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      cv?.removeEventListener("webglcontextlost", lost)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      io.disconnect()
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      document.removeEventListener("visibilitychange", vis)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      cancelAnimationFrame(s.raf)
      // Continues the component or data expression so its related values and behavior stay grouped together.
      s.raf = 0
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [loop])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  React.useLayoutEffect(() => { measure() }, [measure, items.length, compact])
  // Stores the value in measureRef so later lines can reuse this data or behavior for the current feature.
  const measureRef = React.useRef(measure)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  measureRef.current = measure
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  React.useEffect(() => {
    // Stores the value in lastW so later lines can reuse this data or behavior for the current feature.
    let lastW = -1
    // Stores the value in ro so later lines can reuse this data or behavior for the current feature.
    const ro = new ResizeObserver(() => {
      // Stores the value in w so later lines can reuse this data or behavior for the current feature.
      const w = navRef.current?.offsetWidth ?? 0
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (w !== lastW) { lastW = w; st.current.ready = false; measureRef.current() }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (navRef.current) ro.observe(navRef.current)
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => ro.disconnect()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  React.useEffect(() => { loop() }, [tone, loop])

  /* ---- interaction ---- */
  // Stores the value in local so later lines can reuse this data or behavior for the current feature.
  const local = (clientX: number, clientY: number) => {
    // Stores the value in r so later lines can reuse this data or behavior for the current feature.
    const r = navRef.current!.getBoundingClientRect()
    // Returns the result so the caller or React receives the value or interface this function provides.
    return { x: clientX - r.left + PAD, y: clientY - r.top + PAD }
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in ripple so later lines can reuse this data or behavior for the current feature.
  const ripple = (x: number, y: number, amp: number) => {
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (s.reduce) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    s.rips.push({ x, y, age: 0, amp })
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    loop()
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in iconCenter so later lines can reuse this data or behavior for the current feature.
  const iconCenter = (i: number) => {
    // Stores the value in el so later lines can reuse this data or behavior for the current feature.
    const el = iconRefs.current[i]
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!el) return null
    // Stores the value in b so later lines can reuse this data or behavior for the current feature.
    const b = el.getBoundingClientRect()
    // Returns the result so the caller or React receives the value or interface this function provides.
    return local(b.left + b.width / 2, b.top + b.height / 2)
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in plip so later lines can reuse this data or behavior for the current feature.
  const plip = () => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!sound) return
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in AC so later lines can reuse this data or behavior for the current feature.
      const AC = window.AudioContext || (window as any).webkitAudioContext
      // Stores the value in ctx so later lines can reuse this data or behavior for the current feature.
      const ctx = (audio.current ||= new AC())
      // Stores the value in t so later lines can reuse this data or behavior for the current feature.
      const t = ctx.currentTime
      // Stores the value in o so later lines can reuse this data or behavior for the current feature.
      const o = ctx.createOscillator()
      // Stores the value in g so later lines can reuse this data or behavior for the current feature.
      const g = ctx.createGain()
      // Continues the component or data expression so its related values and behavior stay grouped together.
      o.type = "sine"
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      o.frequency.setValueAtTime(420 + Math.random() * 80, t)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.gain.setValueAtTime(0.0001, t)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      o.connect(g).connect(ctx.destination)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      o.start(t)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      o.stop(t + 0.18)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch {}
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in select so later lines can reuse this data or behavior for the current feature.
  const select = (i: number) => {
    // Stores the value in kind so later lines can reuse this data or behavior for the current feature.
    const kind = items[i]?.fx ?? (items[i]?.icon ? "pop" : "none")
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFx((f) => ({ i, n: f.n + 1 }))
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    plip()
    // Stores the value in c so later lines can reuse this data or behavior for the current feature.
    const c = iconCenter(i)
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (c && kind === "drop") setTimeout(() => ripple(c.x, st.current.t.cy, 1.4), 430)
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (c && kind === "plane") ripple(c.x, c.y, 0.6)
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (i !== current) {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (active === undefined) setInner(i)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      onChange?.(i, items[i])
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in onKeyDown so later lines can reuse this data or behavior for the current feature.
  const onKeyDown = (e: React.KeyboardEvent) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    e.preventDefault()
    // Stores the value in n so later lines can reuse this data or behavior for the current feature.
    const n = (current + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    select(n)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    itemRefs.current[n]?.focus()
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in onMove so later lines can reuse this data or behavior for the current feature.
  const onMove = (e: React.PointerEvent) => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (e.pointerType !== "mouse") return
    // Stores the value in p so later lines can reuse this data or behavior for the current feature.
    const p = local(e.clientX, e.clientY)
    // Stores the value in s so later lines can reuse this data or behavior for the current feature.
    const s = st.current
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.mouse.x = p.x
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.mouse.y = p.y
    // Continues the component or data expression so its related values and behavior stay grouped together.
    s.mouse.on = true
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    loop()
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <nav
      /* Sets the ref property so this element receives the data or behavior required by this screen. */
      /* Sets the ref property so this element receives the data or behavior required by this screen. */
      ref={navRef as any}
      /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
      className={["nimbus-nav", className].filter(Boolean).join(" ")}
      /* Sets the data-tone property so this element receives the data or behavior required by this screen. */
      /* Sets the data-tone property so this element receives the data or behavior required by this screen. */
      data-tone={tone}
      /* Sets the data-gl property so this element receives the data or behavior required by this screen. */
      /* Sets the data-gl property so this element receives the data or behavior required by this screen. */
      data-gl={gl}
      /* Sets the data-compact property so this element receives the data or behavior required by this screen. */
      /* Sets the data-compact property so this element receives the data or behavior required by this screen. */
      data-compact={compact === undefined ? undefined : String(compact)}
      /* Sets the data-refract property so this element receives the data or behavior required by this screen. */
      /* Sets the data-refract property so this element receives the data or behavior required by this screen. */
      data-refract={refract ? "on" : "off"}
      /* Provides aria-label accessibility information so assistive technology can describe the element. */
      aria-label="Main"
      /* Connects the KeyDown event to its handler so the interface can respond to interaction. */
      onKeyDown={onKeyDown}
      /* Connects the PointerMove event to its handler so the interface can respond to interaction. */
      onPointerMove={onMove}
      /* Connects the PointerLeave event to its handler so the interface can respond to interaction. */
      onPointerLeave={() => { st.current.mouse.on = false; loop() }}
      /* Connects the PointerDown event to its handler so the interface can respond to interaction. */
      onPointerDown={(e) => { const p = local(e.clientX, e.clientY); ripple(p.x, p.y, 0.8) }}
      /* Sets the style property so this element receives the data or behavior required by this screen. */
      /* Sets the style property so this element receives the data or behavior required by this screen. */
      style={style}
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    /* Continues the component or data expression so its related values and behavior stay grouped together. */
    >
      {/* Starts the <style> element to organize this part of the interface. */}
      <style dangerouslySetInnerHTML={{ __html: NIMBUS_CSS }} />
      {/* Starts the <svg> element to organize this part of the interface. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        {/* Starts the <filter> element to organize this part of the interface. */}
        <filter id="nimbus-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Starts the <feTurbulence> element to organize this part of the interface. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="7" result="noise" />
          {/* Starts the <feGaussianBlur> element to organize this part of the interface. */}
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          {/* Starts the <feDisplacementMap> element to organize this part of the interface. */}
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="60" xChannelSelector="R" yChannelSelector="G" />
        {/* Closes the <filter> element so later content is no longer part of this region. */}
        </filter>
      {/* Closes the <svg> element so later content is no longer part of this region. */}
      </svg>
      {/* Starts the <span> element to organize this part of the interface. */}
      <span className="nimbus-glass" aria-hidden="true" />
      {/* Starts the <canvas> element to organize this part of the interface. */}
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      {/* Starts the <span> element to organize this part of the interface. */}
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {items.map((it, i) => {
        // Stores the value in kind so later lines can reuse this data or behavior for the current feature.
        const kind = it.fx ?? "pop"
        // Stores the value in playing so later lines can reuse this data or behavior for the current feature.
        const playing = fx.i === i && kind !== "none"
        // Stores the value in props so later lines can reuse this data or behavior for the current feature.
        const props = {
          // Sets the ref field so the surrounding object or component receives this setting.
          ref: (el: HTMLElement | null) => { itemRefs.current[i] = el },
          // Sets the className field so the surrounding object or component receives this setting.
          className: "nimbus-item",
          // Continues the component or data expression so its related values and behavior stay grouped together.
          "aria-current": i === current ? ("page" as const) : undefined,
          // Sets the onClick field so the surrounding object or component receives this setting.
          onClick: () => select(i),
        // Closes the current block or object so the grouped statements or settings end here.
        }
        // Stores the value in content so later lines can reuse this data or behavior for the current feature.
        const content = (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {it.icon && (
              <span className="nv-ico" key={playing ? fx.n : 0} data-fx={playing ? kind : undefined} ref={(el) => { iconRefs.current[i] = el }}>
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {it.icon}
              {/* Closes the <span> element so later content is no longer part of this region. */}
              </span>
            )}
            {/* Starts the <span> element to organize this part of the interface. */}
            <span className="nimbus-label">{it.label}</span>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          </>
        // Closes this function call or grouped expression so the surrounding code can continue.
        )
        // Returns the result so the caller or React receives the value or interface this function provides.
        return it.href ? (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <a key={it.label + i} {...(props as any)} href={it.href} aria-label={it.label}>{content}</a>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ) : (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <button key={it.label + i} {...(props as any)} type="button" aria-label={it.label}>{content}</button>
        // Closes this function call or grouped expression so the surrounding code can continue.
        )
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })}
    {/* Closes the <nav> element so later content is no longer part of this region. */}
    </nav>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

/** alias for registries that import { Component } */
// Continues the component or data expression so its related values and behavior stay grouped together.
export { LiquidNavbar as Component }

// Exports LiquidNavbar as this file’s default value so other modules can load the main feature.
export default LiquidNavbar

// File purpose: Renders the reusable liquid glass navbar interface component.
