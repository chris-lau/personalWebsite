import { GuidebookChapter } from '../types/portfolio';
import guidebookMasterContent from '../../../backend/posts/guidebook-master.md?raw';
import rawChapters from '../../../backend/data/guidebook_chapters.json';

export const getGuidebookMasterContent = (): string => {
  return guidebookMasterContent;
};

export const guidebookChapters: GuidebookChapter[] = rawChapters as GuidebookChapter[];
