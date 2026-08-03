import { GuidebookChapter } from '../types/portfolio';
import rawChapters from '../../../backend/data/guidebook_chapters.json';
import rawBackendChapters from '../../../backend/data/backend_guidebook_chapters.json';

export const guidebookChapters: GuidebookChapter[] = rawChapters as GuidebookChapter[];
export const backendGuidebookChapters: GuidebookChapter[] = rawBackendChapters as GuidebookChapter[];
