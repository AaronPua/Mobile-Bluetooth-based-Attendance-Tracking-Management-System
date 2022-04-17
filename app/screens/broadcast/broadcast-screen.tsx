import React, { FC, useState, useRef, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, StatusBar, View, Text, VStack, FlatList, Pressable, Button } from "native-base"
import { MaterialCommunityIcons, Octicons, FontAwesome5 } from '@expo/vector-icons'
import Meteor from '@meteorrn/core'
import { BeaconsCollection } from '../../utils/collections'
import BLEAdvertiser from 'react-native-ble-advertiser'
import { requestLocationBluetoothPermissions } from "../../utils/permissions"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `scan: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="scan" component={ScanScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const BroadcastScreen: FC<StackScreenProps<NavigatorParamList, "broadcast">> = observer(function ScanScreen({ route }) {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()

    // Uses the Apple code to pick up iPhones
    const APPLE_ID = 0x4C;
    const MANUF_DATA = [1,0];
    BLEAdvertiser.setCompanyId(APPLE_ID);

    const { courseId, lessonId } = route.params;
    const timer = useRef<ReturnType<typeof setInterval>>();

    const [activeItemIndex, setActiveItemIndex] = useState('');
    const [showBeacon, setShowBeacon] = useState(false);
    const [isAdvertising, setIsAdvertising] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const { beacons } = Meteor.useTracker(() => {
        Meteor.subscribe('beacons.forOneCourse', courseId);
        const beacons = BeaconsCollection.find({ courseId: courseId }, { sort: { name: 1 } }).fetch();

        return { beacons };
    });

    useEffect(() => {
        requestLocationBluetoothPermissions();
    }, []);

    const startBeaconBroadcast = (uuidString: string, beaconName: string) => {
        const options = {
            advertiseMode: 1, // ADVERTISE_MODE_BALANCED
            txPowerLevel: 1, // ADVERTISE_TX_POWER_LOW
            includeDeviceName: true,
            connectable: false,
            beaconName: beaconName
        }

        // If bluetooth is turned on, start broadcast.
        if(BLEAdvertiser.isActive()) {
            BLEAdvertiser.broadcast(uuidString, MANUF_DATA, options)
            .then(() => {
                setIsAdvertising(true)
                timer.current = setInterval(() => {
                    setElapsedTime(elapsedTime => elapsedTime + 1)
                }, 1000)
            })
            .catch(error => {
                console.warn(uuidString, "Adv Error", error);
            });
        }
    }

    const stopBeaconBroadcast = () => {
        if(isAdvertising) {
            BLEAdvertiser.stopBroadcast()
            .then(() => {
                setIsAdvertising(false);
                clearInterval(timer.current);
                setElapsedTime(0);
            })
            .catch(error => { 
                console.log("Stop Broadcast Error", error);
            });
        }
    }

    const showSpecificBeacon = (index: string) => {
        setShowBeacon(prev => !prev);
        setActiveItemIndex(index);
    }

    const renderItem = (item: any) => {
        return (
            <Pressable onPress={() => showSpecificBeacon(item._id)} key={item._id}>
                <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="flex-start" alignItems="center">
                        { showBeacon && activeItemIndex === item._id ?
                            <MaterialCommunityIcons name="minus-circle" size={24} color="black" />
                            :
                            <MaterialCommunityIcons name="plus-circle" size={24} color="black" />
                        }
                        <VStack>
                            <Text fontSize="lg" _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                                {item.name}
                            </Text>
                            <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                                {item.uuid}
                            </Text>
                        </VStack>
                    </HStack>
                    { showBeacon && activeItemIndex === item._id && 
                        <Box bg="#FAEDCA" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                            <HStack space={3} justifyContent="flex-start" alignItems="center">
                                { isAdvertising ?
                                    <FontAwesome5 name="broadcast-tower" size={18} color="black" />
                                    :
                                    <Octicons name="broadcast" size={24} color="black" />
                                }
                                <VStack>
                                    <VStack justifyContent="space-between">
                                        <Text fontSize="md" _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                                            Broadcast
                                        </Text>
                                        <Text fontSize="md" _dark={{ color: "warmGray.200" }} color="coolGray.600">
                                            Time Elapsed: {elapsedTime}
                                        </Text>
                                    </VStack>
                                
                                    <HStack space={3} my={3} justifyContent="flex-start">
                                        { isAdvertising ? 
                                            <Button isLoading isLoadingText="Broadcasting" _loading={{ bg: "muted.300" }}
                                                onPress={() => startBeaconBroadcast(item.uuid, item.name)}>
                                                Start
                                            </Button>
                                            :
                                            <Button colorScheme="info" onPress={() => startBeaconBroadcast(item.uuid, item.name)}>Start</Button>
                                        }
                                        { isAdvertising ? 
                                            <Button colorScheme="info" onPress={() => stopBeaconBroadcast()}>Stop</Button>
                                            :
                                            <Button isDisabled onPress={() => stopBeaconBroadcast()}>Stop</Button>
                                        }
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
                        Beacons
                    </Text>
                </HStack>
            </HStack>

            <FlatList data={beacons} keyExtractor={(item: any) => item._id} renderItem={({ item }) => renderItem(item)} />
        </View>
    )
})
