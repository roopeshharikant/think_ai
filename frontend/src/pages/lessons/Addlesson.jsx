import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createLesson } from "../../api/lessonApi";
import { getModules } from "../../api/moduleApi";
import InputField from "../../components/common/InputField";

function AddLesson() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);

  const [lesson, setLesson] = useState({
    title: "",
    moduleId: "",
    videoUrl: "",
    content: "",
    duration: "",
    order: "",
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const response = await getModules();
      setModules(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load modules", { theme: "dark" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLesson({
      ...lesson,
      [name]:
        name === "moduleId" || name === "order"
          ? value === "" ? "" : Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: lesson.title,
        moduleId: Number(lesson.moduleId),
        videoUrl: lesson.videoUrl,
        content: lesson.content,
        duration: lesson.duration === "" ? "" : String(lesson.duration),
        order: lesson.order === "" ? 0 : Number(lesson.order),
      };

      setSaving(true);
      await createLesson(payload);
      toast.success("Lesson Added Successfully", { theme: "dark" });
      navigate("/admin/lessons");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Add Lesson", { theme: "dark" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full space-y-4 sm:space-y-6 overflow-hidden pb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 max-w-3xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Lesson</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new lesson under a module.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/lessons")}
          className="text-xs px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase tracking-wider font-semibold cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Form Card */}
      <div className="flex-1 overflow-auto rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] shadow-lg max-w-3xl mx-auto w-full custom-scrollbar">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Lesson Title</label>
            <InputField
              type="text"
              name="title"
              value={lesson.title}
              onChange={handleChange}
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Module</label>
            <select
              name="moduleId"
              value={lesson.moduleId}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              required
            >
              <option value="">Select Module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Duration (minutes)</label>
            <InputField
              type="number"
              name="duration"
              value={lesson.duration}
              onChange={handleChange}
              placeholder="Enter duration"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order</label>
            <InputField
              type="number"
              name="order"
              value={lesson.order}
              onChange={handleChange}
              placeholder="Position within module"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Video URL</label>
            <InputField
              type="text"
              name="videoUrl"
              value={lesson.videoUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Content</label>
            <textarea
              name="content"
              value={lesson.content}
              onChange={handleChange}
              rows={5}
              placeholder="Lesson notes / description"
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              {saving ? "Saving..." : "Save Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLesson;