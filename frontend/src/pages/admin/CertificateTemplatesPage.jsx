import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, Plus, Loader2, CheckCircle, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  fetchAllTemplates,
  createTemplateThunk,
  updateTemplateThunk,
  selectAllTemplates,
  selectTemplateLoading,
  selectTemplateSaving
} from '../../features/certificates/certificateTemplateSlice';

export default function CertificateTemplatesPage() {
  const dispatch = useDispatch();
  const templates = useSelector(selectAllTemplates);
  const loading = useSelector(selectTemplateLoading);
  const saving = useSelector(selectTemplateSaving);

  const [form, setForm] = useState({
    name: '',
    title: 'CERTIFICATE OF COMPLETION',
    primaryColor: '#1E3A8A',
    secondaryColor: '#64748B',
    organizationName: 'Thinkz AI',
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllTemplates());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateTemplateThunk({ id: editingId, data: form }))
        .unwrap()
        .then(() => {
          toast.success("Template updated successfully");
          setEditingId(null);
          setForm({ name: '', title: 'CERTIFICATE OF COMPLETION', primaryColor: '#1E3A8A', secondaryColor: '#64748B', organizationName: 'Thinkz AI', isActive: true });
        })
        .catch((err) => toast.error(err));
    } else {
      dispatch(createTemplateThunk(form))
        .unwrap()
        .then(() => {
          toast.success("Template created successfully");
          setForm({ name: '', title: 'CERTIFICATE OF COMPLETION', primaryColor: '#1E3A8A', secondaryColor: '#64748B', organizationName: 'Thinkz AI', isActive: true });
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      title: t.title,
      primaryColor: t.primaryColor || '#1E3A8A',
      secondaryColor: t.secondaryColor || '#64748B',
      organizationName: t.organizationName || '',
      isActive: t.isActive,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
            Admin Customization
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-slate-900 dark:text-white" style={{ fontFamily: "Fraunces, serif" }}>
            Certificate Templates
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
            {editingId ? "Edit Template" : "Create New Template"}
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-mono mb-1">Template Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Premium Blue Theme"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-mono mb-1">Certificate Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-mono mb-1">Primary Color</label>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full h-9 rounded-xl cursor-pointer bg-transparent"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-mono mb-1">Secondary Color</label>
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-full h-9 rounded-xl cursor-pointer bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-mono mb-1">Organization Name</label>
              <input
                type="text"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded accent-purple-600"
              />
              <label htmlFor="isActive" className="text-slate-700 dark:text-slate-300 font-medium">Set as Active Template</label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition shadow-md shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} {editingId ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>

        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
              Existing Templates ({templates.length})
            </h3>
            {loading ? (
              <div className="text-center py-8 text-slate-400 font-mono text-xs">
                <Loader2 className="animate-spin mx-auto mb-1" size={16} /> Loading templates...
              </div>
            ) : templates.length > 0 ? (
              <div className="space-y-3">
                {templates.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                        {t.isActive && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{t.title} • {t.organizationName || 'Thinkz AI'}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono text-center py-6">No certificate templates created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}