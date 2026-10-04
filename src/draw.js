import { bedGeom, guyVisual, metrics, mirrorGeom, reflectionPoint, topInset } from './logic.js'

const INK = '#3b2a24'
const SKIN = '#ffc89a'
const SKIN_SHADOW = '#f0a56a'
const BLUSH = '#ff9eb5'
const HAIR = '#6b4428'

export function draw(ctx, state) {
  const { w, h } = state
  ctx.clearRect(0, 0, w, h)
  if (state.scene === 'mirror') drawMirrorRoom(ctx, state)
  else if (state.scene === 'bed' || state.scene === 'win') drawBedroom(ctx, state)
  else drawDanceRoom(ctx, state)

  if (state.scene === 'mirror') drawReflection(ctx, state)

  if (state.scene === 'bed') drawLump(ctx, state)
  else if (state.scene === 'win') drawCheer(ctx, state)
  else drawGuy(ctx, state, guyVisual(state), { flip: false, tint: null })

  if (state.scene === 'win') drawConfetti(ctx, state)
  drawFist(ctx, state)
  drawPopups(ctx, state)
}

function drawDanceRoom(ctx, state) {
  const { w, h } = state
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#bfe6ff')
  sky.addColorStop(0.42, '#ffd4ef')
  sky.addColorStop(0.42, '#f3b56a')
  sky.addColorStop(1, '#e09245')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const spot = ctx.createRadialGradient(w * 0.5, h * 0.46, 10, w * 0.5, h * 0.46, w * 0.48)
  spot.addColorStop(0, 'rgba(255,255,255,0.62)')
  spot.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = spot
  ctx.fillRect(0, 0, w, h * 0.5)

  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(16, h * 0.42)
  ctx.lineTo(w - 16, h * 0.42)
  ctx.stroke()

  drawStringLights(ctx, state)
  drawNotes(ctx, state)
}

function drawStringLights(ctx, state) {
  const { w } = state
  const y = Math.max(86, topInset(state) - 28)
  ctx.strokeStyle = '#3b2a24'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = 0; x <= w; x += 6) {
    const hang = Math.sin(x * 0.05) * 5
    if (x === 0) ctx.moveTo(x, y + hang)
    else ctx.lineTo(x, y + hang)
  }
  ctx.stroke()
  const colors = ['#ff7a59', '#ffd15c', '#7dce7a', '#8ec8ff', '#ff9eb5']
  for (let i = 0; i < 8; i += 1) {
    const x = 28 + i * ((w - 56) / 7)
    const hang = Math.sin(x * 0.05) * 5
    ctx.fillStyle = colors[i % colors.length]
    circle(ctx, x, y + hang + 8, 5)
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawNotes(ctx, state) {
  ctx.fillStyle = 'rgba(59, 42, 36, 0.55)'
  ctx.font = '700 22px "Trebuchet MS", Verdana, sans-serif'
  const notes = ['♪', '♫', '♩']
  for (let i = 0; i < 4; i += 1) {
    const x = state.w * (0.16 + i * 0.22) + Math.sin(state.time * 1.4 + i) * 8
    const y = state.h * 0.28 + Math.cos(state.time * 1.7 + i) * 10
    ctx.fillText(notes[i % notes.length], x, y)
  }
}

function drawMirrorRoom(ctx, state) {
  const { w, h } = state
  const wall = ctx.createLinearGradient(0, 0, 0, h)
  wall.addColorStop(0, '#e5f6ff')
  wall.addColorStop(0.72, '#f7fbff')
  wall.addColorStop(0.72, '#e6c8a4')
  wall.addColorStop(1, '#d2ad86')
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#f2d7b6'
  ellipse(ctx, w * 0.24, h * 0.7, w * 0.16, 16)
  ctx.fill()

  const mirror = mirrorGeom(state)
  const wobble = Math.sin(state.time * 34) * state.mirrorWobble * 0.05
  ctx.save()
  ctx.translate(mirror.frame.x + mirror.frame.w / 2, mirror.frame.y + mirror.frame.h / 2)
  ctx.rotate(wobble)
  ctx.translate(-(mirror.frame.x + mirror.frame.w / 2), -(mirror.frame.y + mirror.frame.h / 2))

  roundRect(ctx, mirror.frame.x, mirror.frame.y, mirror.frame.w, mirror.frame.h, 28)
  ctx.fillStyle = '#f4f7fb'
  ctx.fill()
  ctx.lineWidth = 10
  ctx.strokeStyle = '#c5d0dc'
  ctx.stroke()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  const glass = ctx.createLinearGradient(mirror.glass.x, mirror.glass.y, mirror.glass.x + mirror.glass.w, mirror.glass.y)
  glass.addColorStop(0, '#d7f0ff')
  glass.addColorStop(0.5, '#f4fbff')
  glass.addColorStop(1, '#c5e6fb')
  roundRect(ctx, mirror.glass.x, mirror.glass.y, mirror.glass.w, mirror.glass.h, 18)
  ctx.fillStyle = glass
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mirror.glass.x + 18, mirror.glass.y + 24)
  ctx.lineTo(mirror.glass.x + 18, mirror.glass.y + mirror.glass.h * 0.55)
  ctx.stroke()
  ctx.restore()
}

function drawReflection(ctx, state) {
  const mirror = mirrorGeom(state)
  const point = reflectionPoint(state)
  ctx.save()
  roundRect(ctx, mirror.glass.x, mirror.glass.y, mirror.glass.w, mirror.glass.h, 18)
  ctx.clip()
  drawGuy(ctx, state, point, { flip: true, tint: 'rgba(90, 150, 210, 0.28)', ghost: true })
  ctx.fillStyle = 'rgba(170, 214, 245, 0.18)'
  ctx.fillRect(mirror.glass.x, mirror.glass.y, mirror.glass.w, mirror.glass.h)
  ctx.restore()
}

function drawBedroom(ctx, state) {
  const { w, h } = state
  const wall = ctx.createLinearGradient(0, 0, 0, h)
  wall.addColorStop(0, '#f8dcc8')
  wall.addColorStop(0.62, '#f3c9b0')
  wall.addColorStop(0.62, '#e7b489')
  wall.addColorStop(1, '#d59a6e')
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, w, h)

  drawWindow(ctx, state)
  drawLamp(ctx, state)
  drawBed(ctx, state)
}

function drawWindow(ctx, state) {
  const { w } = state
  const x = w * 0.08
  const y = topInset(state) + 6
  roundRect(ctx, x, y, 86, 70, 12)
  ctx.fillStyle = '#c9d4f5'
  ctx.fill()
  ctx.lineWidth = 6
  ctx.strokeStyle = '#f7efe4'
  ctx.stroke()
  ctx.strokeStyle = '#f7efe4'
  ctx.beginPath()
  ctx.moveTo(x + 43, y)
  ctx.lineTo(x + 43, y + 70)
  ctx.moveTo(x, y + 35)
  ctx.lineTo(x + 86, y + 35)
  ctx.stroke()
  ctx.fillStyle = '#ffe7a3'
  circle(ctx, x + 28, y + 24, 10)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x + 26, y + 24, 4, 0.2, Math.PI - 0.2)
  ctx.stroke()
}

function drawLamp(ctx, state) {
  const x = state.w * 0.84
  const y = 150
  const glow = ctx.createRadialGradient(x, y + 20, 4, x, y + 20, 90)
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.55)')
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - 90, y - 40, 180, 180)
  roundRect(ctx, x - 22, y, 44, 22, 8)
  ctx.fillStyle = '#ffd56a'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = INK
  ctx.beginPath()
  ctx.moveTo(x, y + 22)
  ctx.lineTo(x, y + 58)
  ctx.stroke()
  roundRect(ctx, x - 16, y + 58, 32, 8, 3)
  ctx.fillStyle = '#c98443'
  ctx.fill()
}

function drawBed(ctx, state) {
  const bed = bedGeom(state)
  roundRect(ctx, bed.frame.x, bed.frame.y, bed.frame.w, bed.frame.h, 22)
  ctx.fillStyle = '#d08a45'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  roundRect(ctx, bed.frame.x + 8, bed.frame.y - 28, 22, 46, 8)
  ctx.fillStyle = '#c47b38'
  ctx.fill()
  ctx.stroke()

  roundRect(ctx, bed.mattress.x, bed.mattress.y, bed.mattress.w, bed.mattress.h, 16)
  ctx.fillStyle = '#fff6ea'
  ctx.fill()
  ctx.stroke()

  const pillow = {
    x: bed.mattress.x + 16,
    y: bed.mattress.y + 8,
    w: bed.mattress.w * 0.42,
    h: bed.mattress.h * 0.28,
  }
  roundRect(ctx, pillow.x, pillow.y, pillow.w, pillow.h, 12)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.stroke()

  roundRect(ctx, bed.blanket.x, bed.blanket.y, bed.blanket.w, bed.blanket.h, 18)
  ctx.fillStyle = '#6f97e4'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 3
  ctx.beginPath()
  const foldY = bed.blanket.y + 16
  ctx.moveTo(bed.blanket.x + 16, foldY)
  ctx.quadraticCurveTo(
    bed.blanket.x + bed.blanket.w * 0.5,
    foldY + 10,
    bed.blanket.x + bed.blanket.w - 16,
    foldY,
  )
  ctx.stroke()
}

function drawLump(ctx, state) {
  const m = metrics(state)
  const x = state.guy.x
  const y = state.guy.y
  const giggle = state.guy.giggle > 0
  ctx.save()
  ctx.translate(x, y)
  if (giggle) ctx.rotate(Math.sin(state.time * 28) * 0.08)
  const squash = state.guy.squash
  ctx.scale(1 + squash * 0.18, 1 - squash * 0.22)
  ellipse(ctx, 0, 4, m.lumpR * 1.45, m.lumpR * 1.05)
  ctx.fillStyle = '#9ec0ff'
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = INK
  ctx.stroke()
  ellipse(ctx, -m.lumpR * 0.25, -m.lumpR * 0.2, m.lumpR * 0.4, m.lumpR * 0.22)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()
  drawHair(ctx, 0, -m.lumpR * 0.95, m.lumpR * 0.55)
  ctx.restore()
}

function drawCheer(ctx, state) {
  const bed = bedGeom(state)
  const visual = {
    x: state.guy.x,
    y: bed.blanket.y - metrics(state).bubR * 0.15 + Math.sin(state.winT * 8) * 6,
  }
  drawGuy(ctx, state, visual, { flip: false, tint: null, cheer: true })
}

function drawGuy(ctx, state, point, options) {
  const m = metrics(state)
  const dancing = (state.scene === 'dance' || state.scene === 'title') && !options.ghost
  const beat = state.time * 7
  const arm = dancing ? Math.sin(beat) : options.cheer ? -1 : Math.sin(state.time * 2) * 0.25
  const sway = dancing ? Math.sin(state.time * 3) * 0.08 : 0
  const squash = options.ghost ? 0 : state.guy.squash
  const giggle = state.guy.giggle > 0 && !options.ghost

  ctx.save()
  ctx.translate(point.x, point.y)
  ctx.rotate(sway + (giggle ? Math.sin(state.time * 26) * 0.06 : 0))
  ctx.scale(options.flip ? -1 : 1, 1)
  ctx.scale(1 + squash * 0.22, 1 - squash * 0.32)

  ctx.fillStyle = 'rgba(59, 42, 36, 0.13)'
  ellipse(ctx, 0, m.bubR * 0.95, m.bubR * 0.7, m.bubR * 0.18)
  ctx.fill()

  const foot = dancing ? Math.sin(beat) * 4 : 0
  drawFoot(ctx, -m.bubR * 0.32, m.bubR * 0.78, foot)
  drawFoot(ctx, m.bubR * 0.28, m.bubR * 0.78, -foot)

  const swing = dancing ? arm : Math.sin(state.time * 2) * 0.35
  drawArm(ctx, -1, swing, m.bubR, Boolean(options.cheer))
  drawArm(ctx, 1, swing, m.bubR, Boolean(options.cheer))

  circle(ctx, 0, 0, m.bubR)
  ctx.fillStyle = SKIN
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  ellipse(ctx, 0, m.bubR * 0.18, m.bubR * 0.38, m.bubR * 0.28)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fill()

  drawHair(ctx, 0, -m.bubR * 0.92, m.bubR * 0.34)

  ctx.fillStyle = BLUSH
  circle(ctx, -m.bubR * 0.42, m.bubR * 0.12, m.bubR * 0.14)
  ctx.fill()
  circle(ctx, m.bubR * 0.42, m.bubR * 0.12, m.bubR * 0.14)
  ctx.fill()

  const eyeY = -m.bubR * 0.12
  const look = state.scene === 'mirror' && !options.ghost ? 3 : 0
  drawEye(ctx, -m.bubR * 0.24 + look, eyeY, m.bubR, giggle)
  drawEye(ctx, m.bubR * 0.24 + look, eyeY, m.bubR, giggle)

  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (giggle || options.cheer) {
    ctx.arc(0, m.bubR * 0.18, m.bubR * 0.28, 0.15, Math.PI - 0.15)
  } else {
    ctx.arc(0, m.bubR * 0.16, m.bubR * 0.22, 0.25, Math.PI - 0.25)
  }
  ctx.stroke()

  ctx.fillStyle = '#53b6c9'
  circle(ctx, m.bubR * 0.34, -m.bubR * 0.46, m.bubR * 0.1)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.stroke()

  if (options.tint) {
    circle(ctx, 0, 0, m.bubR)
    ctx.fillStyle = options.tint
    ctx.fill()
  }
  ctx.restore()
}

function drawHair(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.4)
  ellipse(ctx, 0, 0, r, r * 0.72)
  ctx.fillStyle = HAIR
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.restore()
}

function drawEye(ctx, x, y, r, giggle) {
  if (giggle) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, r * 0.12, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
    return
  }
  circle(ctx, x, y, r * 0.11)
  ctx.fillStyle = INK
  ctx.fill()
  circle(ctx, x + r * 0.03, y - r * 0.03, r * 0.035)
  ctx.fillStyle = '#fff'
  ctx.fill()
}

function drawFoot(ctx, x, y, lift) {
  ellipse(ctx, x, y - lift, 10, 6)
  ctx.fillStyle = SKIN_SHADOW
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.stroke()
}

function drawArm(ctx, side, swing, r, up) {
  const shoulderX = side * r * 0.5
  const shoulderY = r * 0.08
  const handX = up ? shoulderX + side * r * 0.16 : shoulderX + side * (r * 0.34 + swing * r * 0.22)
  const handY = up ? shoulderY - r * 0.7 : shoulderY - r * 0.34 + swing * side * r * 0.28
  const thickness = r * 0.34
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(shoulderX, shoulderY)
  ctx.lineTo(handX, handY)
  ctx.strokeStyle = INK
  ctx.lineWidth = thickness + 6
  ctx.stroke()
  ctx.strokeStyle = SKIN
  ctx.lineWidth = thickness
  ctx.stroke()
  circle(ctx, handX, handY, thickness * 0.55)
  ctx.fillStyle = SKIN
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.stroke()
}

function drawFist(ctx, state) {
  const m = metrics(state)
  const fist = state.fist
  const speed = Math.hypot(fist.vx, fist.vy)
  let angle = -0.6
  if (fist.dragging && speed > 0.05) angle = Math.atan2(fist.vy, fist.vx)
  const squash = fist.squash

  ctx.save()
  ctx.translate(fist.x, fist.y)
  ctx.rotate(angle)
  ctx.scale(1 + squash * 0.16, 1 - squash * 0.2)

  ctx.fillStyle = 'rgba(59, 42, 36, 0.16)'
  ellipse(ctx, 8, m.fistR * 0.75, m.fistR * 0.72, m.fistR * 0.22)
  ctx.fill()

  if (!fist.dragging && !state.seenDrag && state.scene !== 'title' && state.scene !== 'win') {
    ctx.strokeStyle = 'rgba(255, 122, 89, 0.9)'
    ctx.lineWidth = 4
    ctx.setLineDash([8, 8])
    circle(ctx, 0, 0, m.fistR + 10 + Math.sin(state.time * 5) * 3)
    ctx.stroke()
    ctx.setLineDash([])
  }

  if (fist.dragging && speed > 0.4) {
    ctx.strokeStyle = 'rgba(59, 42, 36, 0.35)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-m.fistR - 8, -10)
    ctx.lineTo(-m.fistR - 26, -16)
    ctx.moveTo(-m.fistR - 6, 8)
    ctx.lineTo(-m.fistR - 24, 14)
    ctx.stroke()
  }

  circle(ctx, m.fistR * 0.08, 0, m.fistR)
  ctx.fillStyle = SKIN
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = INK
  ctx.stroke()

  circle(ctx, -m.fistR * 0.72, -m.fistR * 0.05, m.fistR * 0.42)
  ctx.fillStyle = SKIN
  ctx.fill()
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.strokeStyle = SKIN_SHADOW
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i += 1) {
    const y = -m.fistR * 0.28 + i * m.fistR * 0.28
    ctx.beginPath()
    ctx.moveTo(m.fistR * 0.15, y)
    ctx.quadraticCurveTo(m.fistR * 0.45, y - 6, m.fistR * 0.7, y + 2)
    ctx.stroke()
  }

  ellipse(ctx, m.fistR * 0.15, -m.fistR * 0.35, m.fistR * 0.28, m.fistR * 0.16)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()
  ctx.restore()
}

function drawPopups(ctx, state) {
  ctx.font = '800 34px "Trebuchet MS", Verdana, sans-serif'
  ctx.textAlign = 'center'
  ctx.lineJoin = 'round'
  for (const popup of state.popups) {
    const rise = popup.t * 36
    const alpha = 1 - popup.t
    ctx.save()
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.translate(popup.x, popup.y - rise)
    ctx.lineWidth = 6
    ctx.strokeStyle = INK
    ctx.fillStyle = popup.kind === 'bonk' ? '#4aa3df' : popup.kind === 'giggle' ? '#e45d9a' : '#ff7a59'
    ctx.strokeText(popup.text, 0, 0)
    ctx.fillText(popup.text, 0, 0)
    ctx.restore()
  }
}

function drawConfetti(ctx, state) {
  for (const bit of state.confetti) {
    const t = (state.winT * bit.speed + bit.x) % 1
    const x = bit.x * state.w + Math.sin(state.winT * 3 + bit.x * 8) * 16
    const y = -20 + t * (state.h + 30)
    ctx.fillStyle = bit.color
    roundRect(ctx, x, y, bit.size + 3, bit.size * 1.6, 3)
    ctx.fill()
  }
}

function circle(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2)
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
