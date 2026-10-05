import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

// SGX Stock database with shock-filtered metrics & forecasts
const SGX_STOCKS = [
  {
    code: "D05.SI",
    name: "DBS Group Holdings Ltd",
    sector: "Banking & Financials",
    price: 38.50,
    change: +0.45,
    changePercent: +1.18,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 35.20,
    twelveMonthTrimmedMean: 35.80, // Shock-filtered (removes anomalous dip/spike months)
    forecast: {
      nextWeek: 39.10,
      oneMonth: 40.50,
      threeMonth: 43.20,
      nextWeekConf: "84%",
      oneMonthConf: "78%",
      threeMonthConf: "72%"
    },
    historical: [
      { month: "Oct 25", price: 31.50, shockFiltered: 31.80, volume: "24.5M" },
      { month: "Nov 25", price: 32.20, shockFiltered: 32.40, volume: "21.0M" },
      { month: "Dec 25", price: 34.10, shockFiltered: 33.90, volume: "28.3M" },
      { month: "Jan 26", price: 29.80, shockFiltered: 34.20, volume: "45.2M" }, // Shock dip removed in trimmed mean
      { month: "Feb 26", price: 35.40, shockFiltered: 35.20, volume: "19.8M" },
      { month: "Mar 26", price: 36.20, shockFiltered: 36.00, volume: "22.1M" },
      { month: "Apr 26", price: 35.90, shockFiltered: 36.10, volume: "20.4M" },
      { month: "May 26", price: 37.10, shockFiltered: 36.80, volume: "25.6M" },
      { month: "Jun 26", price: 37.80, shockFiltered: 37.50, volume: "23.9M" },
      { month: "Jul 26", price: 36.50, shockFiltered: 37.20, volume: "26.7M" },
      { month: "Aug 26", price: 37.90, shockFiltered: 37.80, volume: "21.5M" },
      { month: "Sep 26", price: 38.50, shockFiltered: 38.20, volume: "27.4M" },
    ],
    metrics: {
      peRatio: 11.4,
      dividendYield: 5.2,
      marketCap: "98.5B",
      high52w: 39.20,
      low52w: 29.80,
      volatility: "11.2%",
      rsi: 61.4,
      beta: 0.98,
      analystConsensus: "BUY (18 Buy, 3 Hold, 0 Sell)"
    },
    description: "Southeast's largest bank by assets, renowned for robust net interest margins, digital leadership, and generous shareholder dividend yields."
  },
  {
    code: "O39.SI",
    name: "Overseas-Chinese Banking Corp",
    sector: "Banking & Financials",
    price: 15.80,
    change: +0.12,
    changePercent: +0.76,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 14.40,
    twelveMonthTrimmedMean: 14.65,
    forecast: {
      nextWeek: 16.05,
      oneMonth: 16.50,
      threeMonth: 17.20,
      nextWeekConf: "82%",
      oneMonthConf: "76%",
      threeMonthConf: "70%"
    },
    historical: [
      { month: "Oct 25", price: 13.20, shockFiltered: 13.40, volume: "15.2M" },
      { month: "Nov 25", price: 13.60, shockFiltered: 13.70, volume: "14.1M" },
      { month: "Dec 25", price: 14.10, shockFiltered: 14.00, volume: "18.5M" },
      { month: "Jan 26", price: 12.10, shockFiltered: 14.10, volume: "29.4M" }, // Shock dip filtered
      { month: "Feb 26", price: 14.50, shockFiltered: 14.40, volume: "13.2M" },
      { month: "Mar 26", price: 14.80, shockFiltered: 14.70, volume: "16.8M" },
      { month: "Apr 26", price: 14.60, shockFiltered: 14.80, volume: "12.5M" },
      { month: "May 26", price: 15.10, shockFiltered: 15.00, volume: "17.3M" },
      { month: "Jun 26", price: 15.40, shockFiltered: 15.20, volume: "16.1M" },
      { month: "Jul 26", price: 14.90, shockFiltered: 15.30, volume: "18.9M" },
      { month: "Aug 26", price: 15.50, shockFiltered: 15.50, volume: "14.8M" },
      { month: "Sep 26", price: 15.80, shockFiltered: 15.70, volume: "19.2M" },
    ],
    metrics: {
      peRatio: 10.8,
      dividendYield: 5.6,
      marketCap: "72.1B",
      high52w: 16.00,
      low52w: 12.10,
      volatility: "10.5%",
      rsi: 58.9,
      beta: 0.94,
      analystConsensus: "BUY (15 Buy, 4 Hold, 0 Sell)"
    },
    description: "OCBC is Singapore's second largest financial services group, with strong wealth management franchise through Great Eastern and Bank of Singapore."
  },
  {
    code: "U11.SI",
    name: "United Overseas Bank Ltd",
    sector: "Banking & Financials",
    price: 33.20,
    change: -0.10,
    changePercent: -0.30,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 30.10,
    twelveMonthTrimmedMean: 30.70,
    forecast: {
      nextWeek: 33.70,
      oneMonth: 34.80,
      threeMonth: 36.50,
      nextWeekConf: "79%",
      oneMonthConf: "74%",
      threeMonthConf: "68%"
    },
    historical: [
      { month: "Oct 25", price: 27.50, shockFiltered: 27.90, volume: "11.2M" },
      { month: "Nov 25", price: 28.20, shockFiltered: 28.40, volume: "10.5M" },
      { month: "Dec 25", price: 29.50, shockFiltered: 29.20, volume: "13.4M" },
      { month: "Jan 26", price: 25.10, shockFiltered: 29.50, volume: "22.1M" }, // Shock dip filtered
      { month: "Feb 26", price: 30.40, shockFiltered: 30.20, volume: "9.8M" },
      { month: "Mar 26", price: 31.10, shockFiltered: 30.90, volume: "12.3M" },
      { month: "Apr 26", price: 30.80, shockFiltered: 31.20, volume: "10.1M" },
      { month: "May 26", price: 31.90, shockFiltered: 31.80, volume: "14.2M" },
      { month: "Jun 26", price: 32.50, shockFiltered: 32.20, volume: "12.9M" },
      { month: "Jul 26", price: 31.80, shockFiltered: 32.50, volume: "14.5M" },
      { month: "Aug 26", price: 32.90, shockFiltered: 32.80, volume: "11.7M" },
      { month: "Sep 26", price: 33.20, shockFiltered: 33.00, volume: "15.1M" },
    ],
    metrics: {
      peRatio: 11.1,
      dividendYield: 5.4,
      marketCap: "55.8B",
      high52w: 33.80,
      low52w: 25.10,
      volatility: "12.1%",
      rsi: 54.2,
      beta: 1.02,
      analystConsensus: "HOLD (12 Buy, 8 Hold, 1 Sell)"
    },
    description: "UOB is a leading bank in Asia with a global network, particularly strong in Southeast Asian retail and wholesale commercial banking."
  },
  {
    code: "Z74.SI",
    name: "Singapore Telecommunications",
    sector: "Telecommunications",
    price: 3.15,
    change: +0.03,
    changePercent: +0.96,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 2.75,
    twelveMonthTrimmedMean: 2.82,
    forecast: {
      nextWeek: 3.22,
      oneMonth: 3.35,
      threeMonth: 3.55,
      nextWeekConf: "86%",
      oneMonthConf: "81%",
      threeMonthConf: "75%"
    },
    historical: [
      { month: "Oct 25", price: 2.45, shockFiltered: 2.50, volume: "38.2M" },
      { month: "Nov 25", price: 2.52, shockFiltered: 2.55, volume: "32.1M" },
      { month: "Dec 25", price: 2.65, shockFiltered: 2.62, volume: "41.5M" },
      { month: "Jan 26", price: 2.20, shockFiltered: 2.70, volume: "65.4M" }, // Shock dip filtered
      { month: "Feb 26", price: 2.78, shockFiltered: 2.75, volume: "29.8M" },
      { month: "Mar 26", price: 2.85, shockFiltered: 2.82, volume: "35.2M" },
      { month: "Apr 26", price: 2.80, shockFiltered: 2.85, volume: "28.4M" },
      { month: "May 26", price: 2.95, shockFiltered: 2.92, volume: "42.1M" },
      { month: "Jun 26", price: 3.02, shockFiltered: 2.98, volume: "39.6M" },
      { month: "Jul 26", price: 2.94, shockFiltered: 3.02, volume: "44.2M" },
      { month: "Aug 26", price: 3.10, shockFiltered: 3.08, volume: "36.7M" },
      { month: "Sep 26", price: 3.15, shockFiltered: 3.12, volume: "48.5M" },
    ],
    metrics: {
      peRatio: 15.6,
      dividendYield: 6.1,
      marketCap: "52.0B",
      high52w: 3.20,
      low52w: 2.20,
      volatility: "14.5%",
      rsi: 64.8,
      beta: 0.82,
      analystConsensus: "BUY (20 Buy, 2 Hold, 0 Sell)"
    },
    description: "Singtel is Asia's leading communications technology group, providing telecom and digital services to millions across regional associates like Airtel and Telkomsel."
  },
  {
    code: "BN4.SI",
    name: "Keppel Ltd",
    sector: "Conglomerate",
    price: 7.45,
    change: +0.08,
    changePercent: +1.09,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 6.80,
    twelveMonthTrimmedMean: 6.95,
    forecast: {
      nextWeek: 7.60,
      oneMonth: 7.90,
      threeMonth: 8.40,
      nextWeekConf: "80%",
      oneMonthConf: "73%",
      threeMonthConf: "67%"
    },
    historical: [
      { month: "Oct 25", price: 6.10, shockFiltered: 6.20, volume: "18.4M" },
      { month: "Nov 25", price: 6.30, shockFiltered: 6.35, volume: "15.2M" },
      { month: "Dec 25", price: 6.55, shockFiltered: 6.50, volume: "21.0M" },
      { month: "Jan 26", price: 5.40, shockFiltered: 6.60, volume: "34.2M" },
      { month: "Feb 26", price: 6.80, shockFiltered: 6.75, volume: "14.5M" },
      { month: "Mar 26", price: 6.95, shockFiltered: 6.90, volume: "17.8M" },
      { month: "Apr 26", price: 6.85, shockFiltered: 7.00, volume: "13.9M" },
      { month: "May 26", price: 7.15, shockFiltered: 7.10, volume: "20.5M" },
      { month: "Jun 26", price: 7.30, shockFiltered: 7.22, volume: "19.1M" },
      { month: "Jul 26", price: 7.10, shockFiltered: 7.30, volume: "22.4M" },
      { month: "Aug 26", price: 7.35, shockFiltered: 7.38, volume: "18.2M" },
      { month: "Sep 26", price: 7.45, shockFiltered: 7.42, volume: "24.1M" },
    ],
    metrics: {
      peRatio: 14.2,
      dividendYield: 4.8,
      marketCap: "13.4B",
      high52w: 7.55,
      low52w: 5.40,
      volatility: "16.8%",
      rsi: 62.1,
      beta: 1.15,
      analystConsensus: "BUY (14 Buy, 3 Hold, 1 Sell)"
    },
    description: "Keppel is a global asset manager and operator with strong capabilities in infrastructure, real estate, and connectivity solutions."
  },
  {
    code: "U96.SI",
    name: "Sembcorp Industries Ltd",
    sector: "Utilities & Energy",
    price: 5.95,
    change: -0.05,
    changePercent: -0.83,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 5.40,
    twelveMonthTrimmedMean: 5.55,
    forecast: {
      nextWeek: 6.05,
      oneMonth: 6.25,
      threeMonth: 6.70,
      nextWeekConf: "77%",
      oneMonthConf: "71%",
      threeMonthConf: "65%"
    },
    historical: [
      { month: "Oct 25", price: 4.80, shockFiltered: 4.95, volume: "12.5M" },
      { month: "Nov 25", price: 5.00, shockFiltered: 5.10, volume: "10.8M" },
      { month: "Dec 25", price: 5.25, shockFiltered: 5.20, volume: "15.4M" },
      { month: "Jan 26", price: 4.10, shockFiltered: 5.30, volume: "28.1M" },
      { month: "Feb 26", price: 5.45, shockFiltered: 5.40, volume: "11.2M" },
      { month: "Mar 26", price: 5.60, shockFiltered: 5.55, volume: "14.1M" },
      { month: "Apr 26", price: 5.50, shockFiltered: 5.62, volume: "9.9M" },
      { month: "May 26", price: 5.75, shockFiltered: 5.70, volume: "16.8M" },
      { month: "Jun 26", price: 5.85, shockFiltered: 5.80, volume: "15.0M" },
      { month: "Jul 26", price: 5.70, shockFiltered: 5.88, volume: "17.4M" },
      { month: "Aug 26", price: 6.00, shockFiltered: 5.92, volume: "13.8M" },
      { month: "Sep 26", price: 5.95, shockFiltered: 5.90, volume: "16.2M" },
    ],
    metrics: {
      peRatio: 12.5,
      dividendYield: 4.2,
      marketCap: "10.6B",
      high52w: 6.10,
      low52w: 4.10,
      volatility: "18.2%",
      rsi: 49.5,
      beta: 1.22,
      analystConsensus: "BUY (11 Buy, 4 Hold, 0 Sell)"
    },
    description: "Sembcorp Industries is a leading energy and urban solutions provider, driving the green transition across Asia with robust renewables portfolio."
  },
  {
    code: "F34.SI",
    name: "Wilmar International Limited",
    sector: "Consumer Goods & Agribusiness",
    price: 3.42,
    change: +0.02,
    changePercent: +0.59,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 3.25,
    twelveMonthTrimmedMean: 3.32,
    forecast: {
      nextWeek: 3.48,
      oneMonth: 3.60,
      threeMonth: 3.85,
      nextWeekConf: "75%",
      oneMonthConf: "69%",
      threeMonthConf: "62%"
    },
    historical: [
      { month: "Oct 25", price: 3.00, shockFiltered: 3.05, volume: "16.1M" },
      { month: "Nov 25", price: 3.10, shockFiltered: 3.12, volume: "14.2M" },
      { month: "Dec 25", price: 3.20, shockFiltered: 3.18, volume: "19.5M" },
      { month: "Jan 26", price: 2.65, shockFiltered: 3.22, volume: "31.0M" },
      { month: "Feb 26", price: 3.25, shockFiltered: 3.25, volume: "13.4M" },
      { month: "Mar 26", price: 3.35, shockFiltered: 3.30, volume: "16.8M" },
      { month: "Apr 26", price: 3.30, shockFiltered: 3.35, volume: "12.1M" },
      { month: "May 26", price: 3.40, shockFiltered: 3.38, volume: "18.2M" },
      { month: "Jun 26", price: 3.45, shockFiltered: 3.42, volume: "15.9M" },
      { month: "Jul 26", price: 3.38, shockFiltered: 3.45, volume: "19.4M" },
      { month: "Aug 26", price: 3.40, shockFiltered: 3.40, volume: "14.5M" },
      { month: "Sep 26", price: 3.42, shockFiltered: 3.41, volume: "17.8M" },
    ],
    metrics: {
      peRatio: 13.8,
      dividendYield: 4.7,
      marketCap: "21.3B",
      high52w: 3.65,
      low52w: 2.65,
      volatility: "15.1%",
      rsi: 53.4,
      beta: 0.76,
      analystConsensus: "HOLD (8 Buy, 7 Hold, 2 Sell)"
    },
    description: "Wilmar International is Asia's leading agribusiness group, ranked amongst the largest listed companies by market cap on SGX."
  },
  {
    code: "C38U.SI",
    name: "CapitaLand Integrated Commercial Trust",
    sector: "REITs",
    price: 2.12,
    change: +0.01,
    changePercent: +0.47,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 1.98,
    twelveMonthTrimmedMean: 2.02,
    forecast: {
      nextWeek: 2.16,
      oneMonth: 2.24,
      threeMonth: 2.40,
      nextWeekConf: "85%",
      oneMonthConf: "80%",
      threeMonthConf: "74%"
    },
    historical: [
      { month: "Oct 25", price: 1.82, shockFiltered: 1.85, volume: "32.4M" },
      { month: "Nov 25", price: 1.88, shockFiltered: 1.90, volume: "28.1M" },
      { month: "Dec 25", price: 1.95, shockFiltered: 1.93, volume: "35.2M" },
      { month: "Jan 26", price: 1.62, shockFiltered: 1.97, volume: "58.4M" },
      { month: "Feb 26", price: 2.00, shockFiltered: 1.99, volume: "26.5M" },
      { month: "Mar 26", price: 2.05, shockFiltered: 2.03, volume: "31.2M" },
      { month: "Apr 26", price: 2.02, shockFiltered: 2.06, volume: "24.1M" },
      { month: "May 26", price: 2.08, shockFiltered: 2.08, volume: "34.5M" },
      { month: "Jun 26", price: 2.12, shockFiltered: 2.10, volume: "30.8M" },
      { month: "Jul 26", price: 2.06, shockFiltered: 2.13, volume: "36.2M" },
      { month: "Aug 26", price: 2.10, nr: 0, shockFiltered: 2.11, volume: "29.5M" },
      { month: "Sep 26", price: 2.12, shockFiltered: 2.12, volume: "33.7M" },
    ],
    metrics: {
      peRatio: 17.2,
      dividendYield: 5.3,
      marketCap: "15.8B",
      high52w: 2.15,
      low52w: 1.62,
      volatility: "9.8%",
      rsi: 59.8,
      beta: 0.71,
      analystConsensus: "BUY (16 Buy, 2 Hold, 0 Sell)"
    },
    description: "CICT is Singapore's largest REIT with premier retail and commercial assets located strategically in Singapore's core business districts."
  },
  {
    code: "C6L.SI",
    name: "Singapore Airlines Limited",
    sector: "Aviation & Transport",
    price: 6.35,
    change: -0.04,
    changePercent: -0.63,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 6.50,
    twelveMonthTrimmedMean: 6.42,
    forecast: {
      nextWeek: 6.42,
      oneMonth: 6.55,
      threeMonth: 6.85,
      nextWeekConf: "71%",
      oneMonthConf: "65%",
      threeMonthConf: "59%"
    },
    historical: [
      { month: "Oct 25", price: 6.80, shockFiltered: 6.75, volume: "14.2M" },
      { month: "Nov 25", price: 6.72, shockFiltered: 6.70, volume: "12.1M" },
      { month: "Dec 25", price: 6.90, shockFiltered: 6.65, volume: "18.5M" },
      { month: "Jan 26", price: 5.80, shockFiltered: 6.60, volume: "29.4M" },
      { month: "Feb 26", price: 6.50, shockFiltered: 6.55, volume: "11.2M" },
      { month: "Mar 26", price: 6.40, shockFiltered: 6.50, volume: "13.8M" },
      { month: "Apr 26", price: 6.35, shockFiltered: 6.45, volume: "10.4M" },
      { month: "May 26", price: 6.45, shockFiltered: 6.42, volume: "15.2M" },
      { month: "Jun 26", price: 6.55, shockFiltered: 6.40, volume: "14.1M" },
      { month: "Jul 26", price: 6.25, shockFiltered: 6.38, volume: "16.5M" },
      { month: "Aug 26", price: 6.39, shockFiltered: 6.36, volume: "12.8M" },
      { month: "Sep 26", price: 6.35, shockFiltered: 6.35, volume: "15.1M" },
    ],
    metrics: {
      peRatio: 9.8,
      dividendYield: 6.3,
      marketCap: "18.9B",
      high52w: 7.10,
      low52w: 5.80,
      volatility: "19.5%",
      rsi: 46.2,
      beta: 1.08,
      analystConsensus: "HOLD (7 Buy, 10 Hold, 3 Sell)"
    },
    description: "SIA is recognized globally as a premier airline brand, delivering world-class service standards across full-service and low-cost carrier segments."
  },
  {
    code: "S63.SI",
    name: "ST Engineering Ltd",
    sector: "Aerospace & Defense",
    price: 4.82,
    change: +0.03,
    changePercent: +0.63,
    currency: "SGD",
    stiIndex: 3842.50,
    stiChange: +0.65,
    twelveMonthAvg: 4.25,
    twelveMonthTrimmedMean: 4.38,
    forecast: {
      nextWeek: 4.90,
      oneMonth: 5.10,
      threeMonth: 5.45,
      nextWeekConf: "83%",
      oneMonthConf: "77%",
      threeMonthConf: "71%"
    },
    historical: [
      { month: "Oct 25", price: 3.90, shockFiltered: 4.00, volume: "11.5M" },
      { month: "Nov 25", price: 4.02, shockFiltered: 4.08, volume: "9.8M" },
      { month: "Dec 25", price: 4.15, shockFiltered: 4.15, volume: "14.2M" },
      { month: "Jan 26", price: 3.50, shockFiltered: 4.22, volume: "24.1M" },
      { month: "Feb 26", price: 4.28, shockFiltered: 4.28, volume: "8.9M" },
      { month: "Mar 26", price: 4.35, shockFiltered: 4.34, volume: "11.4M" },
      { month: "Apr 26", price: 4.30, shockFiltered: 4.40, volume: "8.2M" },
      { month: "May 26", price: 4.50, shockFiltered: 4.46, volume: "13.1M" },
      { month: "Jun 26", price: 4.62, shockFiltered: 4.52, volume: "12.0M" },
      { month: "Jul 26", price: 4.55, shockFiltered: 4.60, volume: "14.5M" },
      { month: "Aug 26", price: 4.75, shockFiltered: 4.68, volume: "11.1M" },
      { month: "Sep 26", price: 4.82, shockFiltered: 4.75, volume: "13.9M" },
    ],
    metrics: {
      peRatio: 20.4,
      dividendYield: 3.4,
      marketCap: "15.1B",
      high52w: 4.85,
      low52w: 3.50,
      volatility: "13.2%",
      rsi: 67.5,
      beta: 0.78,
      analystConsensus: "BUY (14 Buy, 3 Hold, 0 Sell)"
    },
    description: "ST Engineering is a global technology, defense and engineering group specializing in aerospace, smart cities, defense, and public security."
  }
];

// API Endpoints
app.get('/api/stocks', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    stiIndex: {
      value: 3842.50,
      change: +24.80,
      changePercent: +0.65,
      volume: "1.24B SGD",
      advancers: 312,
      decliners: 184
    },
    stocks: SGX_STOCKS
  });
});

app.post('/api/ai-analysis', async (req, res) => {
  try {
    const { stockCode, query } = req.body;
    const stock = SGX_STOCKS.find(s => s.code === stockCode) || SGX_STOCKS[0];

    const prompt = `You are an elite, highly specialized financial analyst and senior equity strategist covering the Singapore Exchange (SGX).
Provide an institutional-grade financial analysis report for ${stock.name} (${stock.code}), which trades in the ${stock.sector} sector at ${stock.price} ${stock.currency}.
Key metrics:
- 12-Month Simple Average: ${stock.twelveMonthAvg} ${stock.currency}
- 12-Month Shock-Filtered Trimmed Mean: ${stock.twelveMonthTrimmedMean} ${stock.currency} (This removes market crash/panic noise or sudden shocks)
- Forecasts: Next Week: ${stock.forecast.nextWeek}, 1 Month: ${stock.forecast.oneMonth}, 3 Months: ${stock.forecast.threeMonth}
- P/E Ratio: ${stock.metrics.peRatio}, Dividend Yield: ${stock.metrics.dividendYield}%, Market Cap: ${stock.metrics.marketCap}
- Analyst Consensus: ${stock.metrics.analystConsensus}

Additional User Query or Focus: ${query || "Provide comprehensive investment thesis, fundamental strength, macroeconomic drivers, and quantitative valuation."}

Format the response cleanly in markdown with structured sections:
1. Executive Investment Thesis & Summary
2. Quantitative Trend Analysis (Highlighting the difference between Simple Average vs. Shock-Filtered Trimmed Mean)
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
      stock: stock.code
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
