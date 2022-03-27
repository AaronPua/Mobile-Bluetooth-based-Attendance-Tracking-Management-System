import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"

import { BleManager, Device } from 'react-native-ble-plx';

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

  const manager = new BleManager();

  // state to give the user a feedback about the manager scanning devices
  const [isLoading, setIsLoading] = useState(false);
  const [scannedDevices, setScannedDevices] = useState(new Map());

    const startScanningForDevices = () => {
        manager.startDeviceScan(null, { allowDuplicates: false }, (error, scannedDevice) => {
            if(error)
                console.warn(error);
            
            if(scannedDevice) {
                addDevice(scannedDevice);           
            }
        });
    }

    const stopScanningForDevices = () => {
        manager.stopDeviceScan();
    }

    const addDevice = (device: Device) => {
        const deviceProperties = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            serviceData: device.serviceData,
            serviceUUIDs: device.serviceUUIDs,
            localName: device.localName,
            txPowerLevel: device.txPowerLevel,
        }
        console.log(deviceProperties);
    }

    useEffect(() => {
        return () => {
            manager.destroy();
        }
    }, [manager]);
  
    return (
        <Screen style={ROOT} preset="scroll">
        <Text preset="header" text="scan" />
            <Button text="Start Scanning" onPress={() => startScanningForDevices()} />
            <Button text="Stop Scanning" onPress={() => stopScanningForDevices()} />
        </Screen>
    )
})
