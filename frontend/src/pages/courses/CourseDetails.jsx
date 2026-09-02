import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCourseById } from '../../api/courseApi';
import { DetailsSkeleton } from '../../components/common/LoadingSkeleton';

const TECH_IMAGES = [
  { keywords: ['typescript', 'type script', 'ts'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { keywords: ['javascript', 'java script'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { keywords: ['node'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { keywords: ['react'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { keywords: ['python'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { keywords: ['java'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { keywords: ['c++', 'cpp'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { keywords: ['c#', 'csharp'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { keywords: [' c ', 'c programming'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { keywords: ['angular'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
  { keywords: ['vue'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
  { keywords: ['mongodb', 'mongo'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { keywords: ['sql'], img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
];

function getFallbackImage(title, category) {
  const haystack = ` ${(title || '')} ${(category || '')} `.toLowerCase();
  for (const entry of TECH_IMAGES) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return entry.img;
    }
  }
  return null;
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourseById(id);
      setCourse(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course details", { theme: "dark" });
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!course) return;
    navigate('/learner/settings/notifications', { 
      state: { pendingCartCourse: course } 
    });
  };

  const handleBuyNow = () => {
    const courseId = course.id || course._id;
    navigate(`/learner/courses/${courseId}/checkout`);
  };

  const handleViewVideos = () => {
    const courseId = course.id || course._id;
    navigate(`/learner/courses/${courseId}/videos`);
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-purple-500 dark:text-cyan-400 text-xl font-semibold animate-pulse">
          Course not found or failed to load.
        </div>
      </div>
    );
  }

  const imageSrc = course.thumbnail || getFallbackImage(course.title, course.category);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Comprehensive curriculum and program details</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl shadow-xl overflow-hidden relative">
        
        {/* Centered Original Color Watermark Background Graphic */}
        {imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.50] dark:opacity-[0.50] pointer-events-none select-none">
            <img src={imageSrc} alt="" className="w-80 h-80 object-contain" />
          </div>
        )}

        <span className={`absolute top-4 right-4 shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md z-20 ${(!course.status || course.status === "ACTIVE")
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
            : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30"
          }`}>
            {course.status || "ACTIVE"}
          </span>
        <div className="p-8 space-y-6 relative z-10">
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mb-1">{course.category || "General"}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{course.description || "No description provided."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Level & Language</p>
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {course.level || "All Levels"} • {course.language || "English"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {course.duration || "Self-paced"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Instructor</p>
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {course.instructor || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created At</p>
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "Recent"}
              </p>
            </div>
          </div>

          {/* Price Footer Bar */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Price</p>
              <p className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                {typeof course.price === 'number' ? `₹${course.price.toLocaleString('en-IN')}` : (course.price || 'Free')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={handleAddToCart}
              className="flex-1 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-amber-400/10"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-orange-500/10"
            >
              Buy Now
            </button>
            <button
              onClick={handleViewVideos}
              className="flex-1 px-5 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              Course Videos
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}