'use strict'

const path = require('path')
const { escapeHTML, slugize, stripHTML } = require('hexo-util')
const { parse: parseFrontMatter } = require('hexo-front-matter')

const POST_DIR = '_posts/'
const DRAFT_DIR = '_drafts/'

function cellText(value) {
  return Array.isArray(value) ? value.join('') : (value || '')
}

function firstValue(data, keys) {
  if (!data) return ''
  for (const key of keys) {
    if (data[key]) return cellText(data[key])
  }
  return ''
}

function getNotebookLanguage(notebook) {
  const lang = notebook.metadata && notebook.metadata.language_info
  return (lang && (lang.name || lang.codemirror_mode)) || 'python'
}

function renderMarkdown(ctx, text) {
  if (!text.trim()) return ''
  return ctx.render.renderSync({ text, engine: 'markdown' })
}

function renderPlainOutput(text, className) {
  if (!text) return ''
  return `<pre class="ipynb-output ${className}">${escapeHTML(text)}</pre>`
}

function renderMimeBundle(ctx, data) {
  const html = firstValue(data, ['text/html'])
  if (html) return `<div class="ipynb-rich-output">${html}</div>`

  const markdown = firstValue(data, ['text/markdown'])
  if (markdown) return `<div class="ipynb-rich-output">${renderMarkdown(ctx, markdown)}</div>`

  const svg = firstValue(data, ['image/svg+xml'])
  if (svg) return `<div class="ipynb-image-output">${svg}</div>`

  const png = firstValue(data, ['image/png'])
  if (png) return `<img class="ipynb-image-output" src="data:image/png;base64,${png.replace(/\s/g, '')}" alt="Notebook output">`

  const jpeg = firstValue(data, ['image/jpeg'])
  if (jpeg) return `<img class="ipynb-image-output" src="data:image/jpeg;base64,${jpeg.replace(/\s/g, '')}" alt="Notebook output">`

  return renderPlainOutput(firstValue(data, ['text/plain']), 'text')
}

function renderOutput(ctx, output) {
  if (!output || typeof output !== 'object') return ''

  if (output.output_type === 'stream') {
    const streamName = output.name === 'stderr' ? 'stderr' : 'stdout'
    return renderPlainOutput(cellText(output.text), streamName)
  }

  if (output.output_type === 'error') {
    return renderPlainOutput(cellText(output.traceback || output.ename || output.evalue), 'error')
  }

  if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
    return renderMimeBundle(ctx, output.data)
  }

  return ''
}

function renderCodeCell(ctx, cell, language) {
  const source = cellText(cell.source)
  const executionCount = cell.execution_count == null ? '' : cell.execution_count
  const code = [
    `<div class="ipynb-input-prompt">In&nbsp;[${escapeHTML(String(executionCount))}]:</div>`,
    '<div class="ipynb-code-body">',
    renderMarkdown(ctx, `\`\`\`${language}\n${source.replace(/```/g, '\\`\\`\\`')}\n\`\`\``),
    '</div>'
  ].join('')

  const outputs = (cell.outputs || []).map(output => renderOutput(ctx, output)).filter(Boolean).join('')
  return `<section class="ipynb-cell ipynb-code-cell"><div class="ipynb-input">${code}</div>${outputs ? `<div class="ipynb-outputs">${outputs}</div>` : ''}</section>`
}

function renderNotebook(ctx, notebook) {
  const language = getNotebookLanguage(notebook)
  const cells = Array.isArray(notebook.cells) ? notebook.cells : []
  const body = cells.map(cell => {
    const source = cellText(cell.source)

    if (cell.cell_type === 'markdown') {
      return `<section class="ipynb-cell ipynb-markdown-cell">${renderMarkdown(ctx, source)}</section>`
    }

    if (cell.cell_type === 'code') {
      return renderCodeCell(ctx, cell, language)
    }

    if (cell.cell_type === 'raw') {
      return `<section class="ipynb-cell ipynb-raw-cell"><pre>${escapeHTML(source)}</pre></section>`
    }

    return ''
  }).filter(Boolean).join('\n')

  return `<div class="ipynb-notebook">${body}</div>`
}

function extractTitle(notebook, fallback) {
  const hexoMeta = getNotebookHexoMeta(notebook)
  if (hexoMeta && hexoMeta.title) return hexoMeta.title
  if (notebook.metadata && notebook.metadata.title) return notebook.metadata.title

  const headingCell = (notebook.cells || []).find(cell => {
    const text = cellText(cell.source).trim()
    return cell.cell_type === 'markdown' && /^#\s+/.test(text)
  })

  if (headingCell) return cellText(headingCell.source).trim().replace(/^#\s+/, '')
  return fallback
}

function getNotebookHexoMeta(notebook) {
  return (notebook.metadata && notebook.metadata.hexo) || {}
}

function splitMarkdownFrontMatter(source) {
  if (!source.trimStart().startsWith('---')) {
    return { metadata: {}, content: source }
  }

  try {
    const parsed = parseFrontMatter(source)
    const { _content, ...metadata } = parsed
    return { metadata, content: _content || '' }
  } catch (err) {
    return { metadata: {}, content: source }
  }
}

function normalizeCellSource(source) {
  return source ? source.split(/(?<=\n)/) : []
}

function prepareNotebook(notebook) {
  const cells = Array.isArray(notebook.cells) ? notebook.cells.slice() : []
  const firstMarkdownIndex = cells.findIndex(cell => cell.cell_type === 'markdown')
  if (firstMarkdownIndex === -1) {
    return { notebook, frontMatter: {} }
  }

  const firstCell = cells[firstMarkdownIndex]
  const source = cellText(firstCell.source)
  const { metadata, content } = splitMarkdownFrontMatter(source)
  if (!Object.keys(metadata).length) {
    return { notebook, frontMatter: {} }
  }

  cells[firstMarkdownIndex] = {
    ...firstCell,
    source: normalizeCellSource(content)
  }

  return {
    notebook: {
      ...notebook,
      cells
    },
    frontMatter: metadata
  }
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function normalizeDate(value, fallback) {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date
}

function pickExtraFrontMatter(meta) {
  const reserved = new Set([
    'category',
    'categories',
    'comments',
    'date',
    'layout',
    'tag',
    'tags',
    'title',
    'updated'
  ])

  return Object.fromEntries(Object.entries(meta).filter(([key]) => !reserved.has(key)))
}

function pickPostPath(sourcePath) {
  if (sourcePath.startsWith(POST_DIR)) {
    return { published: true, path: sourcePath.slice(POST_DIR.length) }
  }

  if (sourcePath.startsWith(DRAFT_DIR)) {
    return { published: false, path: sourcePath.slice(DRAFT_DIR.length) }
  }

  return null
}

hexo.extend.processor.register(sourcePath => {
  const postPath = pickPostPath(sourcePath)
  if (!postPath || path.extname(sourcePath).toLowerCase() !== '.ipynb') return
  return postPath
}, function ipynbPostProcessor(file) {
  const Post = this.model('Post')
  const doc = Post.findOne({ source: file.path })

  if (file.type === 'delete') {
    return doc ? doc.remove() : undefined
  }

  return Promise.all([file.stat(), file.read()]).then(([stats, content]) => {
    let notebook
    try {
      notebook = JSON.parse(content)
    } catch (err) {
      err.message = `Failed to parse notebook ${file.path}: ${err.message}`
      throw err
    }

    const basename = path.basename(file.params.path, '.ipynb')
    const prepared = prepareNotebook(notebook)
    const renderableNotebook = prepared.notebook
    const hexoMeta = {
      ...getNotebookHexoMeta(notebook),
      ...prepared.frontMatter
    }
    const rendered = renderNotebook(this, renderableNotebook)
    const excerptSource = (renderableNotebook.cells || [])
      .filter(cell => cell.cell_type === 'markdown')
      .map(cell => stripHTML(renderMarkdown(this, cellText(cell.source))).trim())
      .find(Boolean)

    const data = {
      ...pickExtraFrontMatter(hexoMeta),
      title: hexoMeta.title || extractTitle(renderableNotebook, basename),
      layout: hexoMeta.layout || this.config.default_layout || 'post',
      source: file.path,
      raw: content,
      _content: rendered,
      content: rendered,
      excerpt: excerptSource ? `<p>${escapeHTML(excerptSource.slice(0, 180))}</p>` : undefined,
      slug: slugize(basename, { transform: this.config.filename_case }),
      published: file.params.published,
      date: normalizeDate(hexoMeta.date, stats.birthtime),
      updated: normalizeDate(hexoMeta.updated, stats.mtime),
      comments: hexoMeta.comments == null ? true : Boolean(hexoMeta.comments)
    }

    const categories = normalizeList(hexoMeta.categories || hexoMeta.category)
    const tags = normalizeList(hexoMeta.tags || hexoMeta.tag)

    const savePost = doc ? doc.replace(data) : Post.insert(data)
    return savePost.then(post => Promise.all([
      post.setCategories(categories),
      post.setTags(tags)
    ]))
  })
})

hexo.extend.injector.register('head_end', `<style>
.ipynb-notebook{--ipynb-border:rgba(127,127,127,.22);--ipynb-muted:rgba(127,127,127,.72);margin:1rem 0 0}
.ipynb-cell{margin:1.05rem 0}
.ipynb-markdown-cell>:first-child{margin-top:0}
.ipynb-markdown-cell>:last-child{margin-bottom:0}
.ipynb-input{display:grid;grid-template-columns:5.8rem minmax(0,1fr);gap:.8rem;align-items:start}
.ipynb-input-prompt{color:var(--ipynb-muted);font-family:Consolas,Monaco,monospace;font-size:.85rem;line-height:1.7;text-align:right;white-space:nowrap}
.ipynb-code-body{min-width:0}
.ipynb-code-body figure.highlight{margin:0}
.ipynb-outputs{margin:.55rem 0 0 6.6rem}
.ipynb-output{margin:.45rem 0;padding:.75rem .9rem;border:1px solid var(--ipynb-border);border-radius:6px;overflow:auto;white-space:pre-wrap;font-family:Consolas,Monaco,monospace;font-size:.9rem;line-height:1.55}
.ipynb-output.stderr,.ipynb-output.error{border-color:rgba(220,38,38,.35);background:rgba(220,38,38,.06)}
.ipynb-rich-output{overflow:auto}
.ipynb-image-output{display:block;max-width:100%;height:auto;margin:.65rem 0}
.ipynb-raw-cell pre{padding:.75rem .9rem;border:1px dashed var(--ipynb-border);border-radius:6px;overflow:auto}
@media (max-width:640px){.ipynb-input{grid-template-columns:1fr}.ipynb-input-prompt{text-align:left}.ipynb-outputs{margin-left:0}}
</style>`)
