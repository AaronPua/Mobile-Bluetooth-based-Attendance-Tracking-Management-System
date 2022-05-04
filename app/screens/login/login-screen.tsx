import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, Center, FormControl, Heading, HStack, Input, Link, VStack, Text, Button,
            View, Alert, IconButton, CloseIcon, Collapse, WarningOutlineIcon, Spacer} from "native-base"
import Meteor from '@meteorrn/core'
import { Formik } from 'formik'
import * as yup from "yup"
import { HeaderBar } from "../../components"

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
    const [showError, setShowError] = useState(false);

    const initialValues = { 
        email: '', 
        password: '' 
    };

    const loginValidationSchema = yup.object().shape({
        email: yup.string().email('Must be a valid email address').required('Email is required'),
        password: yup.string().required('Password is required')
    });

    const loginWithPassword = (data: { email: string; password: string }) => {
        Meteor.loginWithPassword(data.email, data.password, (error: any) => {
            if(error) {
                const err = error.reason || error.message;
                setError(err);
                setShowError(true);
            }
            else {
                navigation.navigate({ name: 'courses' });
            }
        });
    }

    return (
        <View backgroundColor="blueGray.100" flex="1">
            <HeaderBar title="COMP8047" />
            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800">
                        Welcome
                    </Heading>
                    <Heading mt="1" color="coolGray.600" fontWeight="medium" size="xs">
                        Sign in to continue!
                    </Heading>

                    <VStack space={3} mt="5">
                        { showError && 
                            <Collapse isOpen={showError}>
                                <Alert status="error">
                                    <VStack space={1} flexShrink={1} w="100%">
                                        <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                                        <HStack flexShrink={1} space={2} alignItems="center">
                                            <Alert.Icon />
                                            <Text fontSize="md" fontWeight="medium">
                                                Error
                                            </Text>
                                        </HStack>
                                        <IconButton variant="unstyled" icon={<CloseIcon size="3" color="coolGray.600" />} onPress={() => setShowError(false)} />
                                        </HStack>
                                        <Box pl="6">{error}</Box>
                                    </VStack>
                                </Alert>
                            </Collapse>
                        }

                        <Formik 
                            initialValues={initialValues}
                            validationSchema={loginValidationSchema}
                            onSubmit={(values, { resetForm }) => {
                                loginWithPassword(values);
                                resetForm({ values: initialValues });
                            }}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                                <>
                                    <FormControl mb="4" isInvalid={!!errors.email}>
                                        <FormControl.Label>Email</FormControl.Label>
                                        <Input
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            value={values.email}
                                        />
                                        { errors.email && touched.email &&
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                {errors.email}
                                            </FormControl.ErrorMessage>
                                        }
                                    </FormControl>

                                    <FormControl mb="2" isInvalid={!!errors.password}>
                                        <FormControl.Label>Password</FormControl.Label>
                                        <Input
                                            type="password"
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
                                        />
                                        <HStack justifyContent="space-between">
                                            { errors.password && touched.password &&
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    {errors.password}
                                                </FormControl.ErrorMessage>
                                            }
                                            <Spacer />
                                            <Link mt="2" mb="2" _text={{ fontSize: "xs", fontWeight: "500", color: "indigo.500"}} alignSelf="flex-end">
                                                Forget Password?
                                            </Link>
                                        </HStack>
                                    </FormControl>

                                    <Button mt="2" colorScheme="indigo" onPress={handleSubmit} isDisabled={!isValid}>
                                        Sign in
                                    </Button>
                                </>
                            )}
                        </Formik>
                        
                        <HStack mt="6" justifyContent="center">
                            <Text fontSize="sm" color="coolGray.600">
                                I'm a new user.{" "}
                            </Text>
                            <Link _text={{ color: "indigo.500", fontWeight: "medium", fontSize: "sm" }} 
                                onPress={() => navigation.navigate({ name: 'registration' })}>
                                Sign Up
                            </Link>
                        </HStack>
                    </VStack>
                </Box>
            </Center>
        </View>
    )
})
