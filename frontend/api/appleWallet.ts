import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export async function handleAddToWallet() {
  try {
    const fileUri = FileSystem.cacheDirectory + 'pass.pkpass';

    const downloadResult = await FileSystem.downloadAsync(
      'http://ddcapp-api.needymeds.org/api/applewallet',
      fileUri
    );

    console.log('Download result:', JSON.stringify(downloadResult));

    if (downloadResult.status !== 200) {
      console.error('Download failed with status:', downloadResult.status);
      return;
    }

    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: 'application/vnd.apple.pkpass',
      UTI: 'com.apple.pkpass',
    });
  } catch (error) {
    console.error('Failed to open wallet pass:', error);
  }
}
