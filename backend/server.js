// backend/server.js 

import { Socket, Server } from "socket.io";
import http from "http";
import { app } from "./app.js";
import { config } from "dotenv";
import Auctions from "./models/Auctions.js"; // Import your Auction model
import User from "./models/User.js";
import schedule from 'node-schedule'; // Make sure 'node-schedule' is installed

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

config({
  path: "./config.env",
});

// Maps auction IDs to an object that maps client IDs to socket IDs
const auctionClientSockets = {};
const scheduledAuctions = new Set();

io.on("connection", (socket) => {
    let clientId = socket.handshake.query.clientId;
    console.log(`USER CONNECTED || Username: ${clientId} || Socket ID: ${socket.id}`);

    socket.on('joinRoom', async ({ auctionId }) => {
        if (!auctionClientSockets[auctionId]) {
            auctionClientSockets[auctionId] = {};
        }
        auctionClientSockets[auctionId][clientId] = socket.id;

        socket.join(auctionId, () => {
            console.log(`${clientId} has joined auction room: ${auctionId}`);
            io.to(auctionId).emit('joinUpdate', { message: `${clientId} has joined the auction room.` });
        });

        const auction = await Auctions.findById(auctionId);
        if (auction && new Date(auction.endingTime) > new Date()) {
            // Only schedule the job if it has not been scheduled before
            if (!scheduledAuctions.has(auctionId)) {
                scheduledAuctions.add(auctionId);
                schedule.scheduleJob(auction.endingTime, async () => {
                    const winningBid = await determineWinningBid(auctionId);
                    if (winningBid) {
                        const user = await User.findOneAndUpdate(
                            { username: winningBid.username },
                            { $inc: { numItemsOwned: 1 } },
                            { new: true }
                        );
                        console.log(`Auction ended. Updated items owned for ${winningBid.username}`);
                    }
                    io.to(auctionId).emit('auctionEnded', { auctionId, redirectPath: '/browse' });
                    // Clean up after auction ends
                    scheduledAuctions.delete(auctionId);
                    delete auctionClientSockets[auctionId];
                });
            }
        }
    });

    socket.on('bid', async ({ auctionId, newBid, username }) => {
        const auction = await Auctions.findById(auctionId);
        if (!auction) {
            console.log(`No auction found with ID: ${auctionId}`);
            return;
        }

        const auctionExists = await User.exists({
            username: username,
            createdAuctionsID: { $in: [auctionId] }
        });

        if (auctionExists) {
            console.log(`Bid error: Auction creator cannot place a bid, Username: ${username}`);
            socket.to(auctionId).emit('bidError', { message: 'Auction creator cannot place a bid' });
        } else {
            auction.currentPrice = newBid;
            auction.lastBidUserId = username;
            await auction.save();
            io.to(auctionId).emit('bidUpdate', { auctionId, newPrice: newBid, username });
            console.log(`New bid placed on auction ${auctionId} by ${username}: ${newBid}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`USER DISCONNECTED: ${socket.id}`);
        // Remove the socket from all auctions it might be in
        Object.keys(auctionClientSockets).forEach(auctionId => {
            if (auctionClientSockets[auctionId][clientId] === socket.id) {
                delete auctionClientSockets[auctionId][clientId];
                console.log(`Socket ID ${socket.id} removed for client "${clientId}" from auction ${auctionId}`);
                if (Object.keys(auctionClientSockets[auctionId]).length === 0) {
                    delete auctionClientSockets[auctionId];
                }
            }
        });
    });
});

async function determineWinningBid(auctionId) {
    const auction = await Auctions.findById(auctionId).select('lastBidUserId').lean();
    if (auction && auction.lastBidUserId) {
        return { username: auction.lastBidUserId };
    }
    return null;
}

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});


