import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/forum.css";

import CreateDiscussionForm from "../../components/forum/CreateDiscussionForm";
import { createDiscussion } from "../../services/forumApi";
import { fetchCategories } from "../../services/categoryApi";

/** Create discussion page (Phase 1). */
export default function CreateDiscussionPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        /* form still usable with the default category */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (formValues) => {
    const discussion = await createDiscussion(formValues);
    setCreated(discussion);
    navigate(`/forum/${discussion.id}`);
  };

  return (
    <div className="forum-page">
      <div className="forum-container" style={{ maxWidth: 680 }}>
        <header className="forum-header">
          <h1>Start a discussion</h1>
        </header>

        {created && (
          <div className="form-banner form-banner--success" role="status">
            Published! Redirecting you to your new thread…
          </div>
        )}

        <CreateDiscussionForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/forum")}
        />
      </div>
    </div>
  );
}
