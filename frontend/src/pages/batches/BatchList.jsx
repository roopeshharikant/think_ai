import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getBatches, deleteBatch } from "../../api/batchApi";
import { BatchListSkeleton } from "../../components/common/LoadingSkeleton";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  INACTIVE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-emerald-500/30',
};

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [confirmState, setConfirmState] = useState({ open: false, batchId: null });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getBatches();
      setBatches(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batches", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.instructorName?.toLowerCase().includes(search.toLowerCase()) ||
        b.course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, batches]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentBatches = filteredBatches.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteConfirmed = async () => {
    try {
      await deleteBatch(confirmState.batchId);
      toast.success("Batch deleted successfully", { theme: "dark" });
      fetchBatches();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete batch", { theme: "dark" }
      );
    } finally {
      setConfirmState({ open: false, batchId: null });
    }
  };

  const enrolledCountFor = (batch) => batch._count?.enrollments || 0;

  if (loading) {
    return <BatchListSkeleton />;
  }

  return (
    <div className="relative flex flex-col h-full space-y-4 sm:space-y-6 overflow-hidden pb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Batch Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage all available batches, capacities, and schedules.</p>
        </div>
        <div className="rounded-xl">
          <Link
            to="/admin/batches/add"
            className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl transition-all shadow-md inline-block"
          >
            + Add Batch
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-4 sm:p-6 space-y-4 min-h-0 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end shrink-0">
          <div className="w-full sm:max-w-xs relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by batch, course, instructor..."
              className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 rounded-xl px-4 py-2 text-sm outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'ACTIVE', 'INACTIVE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold'
                    : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-[#3f3f3f] hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 rounded-xl relative border border-gray-200 dark:border-[#3f3f3f]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 dark:bg-[#212121] z-10 shadow-sm">
              <tr className="border-b border-gray-200 dark:border-[#3f3f3f] text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Batch Name</th>
                <th className="p-4 font-semibold">Course</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Instructor</th>
                <th className="p-4 font-semibold">Capacity</th>
                <th className="p-4 font-semibold hidden xl:table-cell">Start Date</th>
                <th className="p-4 font-semibold hidden xl:table-cell">End Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
              {currentBatches.map((batch) => {
                const enrolledCount = enrolledCountFor(batch);
                const isFull = enrolledCount >= batch.capacity;

                return (
                  <tr key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{batch.id}</td>
                    <td className="p-4 text-gray-900 dark:text-gray-100 font-bold">{batch.name}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{batch.course?.title || "-"}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 hidden lg:table-cell">{batch.instructorName || "-"}</td>
                    <td className="p-4">
                      <span className={isFull ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                        {enrolledCount}/{batch.capacity}
                      </span>
                      {isFull && <span className="ml-2 text-xs text-rose-600 dark:text-rose-400 font-bold">FULL</span>}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border whitespace-nowrap ${STATUS_STYLES[batch.status] || STATUS_STYLES.ACTIVE}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Icon Button */}
                        <Link
                          to={`/admin/batches/${batch.id}`}
                          title="View Batch"
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all inline-flex items-center justify-center shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </Link>
                        {/* Edit Icon Button */}
                        <Link
                          to={`/admin/batches/edit/${batch.id}`}
                          title="Edit Batch"
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all inline-flex items-center justify-center shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </Link>
                        {/* Delete Icon Button */}
                        <button
                          onClick={() => setConfirmState({ open: true, batchId: batch.id })}
                          title="Delete Batch"
                          className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all inline-flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                    <p className="text-sm tracking-widest uppercase mt-4">No batches match your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Showing <strong className="text-gray-900 dark:text-gray-200">{indexOfFirstItem + 1}</strong> to <strong className="text-gray-900 dark:text-gray-200">{Math.min(indexOfLastItem, filteredBatches.length)}</strong> of <strong className="text-gray-900 dark:text-gray-200">{filteredBatches.length}</strong> batches
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/[0.05] text-xs font-bold uppercase tracking-wider"
              >
                Prev
              </button>
              <div className="flex items-center px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#3f3f3f] text-xs font-bold text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/[0.05] text-xs font-bold uppercase tracking-wider"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title="Confirm Delete"
        message="Are you sure you want to delete this batch? This action cannot be undone."
        danger={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmState({ open: false, batchId: null })}
      />
    </div>
  );
}