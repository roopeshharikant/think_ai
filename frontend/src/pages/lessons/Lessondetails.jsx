import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getLessonById } from "../../api/lessonApi";
import { DetailsSkeleton } from "../../components/common/LoadingSkeleton";

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

export default function LessonDetails() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await getLessonById(id);
      setLesson(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load lesson", { theme: "dark" });
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-rose-500 dark:text-rose-400 text-xl font-semibold">Lesson not found.</div>
      </div>
    );
  }

  // Prioritize course thumbnail first, then module thumbnail, lesson thumbnail, or technology fallback
  const courseTitle = lesson.module?.course?.title || lesson.module?.title || "";
  const courseCategory = lesson.module?.course?.category || "";
  const watermarkImg = 
    lesson.module?.course?.thumbnail || 
    lesson.course?.thumbnail || 
    lesson.module?.thumbnail || 
    lesson.thumbnail || 
    getFallbackImage(lesson.title, courseTitle + " " + courseCategory);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson - {lesson.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lesson information</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/lessons/edit/${lesson.id}`}
            className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            Edit Lesson
          </Link>
        </div>
      </div>

      {/* Square shaped container layout with fitted watermark */}
      <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Centered Original Color Watermark Background Graphic */}
        {watermarkImg && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.50] dark:opacity-[0.50] pointer-events-none select-none">
            <img src={watermarkImg} alt="" className="w-64 h-64 object-contain" />
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Lesson Title</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{lesson.title}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Module</p>
            <p className="text-lg text-purple-600 dark:text-purple-400 font-medium">{lesson.module?.title || "N/A"}</p>
          </div>

          {lesson.videoUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Video</p>
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 text-sm break-all hover:underline"
              >
                {lesson.videoUrl}
              </a>
            </div>
          )}

          {lesson.content && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Content</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-gray-900 dark:text-white font-semibold text-sm">
                {lesson.duration ? `${lesson.duration} min` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Order</p>
              <p className="text-gray-900 dark:text-white text-sm">{lesson.order ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}