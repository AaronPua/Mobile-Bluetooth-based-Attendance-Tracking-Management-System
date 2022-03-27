import BLEAdvertiser from 'react-native-ble-advertiser';

// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x4C;
const MANUF_DATA = [1,0];

export const startAdvertising = (uuidString: string, beaconName: string) => {
    BLEAdvertiser.setCompanyId(APPLE_ID);

    const options = {
        advertiseMode: 1, // ADVERTISE_MODE_BALANCED
        txPowerLevel: 1, // ADVERTISE_TX_POWER_LOW
        includeDeviceName: true,
        connectable: false,
        beaconName: beaconName
    }

    BLEAdvertiser.broadcast(uuidString, MANUF_DATA, options)
    .then(success => console.log(uuidString, "Adv Successful", success))
    .catch(error => console.log(uuidString, "Adv Error", error));
}

export const stopAdvertising = () => {
    BLEAdvertiser.stopBroadcast()
    .then(success => console.log("Stop Broadcast Successful", success))
    .catch(error => console.log("Stop Broadcast Error", error));
}

export const startScan = () => {
    
}