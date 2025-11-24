jest.mock('expo-location', () => ({
  __esModule: true,
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })
  ),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    manifest: {
      extra: {},
    },
  },
}));

if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          address: { postcode: '99999' },
          display_name: 'Mock Address',
        }),
    })
  );
}

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
  originalError(...args);
};
