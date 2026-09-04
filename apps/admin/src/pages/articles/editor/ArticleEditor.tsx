import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import FileHandler from '@tiptap/extension-file-handler'
import { App } from 'antd'
import { uploadImageToAliyun } from '../../../apis/upload'
import './articles.css'

/** 受控富文本编辑器，可被 antd Form.Item 直接注入 value / onChange */
interface ArticleEditorProps {
  value?: string
  onChange?: (html: string) => void
}

interface ToolbarButtonProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

/** 工具栏按钮：激活态使用荧光黄，保证键盘可达与可读标签 */
function ToolbarButton({ label, active = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-9 min-w-9 items-center justify-center rounded-none border border-transparent px-2 text-sm font-black transition-colors',
        active ? 'bg-accent text-ink' : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function ArticleEditor({ value = '', onChange }: ArticleEditorProps) {
  const { message } = App.useApp()

  /** 将粘贴 / 拖入的图片文件上传到阿里云，并插入到当前光标位置 */
  const uploadAndInsertImages = async (editor: Editor, files: File[]) => {
    console.log('[ArticleEditor] upload files', files.length, files.map((file) => file.type))
    const images = files.filter((file) => !file.type || file.type.startsWith('image/'))
    if (images.length === 0) return

    const key = `image-upload-${Date.now()}`
    message.open({ type: 'loading', content: '图片上传中…', key, duration: 0 })

    try {
      for (const file of images) {
        const url = await uploadImageToAliyun(file)
        editor.chain().focus().setImage({ src: url }).run()
      }
      message.open({ type: 'success', content: '图片上传成功', key })
    } catch (err) {
      message.open({
        type: 'error',
        content: err instanceof Error ? err.message : '图片上传失败',
        key,
      })
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      FileHandler.configure({
        consumePasteEvent: true,
        onPaste: (editor, files) => {
          void uploadAndInsertImages(editor, files)
        },
        onDrop: (editor, files) => {
          void uploadAndInsertImages(editor, files)
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'article-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      // 空文档统一为 ''，便于表单必填校验
      onChange?.(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  // 外部 value 变化（如编辑回填）时同步到编辑器
  useEffect(() => {
    if (!editor) return
    const next = value || ''
    if (editor.isEmpty && next === '') return
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next)
    }
  }, [value, editor])

  // 订阅 transaction，刷新工具栏按钮的激活态
  const [, forceRender] = useState(0)

  useEffect(() => {
    if (!editor) return
    const handler = () => forceRender((n) => n + 1)
    editor.on('transaction', handler)
    return () => {
      editor.off('transaction', handler)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="article-editor overflow-hidden rounded-none border border-hairline bg-surface">
      <div className="flex flex-wrap items-center gap-1 border-b border-hairline bg-surface-soft px-2 py-1">
        <ToolbarButton label="加粗" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton label="斜体" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </ToolbarButton>
        <ToolbarButton label="删除线" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolbarButton label="一级标题" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </ToolbarButton>
        <ToolbarButton label="二级标题" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="三级标题" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolbarButton label="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </ToolbarButton>
        <ToolbarButton label="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarButton>
        <ToolbarButton label="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarButton>
        <ToolbarButton label="代码块" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {'</>'}
        </ToolbarButton>
        <ToolbarButton label="分隔线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolbarButton label="撤销" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarButton>
        <ToolbarButton label="重做" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}