import {
  LUMP_SCENES,
  OPENING,
  SCENES,
  freshSets,
  hintFor,
  reshuffleSets,
} from './scenes.js'

export { hintFor }

const MIN_COMMIT = 36
const WINDUP = 0.28
const STRIKE = 0.2
const IMPACT_HOLD = 0.78
const BONK_TIME = 0.3

export function createState(w, h) {
  const state = {
    w,
    h,
    scene: 'title',
    time: 0,
    lock: 0,
    cooldown: 0,
    pending: null,
    mirrorWobble: 0,
    seenDrag: false,
    shake: 0,
    look: 0,
    lookSeed: 1,
    events: [],
    popups: [],
    bursts: [],
    sets: freshSets(),
    setIndex: 0,
    scenePos: 0,
    guy: {
      x: 0,
      y: 0,
      hop: null,
      giggle: 0,
      yell: 0,
      squash: 0,
      react: 0,
      knockX: 0,
      knockY: 0,
      spin: 1,
    },
    fist: emptyFist(),
    arena: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  }
  placeForScene(state)
  return state
}

function emptyFist() {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    prevX: 0,
    prevY: 0,
    startX: 0,
    startY: 0,
    grabDx: 0,
    grabDy: 0,
    originX: 0,
    originY: 0,
    moved: 0,
    dragging: false,
    pointerId: null,
    gestureResolved: false,
    squash: 0,
    phase: 'ready',
    phaseT: 0,
    aimX: 0,
    aimY: -1,
    fingerX: 0,
    fingerY: 0,
    commitX: 0,
    commitY: 0,
    pull: 48,
    power: 180,
    plan: null,
    resolved: false,
    strikeFromX: 0,
    strikeFromY: 0,
    strikeToX: 0,
    strikeToY: 0,
    impactX: 0,
    impactY: 0,
    bonkFromX: 0,
    bonkFromY: 0,
  }
}

export function metrics(state) {
  const short = Math.min(state.w, state.h)
  const fit = Math.min(1, state.h / 640, state.w / 320)
  const s = short * fit
  return {
    bubR: s * 0.082,
    fistR: Math.max(s * 0.125, 36),
    lumpR: s * 0.11,
  }
}

export function topInset(state) {
  return Math.max(96, Math.min(150, state.h * 0.17))
}

export function mirrorGeom(state) {
  const { w, h } = state
  const pad = Math.max(8, Math.min(14, w * 0.03))
  const frame = {
    x: w * 0.46,
    y: topInset(state) + 8,
    w: w * 0.48,
    h: Math.min(h * 0.46, h - topInset(state) - h * 0.28),
  }
  const glass = {
    x: frame.x + pad,
    y: frame.y + pad,
    w: frame.w - pad * 2,
    h: frame.h - pad * 2,
  }
  return { frame, glass, planeX: glass.x }
}

const FIST_LEFT = new Set(['mirror', 'statue', 'plant'])

export function windowHole(state) {
  return {
    x: state.w * 0.22,
    y: topInset(state) + 8,
    w: state.w * 0.56,
    h: state.h * 0.36,
  }
}

export function cover(state) {
  if (!state.anchorX || state.scene === 'title') return { gap: null, solids: [] }
  if (state.scene === 'window') return windowCover(state)
  const halfW = 28
  const halfH = 32
  const gap = {
    x: state.anchorX - halfW,
    y: state.anchorY - halfH,
    w: halfW * 2,
    h: halfH * 2 + 6,
  }
  const drop = 168
  const near = FIST_LEFT.has(state.scene)
    ? { x: -12, y: gap.y - 8, w: Math.max(16, gap.x + 8), h: gap.h + drop }
    : { x: gap.x + gap.w - 2, y: gap.y - 8, w: state.w - (gap.x + gap.w) + 16, h: gap.h + drop }
  const far = FIST_LEFT.has(state.scene)
    ? { x: gap.x + gap.w - 2, y: gap.y - 12, w: 58, h: gap.h + 28 }
    : { x: gap.x - 60, y: gap.y - 12, w: 58, h: gap.h + 28 }
  const lintel = { x: gap.x - 16, y: gap.y - 24, w: gap.w + 32, h: 20 }
  return { gap, solids: [near, far, lintel] }
}

function windowCover(state) {
  const frame = windowHole(state)
  const mullion = 16
  const midX = frame.x + frame.w * 0.5 - mullion / 2
  const midY = frame.y + frame.h * 0.55 - mullion / 2
  const gap = {
    x: frame.x + 10,
    y: midY + mullion + 6,
    w: Math.max(28, midX - frame.x - 14),
    h: Math.max(36, frame.y + frame.h - (midY + mullion + 6) - 10),
  }
  return {
    gap,
    solids: [
      { x: 0, y: frame.y - 10, w: frame.x + 6, h: frame.h + 20 },
      { x: frame.x + frame.w - 6, y: frame.y - 10, w: state.w - frame.x - frame.w + 12, h: frame.h + 20 },
      { x: midX, y: frame.y, w: mullion, h: frame.h },
      { x: frame.x, y: midY, w: frame.w, h: mullion },
      { x: midX + mullion, y: frame.y, w: Math.max(8, frame.x + frame.w - midX - mullion), h: frame.h },
      { x: frame.x, y: frame.y, w: Math.max(8, midX - frame.x), h: Math.max(8, midY - frame.y) },
    ],
  }
}

export function bedGeom(state) {
  const { w, h } = state
  const frame = {
    x: w * 0.06,
    y: Math.max(topInset(state) + h * 0.18, h * 0.38),
    w: w * 0.88,
    h: Math.min(h * 0.3, h * 0.34),
  }
  const mattress = {
    x: frame.x + 12,
    y: frame.y + 16,
    w: frame.w - 24,
    h: frame.h - 26,
  }
  const blanket = {
    x: mattress.x + 6,
    y: mattress.y + mattress.h * 0.3,
    w: mattress.w - 12,
    h: mattress.h * 0.68,
  }
  return { frame, mattress, blanket }
}

export function guyVisual(state) {
  let x = state.guy.x
  let y = state.guy.y
  const dancing = state.scene === 'dance' || state.scene === 'title'
  if (dancing && !state.guy.hop) y -= Math.abs(Math.sin(state.time * 7)) * 8
  if (state.scene === 'couch' && !state.guy.hop) y -= Math.abs(Math.sin(state.time * 6)) * 14
  if (state.scene === 'bike' && !state.guy.hop) y -= Math.abs(Math.sin(state.time * 8)) * 4
  if (state.scene === 'bubbles' && !state.guy.hop) y += Math.sin(state.time * 2.2) * 10
  if (state.guy.react > 0) {
    const kick = Math.sin(state.guy.react * Math.PI)
    x += state.guy.knockX * kick
    y += state.guy.knockY * kick
  }
  return { x, y }
}

export function reflectionPoint(state) {
  const mirror = mirrorGeom(state)
  const visual = guyVisual(state)
  return {
    x: 2 * mirror.planeX - state.guy.x,
    y: visual.y,
  }
}

export function decoyPoint(state) {
  if (state.scene === 'mirror') {
    const point = reflectionPoint(state)
    return { id: 'reflection', x: point.x, y: point.y, r: metrics(state).bubR * 0.96 }
  }
  const spec = SCENES[state.scene]
  if (!spec?.decoy) return null
  const m = metrics(state)
  return {
    id: 'decoy',
    x: state.w * spec.decoy.x,
    y: state.h * spec.decoy.y,
    r: m.bubR * 0.9,
  }
}

function arenaFor(state) {
  const { w, h } = state
  const m = metrics(state)
  if (state.scene === 'mirror') {
    const mirror = mirrorGeom(state)
    const rad = m.bubR
    const minX = 2 * mirror.planeX - (mirror.glass.x + mirror.glass.w - rad - 6)
    const maxX = mirror.planeX - rad * 0.85 - 8
    const minY = Math.max(mirror.glass.y + rad + 4, h * 0.42)
    const maxY = Math.min(mirror.glass.y + mirror.glass.h - rad - 4, h * 0.6)
    return {
      minX: Math.min(minX, maxX - 28),
      maxX,
      minY: Math.min(minY, maxY - 24),
      maxY: Math.max(maxY, minY + 24),
    }
  }
  if (state.scene === 'bed') {
    const bed = bedGeom(state)
    const rad = m.lumpR
    return {
      minX: bed.blanket.x + rad * 0.7,
      maxX: bed.blanket.x + bed.blanket.w - rad * 0.7,
      minY: bed.blanket.y + rad * 0.4,
      maxY: bed.blanket.y + bed.blanket.h - rad * 0.3,
    }
  }
  const spec = SCENES[state.scene] || SCENES.dance
  const cx = w * (spec.cx ?? 0.5)
  const cy = h * (spec.cy ?? 0.5)
  const pad = m.bubR
  return {
    minX: clamp(cx - spec.hw, pad, w - pad - 24),
    maxX: clamp(cx + spec.hw, pad + 24, w - pad),
    minY: clamp(cy - spec.hh, topInset(state), h - pad - 24),
    maxY: clamp(cy + spec.hh, topInset(state) + 24, h - 80),
  }
}

function placeForScene(state) {
  const { w, h } = state
  const m = metrics(state)
  state.arena = arenaFor(state)
  const arena = state.arena
  if (state.scene === 'title') {
    state.guy.x = w * 0.5
    state.guy.y = h * 0.64
  } else if (state.scene === 'mirror') {
    state.guy.x = (arena.minX + arena.maxX) / 2
    state.guy.y = (arena.minY + arena.maxY) / 2
  } else if (state.scene === 'bed') {
    state.guy.x = (arena.minX + arena.maxX) / 2
    state.guy.y = (arena.minY + arena.maxY) / 2
  } else {
    const spec = SCENES[state.scene]
    state.guy.x = clamp(w * spec.cx, arena.minX, arena.maxX)
    state.guy.y = clamp(h * spec.cy, arena.minY, arena.maxY)
  }
  if (state.scene === 'window') {
    const gap = windowCover(state).gap
    state.guy.x = gap.x + gap.w / 2
    state.guy.y = gap.y + Math.min(34, gap.h * 0.4)
    state.arena = {
      minX: gap.x + 8,
      maxX: gap.x + gap.w - 8,
      minY: state.guy.y - 12,
      maxY: state.guy.y + 12,
    }
  }
  state.anchorX = state.guy.x
  state.anchorY = state.guy.y
  if (state.scene !== 'title' && state.scene !== 'window') {
    state.arena = {
      minX: Math.max(state.arena.minX, state.anchorX - 16),
      maxX: Math.min(state.arena.maxX, state.anchorX + 16),
      minY: Math.max(state.arena.minY, state.anchorY - 14),
      maxY: Math.min(state.arena.maxY, state.anchorY + 14),
    }
  }
  state.guy.hop = null
  state.guy.react = 0
  state.guy.squash = 0
  state.guy.yell = 0
  const homeX = state.scene === 'title' ? w * 0.5 : FIST_LEFT.has(state.scene) ? w * 0.15 : w * 0.85
  state.fist.x = clamp(homeX, m.fistR + 4, w - m.fistR - 4)
  state.fist.y = clamp(h * 0.86, m.fistR + 4, h - m.fistR - 8)
  state.fist.vx = 0
  state.fist.vy = 0
  state.fist.prevX = state.fist.x
  state.fist.prevY = state.fist.y
  state.fist.dragging = false
  state.fist.phase = 'ready'
  state.fist.phaseT = 0
  state.fist.squash = 0
  state.fist.resolved = false
  state.fist.aimX = 0
  state.fist.aimY = -1
}

export function resize(state, w, h) {
  if (state.w <= 0 || state.h <= 0) {
    state.w = w
    state.h = h
    placeForScene(state)
    return
  }
  const sx = w / state.w
  const sy = h / state.h
  state.w = w
  state.h = h
  state.guy.x *= sx
  state.guy.y *= sy
  state.fist.x *= sx
  state.fist.y *= sy
  const hop = state.guy.hop
  if (hop) {
    hop.x0 *= sx
    hop.x1 *= sx
    hop.y0 *= sy
    hop.y1 *= sy
  }
  state.arena = arenaFor(state)
  const m = metrics(state)
  state.fist.x = clamp(state.fist.x, m.fistR, state.w - m.fistR)
  state.fist.y = clamp(state.fist.y, m.fistR, state.h - m.fistR)
}

export function roundPips(state) {
  const set = state.scene === 'title' ? OPENING : state.sets[state.setIndex] || OPENING
  return set.map((id, index) => ({
    id,
    label: SCENES[id].label,
    mark: state.scene === 'title' ? 'idle' : index < state.scenePos ? 'done' : index === state.scenePos ? 'on' : 'idle',
  }))
}

export function startGame(state) {
  if (state.scene !== 'title') return
  state.sets = freshSets()
  state.setIndex = 0
  state.scenePos = 0
  state.lookSeed = 1
  enter(state, 'dance', { setIndex: 0, scenePos: 0 })
}

export function enter(state, scene, where) {
  state.scene = scene
  if (where) {
    state.setIndex = where.setIndex
    state.scenePos = where.scenePos
  }
  state.guy.giggle = 0
  state.guy.yell = 0
  state.guy.squash = 0
  state.guy.hop = null
  state.guy.react = 0
  state.lock = 0
  state.cooldown = 0
  state.pending = null
  state.mirrorWobble = 0
  state.shake = 0
  state.bursts = []
  state.look = OPENING.includes(scene) ? 0 : state.lookSeed++ % 3
  state.fist.dragging = false
  state.fist.pointerId = null
  placeForScene(state)
  state.events.push('scene')
}

export function pointerDown(state, x, y, id, time) {
  if (state.lock > 0) return false
  if (state.scene === 'title') return false
  if (state.fist.phase !== 'ready') return false
  const m = metrics(state)
  const dx = x - state.fist.x
  const dy = y - state.fist.y
  const reach = m.fistR + 22
  if (dx * dx + dy * dy > reach * reach) return false
  const fist = state.fist
  fist.dragging = true
  fist.phase = 'drag'
  fist.pointerId = id
  fist.grabDx = x - fist.x
  fist.grabDy = y - fist.y
  fist.originX = x
  fist.originY = y
  fist.startX = fist.x
  fist.startY = fist.y
  fist.prevX = fist.x
  fist.prevY = fist.y
  fist.moved = 0
  fist.vx = 0
  fist.vy = 0
  fist.lastT = time
  fist.fingerX = x
  fist.fingerY = y
  fist.resolved = false
  state.seenDrag = true
  return true
}

export function pointerMove(state, x, y, id, time) {
  const fist = state.fist
  if (!fist.dragging || fist.pointerId !== id || fist.phase !== 'drag') return
  const m = metrics(state)
  const dt = Math.max(8, time - (fist.lastT || time))
  const desiredX = clamp(x - fist.grabDx, m.fistR, state.w - m.fistR)
  const desiredY = clamp(y - fist.grabDy, m.fistR, state.h - m.fistR)
  fist.fingerX = x
  fist.fingerY = y
  const easedX = fist.x + (desiredX - fist.x) * 0.34
  const easedY = fist.y + (desiredY - fist.y) * 0.34
  const blocked = blockedMove(state, fist.x, fist.y, easedX, easedY)
  const nextX = blocked.x
  const nextY = blocked.y
  const stretch = Math.hypot(desiredX - nextX, desiredY - nextY)
  fist.squash = clamp(stretch / 90, 0, 0.7)
  fist.vx = (nextX - fist.x) / dt
  fist.vy = (nextY - fist.y) / dt
  fist.prevX = fist.x
  fist.prevY = fist.y
  fist.x = nextX
  fist.y = nextY
  fist.lastT = time
  fist.moved = Math.max(fist.moved, Math.hypot(x - fist.originX, y - fist.originY))
}

export function pointerUp(state, x, y, id) {
  const fist = state.fist
  if (!fist.dragging || fist.pointerId !== id || fist.phase !== 'drag') return
  const m = metrics(state)
  const desiredX = clamp(x - fist.grabDx, m.fistR, state.w - m.fistR)
  const desiredY = clamp(y - fist.grabDy, m.fistR, state.h - m.fistR)
  fist.fingerX = x
  fist.fingerY = y
  const easedX = fist.x + (desiredX - fist.x) * 0.65
  const easedY = fist.y + (desiredY - fist.y) * 0.65
  const blocked = blockedMove(state, fist.x, fist.y, easedX, easedY)
  fist.x = blocked.x
  fist.y = blocked.y
  fist.moved = Math.max(fist.moved, Math.hypot(x - fist.originX, y - fist.originY))
  fist.dragging = false
  fist.pointerId = null
  if (fist.moved < MIN_COMMIT) {
    fist.phase = 'ready'
    return
  }
  commitPunch(state, x, y)
}

function commitPunch(state, x, y) {
  const fist = state.fist
  const dragX = x - fist.originX
  const dragY = y - fist.originY
  const dragLen = Math.hypot(dragX, dragY) || 1
  const speed = Math.hypot(fist.vx, fist.vy)
  let ax
  let ay
  if (speed > 0.25) {
    ax = fist.vx
    ay = fist.vy
  } else {
    ax = dragX
    ay = dragY
  }
  const len = Math.hypot(ax, ay) || 1
  ax /= len
  ay /= len
  const m = metrics(state)
  const maxPower = Math.max(240, state.h * 0.62)
  const dragged = clamp(fist.moved * 1.15 + speed * 90, 210, maxPower)
  const ahead = distanceToFirstTarget(state, fist.x, fist.y, ax, ay, dragged)
  const follow = Math.max(88, m.fistR * 1.55)
  const travelPast = ahead == null ? dragged : Math.max(follow, Math.min(dragged, ahead + follow))
  fist.phase = 'windup'
  fist.phaseT = 0
  fist.aimX = ax
  fist.aimY = ay
  fist.commitX = fist.x
  fist.commitY = fist.y
  fist.pull = clamp(Math.max(m.fistR + 32, travelPast * 0.62), m.fistR + 32, 150)
  fist.power = Math.max(travelPast, follow)
  fist.resolved = false
  fist.plan = null
  state.events.push('windup')
}

function reachFor(state, target) {
  return 12 + target.r * 0.8
}

function distanceToFirstTarget(state, x, y, ax, ay, maxDist) {
  const endX = x + ax * maxDist
  const endY = y + ay * maxDist
  let best = null
  for (const target of currentTargets(state)) {
    const t = entryT(x, y, endX, endY, target.x, target.y, reachFor(state, target))
    if (t == null) continue
    const dist = t * maxDist
    if (best == null || dist < best) best = dist
  }
  return best
}

export function tick(state, dt) {
  const step = Math.min(Math.max(dt, 0), 0.05)
  state.time += step
  if (state.lock > 0) {
    state.lock -= step
    if (state.lock <= 0 && state.pending) {
      const next = state.pending
      state.pending = null
      enter(state, next.id, next)
    }
  }
  stepPunch(state, step)
  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - step)
  if (state.guy.giggle > 0) state.guy.giggle = Math.max(0, state.guy.giggle - step)
  if (state.guy.yell > 0) state.guy.yell = Math.max(0, state.guy.yell - step * 0.85)
  if (state.guy.squash > 0) state.guy.squash = Math.max(0, state.guy.squash - step * 1.6)
  if (state.guy.react > 0) state.guy.react = Math.max(0, state.guy.react - step * 1.05)
  if (state.shake > 0) state.shake = Math.max(0, state.shake - step * 1.7)
  if (state.mirrorWobble > 0) state.mirrorWobble = Math.max(0, state.mirrorWobble - step)
  if (state.fist.phase === 'ready' && state.fist.squash > 0) {
    state.fist.squash = Math.max(0, state.fist.squash - step * 3)
  }

  const hop = state.guy.hop
  if (hop) {
    hop.t += step
    const p = Math.min(1, hop.t / hop.dur)
    const eased = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2
    const arc = Math.sin(Math.min(1, p) * Math.PI) * (state.scene === 'dance' || state.scene === 'bike' || state.scene === 'window' ? 26 : 40)
    state.guy.x = hop.x0 + (hop.x1 - hop.x0) * eased
    state.guy.y = hop.y0 + (hop.y1 - hop.y0) * eased - arc
    if (p >= 1) {
      state.guy.x = hop.x1
      state.guy.y = hop.y1
      state.guy.hop = null
    }
  }

  state.popups = state.popups.filter((popup) => {
    popup.t += step
    return popup.t < 1.15
  })
  state.bursts = state.bursts.filter((burst) => {
    burst.t += step
    return burst.t < 0.55
  })
}

function whip(p) {
  if (p < 0.14) return (p / 0.14) ** 2 * 0.08
  const q = (p - 0.14) / 0.86
  return 0.08 + (1 - (1 - q) ** 3) * 0.92
}

function stepPunch(state, step) {
  const fist = state.fist
  if (fist.phase === 'windup') {
    fist.phaseT += step
    const p = Math.min(1, fist.phaseT / WINDUP)
    const coil = Math.min(1, p / 0.68)
    const eased = 1 - (1 - coil) ** 3
    fist.x = fist.commitX - fist.aimX * fist.pull * eased
    fist.y = fist.commitY - fist.aimY * fist.pull * eased
    fist.squash = 0.25 + eased * 0.7
    if (p >= 1) beginStrike(state)
    return
  }
  if (fist.phase === 'strike') {
    fist.phaseT += step
    const p = Math.min(1, fist.phaseT / STRIKE)
    const eased = whip(p)
    const prevX = fist.x
    const prevY = fist.y
    const nextX = fist.strikeFromX + (fist.strikeToX - fist.strikeFromX) * eased
    const nextY = fist.strikeFromY + (fist.strikeToY - fist.strikeFromY) * eased
    fist.vx = (nextX - prevX) / Math.max(step, 0.001)
    fist.vy = (nextY - prevY) / Math.max(step, 0.001)
    fist.squash = 0.45
    const hit = fist.resolved ? null : sweepHit(state, prevX, prevY, nextX, nextY)
    fist.x = nextX
    fist.y = nextY
    if (hit) {
      fist.resolved = true
      fist.x = hit.x
      fist.y = hit.y
      if (hit.blocked) blockPunch(state)
      else if (hit.target.id === 'guy' || hit.target.id === 'lump') landPunch(state)
      else bonk(state)
      return
    }
    if (p >= 1 && !fist.resolved) {
      fist.resolved = true
      miss(state)
      fist.phase = 'ready'
    }
    return
  }
  if (fist.phase === 'impact') {
    fist.phaseT += step
    const follow = Math.sin(Math.min(1, fist.phaseT / 0.24) * Math.PI)
    fist.x = fist.impactX + fist.aimX * 64 * follow
    fist.y = fist.impactY + fist.aimY * 42 * follow
    fist.squash = Math.max(0.22, 1.2 - fist.phaseT * 1.15)
    return
  }
  if (fist.phase === 'bonk') {
    fist.phaseT += step
    const p = Math.min(1, fist.phaseT / BONK_TIME)
    const eased = 1 - (1 - p) ** 3
    const bounce = Math.sin(p * Math.PI) * 18
    fist.x = fist.bonkFromX + (fist.startX - fist.bonkFromX) * eased - fist.aimX * bounce
    fist.y = fist.bonkFromY + (fist.startY - fist.bonkFromY) * eased - fist.aimY * bounce
    fist.squash = (1 - p) * 0.85
    if (p >= 1) fist.phase = 'ready'
  }
}

function beginStrike(state) {
  const fist = state.fist
  const end = rayEnd(state, fist.commitX, fist.commitY, fist.aimX, fist.aimY, fist.power)
  fist.phase = 'strike'
  fist.phaseT = 0
  fist.strikeFromX = fist.x
  fist.strikeFromY = fist.y
  fist.strikeToX = end.x
  fist.strikeToY = end.y
  state.events.push('swing')
}

function rayEnd(state, x, y, ax, ay, dist) {
  const m = metrics(state)
  let lo = 0
  let hi = dist
  for (let i = 0; i < 14; i += 1) {
    const mid = (lo + hi) / 2
    const px = x + ax * mid
    const py = y + ay * mid
    const inside = px >= m.fistR && px <= state.w - m.fistR && py >= m.fistR && py <= state.h - m.fistR
    if (inside) lo = mid
    else hi = mid
  }
  return { x: x + ax * lo, y: y + ay * lo, dist: lo }
}

function sweepHit(state, x0, y0, x1, y1) {
  const fist = state.fist
  let best = null
  for (const target of currentTargets(state)) {
    const t = entryT(x0, y0, x1, y1, target.x, target.y, reachFor(state, target))
    if (t == null) continue
    const hx = x0 + (x1 - x0) * t
    const hy = y0 + (y1 - y0) * t
    const forward = (hx - fist.strikeFromX) * fist.aimX + (hy - fist.strikeFromY) * fist.aimY
    if (forward < fist.pull * 0.45) continue
    if (!best || t < best.t) best = { target, x: hx, y: hy, forward, t }
  }
  const wall = solidAlong(state, x0, y0, x1, y1)
  if (wall != null && (best == null || wall < best.t)) {
    return {
      blocked: true,
      x: x0 + (x1 - x0) * wall,
      y: y0 + (y1 - y0) * wall,
      t: wall,
    }
  }
  return best
}

function solidAlong(state, x0, y0, x1, y1) {
  const pad = 8
  let best = null
  for (const rect of cover(state).solids) {
    if (pointInRect(x0, y0, rect, pad)) continue
    const t = segmentRectT(x0, y0, x1, y1, rect, pad)
    if (t == null) continue
    if (best == null || t < best) best = t
  }
  return best
}

function blockedMove(state, x0, y0, x1, y1) {
  if (solidAlong(state, x0, y0, x1, y1) == null && !pointHitsSolid(state, x1, y1)) return { x: x1, y: y1 }
  let lo = 0
  let hi = 1
  for (let i = 0; i < 10; i += 1) {
    const mid = (lo + hi) / 2
    const x = x0 + (x1 - x0) * mid
    const y = y0 + (y1 - y0) * mid
    if (pointHitsSolid(state, x, y)) hi = mid
    else lo = mid
  }
  return { x: x0 + (x1 - x0) * lo, y: y0 + (y1 - y0) * lo }
}

function pointHitsSolid(state, x, y) {
  return cover(state).solids.some((rect) => pointInRect(x, y, rect, 8))
}

function pointInRect(x, y, rect, pad) {
  return x >= rect.x - pad && x <= rect.x + rect.w + pad && y >= rect.y - pad && y <= rect.y + rect.h + pad
}

function segmentRectT(x0, y0, x1, y1, rect, pad) {
  const left = rect.x - pad
  const top = rect.y - pad
  const right = rect.x + rect.w + pad
  const bottom = rect.y + rect.h + pad
  const dx = x1 - x0
  const dy = y1 - y0
  let t0 = 0
  let t1 = 1
  const p = [-dx, dx, -dy, dy]
  const q = [x0 - left, right - x0, y0 - top, bottom - y0]
  for (let i = 0; i < 4; i += 1) {
    if (Math.abs(p[i]) < 1e-8) {
      if (q[i] < 0) return null
    } else {
      const r = q[i] / p[i]
      if (p[i] < 0) {
        if (r > t1) return null
        if (r > t0) t0 = r
      } else if (r < t0) return null
      else if (r < t1) t1 = r
    }
  }
  return t0
}

export function currentTargets(state) {
  const m = metrics(state)
  const visual = guyVisual(state)
  const targets = []
  if (state.scene === 'title') return targets
  if (LUMP_SCENES.has(state.scene)) {
    targets.push({ id: 'lump', x: state.guy.x, y: state.guy.y, r: m.lumpR * 0.55 })
  } else if (state.scene !== 'title') {
    targets.push({ id: 'guy', x: visual.x, y: visual.y, r: m.bubR * 0.55 })
  }
  const decoy = decoyPoint(state)
  if (decoy) targets.push(decoy)
  return targets
}

function landPunch(state) {
  const fist = state.fist
  const visual = guyVisual(state)
  fist.phase = 'impact'
  fist.phaseT = 0
  fist.impactX = fist.x
  fist.impactY = fist.y
  fist.squash = 1
  state.guy.squash = 1
  state.guy.react = 1
  state.guy.giggle = 0
  state.guy.yell = 1.15
  state.guy.spin = fist.aimX >= 0 ? 1 : -1
  state.guy.knockX = fist.aimX * 78
  state.guy.knockY = fist.aimY * 46
  state.shake = 1
  state.lock = IMPACT_HOLD
  state.pending = peekNext(state)
  const labelY = (LUMP_SCENES.has(state.scene) ? state.guy.y : visual.y) - metrics(state).bubR - 36
  pushPopup(state, 'Ah!', visual.x, labelY, 'ah')
  state.bursts.push(
    { x: visual.x, y: visual.y, t: 0 },
    { x: visual.x - 16, y: visual.y - 10, t: 0 },
    { x: visual.x + 14, y: visual.y + 6, t: 0 },
  )
  state.events.push('ah')
}

function blockPunch(state) {
  const fist = state.fist
  fist.phase = 'bonk'
  fist.phaseT = 0
  fist.bonkFromX = fist.x
  fist.bonkFromY = fist.y
  fist.squash = 1
  miss(state)
}

function bonk(state) {
  const fist = state.fist
  const decoy = decoyPoint(state)
  fist.phase = 'bonk'
  fist.phaseT = 0
  fist.bonkFromX = fist.x
  fist.bonkFromY = fist.y
  fist.squash = 1
  state.cooldown = 0.2
  if (state.scene === 'mirror') state.mirrorWobble = 0.5
  const x = decoy ? decoy.x : fist.x
  const y = decoy ? decoy.y - 30 : fist.y - 30
  pushPopup(state, 'bonk!', x, y, 'bonk')
  state.events.push('bonk')
}

function miss(state) {
  if (state.guy.hop) return
  const dest = hopDestination(state)
  state.guy.giggle = 0.95
  state.guy.yell = 0
  state.cooldown = 0.28
  state.guy.hop = {
    t: 0,
    dur: 0.42,
    x0: state.guy.x,
    y0: state.guy.y,
    x1: dest.x,
    y1: dest.y,
  }
  pushPopup(state, 'hee hee!', state.guy.x, state.guy.y - metrics(state).bubR - 28, 'giggle')
  state.events.push('giggle')
}

function hopDestination(state) {
  const arena = state.arena
  const tight = state.scene === 'dance' || state.scene === 'bike' || state.scene === 'window'
  const minDist = tight ? 20 : 34
  const maxDist = tight ? 48 : 100
  let best = { x: state.guy.x, y: state.guy.y, d: 0 }
  const angles = []
  for (let i = 0; i < 10; i += 1) angles.push(Math.random() * Math.PI * 2)
  for (let i = 0; i < 8; i += 1) angles.push((i / 8) * Math.PI * 2)
  for (const angle of angles) {
    const dist = minDist + Math.random() * (maxDist - minDist)
    const x = clamp(state.guy.x + Math.cos(angle) * dist, arena.minX, arena.maxX)
    const y = clamp(state.guy.y + Math.sin(angle) * dist, arena.minY, arena.maxY)
    const d = Math.hypot(x - state.guy.x, y - state.guy.y)
    if (d >= minDist * 0.7) return { x, y }
    if (d > best.d) best = { x, y, d }
  }
  return best
}

function peekNext(state) {
  const set = state.sets[state.setIndex]
  if (state.scenePos < set.length - 1) {
    return {
      setIndex: state.setIndex,
      scenePos: state.scenePos + 1,
      id: set[state.scenePos + 1],
    }
  }
  let { sets } = state
  const setIndex = state.setIndex + 1
  if (setIndex >= sets.length) {
    sets = sets.concat(reshuffleSets(set))
    state.sets = sets
  }
  return { setIndex, scenePos: 0, id: sets[setIndex][0] }
}

function pushPopup(state, text, x, y, kind) {
  state.popups.push({ text, x, y, kind, t: 0 })
  if (state.popups.length > 4) state.popups.shift()
}

export function sweptCircle(x0, y0, x1, y1, cx, cy, reach) {
  return entryT(x0, y0, x1, y1, cx, cy, reach) != null
}

function entryT(x0, y0, x1, y1, cx, cy, reach) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(x0 - cx, y0 - cy) <= reach ? 0 : null
  const fx = x0 - cx
  const fy = y0 - cy
  const b = 2 * (fx * dx + fy * dy)
  const c = fx * fx + fy * fy - reach * reach
  const disc = b * b - 4 * len2 * c
  if (disc < 0) return null
  const root = Math.sqrt(disc)
  const t1 = (-b - root) / (2 * len2)
  const t2 = (-b + root) / (2 * len2)
  if (t1 >= 0 && t1 <= 1) return t1
  if (t1 < 0 && t2 >= 0) return 0
  if (t2 >= 0 && t2 <= 1) return t2
  return null
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
