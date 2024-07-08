import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './Profile.module.css';
import axios from 'axios';

// interface LocationState {
//   username?: string;
// }

interface UserDetails {
  name: string;
  numItemsOwned: number;
}

interface Auction {
  title: string;
  // Add more fields as needed for auction details
}

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const handleNavigate = (path: string) => {
    navigate(path, { state: { username: username } });
  };

  const [userDetails, setUserDetails] = useState({ name: '', numItemsOwned: 0 });
  const [userAuctions, setUserAuctions] = useState<Auction[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reenterNewPassword, setReenterNewPassword] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${username}`);
        setUserDetails(response.data.user);
        setUserAuctions(response.data.user.createdAuctions);
      } catch (error: any) {
        console.error('Error fetching user details:', error);
      }
    };

    if (username) {
      fetchUserDetails();
    }
  }, [username]);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== reenterNewPassword) {
      console.error('New password and re-entered password do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/users/change-password', {
        username,
        currentPassword,
        newPassword,
      });

      console.log('Password updated successfully:', response.data);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setReenterNewPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className={styles.profile}>
      <nav className={styles.navbar}>
        <div className={styles.homeContainer}>
          <Link className={styles.navbarBrand} to="/">My Profile</Link>
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
          Password updated successfully!
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.column}>
          <h3>User Details</h3>
          <p>Name: {userDetails.name}</p>
          <p>Username: {username}</p>
          <p>Items Owned: {userDetails.numItemsOwned}</p>
        </div>

        <div className={styles.column}>
          <h3>Auctions Created</h3>
          <div className={styles.auctionList}>
            {userAuctions.map((auction, index) => (
              <div key={index} className={styles.auctionItem}>
                <p>{auction.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword} className={styles.form}>
            <div className={styles.userBox}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <label>Current Password</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label>New Password</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="password"
                value={reenterNewPassword}
                onChange={(e) => setReenterNewPassword(e.target.value)}
                required
              />
              <label>Re-enter New Password</label>
            </div>
            <div className={styles.center}>
              <button type="submit">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
