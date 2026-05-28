import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostView from '@/views/BlogPost'
import { BlogPost } from '@/types'
import blogData from '@/data/blog.json'

const posts = blogData as BlogPost[]

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) notFound()
  return <BlogPostView post={post} />
}
