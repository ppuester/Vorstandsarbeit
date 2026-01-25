import { cn } from '@/utilities/ui'
import React from 'react'
import { BlogCard, BlogCardPost } from '@/components/BlogCard'

import type { Post } from '@/payload-types'

export type Props = {
  posts: (Post | BlogCardPost)[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('w-full')}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post, index) => {
          if (typeof post === 'object' && post !== null) {
            return <BlogCard key={post.id || index} post={post} />
          }
          return null
        })}
      </div>
    </div>
  )
}
