import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export async function handleAddToWallet() {
  console.log('HEREREREREER1');
  try {
    const localPath = FileSystem.cacheDirectory + 'MyPass.pkpass';

    console.log('Fetching pass via POST...');
    const response = await fetch('http://ddcapp-api.needymeds.org/api/applewallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumber: '90MA019309343023' }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    const blob = await response.blob();
    const reader = new FileReader();

    await new Promise<void>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(localPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('Opening share sheet...');
    if (Platform.OS === 'ios') {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPath, {
          mimeType: 'application/vnd.apple.pkpass',
          UTI: 'com.apple.pkpass',
        });
      }
    } else {
      Alert.alert('Not supported', 'Apple Wallet is only available on iOS.');
    }
  } catch (error) {
    console.error('Wallet error:', error);
    Alert.alert('Error', 'Could not add pass to wallet. Please try again.');
  }
}

// //OLD CODE
// import * as FileSystem from 'expo-file-system/legacy';
// import * as Sharing from 'expo-sharing';

// export async function handleAddToWallet() {
//   try {
//     const fileUri = FileSystem.cacheDirectory + 'pass.pkpass';

//     const downloadResult = await FileSystem.downloadAsync(
//       'http://ddcapp-api.needymeds.org/api/applewallet',
//       fileUri
//     );

//     console.log('Download result:', JSON.stringify(downloadResult));

//     if (downloadResult.status !== 200) {
//       console.error('Download failed with status:', downloadResult.status);
//       return;
//     }

//     await Sharing.shareAsync(downloadResult.uri, {
//       mimeType: 'application/vnd.apple.pkpass',
//       UTI: 'com.apple.pkpass',
//     });

//   } catch (error) {
//     console.error('Failed to open wallet pass:', error);
//   }
// }
