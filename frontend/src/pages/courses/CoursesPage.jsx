import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CourseList from './CourseList';
import AddModal from './AddCourse';
import { useNavigate } from 'react-router-dom';
import { notificationReceived, showToast } from '../../features/preferenceNotification/preferenceNotificationSlice';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  selectCourses,
  selectCoursesLoading,
  selectCoursesError,
} from '../../features/courses/courseSlice';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const handleViewCourse = (course) => {
    navigate(`/admin/courses/${course.id || course._id}`);
  };

  const dispatch = useDispatch();
  const rawCourses = useSelector(selectCourses);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  const currentCourses = useMemo(() => {
    if (Array.isArray(rawCourses)) return rawCourses;
    if (rawCourses && Array.isArray(rawCourses.courses)) return rawCourses.courses;
    return [];
  }, [rawCourses]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }));
  }, [dispatch, currentPage, debouncedSearch]);

  const handleOpenModal = (course = null) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (courseData) => {
    const isEdit = Boolean(courseData.id);
    const {
      level,
      language,
      createdAt,
      updatedAt,
      id,
      thumbnailFile,
      videoFile,
      videoUrl,
      ...cleanData
    } = courseData;

    if (cleanData.price !== undefined && cleanData.price !== null) {
      cleanData.price = parseFloat(cleanData.price);
    }

    const thunk = isEdit
      ? updateCourse({ id: courseData.id, updates: cleanData })
      : createCourse(cleanData);

    const result = await dispatch(thunk);

    if (result.meta.requestStatus === 'fulfilled') {
      const actionTitle = isEdit ? 'Course Updated' : 'New Course Created';
      const actionMsg = isEdit 
        ? `"${cleanData.title}" was successfully updated.` 
        : `"${cleanData.title}" was successfully added to the platform.`;

      toast.success(isEdit ? 'Course updated successfully' : 'Course created successfully', { theme: "dark" });
      
      // Dispatch notification to Redux state so the notification bell lights up instantly
      dispatch(notificationReceived({
        id: `course_${Date.now()}`,
        title: actionTitle,
        message: actionMsg,
        type: 'course',
        read: false,
        createdAt: new Date().toISOString(),
      }));

      // Trigger a popup toast banner as well
      dispatch(showToast({
        title: actionTitle,
        message: actionMsg,
        type: 'success'
      }));

      setIsModalOpen(false);
      dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }));
    } else {
      toast.error(result.payload || (isEdit ? 'Failed to update course' : 'Failed to create course'), { theme: "dark" });
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    const result = await dispatch(deleteCourse(id));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Course deleted', { theme: "dark" });
      
      // Optional deletion notification
      dispatch(notificationReceived({
        id: `course_del_${Date.now()}`,
        title: 'Course Deleted',
        message: `A course was removed from the system.`,
        type: 'course',
        read: false,
        createdAt: new Date().toISOString(),
      }));

      dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }));

      if (currentCourses.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } else {
      toast.error(result.payload || 'Failed to delete course', { theme: "dark" });
    }
  };

  const hasNextPage = currentCourses.length === ITEMS_PER_PAGE;

  return (
    <div className="relative flex flex-col space-y-6 bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-[#3f3f3f] shadow-lg transition-colors duration-200">
      
      {/* Header */}
      <div className="relative z-10 flex flex-row items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
          Courses
        </h1>
        <div className="rounded-xl">
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl transition-all shadow-md cursor-pointer"
          >
            + New Course
          </button>
        </div>
      </div>

      <CourseList
        courses={currentCourses}
        loading={loading}
        error={error}
        search={search}
        setSearch={setSearch}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasNextPage={hasNextPage}
        onEdit={handleOpenModal}
        onDelete={handleDeleteCourse}
        onView={handleViewCourse}
        onRetry={() => dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }))}
      />

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        onSave={handleSaveCourse}
      />
    </div>
  );
}