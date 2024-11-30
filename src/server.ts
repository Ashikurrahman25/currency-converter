import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

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

// API endpoint to get conversion rate between two tokens
app.get('/convert-tokens', async (req: Request, res: Response) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Token Conversion API is running at http://localhost:${port}`);
});
