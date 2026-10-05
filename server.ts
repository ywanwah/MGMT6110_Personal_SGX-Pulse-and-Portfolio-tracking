import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fetchStocksAndIndex } from './api/stocks.ts';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.get('/api/stocks', async (req, res) => {
  try {
    const data = await fetchStocksAndIndex();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Stocks API error:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to retrieve Yahoo Finance market data."
    });
  }
});

app.post('/api/ai-analysis', async (req, res) => {
  try {
    const { stockCode, query } = req.body;
    
    let marketContext = "Current market price unavailable.";
    try {
      const data = await fetchStocksAndIndex();
      const stock = data.stocks.find(s => s.code === stockCode);
      if (stock && stock.price !== null) {
        marketContext = `
Ticker: ${stock.code}
Company: ${stock.name}
Current market price: S$${stock.price}
Previous close: S$${stock.previousClose ?? 'N/A'}
Daily change: ${stock.changePercent != null ? stock.changePercent + '%' : 'N/A'}
Market-data classification: ${stock.dataStatus}
Source: ${stock.source}
Timestamp: ${stock.dataTimestamp}
`;
      }
    } catch (e) {
      console.warn("Could not fetch Yahoo Finance market data for AI context:", e);
    }

    const prompt = `You are an elite, highly specialized financial analyst and senior equity strategist covering the Singapore Exchange (SGX).
AUTHORITATIVE CURRENT MARKET CONTEXT:
${marketContext}

Treat the supplied Yahoo Finance market data as authoritative current-price context. Do not invent another current stock price.
Additional User Query or Focus: ${query || "Provide comprehensive investment thesis, fundamental strength, macroeconomic drivers, and quantitative valuation."}

Format the response cleanly in markdown with structured sections:
1. Executive Investment Thesis & Summary
2. Quantitative Trend Analysis (Highlighting shock-filtered trimmed mean baseline)
3. Price Forecast Rationale & Probability Assessment (1-Week, 1-Month, 3-Month)
4. Key Fundamental Risks & Catalysts
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a top-tier Wall Street / SGX quantitative financial analyst writing professional research reports for institutional portfolio managers.",
        temperature: 0.3,
      }
    });

    res.json({
      success: true,
      analysis: response.text || "Analysis generation completed.",
      stock: stockCode
    });
  } catch (err: any) {
    console.error("AI Analysis error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to generate AI analysis" });
  }
});

// Vite middleware setup for development
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
