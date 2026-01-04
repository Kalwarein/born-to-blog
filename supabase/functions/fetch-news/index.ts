import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsArticle {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY')
    if (!NEWS_API_KEY) {
      console.error('NEWS_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'NewsAPI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch top headlines from NewsAPI
    console.log('Fetching news from NewsAPI...')
    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=20`,
      {
        headers: {
          'X-Api-Key': NEWS_API_KEY,
        },
      }
    )

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text()
      console.error('NewsAPI error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch news from NewsAPI', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newsData: NewsAPIResponse = await newsResponse.json()
    console.log(`Fetched ${newsData.articles?.length || 0} articles from NewsAPI`)

    if (!newsData.articles || newsData.articles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No articles found', inserted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter out articles with [Removed] content
    const validArticles = newsData.articles.filter(
      (article) => 
        article.title && 
        article.title !== '[Removed]' && 
        article.url
    )

    console.log(`${validArticles.length} valid articles after filtering`)

    let insertedCount = 0
    let skippedCount = 0

    for (const article of validArticles) {
      // Check if article already exists by external_url
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('external_url', article.url)
        .maybeSingle()

      if (existing) {
        console.log(`Skipping duplicate: ${article.title}`)
        skippedCount++
        continue
      }

      // Calculate reading time based on content length
      const wordCount = (article.content || article.description || '').split(/\s+/).length
      const readingTime = Math.max(1, Math.ceil(wordCount / 200))

      // Get system user for external news (or use a default UUID)
      // We'll use a fixed UUID for external news author
      const externalAuthorId = '00000000-0000-0000-0000-000000000000'

      // First, ensure we have this system user in profiles
      const { data: systemProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', externalAuthorId)
        .maybeSingle()

      if (!systemProfile) {
        // Create system profile for external news
        await supabase.from('profiles').insert({
          user_id: externalAuthorId,
          name: 'External News',
          email: 'external@borntoblog.com',
        })
      }

      // Insert the article
      const { error: insertError } = await supabase.from('posts').insert({
        title: article.title,
        subtitle: article.description?.substring(0, 200) || null,
        content: article.content || article.description || 'Read full article at source.',
        excerpt: article.description?.substring(0, 150) || null,
        image_url: article.urlToImage,
        external_url: article.url,
        source_name: article.source.name,
        is_external: true,
        post_type: 'news',
        status: 'published',
        reading_time: readingTime,
        author_id: externalAuthorId,
        created_at: article.publishedAt,
      })

      if (insertError) {
        console.error(`Error inserting article: ${article.title}`, insertError)
        // Check if it's a duplicate key error
        if (insertError.code === '23505') {
          skippedCount++
        }
      } else {
        console.log(`Inserted: ${article.title}`)
        insertedCount++
      }
    }

    console.log(`Completed: ${insertedCount} inserted, ${skippedCount} skipped`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: insertedCount, 
        skipped: skippedCount,
        total: validArticles.length 
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
