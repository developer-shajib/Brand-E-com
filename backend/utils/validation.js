import JWT from 'jsonwebtoken';

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email format is valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @param {number} minLength - Minimum length requirement (default: 6)
 * @returns {boolean} - True if the password meets requirements, false otherwise
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password) return false;
  return password.length >= minLength;
};

/**
 * Checks if a string is empty or only contains whitespace
 * @param {string} value - The string to check
 * @returns {boolean} - True if the string is not empty, false otherwise
 */
export const isNotEmpty = (value) => {
  if (!value) return false;
  return value.trim().length > 0;
};

/**
 * Validates a phone number format for international numbers
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone format is valid, false otherwise
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;

  // Remove all non-numeric characters except + (for country code)
  const cleanedPhone = phone.replace(/[^\d+]/g, '');

  // International phone number validation

  const phoneRegex = /^(?:\+?)?[0-9]{7,15}$/;

  // Check if the cleaned phone number matches the regex
  return phoneRegex.test(cleanedPhone);
};

/**
 * Validates a postal/zip code format
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} - True if the postal code format is valid, false otherwise
 */
export const isValidPostalCode = (postalCode) => {
  if (!postalCode) return false;

  // Basic postal code validation - can be adjusted for specific country formats
  const postalCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Creates a JWT token with the provided data
 * @param {Object} data - The data to include in the token
 * @param {string} expiresIn - Token expiration time (default: '24h')
 * @returns {string} - JWT token
 */
export const createToken = (data, expiresIn = '24h') => {
  return JWT.sign(data, process.env.JWT_SECRET, {
    expiresIn
  });
};

/**
 * Verifies a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} - The decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};
