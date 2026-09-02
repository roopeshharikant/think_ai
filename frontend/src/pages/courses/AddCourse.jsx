import React, { useState, useEffect } from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

// ==========================================
// 1. Modal Component
// ==========================================
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Added fixed inset-0, z-[9999] and overflow-y-auto to guarantee it floats cleanly above the header
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1e2b] border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Modal Body / Form Content */}
        <div className="max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. AddCourse Component
// ==========================================
const EMPTY_COURSE = {
  title: '',
  description: '',
  instructorName: '',
  instructorDetails: '',
  duration: '',
  category: '',
  level: 'Beginner',
  language: 'English',
  price: '',
  thumbnail: '',
  thumbnailFile: null,
  videoFile: null,
  videoUrl: '',
  status: 'ACTIVE',
};

const TECH_IMAGE_OPTIONS = [
  { label: 'JavaScript', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { label: 'TypeScript', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { label: 'Python', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { label: 'Java', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { label: 'React', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { label: 'Node.js', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { label: 'Angular', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
  { label: 'Vue', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
  { label: 'C', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { label: 'C++', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { label: 'C#', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { label: 'MongoDB', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { label: 'SQL', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
];

export default function AddCourse({ isOpen, onClose, course, onSave }) {
  const [formData, setFormData] = useState(EMPTY_COURSE);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({ ...EMPTY_COURSE, ...course });
      setThumbnailPreview(course.thumbnail || null);
      setVideoFileName(course.videoUrl ? 'Existing video attached' : '');
    } else {
      setFormData(EMPTY_COURSE);
      setThumbnailPreview(null);
      setVideoFileName('');
    }
  }, [course, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSelectTechImage = (option) => {
    setFormData((prev) => ({ ...prev, thumbnail: option.img, thumbnailFile: null }));
    setThumbnailPreview(option.img);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnailFile: file, thumbnail: file.name }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: '', thumbnailFile: null }));
    setThumbnailPreview(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, videoFile: file }));
      setVideoFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course' : 'Add New Course'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-gray-900 dark:text-gray-100">

        <InputField
          label="Course Title"
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Node.js Fundamentals"
          required
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Learn Node.js from scratch"
            className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />
        </div>

        <InputField
          label="Instructor Name"
          id="instructorName"
          name="instructorName"
          type="text"
          value={formData.instructorName}
          onChange={handleChange}
          placeholder="e.g. Alex Rivera"
        />

        <InputField
          label="Instructor Details"
          id="instructorDetails"
          name="instructorDetails"
          type="text"
          value={formData.instructorDetails}
          onChange={handleChange}
          placeholder="e.g. Senior React Developer, 5 years experience"
        />

        {/* Thumbnail Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Thumbnail / Card Image
            </label>
            {thumbnailPreview && (
              <button
                type="button"
                onClick={handleClearThumbnail}
                className="text-[11px] text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            {thumbnailPreview ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-purple-500/40 shrink-0 bg-white flex items-center justify-center">
                <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] flex items-center justify-center text-xs text-gray-400 shrink-0">
                No Image
              </div>
            )}
            <p className="text-xs text-gray-500">Pick an icon below, or upload a custom image.</p>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 p-3 bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-lg max-h-40 overflow-y-auto">
            {TECH_IMAGE_OPTIONS.map((option) => {
              const isSelected = formData.thumbnail === option.img;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleSelectTechImage(option)}
                  title={option.label}
                  className={`aspect-square rounded-lg flex items-center justify-center p-2 bg-white border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/40'
                      : 'border-transparent hover:border-purple-500/40'
                  }`}
                >
                  <img src={option.img} alt={option.label} className="w-full h-full object-contain" />
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-600 dark:file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer"
            />
          </div>
        </div>

        {/* Video Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Upload Course Video (MP4, WEBM, MKV, MOV)
          </label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/mkv,video/quicktime"
            onChange={handleVideoChange}
            className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
          />
          {videoFileName && (
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 font-mono truncate">
              Selected video: {videoFileName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Duration"
            id="duration"
            name="duration"
            type="text"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 30 Days"
          />
          <InputField
            label="Category"
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Backend"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <InputField
            label="Language"
            id="language"
            name="language"
            type="text"
            value={formData.language}
            onChange={handleChange}
            placeholder="e.g. English"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Price (₹)"
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="4999"
          />
          <InputField
            label="Status"
            id="status"
            name="status"
            type="text"
            value={formData.status}
            onChange={handleChange}
            placeholder="ACTIVE"
          />
        </div>

        <div className="pt-4 mt-2 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-[#3f3f3f]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            label={course ? 'Save Changes' : 'Create Course'}
          />
        </div>

      </form>
    </Modal>
  );
}