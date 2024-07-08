// backend/routes/auctionRoutes.js

import express from 'express';
import { createAuction, getOngoingAuctions, placeBid, fetchAuctionDetailsServer} from '../controllers/auctionController.js';

const router = express.Router();

// Route for creating a new auction
router.post('/', createAuction);
router.get('/ongoing', getOngoingAuctions);
router.post('/bid', placeBid);
router.get('/:auctionID', fetchAuctionDetailsServer);


export default router;
