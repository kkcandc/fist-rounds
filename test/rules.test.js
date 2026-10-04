import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createState,
  currentTargets,
  enter,
  metrics,
  mirrorGeom,
  pointerDown,
  pointerMove,
  pointerUp,
  reflectionPoint,
  startGame,
  tick,
} from '../src/logic.js'

function settle(state) {
  for (let i = 0; i < 20; i += 1) tick(state, 0.05)
}

function drag(state, x, y) {
  const id = 1
  const grabbed = pointerDown(state, state.fist.x, state.fist.y, id, 0)
  assert.equal(grabbed, true)
  const x0 = state.fist.x
  const y0 = state.fist.y
  const steps = 8
  for (let i = 1; i <= steps; i += 1) {
    pointerMove(
      state,
      x0 + ((x - x0) * i) / steps,
      y0 + ((y - y0) * i) / steps,
      id,
      i * 16,
    )
  }
  pointerUp(state, x, y, id)
}

describe('Fist Rounds rules', () => {
  it('has no score', () => {
    const state = createState(390, 844)
    assert.equal(state.score, undefined)
    assert.equal(state.points, undefined)
  })

  it('does not punch from a tap on the fist', () => {
    const state = createState(390, 844)
    startGame(state)
    pointerDown(state, state.fist.x, state.fist.y, 1, 0)
    pointerUp(state, state.fist.x + 4, state.fist.y + 2, 1)
    assert.equal(state.scene, 'dance')
    assert.equal(state.guy.hop, null)
    assert.equal(state.pendingScene, null)
  })

  it('keeps the dancer in place until a miss', () => {
    const state = createState(390, 844)
    startGame(state)
    const x = state.guy.x
    const y = state.guy.y
    for (let i = 0; i < 40; i += 1) tick(state, 0.05)
    assert.equal(state.guy.x, x)
    assert.equal(state.guy.y, y)
    assert.equal(state.guy.hop, null)
    assert.equal(state.scene, 'dance')
  })

  it('giggles and hops on a miss without leaving the dance spotlight', () => {
    const state = createState(390, 844)
    startGame(state)
    const before = { x: state.guy.x, y: state.guy.y }
    drag(state, 24, state.fist.y)
    assert.equal(state.scene, 'dance')
    assert.ok(state.guy.hop)
    assert.ok(state.popups.some((popup) => popup.text === 'hee hee!'))
    settleHop(state)
    const moved = Math.hypot(state.guy.x - before.x, state.guy.y - before.y)
    assert.ok(moved > 8)
    assert.ok(Math.abs(state.guy.x - state.w * 0.5) <= 62)
    assert.ok(Math.abs(state.guy.y - state.h * 0.48) <= 26)
  })

  it('advances dance, then mirror, then bed, then win', () => {
    const state = createState(390, 844)
    startGame(state)
    assert.equal(state.scene, 'dance')

    const dancer = currentTargets(state)[0]
    drag(state, dancer.x, dancer.y)
    assert.equal(state.pendingScene, 'mirror')
    assert.equal(state.scene, 'dance')
    settle(state)
    assert.equal(state.scene, 'mirror')

    const reflection = reflectionPoint(state)
    const guyX = state.guy.x
    drag(state, reflection.x, reflection.y)
    assert.equal(state.scene, 'mirror')
    assert.equal(state.pendingScene, null)
    assert.equal(state.guy.hop, null)
    assert.equal(state.guy.x, guyX)
    assert.ok(state.popups.some((popup) => popup.text === 'bonk!'))
    settle(state)

    const real = currentTargets(state).find((target) => target.id === 'guy')
    drag(state, real.x, real.y)
    assert.equal(state.pendingScene, 'bed')
    settle(state)
    assert.equal(state.scene, 'bed')
    assert.equal(currentTargets(state).some((target) => target.id === 'reflection'), false)

    drag(state, 24, state.fist.y)
    assert.equal(state.scene, 'bed')
    assert.ok(state.guy.hop)
    assert.ok(state.popups.some((popup) => popup.text === 'hee hee!'))
    settleHop(state)

    const lump = currentTargets(state)[0]
    assert.equal(lump.id, 'lump')
    drag(state, lump.x, lump.y)
    assert.equal(state.pendingScene, 'win')
    settle(state)
    assert.equal(state.scene, 'win')
    assert.equal(state.score, undefined)
  })

  it('keeps the reflection inside the mirror on a narrow phone', () => {
    for (const size of [
      [320, 700],
      [390, 844],
      [430, 932],
    ]) {
      const state = createState(size[0], size[1])
      enter(state, 'mirror')
      assert.ok(state.arena.minX < state.arena.maxX)
      assert.ok(state.arena.minY < state.arena.maxY)
      assert.ok(state.guy.x >= state.arena.minX - 0.5)
      assert.ok(state.guy.x <= state.arena.maxX + 0.5)
      const point = reflectionPoint(state)
      const { glass } = mirrorGeom(state)
      const rad = metrics(state).bubR
      assert.ok(point.x - rad >= glass.x - 1, `reflection left ${point.x - rad} glass ${glass.x}`)
      assert.ok(point.x + rad <= glass.x + glass.w + 1)
      assert.ok(point.y - rad >= glass.y - 1)
      assert.ok(point.y + rad <= glass.y + glass.h + 1)
    }
  })
})

function settleHop(state) {
  for (let i = 0; i < 20; i += 1) tick(state, 0.05)
}
