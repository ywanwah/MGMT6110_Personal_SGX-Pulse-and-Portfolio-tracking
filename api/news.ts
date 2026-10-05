import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const ALLOWED_TICKERS = [
  "D05.SI", "O39.SI", "U11.SI", "Z74.SI", "BN4.SI",
  "U96.SI", "F34.SI", "C38U.SI", "C6L.SI", "S63.SI"
];

const TICKER_NAMES: Record<string, string> = {
  "D05.SI": "DBS Group Holdings",
  "O39.SI": "Overseas-Chinese Banking Corp",
  "U11.SI": "United Overseas Bank",
  "Z74.SI": "Singtel Singapore Telecommunications",
  "BN4.SI": "Keppel Ltd",
  "U96.SI": "Sembcorp Industries",
  "F34.SI": "Wilmar International",
  "C38U.SI": "CapitaLand Integrated Commercial Trust",
  "C6L.SI": "Singapore Airlines",
  "S63.SI": "ST Engineering"
};

export async function fetchTickerNews(symbol: string) {
  if (!ALLOWED_TICKERS.includes(symbol)) {
    throw new Error("Invalid or unsupported ticker symbol.");
  }

  const companyName = TICKER_NAMES[symbol] || symbol;
  
  const [res1, res2] = await Promise.allSettled([
    yahooFinance.search(symbol, { quotesCount: 0, newsCount: 10 }),
    yahooFinance.search(companyName, { quotesCount: 0, newsCount: 10 })
  ]);

  const rawArticles: any[] = [];
  if (res1.status === 'fulfilled' && res1.value && Array.isArray(res1.value.news)) {
    rawArticles.push(...res1.value.news);
  }
  if (res2.status === 'fulfilled' && res2.value && Array.isArray(res2.value.news)) {
    rawArticles.push(...res2.value.news);
  }

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
    .slice(0, 12);

  return {
    success: true,
    symbol,
    source: "Yahoo Finance",
    retrievedAt: new Date().toISOString(),
    articles
  };
}

export default async function handler(req: any, res: any) {
  try {
    const symbol = req.query?.symbol || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('symbol') : null);
    if (!symbol || typeof symbol !== 'string') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: "Missing or invalid 'symbol' parameter." });
    }

    const data = await fetchTickerNews(symbol);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Ticker News API error:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve news." });
  }
}
