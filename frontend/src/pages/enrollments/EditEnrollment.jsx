import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getEnrollmentById, updateEnrollment } from "../../api/enrollmentApi";
import { getBatches } from "../../api/batchApi";

function EditEnrollment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [enrollment, setEnrollment] = useState({
    studentName: "",
    studentEmail: "",
    batchId: "",
    enrollmentStatus: "ENROLLED",
  });

  useEffect(() => {
    loadBatches();
    loadEnrollment();
  }, [id]);

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

  const loadEnrollment = async () => {
    try {
      const response = await getEnrollmentById(id);
      const data = response.data.data;

      setEnrollment({
        studentName: data.studentName || "",
        studentEmail: data.studentEmail || "",
        batchId: data.batchId || data.batch?.id || "",
        enrollmentStatus: data.enrollmentStatus || "ENROLLED",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load enrollment", { theme: "dark" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnrollment({
      ...enrollment,
      [name]: name === "batchId" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        studentName: enrollment.studentName,
        studentEmail: enrollment.studentEmail,
        batchId: Number(enrollment.batchId),
        enrollmentStatus: enrollment.enrollmentStatus,
      };

      await updateEnrollment(id, payload);
      toast.success("Enrollment Updated Successfully", { theme: "dark" });
      navigate("/admin/enrollments");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Update Enrollment", { theme: "dark" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Enrollment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update enrollment information.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 grid grid-cols-2 gap-6 shadow-xl"
      >
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={enrollment.studentName}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <input
          type="email"
          name="studentEmail"
          placeholder="Student Email"
          value={enrollment.studentEmail}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <select
          name="batchId"
          value={enrollment.batchId}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          required
          disabled={loadingBatches}
        >
          <option value="">
            {loadingBatches ? "Loading batches..." : "Select Batch"}
          </option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>

        <select
          name="enrollmentStatus"
          value={enrollment.enrollmentStatus}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ENROLLED">ENROLLED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <div className="col-span-2 flex justify-center pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            Update Enrollment
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEnrollment;