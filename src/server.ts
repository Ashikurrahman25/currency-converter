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
app.use(cors({ origin: 'https://spearonnear.github.io' }));

// API endpoint to get conversion rate between two tokens
app.post('/convert-tokens', async (req: Request, res: Response) => {
  const { from, to, amount }: { from?: string, to?: string, amount?: string } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required query parameters: from, to, amount' });
  }

  try {
    // Fetch prices for the two tokens from Ref Finance indexer
    const fromPrice = await getTokenPrice(from);
    const toPrice = await getTokenPrice(to);

    if (fromPrice === null || toPrice === null) {
      return res.status(500).json({ error: 'Error fetching token prices' });
    }

    // Calculate the conversion rate
    const exchangeRate = fromPrice / toPrice;
    const exchangedValue = exchangeRate * parseFloat(amount);

    res.json({
      from,
      to,
      amount: parseFloat(amount),
      exchange_rate: exchangeRate,
      exchanged_value: exchangedValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating conversion rate' });
  }
});

// API endpoint to get token amount equivalent to a given USD value
app.post('/convert-usd-to-token', async (req: Request, res: Response) => {
  const { tokenId, usdAmount }: { tokenId?: string, usdAmount?: string } = req.query;

  if (!tokenId || !usdAmount) {
    return res.status(400).json({ error: 'Missing required query parameters: tokenId, usdAmount' });
  }

  try {
    // Fetch token price from Ref Finance indexer
    const tokenPrice = await getTokenPrice(tokenId);

    if (tokenPrice === null) {
      return res.status(500).json({ error: 'Error fetching token price' });
    }

    // Calculate the equivalent token amount for the given USD value
    const equivalentTokens = parseFloat(usdAmount) / tokenPrice;

    res.json({
      tokenId,
      usdAmount: parseFloat(usdAmount),
      equivalent_tokens: equivalentTokens
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating equivalent token amount' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Token Conversion API is running at http://localhost:${port}`);
});
