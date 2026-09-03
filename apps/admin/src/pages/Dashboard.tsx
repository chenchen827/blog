import { Button } from '@repo/shared'

export default function Dashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-600">
        Admin dashboard using the shared Button from @repo/shared.
      </p>
      <div className="flex gap-3">
        <Button variant="primary">Create post</Button>
        <Button variant="secondary">Export</Button>
      </div>
    </section>
  )
}
