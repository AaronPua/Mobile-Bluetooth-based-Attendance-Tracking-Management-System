import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, StatusBar, View, Text, VStack, FlatList, Pressable, Spacer } from "native-base"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import Meteor from '@meteorrn/core'
import { LessonsCollection } from '../../utils/collections'
import moment from 'moment';
import _ from 'underscore';

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `lessons: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="lessons" component={LessonsScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const LessonsScreen: FC<StackScreenProps<NavigatorParamList, "lessons">> = observer(function LessonsScreen({ route }) {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation();

    const { courseId } = route.params;

    const [isUserStudent, setIsUserStudent] = useState(false);
    const [isUserInstructor, setIsUserInstructor] = useState(false);

    const { userId, lessons } = Meteor.useTracker(() => {
        const userId = Meteor.userId();

        Meteor.subscribe('lessons.forOneCourse', courseId);
        const lessons = LessonsCollection.find({ courseId: courseId }, { sort: { name: 1 } }).fetch();

        return { userId, lessons };
    });

    const isStudent = () => {
        Meteor.call('users.isUserInRole', { 
            userId: userId, 
            roleName: 'student'
        }, (error: any, response: any) => {
            if(error) {
                console.log(error);
            } else {
                setIsUserStudent(response);
            }
        });
    }

    const isInstructor = () => {
        Meteor.call('users.isUserInRole', { 
            userId: userId, 
            roleName: 'instructor'
        }, (error: any, response: any) => {
            if(error) {
                console.log(error);
            } else {
                setIsUserInstructor(response);
            }
        });
    }

    useEffect(() => {
        isStudent();
        isInstructor();
    }, [userId]);

     const navigateRoute = (item: any) => {
        if(isUserStudent) {
            navigation.navigate('scan', { lessonId: item._id, courseId: courseId });
        }
        if(isUserInstructor) {
            navigation.navigate('broadcast', { lessonId: item._id, courseId: courseId });
        }
    }

    const didStudentAttend = (studentAttendance: string[]) => {
        return _.chain(studentAttendance).flatten(true).pluck('_id').contains(userId).value();
    }

    const renderItem = (item: any) => {
        return (
            <Pressable onPress={() => navigateRoute(item)}>
                <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="flex-start" alignItems="center">
                        <Ionicons name="school-outline" size={24} color="black" />
                        <VStack>
                            <Text fontSize="lg" _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                                {item.name}
                            </Text>
                            <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                                from {moment(item.startTime).format('HH:mm')} to {moment(item.endTime).format('HH:mm')}
                            </Text>
                            <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                                on {moment(item.createdAt).format('dddd, DD/MM/YYYY')}
                            </Text>
                        </VStack>
                        { isUserStudent && <Spacer /> }
                        { isUserStudent && 
                            <VStack>
                                <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" alignSelf="center">
                                    Attendance
                                </Text>
                                <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" alignSelf="center" pt={2}>
                                    { didStudentAttend(item.studentAttendance) ? 
                                        <MaterialCommunityIcons name="check-circle" size={24} color="darkgreen" /> 
                                        : 
                                        <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                                    }
                                </Text>
                            </VStack>
                        }
                    </HStack>
                </Box>
            </Pressable>
        )
    }

    return (
        <View backgroundColor="white" flex="1">
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Box safeAreaTop bg="#6200ee" />
                <HStack bg="#6200ee" px="3" py="3" justifyContent="space-between" alignItems="center" w="100%">
                    <HStack alignItems="center">
                        <Text color="white" fontSize="20" fontWeight="bold">
                            Lessons
                        </Text>
                    </HStack>
                </HStack>

                <FlatList data={lessons} keyExtractor={(item: any) => item._id} renderItem={({ item }) => renderItem(item)} />
            </View>
    )
})
