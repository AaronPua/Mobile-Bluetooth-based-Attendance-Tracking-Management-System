import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import uuid from 'uuid-random'
import { requestLocationBluetoothPermissions } from "../../utils/permissions"
import { startAdvertising, stopAdvertising } from "../../utils/bluetooth"
import { Box, HStack, VStack, Text, View, StatusBar, Center, Button, Spacer } from 'native-base'

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `scan: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="scan" component={ScanScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const BroadcastScreen: FC<StackScreenProps<NavigatorParamList, "broadcast">> = observer(function ScanScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

    useEffect(() => {
        requestLocationBluetoothPermissions();
    }, []);

    const startBeaconAdvertisement = () => {
        startAdvertising(uuid(), 'BLE Beacon Trial');
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
        </View>
    )
})
