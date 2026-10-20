'use client'

import { useSyncExternalStore } from 'react'

import { modeKey } from './mode'

type Mode = 'light' | 'dark'

const readMode = (): Mode => (document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light')

/** Follows `data-mode` on the document, which the head script may have set before hydration. */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] })
  return () => observer.disconnect()
}

/** The Dark / Light button; its label names the mode it switches to. */
export function ThemeToggle({ dark, light }: { dark: string; light: string }) {
  const mode = useSyncExternalStore<Mode>(subscribe, readMode, () => 'light')
  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.mode = next
    try {
      localStorage.setItem(modeKey, next)
    } catch {
      // A browser that refuses storage still switches for this page.
    }
  }
  return (
    <button type="button" className="pill-button" onClick={toggle}>
      {mode === 'dark' ? light : dark}
    </button>
  )
}
