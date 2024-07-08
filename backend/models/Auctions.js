// backend/models/Auctions.js

import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    title: { type: String},
    description: { type: String},
    startingPrice: { type: Number },
    startingTime: {type: Date},
    endingTime: {type: Date},
    currentPrice: { type: Number},
    lastBidUserId: { type: String, default: '' },
});

const Auctions = mongoose.model('Auctions', auctionSchema);

export { auctionSchema }; // Exporting auctionSchema

export default Auctions;
