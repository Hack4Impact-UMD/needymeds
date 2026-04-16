import * as FileSystem from 'expo-file-system/legacy';

export async function handleAddToWallet() {
  try {
    const fileUri = FileSystem.cacheDirectory + 'pass.pkpass';

    const downloadResult = await FileSystem.downloadAsync(
      'https://ddcapp-api.needymeds.org/api/applewallet',
      fileUri
    );

    console.log('Download result:', JSON.stringify(downloadResult));

    if (downloadResult.status !== 200) {
      console.error('Download failed with status:', downloadResult.status);
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PassKit = require('react-native-passkit-wallet').default;
    await PassKit.addPass(base64);
  } catch (error) {
    console.error('Failed to open wallet pass:', error);
  }
}
