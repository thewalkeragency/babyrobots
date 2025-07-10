import { createUser, getUserByEmail } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (getUserByEmail(email)) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    try {
      const userId = createUser(email, password, role);
      res.status(201).json({ message: 'User registered successfully!', userId });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error during registration.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
