/**
 * Client-side validation mirroring the Forum backend rules
 * (see backend/src/services/discussionService.js and controllers).
 */

export const TITLE_MIN = 5;
export const TITLE_MAX = 150;
export const BODY_MIN = 10;
export const BODY_MAX = 5000;
export const COMMENT_MIN = 2;
export const COMMENT_MAX = 5000;
export const CATEGORY_NAME_MAX = 50;

export function validateDiscussionInput({ title, body } = {}) {
  const errors = {};
  const trimmedTitle = String(title || "").trim();
  const trimmedBody = String(body || "").trim();

  if (!trimmedTitle) errors.title = "Title is required";
  else if (trimmedTitle.length < TITLE_MIN)
    errors.title = `Title must be at least ${TITLE_MIN} characters`;
  else if (trimmedTitle.length > TITLE_MAX)
    errors.title = `Title must be at most ${TITLE_MAX} characters`;

  if (!trimmedBody) errors.body = "Body is required";
  else if (trimmedBody.length < BODY_MIN)
    errors.body = `Body must be at least ${BODY_MIN} characters`;
  else if (trimmedBody.length > BODY_MAX)
    errors.body = `Body must be at most ${BODY_MAX} characters`;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    trimmedTitle,
    trimmedBody,
  };
}

export function parseTagsInput(tagsInput) {
  return String(tagsInput || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
}

export function validateCommentBody(body) {
  const trimmed = String(body || "").trim();
  if (!trimmed) return { valid: false, error: "Comment cannot be empty", trimmed };
  if (trimmed.length < COMMENT_MIN)
    return { valid: false, error: `Comment must be at least ${COMMENT_MIN} characters`, trimmed };
  if (trimmed.length > COMMENT_MAX)
    return { valid: false, error: `Comment must be at most ${COMMENT_MAX} characters`, trimmed };
  return { valid: true, error: null, trimmed };
}

export function validateCategoryInput({ name, color } = {}) {
  const errors = {};
  const trimmedName = String(name || "").trim();
  if (!trimmedName) errors.name = "Name is required";
  else if (trimmedName.length > CATEGORY_NAME_MAX)
    errors.name = `Name must be at most ${CATEGORY_NAME_MAX} characters`;

  const normalizedColor = color ? String(color) : "#6366f1";
  if (!/^#[0-9a-fA-F]{6}$/.test(normalizedColor))
    errors.color = "Color must be a hex value like #6366f1";

  return { valid: Object.keys(errors).length === 0, errors, name: trimmedName, color: normalizedColor };
}
