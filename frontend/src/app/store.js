import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice';
import batchReducer from '../features/batches/batchSlice';
import adminUserReducer from '../features/adminUsers/adminUserSlice';
import moduleReducer from '../features/modules/moduleSlice';
import lessonReducer from '../features/lessons/lessonSlice';
import lessonProgressReducer from '../features/lessonProgress/lessonProgressSlice';
import certificateReducer from '../features/certificates/certificateSlice';
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import rbacReducer from '../features/rbac/rbacSlice';
import assessmentReducer from '../features/assessments/assessmentSlice';
import searchReducer from '../features/search/searchSlice';
import notificationReducer from '../features/preferenceNotification/preferenceNotificationSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    enrollments: enrollmentReducer,
    batches: batchReducer,
    adminUsers: adminUserReducer,
    modules: moduleReducer,
    lessons: lessonReducer,
    lessonProgress: lessonProgressReducer,
    certificates: certificateReducer,
    rbac: rbacReducer,
    assessments: assessmentReducer,
    search: searchReducer,
    notifications: notificationReducer, 
  },
});