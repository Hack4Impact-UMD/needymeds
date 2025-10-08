import UserLocation from "../(tabs)/user_location";

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(async () => ({
        coords: { latitude: 37.7749, longitude: -122.4194 },
    })),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(() => jest.fn()),
    useSelector: jest.fn(fn => fn({ location: { zipCode: '02139', address: '123 Main St' } })),
}));  

test("Attempts to fetch address and zipcode", async () => {
    const fact = await UserLocation();
    expect(fact).toHaveProperty("zipcode");
    expect(fact).toHaveProperty("address");
})