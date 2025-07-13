import React, { useState, useEffect } from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import { useToast } from './ui/Toast';

const ServiceProviderProfileForm = ({ userId, onProfileSaved }) => {
  const [businessName, setBusinessName] = useState('');
  const [serviceCategories, setServiceCategories] = useState(''); // JSON string
  const [skills, setSkills] = useState(''); // JSON string
  const [experienceYears, setExperienceYears] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState(''); // JSON string
  const [rates, setRates] = useState(''); // JSON string
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToast();
  const addToast = useToast();

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/profile/serviceProvider?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.id) {
            setBusinessName(data.business_name || '');
            setServiceCategories(data.service_categories || '');
            setSkills(data.skills || '');
            setExperienceYears(data.experience_years || '');
            setPortfolioUrls(data.portfolio_urls || '');
            setRates(data.rates || '');
            setAvailabilityStatus(data.availability_status || '');
            setIsEditing(true);
          } else if (response.status === 404) {
            setIsEditing(false);
            addToast('No existing profile found. You can create a new one below.', 'info');
          } else {
            addToast(`Error fetching profile: ${data.message || 'Unknown error'}`, 'error');
          }
        } catch (error) {
          console.error('Error fetching service provider profile:', error);
          addToast('Error fetching profile. Please try again.', 'error');
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
      addToast('User ID is required to create or update a profile.', 'error');
      return;
    }

    setIsLoading(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/profile/serviceProvider';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          businessName,
          serviceCategories: serviceCategories || null,
          skills: skills || null,
          experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
          portfolioUrls: portfolioUrls || null,
          rates: rates || null,
          availabilityStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`Profile ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
        setIsEditing(true);
        if (onProfileSaved) onProfileSaved();
      } else {
        addToast(`Failed to ${isEditing ? 'update' : 'create'} profile: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} service provider profile:`, error);
      addToast(`Error ${isEditing ? 'updating' : 'creating'} profile. Please try again.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Service Provider Profile' : 'Create Service Provider Profile'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="businessName" style={{ display: 'block', marginBottom: '5px' }}>Business Name:</label>
          <input type="text" id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="serviceCategories" style={{ display: 'block', marginBottom: '5px' }}>Service Categories (JSON string):</label>
          <textarea id="serviceCategories" value={serviceCategories} onChange={(e) => setServiceCategories(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="skills" style={{ display: 'block', marginBottom: '5px' }}>Skills (JSON string):</label>
          <textarea id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="experienceYears" style={{ display: 'block', marginBottom: '5px' }}>Experience Years:</label>
          <input type="number" id="experienceYears" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="portfolioUrls" style={{ display: 'block', marginBottom: '5px' }}>Portfolio URLs (JSON string):</label>
          <textarea id="portfolioUrls" value={portfolioUrls} onChange={(e) => setPortfolioUrls(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="rates" style={{ display: 'block', marginBottom: '5px' }}>Rates (JSON string):</label>
          <textarea id="rates" value={rates} onChange={(e) => setRates(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="availabilityStatus" style={{ display: 'block', marginBottom: '5px' }}>Availability Status:</label>
          <input type="text" id="availabilityStatus" value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <ProfileImageUpload onImageUploadSuccess={(url) => console.log('Service Provider profile image uploaded:', url)} />
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isLoading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
        </button>
      </form>
      
    </div>
  );
};

export default ServiceProviderProfileForm;
