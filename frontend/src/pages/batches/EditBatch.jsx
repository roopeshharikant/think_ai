import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getBatchById, updateBatch } from "../../api/batchApi";
import { getCourses } from "../../api/courseApi";
import InputField from "../../components/common/InputField";

function EditBatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const [batch, setBatch] = useState({
    name: "",
    courseId: "",
    instructorName: "",
    capacity: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadCourses();
    loadBatch();
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

  const loadBatch = async () => {
    try {
      const response = await getBatchById(id);
      const data = response.data.data;

      setBatch({
        name: data.name,
        courseId: data.courseId,
        instructorName: data.instructorName,
        capacity: data.capacity,
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        endDate: data.endDate ? data.endDate.split("T")[0] : "",
        status: data.status,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batch", { theme: "dark" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatch({
      ...batch,
      [name]: name === "courseId" || name === "capacity" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: batch.name,
        courseId: Number(batch.courseId),
        instructorName: batch.instructorName,
        capacity: Number(batch.capacity),
        startDate: new Date(batch.startDate).toISOString(),
        endDate: new Date(batch.endDate).toISOString(),
        status: batch.status,
      };

      await updateBatch(id, payload);
      toast.success("Batch Updated Successfully", { theme: "dark" });
      navigate("/admin/batches");
    } catch (error) {
      console.error(error);
      toast.error("Update Failed", { theme: "dark" });
    }
  };

  return (
    <div className="relative flex flex-col h-full space-y-4 sm:space-y-6 overflow-hidden pb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 max-w-3xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Batch</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update batch information and schedule.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 overflow-auto rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] shadow-lg max-w-3xl mx-auto w-full custom-scrollbar">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Batch Name</label>
            <InputField
              type="text"
              name="name"
              value={batch.name}
              onChange={handleChange}
              placeholder="Enter batch name"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Course</label>
            <select
              name="courseId"
              value={batch.courseId}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
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

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instructor Name</label>
            <InputField
              type="text"
              name="instructorName"
              value={batch.instructorName}
              onChange={handleChange}
              placeholder="Enter instructor name"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Capacity</label>
            <InputField
              type="number"
              name="capacity"
              value={batch.capacity}
              onChange={handleChange}
              placeholder="Enter capacity"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={batch.startDate}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={batch.endDate}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select
              name="status"
              value={batch.status}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              Update Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBatch;