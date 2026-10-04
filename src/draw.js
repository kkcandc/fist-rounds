import { bedGeom, cover, guyVisual, metrics, mirrorGeom, reflectionPoint, topInset } from './logic.js'
import { drawBackdrop, drawDecoyProp, drawForeground } from './rooms.js'
import { LUMP_SCENES, SCENES } from './scenes.js'
import { cabinet, drawDollhouse, frontWall, houseBox, jamb, miniLamp, rug } from './scenery.js'

const INK = '#3b2a24'
const SKIN = '#ffc89a'
const SKIN_SHADOW = '#f0a56a'
const BLUSH = '#ff9eb5'
const HAIR = '#6b4428'

export function draw(ctx, state) {
  const { w, h } = state
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  if (state.shake > 0) {
    const amp = state.shake * 8
    ctx.translate(Math.sin(state.time * 70) * amp, Math.cos(state.time * 63) * amp)
  }
  if (state.scene === 'mirror') drawMirrorRoom(ctx, state)
  else if (state.scene === 'bed') drawBedroom(ctx, state)
  else if (state.scene === 'dance' || state.scene === 'title') drawDanceRoom(ctx, state)
  else drawBackdrop(ctx, state)

  if (state.scene === 'mirror') drawReflection(ctx, state)
  drawDecoyProp(ctx, state)

  const pose = SCENES[state.scene]?.pose || 'stand'
  if (LUMP_SCENES.has(state.scene)) {
    drawLump(ctx, state, lumpColor(state))
    if (state.guy.react > 0.05) {
      drawGuy(ctx, state, guyVisual(state), { flip: false, pose: 'cheer' })
    }
  } else if (state.scene !== 'mirror') {
    drawGuy(ctx, state, guyVisual(state), { flip: false, pose })
    if (pose === 'bubble') drawBubble(ctx, guyVisual(state), metrics(state).bubR)
  } else {
    drawGuy(ctx, state, guyVisual(state), { flip: false, pose: 'stand' })
  }

  drawForeground(ctx, state)
  drawSlot(ctx, state)
  drawBursts(ctx, state)
  drawFist(ctx, state)
  drawPopups(ctx, state)
  ctx.restore()
}

function lumpColor(state) {
  if (state.scene === 'laundry') return ['#ffb3c7', '#ffe08a', '#b7e38d'][state.look % 3]
  if (state.scene === 'picnic') return state.look % 2 === 0 ? '#ff8b7b' : '#f2d15a'
  if (state.scene === 'hammock') return '#8eb4f2'
  return '#9ec0ff'
}

function drawBubble(ctx, point, radius) {
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius * 2.15, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.strokeStyle = 'rgba(120, 190, 230, 0.8)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawDanceRoom(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#8d5a32',
    floorLight: '#d7a36a',
    wallLight: '#fbf6ee',
    wall: '#f0e4d4',
    wallShade: '#d8c4ae',
    trim: '#efe4d4',
    plank: 'rgba(92, 52, 28, 0.28)',
  })
  const box = houseBox(state)
  const depth = box.frontY - box.backY
  rug(ctx, w * 0.22, box.backY + depth * 0.38, w * 0.56, 52, '#8d3532')
  cabinet(ctx, 34, box.backY + 6, Math.min(128, w * 0.34), 26, 48, {
    light: '#9ebbe0',
    face: '#6d92c4',
    top: '#c5d7ef',
    side: '#4f73a4',
    edge: 'rgba(40, 55, 80, 0.4)',
  })
  cabinet(ctx, w * 0.62, box.backY + 14, 54, 16, 32, {
    light: '#f0d7a2',
    face: '#c9955c',
    top: '#f6e6c4',
    side: '#a07838',
    edge: 'rgba(80, 50, 20, 0.4)',
  })
  miniLamp(ctx, w * 0.78, box.backY + 2)
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
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#a67c52',
    floorLight: '#e4c79a',
    wallLight: '#f8fbfc',
    wall: '#e7eef2',
    wallShade: '#c5d0d6',
    trim: '#f7f4ef',
    plank: 'rgba(90, 58, 32, 0.22)',
  })
  const box = houseBox(state)
  cabinet(ctx, 28, box.backY + 12, 70, 18, 28, {
    light: '#f4f1ea',
    face: '#e4ddd2',
    top: '#fff',
    side: '#cfc6ba',
    edge: 'rgba(70, 60, 50, 0.35)',
  })
  rug(ctx, w * 0.08, box.backY + (box.frontY - box.backY) * 0.42, w * 0.28, 36, '#6e8fbf')

  const mirror = mirrorGeom(state)
  const wobble = Math.sin(state.time * 34) * state.mirrorWobble * 0.05
  ctx.save()
  ctx.translate(mirror.frame.x + mirror.frame.w / 2, mirror.frame.y + mirror.frame.h / 2)
  ctx.rotate(wobble)
  ctx.translate(-(mirror.frame.x + mirror.frame.w / 2), -(mirror.frame.y + mirror.frame.h / 2))

  const skew = 10
  ctx.beginPath()
  ctx.moveTo(mirror.frame.x + mirror.frame.w, mirror.frame.y)
  ctx.lineTo(mirror.frame.x + mirror.frame.w + skew, mirror.frame.y - 8)
  ctx.lineTo(mirror.frame.x + mirror.frame.w + skew, mirror.frame.y + mirror.frame.h - 8)
  ctx.lineTo(mirror.frame.x + mirror.frame.w, mirror.frame.y + mirror.frame.h)
  ctx.closePath()
  ctx.fillStyle = '#9aa8b5'
  ctx.fill()
  roundRect(ctx, mirror.frame.x, mirror.frame.y, mirror.frame.w, mirror.frame.h, 28)
  const framePaint = ctx.createLinearGradient(mirror.frame.x, mirror.frame.y, mirror.frame.x, mirror.frame.y + mirror.frame.h)
  framePaint.addColorStop(0, '#f7f4ef')
  framePaint.addColorStop(1, '#c5d0dc')
  ctx.fillStyle = framePaint
  ctx.fill()
  ctx.lineWidth = 10
  ctx.strokeStyle = '#d5dde6'
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#6d7c88'
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
  drawDollhouse(ctx, state, {
    floorDark: '#8f5b38',
    floorLight: '#d7a36e',
    wallLight: '#f8e4d4',
    wall: '#f0d2be',
    wallShade: '#e0b79a',
    trim: '#f6efe6',
    plank: 'rgba(90, 48, 24, 0.22)',
  })
  const bed = bedGeom(state)
  miniLamp(ctx, bed.frame.x + 36, bed.frame.y - 8)
  cabinet(ctx, bed.frame.x + bed.frame.w - 78, bed.frame.y + 8, 52, 16, 30, {
    light: '#f0d7a2',
    face: '#c9955c',
    top: '#f6e6c4',
    side: '#a07838',
    edge: 'rgba(80, 50, 20, 0.4)',
  })
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
  const skew = 12
  ctx.fillStyle = 'rgba(40, 22, 12, 0.22)'
  ellipse(ctx, bed.frame.x + bed.frame.w / 2, bed.frame.y + bed.frame.h + 6, bed.frame.w * 0.46, 12)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(bed.frame.x + bed.frame.w, bed.frame.y)
  ctx.lineTo(bed.frame.x + bed.frame.w + skew, bed.frame.y - 14)
  ctx.lineTo(bed.frame.x + bed.frame.w + skew, bed.frame.y + bed.frame.h - 10)
  ctx.lineTo(bed.frame.x + bed.frame.w, bed.frame.y + bed.frame.h)
  ctx.closePath()
  ctx.fillStyle = '#a56a32'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(bed.frame.x, bed.frame.y)
  ctx.lineTo(bed.frame.x + 8, bed.frame.y - 14)
  ctx.lineTo(bed.frame.x + bed.frame.w + skew, bed.frame.y - 14)
  ctx.lineTo(bed.frame.x + bed.frame.w, bed.frame.y)
  ctx.closePath()
  ctx.fillStyle = '#e2b06a'
  ctx.fill()
  ctx.strokeStyle = 'rgba(90, 50, 20, 0.35)'
  ctx.lineWidth = 1
  ctx.stroke()

  const wood = ctx.createLinearGradient(bed.frame.x, bed.frame.y, bed.frame.x, bed.frame.y + bed.frame.h)
  wood.addColorStop(0, '#e0a15a')
  wood.addColorStop(1, '#b87438')
  roundRect(ctx, bed.frame.x, bed.frame.y, bed.frame.w, bed.frame.h, 18)
  ctx.fillStyle = wood
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#8a5428'
  ctx.stroke()

  roundRect(ctx, bed.frame.x + 10, bed.frame.y - 34, 28, 52, 6)
  ctx.fillStyle = '#c47b38'
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bed.frame.x + 38, bed.frame.y - 34)
  ctx.lineTo(bed.frame.x + 46, bed.frame.y - 46)
  ctx.lineTo(bed.frame.x + 46, bed.frame.y + 10)
  ctx.lineTo(bed.frame.x + 38, bed.frame.y + 18)
  ctx.closePath()
  ctx.fillStyle = '#a56a32'
  ctx.fill()

  roundRect(ctx, bed.mattress.x, bed.mattress.y, bed.mattress.w, bed.mattress.h, 16)
  const sheet = ctx.createLinearGradient(bed.mattress.x, bed.mattress.y, bed.mattress.x, bed.mattress.y + bed.mattress.h)
  sheet.addColorStop(0, '#fffaf3')
  sheet.addColorStop(1, '#f0e2d0')
  ctx.fillStyle = sheet
  ctx.fill()
  ctx.strokeStyle = 'rgba(90, 60, 40, 0.28)'
  ctx.lineWidth = 1.5
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

  const blanket = ctx.createLinearGradient(bed.blanket.x, bed.blanket.y, bed.blanket.x, bed.blanket.y + bed.blanket.h)
  blanket.addColorStop(0, '#8eafd8')
  blanket.addColorStop(0.4, '#6d92c4')
  blanket.addColorStop(1, '#4f73a4')
  roundRect(ctx, bed.blanket.x, bed.blanket.y, bed.blanket.w, bed.blanket.h, 18)
  ctx.fillStyle = blanket
  ctx.fill()
  ctx.strokeStyle = 'rgba(30, 40, 60, 0.35)'
  ctx.lineWidth = 3
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

function drawLump(ctx, state, fill) {
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
  ctx.fillStyle = fill
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

function drawGuy(ctx, state, point, options) {
  const m = metrics(state)
  const pose = options.pose || 'stand'
  const dancing = (pose === 'dance' || state.scene === 'title') && !options.ghost
  const beat = state.time * 7
  const arm = dancing ? Math.sin(beat) : Math.sin(state.time * 2) * 0.25
  const sway = dancing ? Math.sin(state.time * 3) * 0.08 : pose === 'couch' ? Math.sin(state.time * 6) * 0.05 : 0
  const squash = options.ghost ? 0 : state.guy.squash
  const yell = state.guy.yell > 0 && !options.ghost
  const giggle = state.guy.giggle > 0 && !options.ghost && !yell
  const spin = Math.sin(Math.min(1, state.guy.react) * Math.PI) * state.guy.spin * 1.25

  ctx.save()
  ctx.translate(point.x, point.y)
  ctx.rotate(sway + spin + (giggle ? Math.sin(state.time * 26) * 0.06 : 0) + (yell ? Math.sin(state.time * 34) * 0.1 : 0))
  ctx.scale(options.flip ? -1 : 1, 1)
  ctx.scale(1 + squash * 0.28, 1 - squash * 0.38)

  ctx.fillStyle = 'rgba(59, 42, 36, 0.13)'
  ellipse(ctx, 0, m.bubR * 0.95, m.bubR * 0.7, m.bubR * 0.18)
  ctx.fill()

  const foot = dancing ? Math.sin(beat) * 4 : 0
  drawFoot(ctx, -m.bubR * 0.32, m.bubR * 0.78, foot)
  drawFoot(ctx, m.bubR * 0.28, m.bubR * 0.78, -foot)

  const swing = dancing ? arm : pose === 'bike' ? Math.sin(state.time * 8) * 0.2 : Math.sin(state.time * 2) * 0.35
  if (pose === 'statue') {
    drawArm(ctx, -1, 0, m.bubR, true)
    drawArm(ctx, 1, 0.4, m.bubR, false)
  } else if (pose === 'window' || pose === 'cheer' || options.cheer) {
    drawArm(ctx, -1, 0, m.bubR, true)
    drawArm(ctx, 1, 0, m.bubR, true)
  } else if (pose === 'bike') {
    drawArm(ctx, -1, 0.15, m.bubR, false)
    drawArm(ctx, 1, 0.15, m.bubR, false)
  } else {
    drawArm(ctx, -1, swing, m.bubR, false)
    drawArm(ctx, 1, swing, m.bubR, false)
  }

  circle(ctx, 0, 0, m.bubR)
  ctx.fillStyle = SKIN
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  ellipse(ctx, 0, m.bubR * 0.18, m.bubR * 0.38, m.bubR * 0.28)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fill()

  if (pose === 'plant') drawLeaves(ctx, m.bubR)
  else drawHair(ctx, 0, -m.bubR * 0.92, m.bubR * 0.34)

  ctx.fillStyle = BLUSH
  circle(ctx, -m.bubR * 0.42, m.bubR * 0.12, m.bubR * 0.14)
  ctx.fill()
  circle(ctx, m.bubR * 0.42, m.bubR * 0.12, m.bubR * 0.14)
  ctx.fill()

  const eyeY = -m.bubR * 0.12
  const look = state.scene === 'mirror' && !options.ghost ? 3 : 0
  if (yell) {
    drawBrow(ctx, -m.bubR * 0.24, eyeY - m.bubR * 0.22, m.bubR, -1)
    drawBrow(ctx, m.bubR * 0.24, eyeY - m.bubR * 0.22, m.bubR, 1)
  }
  drawEye(ctx, -m.bubR * 0.24 + look, eyeY, m.bubR, giggle, yell)
  drawEye(ctx, m.bubR * 0.24 + look, eyeY, m.bubR, giggle, yell)

  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (yell) {
    ellipse(ctx, 0, m.bubR * 0.34, m.bubR * 0.22, m.bubR * 0.28)
    ctx.fillStyle = '#6a2a32'
    ctx.fill()
    ctx.stroke()
    ellipse(ctx, 0, m.bubR * 0.28, m.bubR * 0.1, m.bubR * 0.08)
    ctx.fillStyle = '#f2b3b0'
    ctx.fill()
  } else if (giggle || options.cheer) {
    ctx.arc(0, m.bubR * 0.18, m.bubR * 0.28, 0.15, Math.PI - 0.15)
    ctx.stroke()
  } else {
    ctx.arc(0, m.bubR * 0.16, m.bubR * 0.22, 0.25, Math.PI - 0.25)
    ctx.stroke()
  }

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

function drawLeaves(ctx, r) {
  ctx.fillStyle = '#67b85a'
  ellipse(ctx, 0, -r * 1.05, r * 0.55, r * 0.32)
  ctx.fill()
  ellipse(ctx, -r * 0.45, -r * 0.8, r * 0.32, r * 0.22)
  ctx.fill()
  ellipse(ctx, r * 0.42, -r * 0.78, r * 0.32, r * 0.22)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ellipse(ctx, 0, -r * 1.05, r * 0.55, r * 0.32)
  ctx.stroke()
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

function drawBrow(ctx, x, y, r, side) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - r * 0.16, y + side * r * 0.04)
  ctx.lineTo(x + r * 0.16, y - side * r * 0.08)
  ctx.stroke()
}

function drawEye(ctx, x, y, r, giggle, yell) {
  if (yell) {
    circle(ctx, x, y, r * 0.16)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = INK
    ctx.stroke()
    circle(ctx, x, y + r * 0.02, r * 0.07)
    ctx.fillStyle = INK
    ctx.fill()
    return
  }
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

function drawSlot(ctx, state) {
  const { gap, solids } = cover(state)
  if (!gap) return
  if (state.scene === 'window') {
    drawWindowSlot(ctx, solids, gap)
    return
  }
  const paint = wallPaint(state.scene)
  for (const rect of solids) frontWall(ctx, rect, paint)
  jamb(ctx, gap)
}

function wallPaint(scene) {
  if (scene === 'mirror') return { top: '#f7fafc', light: '#eef3f6', dark: '#c5d0d6', edge: '#7a8a94' }
  if (scene === 'bed') return { top: '#f8e6d6', light: '#f3d8c4', dark: '#e0b79a', edge: '#a07858' }
  if (scene === 'laundry') return { top: '#f8f1e6', light: '#f4e7d4', dark: '#e0d0b4', edge: '#8a7048' }
  if (scene === 'statue' || scene === 'bubbles' || scene === 'picnic') {
    return { top: '#e7f3d4', light: '#d7e8bc', dark: '#b7c99a', edge: '#6a7848' }
  }
  if (scene === 'couch') return { top: '#f8ead4', light: '#f3ddc0', dark: '#e0c49a', edge: '#8a6840' }
  if (scene === 'hammock') return { top: '#f6e2c4', light: '#edd0a4', dark: '#d2ae78', edge: '#7a5a32' }
  if (scene === 'plant') return { top: '#f4f7ea', light: '#e7eedc', dark: '#d5d8c4', edge: '#7a8460' }
  return { top: '#f6efe4', light: '#f0e4d4', dark: '#d9cbb6', edge: '#8d7560' }
}

function drawWindowSlot(ctx, solids, gap) {
  const trim = { top: '#fbf7f0', light: '#f4efe6', dark: '#d5cbb8', edge: '#6a5c4e' }
  solids.forEach((rect, index) => {
    if (index === 4 || index === 5) {
      const glass = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h)
      glass.addColorStop(0, 'rgba(214, 232, 220, 0.42)')
      glass.addColorStop(1, 'rgba(168, 198, 214, 0.28)')
      ctx.fillStyle = glass
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(rect.x + 8, rect.y + 12)
      ctx.lineTo(rect.x + rect.w * 0.4, rect.y + 12)
      ctx.stroke()
      return
    }
    frontWall(ctx, rect, trim)
  })
  jamb(ctx, gap)
}

function drawBursts(ctx, state) {
  for (const burst of state.bursts) {
    const p = burst.t / 0.55
    ctx.beginPath()
    ctx.arc(burst.x, burst.y, 12 + p * 58, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 122, 89, ${1 - p})`
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(burst.x, burst.y, 6 + p * 22, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 236, 170, ${0.9 - p})`
    ctx.fill()
    ctx.strokeStyle = `rgba(59, 42, 36, ${0.7 * (1 - p)})`
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2 + 0.4
      const inner = 16 + p * 10
      const outer = 28 + p * 46
      ctx.beginPath()
      ctx.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner)
      ctx.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer)
      ctx.stroke()
    }
  }
}

function drawFist(ctx, state) {
  const m = metrics(state)
  const fist = state.fist
  const speed = Math.hypot(fist.vx, fist.vy)
  let angle = -Math.PI / 2
  if (fist.phase === 'drag' && speed > 0.05) angle = Math.atan2(fist.vy, fist.vx)
  if (fist.phase === 'windup' || fist.phase === 'strike' || fist.phase === 'impact' || fist.phase === 'bonk') {
    angle = Math.atan2(fist.aimY, fist.aimX)
  }
  const squash = fist.squash
  const wind = fist.phase === 'windup' ? fist.squash : 0

  if (fist.phase === 'drag') {
    const stretch = Math.hypot(fist.fingerX - fist.x, fist.fingerY - fist.y)
    ctx.strokeStyle = 'rgba(255, 122, 89, 0.85)'
    ctx.lineWidth = 4 + Math.min(10, stretch / 18)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(fist.x, fist.y)
    ctx.lineTo(fist.fingerX, fist.fingerY)
    ctx.stroke()
    circle(ctx, fist.fingerX, fist.fingerY, 8)
    ctx.fillStyle = '#ff7a59'
    ctx.fill()
  }

  if (fist.phase === 'windup') {
    ctx.strokeStyle = 'rgba(59, 42, 36, 0.55)'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(fist.commitX, fist.commitY)
    ctx.lineTo(fist.x, fist.y)
    ctx.stroke()
    ctx.setLineDash([5, 7])
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(fist.x, fist.y)
    ctx.lineTo(fist.x + fist.aimX * 70, fist.y + fist.aimY * 70)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.save()
  ctx.translate(fist.x, fist.y)
  ctx.rotate(angle)
  ctx.scale(1 + squash * 0.34 + wind * 0.2, Math.max(0.45, 1 - squash * 0.42))

  ctx.fillStyle = 'rgba(59, 42, 36, 0.16)'
  ellipse(ctx, 8, m.fistR * 0.75, m.fistR * 0.72, m.fistR * 0.22)
  ctx.fill()

  if (fist.phase === 'ready' && !state.seenDrag && state.scene !== 'title') {
    ctx.strokeStyle = 'rgba(255, 122, 89, 0.9)'
    ctx.lineWidth = 4
    ctx.setLineDash([8, 8])
    circle(ctx, 0, 0, m.fistR + 10 + Math.sin(state.time * 5) * 3)
    ctx.stroke()
    ctx.setLineDash([])
  }

  if (fist.phase === 'strike' || (fist.phase === 'drag' && speed > 0.4)) {
    ctx.strokeStyle = 'rgba(59, 42, 36, 0.45)'
    ctx.lineWidth = fist.phase === 'strike' ? 5 : 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-m.fistR - 10, -12)
    ctx.lineTo(-m.fistR - 34, -18)
    ctx.moveTo(-m.fistR - 8, 8)
    ctx.lineTo(-m.fistR - 36, 16)
    ctx.moveTo(-m.fistR - 6, -2)
    ctx.lineTo(-m.fistR - 28, -2)
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
    const shout = popup.kind === 'ah'
    if (shout) ctx.scale(1.15, 1.15)
    ctx.fillStyle = popup.kind === 'bonk' ? '#4aa3df' : popup.kind === 'giggle' ? '#e45d9a' : shout ? '#d63a32' : '#ff7a59'
    ctx.strokeText(popup.text, 0, 0)
    ctx.fillText(popup.text, 0, 0)
    ctx.restore()
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
