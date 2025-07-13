import React, { useState } from 'react';

const ProfileImageUpload = ({ onImageUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setUploadedImageUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select an image file first!');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Upload successful! File URL: ${data.fileUrl}`);
        setUploadedImageUrl(data.fileUrl);
        if (onImageUploadSuccess) {
          onImageUploadSuccess(data.fileUrl);
        }
        setSelectedFile(null);
      } else {
        setMessage(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
      <h3>Upload Profile Image</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading} style={{ marginLeft: '10px', padding: '8px 15px', cursor: 'pointer' }}>
        {isLoading ? 'Uploading...' : 'Upload Image'}
      </button>
      {message && <p style={{ marginTop: '10px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
      {uploadedImageUrl && (
        <div style={{ marginTop: '15px' }}>
          <p>Uploaded Image Preview:</p>
          <img src={uploadedImageUrl} alt="Profile Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
