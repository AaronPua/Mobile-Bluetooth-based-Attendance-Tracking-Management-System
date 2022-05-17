import { Mongo } from '@meteorrn/core';

export const CoursesCollection = new Mongo.Collection("courses");
export const UsersCollection = new Mongo.Collection("users");
export const BeaconsCollection = new Mongo.Collection("beacons");
export const LessonsCollection = new Mongo.Collection("lessons");