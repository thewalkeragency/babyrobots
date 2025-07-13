
import { useState } from 'react';
import { Button, Input } from '../ui';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="uk-form-stacked">
      <h3 className="uk-card-title uk-text-white uk-text-center uk-margin-small-bottom">Login</h3>
      {error && <div className="uk-alert-danger" uk-alert="true"><p>{error}</p></div>}
      <div className="uk-margin">
        <label className="uk-form-label uk-text-muted" htmlFor="login-email">Email</label>
        <div className="uk-form-controls">
          <Input 
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
      </div>
      <div className="uk-margin">
        <label className="uk-form-label uk-text-muted" htmlFor="login-password">Password</label>
        <div className="uk-form-controls">
          <Input 
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
      </div>
      <div className="uk-margin uk-text-center">
        <Button type="submit" variant="primary">Login</Button>
      </div>
    </form>
  );
}
