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

function postTitle(post: BlogPost, lang: string): string {
  return lang === 'en' ? post.title_en : post.title_id
}

function postExcerpt(post: BlogPost, lang: string): string {
  return lang === 'en' ? post.excerpt_en : post.excerpt_id
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) return {}
  const title = postTitle(post, 'id')
  const description = postExcerpt(post, 'id')
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) notFound()
  return <BlogPostView post={post} />
}
