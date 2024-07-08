import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [signUpUsername, setSignUpUsername] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [reEnterPassword, setReEnterPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/users/login', {
        username: loginUsername,
        password: loginPassword
      });
      console.log(response.data);
      navigate('/home', { state: { username: loginUsername } });
    } catch (error: any) {  // Typing catch clause variable requires TypeScript 4.x
      console.error('Error:', error.response.data);
      setError('Invalid username or password');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (signUpPassword !== reEnterPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/users/signup', {
        name,
        username: signUpUsername,
        password: signUpPassword
      });
      console.log(response.data);
      navigate('/home', { state: { username: signUpUsername } });
    } catch (error: any) {  // Typing catch clause variable requires TypeScript 4.x
      console.error('Error:', error.response.data);
      setError(error.response.data.error || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="container">
      <div style={{ minHeight: '100vh', paddingTop: '20px' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" color="#EEEEEE" letterSpacing="5px" fontFamily="Courier New" marginTop="50px">
            AUCTION APP
          </Typography>
        </Container>

        <Container maxWidth="md" style={{ marginTop: '0px', display: 'flex', justifyContent: 'space-around' }}>
          <div className="form-container" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="login-box" style={{ marginBottom: '20px' }}>
              <form onSubmit={handleLoginSubmit}>
                <div className="user-box">
                  <input type="text" name="loginUsername" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
                  <label>Username</label>
                </div>
                <div className="user-box">
                  <input type="password" name="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  <label>Password</label>
                </div>
                {error && <div style={{color: "red"}} className="error-message">{error}</div>}
                <div className="center">
                  <button type="submit">LOGIN</button>
                </div>
              </form>
            </div>

            <div className="reg-box">
              <form onSubmit={handleSignUpSubmit}>
                <div className="userreg-box">
                  <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <label>Name</label>
                </div>
                <div className="userreg-box">
                  <input type="text" name="signUpUsername" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} required />
                  <label>Username</label>
                </div>
                <div className="userreg-box">
                  <input type="password" name="signUpPassword" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                  <label>Password</label>
                </div>
                <div className="userreg-box">
                  <input type="password" name="reEnterPassword" value={reEnterPassword} onChange={(e) => setReEnterPassword(e.target.value)} required />
                  <label>Re-enter Password</label>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="center">
                  <button type="submit">SIGN UP</button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;
