/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, DeviceEventEmitter, FlatList, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, SafeAreaView, ScrollView, StatusBar, TouchableHighlight, View, ViewStyle, Button, StyleSheet } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { Colors } from "react-native/Libraries/NewAppScreen"

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
    const peripherals = new Map();
    const [list, setList] = useState([]);

    const initModule = () => {
        BleManager.start({ showAlert: false })
        .then(() => {
            console.log('BleManager module initialized')
        })
    }

    // start to scan peripherals
    const startScan = () => {
        // skip if scan process is currenly happening
        if (isScanning) {
            return;
        }

        // first, clear existing peripherals
        peripherals.clear();
        setList(Array.from(peripherals.values()));

        // then re-scan it
        BleManager.scan([], 30, true)
        .then(() => {
            console.log('Scanning...');
            setIsScanning(true);
        })
        .catch((err) => {
            console.error(err);
        });
    }

    // handle stop scan event
    const handleStopScan = () => {
        console.log('Scan is stopped');
        setIsScanning(false);
    }

    // handle discovered peripheral
    const handleDiscoverPeripheral = (peripheral) => {
        console.log('Got ble peripheral', peripheral);

        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        }

        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
    }

    // get advertised peripheral local name (if exists). default to peripheral name
    const getPeripheralName = (item) => {
        if (item.advertising) {
            if (item.advertising.localName) {
                return item.advertising.localName;
            }
        }

        return item.name;
    };

    useEffect(() => {
        initModule()

        // add ble listeners on mount
        bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleEmitter.addListener('BleManagerStopScan', handleStopScan);

        // remove ble listeners on unmount
        return () => {
        console.log('Unmount');

            bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
        };
    }, [])

    // render list of devices
    const renderItem = (item) => {
        const color = item.connected ? 'green' : '#fff';
        return (
            // <TouchableHighlight onPress={() => connectAndTestPeripheral(item)}>
            <TouchableHighlight>
                <View style={styles.body}>
                    <Text
                        style={{
                        fontSize: 12,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 10,
                        }}>
                        {getPeripheralName(item)}
                    </Text>
                    <Text
                        style={{
                        fontSize: 10,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                        }}>
                        RSSI: {item.rssi}
                    </Text>
                    <Text
                        style={{
                        fontSize: 8,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                        paddingBottom: 20,
                        }}>
                        {item.id}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    };
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeAreaView}>
                {/* header */}
                <View style={styles.body}>
                <View style={styles.scanButton}>
                    <Button
                    title={'Scan Bluetooth Devices'}
                    onPress={() => startScan()}
                    />
                </View>

                {list.length === 0 && (
                    <View style={styles.noPeripherals}>
                    <Text style={styles.noPeripheralsText}>No peripherals</Text>
                    </View>
                )}
                </View>

                {/* ble devices */}
                <FlatList
                    data={list}
                    renderItem={({item}) => renderItem(item)}
                    keyExtractor={(item) => item.id}
                />
                
            </SafeAreaView>
        </>
    )
})

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    width: '100%',
  },
  footerButton: {
    alignSelf: 'stretch',
    backgroundColor: 'grey',
    padding: 10,
  },
  noPeripherals: {
    flex: 1,
    margin: 20,
  },
  noPeripheralsText: {
    textAlign: 'center',
  },
  safeAreaView: {
    flex: 1,
  },
  scanButton: {
    margin: 10,
  },
});
