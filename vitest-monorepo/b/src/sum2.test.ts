import { expect, test } from 'vitest'
import { sum } from './sum2'

test('b test 1', () => {
  expect(sum(1, 2)).toBe(3)
})
