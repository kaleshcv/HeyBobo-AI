import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { LearnStackParamList } from './types'
import { CoursesListScreen }   from '@/screens/student/CoursesListScreen'
import { CoursePlayerScreen }  from '@/screens/student/CoursePlayerScreen'
import { LessonPlayerScreen }  from '@/screens/student/LessonPlayerScreen'
import { QuizScreen }          from '@/screens/student/QuizScreen'
import { AssignmentScreen }    from '@/screens/student/AssignmentScreen'
import { CertificatesScreen }  from '@/screens/student/CertificatesScreen'
import { SearchScreen }        from '@/screens/student/SearchScreen'
import { GroupsScreen }        from '@/screens/app/GroupsScreen'
import { GroupDetailScreen }   from '@/screens/app/GroupDetailScreen'
import { MeetingsScreen }      from '@/screens/app/MeetingsScreen'

const Stack = createNativeStackNavigator<LearnStackParamList>()

export function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoursesList"  component={CoursesListScreen} />
      <Stack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
      <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen}
        options={{ orientation: 'all' }}
      />
      <Stack.Screen name="Quiz"         component={QuizScreen} />
      <Stack.Screen name="Assignment"   component={AssignmentScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="Search"       component={SearchScreen} />
      <Stack.Screen name="Groups"       component={GroupsScreen} />
      <Stack.Screen name="GroupDetail"  component={GroupDetailScreen} />
      <Stack.Screen name="Meetings"     component={MeetingsScreen} />
    </Stack.Navigator>
  )
}
