import { forumGet, forumPost, forumDelete } from "./forumHttpClient";

/** Bookmark API — Phase 5/9 add, remove and sync. */

export function fetchBookmarks(userId) {
  return forumGet("/bookmarks", userId ? { userId } : undefined).then(
    (payload) => payload.data
  );
}

export function addBookmark(discussionId) {
  return forumPost("/bookmarks", { discussionId }).then((payload) => payload.data);
}

export function removeBookmark(userId, discussionId) {
  return forumDelete(`/bookmarks/${userId}/${discussionId}`).then(
    (payload) => payload.data
  );
}
