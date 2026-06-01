module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'taskflow-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d',
};
