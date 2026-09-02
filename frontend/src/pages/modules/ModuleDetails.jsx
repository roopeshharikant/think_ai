import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getModuleById } from "../../api/moduleApi";
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

export default function ModuleDetails() {
  const { id } = useParams();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModule();
  }, [id]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await getModuleById(id);
      setModule(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load module", { theme: "dark" });
      setModule(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!module) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-purple-500 dark:text-cyan-400 text-xl font-semibold animate-pulse">
          Loading Module...
        </div>
      </div>
    );
  }

  const courseTitle = module.course?.title || "";
  const courseCategory = module.course?.category || "";
  const watermarkImg = module.course?.thumbnail || getFallbackImage(courseTitle, courseCategory);

  return (
    <div className="h-full overflow-y-auto px-2 sm:px-4 py-4 custom-scrollbar text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module - {module.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Module information</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/modules/edit/${module.id}`}
              className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors"
            >
              Edit Module
            </Link>
          </div>
        </div>

        {/* Square shaped container layout with fitted watermark */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          
          {/* Centered Original Color Course Watermark Background Graphic (Subtle & Fitted) */}
          {watermarkImg && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.50] dark:opacity-[0.50] pointer-events-none select-none">
              <img src={watermarkImg} alt="" className="w-56 h-56 object-contain" />
            </div>
          )}

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Module Title</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{module.title}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Associated Course</p>
              <p className="text-lg text-purple-600 dark:text-purple-400 font-medium">{module.course?.title || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{module.description || "No description provided."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}