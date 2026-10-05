import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Search, Filter, ShieldAlert, BarChart3, 
  Calendar, DollarSign, Activity, Award, Briefcase, ChevronRight, 
  Sparkles, RefreshCw, Layers, ArrowUpRight, ArrowDownRight, Zap,
  Info, PieChart, Sliders, CheckCircle2, Bookmark, ExternalLink, Grid,
  Newspaper, Globe, Clock, Tag, Plus, Trash2, Wallet, Database, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Area 
} from 'recharts';

interface Stock {
  code: string;
  name: string;
  sector: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  dataStatus?: string;
  twelveMonthAvg: number | null;
  twelveMonthTrimmedMean: number | null;
  forecast: {
    nextWeek: number;
    oneMonth: number;
    threeMonth: number;
    nextWeekConf: string;
    oneMonthConf: string;
    threeMonthConf: string;
    type?: string;
  } | null;
  historical: {
    month: string;
    price: number;
    shockFiltered: number;
  }[];
  metrics: {
    dataType: string;
    peRatio: number;
    dividendYield: number;
    marketCap: string | null;
    high52w: number | null;
    low52w: number | null;
    volatility: string | null;
    rsi: number;
    beta: number;
    analystConsensus: string;
  };
  description: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  volume?: string | null;
  marketOpen?: boolean;
  dataTimestamp?: string | null;
  source?: string;
}

interface PortfolioItem {
  id: string;
  code: string;
  units: number;
  purchasePrice: number;
}

interface MarketData {
  timestamp: string;
  source: string;
  exchange: string;
  stiIndex: {
    value: number | null;
    change: number | null;
    changePercent: number | null;
    dataStatus?: string;
    note?: string;
  };
  stocks: Stock[];
}

interface NewsArticle {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: number;
  relatedTickers: string[];
  thumbnail: string | null;
}

export default function App() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedStockCode, setSelectedStockCode] = useState<string>("D05.SI");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"terminal" | "portfolio" | "heatmap" | "stock-news" | "global-news">("terminal");
  const [watchlist, setWatchlist] = useState<string[]>(["D05.SI", "O39.SI", "Z74.SI"]);
  
  // Portfolio state
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioItem[]>([
    { id: "1", code: "D05.SI", units: 2000, purchasePrice: 35.00 },
    { id: "2", code: "Z74.SI", units: 5000, purchasePrice: 2.80 },
    { id: "3", code: "C38U.SI", units: 3000, purchasePrice: 1.95 }
  ]);
  const [newHoldingCode, setNewHoldingCode] = useState<string>("D05.SI");
  const [newHoldingUnits, setNewHoldingUnits] = useState<number>(1000);
  const [newHoldingPrice, setNewHoldingPrice] = useState<number>(38.50);

  // AI Analyst state
  const [aiReport, setAiReport] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiQuery, setAiQuery] = useState<string>("");

  // Calculator state
  const [calcShares, setCalcShares] = useState<number>(1000);

  // News state
  const [tickerNews, setTickerNews] = useState<NewsArticle[]>([]);
  const [globalNews, setGlobalNews] = useState<NewsArticle[]>([]);
  const [tickerNewsLoading, setTickerNewsLoading] = useState<boolean>(false);
  const [globalNewsLoading, setGlobalNewsLoading] = useState<boolean>(false);
  const [tickerNewsError, setTickerNewsError] = useState<string | null>(null);
  const [globalNewsError, setGlobalNewsError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await fetch('/api/stocks');
      const data = await res.json();
      if (data.success) {
        setMarketData(data);
        if (data.stocks && data.stocks.length > 0 && !selectedStockCode) {
          setSelectedStockCode(data.stocks[0].code);
        }
      } else {
        setApiError(data.error || "Failed to load market data");
      }
    } catch (err: any) {
      console.error("Failed to fetch market data:", err);
      setApiError(err.message || "Unable to load SGX market data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticker news when selectedStockCode changes
  useEffect(() => {
    if (selectedStockCode) {
      fetchTickerNews(selectedStockCode);
    }
  }, [selectedStockCode]);

  const fetchTickerNews = async (symbol: string) => {
    try {
      setTickerNewsLoading(true);
      setTickerNewsError(null);
      const res = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      if (data.success) {
        setTickerNews(data.articles || []);
      } else {
        setTickerNewsError(data.error || "Failed to load news");
      }
    } catch (err: any) {
      console.error("Failed to fetch ticker news:", err);
      setTickerNewsError("Unable to load news feed.");
    } finally {
      setTickerNewsLoading(false);
    }
  };

  // Fetch global news when activeTab === 'global-news'
  useEffect(() => {
    if (activeTab === 'global-news' && globalNews.length === 0) {
      fetchGlobalNews();
    }
  }, [activeTab]);

  const fetchGlobalNews = async () => {
    try {
      setGlobalNewsLoading(true);
      setGlobalNewsError(null);
      const res = await fetch('/api/global-news');
      const data = await res.json();
      if (data.success) {
        setGlobalNews(data.articles || []);
      } else {
        setGlobalNewsError(data.error || "Failed to load global news");
      }
    } catch (err: any) {
      console.error("Failed to fetch global news:", err);
      setGlobalNewsError("Global market news is temporarily unavailable.");
    } finally {
      setGlobalNewsLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const selectedStock = marketData?.stocks.find(s => s.code === selectedStockCode) || marketData?.stocks[0];

  const handleGenerateAiAnalysis = async (customPrompt?: string) => {
    if (!selectedStock) return;
    try {
      setAiLoading(true);
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stockCode: selectedStock.code, 
          query: customPrompt || aiQuery 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.analysis);
      } else {
        setAiReport("Failed to generate report.");
      }
    } catch (err) {
      console.error(err);
      setAiReport("Error connecting to AI Analyst service.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStock && selectedStock.price !== null) {
      handleGenerateAiAnalysis("Provide a thorough fundamental & quantitative outlook based on the shock-filtered trimmed mean.");
    }
  }, [selectedStockCode]);

  const toggleWatchlist = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlist.includes(code)) {
      setWatchlist(watchlist.filter(c => c !== code));
    } else {
      setWatchlist([...watchlist, code]);
    }
  };

  const addPortfolioHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoldingCode || newHoldingUnits <= 0) return;
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      code: newHoldingCode,
      units: Number(newHoldingUnits),
      purchasePrice: Number(newHoldingPrice)
    };
    setPortfolioHoldings([...portfolioHoldings, newItem]);
  };

  const removePortfolioHolding = (id: string) => {
    setPortfolioHoldings(portfolioHoldings.filter(h => h.id !== id));
  };

  const sectors = ["All", "Banking & Financials", "Telecommunications", "Conglomerate", "Utilities & Energy", "Consumer Goods & Agribusiness", "REITs", "Aviation & Transport", "Aerospace & Defense"];

  const filteredStocks = marketData?.stocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "All" || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  }) || [];

  // Compute sector aggregate heatmap metrics with shock-filtered forecast returns
  const sectorHeatmapData = sectors.filter(s => s !== "All").map(sectorName => {
    const sectorStocks = marketData?.stocks.filter(s => s.sector === sectorName && s.price !== null) || [];
    if (sectorStocks.length === 0) return null;

    const avgVol = sectorStocks.reduce((acc, s) => acc + parseFloat(s.metrics.volatility || '12'), 0) / sectorStocks.length;
    const avgYield = sectorStocks.reduce((acc, s) => acc + s.metrics.dividendYield, 0) / sectorStocks.length;
    const avgBeta = sectorStocks.reduce((acc, s) => acc + s.metrics.beta, 0) / sectorStocks.length;
    
    const avgWeekReturn = sectorStocks.reduce((acc, s) => {
      if (!s.forecast || s.twelveMonthTrimmedMean === null) return acc;
      const ret = ((s.forecast.nextWeek - s.twelveMonthTrimmedMean) / s.twelveMonthTrimmedMean) * 100;
      return acc + ret;
    }, 0) / sectorStocks.length;

    const avgMonthReturn = sectorStocks.reduce((acc, s) => {
      if (!s.forecast || s.twelveMonthTrimmedMean === null) return acc;
      const ret = ((s.forecast.oneMonth - s.twelveMonthTrimmedMean) / s.twelveMonthTrimmedMean) * 100;
      return acc + ret;
    }, 0) / sectorStocks.length;

    const avg3MonthReturn = sectorStocks.reduce((acc, s) => {
      if (!s.forecast || s.twelveMonthTrimmedMean === null) return acc;
      const ret = ((s.forecast.threeMonth - s.twelveMonthTrimmedMean) / s.twelveMonthTrimmedMean) * 100;
      return acc + ret;
    }, 0) / sectorStocks.length;

    return {
      sector: sectorName,
      stockCount: sectorStocks.length,
      avgVolatility: avgVol.toFixed(1),
      avgDividendYield: avgYield.toFixed(2),
      avgBeta: avgBeta.toFixed(2),
      avgWeekReturn: avgWeekReturn.toFixed(2),
      avgMonthReturn: avgMonthReturn.toFixed(2),
      avg3MonthReturn: avg3MonthReturn.toFixed(2),
      stocks: sectorStocks
    };
  }).filter(Boolean);

  const getRecommendation = (stock: Stock, horizon: 'week' | 'month' | '3month') => {
    if (stock.price === null || !stock.forecast) return { label: "N/A", color: "text-slate-400 bg-slate-800 border-slate-700" };
    let target = stock.price;
    if (horizon === 'week') target = stock.forecast.nextWeek;
    if (horizon === 'month') target = stock.forecast.oneMonth;
    if (horizon === '3month') target = stock.forecast.threeMonth;

    const diffPercent = ((target - stock.price) / stock.price) * 100;
    if (diffPercent > 1.5) return { label: "BUY", color: "text-emerald-400 bg-emerald-950/80 border-emerald-800" };
    if (diffPercent < -1.0) return { label: "SELL", color: "text-rose-400 bg-rose-950/80 border-rose-800" };
    return { label: "HOLD", color: "text-amber-400 bg-amber-950/80 border-amber-800" };
  };

  const getNextDividendInfo = (code: string) => {
    const dates: Record<string, { date: string; amount: string }> = {
      "D05.SI": { date: "28 Nov 2026", amount: "0.54 SGD" },
      "O39.SI": { date: "15 Dec 2026", amount: "0.42 SGD" },
      "U11.SI": { date: "10 Jan 2027", amount: "0.85 SGD" },
      "Z74.SI": { date: "30 Nov 2026", amount: "0.098 SGD" },
      "BN4.SI": { date: "22 Dec 2026", amount: "0.20 SGD" },
      "U96.SI": { date: "14 Dec 2026", amount: "0.22 SGD" },
      "F34.SI": { date: "05 Jan 2027", amount: "0.11 SGD" },
      "C38U.SI": { date: "28 Nov 2026", amount: "0.029 SGD" },
      "C6L.SI": { date: "18 Dec 2026", amount: "0.38 SGD" },
      "S63.SI": { date: "12 Dec 2026", amount: "0.16 SGD" }
    };
    return dates[code] || { date: "15 Dec 2026", amount: "0.25 SGD" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">SGX Pulse</span>
            <span className="text-xs text-emerald-400 font-mono ml-2.5 hidden sm:inline-block">LIVE EQUITY & TREND ANALYTICS</span>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'terminal' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Equity Terminal</span>
          </button>
          <button 
            onClick={() => setActiveTab("portfolio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Portfolio</span>
          </button>
          <button 
            onClick={() => setActiveTab("heatmap")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'heatmap' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Volatility Heatmap</span>
          </button>
          <button 
            onClick={() => setActiveTab("stock-news")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'stock-news' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Ticker News</span>
          </button>
          <button 
            onClick={() => setActiveTab("global-news")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'global-news' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Macro News</span>
          </button>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          {marketData && (
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Yahoo Finance</span>
            </div>
          )}
          <button 
            onClick={fetchStocks}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && !marketData ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm font-mono text-slate-400">Retrieving live SGX quotes from Yahoo Finance...</p>
          </div>
        ) : apiError && !marketData ? (
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Market Data Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{apiError}</p>
            <button 
              onClick={fetchStocks}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : marketData && selectedStock ? (
          <>
            {activeTab === 'portfolio' ? (
              /* My Portfolio Tab */
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <span>My SGX Investment Portfolio & Recommendations</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage your SGX stock holdings, track portfolio valuation, Yahoo Finance-derived prices, dividend yields, and forecast signals.
                    </p>
                  </div>
                  
                  {/* Portfolio Quick Add Form */}
                  <form onSubmit={addPortfolioHolding} className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <select 
                      value={newHoldingCode} 
                      onChange={(e) => {
                        setNewHoldingCode(e.target.value);
                        const found = marketData.stocks.find(s => s.code === e.target.value);
                        if (found && found.price !== null) setNewHoldingPrice(found.price);
                      }}
                      className="bg-slate-900 text-xs font-mono text-white rounded-lg px-3 py-2 border border-slate-800 focus:outline-none"
                    >
                      {marketData.stocks.map(st => (
                        <option key={st.code} value={st.code}>{st.code} - {st.name}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      placeholder="Units" 
                      value={newHoldingUnits}
                      onChange={(e) => setNewHoldingUnits(Number(e.target.value))}
                      className="w-20 bg-slate-900 text-xs font-mono text-white rounded-lg px-3 py-2 border border-slate-800 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>
                </div>

                {/* Portfolio Summary Metrics */}
                {(() => {
                  let totalValue = 0;
                  let totalInvested = 0;
                  let totalAnnualDividends = 0;

                  portfolioHoldings.forEach(h => {
                    const st = marketData.stocks.find(s => s.code === h.code);
                    if (st && st.price !== null) {
                      const curVal = h.units * st.price;
                      const invVal = h.units * h.purchasePrice;
                      const divVal = (curVal * st.metrics.dividendYield) / 100;
                      totalValue += curVal;
                      totalInvested += invVal;
                      totalAnnualDividends += divVal;
                    }
                  });

                  const totalGainLoss = totalValue - totalInvested;
                  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Portfolio Value</div>
                        <div className="text-2xl font-bold font-mono text-white tabular-nums">
                          {totalValue > 0 ? totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'} <span className="text-xs font-sans text-slate-400">SGD</span>
                        </div>
                        <div className={`text-xs font-mono mt-1 ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {totalValue > 0 ? `${totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} SGD (${totalGainLossPercent.toFixed(2)}%)` : 'Market data unavailable'}
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Cost Basis</div>
                        <div className="text-2xl font-bold font-mono text-slate-300 tabular-nums">
                          {totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-sans text-slate-400">SGD</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Initial invested capital</div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Est. Annual Dividend Income</div>
                        <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                          {totalAnnualDividends > 0 ? totalAnnualDividends.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'} <span className="text-xs font-sans text-emerald-400/80">SGD</span>
                        </div>
                        <div className="text-xs text-emerald-400/80 mt-1">
                          Static reference yield
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Active Holdings</div>
                        <div className="text-2xl font-bold font-mono text-teal-300 tabular-nums">
                          {portfolioHoldings.length} <span className="text-xs font-sans text-slate-400">Tickers</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Diversified SGX equities</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Holdings Table with Recommendations */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-800 font-semibold text-sm text-white flex items-center justify-between">
                    <span>Portfolio Holdings & Forecast Signals</span>
                    <span className="text-xs text-slate-400 font-normal">Pricing via Yahoo Finance</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Ticker / Company</th>
                          <th className="p-3.5">Units / Price</th>
                          <th className="p-3.5">Portfolio Value</th>
                          <th className="p-3.5">Div. Yield</th>
                          <th className="p-3.5">Next Pay Date</th>
                          <th className="p-3.5 text-center">1W Signal</th>
                          <th className="p-3.5 text-center">1M Signal</th>
                          <th className="p-3.5 text-center">3M Signal</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {portfolioHoldings.map(h => {
                          const st = marketData.stocks.find(s => s.code === h.code);
                          if (!st) return null;
                          const val = st.price !== null ? h.units * st.price : null;
                          const divInfo = getNextDividendInfo(st.code);
                          const recWeek = getRecommendation(st, 'week');
                          const recMonth = getRecommendation(st, 'month');
                          const rec3Month = getRecommendation(st, '3month');

                          return (
                            <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-white font-mono">{st.code}</div>
                                <div className="text-slate-400 truncate max-w-[160px]">{st.name}</div>
                              </td>
                              <td className="p-3.5 font-mono">
                                <div>{h.units.toLocaleString()} units</div>
                                <div className="text-emerald-400 font-semibold">
                                  {st.price !== null ? `${st.price.toFixed(2)} SGD` : <span className="text-rose-400">Market data unavailable</span>}
                                </div>
                              </td>
                              <td className="p-3.5 font-mono font-bold text-white tabular-nums">
                                {val !== null ? `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} SGD` : <span className="text-rose-400">N/A</span>}
                              </td>
                              <td className="p-3.5 font-mono text-emerald-400">
                                {st.metrics.dividendYield}% <span className="text-[10px] text-slate-500">(Static)</span>
                              </td>
                              <td className="p-3.5 font-mono text-slate-300">
                                <div>{divInfo.date}</div>
                                <div className="text-[10px] text-slate-500">{divInfo.amount}</div>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-md font-mono font-semibold text-[10px] border ${recWeek.color}`}>
                                  {recWeek.label}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-md font-mono font-semibold text-[10px] border ${recMonth.color}`}>
                                  {recMonth.label}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-md font-mono font-semibold text-[10px] border ${rec3Month.color}`}>
                                  {rec3Month.label}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button 
                                  onClick={() => removePortfolioHolding(h.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                                  title="Remove Holding"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'heatmap' ? (
              /* Sector Volatility Heatmap View */
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Grid className="w-5 h-5 text-emerald-400" />
                        <span>SGX Sector Volatility & Model-Generated Forecast Returns</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        At-a-glance risk-adjusted sectoral comparison relative to the Straits Times Index, derived from noise-free trimmed baseline means. Click any sector to filter terminal.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Filter Terminal:</span>
                      <select 
                        value={selectedSector}
                        onChange={(e) => {
                          setSelectedSector(e.target.value);
                          setActiveTab("terminal");
                        }}
                        className="bg-slate-950 text-xs font-mono font-bold text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
                      >
                        {sectors.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sectorHeatmapData?.map((item: any) => {
                    const isStable = parseFloat(item.avgVolatility) < 14;
                    const isHighYield = parseFloat(item.avgDividendYield) > 5.0;
                    const cardBorder = isStable && isHighYield ? 'border-emerald-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30' : 'border-slate-800 bg-slate-900';

                    return (
                      <div 
                        key={item.sector}
                        onClick={() => {
                          setSelectedSector(item.sector);
                          setActiveTab("terminal");
                        }}
                        className={`${cardBorder} border rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {item.sector}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.stockCount} SGX Equities</p>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isStable ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-amber-950/80 text-amber-400 border-amber-800'}`}>
                            {isStable ? 'Low Risk / Stable' : 'Moderate Volatility'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                            <div className="text-[10px] text-slate-400">Volatility</div>
                            <div className="text-sm font-bold font-mono text-white mt-0.5">{item.avgVolatility}%</div>
                          </div>
                          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                            <div className="text-[10px] text-slate-400">Div Yield</div>
                            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{item.avgDividendYield}%</div>
                          </div>
                          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                            <div className="text-[10px] text-slate-400">Beta vs STI</div>
                            <div className="text-sm font-bold font-mono text-teal-300 mt-0.5">{item.avgBeta}</div>
                          </div>
                        </div>

                        {/* Forecast Return Horizons (1W, 1M, 3M) */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                          <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
                            <span>Shock-Free Forecast Returns</span>
                            <span className="text-emerald-400">Trimmed Mean</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                              <div className="text-[9px] text-slate-400">1 Week</div>
                              <div className={`text-xs font-bold ${parseFloat(item.avgWeekReturn) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {parseFloat(item.avgWeekReturn) >= 0 ? '+' : ''}{item.avgWeekReturn}%
                              </div>
                            </div>
                            <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                              <div className="text-[9px] text-slate-400">1 Month</div>
                              <div className={`text-xs font-bold ${parseFloat(item.avgMonthReturn) >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                {parseFloat(item.avgMonthReturn) >= 0 ? '+' : ''}{item.avgMonthReturn}%
                              </div>
                            </div>
                            <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                              <div className="text-[9px] text-slate-400">3 Month</div>
                              <div className={`text-xs font-bold ${parseFloat(item.avg3MonthReturn) >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                {parseFloat(item.avg3MonthReturn) >= 0 ? '+' : ''}{item.avg3MonthReturn}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Constituents:</span>
                            <span className="text-emerald-400 flex items-center gap-0.5 group-hover:underline">
                              View sector <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.stocks.map((st: any) => (
                              <span key={st.code} className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                {st.code} ({st.price !== null ? st.price.toFixed(2) : 'N/A'})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === 'stock-news' ? (
              /* Stock Ticker Specific Financial News Tab */
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-emerald-400" />
                      <span>Financial News & Catalysts for {selectedStock.name} ({selectedStock.code})</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Recent ticker-related financial news retrieved via Yahoo Finance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Active Ticker:</span>
                    <select 
                      value={selectedStockCode}
                      onChange={(e) => setSelectedStockCode(e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold text-emerald-400 focus:outline-none cursor-pointer"
                    >
                      {marketData.stocks.map(st => (
                        <option key={st.code} value={st.code} className="bg-slate-900 text-white">
                          {st.code} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {tickerNewsLoading ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
                    Loading Yahoo Finance news for {selectedStock.code}...
                  </div>
                ) : tickerNewsError ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-rose-400 text-xs">
                    {tickerNewsError}
                  </div>
                ) : tickerNews.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                    No recent Yahoo Finance news found for {selectedStock.code}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {tickerNews.map(article => (
                      <div key={article.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className="font-semibold text-emerald-400">News source: Yahoo Finance</span>
                              <span>·</span>
                              <span className="text-slate-300 font-medium">Publisher: {article.publisher}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(article.publishedAt)}</span>
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-white leading-snug">
                            {article.title}
                          </h3>

                          {article.relatedTickers && article.relatedTickers.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {article.relatedTickers.map((t: string) => (
                                <span key={t} className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-teal-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                          >
                            Read article <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'global-news' ? (
              /* Global Financial News Tab */
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <span>Global Macroeconomic & Financial News</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Current global financial and macroeconomic headlines retrieved via Yahoo Finance.
                    </p>
                  </div>
                  <button
                    onClick={fetchGlobalNews}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors self-start md:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${globalNewsLoading ? 'animate-spin' : ''}`} /> Sync Global News
                  </button>
                </div>

                {globalNewsLoading ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
                    Loading global macroeconomic news from Yahoo Finance...
                  </div>
                ) : globalNewsError ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-rose-400 text-xs">
                    {globalNewsError}
                  </div>
                ) : globalNews.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                    Global market news is temporarily unavailable.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {globalNews.map(article => (
                      <div key={article.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-emerald-400">{article.publisher}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(article.publishedAt)}</span>
                          </div>

                          <h3 className="text-base font-semibold text-white leading-snug">
                            {article.title}
                          </h3>
                        </div>

                        <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-mono">Source: Yahoo Finance</span>
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                          >
                            Read article <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Equity Terminal View */
              <>
                {/* Top Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Selected Stock Today Price */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Selected Equity</span>
                      <span className="font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">{selectedStock.code}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                          {selectedStock.price !== null ? selectedStock.price.toFixed(2) : <span className="text-rose-400 text-lg">Unavailable</span>} <span className="text-xs font-sans text-slate-400">{selectedStock.currency}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[180px]">{selectedStock.name}</div>
                      </div>
                      {selectedStock.change !== null && selectedStock.changePercent !== null ? (
                        <div className={`flex items-center text-sm font-mono font-semibold px-2 py-1 rounded-lg ${selectedStock.change >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                          {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent}%)
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Card 2: 12-Month Simple Average */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>12-Month Simple Avg</span>
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold font-mono tracking-tight text-slate-200 tabular-nums">
                      {selectedStock.twelveMonthAvg !== null ? selectedStock.twelveMonthAvg.toFixed(2) : 'N/A'} <span className="text-xs font-sans text-slate-400">{selectedStock.currency}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Arithmetic mean baseline</div>
                  </div>

                  {/* Card 3: 12-Month Shock-Filtered Mean */}
                  <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl p-4 shadow-sm bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20">
                    <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-medium">
                      <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Shock-Filtered Mean</span>
                      <span className="text-[10px] bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded">Noise-Free</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tracking-tight text-emerald-300 tabular-nums">
                      {selectedStock.twelveMonthTrimmedMean !== null ? selectedStock.twelveMonthTrimmedMean.toFixed(2) : 'N/A'} <span className="text-xs font-sans text-emerald-400/80">{selectedStock.currency}</span>
                    </div>
                    <div className="text-xs text-emerald-400/70 mt-1">10% trimmed mean baseline</div>
                  </div>

                  {/* Card 4: 1-Month Forecast */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Forecast (1 Month)</span>
                      <span className="font-mono text-xs text-teal-400">Model-generated</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tracking-tight text-teal-300 tabular-nums">
                      {selectedStock.forecast ? selectedStock.forecast.oneMonth.toFixed(2) : 'N/A'} <span className="text-xs font-sans text-slate-400">{selectedStock.currency}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Model forecast horizon</div>
                  </div>
                </div>

                {/* Main Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left 2 Cols: Stock Picker, Interactive Chart, Forecast Breakdown */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Stock Selector & Filter Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search SGX stocks by name or code (e.g. DBS, D05.SI, Singtel)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                          <select 
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                          >
                            {sectors.map(sec => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Stock Quick Selector Chips */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {filteredStocks.map(stock => {
                          const isSelected = stock.code === selectedStock.code;
                          const isWatched = watchlist.includes(stock.code);
                          return (
                            <button
                              key={stock.code}
                              onClick={() => setSelectedStockCode(stock.code)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 border ${
                                isSelected 
                                  ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-md shadow-emerald-950' 
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              <span className="font-mono text-emerald-400">{stock.code}</span>
                              <span className="max-w-[100px] truncate">{stock.name}</span>
                              <span className={`font-mono ${stock.change !== null && stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {stock.price !== null ? stock.price.toFixed(2) : 'N/A'}
                              </span>
                              <span 
                                onClick={(e) => toggleWatchlist(stock.code, e)}
                                className={`p-0.5 rounded hover:text-amber-400 ${isWatched ? 'text-amber-400' : 'text-slate-600'}`}
                                title="Toggle Watchlist"
                              >
                                <Bookmark className="w-3 h-3 fill-current" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Price Chart with Shock-Filtered Comparison */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <span>{selectedStock.name} ({selectedStock.code})</span>
                            <span className="text-xs font-normal text-slate-400">· {selectedStock.sector}</span>
                          </h2>
                          <p className="text-xs text-slate-400">Trailing 12-Month Price Action vs. Shock-Filtered Trimmed Mean</p>
                        </div>
                      </div>

                      <div className="h-72 w-full pt-2">
                        {selectedStock.historical.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={selectedStock.historical} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                                formatter={(value: any) => [`${Number(value).toFixed(2)} SGD`, '']}
                              />
                              <Area type="monotone" dataKey="price" name="Actual Price" fill="#10b981" fillOpacity={0.08} stroke="#10b981" strokeWidth={2} />
                              <Line type="monotone" dataKey="shockFiltered" name="Shock-Filtered Mean" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-xs">Chart data unavailable</div>
                        )}
                      </div>
                    </div>

                    {/* Forecast Horizons Grid */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Model-Generated Forecast Horizons</h3>
                      
                      {selectedStock.forecast ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Next Week Forecast</span>
                              <span className="font-mono text-emerald-400">Model-generated</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-white tabular-nums">
                              {selectedStock.forecast.nextWeek.toFixed(2)} <span className="text-xs font-sans text-slate-400">SGD</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>1 Month Forecast</span>
                              <span className="font-mono text-teal-400">Model-generated</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-teal-300 tabular-nums">
                              {selectedStock.forecast.oneMonth.toFixed(2)} <span className="text-xs font-sans text-slate-400">SGD</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>3 Month Forecast</span>
                              <span className="font-mono text-cyan-400">Model-generated</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                              {selectedStock.forecast.threeMonth.toFixed(2)} <span className="text-xs font-sans text-slate-400">SGD</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">Forecast unavailable</div>
                      )}
                    </div>

                  </div>

                  {/* Right Col: AI Institutional Analyst Report & Fundamentals */}
                  <div className="space-y-6">
                    
                    {/* AI Institutional Research Briefing */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">AI Institutional Analyst</h3>
                            <p className="text-[11px] text-slate-400">Powered by Gemini 3.8 Flash</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleGenerateAiAnalysis()} 
                          disabled={aiLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          <span>Refresh</span>
                        </button>
                      </div>

                      {/* AI Report Content */}
                      <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 max-h-[420px] overflow-y-auto text-xs text-slate-300 space-y-3 leading-relaxed scrollbar-thin">
                        {aiLoading ? (
                          <div className="flex flex-col items-center justify-center py-16 space-y-3">
                            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                            <p className="text-slate-400">Synthesizing institutional research report...</p>
                          </div>
                        ) : aiReport ? (
                          <div className="whitespace-pre-wrap font-sans">
                            {aiReport}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-center py-8">Select a stock to generate AI analyst commentary.</p>
                        )}
                      </div>
                    </div>

                    {/* Key Fundamental Metrics */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Fundamental & Risk Metrics</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Static Reference</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">P/E Ratio</span>
                          <span className="font-mono font-medium text-white tabular-nums">{selectedStock.metrics.peRatio}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Dividend Yield</span>
                          <span className="font-mono font-medium text-emerald-400 tabular-nums">{selectedStock.metrics.dividendYield}%</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">52-Week Range</span>
                          <span className="font-mono font-medium text-white tabular-nums">
                            {selectedStock.metrics.low52w !== null ? selectedStock.metrics.low52w : 'N/A'} - {selectedStock.metrics.high52w !== null ? selectedStock.metrics.high52w : 'N/A'} SGD
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">RSI (14-day)</span>
                          <span className="font-mono font-medium text-teal-400 tabular-nums">{selectedStock.metrics.rsi}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Beta vs STI</span>
                          <span className="font-mono font-medium text-white tabular-nums">{selectedStock.metrics.beta}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-slate-400">Analyst Consensus</span>
                          <span className="font-mono font-semibold text-emerald-400">{selectedStock.metrics.analystConsensus}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <p className="italic">"{selectedStock.description}"</p>
                      </div>
                    </div>

                    {/* Dividend & Return Calculator */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Dividend & Return Calculator</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Number of Shares</label>
                          <input 
                            type="number" 
                            value={calcShares} 
                            onChange={(e) => setCalcShares(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Investment:</span>
                            <span className="font-mono font-semibold text-white tabular-nums">
                              {selectedStock.price !== null ? (calcShares * selectedStock.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'} SGD
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Estimated Annual Dividend:</span>
                            <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                              {selectedStock.price !== null ? ((calcShares * selectedStock.price * selectedStock.metrics.dividendYield) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'} SGD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-32 text-slate-400">Market data unavailable.</div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6 px-6 text-center text-xs text-slate-500">
        SGX Pulse Institutional Analytics · Built for Advanced Financial Analysts & Portfolio Managers
      </footer>
    </div>
  );
}
