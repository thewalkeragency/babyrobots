export const isValidEmail = (email) => {
  // Basic email regex for format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  // Password must be at least 8 characters long
  // Contain at least one uppercase letter
  // Contain at least one lowercase letter
  // Contain at least one number
  // Contain at least one special character
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
  return strongRegex.test(password);
};

export const validateProfileData = (role, profile) => {
  switch (role) {
    case 'artist':
      if (!profile.stageName) {
        return { isValid: false, message: 'Artist profile requires a stage name.' };
      }
      // Add more artist-specific validations here
      break;
    case 'fan':
      if (!profile.displayName) {
        return { isValid: false, message: 'Fan profile requires a display name.' };
      }
      // Add more fan-specific validations here
      break;
    case 'licensor':
      if (!profile.companyName) {
        return { isValid: false, message: 'Licensor profile requires a company name.' };
      }
      // Add more licensor-specific validations here
      break;
    case 'service_provider':
      if (!profile.businessName) {
        return { isValid: false, message: 'Service Provider profile requires a business name.' };
      }
      // Add more service provider-specific validations here
      break;
    default:
      return { isValid: true };
  }
  return { isValid: true };
};
