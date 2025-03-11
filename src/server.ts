import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();

// Function to fetch token price from Ref Finance indexer
async function getTokenPrice(tokenId: string): Promise<number | null> {
  try {
    const response = await axios.get(`https://indexer.ref.finance/get-token-price?token_id=${tokenId}`);
    return response.data.price || null;
  } catch (error) {
    console.error(`Error fetching price for ${tokenId}:`, error);
    return null;
  }
}
const port = 3000;
app.use(cors({
  origin: ['https://spearonnear.github.io', 'https://game.spearonnear.com', '*', 'http://localhost:8080','https://bettingpool.blackdragon.casino']
}));

// API endpoint to get conversion rate between two tokens
app.get('/convert-tokens', async (req: Request, res: Response) => {
  const { from, to, amount }: { from?: string, to?: string, amount?: string } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required query parameters: from, to, amount' });
  }

  try {
    const fromPrice = await getTokenPrice(from);
    const toPrice = await getTokenPrice(to);

    if (fromPrice === null || toPrice === null) {
      return res.status(500).json({ error: 'Error fetching token prices' });
    }

    const exchangeRate = fromPrice / toPrice;
    const exchangedValue = (exchangeRate * parseFloat(amount)).toFixed(8);

    res.json({
      from,
      to,
      amount: parseFloat(amount),
      exchange_rate: exchangeRate.toFixed(8),
      exchanged_value: exchangedValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating conversion rate' });
  }
});

// API endpoint to get token amount equivalent to a given USD value
app.get('/convert-usd-to-token', async (req: Request, res: Response) => {
  const { tokenId, usdAmount }: { tokenId?: string, usdAmount?: string } = req.query;

  if (!tokenId || !usdAmount) {
    return res.status(400).json({ error: 'Missing required query parameters: tokenId, usdAmount' });
  }

  try {
    const tokenPrice = await getTokenPrice(tokenId);

    if (tokenPrice === null) {
      return res.status(500).json({ error: 'Error fetching token price' });
    }

    const equivalentTokens = (parseFloat(usdAmount) / tokenPrice).toFixed(8);

    res.json({
      tokenId,
      usdAmount: parseFloat(usdAmount),
      equivalent_tokens: equivalentTokens
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating equivalent token amount' });
  }
});

// API endpoint to convert tokens to USD
app.get('/convert-token-to-usd', async (req: Request, res: Response) => {
  const { tokenId, tokenAmount }: { tokenId?: string, tokenAmount?: string } = req.query;

  if (!tokenId || !tokenAmount) {
    return res.status(400).json({ error: 'Missing required query parameters: tokenId, tokenAmount' });
  }

  try {
    const tokenPrice = await getTokenPrice(tokenId);

    if (tokenPrice === null) {
      return res.status(500).json({ error: 'Error fetching token price' });
    }

    const equivalentUsd = (parseFloat(tokenAmount) * tokenPrice).toFixed(8);

    res.json({
      tokenId,
      tokenAmount: parseFloat(tokenAmount),
      equivalent_usd: equivalentUsd
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating equivalent USD amount' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Token Conversion API is running at http://localhost:${port}`);
});
