import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { createEnrollment } from "../../api/enrollmentApi";
import { getBatches } from "../../api/batchApi";
import { selectUser } from "../../features/auth/authSlice";
import InputField from "../../components/common/InputField";

function AddEnrollment() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enrollment, setEnrollment] = useState({
    studentName: "",
    studentEmail: "",
    batchId: "",
    enrollmentStatus: "ENROLLED",
  });

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await getBatches();
      setBatches(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batches", { theme: "dark" });
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnrollment({
      ...enrollment,
      [name]: name === "batchId" ? Number(value) : value,
    });
  };

  const getStudentCount = (batch) => {
    return batch.enrollments?.filter(
      (enr) =>
        enr.enrollmentStatus === "ACTIVE" ||
        enr.enrollmentStatus === "ENROLLED"
    ).length || 0;
  };

  const isBatchFull = (batch) => {
    return getStudentCount(batch) >= batch.capacity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enrollment.batchId) {
      toast.error("Please select a batch", { theme: "dark" });
      return;
    }

    const selectedBatch = batches.find((b) => b.id === enrollment.batchId);
    if (!selectedBatch) {
      toast.error("Selected batch not found", { theme: "dark" });
      return;
    }

    const studentCount = getStudentCount(selectedBatch);
    if (studentCount >= selectedBatch.capacity) {
      toast.error(`Batch is full (${studentCount}/${selectedBatch.capacity})`, { theme: "dark" });
      return;
    }

    try {
      setSaving(true);
      await createEnrollment(enrollment);
      toast.success("Enrollment Added Successfully", { theme: "dark" });
      navigate("/admin/enrollments");
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to Add Enrollment";
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Enrollment</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enroll a student into a batch.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/enrollments")}
          className="text-xs px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase tracking-wider font-semibold cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Form Card */}
      <div className="flex-1 overflow-auto rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] shadow-lg max-w-3xl mx-auto w-full custom-scrollbar">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Student Name</label>
            <InputField
              type="text"
              name="studentName"
              value={enrollment.studentName}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Student Email</label>
            <InputField
              type="email"
              name="studentEmail"
              value={enrollment.studentEmail}
              onChange={handleChange}
              placeholder="Enter student email"
              required
            />
          </div>

          <div className="sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Batch</label>
            <select
              name="batchId"
              value={enrollment.batchId}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              required
              disabled={loadingBatches}
            >
              <option value="">
                {loadingBatches ? "Loading batches..." : "Select Batch"}
              </option>
              {batches.map((batch) => {
                const studentCount = getStudentCount(batch);
                const full = isBatchFull(batch);
                return (
                  <option key={batch.id} value={batch.id} disabled={full}>
                    {batch.name} — {studentCount}/{batch.capacity} {full ? "(FULL)" : ""}
                  </option>
                );
              })}
            </select>

            {enrollment.batchId && (
              (() => {
                const selectedBatch = batches.find((b) => b.id === enrollment.batchId);
                if (!selectedBatch) return null;
                const studentCount = getStudentCount(selectedBatch);
                const full = isBatchFull(selectedBatch);
                return (
                  <p className={`text-xs mt-1.5 font-medium ${full ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    Students: {studentCount}/{selectedBatch.capacity}
                    {full ? " — Batch Full" : ` — ${selectedBatch.capacity - studentCount} seats available`}
                  </p>
                );
              })()
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select
              name="enrollmentStatus"
              value={enrollment.enrollmentStatus}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              <option value="ENROLLED">ENROLLED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              {saving ? "Saving..." : "Save Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEnrollment;