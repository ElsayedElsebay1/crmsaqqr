import { Comment } from '../types';

const getStorageKey = (taskId: string): string => `task_comments_${taskId}`;

/**
 * Retrieves all comments for a given task from localStorage.
 * @param taskId The ID of the task.
 * @returns An array of Comment objects.
 */
export function getCommentsForTask(taskId: string): Comment[] {
  try {
    const commentsJson = localStorage.getItem(getStorageKey(taskId));
    return commentsJson ? JSON.parse(commentsJson) : [];
  } catch (error) {
    console.error("Failed to parse comments from localStorage", error);
    return [];
  }
}

/**
 * Adds a new comment for a given task to localStorage.
 * @param taskId The ID of the task.
 * @param commentData The Comment object to add (without an id).
 * @returns The newly created comment with an id.
 */
export function addCommentForTask(taskId: string, commentData: Omit<Comment, 'id'>): Comment {
  const comments = getCommentsForTask(taskId);
  const newComment: Comment = {
    ...commentData,
    id: `comment-${Date.now()}`
  };
  const updatedComments = [...comments, newComment];
  localStorage.setItem(getStorageKey(taskId), JSON.stringify(updatedComments));
  return newComment;
}
