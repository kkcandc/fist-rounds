// Shared light, wood, and floor painting. The guy and the fist stay cartoon.

export function paintRoom(ctx, w, h, theme) {
  const horizon = h * (theme.horizon ?? 0.64)
  const wall = ctx.createLinearGradient(0, 0, w * 0.3, horizon)
  wall.addColorStop(0, theme.wallShade)
  wall.addColorStop(0.42, theme.wall)
  wall.addColorStop(1, theme.wallLight)
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, w, horizon)

  const corner = ctx.createLinearGradient(0, 0, w * 0.22, 0)
  corner.addColorStop(0, 'rgba(48, 28, 18, 0.16)')
  corner.addColorStop(1, 'rgba(48, 28, 18, 0)')
  ctx.fillStyle = corner
  ctx.fillRect(0, 0, w * 0.28, horizon)

  const floor = ctx.createLinearGradient(0, horizon, 0, h)
  floor.addColorStop(0, theme.floorLight)
  floor.addColorStop(1, theme.floorDark)
  ctx.fillStyle = floor
  ctx.fillRect(0, horizon, w, h - horizon)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizon, w, h - horizon)
  ctx.clip()
  const vanishX = w * 0.5
  const vanishY = horizon - h * 0.04
  ctx.strokeStyle = theme.plank
  ctx.lineWidth = 1.5
  for (let i = -8; i <= 8; i += 1) {
    const bottomX = vanishX + i * (w * 0.16)
    ctx.beginPath()
    ctx.moveTo(vanishX, vanishY)
    ctx.lineTo(bottomX, h + 8)
    ctx.stroke()
  }
  ctx.restore()

  ctx.fillStyle = theme.trim
  ctx.fillRect(0, horizon - 12, w, 14)
  ctx.fillStyle = 'rgba(40, 22, 12, 0.25)'
  ctx.fillRect(0, horizon - 2, w, 3)

  const lx = w * (theme.lightX ?? 0.72)
  const pool = ctx.createRadialGradient(lx, horizon + 8, 8, lx, horizon + 24, w * 0.48)
  pool.addColorStop(0, 'rgba(255, 236, 196, 0.42)')
  pool.addColorStop(1, 'rgba(255, 236, 196, 0)')
  ctx.fillStyle = pool
  ctx.fillRect(0, horizon - 30, w, h)

  if (theme.sky) {
    const win = theme.sky
    const glass = ctx.createLinearGradient(win.x, win.y, win.x, win.y + win.h)
    glass.addColorStop(0, '#9ec8ea')
    glass.addColorStop(0.55, '#d5ecf8')
    glass.addColorStop(1, '#c5d7b0')
    roundRect(ctx, win.x, win.y, win.w, win.h, 6)
    ctx.fillStyle = glass
    ctx.fill()
    const shaft = ctx.createLinearGradient(win.x, win.y + win.h, lx, horizon + 40)
    shaft.addColorStop(0, 'rgba(255, 244, 210, 0.28)')
    shaft.addColorStop(1, 'rgba(255, 244, 210, 0)')
    ctx.fillStyle = shaft
    ctx.beginPath()
    ctx.moveTo(win.x + 8, win.y + win.h)
    ctx.lineTo(win.x + win.w - 8, win.y + win.h)
    ctx.lineTo(lx + 70, horizon + 30)
    ctx.lineTo(lx - 50, horizon + 10)
    ctx.fill()
  }
}

export function softShadow(ctx, x, y, rx, ry) {
  const shade = ctx.createRadialGradient(x, y, 2, x, y, Math.max(rx, ry))
  shade.addColorStop(0, 'rgba(40, 24, 16, 0.28)')
  shade.addColorStop(1, 'rgba(40, 24, 16, 0)')
  ctx.fillStyle = shade
  ellipse(ctx, x, y, rx, ry)
  ctx.fill()
}

export function woodPanel(ctx, rect, tint) {
  const { x, y, w, h } = rect
  if (w < 4 || h < 4) return
  ctx.save()
  roundRect(ctx, x + 3, y + 5, w, h, 5)
  ctx.fillStyle = 'rgba(40, 22, 12, 0.22)'
  ctx.fill()
  const grain = ctx.createLinearGradient(x, y, x + w, y + h)
  grain.addColorStop(0, tint.light)
  grain.addColorStop(0.45, tint.mid)
  grain.addColorStop(1, tint.dark)
  roundRect(ctx, x, y, w, h, 5)
  ctx.fillStyle = grain
  ctx.fill()
  ctx.strokeStyle = tint.edge
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255, 236, 210, 0.28)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + 6, y + 5)
  ctx.lineTo(x + w - 8, y + 5)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(70, 36, 18, 0.25)'
  ctx.lineWidth = 1
  const boards = Math.max(1, Math.floor(h / 18))
  for (let i = 1; i < boards; i += 1) {
    const yy = y + (h * i) / boards
    ctx.beginPath()
    ctx.moveTo(x + 4, yy)
    ctx.lineTo(x + w - 4, yy)
    ctx.stroke()
  }
  ctx.restore()
}

export function softPad(ctx, rect, fill) {
  const { x, y, w, h } = rect
  if (w < 4 || h < 4) return
  roundRect(ctx, x + 2, y + 4, w, h, 16)
  ctx.fillStyle = 'rgba(40, 28, 20, 0.18)'
  ctx.fill()
  const cloth = ctx.createLinearGradient(x, y, x, y + h)
  cloth.addColorStop(0, fill.light)
  cloth.addColorStop(1, fill.dark)
  roundRect(ctx, x, y, w, h, 16)
  ctx.fillStyle = cloth
  ctx.fill()
  ctx.strokeStyle = 'rgba(50, 32, 24, 0.35)'
  ctx.lineWidth = 2
  ctx.stroke()
}

export function openingShadow(ctx, gap) {
  if (!gap) return
  ctx.save()
  ctx.strokeStyle = 'rgba(30, 16, 8, 0.35)'
  ctx.lineWidth = 8
  roundRect(ctx, gap.x - 2, gap.y - 2, gap.w + 4, gap.h + 4, 8)
  ctx.stroke()
  const inner = ctx.createLinearGradient(gap.x, gap.y, gap.x + gap.w, gap.y)
  inner.addColorStop(0, 'rgba(20, 10, 6, 0.18)')
  inner.addColorStop(0.2, 'rgba(20, 10, 6, 0)')
  inner.addColorStop(0.8, 'rgba(20, 10, 6, 0)')
  inner.addColorStop(1, 'rgba(20, 10, 6, 0.18)')
  ctx.fillStyle = inner
  ctx.fillRect(gap.x, gap.y, gap.w, gap.h)
  ctx.restore()
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
