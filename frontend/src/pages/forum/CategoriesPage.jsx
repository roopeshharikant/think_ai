import { useCallback, useEffect, useState } from "react";
import "../../styles/forum.css";

import NotificationToast from "../../components/forum/NotificationToast";
import { categoryApi } from "../../services/categoryApi";
import { validateCategoryInput } from "../../utils/validation";

const EMPTY_FORM = { name: "", color: "#6366f1", description: "" };

/** Categories CRUD page (Phase 5). */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = (message) =>
    setToasts((previous) => [
      ...previous.slice(-2),
      { id: `cat-${Date.now()}`, message },
    ]);

  const load = useCallback(() => {
    categoryApi
      .list()
      .then((payload) => setCategories(payload.data || []))
      .catch((err) => setLoadError(err.message || "Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      color: category.color || "#6366f1",
      description: category.description || "",
    });
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { valid, errors, name, color } = validateCategoryInput(form);
    if (!valid) {
      setFormError(errors.name || errors.color || "Please fix the highlighted fields");
      return;
    }
    try {
      if (editingId) {
        await categoryApi.update(editingId, {
          name,
          color,
          description: form.description,
        });
        pushToast(`Category “${name}” updated`);
      } else {
        await categoryApi.create({
          name,
          color,
          description: form.description,
        });
        pushToast(`Category “${name}” created`);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(err.message || "Could not save the category");
    }
  };

  const handleDelete = async (category) => {
    try {
      await categoryApi.remove(category.id);
      pushToast(`Category “${category.name}” deleted`);
      load();
    } catch (err) {
      pushToast(err.message || "Could not delete category");
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-container">
        <header className="forum-header">
          <h1>Categories</h1>
          <a href="/forum" className="btn btn--ghost">← Forum</a>
        </header>

        {loadError && (
          <div className="error-banner" role="alert">{loadError}</div>
        )}
        {loading && <p className="loading-note">Loading categories…</p>}

        {!loading && categories.length > 0 && (
          <table className="categories-table" data-testid="categories-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Discussions</th>
                <th scope="col" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} data-category-id={category.id}>
                  <td>
                    <span
                      className="category-chip"
                      style={{ borderColor: category.color || undefined }}
                    >
                      {category.color && (
                        <span
                          aria-hidden="true"
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: category.color,
                            marginRight: 6,
                          }}
                        />
                      )}
                      {category.name}
                    </span>
                  </td>
                  <td>{category.description || "—"}</td>
                  <td>{category.discussionCount ?? 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => startEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && categories.length === 0 && !loadError && (
          <p className="loading-note">No categories yet — create the first one below.</p>
        )}

        <form onSubmit={handleSubmit} className="create-form" noValidate>
          <h2 className="section-heading">
            {editingId ? "Edit category" : "New category"}
          </h2>

          {formError && (
            <div className="form-banner form-banner--error" role="alert">
              {formError}
            </div>
          )}

          <div className="field">
            <label htmlFor="category-name">Name</label>
            <input
              id="category-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="category-color">Color</label>
            <input
              id="category-color"
              type="color"
              value={form.color}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
              style={{ height: 42 }}
            />
          </div>
          <div className="field">
            <label htmlFor="category-description">Description</label>
            <input
              id="category-description"
              type="text"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn--primary">
              {editingId ? "Save changes" : "Create category"}
            </button>
            {editingId && (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <NotificationToast
        notifications={toasts}
        onDismiss={(id) => setToasts((previous) => previous.filter((t) => t.id !== id))}
      />
    </div>
  );
}
