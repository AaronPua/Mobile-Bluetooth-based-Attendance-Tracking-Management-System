import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, StatusBar, View, Text, Center, Button } from 'native-base'

import { BleManager, Device } from 'react-native-ble-plx';

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

    const startScanningForDevices = () => {
        manager.startDeviceScan(null, { allowDuplicates: false }, (error, scannedDevice) => {
            if(error)
                console.warn(error);
            
            if(scannedDevice) {
                addDevice(scannedDevice);           
            }
        });

        setTimeout(() => {
            manager.stopDeviceScan();
            console.log('stopped on its own');
        }, 5000);
    }

    const stopScanningForDevices = () => {
        manager.stopDeviceScan();
        console.log('stopped');
    }

    const addDevice = (device: Device) => {
        const deviceProperties = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            serviceUUIDs: device.serviceUUIDs,
            localName: device.localName,
        }
        console.log(deviceProperties);
    }

    useEffect(() => {
        return () => {
            manager.destroy();
        }
    }, [manager]);
  
    return (
        <View backgroundColor="white" flex="1">
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Box safeAreaTop bg="#6200ee" />
            <HStack bg="#6200ee" px="3" py="3" justifyContent="space-between" alignItems="center" w="100%">
                <HStack alignItems="center">
                <Text color="white" fontSize="20" fontWeight="bold">
                    COMP8047
                </Text>
                </HStack>
            </HStack>

            <Center>
                <HStack space={3} mt="5">
                    <Button onPress={() => startScanningForDevices()}>Start Scanning</Button>
                    <Button onPress={() => stopScanningForDevices()}>Stop Scanning</Button>
                </HStack>
            </Center>
        </View>
    )
})
