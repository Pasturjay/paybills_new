import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const baseUrl = 'https://paybills.ng'

// Automatically scan src/app directory for routes
function getRoutes(dir: string, basePath = ''): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    let routes: string[] = []

    for (const entry of entries) {
        if (entry.name.startsWith('_')) continue
        if (entry.name.startsWith('(')) continue
        if (entry.name.startsWith('.')) continue
        // Skip private folders
        if (entry.name === 'api' || entry.name === 'dashboard' || entry.name === 'admin') continue

        const fullPath = path.join(dir, entry.name)
        const routePath = `${basePath}/${entry.name}`

        if (entry.isDirectory()) {
            routes = routes.concat(getRoutes(fullPath, routePath))
        }

        if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
            routes.push(basePath || '')
        }
    }

    return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
    // Note: In Next.js src layout, app is at src/app
    const appDir = path.join(process.cwd(), 'src', 'app')

    let routes: string[] = []

    try {
        routes = getRoutes(appDir)
    } catch (err) {
        console.error('Sitemap generation error:', err)
        routes = []
    }

    // Remove duplicates and system routes
    const filteredRoutes = Array.from(new Set(routes))
        .filter(route =>
            !route.includes('/api') &&
            !route.includes('/_') &&
            !route.includes('/404') &&
            !route.includes('/500')
        )

    return filteredRoutes.map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }))
}
