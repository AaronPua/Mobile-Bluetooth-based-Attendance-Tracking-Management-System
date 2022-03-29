import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, Center, FormControl, Heading, HStack, Input, Link, VStack, Text, Button, StatusBar, View, Alert, IconButton, CloseIcon, Collapse } from "native-base"
import Meteor, { useTracker } from '@meteorrn/core'
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup";

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
    const navigation = useNavigation()

    const [error, setError] = useState('')
    const [showError, setShowError] = React.useState(true)

    interface IFormInputs {
        email: string
        password: string
    }

    const schema = yup.object({
        email: yup.string().email().required(),
        password: yup.string().min(4).required(),
    }).required();

    const { control, register, handleSubmit, formState: { errors } } = useForm<IFormInputs>({
        resolver: yupResolver(schema)
    });

    const loginWithPassword = (data: { email: string; password: string }) => {
        Meteor.loginWithPassword(data.email, data.password, (error: any) => {
            if(error) {
                const err = error.reason || error.message;
                setError(err);
                setShowError(true);
            }
            else {
                navigation.navigate({ name: 'scan' });
            }
        });
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
            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800" _dark={{ color: "warmGray.50"}}>
                        Welcome
                    </Heading>
                    <Heading mt="1" _dark={{ color: "warmGray.200"}} color="coolGray.600" fontWeight="medium" size="xs">
                        Sign in to continue!
                    </Heading>

                    <VStack space={3} mt="5">
                        {showError && 
                            <Collapse isOpen={showError}>
                                <Alert status="error">
                                    <VStack space={1} flexShrink={1} w="100%">
                                        <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                                        <HStack flexShrink={1} space={2} alignItems="center">
                                            <Alert.Icon />
                                            <Text fontSize="md" fontWeight="medium" _dark={{
                                            color: "coolGray.800"
                                        }}>
                                            Please try again!
                                            </Text>
                                        </HStack>
                                        <IconButton variant="unstyled" icon={<CloseIcon size="3" color="coolGray.600" />} onPress={() => setShowError(false)} />
                                        </HStack>
                                        <Box pl="6" _dark={{
                                            _text: {
                                            color: "coolGray.600"
                                            }
                                         }}>
                                        No account is found with the current email and password.
                                        </Box>
                                    </VStack>
                                </Alert>
                            </Collapse>
                        }
                        
                        
                        <FormControl>
                            <FormControl.Label>Email</FormControl.Label>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    {...register("email")}
                                />
                                )}
                                name="email"
                            />
                            {errors.email?.message}
                        </FormControl>
                        <FormControl>
                            <FormControl.Label>Password</FormControl.Label>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    type="password"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    {...register("password")}
                                />
                                )}
                                name="password"
                            />
                            {errors.password?.message}
                            <Link _text={{ fontSize: "xs", fontWeight: "500", color: "indigo.500"}} alignSelf="flex-end" mt="1">
                                Forget Password?
                            </Link>
                        </FormControl>
                        <Button mt="2" colorScheme="indigo" onPress={handleSubmit(loginWithPassword)}>
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
