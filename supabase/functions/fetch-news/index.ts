import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Free RSS feeds from major news sources - no API key required!
const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'world' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC News', category: 'tech' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC News', category: 'business' },
  { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC News', category: 'entertainment' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC News', category: 'health' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times', category: 'world' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'New York Times', category: 'tech' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times', category: 'business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'New York Times', category: 'politics' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR', category: 'news' },
  { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR', category: 'politics' },
  { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR', category: 'tech' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'world' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'world' },
  { url: 'https://www.theguardian.com/uk/technology/rss', source: 'The Guardian', category: 'tech' },
  { url: 'https://www.theguardian.com/uk/business/rss', source: 'The Guardian', category: 'business' },
  { url: 'https://www.theguardian.com/uk/sport/rss', source: 'The Guardian', category: 'sports' },
  { url: 'https://rss.cnn.com/rss/edition_world.rss', source: 'CNN', category: 'world' },
  { url: 'https://rss.cnn.com/rss/edition_technology.rss', source: 'CNN', category: 'tech' },
  { url: 'https://rss.cnn.com/rss/money_news_international.rss', source: 'CNN', category: 'business' },
  { url: 'https://www.cbsnews.com/latest/rss/world', source: 'CBS News', category: 'world' },
  { url: 'https://www.cbsnews.com/latest/rss/technology', source: 'CBS News', category: 'tech' },
  { url: 'https://abcnews.go.com/abcnews/internationalheadlines', source: 'ABC News', category: 'world' },
]

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  imageUrl: string | null
  source: string
  category: string
}

// Parse RSS XML to extract articles
function parseRSS(xml: string, source: string, category: string): RSSItem[] {
  const items: RSSItem[] = []
  
  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    
    // Extract title
    const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i.exec(itemXml)
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : null
    
    // Extract link
    const linkMatch = /<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i.exec(itemXml) ||
                      /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i.exec(itemXml)
    const link = linkMatch ? linkMatch[1].trim() : null
    
    // Extract description/content
    const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemXml) ||
                      /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i.exec(itemXml) ||
                      /<summary>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i.exec(itemXml)
    let description = descMatch ? descMatch[1].trim() : ''
    
    // Clean HTML from description
    description = stripHTML(description)
    description = decodeHTMLEntities(description)
    
    // Extract pubDate
    const dateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(itemXml) ||
                      /<dc:date>(.*?)<\/dc:date>/i.exec(itemXml) ||
                      /<published>(.*?)<\/published>/i.exec(itemXml)
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString()
    
    // Extract image URL from various sources
    let imageUrl: string | null = null
    
    // Check media:content
    const mediaMatch = /<media:content[^>]*url=["']([^"']+)["'][^>]*\/?>/i.exec(itemXml)
    if (mediaMatch) imageUrl = mediaMatch[1]
    
    // Check media:thumbnail
    if (!imageUrl) {
      const thumbMatch = /<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*\/?>/i.exec(itemXml)
      if (thumbMatch) imageUrl = thumbMatch[1]
    }
    
    // Check enclosure
    if (!imageUrl) {
      const enclosureMatch = /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image[^"']*["'][^>]*\/?>/i.exec(itemXml)
      if (enclosureMatch) imageUrl = enclosureMatch[1]
    }
    
    // Check for img tag in description
    if (!imageUrl) {
      const imgMatch = /<img[^>]*src=["']([^"']+)["'][^>]*\/?>/i.exec(itemXml)
      if (imgMatch) imageUrl = imgMatch[1]
    }
    
    if (title && link) {
      items.push({
        title,
        link,
        description: description.substring(0, 2000), // Limit description length
        pubDate,
        imageUrl,
        source,
        category,
      })
    }
  }
  
  return items
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
  }
  
  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char)
  }
  
  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  return decoded
}

function mapCategoryToPostType(category: string): string {
  const mapping: Record<string, string> = {
    'world': 'world',
    'tech': 'tech',
    'technology': 'tech',
    'business': 'business',
    'politics': 'politics',
    'sports': 'sports',
    'sport': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'lifestyle': 'lifestyle',
    'news': 'news',
  }
  return mapping[category.toLowerCase()] || 'news'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting RSS feed fetch from multiple sources...')
    
    let totalInserted = 0
    let totalSkipped = 0
    let totalErrors = 0
    const feedResults: { source: string; fetched: number; inserted: number }[] = []

    // Fetch all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.log(`Fetching ${feed.source} (${feed.category})...`)
        
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        })
        
        if (!response.ok) {
          console.error(`Failed to fetch ${feed.source}: ${response.status}`)
          return { source: feed.source, fetched: 0, inserted: 0, items: [] }
        }
        
        const xml = await response.text()
        const items = parseRSS(xml, feed.source, feed.category)
        
        console.log(`Parsed ${items.length} items from ${feed.source}`)
        
        return { source: feed.source, fetched: items.length, inserted: 0, items }
      } catch (error) {
        console.error(`Error fetching ${feed.source}:`, error)
        return { source: feed.source, fetched: 0, inserted: 0, items: [] }
      }
    })
    
    const feedData = await Promise.all(feedPromises)
    
    // Collect all items from all feeds
    const allItems: RSSItem[] = []
    for (const feed of feedData) {
      allItems.push(...feed.items)
    }
    
    console.log(`Total items from all feeds: ${allItems.length}`)
    
    // Deduplicate by URL
    const seenUrls = new Set<string>()
    const uniqueItems = allItems.filter((item) => {
      if (seenUrls.has(item.link)) return false
      seenUrls.add(item.link)
      return true
    })
    
    console.log(`Unique items after dedup: ${uniqueItems.length}`)
    
    // Sort by date (newest first)
    uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    
    // Process items (limit to newest 100 to avoid overwhelming)
    const itemsToProcess = uniqueItems.slice(0, 100)
    
    for (const item of itemsToProcess) {
      // Check if article already exists by external_url
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('external_url', item.link)
        .maybeSingle()

      if (existing) {
        totalSkipped++
        continue
      }

      // Calculate reading time based on content length
      const wordCount = item.description.split(/\s+/).length
      const readingTime = Math.max(1, Math.ceil(wordCount / 200))
      
      // Build full content
      const fullContent = item.description + '\n\n---\n\nFor the complete article, visit the original source.'

      // Parse the publication date
      let createdAt: string
      try {
        createdAt = new Date(item.pubDate).toISOString()
      } catch {
        createdAt = new Date().toISOString()
      }

      // Insert the article
      const { error: insertError } = await supabase.from('posts').insert({
        title: item.title.substring(0, 500),
        subtitle: item.description.substring(0, 200) || null,
        content: fullContent,
        excerpt: item.description.substring(0, 150) || null,
        image_url: item.imageUrl,
        external_url: item.link,
        source_name: item.source,
        is_external: true,
        post_type: mapCategoryToPostType(item.category),
        status: 'published',
        reading_time: readingTime,
        author_id: null,
        created_at: createdAt,
      })

      if (insertError) {
        console.error(`Error inserting: ${item.title}`, insertError)
        if (insertError.code === '23505') {
          totalSkipped++
        } else {
          totalErrors++
        }
      } else {
        totalInserted++
      }
    }

    // Log the results
    console.log(`Completed: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`)
    
    // Create log entry
    await supabase.from('logs').insert({
      action: 'rss_news_fetch',
      details: {
        timestamp: new Date().toISOString(),
        total_feeds: RSS_FEEDS.length,
        total_items: allItems.length,
        unique_items: uniqueItems.length,
        inserted: totalInserted,
        skipped: totalSkipped,
        errors: totalErrors,
      },
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        feeds_processed: RSS_FEEDS.length,
        total_items: allItems.length,
        unique_items: uniqueItems.length,
        inserted: totalInserted, 
        skipped: totalSkipped,
        errors: totalErrors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
