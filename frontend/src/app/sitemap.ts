import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://paybills.ng'

  // 🧾 Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/careers',
    '/products',
  ]

  // 🛒 Product pages
  const productPages = [
    '/products/airtime-data',
    '/products/bill-payment',
    '/products/virtual-cards',
    '/products/software',
    '/products/giftcards',
    '/products/games',
    '/products/education',
    '/products/betting',
  ]

  // ⚖️ Legal pages
  const legalPages = [
    '/legal/privacy',
    '/legal/terms',
    '/legal/refund',
  ]

  // 📰 Blog pages (future-ready)
  const blogPages: string[] = [
    // '/blog/how-to-buy-airtime',
    // '/blog/cheap-data-nigeria',
  ]

  const allPages = [...staticPages, ...productPages, ...legalPages, ...blogPages]

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency:
      path === ''
        ? 'daily'
        : path.includes('/products')
        ? 'daily'
        : path.includes('/legal')
        ? 'yearly' as const
        : 'weekly',
    priority:
      path === ''
        ? 1.0
        : path.includes('/products')
        ? 0.9
        : path.includes('/legal')
        ? 0.5
        : 0.7,
  }))
}
