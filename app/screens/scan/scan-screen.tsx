/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeEventEmitter, NativeModules } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, VStack, Text, FlatList, View, StatusBar, Center, Button, Spacer } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'

import BleManager from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager
const bleEmitter = new NativeEventEmitter(BleManagerModule)

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

    const [isScanning, setIsScanning] = useState(false);
    const scannedDevices = new Map();
    const [devicesList, setDevicesList] = useState([]);

    const initModule = () => {
        BleManager.start({ showAlert: false })
        .then(() => {
            console.log('BleManager module initialized')
        })
    }

    const startScan = () => {
        if (isScanning)
            return;

        clearScannedDevices();

        BleManager.scan([], 5, true)
        .then(() => {
            console.log('Scanning...');
            setIsScanning(true);
        })
        .catch((err) => {
            console.error(err);
        });
    }

    const clearScannedDevices = () => {
        scannedDevices.clear();
        setDevicesList(Array.from(scannedDevices.values()));
    }

    const handleStopScan = () => {
        console.log('Scan is stopped');
        setIsScanning(false);
    }

    const handleScannedDevices = (device) => {
        console.log('Got ble peripheral', device);

        if (!device.name) {
            device.name = 'N/A';
        }

        scannedDevices.set(device.id, device);
        setDevicesList(Array.from(scannedDevices.values()));
    }

    const getDeviceName = (device: any) => {
        if (device.advertising) {
            if (device.advertising.localName) {
                return device.advertising.localName;
            }
        }
        return device.name;
    }

    const truncateString = (str: any, num: any) => {
        return (str != null && str.length > num) ? str.slice(0, num) + "..." : str;
    }

    useEffect(() => {
        initModule()
        // add ble listeners on mount
        bleEmitter.addListener('BleManagerDiscoverPeripheral', handleScannedDevices);
        bleEmitter.addListener('BleManagerStopScan', handleStopScan);

        // remove ble listeners on unmount
        return () => {
            console.log('Unmount');
            bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleScannedDevices);
            bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
        };
    }, [])

    // render list of devices
    const renderItem = (item: any) => {
        return (
            <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                <HStack space={3} justifyContent="space-between" alignItems="center">
                    <MaterialIcons name="bluetooth-searching" size={32} color="black" />
                    <VStack>
                        <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                            {getDeviceName(item)}
                        </Text>
                        <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                            {item.id}
                        </Text>
                        {item.advertising.serviceUUIDs != null &&
                            item.advertising.serviceUUIDs[0] != null &&
                            <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                                {truncateString(item.advertising.serviceUUIDs[0], 30)}
                            </Text>}
                    </VStack>
                    <Spacer />
                    <VStack>
                        <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" alignSelf="flex-start">
                            RSSI
                        </Text>
                        <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" alignSelf="flex-start">
                            {item.rssi}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        )
    }

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
                <HStack space={3} mt="4" mb="3">
                    <Button onPress={() => startScan()}>Scan Devices</Button>
                    <Button onPress={() => clearScannedDevices()}>Clear Devices</Button>
                </HStack>
            </Center>

            <FlatList data={devicesList} keyExtractor={item => item.id} renderItem={({ item }) => renderItem(item)}/>
        </View>
    )
})