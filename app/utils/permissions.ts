// eslint-disable-next-line react-native/split-platform-components
import { Alert, PermissionsAndroid } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';

export const requestLocationBluetoothPermissions = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs location permission to operate correctly.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('[Permissions]', 'Location Permission granted');
        } else {
            console.log('[Permissions]', 'Location Permission denied');
        }

        const bluetoothActive = await BLEAdvertiser.getAdapterState().then(result => {
            console.log('[Bluetooth]', 'Bluetooth Status', result)
                return result === "STATE_ON";
            }).catch(error => { 
                console.log('[Bluetooth]', 'Bluetooth Not Enabled', error)
                return false;
            });

        if (!bluetoothActive) {
            Alert.alert(
                'Example requires bluetooth to be enabled',
                'Would you like to enable Bluetooth?',
                [
                    {
                        text: 'Yes',
                        onPress: () => BLEAdvertiser.enableAdapter(),
                    },
                    {
                        text: 'No',
                        onPress: () => console.log('Do Not Enable Bluetooth Pressed'),
                        style: 'cancel',
                    },
                ],
            )
        }
    } catch (err) {
        console.warn(err);
    }
}