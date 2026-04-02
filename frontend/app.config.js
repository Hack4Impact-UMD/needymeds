import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    API_BASE: process.env.EXPO_PUBLIC_API_BASE || 'https://ddcapp-api.needymeds.org',
  },
});
