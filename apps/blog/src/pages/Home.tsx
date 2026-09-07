import { Button } from '@repo/shared'

import BookDemo from '../components/BookDemo'

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">
          Welcome to the Blog
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
          This page renders the shared Button component from @repo/shared.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Read a post</Button>
          <Button variant="secondary">Subscribe</Button>
        </div>
      </section>

      <BookDemo />
    </div>
  )
}
