const PUNCH_TRAVEL = 28
const SWING_SPEED = 0.35

const SCENE_ORDER = ['dance', 'mirror', 'bed', 'win']

export function createState(w, h) {
  const state = {
    w,
    h,
    scene: 'title',
    time: 0,
    winT: 0,
    lock: 0,
    cooldown: 0,
    pendingScene: null,
    mirrorWobble: 0,
    seenDrag: false,
    events: [],
    popups: [],
    confetti: [],
    guy: {
      x: 0,
      y: 0,
      hop: null,
      giggle: 0,
      squash: 0,
    },
    fist: {
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
    },
    arena: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  }
  placeForScene(state)
  return state
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
  let y = state.guy.y
  const dancing = state.scene === 'dance' || state.scene === 'title'
  if (dancing && !state.guy.hop) {
    y -= Math.abs(Math.sin(state.time * 7)) * 8
  }
  return { x: state.guy.x, y }
}

export function reflectionPoint(state) {
  const mirror = mirrorGeom(state)
  const visual = guyVisual(state)
  return {
    x: 2 * mirror.planeX - state.guy.x,
    y: visual.y,
  }
}

function arenaFor(state) {
  const { w, h } = state
  const m = metrics(state)
  if (state.scene === 'title' || state.scene === 'dance') {
    const cx = w * 0.5
    const cy = state.scene === 'title' ? h * 0.64 : h * 0.48
    return {
      minX: cx - 62,
      maxX: cx + 62,
      minY: cy - 26,
      maxY: cy + 26,
    }
  }
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
  const bed = bedGeom(state)
  const rad = m.lumpR
  return {
    minX: bed.blanket.x + rad * 0.85,
    maxX: bed.blanket.x + bed.blanket.w - rad * 0.85,
    minY: bed.blanket.y + rad * 0.45,
    maxY: bed.blanket.y + bed.blanket.h - rad * 0.35,
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
  } else if (state.scene === 'dance') {
    state.guy.x = w * 0.5
    state.guy.y = h * 0.48
  } else {
    state.guy.x = (arena.minX + arena.maxX) / 2
    state.guy.y = (arena.minY + arena.maxY) / 2
  }
  state.guy.hop = null
  const homeX = state.scene === 'mirror' ? state.guy.x : w * 0.5
  state.fist.x = clamp(homeX, m.fistR + 4, w - m.fistR - 4)
  state.fist.y = clamp(h * 0.86, m.fistR + 4, h - m.fistR - 8)
  state.fist.vx = 0
  state.fist.vy = 0
  state.fist.prevX = state.fist.x
  state.fist.prevY = state.fist.y
  state.fist.dragging = false
  state.fist.gestureResolved = false
  state.fist.pointerId = null
  state.fist.squash = 0
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

export function startGame(state) {
  if (state.scene !== 'title' && state.scene !== 'win') return
  enter(state, 'dance')
}

export function enter(state, scene) {
  state.scene = scene
  state.guy.giggle = 0
  state.guy.squash = 0
  state.guy.hop = null
  state.lock = 0
  state.cooldown = 0
  state.pendingScene = null
  state.mirrorWobble = 0
  state.winT = 0
  state.fist.dragging = false
  state.fist.gestureResolved = false
  state.fist.pointerId = null
  placeForScene(state)
  if (scene === 'win') {
    state.confetti = makeConfetti()
    state.events.push('win')
  } else {
    state.confetti = []
    state.events.push('scene')
  }
}

export function hintFor(scene) {
  switch (scene) {
    case 'title':
      return 'Drag the big fist with your finger.'
    case 'dance':
      return 'He dances in place. Drag the fist to punch him.'
    case 'mirror':
      return 'Punch the real guy, not his reflection.'
    case 'bed':
      return 'He is a lump under the blanket. Punch the lump.'
    case 'win':
      return 'Three rounds. You did it!'
    default:
      return ''
  }
}

export function pointerDown(state, x, y, id, time) {
  if (state.lock > 0) return false
  if (state.scene === 'title' || state.scene === 'win') return false
  const m = metrics(state)
  const dx = x - state.fist.x
  const dy = y - state.fist.y
  const reach = m.fistR + 22
  if (dx * dx + dy * dy > reach * reach) return false
  const fist = state.fist
  fist.dragging = true
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
  fist.gestureResolved = false
  fist.vx = 0
  fist.vy = 0
  fist.lastT = time
  state.seenDrag = true
  return true
}

export function pointerMove(state, x, y, id, time) {
  const fist = state.fist
  if (!fist.dragging || fist.pointerId !== id) return
  const m = metrics(state)
  const dt = Math.max(8, time - (fist.lastT || time))
  const nextX = clamp(x - fist.grabDx, m.fistR, state.w - m.fistR)
  const nextY = clamp(y - fist.grabDy, m.fistR, state.h - m.fistR)
  fist.vx = (nextX - fist.x) / dt
  fist.vy = (nextY - fist.y) / dt
  fist.prevX = fist.x
  fist.prevY = fist.y
  fist.x = nextX
  fist.y = nextY
  fist.lastT = time
  fist.moved = Math.max(fist.moved, Math.hypot(x - fist.originX, y - fist.originY))
  tryPunch(state, true)
}

export function pointerUp(state, x, y, id) {
  const fist = state.fist
  if (!fist.dragging || fist.pointerId !== id) return
  const m = metrics(state)
  fist.prevX = fist.x
  fist.prevY = fist.y
  fist.x = clamp(x - fist.grabDx, m.fistR, state.w - m.fistR)
  fist.y = clamp(y - fist.grabDy, m.fistR, state.h - m.fistR)
  fist.moved = Math.max(fist.moved, Math.hypot(x - fist.originX, y - fist.originY))
  fist.dragging = false
  fist.pointerId = null
  tryPunch(state, false)
}

export function tick(state, dt) {
  const step = Math.min(Math.max(dt, 0), 0.05)
  state.time += step
  if (state.scene === 'win') state.winT += step
  if (state.lock > 0) {
    state.lock -= step
    if (state.lock <= 0 && state.pendingScene) {
      const next = state.pendingScene
      state.pendingScene = null
      enter(state, next)
    }
  }
  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - step)
  if (state.guy.giggle > 0) state.guy.giggle = Math.max(0, state.guy.giggle - step)
  if (state.guy.squash > 0) state.guy.squash = Math.max(0, state.guy.squash - step * 2.4)
  if (state.fist.squash > 0) state.fist.squash = Math.max(0, state.fist.squash - step * 3)
  if (state.mirrorWobble > 0) state.mirrorWobble = Math.max(0, state.mirrorWobble - step)

  const hop = state.guy.hop
  if (hop) {
    hop.t += step
    const p = Math.min(1, hop.t / hop.dur)
    const eased = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2
    const arc = Math.sin(Math.min(1, p) * Math.PI) * (state.scene === 'dance' ? 28 : 40)
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
}

export function currentTargets(state) {
  const m = metrics(state)
  const visual = guyVisual(state)
  if (state.scene === 'dance') {
    return [{ id: 'guy', x: visual.x, y: visual.y, r: m.bubR }]
  }
  if (state.scene === 'mirror') {
    const reflection = reflectionPoint(state)
    return [
      { id: 'guy', x: visual.x, y: visual.y, r: m.bubR },
      { id: 'reflection', x: reflection.x, y: reflection.y, r: m.bubR * 0.96 },
    ]
  }
  if (state.scene === 'bed') {
    return [{ id: 'lump', x: state.guy.x, y: state.guy.y, r: m.lumpR }]
  }
  return []
}

function tryPunch(state, fromMove) {
  const fist = state.fist
  if (fist.gestureResolved || state.lock > 0 || state.cooldown > 0) return
  if (fist.moved < PUNCH_TRAVEL) return
  const speed = Math.hypot(fist.vx, fist.vy)
  if (fromMove && speed < SWING_SPEED) return
  const hit = overlappingTarget(state)
  if (!hit) {
    if (!fromMove) {
      fist.gestureResolved = true
      miss(state)
    }
    return
  }
  fist.gestureResolved = true
  if (hit.id === 'reflection') bonk(state)
  else landPunch(state)
}

function overlappingTarget(state) {
  const m = metrics(state)
  const targets = currentTargets(state)
  let reflection = null
  for (const target of targets) {
    const reach = (m.fistR + target.r) * 0.92
    const hit = sweptCircle(
      state.fist.prevX,
      state.fist.prevY,
      state.fist.x,
      state.fist.y,
      target.x,
      target.y,
      reach,
    )
    if (!hit) continue
    if (target.id === 'reflection') reflection = target
    else return target
  }
  return reflection
}

function releaseFist(state) {
  state.fist.dragging = false
  state.fist.pointerId = null
}

function landPunch(state) {
  state.guy.squash = 1
  state.fist.squash = 1
  state.lock = 0.55
  state.pendingScene = nextScene(state.scene)
  releaseFist(state)
  pushPopup(state, 'boop!', state.guy.x, state.guy.y - metrics(state).bubR - 28, 'boop')
  state.events.push('boop')
}

function bonk(state) {
  const reflection = reflectionPoint(state)
  state.mirrorWobble = 0.45
  state.cooldown = 0.25
  state.fist.squash = 1
  state.fist.x = state.fist.startX
  state.fist.y = state.fist.startY
  releaseFist(state)
  pushPopup(state, 'bonk!', reflection.x, reflection.y - metrics(state).bubR - 24, 'bonk')
  state.events.push('bonk')
}

function miss(state) {
  if (state.guy.hop) return
  const dest = hopDestination(state)
  state.guy.giggle = 0.9
  state.cooldown = 0.3
  state.guy.hop = {
    t: 0,
    dur: 0.42,
    x0: state.guy.x,
    y0: state.guy.y,
    x1: dest.x,
    y1: dest.y,
  }
  pushPopup(state, 'hee hee!', state.guy.x, state.guy.y - metrics(state).bubR - 24, 'giggle')
  state.events.push('giggle')
}

function hopDestination(state) {
  const arena = state.arena
  const minDist = state.scene === 'dance' ? 22 : 34
  const maxDist = state.scene === 'dance' ? 50 : 100
  let best = { x: state.guy.x, y: state.guy.y, d: 0 }
  const angles = []
  for (let i = 0; i < 10; i += 1) angles.push(Math.random() * Math.PI * 2)
  for (let i = 0; i < 8; i += 1) angles.push((i / 8) * Math.PI * 2)
  for (const angle of angles) {
    const dist = minDist + Math.random() * (maxDist - minDist)
    const x = clamp(state.guy.x + Math.cos(angle) * dist, arena.minX, arena.maxX)
    const y = clamp(state.guy.y + Math.sin(angle) * dist, arena.minY, arena.maxY)
    const d = Math.hypot(x - state.guy.x, y - state.guy.y)
    if (d >= minDist * 0.75) return { x, y }
    if (d > best.d) best = { x, y, d }
  }
  return best
}

function nextScene(scene) {
  const index = SCENE_ORDER.indexOf(scene)
  if (index < 0 || index >= SCENE_ORDER.length - 1) return null
  return SCENE_ORDER[index + 1]
}

function pushPopup(state, text, x, y, kind) {
  state.popups.push({ text, x, y, kind, t: 0 })
  if (state.popups.length > 4) state.popups.shift()
}

function makeConfetti() {
  const colors = ['#ff7a59', '#ffd15c', '#6ec8ff', '#ff9eb5', '#7dce7a']
  return Array.from({ length: 26 }, (_, index) => ({
    x: Math.random(),
    drift: (index % 2 === 0 ? -1 : 1) * (0.04 + Math.random() * 0.08),
    speed: 0.22 + Math.random() * 0.4,
    size: 5 + (index % 4),
    color: colors[index % colors.length],
  }))
}

export function sweptCircle(x0, y0, x1, y1, cx, cy, reach) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy
  let t = 0
  if (len2 > 0) {
    t = ((cx - x0) * dx + (cy - y0) * dy) / len2
    t = clamp(t, 0, 1)
  }
  const px = x0 + dx * t
  const py = y0 + dy * t
  const ex = px - cx
  const ey = py - cy
  return ex * ex + ey * ey <= reach * reach
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
