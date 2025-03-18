import JWT from 'jsonwebtoken';

// Helper function to generate tokens
export const generateTokens = (userId) => {
  const accessToken = JWT.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = JWT.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
};
