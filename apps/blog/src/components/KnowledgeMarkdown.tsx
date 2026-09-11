import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import plaintext from 'highlight.js/lib/languages/plaintext'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { useMemo } from 'react'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('plaintext', plaintext)

const markdownParser = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, languageName) {
      const requestedLanguage = languageName.trim().toLowerCase()
      const language = requestedLanguage && hljs.getLanguage(requestedLanguage) ? requestedLanguage : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

interface KnowledgeMarkdownProps {
  content: string
}

/** 将飞书 Markdown 转为经过消毒的安全 HTML，并交由设计系统样式渲染。 */
export default function KnowledgeMarkdown({ content }: KnowledgeMarkdownProps) {
  const safeHtml = useMemo(() => {
    const html = markdownParser.parse(content, {
      breaks: true,
      gfm: true,
    }) as string

    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'button', 'textarea', 'select'],
    })
  }, [content])

  return <div className="knowledge-markdown" dangerouslySetInnerHTML={{ __html: safeHtml }} />
}