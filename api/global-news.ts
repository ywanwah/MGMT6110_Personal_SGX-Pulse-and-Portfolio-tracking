import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const MACRO_TOPICS = [
  "global markets",
  "Federal Reserve markets",
  "Asia markets",
  "China economy markets",
  "Singapore economy markets",
  "oil prices markets",
  "interest rates markets"
];

export async function fetchGlobalNews() {
  const results = await Promise.allSettled(
    MACRO_TOPICS.map(topic => yahooFinance.search(topic, { quotesCount: 0, newsCount: 5 }))
  );

  const rawArticles: any[] = [];
  results.forEach(res => {
    if (res.status === 'fulfilled' && res.value && Array.isArray(res.value.news)) {
      rawArticles.push(...res.value.news);
    }
  });

  const seenUuids = new Set<string>();
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  const articles = rawArticles
    .filter((article: any) => {
      if (!article || !article.title || !article.link) return false;
      const uuid = article.uuid || article.link;
      const url = article.link;
      const normTitle = article.title.toLowerCase().trim();

      if (seenUuids.has(uuid) || seenUrls.has(url) || seenTitles.has(normTitle)) {
        return false;
      }

      seenUuids.add(uuid);
      seenUrls.add(url);
      seenTitles.add(normTitle);
      return true;
    })
    .map((article: any) => ({
      id: article.uuid || article.link,
      title: article.title,
      publisher: article.publisher || "Yahoo Finance",
      url: article.link,
      publishedAt: article.providerPublishTime ? (typeof article.providerPublishTime === 'number' ? article.providerPublishTime * 1000 : new Date(article.providerPublishTime).getTime()) : Date.now(),
      relatedTickers: article.relatedTickers || [],
      thumbnail: article.thumbnail?.resolutions?.[0]?.url || article.thumbnail?.url || null
    }))
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 15);

  return {
    success: true,
    source: "Yahoo Finance",
    retrievedAt: new Date().toISOString(),
    articles
  };
}

export default async function handler(req: any, res: any) {
  try {
    const data = await fetchGlobalNews();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Global News API error:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve global news." });
  }
}
