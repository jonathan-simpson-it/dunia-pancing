import type { Metadata } from 'next'
import BlogView from '@/views/Blog'
import { BlogPost } from '@/types'
import blogData from '@/data/blog.json'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artikel dan tips seputar alat pancing, teknik memancing, dan gaya hidup dari Dunia Pancing Palembang.',
  openGraph: {
    title: 'Blog — Dunia Pancing Palembang',
    description: 'Artikel dan tips seputar alat pancing, teknik memancing, dan gaya hidup dari Dunia Pancing Palembang.',
  },
}

export default function Page() {
  const posts = blogData as BlogPost[]
  return <BlogView posts={posts} />
}
