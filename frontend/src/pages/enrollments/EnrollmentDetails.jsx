import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getEnrollmentById } from "../../api/enrollmentApi";
import {
  getProgressByEnrollment,
  getProgressSummary,
} from "../../api/lessonProgressApi";
import {
  generateCertificate,
  getCertificateByEnrollment,
  checkCertificateEligibility,
  downloadCertificateUrl,
} from "../../api/certificateApi";
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

export default function EnrollmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [certificate, setCertificate] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadEnrollment();
    loadProgress();
    loadCertificate();
    loadEligibility();
  }, [id]);

  const loadEnrollment = async () => {
    try {
      setLoading(true);
      const response = await getEnrollmentById(id);
      setEnrollment(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load enrollment", { theme: "dark" });
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      setProgressLoading(true);
      const [progressRes, summaryRes] = await Promise.all([
        getProgressByEnrollment(id),
        getProgressSummary(id),
      ]);
      setProgress(progressRes.data.data || []);
      setSummary(summaryRes.data.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setProgressLoading(false);
    }
  };

  const loadCertificate = async () => {
    try {
      setCertificateLoading(true);
      const response = await getCertificateByEnrollment(id);
      setCertificate(response.data.data || null);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(error);
      }
      setCertificate(null);
    } finally {
      setCertificateLoading(false);
    }
  };

  const loadEligibility = async () => {
    try {
      const response = await checkCertificateEligibility(id);
      setEligibility(response.data.data || null);
    } catch (error) {
      console.error("Failed to check eligibility", error);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setGenerating(true);
      const response = await generateCertificate(id);
      setCertificate(response.data.data);
      toast.success("Certificate generated successfully", { theme: "dark" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Certificate not available yet (Requires >=80% videos & >=40% assessment scores)", { theme: "dark" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!enrollment) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-purple-500 dark:text-cyan-400 text-xl font-semibold animate-pulse">
          Loading Enrollment...
        </div>
      </div>
    );
  }

  const completedCount =
    summary?.completedLessons ?? progress.filter((p) => p.completed).length;
  const totalCount = summary?.totalLessons ?? progress.length;
  const percent =
    summary?.percentComplete ??
    (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const courseTitle = enrollment.batch?.course?.title || "";
  const courseCategory = enrollment.batch?.course?.category || "";
  const watermarkImg = enrollment.batch?.course?.thumbnail || getFallbackImage(courseTitle, courseCategory);

  const isEligible = eligibility?.eligible ?? (percent >= 80);

  return (
    <div className="h-full overflow-y-auto px-2 sm:px-4 py-4 custom-scrollbar text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Overview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View complete student enrollment information.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/enrollments/edit/${enrollment.id}`}
              className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors"
            >
              Edit Enrollment
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {watermarkImg && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.50] dark:opacity-[0.50] pointer-events-none select-none">
              <img src={watermarkImg} alt="" className="w-80 h-80 object-contain" />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-3xl font-bold text-purple-600 dark:text-purple-400 shadow-md text-center p-4">
                {(enrollment.studentName || 'S').charAt(0).toUpperCase()}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
                enrollment.enrollmentStatus === "ACTIVE" || enrollment.enrollmentStatus === "ENROLLED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              }`}>
                {enrollment.enrollmentStatus}
              </span>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student Name</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{enrollment.studentName}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student Email</p>
                <p className="text-lg text-gray-900 dark:text-white">{enrollment.studentEmail}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigned Batch</p>
                <p className="text-lg text-purple-600 dark:text-purple-400 font-medium">{enrollment.batch?.name || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Associated Course</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{enrollment.batch?.course?.title || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Enrolled On</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">
                    {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Progress */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lesson Video Watch Progress</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Requires at least 80% video viewing completion.</p>
            </div>
            {!progressLoading && totalCount > 0 && (
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {completedCount}/{totalCount} · {percent}%
              </span>
            )}
          </div>

          {progressLoading ? (
            <div className="text-sm text-gray-500 animate-pulse">Loading progress...</div>
          ) : totalCount === 0 ? (
            <div className="text-sm text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-8 text-center">
              No lesson progress recorded yet.
            </div>
          ) : (
            <>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <ul className="space-y-2 max-h-80 overflow-auto custom-scrollbar pr-1">
                {progress.map((p) => (
                  <li
                    key={p.lessonId}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-[#3f3f3f]"
                  >
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {p.lesson?.title || `Lesson #${p.lessonId}`}
                    </span>
                    {p.completed ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                        Complete
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.03] border border-gray-300 dark:border-gray-700 px-2.5 py-1 rounded-md">
                        Pending
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Certificate Section with Rule Verification */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Certificate Issuance</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Issued automatically when video watch progress &ge; 80% and all course assessments &ge; 40%.
              </p>
            </div>
          </div>

          {certificateLoading ? (
            <div className="text-sm text-gray-500 animate-pulse">Checking certificate status...</div>
          ) : certificate ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-[#3f3f3f]">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate No.</p>
                <p className="text-gray-900 dark:text-white font-medium">{certificate.certificateNo}</p>
                {certificate.issuedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Issued {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <a
                href={downloadCertificateUrl(certificate.certificateNo)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors text-center shrink-0"
              >
                Download Certificate
              </a>
            </div>
          ) : isEligible ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Student meets all criteria (Videos &ge; 80%, Assessments passed)!
              </p>
              <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {generating ? "Generating..." : "Generate Certificate"}
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-transparent space-y-1">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Not yet eligible for a certificate.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Requirements: Video progress &ge; 80% (Current: {percent}%) and all module assessments passed &ge; 40%.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}