import { v4 as uuidv4 } from 'uuid';

// Generate unique booking ID
export const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

// Generate confirmation code
export const generateConfirmationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Calculate booking expiry (24 hours from now)
export const calculateExpiryTime = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};