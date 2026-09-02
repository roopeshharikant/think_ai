import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createModule } from "../../api/moduleApi";
import { getCourses } from "../../api/courseApi";
import InputField from "../../components/common/InputField";

function AddModule() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);

  const [module, setModule] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await getCourses("", 1, 100);
      const payload = response.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.courses)
          ? payload.courses
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      setCourses(list);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses", { theme: "dark" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModule({
      ...module,
      [name]: name === "courseId" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!module.courseId) {
      toast.error("Please select a course", { theme: "dark" });
      return;
    }

    try {
      setSaving(true);
      await createModule(module);
      toast.success("Module Added Successfully", { theme: "dark" });
      navigate("/admin/modules");
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to Add Module";
      toast.error(message, { theme: "dark" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full space-y-4 sm:space-y-6 overflow-hidden pb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 max-w-3xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Module</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new module under a course.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/modules")}
          className="text-xs px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase tracking-wider font-semibold cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Form Card */}
      <div className="flex-1 overflow-auto rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] shadow-lg max-w-3xl mx-auto w-full custom-scrollbar">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Module Title</label>
            <InputField
              type="text"
              name="title"
              value={module.title}
              onChange={handleChange}
              placeholder="Enter module title"
              required
            />
          </div>

          <div className="sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Course</label>
            <select
              name="courseId"
              value={module.courseId}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              required
            >
              <option value="">Select Course</option>
              {(Array.isArray(courses) ? courses : []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea
              name="description"
              value={module.description}
              onChange={handleChange}
              placeholder="Enter module description"
              rows={4}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              {saving ? "Saving..." : "Save Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddModule;