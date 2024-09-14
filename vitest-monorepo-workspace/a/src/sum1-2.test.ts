import { expect, test } from 'vitest'
import { sum } from './sum1'

test('a tset 1', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})

test('a tset 2', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})

test('a tset 3', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})
