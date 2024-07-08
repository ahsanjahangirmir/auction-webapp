import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary components from react-router-dom
import LandingPage from './Landing'; // Import the LandingPage component
import HomePage from './Home'; // Import the HomePage component
import CreateAuction from './CreateAuction'; // Import the CreateAuction component
import Profile from './Profile';
import Browse from './Browse';
import Auction from './Auction';

function App(): JSX.Element {
  return (
    <div className="App">
      
      <Router>

        <Routes>
      
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/home" element={<HomePage />} /> 
          <Route path="/create-auction" element={<CreateAuction />} /> 
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/browse" element={<Browse />} /> 
          <Route path="/auction" element={<Auction />} /> 
      
        </Routes>
      
      </Router>
    
    </div>
  );
}

export default App;
