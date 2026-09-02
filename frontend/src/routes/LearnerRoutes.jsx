import React from "react";
import { Routes, Route } from "react-router-dom";

import LearnerLayout from "../layouts/LearnerLayout";
import LearnerDashboard from "../pages/learner/LearnerDashboard";
import CoursePlayer from "../pages/learner/CoursePlayer";
import LearnerCoursesPage from "../pages/learner/LearnerCoursesPage";
import CourseDetails from '../pages/courses/CourseDetails';
import CodePlayground from "../pages/learner/CodePlayground/Codeplayground";
import LiveClassJoinPage from "../pages/learner/live-class/LiveClassJoinPage";
import LiveClassesListPage from "../pages/learner/live-class/LiveClassesListPage";
import CertificatesPage from "../pages/learner/CertificatesPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import NotificationPreferencesPage from "../pages/settings/NotificationsPreferencesPage";

import AssignmentsPage from "../pages/learner/assessment/AssignmentsPage";
import StudentAssessmentTaker from "../pages/learner/StudentAssessmentTaker";
import StudentGradesView from "../pages/learner/StudentGradesView";

// Import your newly created Code Execution Workspace page
import CodeExecutionPage from "../pages/learner/CodePlayground/CodeExecutionPage";
import LiveClassStudio from "../pages/liveStudio/LiveClassStudio";

function LearnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LearnerLayout />}>
        <Route index element={<LearnerDashboard />} />
        <Route path="courses" element={<LearnerCoursesPage />} />
        <Route path="courses/:id/videos" element={<CoursePlayer />} />

        <Route path="courses/:courseId/grades" element={<StudentGradesView />} />

        <Route path="courses/:id/courseDetails" element={<CourseDetails />} />
        <Route path="courses/:courseId/checkout" element={<CheckoutPage />} />
        <Route path="playground" element={<CodePlayground mode="practice" />} />

        <Route path="live" element={<LiveClassesListPage />} />
        <Route path="live/:classId" element={<LiveClassJoinPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="settings/notifications" element={<NotificationPreferencesPage />} />

        <Route path="assessments" element={<AssignmentsPage />} />
        <Route path="assessments/:assessmentId/take" element={<StudentAssessmentTaker />} />

        {/* NEW: Code Execution / IDE workspace for coding assignments */}
        <Route path="code-execution/:assessmentId" element={<CodeExecutionPage />} />
        <Route path="/live-studio/:sessionId" element={<LiveClassStudio />} />
        <Route path="/live-studio" element={<LiveClassStudio />} />
      </Route>

      <Route path="*" element={<div className="p-6 text-sm text-neutral-400">Page not found.</div>} />
    </Routes>
  );
}

export default LearnerRoutes;