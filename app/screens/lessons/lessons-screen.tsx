import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, View, Text, VStack, FlatList, Pressable, Spacer } from "native-base"
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Meteor from '@meteorrn/core'
import { LessonsCollection } from '../../utils/collections'
import moment from 'moment'
import _ from 'underscore'
import { HeaderBar } from "../../components"

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

    const calculateLessonTime = (lesson: any) => {
        if(moment().isAfter(lesson.endTime)) {
            return (
                <Text fontSize="sm" color="coolGray.500" alignSelf="center" minW={10}>
                    Done
                </Text>
            )
        }
        else if(moment().isBefore(lesson.startTime)) {
            return (
                <Text fontSize="sm" color="coolGray.800" alignSelf="center" minW={10}>
                    Future
                </Text>
            )
        }
        else {
            return (
                <Text fontSize="lg" color="darkgreen" alignSelf="center" minW={10} bold>
                    Now
                </Text>
            )
        }
    }

    const isLessonNow = (lesson: any) => {
        return moment().isBetween(lesson.startTime, lesson.endTime);
    }

    const renderItem = (item: any) => {
        return (
            <Pressable onPress={() => navigateRoute(item)} disabled={!isLessonNow(item)}>
                <Box bg={isLessonNow(item) ? "#C1DBB3" : "coolGray.300"} pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="flex-start" alignItems="center">
                        {/* <Ionicons name="school-outline" size={24} color="black" /> */}
                        { calculateLessonTime(item) }
                        <VStack>
                            <Text fontSize="lg" color="coolGray.800" bold>
                                {item.name}
                            </Text>
                            <Text color="coolGray.600">
                                {moment.utc(item.startTime).format('HH:mm')} to {moment.utc(item.endTime).format('HH:mm')}
                            </Text>
                            <Text color="coolGray.600">
                                {moment.utc(item.date).format('ddd, DD/MM/YYYY')}
                            </Text>
                        </VStack>
                        { isUserStudent && <Spacer /> }
                        { isUserStudent && 
                            <VStack>
                                <Text color="coolGray.800" alignSelf="center">
                                    Attended
                                </Text>
                                <Text color="coolGray.800" alignSelf="center" pt={2}>
                                    { didStudentAttend(item.studentAttendance) ? 
                                        <MaterialCommunityIcons name="check-circle" size={24} color="darkgreen" /> 
                                        : 
                                        <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                                    }
                                </Text>
                            </VStack>
                        }
                        { isLessonNow(item) && <Spacer /> }
                        { isLessonNow(item) && 
                            <MaterialCommunityIcons name="arrow-right" size={24} color="black" /> 
                        }
                    </HStack>
                </Box>
            </Pressable>
        )
    }

    return (
        <View backgroundColor="blueGray.100" flex="1">
            <HeaderBar title="Lessons" />

            <FlatList data={lessons} keyExtractor={(item: any) => item._id} renderItem={({ item }) => renderItem(item)} />
        </View>
    )
})
