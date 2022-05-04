import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, Center, FormControl, Heading, HStack, Input, VStack, Text, Button,
        Alert, IconButton, CloseIcon, Collapse, WarningOutlineIcon, Spacer, Select, ScrollView } from "native-base"
import Meteor from '@meteorrn/core'
import { Formik } from 'formik'
import * as yup from "yup"
import { HeaderBar } from "../../components"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `registration: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="registration" component={RegistrationScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
export const RegistrationScreen: FC<StackScreenProps<NavigatorParamList, "registration">> = observer(function RegistrationScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation();

    const [error, setError] = useState('')
    const [showError, setShowError] = useState(false);

    const [success, setSuccess] = useState('')
    const [showSuccess, setShowSuccess] = useState(false);

    const initialValues = {
        firstName: '',
        lastName: '',
        gender: 'male',
        email: '',
        password: ''
    }

    const registrationValidationSchema = yup.object().shape({
        firstName: yup.string().required('First Name is required'),
        lastName: yup.string().required('Last Name is required'),
        gender: yup.string().oneOf(['male', 'female']).required('Gender is required'),
        email: yup.string().email('Must be a valid email address').required('Email is required'),
        password: yup.string().required('Password is required')
    });

    type FormInputs = {
        firstName: string,
        lastName: string,
        gender: string,
        email: string,
        password: string
    }

    const createUser = (values: FormInputs) => {
        Meteor.call('users.registerStudentUser', { 
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
            email: values.email,
            password: values.password
        }, (error: any) => {
            if(error) {
                const err = error.reason || error.message;
                setError(err);
                setShowError(true);
            } else {
                setSuccess('Please check your email inbox or spam for the verification email.');
                setShowSuccess(true);
            }
        });
    }

    return (
        <ScrollView backgroundColor="blueGray.100" flex="1">
            <HeaderBar title="Registration" />

            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800">
                        Welcome
                    </Heading>
                    <Heading mt="1" color="coolGray.600" fontWeight="medium" size="xs">
                        Register to continue!
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
                            validationSchema={registrationValidationSchema}
                            onSubmit={(values, { resetForm }) => {
                                createUser(values);
                                resetForm({ values: initialValues });
                            }}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                                <>
                                    <FormControl mb="2" isInvalid={!!errors.firstName}>
                                        <FormControl.Label>First Name</FormControl.Label>
                                        <Input
                                            onChangeText={handleChange('firstName')}
                                            onBlur={handleBlur('firstName')}
                                            value={values.firstName}
                                        />
                                        { errors.firstName && touched.firstName &&
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                {errors.firstName}
                                            </FormControl.ErrorMessage>
                                        }
                                    </FormControl>

                                    <FormControl mb="2" isInvalid={!!errors.lastName}>
                                        <FormControl.Label>Last Name</FormControl.Label>
                                        <Input
                                            onChangeText={handleChange('lastName')}
                                            onBlur={handleBlur('lastName')}
                                            value={values.lastName}
                                        />
                                        { errors.lastName && touched.lastName &&
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                {errors.lastName}
                                            </FormControl.ErrorMessage>
                                        }
                                    </FormControl>

                                    <FormControl mb="2" isInvalid={!!errors.gender}>
                                        <FormControl.Label>Gender</FormControl.Label>
                                        <Select
                                            accessibilityLabel="Select Gender"
                                            placeholder="Select Gender"
                                            selectedValue={values.gender}
                                            onValueChange={handleChange('gender')}
                                        >
                                            <Select.Item label='Male' value='male' />
                                            <Select.Item label='Female' value='female' />
                                        </Select>
                                        { errors.gender && touched.gender &&
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                {errors.gender}
                                            </FormControl.ErrorMessage>
                                        }
                                    </FormControl>

                                    <FormControl mb="2" isInvalid={!!errors.email}>
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
                                        </HStack>
                                    </FormControl>

                                    <Button mt="2" colorScheme="indigo" onPress={handleSubmit} isDisabled={!isValid}>
                                        Register
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
