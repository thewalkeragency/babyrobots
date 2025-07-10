import React, { useState, useEffect } from 'react';

const LicensorProfileForm = ({ userId, onProfileSaved }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [industry, setIndustry] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [licensingNeeds, setLicensingNeeds] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/profile/licensor?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.id) {
            setCompanyName(data.company_name || '');
            setContactPerson(data.contact_person || '');
            setIndustry(data.industry || '');
            setBudgetRange(data.budget_range || '');
            setLicensingNeeds(data.licensing_needs || '');
            setIsEditing(true);
          } else if (response.status === 404) {
            setIsEditing(false);
            setMessage('No existing profile found. You can create a new one below.');
          } else {
            setMessage(`Error fetching profile: ${data.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error fetching licensor profile:', error);
          setMessage('Error fetching profile. Please try again.');
        }
      };
      fetchProfile();
    } else {
      setIsEditing(false);
      setMessage('Please provide a user ID to create or edit a profile.');
    }
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('User ID is required to create or update a profile.');
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/profile/licensor';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          companyName,
          contactPerson,
          industry,
          budgetRange,
          licensingNeeds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Profile ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsEditing(true);
        if (onProfileSaved) onProfileSaved();
      } else {
        setMessage(`Failed to ${isEditing ? 'update' : 'create'} profile: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} licensor profile:`, error);
      setMessage(`Error ${isEditing ? 'updating' : 'creating'} profile. Please try again.`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Licensor Profile' : 'Create Licensor Profile'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="companyName" style={{ display: 'block', marginBottom: '5px' }}>Company Name:</label>
          <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="contactPerson" style={{ display: 'block', marginBottom: '5px' }}>Contact Person:</label>
          <input type="text" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="industry" style={{ display: 'block', marginBottom: '5px' }}>Industry:</label>
          <input type="text" id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="budgetRange" style={{ display: 'block', marginBottom: '5px' }}>Budget Range:</label>
          <input type="text" id="budgetRange" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="licensingNeeds" style={{ display: 'block', marginBottom: '5px' }}>Licensing Needs:</label>
          <textarea id="licensingNeeds" value={licensingNeeds} onChange={(e) => setLicensingNeeds(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="4"></textarea>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default LicensorProfileForm;
