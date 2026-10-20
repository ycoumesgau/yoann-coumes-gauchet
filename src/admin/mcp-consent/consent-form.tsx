'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * The two buttons of the consent screen. A `fetch` rather than a native form,
 * so the sending and error states show in place; no `<form>`, so Enter does
 * not grant access. The destination comes from the server (`redirectTo`),
 * never from a page parameter.
 */
export function ConsentForm({ ticket }: { readonly ticket: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')

  const decide = async (decision: 'approve' | 'deny') => {
    setState('sending')
    try {
      const response = await fetch('/oauth/authorize', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, decision }),
      })
      const body = (await response.json().catch(() => null)) as { redirectTo?: unknown } | null
      if (response.ok && typeof body?.redirectTo === 'string') {
        window.location.assign(body.redirectTo)
        return
      }
      setState('error')
    } catch {
      setState('error')
    }
  }

  const sending = state === 'sending'
  return (
    <div>
      {state === 'error' ? (
        <p style={{ color: 'var(--theme-error-500)' }}>
          The decision was not recorded. Reload the page and try again.
        </p>
      ) : null}
      <Button
        buttonStyle="primary"
        disabled={sending}
        onClick={() => void decide('approve')}
        type="button"
      >
        {sending ? 'Allowing…' : 'Allow'}
      </Button>{' '}
      <Button
        buttonStyle="secondary"
        disabled={sending}
        onClick={() => void decide('deny')}
        type="button"
      >
        Deny
      </Button>
    </div>
  )
}
