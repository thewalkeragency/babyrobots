
import { useState } from 'react';
import { Button, Input, Select } from '../ui';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState('artist');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, profileType }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
    } else {
      setError(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="uk-form-stacked">
      <h3 className="uk-card-title uk-text-white uk-text-center uk-margin-small-bottom">Sign Up</h3>
      {error && <div className="uk-alert-danger" uk-alert="true"><p>{error}</p></div>}
      {message && <div className="uk-alert-success" uk-alert="true"><p>{message}</p></div>}
      <div className="uk-margin">
        <label className="uk-form-label uk-text-muted" htmlFor="signup-email">Email</label>
        <div className="uk-form-controls">
          <Input 
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
      </div>
      <div className="uk-margin">
        <label className="uk-form-label uk-text-muted" htmlFor="signup-password">Password</label>
        <div className="uk-form-controls">
          <Input 
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
      </div>
      <div className="uk-margin">
        <label className="uk-form-label uk-text-muted" htmlFor="profile-type">Profile Type</label>
        <div className="uk-form-controls">
          <Select 
            id="profile-type"
            value={profileType}
            onChange={(e) => setProfileType(e.target.value)}
          >
            <option value="artist">Artist</option>
            <option value="fan">Fan</option>
            <option value="licensor">Licensor</option>
            <option value="service_provider">Service Provider</option>
          </Select>
        </div>
      </div>
      <div className="uk-margin uk-text-center">
        <Button type="submit" variant="primary">Sign Up</Button>
      </div>
    </form>
  );
}
