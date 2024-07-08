// backend/controllers/auctionController.js

import Auctions from '../models/Auctions.js';
import User from '../models/User.js'; // Import the User model

// Controller function for creating a new auction
export const createAuction = async (req, res) => {
  const { title, description, startingPrice, startingTime, endingTime, username } = req.body;

  try {
    // Create a new auction with the provided data
    const newAuction = new Auctions({
      title,
      description,
      startingPrice,
      startingTime,
      endingTime,
      currentPrice: startingPrice, // Set currentPrice to startingPrice initially
    });

    // Save the new auction to the database
    await newAuction.save();

    // Find the user by username
    const user = await User.findOne({ username });

    // Append the new auction to the user's createdAuctions array
    user.createdAuctions.push(newAuction);
    user.createdAuctionsID.push(newAuction._id);

    // Save the user document to persist the changes
    await user.save();

    res.status(201).json({ message: 'Auction created successfully', auction: newAuction });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const getOngoingAuctions = async (req, res) => {
  try {
    // Fetch ongoing auctions where current time is between startingTime and endingTime
    const ongoingAuctions = await Auctions.find({
      startingTime: { $lt: new Date() },
      endingTime: { $gt: new Date() }
    });

    res.status(200).json({ auctions: ongoingAuctions });
  } catch (error) {
    console.error('Error fetching ongoing auctions:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const placeBid = async (req, res) => {
  const { auctionId, newBid, username } = req.body;

  try {
    const auction = await Auctions.findById(auctionId);
    const auctionCreator = await User.findOne({ createdAuctions: { $in: [auctionId] } });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auctionCreator.username === username) {
      return res.status(403).json({ error: 'Auction creator cannot place a bid' });
    }

    if (newBid <= auction.currentPrice) {
      return res.status(400).json({ error: 'Bid amount must be higher than the current price' });
    }

    auction.currentPrice = newBid;
    await auction.save();

    io.to(auctionId).emit('bidUpdate', { auctionId, newBid, username });

    res.status(200).json({ message: 'Bid placed successfully', newBid, username });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
// Server-side code
export const fetchAuctionDetailsServer = async (req, res) => {
  const auctionID = req.params.auctionID;
  // console.log('fetching auction details for ', req.params.auctionID);

  try {
      const auction = await Auctions.findById(auctionID);

      if (!auction) {
          return res.status(404).json({ error: 'Auction not found' });
      }
      res.status(200).json({ auction });
  } catch (error) {
      console.error('Error fetching auction details:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
