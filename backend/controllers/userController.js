import User from '../models/User.js';

// Controller function for user login
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username and password
    const user = await User.findOne({ username, password });
    
    // If user not found or password is incorrect, return error
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // If user found and password is correct, return user data
    res.json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Controller function for user sign-up
export const signUpUser = async (req, res) => {

  const { name, username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });

    // If username already exists, return error
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create a new user with the provided data
    const newUser = new User({ name, username, password });
    await newUser.save();

    // Return success message
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const changePassword = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current password matches
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Controller function for fetching user details by username
export const getUserDetailsByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};