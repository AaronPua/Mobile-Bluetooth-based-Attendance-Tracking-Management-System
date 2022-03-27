import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text, Button } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import uuid from 'uuid-random'
import { requestBluetoothPermission, requestLocationPermission } from "../../utils/permissions"
import { startAdvertising, stopAdvertising } from "../../utils/bluetooth"

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
export const BroadcastScreen: FC<StackScreenProps<NavigatorParamList, "broadcast">> = observer(function ScanScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

    useEffect(() => {
        requestLocationPermission();
        requestBluetoothPermission();
    });

    const startBeaconAdvertisement = () => {
        startAdvertising(uuid(), 'BLE Beacon Trial');
    }

    return (
        <Screen style={ROOT} preset="scroll">
        <Text preset="header" text="broadcast" />
            <Button text="Start Advertising" onPress={() => startBeaconAdvertisement()} />
            <Button text="Stop Advertising" onPress={() => stopAdvertising()} />
        </Screen>
    )
})
