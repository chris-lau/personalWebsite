import { GuidebookChapter } from '../types/portfolio';
import guidebookMasterContent from '../../../backend/posts/guidebook-master.md?raw';
import backendGuidebookMasterContent from '../../../backend/posts/backend-guidebook-master.md?raw';
import rawChapters from '../../../backend/data/guidebook_chapters.json';
import rawBackendChapters from '../../../backend/data/backend_guidebook_chapters.json';

export const getGuidebookMasterContent = (): string => {
  return guidebookMasterContent;
};

export const getBackendGuidebookMasterContent = (): string => {
  return backendGuidebookMasterContent;
};

export const guidebookChapters: GuidebookChapter[] = rawChapters as GuidebookChapter[];
export const backendGuidebookChapters: GuidebookChapter[] = rawBackendChapters as GuidebookChapter[];
