import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import type { BlogCardPost } from '@/components/BlogCard'
import { BookOpen, Lightbulb, GraduationCap, FileText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any = { docs: [], page: 1, totalPages: 1, totalDocs: 0 }
  let formattedPosts: BlogCardPost[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
      },
    })

    // Transformiere in BlogCardPost Format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formattedPosts = posts.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      categories: doc.categories,
      meta: doc.meta,
      publishedAt: doc.publishedAt,
    }))
  } catch (error) {
    console.warn('Could not fetch posts:', error)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageClient />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-fuchsia-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Wissen rund um den Führerschein</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ratgeber & Tipps
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Hilfreiche Artikel, praktische Tipps und alles Wissenswerte rund um die Fahrausbildung – 
              von der Anmeldung bis zur bestandenen Prüfung.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/posts?category=theorie"
              className="group p-6 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 transition-all text-center"
            >
              <div className="w-12 h-12 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                Theorie lernen
              </h3>
              <p className="text-sm text-slate-500 mt-1">Tipps für die Theorieprüfung</p>
            </Link>
            
            <Link
              href="/posts?category=praxis"
              className="group p-6 rounded-2xl bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-200 transition-all text-center"
            >
              <div className="w-12 h-12 bg-fuchsia-100 group-hover:bg-fuchsia-200 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Lightbulb className="w-6 h-6 text-fuchsia-600" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-fuchsia-600 transition-colors">
                Praxis-Tipps
              </h3>
              <p className="text-sm text-slate-500 mt-1">Besser fahren lernen</p>
            </Link>
            
            <Link
              href="/posts?category=pruefung"
              className="group p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 transition-all text-center"
            >
              <div className="w-12 h-12 bg-cyan-100 group-hover:bg-cyan-200 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <GraduationCap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                Prüfung
              </h3>
              <p className="text-sm text-slate-500 mt-1">So bestehst du sicher</p>
            </Link>
            
            <Link
              href="/posts?category=kosten"
              className="group p-6 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-all text-center"
            >
              <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                Kosten & Förderung
              </h3>
              <p className="text-sm text-slate-500 mt-1">Sparen beim Führerschein</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Alle Artikel</h2>
              <PageRange
                collection="posts"
                currentPage={posts.page}
                limit={12}
                totalDocs={posts.totalDocs}
              />
            </div>
          </div>

          {formattedPosts.length > 0 ? (
            <CollectionArchive posts={formattedPosts} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Noch keine Artikel vorhanden
              </h3>
              <p className="text-slate-600">
                Bald findest du hier hilfreiche Ratgeber-Artikel.
              </p>
            </div>
          )}

          {posts.totalPages > 1 && posts.page && (
            <div className="mt-12">
              <Pagination page={posts.page} totalPages={posts.totalPages} />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Bereit für deinen Führerschein?
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
            Finde jetzt die perfekte Fahrschule in deiner Nähe und starte deine Ausbildung!
          </p>
          <Link
            href="/fahrschulen"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Fahrschulen finden
          </Link>
        </div>
      </section>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Ratgeber & Tipps | FahrschulFinder',
    description: 'Hilfreiche Artikel und Tipps rund um die Fahrausbildung. Alles Wissenswerte zu Theorie, Praxis, Prüfung und Kosten.',
  }
}
