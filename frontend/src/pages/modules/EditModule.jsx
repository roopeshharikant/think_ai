import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getModuleById, updateModule } from "../../api/moduleApi";
import { getCourses } from "../../api/courseApi";
import InputField from "../../components/common/InputField";

function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const [module, setModule] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  useEffect(() => {
    loadCourses();
    loadModule();
  }, [id]);

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

  const loadModule = async () => {
    try {
      const response = await getModuleById(id);
      const data = response.data.data;

      setModule({
        title: data.title || "",
        description: data.description || "",
        courseId: data.courseId || data.course?.id || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load module", { theme: "dark" });
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
    try {
      const payload = {
        title: module.title,
        description: module.description,
      };

      await updateModule(id, payload);
      toast.success("Module Updated Successfully", { theme: "dark" });
      navigate("/admin/modules");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Update Module", { theme: "dark" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Module</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update module information.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl"
      >
        <div className="sm:col-span-2 flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Module Title</label>
          <InputField
            type="text"
            name="title"
            value={module.title}
            onChange={handleChange}
            placeholder="Module title"
            required
          />
        </div>

        <div className="sm:col-span-2 flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Course</label>
          <select
            name="courseId"
            value={module.courseId}
            onChange={handleChange}
            disabled
            title="Course cannot be changed after creation"
            className="bg-gray-100 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60 text-sm"
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
            rows={4}
            className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 flex justify-center pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white border-0 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            Update Module
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditModule;