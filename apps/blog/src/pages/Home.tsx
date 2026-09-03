import { Button } from '@repo/shared'

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome to the Blog</h1>
      <p className="text-gray-600">
        This page renders the shared Button component from @repo/shared.
      </p>
      <div className="flex gap-3">
        <Button variant="primary">Read a post</Button>
        <Button variant="secondary">Subscribe</Button>
      </div>
    </section>
  )
}
