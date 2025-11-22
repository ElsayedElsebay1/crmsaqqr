import { ProjectFile } from '../types';

const getStorageKey = (projectId: string): string => `project_files_${projectId}`;

/**
 * Retrieves all files for a given project from localStorage.
 * @param projectId The ID of the project.
 * @returns An array of ProjectFile objects.
 */
export function getFilesForProject(projectId: string): ProjectFile[] {
  try {
    const filesJson = localStorage.getItem(getStorageKey(projectId));
    return filesJson ? JSON.parse(filesJson) : [];
  } catch (error) {
    console.error("Failed to parse files from localStorage", error);
    return [];
  }
}

/**
 * Saves a file for a given project to localStorage.
 * @param projectId The ID of the project.
 * @param file The ProjectFile object to save.
 */
export function saveFileForProject(projectId: string, file: ProjectFile): void {
  const files = getFilesForProject(projectId);
  // Prevent duplicates by name
  if (!files.some(f => f.name === file.name)) {
    const updatedFiles = [...files, file];
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(updatedFiles));
  }
}

/**
 * Deletes a file for a given project from localStorage.
 * @param projectId The ID of the project.
 * @param fileName The name of the file to delete.
 */
export function deleteFileForProject(projectId: string, fileName: string): void {
  const files = getFilesForProject(projectId);
  const updatedFiles = files.filter(f => f.name !== fileName);
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(updatedFiles));
}