import * as React from "react"
// import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Box, HStack, StatusBar, Text } from "native-base"

export interface HeaderBarProps {
    title?: string
}

/**
 * Describe your component here
 */
export const HeaderBar = observer(function HeaderBar(props: HeaderBarProps) {
    const { title } = props;

    return (
        <>
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Box safeAreaTop bg="#6200ee" />
            <HStack bg="#6200ee" px="3" py="3" justifyContent="space-between" alignItems="center" w="100%">
                <HStack alignItems="center">
                    <Text color="white" fontSize="20" fontWeight="bold">
                        { title }
                    </Text>
                </HStack>
            </HStack>
        </>
    );
})
