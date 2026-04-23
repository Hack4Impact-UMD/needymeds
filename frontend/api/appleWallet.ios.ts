import * as FileSystem from 'expo-file-system/legacy';
import PassKit from 'react-native-passkit-wallet';
import { DrugSearchResult } from './types';

export async function handleAddToWallet(result: DrugSearchResult) {
  try {
    const fileUri = FileSystem.cacheDirectory + 'pass.pkpass';
    const params = new URLSearchParams({
      ndc: result.ndc,
    });

    const downloadResult = await FileSystem.downloadAsync(
      `https://ddcapp-api.needymeds.org/api/applewallet?${params.toString()}`,
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

    await PassKit.addPass(base64);
  } catch (error) {
    console.error('Failed to open wallet pass:', error);
  }
}
