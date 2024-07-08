import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './CreateAuction.module.css';
import axios from 'axios';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');  // Price as string to handle form field
  const [startingTime, setStartingTime] = useState('');
  const [endingTime, setEndingTime] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;

  const handleNavigate = (path: string) => {
    navigate(path, { state: { username: username } });
  };

  const handleAuctionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/auctions', {
        title,
        description,
        startingPrice: parseFloat(startingPrice),  // Convert string to number for the API
        startingTime,
        endingTime,
        username
      });

      console.log('Auction created successfully:', response.data);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);

      setTitle('');
      setDescription('');
      setStartingPrice('');
      setStartingTime('');
      setEndingTime('');
    } catch (error: any) {  // Properly typing Axios error with 'any' until you know the exact type
      console.error('Error creating auction:', error.response?.data);
    }
  };

  return (
    <div className={styles.createAuction}>
      <nav className={styles.navbar}>
        <div className={styles.homeContainer}>
          <Link className={styles.navbarBrand} to="/">{username}'s Auction Creation</Link>
          <div className={styles.navbarMenu}>
            <div className={styles.navLink} onClick={() => handleNavigate('/home')}>Home</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/browse')}>Browse</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/create-auction')}>Create Auction</div>
            <div className={styles.navLink} onClick={() => handleNavigate('/profile')}>Profile</div>
          </div>
        </div>
      </nav>

      {showNotification && (
        <div className={styles.notification}>
          Auction created successfully!
        </div>
      )}

      <div className={styles.formContainer}>
        <div className={styles.auctionBox}>
          <form onSubmit={handleAuctionSubmit}>
            <div className={styles.userBox}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label>Title</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <label>Description</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                required
              />
              <label>Starting Price</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="datetime-local"
                value={startingTime}
                onChange={(e) => setStartingTime(e.target.value)}
                required
              />
              <label>Starting Time</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="datetime-local"
                value={endingTime}
                onChange={(e) => setEndingTime(e.target.value)}
                required
              />
              <label>Ending Time</label>
            </div>
            <div className={styles.center}>
              <button type="submit">Create Auction</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
