// A miniature house seen from above the open front. The guy and the fist stay simple.

export function drawDollhouse(ctx, state, theme) {
  const { w, h } = state
  const box = houseBox(state)
  drawTable(ctx, w, h)

  ctx.save()
  ctx.shadowColor = 'rgba(30, 16, 8, 0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 10
  pathFloor(ctx, box)
  ctx.fillStyle = theme.floorDark
  ctx.fill()
  ctx.restore()

  drawWalls(ctx, box, theme)
  drawFloor(ctx, box, theme)
  drawWindowLight(ctx, box, theme)
  drawBaseboard(ctx, box, theme)
  drawSideWalls(ctx, box, theme)
  drawFrontLip(ctx, box, theme)
}

export function houseBox(state) {
  const { w, h } = state
  const top = Math.max(108, h * 0.15)
  return {
    backY: top + 128,
    frontY: h * 0.7,
    left: 20,
    right: w - 20,
    inset: Math.min(78, w * 0.18),
    wallH: 92,
  }
}

export function cabinet(ctx, x, y, w, depth, height, colors) {
  const skew = depth * 0.22
  const topY = y - height
  ctx.fillStyle = 'rgba(40, 22, 12, 0.2)'
  ellipse(ctx, x + w / 2, y + 6, w * 0.48, 7)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x + w, topY)
  ctx.lineTo(x + w + skew, topY - depth)
  ctx.lineTo(x + w + skew, y - depth)
  ctx.lineTo(x + w, y)
  ctx.closePath()
  ctx.fillStyle = colors.side
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x, topY)
  ctx.lineTo(x + skew, topY - depth)
  ctx.lineTo(x + w + skew, topY - depth)
  ctx.lineTo(x + w, topY)
  ctx.closePath()
  ctx.fillStyle = colors.top
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  ctx.stroke()

  const face = ctx.createLinearGradient(x, topY, x, y)
  face.addColorStop(0, colors.light)
  face.addColorStop(1, colors.face)
  ctx.fillStyle = face
  ctx.fillRect(x, topY, w, height)
  ctx.strokeStyle = colors.edge
  ctx.lineWidth = 1.25
  ctx.strokeRect(x + 0.5, topY + 0.5, w - 1, height - 1)
  if (w > 28 && height > 24) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ellipse(ctx, x + w * 0.72, topY + height * 0.55, 3.5, 3.5)
    ctx.fill()
    ctx.strokeStyle = 'rgba(60, 40, 20, 0.35)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

export function rug(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(40, 22, 12, 0.16)'
  ellipse(ctx, x + w / 2, y + h - 2, w * 0.46, 8)
  ctx.fill()
  roundRect(ctx, x, y, w, h, 8)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 236, 210, 0.35)'
  ctx.lineWidth = 3
  ctx.stroke()
}

export function miniLamp(ctx, x, y) {
  const glow = ctx.createRadialGradient(x, y - 10, 4, x, y + 20, 70)
  glow.addColorStop(0, 'rgba(255, 214, 140, 0.55)')
  glow.addColorStop(1, 'rgba(255, 214, 140, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - 70, y - 70, 140, 140)
  cabinet(ctx, x - 10, y, 20, 10, 36, {
    light: '#f0d7a2',
    face: '#e2c07a',
    top: '#fff1c9',
    side: '#c9a15a',
    edge: 'rgba(80, 50, 20, 0.35)',
  })
  roundRect(ctx, x - 16, y - 48, 32, 16, 6)
  ctx.fillStyle = '#ffe7a8'
  ctx.fill()
}

export function frontWall(ctx, rect, colors) {
  if (rect.w < 6 || rect.h < 6) return
  const thick = 22
  const skew = 10
  ctx.fillStyle = 'rgba(30, 16, 8, 0.16)'
  ctx.fillRect(rect.x + 3, rect.y + rect.h - 4, rect.w, 10)

  ctx.beginPath()
  ctx.moveTo(rect.x, rect.y)
  ctx.lineTo(rect.x + skew, rect.y - thick)
  ctx.lineTo(rect.x + rect.w + skew, rect.y - thick)
  ctx.lineTo(rect.x + rect.w, rect.y)
  ctx.closePath()
  ctx.fillStyle = colors.top
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  const face = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w * 0.2, rect.y + rect.h)
  face.addColorStop(0, colors.light)
  face.addColorStop(1, colors.dark)
  ctx.fillStyle = face
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.fillStyle = 'rgba(40, 22, 12, 0.08)'
  ctx.fillRect(rect.x, rect.y, Math.min(10, rect.w), rect.h)
  ctx.strokeStyle = colors.edge
  ctx.lineWidth = 1.25
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
  if (rect.w > 72 && rect.h > 36) {
    ctx.strokeStyle = 'rgba(80, 52, 28, 0.14)'
    ctx.lineWidth = 1
    const panels = Math.max(2, Math.round(rect.w / 58))
    for (let i = 1; i < panels; i += 1) {
      const seam = rect.x + (rect.w * i) / panels
      ctx.beginPath()
      ctx.moveTo(seam, rect.y + 3)
      ctx.lineTo(seam, rect.y + rect.h - 3)
      ctx.stroke()
    }
  }
}

export function jamb(ctx, gap) {
  if (!gap) return
  ctx.save()
  ctx.strokeStyle = 'rgba(30, 16, 8, 0.45)'
  ctx.lineWidth = 7
  ctx.strokeRect(gap.x - 1, gap.y - 1, gap.w + 2, gap.h + 2)
  const shade = ctx.createLinearGradient(gap.x, gap.y, gap.x + gap.w, gap.y)
  shade.addColorStop(0, 'rgba(20, 10, 6, 0.28)')
  shade.addColorStop(0.18, 'rgba(20, 10, 6, 0)')
  shade.addColorStop(0.82, 'rgba(20, 10, 6, 0)')
  shade.addColorStop(1, 'rgba(20, 10, 6, 0.28)')
  ctx.fillStyle = shade
  ctx.fillRect(gap.x, gap.y, gap.w, gap.h)
  ctx.restore()
}

function drawTable(ctx, w, h) {
  const wood = ctx.createLinearGradient(0, 0, w, h)
  wood.addColorStop(0, '#6a4630')
  wood.addColorStop(0.5, '#7c5338')
  wood.addColorStop(1, '#5c3b28')
  ctx.fillStyle = wood
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(255, 220, 180, 0.05)'
  ctx.lineWidth = 2
  for (let y = 12; y < h; y += 14) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y + 2)
    ctx.stroke()
  }
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.2, w * 0.5, h * 0.5, w * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(30, 14, 8, 0.28)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

function drawWalls(ctx, box, theme) {
  const { left, right, backY, wallH, inset } = box
  const backLeft = left + inset
  const backRight = right - inset
  const top = backY - wallH

  ctx.beginPath()
  ctx.moveTo(backLeft, backY)
  ctx.lineTo(backLeft + 8, top)
  ctx.lineTo(backRight - 8, top)
  ctx.lineTo(backRight, backY)
  ctx.closePath()
  const plaster = ctx.createLinearGradient(0, top, 0, backY)
  plaster.addColorStop(0, theme.wallLight)
  plaster.addColorStop(1, theme.wall)
  ctx.fillStyle = plaster
  ctx.fill()
  ctx.strokeStyle = 'rgba(80, 52, 28, 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  if (theme.outdoor) {
    const sky = ctx.createLinearGradient(0, top, 0, backY)
    sky.addColorStop(0, '#9ec4e4')
    sky.addColorStop(1, '#d5ebc4')
    ctx.fillStyle = sky
    ctx.fillRect(backLeft + 8, top + 8, backRight - backLeft - 16, wallH * 0.55)
  } else {
    const winW = Math.min(92, (backRight - backLeft) * 0.34)
    const winX = backLeft + 16
    const winY = top + 14
    const winH = wallH * 0.48
    const glass = ctx.createLinearGradient(winX, winY, winX, winY + winH)
    glass.addColorStop(0, '#b9d4ea')
    glass.addColorStop(1, '#e7f3ea')
    roundRect(ctx, winX, winY, winW, winH, 3)
    ctx.fillStyle = glass
    ctx.fill()
    ctx.strokeStyle = theme.trim
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.strokeStyle = 'rgba(90, 60, 40, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(winX + winW / 2, winY)
    ctx.lineTo(winX + winW / 2, winY + winH)
    ctx.moveTo(winX, winY + winH * 0.45)
    ctx.lineTo(winX + winW, winY + winH * 0.45)
    ctx.stroke()
  }

  const cap = 16
  ctx.beginPath()
  ctx.moveTo(backLeft, top)
  ctx.lineTo(backRight, top)
  ctx.lineTo(backRight - 10, top - cap)
  ctx.lineTo(backLeft + 10, top - cap)
  ctx.closePath()
  ctx.fillStyle = theme.wallLight
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawFloor(ctx, box, theme) {
  const { left, right, backY, frontY, inset } = box
  ctx.save()
  pathFloor(ctx, box)
  ctx.clip()
  const paint = ctx.createLinearGradient(0, backY, 0, frontY)
  paint.addColorStop(0, theme.floorLight)
  paint.addColorStop(1, theme.floorDark)
  ctx.fillStyle = paint
  ctx.fillRect(left, backY, right - left, frontY - backY)

  const backLeft = left + inset
  const backRight = right - inset
  const boards = 9
  for (let i = 0; i < boards; i += 1) {
    const t0 = i / boards
    const t1 = (i + 1) / boards
    ctx.beginPath()
    ctx.moveTo(backLeft + (backRight - backLeft) * t0, backY)
    ctx.lineTo(backLeft + (backRight - backLeft) * t1, backY)
    ctx.lineTo(left + (right - left) * t1, frontY)
    ctx.lineTo(left + (right - left) * t0, frontY)
    ctx.closePath()
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 236, 210, 0.08)' : 'rgba(40, 22, 12, 0.08)'
    ctx.fill()
    ctx.strokeStyle = theme.plank
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  const pool = ctx.createRadialGradient(left + 70, backY + 30, 8, left + 80, backY + 50, 120)
  pool.addColorStop(0, 'rgba(255, 236, 190, 0.38)')
  pool.addColorStop(1, 'rgba(255, 236, 190, 0)')
  ctx.fillStyle = pool
  ctx.save()
  pathFloor(ctx, box)
  ctx.clip()
  ctx.fillRect(left, backY, right - left, frontY - backY)
  ctx.restore()
}

function drawWindowLight(ctx, box, theme) {
  if (theme.outdoor) return
  const { left, backY, inset } = box
  ctx.save()
  pathFloor(ctx, box)
  ctx.clip()
  ctx.fillStyle = 'rgba(255, 244, 214, 0.16)'
  ctx.beginPath()
  ctx.moveTo(left + inset + 20, backY)
  ctx.lineTo(left + inset + 110, backY)
  ctx.lineTo(left + 150, backY + 90)
  ctx.lineTo(left + 40, backY + 70)
  ctx.fill()
  ctx.restore()
}

function drawBaseboard(ctx, box, theme) {
  const { left, right, backY, inset } = box
  ctx.strokeStyle = theme.trim
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(left + 2, backY)
  ctx.lineTo(right - 2, backY)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(40, 22, 12, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(left + inset, backY + 1)
  ctx.lineTo(right - inset, backY + 1)
  ctx.stroke()
}

function drawSideWalls(ctx, box, theme) {
  const { left, right, backY, frontY, inset } = box
  const rise = 74
  ctx.beginPath()
  ctx.moveTo(left + inset, backY)
  ctx.lineTo(left, frontY)
  ctx.lineTo(left + 2, frontY - rise * 0.42)
  ctx.lineTo(left + inset, backY - rise)
  ctx.closePath()
  ctx.fillStyle = theme.wall
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 22, 12, 0.2)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(left, frontY)
  ctx.lineTo(left - 8, frontY + 10)
  ctx.lineTo(left - 6, frontY - rise * 0.42 + 8)
  ctx.lineTo(left + 2, frontY - rise * 0.42)
  ctx.closePath()
  ctx.fillStyle = '#6a4630'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(right - inset, backY)
  ctx.lineTo(right, frontY)
  ctx.lineTo(right - 2, frontY - rise * 0.42)
  ctx.lineTo(right - inset, backY - rise)
  ctx.closePath()
  ctx.fillStyle = theme.wallShade
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 22, 12, 0.2)'
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(right, frontY)
  ctx.lineTo(right + 8, frontY + 10)
  ctx.lineTo(right + 6, frontY - rise * 0.42 + 8)
  ctx.lineTo(right - 2, frontY - rise * 0.42)
  ctx.closePath()
  ctx.fillStyle = '#5c3b28'
  ctx.fill()
}

function drawFrontLip(ctx, box, theme) {
  const { left, right, frontY } = box
  const lip = 28
  ctx.beginPath()
  ctx.moveTo(left - 4, frontY)
  ctx.lineTo(right + 4, frontY)
  ctx.lineTo(right - 2, frontY + lip)
  ctx.lineTo(left + 2, frontY + lip)
  ctx.closePath()
  const wood = ctx.createLinearGradient(0, frontY, 0, frontY + lip)
  wood.addColorStop(0, '#8a6244')
  wood.addColorStop(1, '#5c3b28')
  ctx.fillStyle = wood
  ctx.fill()
  ctx.strokeStyle = 'rgba(30, 16, 8, 0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255, 220, 180, 0.22)'
  ctx.beginPath()
  ctx.moveTo(left + 6, frontY + 3)
  ctx.lineTo(right - 6, frontY + 3)
  ctx.stroke()
  ctx.strokeStyle = theme.plank
  for (let x = left + 18; x < right - 10; x += 28) {
    ctx.beginPath()
    ctx.moveTo(x, frontY + 6)
    ctx.lineTo(x - 2, frontY + lip - 3)
    ctx.stroke()
  }
}

function pathFloor(ctx, box) {
  const { left, right, backY, frontY, inset } = box
  ctx.beginPath()
  ctx.moveTo(left + inset, backY)
  ctx.lineTo(right - inset, backY)
  ctx.lineTo(right, frontY)
  ctx.lineTo(left, frontY)
  ctx.closePath()
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

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2)
}
