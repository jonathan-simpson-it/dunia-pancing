import { Helmet } from 'react-helmet-async'

interface MetaTagsProps {
  title: string
  description?: string
}

export default function MetaTags({ title, description }: MetaTagsProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="id_ID" />
    </Helmet>
  )
}
