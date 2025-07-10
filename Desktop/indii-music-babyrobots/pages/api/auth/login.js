import { getUserByEmail, verifyPassword } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // In a real application, you would generate a JWT or session token here
    // and send it back to the client.
    res.status(200).json({ message: 'Login successful!', user: { id: user.id, email: user.email, role: user.role } });

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
