import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getCourseById, updateCourse } from "../../api/courseApi";

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    thumbnail: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      const response = await getCourseById(id);
      const data = response.data.data;

      setCourse({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        duration: data.duration,
        thumbnail: data.thumbnail,
        status: data.status,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: course.title,
        description: course.description,
        category: course.category,
        price: Number(course.price),
        duration: course.duration,
        thumbnail: course.thumbnail,
        status: course.status,
      };

      await updateCourse(id, payload);
      toast.success("Course Updated Successfully");
      navigate("/admin/courses");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Update Course");
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-gray-900 dark:text-gray-100">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update course information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3f3f3f] text-purple-600 dark:text-purple-400 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition cursor-pointer"
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-8 grid grid-cols-2 gap-6 shadow-xl"
      >

        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={course.title}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={course.category}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={course.price}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <input
          type="text"
          name="duration"
          placeholder="Duration"
          value={course.duration}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <input
          type="text"
          name="thumbnail"
          placeholder="Thumbnail URL"
          value={course.thumbnail}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />

        <select
          name="status"
          value={course.status}
          onChange={handleChange}
          className="bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <textarea
          name="description"
          placeholder="Course Description"
          value={course.description}
          onChange={handleChange}
          rows="5"
          required
          className="col-span-2 bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />

        <button
          type="submit"
          className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer shadow-md"
        >
          Update Course
        </button>

      </form>
    </div>
  );
}

export default EditCourse;