import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styles from './Browse.module.css';
import axios from 'axios';

interface Auction {
  title: string;
  currentPrice: number;
  endingTime: string; // Assume the ending time is a string to be parsed by Date
  timeRemaining?: TimeRemaining | null;
}

interface TimeRemaining {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Browse = () => {
    
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);

  const handleNavigate = (path: string) => {
    navigate(path, { state: { username: username } });
  };

  const handleOpenAuction = (auction: Auction) => {
    navigate('/auction', { state: { auction, username } });
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auctions/ongoing');
        setAuctions(response.data.auctions);
        setFilteredAuctions(response.data.auctions);
      } catch (error) {
        console.error('Error fetching ongoing auctions:', error);
      }
    };
  
    fetchAuctions();
  }, []);

  const calculateTimeRemaining = (endTime: Date): TimeRemaining | null => {
    const now = new Date();
    const difference = endTime.getTime() - now.getTime();

    if (difference <= 0) {
      return null; // Return null if time has expired
    }

    let seconds = Math.floor(difference / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;
    const months = Math.floor(days / 30);
    days %= 30;
    const years = Math.floor(months / 12);
    const monthsLeft = months % 12;

    return { years, months: monthsLeft, days, hours, minutes, seconds };
  };

  const formatTimeRemaining = (time: TimeRemaining | null): string => {
    if (!time) {
      return ''; // Return empty string if no time object is provided
    }

    const { years, months, days, hours, minutes, seconds } = time;
    let timeString = '';

    if (years > 0) {
      timeString += `${years} year${years > 1 ? 's' : ''}, `;
    }
    if (months > 0) {
      timeString += `${months} month${months > 1 ? 's' : ''}, `;
    }
    if (days > 0) {
      timeString += `${days} day${days > 1 ? 's' : ''}, `;
    }
    if (hours > 0) {
      timeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
    }
    if (minutes > 0) {
      timeString += `${minutes} minute${minutes > 1 ? 's' : ''} and `;
    }
    timeString += `${seconds} second${seconds !== 1 ? 's' : ''}`;

    return timeString;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setAuctions(currentAuctions => {
        const updatedAuctions = currentAuctions.map(auction => {
          const timeRemaining = calculateTimeRemaining(new Date(auction.endingTime));
          return { ...auction, timeRemaining };
        }).filter(auction => auction.timeRemaining !== null);

        setFilteredAuctions(updatedAuctions.filter(auction => auction.title.toLowerCase().includes(searchTerm.toLowerCase())));
        return updatedAuctions;
      });
    }, 1000); // update every second

    return () => clearInterval(intervalId);
  }, [searchTerm]);

  const handleSearch = () => {
    setFilteredAuctions(currentAuctions => {
      if (!searchTerm.trim()) {
        return currentAuctions;
      }
      return currentAuctions.filter(auction => 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  return (
    <div className={styles.browse}>
      <nav className={styles.navbarHome}>
        <div className={styles.homeContainer}>
          <Link className={styles.navbarBrand} to="/">Browse Ongoing Auctions</Link>
          <div className={styles.navbarMenu}>
            <div className={styles.navLink} onClick={() => handleNavigate('/home')}>Home</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/browse')}>Browse</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/create-auction')}>Create Auction</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/profile')}>Profile</div>
          </div>
        </div>
      </nav>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search auctions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={`${styles.searchButton} ${styles.openButton}`}>
          GO
        </button>
      </div>
      <div className={styles.auctionsGrid}>
        {filteredAuctions.length === 0 ? (
          <p className={styles.noAuctionsMessage}>No auctions found.</p>
        ) : (
          filteredAuctions.map((auction, index) => (
            auction.timeRemaining && (
              <div key={index} className={styles.auctionItem}>
                <p>{auction.title}</p>
                <p>Current Price: {auction.currentPrice}</p>
                <p>Ends in: {formatTimeRemaining(calculateTimeRemaining(new Date(auction.endingTime)))}</p>
                <button className={`${styles.searchButton}`} style={{borderRadius: 20}} onClick={() => handleOpenAuction(auction)}>Open</button>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};

export default Browse;
