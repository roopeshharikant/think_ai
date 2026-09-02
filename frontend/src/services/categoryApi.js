import { forumDelete, forumGet, forumPost, forumPut } from "./forumHttpClient";

/** Category API — Phase 5 CRUD. */

export function fetchCategories() {
  return forumGet("/categories").then((payload) => payload.data);
}

export function createCategory({ name, color, description }) {
  return forumPost("/categories", { name, color, description }).then(
    (payload) => payload.data
  );
}

export function updateCategory(id, patch) {
  return forumPut(`/categories/${id}`, patch).then((payload) => payload.data);
}

export function deleteCategory(id) {
  return forumDelete(`/categories/${id}`).then((payload) => payload.data);
}

/**
 * Namespaced alias kept for pages/tests that prefer the object form.
 * Every method resolves to the raw `{ success, data }` envelope.
 */
export const categoryApi = {
  list: () => forumGet("/categories"),
  create: ({ name, color, description }) =>
    forumPost("/categories", { name, color, description }),
  update: (id, patch) => forumPut(`/categories/${id}`, patch),
  remove: (id) => forumDelete(`/categories/${id}`),
};
