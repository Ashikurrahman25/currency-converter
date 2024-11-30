"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
// Function to fetch token price from Ref Finance indexer
function getTokenPrice(tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://indexer.ref.finance/get-token-price?token_id=${tokenId}`);
            return response.data.price || null;
        }
        catch (error) {
            console.error(`Error fetching price for ${tokenId}:`, error);
            return null;
        }
    });
}
// API endpoint to get conversion rate between two tokens
app.get('/convert-tokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required query parameters: from, to, amount' });
    }
    try {
        // Fetch prices for the two tokens from Ref Finance indexer
        const fromPrice = yield getTokenPrice(from);
        const toPrice = yield getTokenPrice(to);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error calculating conversion rate' });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Token Conversion API is running at http://localhost:${port}`);
});