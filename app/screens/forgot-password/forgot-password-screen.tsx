import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, Center, FormControl, Heading, HStack, Input, VStack, Text, Button,
        Alert, IconButton, CloseIcon, Collapse, WarningOutlineIcon, ScrollView } from "native-base"
import { Accounts } from '@meteorrn/core'
import { Formik } from 'formik'
import * as yup from "yup"
import { HeaderBar } from "../../components"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `forgotPassword: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
export const ForgotPasswordScreen: FC<StackScreenProps<NavigatorParamList, "forgotPassword">> = observer(function ForgotPasswordScreen() {
  // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation();

    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    const [success, setSuccess] = useState('')
    const [showSuccess, setShowSuccess] = useState(false);

    const initialValues = {
        email: ''
    }

    const forgotPasswordValidationSchema = yup.object().shape({
        email: yup.string().email('Must be a valid email address').required('Email is required'),
    });

    const sendPasswordResetEmail = (values: { email: string }) => {
        Accounts.forgotPassword({ 
            email: values.email
        }, (error: any) => {
            if(error) {
                const err = error.reason || error.message;
                setError(err);
                setShowError(true);
            } else {
                setSuccess('Please check your email inbox or spam for the pasword reset email');
                setShowSuccess(true);
            }
        });
    }

    return (
        <ScrollView backgroundColor="blueGray.100" flex="1">
            <HeaderBar title="Password Reset" />

            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800">
                        Forgot Password?
                    </Heading>
                    <Heading mt="1" color="coolGray.600" fontWeight="medium" size="xs">
                        A password reset email will be sent
                    </Heading>

                    <VStack space={3} mt="5">
                        { showError && 
                            <Collapse isOpen={showError}>
                                <Alert status="success">
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

                        { showSuccess && 
                            <Collapse isOpen={showSuccess}>
                                <Alert status="success">
                                    <VStack space={1} flexShrink={1} w="100%">
                                        <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                                        <HStack flexShrink={1} space={2} alignItems="center">
                                            <Alert.Icon />
                                            <Text fontSize="md" fontWeight="medium">
                                                Success!
                                            </Text>
                                        </HStack>
                                        <IconButton variant="unstyled" icon={<CloseIcon size="3" color="coolGray.600" />} 
                                            onPress={() => setShowSuccess(false)} />
                                        </HStack>
                                        <Box pl="6">{success}</Box>
                                    </VStack>
                                </Alert>
                            </Collapse>
                        }

                        <Formik 
                            initialValues={initialValues}
                            validationSchema={forgotPasswordValidationSchema}
                            onSubmit={(values, { resetForm }) => {
                                sendPasswordResetEmail(values);
                                resetForm({ values: initialValues });
                            }}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                                <>
                                    <FormControl mb="2" isInvalid={!!errors.email}>
                                        <FormControl.Label>Email</FormControl.Label>
                                        <Input
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            value={values.email}
                                            accessibilityLabel="Email Input"
                                        />
                                        { errors.email && touched.email &&
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                {errors.email}
                                            </FormControl.ErrorMessage>
                                        }
                                    </FormControl>

                                    <Button mt="2" colorScheme="indigo" onPress={handleSubmit as any} isDisabled={!isValid}
                                        accessibilityLabel="Send Button">
                                        Send
                                    </Button>
                                </>
                            )}
                        </Formik>
                    </VStack>
                </Box>
            </Center>
        </ScrollView>
    )
})
