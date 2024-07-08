// backend/models/User.js

import mongoose from 'mongoose';
import { auctionSchema } from './Auctions.js'; // Import the auctionSchema from Auctions.js

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  numItemsOwned: { type: Number, default: 0 },
  createdAuctions: [auctionSchema] ,
  createdAuctionsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }] // Use ObjectId references
});

const User = mongoose.model('User', userSchema);

export default User;
