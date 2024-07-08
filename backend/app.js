import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes); // Use auctionRoutes for auction-related endpoints


// Connect to MongoDB
mongoose.connect('mongodb+srv://ahsanmir:mernapp1000@auctiondb.3eqdd5z.mongodb.net/?retryWrites=true&w=majority&appName=AuctionDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

