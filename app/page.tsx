import { getFrameMetadata } from 'frog/web'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/api`,
  )
  return {
    other: frameTags,
  }
}

export default function Home() {
  return (
    <main>
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p>
            Head to{' '}
            <a
              href="/api/dev"
              style={{ display: 'inline', fontWeight: 'semibold' }}
            >
              <code>localhost:3000/api</code>
            </a>{' '}
            for your frame endpoint.
          </p>
        </div>
       
      </div>
    </main>
  )
}
