import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Alert, PermissionsAndroid, Platform, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text, Button } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import uuid from 'uuid-random'
import BLEAdvertiser from 'react-native-ble-advertiser'
import { 
    startAdvertisingBeaconWithString, 
    stopAdvertisingBeacon,
    checkTransmissionSupported,
    isStarted
} from '@maxiru/react-native-ibeacon-simulator';

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `scan: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="scan" component={ScanScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const ScanScreen: FC<StackScreenProps<NavigatorParamList, "scan">> = observer(function ScanScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

    // Uses the Apple code to pick up iPhones
    const APPLE_ID = 0x4C;
    const MANUF_DATA = [1,0];

    BLEAdvertiser.setCompanyId(APPLE_ID); 

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'BLE Avertiser Example App',
                        'message': 'Example App access to your location ',
                        buttonPositive: "Ok"
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('[Permissions]', 'Location Permission granted')
                } else {
                    console.log('[Permissions]', 'Location Permission denied')
                }
            }

            const blueoothActive = await BLEAdvertiser.getAdapterState().then(result => {
                console.log('[Bluetooth]', 'Bluetooth Status', result)
                    return result === "STATE_ON";
                }).catch(error => { 
                    console.log('[Bluetooth]', 'Bluetooth Not Enabled', error)
                    return false;
                });

            if (!blueoothActive) {
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
            console.warn(err)
        }
    }

    const startAdvertising = () => {
        const options = {
            uuid: uuid(),
            major: 3,
            minor: 2,
            identifier: 'Test Beacon 1',
            txPower: 0,
            advertiseMode: 1,
            advertiseTxPowerLevel: 1,
            beaconName: 'Test This BLE Beacon'
        }
        checkTransmissionSupported()
        .then(() => {
            if(isStarted())
                stopAdvertisingBeacon();
            startAdvertisingBeaconWithString(options);
        });
    }

    const stopAdvertising = () => {
         stopAdvertisingBeacon();
    }

    const startAdvertisting2 = () => {
        const uuidv4 = uuid();
        BLEAdvertiser.broadcast(uuidv4, MANUF_DATA, {
            connectable: false,
            includeDeviceName: true,
            beaconName: 'Test This Out'
        })
        .then(sucess => console.log(uuidv4, "Adv Successful", sucess))
        .catch(error => console.log(uuidv4, "Adv Error", error));
    }

    const stopAdvertising2 = () => {
        BLEAdvertiser.stopBroadcast()
        .then(sucess => console.log("Stop Broadcast Successful", sucess))
        .catch(error => console.log("Stop Broadcast Error", error));
    }

    useEffect(() => {
        requestLocationPermission();
    })

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="scan" />

        <Button text="Start Advertising" onPress={startAdvertising} />
        <Button text="Stop Advertising" onPress={stopAdvertising} />

        <Button text="Start Advertising2" onPress={startAdvertisting2} />
        <Button text="Stop Advertising2" onPress={stopAdvertising2} />

    </Screen>
  )
})
