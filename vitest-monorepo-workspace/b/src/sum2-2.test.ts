import { expect, test } from 'vitest'
import { sum } from './sum2'

test('b tset 1', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})

test('b tset 2', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})

test('b tset 3', async () => {
  const result = await sum(1, 2)
  expect(result).toBe(3)
})
