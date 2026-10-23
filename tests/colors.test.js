import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readable, isLight, getLangColor, getTopicColor, LANG_COLORS } from '../src/utils/colors.js'

test('light colours are left alone', () => {
  assert.equal(readable('#f1e05a'), '#f1e05a')
  assert.equal(readable('#63b3ed'), '#63b3ed')
})

test('dark colours are lightened enough to read on the dark background', () => {
  for (const hex of ['#563d7c', '#012456', '#092E20', '#000000']) {
    const out = readable(hex)
    assert.notEqual(out, hex)
    assert.match(out, /^#[0-9a-f]{6}$/)
  }
})

test('every known language colour is readable', () => {
  for (const lang of Object.keys(LANG_COLORS)) {
    assert.equal(readable(getLangColor(lang)), getLangColor(lang), lang)
  }
})

test('unknown languages get the default colour', () => {
  assert.equal(getLangColor('Brainfuck'), LANG_COLORS._default)
})

test('topic colours are deterministic', () => {
  assert.equal(getTopicColor('some-topic'), getTopicColor('some-topic'))
  assert.equal(getTopicColor('react'), '#61DAFB')
})

test('isLight picks dark text for bright colours', () => {
  assert.equal(isLight('#f1e05a'), true)
  assert.equal(isLight('#178600'), false)
})
