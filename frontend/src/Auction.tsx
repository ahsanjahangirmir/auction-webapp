import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import styles from './Auction.module.css';
import axios from 'axios';

// interface LocationState {
//     username?: string;
//     auction?: {
//         _id: string;
//         title: string;
//         description: string;
//         startingPrice: number;
//         startingTime: string;
//         endingTime: string;
//     };
// }

const Auction = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    const auction = location.state?.auction;
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bidAmount, setBidAmount] = useState('');
    const errorColor = '#FF6B6B';
    const successColor = '#4CAF50';
    const auctionID = auction._id;
    const clientId = username;

    // Establish socket connection, passing the client ID
    const socket: Socket = io('http://localhost:8000', { query: { clientId } });

    const showNotification = (message: string, color: string) => {
        const notification = document.createElement('div');

        notification.className = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '0';
        notification.style.left = '0';
        notification.style.width = '100%';
        notification.style.backgroundColor = color;
        notification.style.color = 'white';
        notification.style.textAlign = 'center';
        notification.style.padding = '10px';
        notification.style.zIndex = '2000';
        notification.style.animation = 'slideDown 0.5s, fadeOut 0.5s 2.5s';
        notification.textContent = message;

        document.body.appendChild(notification);

        const keyframes = `
            @keyframes slideDown {
                from { top: -50px; }
                to { top: 0; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;

        const animationStyles = document.createElement('style');
        animationStyles.innerHTML = keyframes;
        document.head.appendChild(animationStyles);

        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(animationStyles);
        }, 3000);
    };

    const handleNavigate = (path:string) => {
        navigate(path, { state: { username: username } });
      };

    useEffect(() => {
        const fetchAuctionDetailsClient = async () => {
            if (!auctionID) return;
            try {
                const response = await axios.get(`http://localhost:8000/api/auctions/${auctionID}`);
                setCurrentPrice(response.data.auction.currentPrice);
            } catch (error) {
                console.error('Error fetching auction details:', error);
            }
        };

        fetchAuctionDetailsClient();
        socket.emit('joinRoom', { auctionId: auction?._id });

        socket.on('joinUpdate', ({ message }: { message: string }) => {
            showNotification(message, successColor);
        });

        socket.on('bidUpdate', ({ auctionId, newPrice, username }: { auctionId: string; newPrice: number; username: string }) => {
            if (auctionId === auction?._id) {
                setCurrentPrice(newPrice);
                showNotification(`A new bid has been placed by ${username}: ${newPrice}`, successColor);
            }
        });

        socket.on('bidError', ({ message }: { message: string }) => {
            showNotification(message, errorColor);
        });

        socket.on('auctionEnded', ({ auctionId, redirectPath }: { auctionId: string; redirectPath: string }) => {
            if (auctionId === auction?._id) {
                showNotification('This auction has ended.', successColor);
                handleNavigate(redirectPath);
            }
        });

        return () => {
            socket.off('joinUpdate');
            socket.off('bidUpdate');
            socket.off('bidError');
            socket.off('auctionEnded');
            socket.disconnect();
        };
    }, [socket, auction?._id, navigate, username]);

    const handleBid = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newBid = parseFloat(bidAmount);
        if (isNaN(newBid) || newBid <= (currentPrice || 0)) {
            showNotification('Invalid bid amount! Bid must be higher than the current item price.', errorColor);
            return;
        }

        socket.emit('bid', { auctionId: auction?._id, newBid, username });
        setBidAmount('');
    };



    return (
        <div className={styles.profile}>
            <nav className={styles.navbar}>
                <div className={styles.homeContainer}>
                    <Link className={styles.navbarBrand} to="/">Auction Item - {auction.title}</Link>
                    <div className={styles.navbarMenu}>
                        <div className={styles.navLink} onClick={() => handleNavigate('/home')}>Home</div>
                        <div className={styles.navLink} onClick={() => handleNavigate('/browse')}>Browse</div>
                        <div className={styles.navLink} onClick={() => handleNavigate('/create-auction')}>Create Auction</div>
                        <div className={styles.navLink} onClick={() => handleNavigate('/profile')}>Profile</div>
                    </div>
                </div>
            </nav>
            <div className={styles.content}>
                {/* Display Auction Details */}
                <h1 style={{color: 'white', marginTop: '150px'}}>{auction.title}</h1>
                <p style={{color: 'white'}}>Description: {auction.description}</p>
                <p style={{color: 'white'}}>Starting Price: {auction.startingPrice}</p>
                <p style={{color: 'white'}}>Current Price: {currentPrice}</p>
                <p style={{color: 'white'}}>Starting Time: {auction.startingTime}</p>
                <p style={{color: 'white'}}>Ending Time: {auction.endingTime}</p>

                {/* Bid Form */}
                <div style={{marginTop: '50px'}}>
                    <form onSubmit={handleBid}>
                        <input className={styles.bidInput} type="number" placeholder="Enter Bid Amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                        <button className={styles.bidButton} type="submit">Place Bid</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auction;

