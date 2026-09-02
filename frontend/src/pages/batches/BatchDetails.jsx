import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getBatchById } from "../../api/batchApi";
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

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatch();
  }, [id]);

  const loadBatch = async () => {
    try {
      setLoading(true);
      const response = await getBatchById(id);
      setBatch(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batch", { theme: "dark" });
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!batch) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-purple-500 dark:text-cyan-400 text-xl font-semibold animate-pulse">
          Loading Batch...
        </div>
      </div>
    );
  }

  const enrolledCount = batch._count?.enrollments || 0;
  const isFull = enrolledCount >= batch.capacity;

  // Resolve course thumbnail or tech watermark image
  const courseTitle = batch.course?.title || "";
  const courseCategory = batch.course?.category || "";
  const watermarkImg = batch.course?.thumbnail || getFallbackImage(courseTitle, courseCategory);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Batch information</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/batches/edit/${batch.id}`}
            className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            Edit Batch
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">

        {/* Centered Original Color Course Watermark Background Graphic */}
        {watermarkImg && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.50] dark:opacity-[0.50] pointer-events-none select-none">
            <img src={watermarkImg} alt="" className="w-80 h-80 object-contain" />
          </div>
        )}

        <div className="space-y-6 relative z-10">

          {/* Top Header Row with Status Badge moved to Right Side */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#3f3f3f]">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Batch Status</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Current operational state</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${batch.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              }`}>
              {batch.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Batch Name</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{batch.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Associated Course</p>
              <p className="text-lg text-gray-900 dark:text-white">{batch.course?.title || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Instructor</p>
              <p className="text-lg text-gray-900 dark:text-white">{batch.instructorName || "Not Assigned"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Capacity Status</p>
              <p className={`font-semibold ${isFull ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {enrolledCount} / {batch.capacity} {isFull && "(FULL)"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Schedule</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm">
                {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "-"} to{" "}
                {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}