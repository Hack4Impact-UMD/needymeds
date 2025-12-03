import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    API_BASE: process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000',
  },
});
