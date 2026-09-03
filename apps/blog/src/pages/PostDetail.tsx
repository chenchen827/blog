import { Link, useParams } from 'react-router'

export default function PostDetail() {
  const { id } = useParams()

  return (
    <section className="space-y-4">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back
      </Link>
      <h1 className="text-3xl font-bold">Post #{id}</h1>
      <p className="text-gray-600">This is the detail page for post {id}.</p>
    </section>
  )
}
