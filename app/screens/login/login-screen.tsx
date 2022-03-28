import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, Center, FormControl, Heading, HStack, Input, Link, VStack, Text, Button, StatusBar, View } from "native-base"
import Meteor from '@meteorrn/core'
import { useNavigation } from "@react-navigation/native"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `login: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="login" component={LoginScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const LoginScreen: FC<StackScreenProps<NavigatorParamList, "login">> = observer(function LoginScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
//   const navigation = useNavigation()

    const loginWithPassword = () => {
        return new Promise((resolve, reject) => {
            // Meteor.loginWithPassword(model.email, model.password, error => {
            //     error ? reject(error) : resolve(navigation('/'));
            // });
        });
    }

    return (
        <View>
            <StatusBar bg="#3700B3" barStyle="light-content" />
            <Box safeAreaTop bg="#6200ee" />
            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800" _dark={{ color: "warmGray.50"}}>
                        Welcome
                    </Heading>
                    <Heading mt="1" _dark={{ color: "warmGray.200"}} color="coolGray.600" fontWeight="medium" size="xs">
                        Sign in to continue!
                    </Heading>

                    <VStack space={3} mt="5">
                        <FormControl>
                            <FormControl.Label>Email ID</FormControl.Label>
                            <Input />
                        </FormControl>
                        <FormControl>
                            <FormControl.Label>Password</FormControl.Label>
                            <Input type="password" />
                            <Link _text={{ fontSize: "xs", fontWeight: "500", color: "indigo.500"}} alignSelf="flex-end" mt="1">
                                Forget Password?
                            </Link>
                        </FormControl>
                        <Button mt="2" colorScheme="indigo">
                            Sign in
                        </Button>
                        <HStack mt="6" justifyContent="center">
                            <Text fontSize="sm" color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                                I'm a new user.{" "}
                            </Text>
                            <Link _text={{ color: "indigo.500", fontWeight: "medium", fontSize: "sm" }} href="#">
                                Sign Up
                            </Link>
                        </HStack>
                    </VStack>
                </Box>
            </Center>
        </View>
    )
})
