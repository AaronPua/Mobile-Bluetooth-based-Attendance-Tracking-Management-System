import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { Box, HStack, StatusBar, View, Text, VStack, FlatList, Pressable } from "native-base"
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Meteor from '@meteorrn/core'
import { CoursesCollection } from '../../utils/collections'

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

    const { userId, userCourses } = Meteor.useTracker(() => {
        const userId = Meteor.userId();

        Meteor.subscribe('courses.specificUser', userId);
        const userCourses = CoursesCollection.find({}, { sort: { name: 1 } }).fetch();

        return { userId, userCourses };
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
    });

    const navigateRoute = (item: any) => {
        if(isUserStudent) {
            navigation.navigate('courseStudent', { courseId: item._id });
        }
        if(isUserInstructor) {
            navigation.navigate('courseInstructor', { courseId: item._id });
        }
    }

    const renderItem = (item: any) => {
        return (
            <Pressable onPress={() => navigateRoute(item)}>
                <Box bg="#C1DBB3" pl="3" pr="4" py="2" mx="4" my="2" borderRadius="20" shadow="3">
                    <HStack space={3} justifyContent="flex-start" alignItems="center">
                        <MaterialCommunityIcons name="teach" size={32} color="black" />
                        <VStack>
                            <Text fontSize="lg" _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                                {item.name}
                            </Text>
                        </VStack>
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
                        COMP8047
                    </Text>
                </HStack>
            </HStack>

            <FlatList data={userCourses} keyExtractor={(item: any) => item._id} renderItem={({ item }) => renderItem(item)} />
        </View>
    )
})
