import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, View, Text, VStack, FlatList, Pressable, Progress, Spacer } from "native-base"
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Meteor from '@meteorrn/core'
import { CoursesCollection } from '../../utils/collections'
import _ from 'underscore'
import { HeaderBar } from "../../components"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `courses: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="courses" component={CoursesScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const CoursesScreen: FC<StackScreenProps<NavigatorParamList, "courses">> = observer(function CoursesScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation();

    const [isUserStudent, setIsUserStudent] = useState(false);
    const [isUserInstructor, setIsUserInstructor] = useState(false);

    const { userId, userCoursesLessons } = Meteor.useTracker(() => {
        const userId = Meteor.userId();

        Meteor.subscribe('courses.specificUser', userId);
        const userCourses = CoursesCollection.find({}, { sort: { name: 1 }, fields: { name: 1, credits: 1 } }).fetch();

        const userCoursesLessons = _.chain(userCourses).pluck('_id')
                                    .map((courseId) => {
                                        Meteor.subscribe('courses.specific.withLessons', courseId);
                                        return CoursesCollection.find({ _id: courseId }, {
                                            fields: { name: 1, credits: 1, lessons: 1 }
                                        }).fetch();
                                    }).value();

        return { userId, userCoursesLessons };
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

    const calculateProgress = (all: string[], attended: string[]) => {
        const overall = all ? all.length : 0;
        const present = attended ? attended.length: 0;

        return present / overall * 100;
    }

    const renderItem = (item: any) => {
        const lessonIds = _.chain(item).pluck('lessons').flatten(true).pluck('_id').value();
        const lessonAttendedIds = _.chain(item).pluck('lessons').flatten(true)
                                    .filter((lesson) => {
                                        return _.chain(lesson).get('studentAttendance').findWhere({ _id: userId }).value();
                                    })
                                    .pluck('_id').value();
        return (
            <Pressable onPress={() => navigation.navigate('lessons', { courseId: item[0]._id })}>
                <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="flex-start" alignItems="center">
                        <MaterialCommunityIcons name="teach" size={32} color="black" />
                        <VStack>
                            <Text fontSize="lg" color="coolGray.800" bold>
                                {item[0].name}
                            </Text>
                            { isUserStudent && 
                                <Box minW="75">
                                    <Progress size="sm" _filledTrack={{ bg: "#006400" }} bg="#FF0000" mt={1}
                                        value={calculateProgress(lessonIds, lessonAttendedIds)} />
                                </Box>
                            }
                            { isUserStudent && 
                                <Text fontSize="md" color="coolGray.600">
                                    {lessonAttendedIds.length} out of {lessonIds.length}
                                </Text>
                            }
                            { isUserInstructor && 
                                <Text fontSize="md" color="coolGray.600">
                                    {lessonIds.length} {lessonIds.length === 1 ? 'lesson' : 'lessons'}
                                </Text>
                            }
                        </VStack>
                        { isUserStudent && <Spacer /> }
                        { isUserStudent && 
                            <VStack>
                                <Text fontSize="md" color="coolGray.800" alignSelf="center">
                                    Attendance
                                </Text>
                                <Text fontSize="md" color="coolGray.800" bold alignSelf="center">
                                    {calculateProgress(lessonIds, lessonAttendedIds)}%
                                </Text>
                            </VStack>
                        }
                        <Spacer />
                        <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
                    </HStack>
                </Box>
            </Pressable>
        )
    }

    return (
        <View backgroundColor="blueGray.100" flex="1">
            <HeaderBar title="Courses" />

            <FlatList data={userCoursesLessons} keyExtractor={(item: any) => item[0]._id} renderItem={({ item }) => renderItem(item)} />
        </View>
    )
})
