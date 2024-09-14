import { expect, test } from 'vitest'
import { sum } from './sum1'

test('a tset 1', () => {
  expect(sum(1, 2)).toBe(3)
})
