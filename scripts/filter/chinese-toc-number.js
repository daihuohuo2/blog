function toChineseNumber(value) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

  if (value === 0) return digits[0]
  if (value < 10) return digits[value]
  if (value < 20) return `十${value === 10 ? '' : digits[value % 10]}`
  if (value < 100) {
    const tens = Math.floor(value / 10)
    const ones = value % 10
    return `${digits[tens]}十${ones === 0 ? '' : digits[ones]}`
  }

  return String(value)
}

function convertTocNumber(text) {
  const trimmed = text.trim()
  const hasTrailingDot = trimmed.endsWith('.')
  const segments = trimmed
    .split('.')
    .filter(segment => segment.length > 0)
    .map(segment => {
      const value = Number.parseInt(segment, 10)
      return Number.isNaN(value) ? segment : toChineseNumber(value)
    })

  if (segments.length === 0) return text

  return `${segments.join('.')}${hasTrailingDot ? '.' : ''}`
}

hexo.extend.filter.register('after_render:html', function (html) {
  if (!html.includes('toc-number')) return html

  return html.replace(/(<span class="toc-number">)([^<]+)(<\/span>)/g, (match, prefix, numberText, suffix) => {
    const trimmed = numberText.trim()
    // 只保留一级标题编号（如 "1."），多级编号（如 "1.1."）清空
    const segments = trimmed.split('.').filter(s => s.length > 0)
    if (segments.length > 1) {
      return `${prefix}${suffix}`
    }
    return `${prefix}${convertTocNumber(trimmed)}${suffix}`
  })
})