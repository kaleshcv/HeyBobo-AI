import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { TeacherStackParamList } from './types'
import { TeacherDashboardScreen }    from '@/screens/teacher/TeacherDashboardScreen'
import { TeacherCoursesScreen }      from '@/screens/teacher/TeacherCoursesScreen'
import { CourseBuilderScreen }       from '@/screens/teacher/CourseBuilderScreen'
import { SectionManagerScreen }      from '@/screens/teacher/SectionManagerScreen'
import { LessonEditorScreen }        from '@/screens/teacher/LessonEditorScreen'
import { QuizBuilderScreen }         from '@/screens/teacher/QuizBuilderScreen'
import { AssignmentManagerScreen }   from '@/screens/teacher/AssignmentManagerScreen'
import { TeacherStudentsScreen }     from '@/screens/teacher/TeacherStudentsScreen'
import { TeacherAnalyticsScreen }    from '@/screens/teacher/TeacherAnalyticsScreen'

const Stack = createNativeStackNavigator<TeacherStackParamList>()

export function TeacherStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherDashboard"  component={TeacherDashboardScreen} />
      <Stack.Screen name="TeacherCourses"    component={TeacherCoursesScreen} />
      <Stack.Screen name="CourseBuilder"     component={CourseBuilderScreen} />
      <Stack.Screen name="SectionManager"    component={SectionManagerScreen} />
      <Stack.Screen name="LessonEditor"      component={LessonEditorScreen} />
      <Stack.Screen name="QuizBuilder"       component={QuizBuilderScreen} />
      <Stack.Screen name="AssignmentManager" component={AssignmentManagerScreen} />
      <Stack.Screen name="TeacherStudents"   component={TeacherStudentsScreen} />
      <Stack.Screen name="TeacherAnalytics"  component={TeacherAnalyticsScreen} />
    </Stack.Navigator>
  )
}
