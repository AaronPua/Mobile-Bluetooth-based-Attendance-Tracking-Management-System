import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeEventEmitter, NativeModules } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, VStack, Text, FlatList, View, StatusBar, Button, Spacer, IconButton, useToast, Pressable } from 'native-base'
import { MaterialIcons, Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { requestLocationBluetoothPermissions } from "../../utils/permissions"
import { BeaconsCollection, LessonsCollection } from "../../utils/collections"
import Meteor from '@meteorrn/core'
import BleManager from 'react-native-ble-manager'
import _ from 'underscore';
import * as LocalAuthentication from 'expo-local-authentication';

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `scan: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="scan" component={ScanScreen} />`
// Hint: Look for the 🔥!
// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const ScanScreen: FC<StackScreenProps<NavigatorParamList, "scan">> = observer(function ScanScreen({ route }) {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()

    const BleManagerModule = NativeModules.BleManager;
    const bleEmitter = new NativeEventEmitter(BleManagerModule);
    const toast = useToast();

    const { courseId, lessonId } = route.params;

    const scannedDevices = new Map();
    const [isScanning, setIsScanning] = useState(false);
    const [devicesList, setDevicesList] = useState([]);

    const [activeItemIndex, setActiveItemIndex] = useState('');
    const [showCheckIn, setShowCheckIn] = useState(false);

    const { userId, beaconUUIDs, didStudentAttend } = Meteor.useTracker(() => {
        const userId = Meteor.userId();

        Meteor.subscribe('beacons.forOneCourse', courseId);
        const beacons = BeaconsCollection.find({ courseId: courseId }, { sort: { name: 1 } }).fetch();
        const beaconUUIDs = _.pluck(beacons, 'uuid');

        Meteor.subscribe('lessons.specific', lessonId);
        const lesson = LessonsCollection.find({ _id: lessonId }, { fields: { studentAttendance: 1 } }).fetch();
        const didStudentAttend = _.chain(lesson).pluck('studentAttendance').flatten(true).pluck('_id').contains(userId).value();

        return { userId, beaconUUIDs, didStudentAttend };
    });

    const initModule = () => {
        BleManager.start({ showAlert: true })
        .then(() => {
            console.log('BleManager module initialized')
        });
    }

    const startScan = async (beaconUUIDs: string[]) => {
        if (!isScanning) {
            clearScannedDevices();

            await BleManager.scan(beaconUUIDs, 5, true)
            .then(() => {
                toast.show({ description: 'Scanning Started', duration: 2000 });
                setIsScanning(true);
            })
            .catch((err) => {
                console.error(err);
            });
        }
    }

    const stopScanning = async () => {
        await BleManager.stopScan()
        .then(() => {
            toast.show({ description: 'Scanning Stopped', duration: 3000 });
        });
    }

    const clearScannedDevices = () => {
        scannedDevices.clear();
        setDevicesList([]);
    }

    const handleStopScan = () => {
        toast.show({ description: 'Scanning Stopped' });
        setIsScanning(false);
    }

    const handleScannedDevices = (device: { name: string; id: string }) => {
        if (!device.name) {
            device.name = 'N/A';
        }

        scannedDevices.set(device.id, device);
        setDevicesList(Array.from(scannedDevices.values()));
    }

    const getDeviceName = (device: { advertising: { localName: string }; name: string }) => {
        if (device.advertising) {
            if (device.advertising.localName) {
                return device.advertising.localName;
            }
        }
        return device.name;
    }

    const truncateString = (str: string, num: number) => {
        return (str != null && str.length > num) ? str.slice(0, num) + "..." : str;
    }

    useEffect(() => {
        requestLocationBluetoothPermissions();
        initModule();
        // add ble listeners on mount
        const discoverDeviceSub = bleEmitter.addListener('BleManagerDiscoverPeripheral', handleScannedDevices);
        const stopScanSub = bleEmitter.addListener('BleManagerStopScan', handleStopScan);

        // remove ble listeners on unmount
        return () => {
            console.log('Unmount');
            discoverDeviceSub.remove();
            stopScanSub.remove();
        };
    }, [])

    const showCheckInButton = (index: string) => {
        setShowCheckIn(prev => !prev);
        setActiveItemIndex(index);
    }

    const updateAttendance = async (lessonId: string, studentId: string, action: string) => {
        const result = await LocalAuthentication.authenticateAsync();
        if(result.success) {
            Meteor.call('lesson.updateAttendance', { 
                lessonId: lessonId,
                studentId: studentId,
                action: action
            }, (error: any) => {
                if(error) {
                    console.log(error);
                } else {
                    toast.show({
                        description: 'Attendance Checked-in!'
                    });
                }
            });
        }
        else {
            toast.show({
                description: 'You have to be authenticated first',
                duration: 2000
            });
        }
    }

    // render list of devices
    const renderItem = (item: any) => {
        return (
            <Pressable onPress={() => showCheckInButton(item.id)} key={item.id}>
                <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="space-between" alignItems="center">
                        <MaterialIcons name="bluetooth-searching" size={32} color="black" />
                        <VStack>
                            <Text color="coolGray.800" bold>
                                {getDeviceName(item)}
                            </Text>
                            <Text color="coolGray.600">
                                id: {truncateString(item.id, 20)}
                            </Text>
                            { item.advertising.serviceUUIDs != null &&
                                item.advertising.serviceUUIDs[0] != null &&
                                <Text color="coolGray.600">
                                    uuid: {truncateString(item.advertising.serviceUUIDs[0], 20)}
                                </Text>
                            }
                        </VStack>
                        <Spacer />
                        <VStack>
                            <Text color="coolGray.800" alignSelf="flex-start">
                                RSSI
                            </Text>
                            <Text color="coolGray.800" alignSelf="flex-start">
                                {item.rssi}
                            </Text>
                        </VStack>
                    </HStack>
                    { showCheckIn && activeItemIndex === item.id &&
                        <Box bg="#FAEDCA" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                            <HStack space={3} justifyContent="flex-start" alignItems="center">
                                <Feather name="user-check" size={24} color="black" />
                                <VStack>
                                    <VStack justifyContent="space-between">
                                        <Text fontSize="md" color="coolGray.800" bold>
                                            Attendance
                                        </Text>
                                    </VStack>
                                
                                    <HStack space={3} my={3} justifyContent="flex-start">
                                       <Button colorScheme="info" onPress={() => updateAttendance(lessonId, userId, 'add')}>Check-in</Button>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Box>
                    }
                </Box>
            </Pressable>
        )
    }

    return (
        <View backgroundColor="blueGray.100" flex="1">
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Box safeAreaTop bg="#6200ee" />
            <HStack bg="#6200ee" px="3" py="3" justifyContent="space-between" alignItems="center" w="100%">
                <HStack alignItems="center">
                    <Text color="white" fontSize="20" fontWeight="bold">
                        Check-in
                    </Text>
                </HStack>
                <HStack alignItems="center">
                    <IconButton icon={<Ionicons name="trash-outline" color="white" />} _icon={{ size: 28 }} onPress={() => clearScannedDevices()}/>
                    { isScanning ?  ( 
                        <Button bg="#6200ee" size="md" onPress={() => stopScanning()} _pressed={{ bg: "#818cf8" }}>
                            <Text color="white" fontSize="16">
                                Stop
                            </Text>
                        </Button> )
                        : ( <Button bg="#6200ee" size="md" onPress={() => startScan(beaconUUIDs)} _pressed={{ bg: "#818cf8" }}>
                            <Text color="white" fontSize="16">
                                Scan
                            </Text>
                        </Button> )
                    }
                </HStack>
            </HStack>

            <Box bg="blueGray.300" pl="3" pr="4" py="3" mx="4" my="2" borderRadius="20" shadow="3">
                <HStack space={3} justifyContent="space-between" alignItems="center">
                    <Text fontSize="lg" color="coolGray.800" bold>
                        Current Attendance:      
                    </Text>
                    { didStudentAttend ? 
                        <MaterialCommunityIcons name="check-circle" size={24} color="darkgreen" />
                        :
                        <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                    }
                </HStack>
            </Box>

            <Box bg="blueGray.300" pl="3" pr="4" py="3" mx="4" my="2" borderRadius="20" shadow="3">
                <Text fontSize="md" color="coolGray.800">
                    You have to authenticate yourself before checking-in. 
                    Please talk to your instructor if there are any issues with the process.
                </Text>
            </Box>

            <FlatList data={devicesList} keyExtractor={item => item.id} renderItem={({ item }) => renderItem(item)} />
        </View>
    )
})