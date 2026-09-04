import { Link, useParams } from 'react-router'

export default function PostDetail() {
  const { id } = useParams()

  return (
    <section className="space-y-6">
      <Link to="/" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
        ← Back
      </Link>
      <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">
        Post #{id}
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
        This is the detail page for post {id}.
      </p>
    </section>
  )
}
