"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Bot, Check, ChevronDown, ChevronRight, Code2, Copy, File, FilePlus2, Folder, FolderOpen, HardDrive, Menu, MoreHorizontal, PanelLeftClose, PanelRightClose, Paperclip, Plus, Search, Send, Settings2, Sparkles, SquarePen, Trash2, Upload, X } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string }
type LocalFile = { id: number; name: string; kind: "file" | "folder"; updated: string; content?: string }

const seedFiles: LocalFile[] = [
  { id: 1, name: "welcome.md", kind: "file", updated: "Just now", content: "# Welcome\n\nA little space to think, write, and build.\n\nYour files stay in this browser session." },
  { id: 2, name: "project-notes.md", kind: "file", updated: "Yesterday", content: "## Project notes\n\n- Keep the experience simple\n- Let the editor work alongside chat\n- Make every action easy to find" },
  { id: 3, name: "Research", kind: "folder", updated: "Oct 28" },
  { id: 4, name: "ideas.txt", kind: "file", updated: "Oct 24", content: "Small ideas, gathered in one place." },
]

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: "Help me shape a simple workspace for thinking through a new project." },
    { role: "assistant", content: "Absolutely. Let’s make this feel like a clear desk: one place to talk things through, one flexible canvas for ideas, and a small file drawer to keep everything close.\n\nWhat are you working on today?" },
  ])
  const [prompt, setPrompt] = useState("")
  const [editorOpen, setEditorOpen] = useState(true)
  const [editorText, setEditorText] = useState("# Untitled note\n\nStart writing here — or ask your assistant to draft something for you.\n\nYour canvas is yours. Make it a plan, a letter, a sketch in words, or anything in between.")
  const [saved, setSaved] = useState(true)
  const [filesOpen, setFilesOpen] = useState(false)
  const [files, setFiles] = useState(seedFiles)
  const [selectedFile, setSelectedFile] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [toast, setToast] = useState("")

  const filteredFiles = useMemo(() => files.filter(file => file.name.toLowerCase().includes(query.toLowerCase())), [files, query])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200) }

  function sendMessage() {
    const text = prompt.trim()
    if (!text) return
    setMessages(current => [...current, { role: "user", content: text }, { role: "assistant", content: `That’s a good place to start. I can help you explore “${text}” further.\n\nWant to capture a thought in your canvas? I can draft, organize, or refine it with you.` }])
    setPrompt("")
  }

  function saveEditor() {
    setSaved(true)
    setFiles(current => {
      const existing = current.find(file => file.id === selectedFile)
      if (existing) return current.map(file => file.id === selectedFile ? { ...file, content: editorText, updated: "Just now" } : file)
      const note = { id: Date.now(), name: "untitled-note.md", kind: "file" as const, updated: "Just now", content: editorText }
      return [note, ...current]
    })
    notify("Canvas saved to your files")
  }

  function exportEditor() {
    const blob = new Blob([editorText], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "canvas-note.md"
    link.click()
    URL.revokeObjectURL(url)
    notify("Your note is ready to download")
  }

  function removeEditor() {
    setEditorText("")
    setSaved(false)
    setSelectedFile(null)
    notify("Canvas cleared")
  }

  function openFile(file: LocalFile) {
    if (file.kind === "folder") { notify(`${file.name} is empty`); return }
    setSelectedFile(file.id)
    setEditorText(file.content || "")
    setSaved(true)
    setFilesOpen(false)
    setEditorOpen(true)
  }

  function createFile(kind: "file" | "folder") {
    const id = Date.now()
    const name = kind === "file" ? `new-note-${files.length + 1}.md` : `New folder ${files.length + 1}`
    const file = { id, name, kind, updated: "Just now", content: kind === "file" ? "# New note\n\n" : undefined }
    setFiles(current => [file, ...current])
    if (kind === "file") openFile(file as LocalFile)
    notify(kind === "file" ? "New note created" : "Folder created")
  }

  return (
    <main className="workspace-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-mobile-open" : ""}`}>
        <div className="brand-row"><div className="brand-mark"><Sparkles size={16} strokeWidth={2.2} /></div><span className="brand-name">little<span>desk</span></span><button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X size={17} /></button></div>
        <button className="new-chat" onClick={() => { setMessages([]); setShowHistory(false); setMobileMenu(false) }}><Plus size={17} /> New conversation <span>⌘ K</span></button>
        <div className="side-section"><div className="section-label">WORKSPACE</div>
          <button className="nav-item active"><span className="nav-icon"><Bot size={16} /></span> Chat <span className="nav-dot" /></button>
          <button className="nav-item" onClick={() => { setEditorOpen(!editorOpen); setMobileMenu(false) }}><span className="nav-icon"><SquarePen size={16} /></span> Writing canvas <span className="nav-meta">{editorOpen ? "Open" : ""}</span></button>
          <button className="nav-item" onClick={() => { setFilesOpen(true); setMobileMenu(false) }}><span className="nav-icon"><Folder size={16} /></span> My files <span className="nav-meta">{files.length}</span></button>
        </div>
        <div className="side-section history-section"><button className="section-label history-toggle" onClick={() => setShowHistory(!showHistory)}>RECENT <ChevronDown size={13} className={showHistory ? "rotate" : ""} /></button>
          {showHistory && <div className="history-list"><button className="history-item selected-history"><span className="history-dot" /> Project workspace <span className="history-time">Now</span></button><button className="history-item"><span className="history-dot" /> Product launch ideas <span className="history-time">Yesterday</span></button><button className="history-item"><span className="history-dot" /> Weekend reading list <span className="history-time">Mon</span></button></div>}
        </div>
        <div className="sidebar-bottom"><div className="storage-card"><div className="storage-head"><span>YOUR SPACE</span><span>{files.length} items</span></div><div className="storage-meter"><span style={{ width: `${Math.min(24 + files.length * 3, 85)}%` }} /></div><div className="storage-caption">Stored locally in this browser</div></div><button className="profile-row"><div className="avatar">S</div><div className="profile-copy"><strong>Sam Taylor</strong><span>Personal workspace</span></div><MoreHorizontal size={17} /></button></div>
      </aside>

      <section className="main-column">
        <header className="topbar"><button className="icon-button mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={18} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Project workspace</strong></div><div className="top-actions"><div className="status-pill"><span /> All changes saved</div><button className="icon-button top-settings" aria-label="Settings"><Settings2 size={17} /></button></div></header>
        <div className="conversation-area">
          <div className="conversation-head"><div><div className="eyebrow">MONDAY, NOVEMBER 16</div><h1>A space to think clearly.</h1><p>Your ideas, in conversation.</p></div><button className="model-button"><span className="model-avatar"><Sparkles size={13} /></span> Claude Sonnet <ChevronDown size={14} /></button></div>
          <div className="messages" aria-live="polite">
            {messages.length === 0 ? <div className="empty-chat"><div className="empty-mark"><Sparkles size={21} /></div><h2>Where should we begin?</h2><p>Ask a question, share an idea, or start with one of these.</p><div className="suggestion-grid"><button onClick={() => setPrompt("Help me outline my next big idea")}>Help me outline an idea <ArrowUp size={14} /></button><button onClick={() => setPrompt("Turn my notes into a clear plan")}>Turn notes into a plan <ArrowUp size={14} /></button></div></div> : messages.map((message, index) => <article className={`message-row ${message.role}`} key={`${index}-${message.content.slice(0, 10)}`}>
              {message.role === "assistant" && <div className="assistant-avatar"><Sparkles size={14} /></div>}
              <div className="message-content">{message.role === "assistant" && <div className="message-author">Little desk <span>·</span> assistant</div>}<p>{message.content}</p>{message.role === "assistant" && <div className="message-tools"><button aria-label="Copy response" onClick={() => { void navigator.clipboard?.writeText(message.content); notify("Copied to clipboard") }}><Copy size={13} /></button><button aria-label="Add response to canvas" onClick={() => { setEditorText(value => `${value}\n\n${message.content}`.trim()); setSaved(false); setEditorOpen(true); notify("Added to canvas") }}><SquarePen size={13} /></button></div>}</div>
            </article>)}
          </div>
          <div className="composer-wrap"><div className="composer"><textarea aria-label="Message the assistant" placeholder="Ask anything, or share what’s on your mind…" value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage() } }} rows={2} /><div className="composer-bottom"><div className="composer-tools"><button className="composer-tool" aria-label="Attach a file" onClick={() => { setFilesOpen(true) }}><Paperclip size={15} /></button><span className="composer-hint">Shift + Enter for a new line</span></div><button className="send-button" aria-label="Send message" onClick={sendMessage} disabled={!prompt.trim()}><Send size={15} /></button></div></div><div className="composer-footnote">AI can make mistakes. Check important info.</div></div>
        </div>
      </section>

      <aside className={`editor-panel ${editorOpen ? "editor-visible" : "editor-hidden"}`}>
        <div className="editor-top"><div><div className="editor-overline">YOUR CANVAS</div><div className="editor-title-line"><h2>{selectedFile ? files.find(file => file.id === selectedFile)?.name || "Untitled note" : "Untitled note"}</h2><span className={`save-state ${saved ? "is-saved" : ""}`}><span />{saved ? "Saved" : "Unsaved"}</span></div></div><div className="editor-actions"><button className="icon-button" aria-label="Export note" title="Export note" onClick={exportEditor}><Upload size={16} /></button><button className="icon-button danger-hover" aria-label="Delete canvas content" title="Clear canvas" onClick={removeEditor}><Trash2 size={16} /></button><button className="icon-button editor-collapse" aria-label="Collapse editor" onClick={() => setEditorOpen(false)}><PanelRightClose size={16} /></button></div></div>
        <div className="editor-toolbar"><span><Code2 size={14} /> MARKDOWN</span><span>EDITABLE CANVAS</span></div>
        <textarea className="editor-text" aria-label="Writing canvas" value={editorText} onChange={event => { setEditorText(event.target.value); setSaved(false) }} spellCheck={false} />
        <div className="editor-footer"><span>{editorText.trim() ? editorText.trim().split(/\s+/).length : 0} words</span><span>Markdown supported</span><button onClick={saveEditor}><Check size={14} /> Save note</button></div>
      </aside>
      {!editorOpen && <button className="reopen-editor" onClick={() => setEditorOpen(true)}><PanelLeftClose size={15} /> Open canvas</button>}

      {filesOpen && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setFilesOpen(false) }}><section className="file-modal" role="dialog" aria-modal="true" aria-labelledby="files-title"><div className="modal-header"><div className="modal-title-wrap"><div className="modal-folder-icon"><HardDrive size={18} /></div><div><h2 id="files-title">Your files</h2><p>A simple home for your notes and ideas</p></div></div><button className="icon-button" aria-label="Close files" onClick={() => setFilesOpen(false)}><X size={18} /></button></div><div className="file-toolbar"><div className="file-search"><Search size={15} /><input aria-label="Search files" placeholder="Search files…" value={query} onChange={event => setQuery(event.target.value)} /></div><button className="new-file-button" onClick={() => createFile("file")}><FilePlus2 size={15} /> New note</button><button className="new-folder-button" aria-label="Create folder" title="Create folder" onClick={() => createFile("folder")}><Plus size={16} /></button></div><div className="file-path"><span>My files</span><ChevronRight size={13} /><span>All items</span></div><div className="file-list-head"><span>NAME</span><span>LAST UPDATED</span><span>TYPE</span><span /></div><div className="file-list">{filteredFiles.length ? filteredFiles.map(file => <div className="file-row" key={file.id} onDoubleClick={() => openFile(file)}><button className="file-name-button" onClick={() => openFile(file)}>{file.kind === "folder" ? <FolderOpen size={17} className="folder-color" /> : <File size={17} className="file-color" />}<span>{file.name}</span></button><span className="file-updated">{file.updated}</span><span className="file-type">{file.kind === "folder" ? "Folder" : "Markdown"}</span><button className="file-delete" aria-label={`Delete ${file.name}`} onClick={() => { setFiles(current => current.filter(item => item.id !== file.id)); if (selectedFile === file.id) { setSelectedFile(null); setEditorText("") } notify(`${file.name} deleted`) }}><Trash2 size={14} /></button></div>) : <div className="file-empty">No files match “{query}”</div>}</div><div className="modal-footer"><span><HardDrive size={13} /> This workspace is stored locally in your browser.</span><button onClick={() => setFilesOpen(false)}>Done</button></div></section></div>}
      {toast && <div className="toast-message" role="status"><Check size={15} /> {toast}</div>}
    </main>
  )
}
