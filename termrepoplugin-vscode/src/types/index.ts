export interface TermEntry {
  id: string;
  originalText: string;
  overallNote?: string;
  filePath?: string;
  parts: TermPart[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
  mastery: number;
  reviewCount: number;
  nextReviewDate?: number;
}

export interface TermPart {
  text: string;
  note?: string;
  tags: string[];
  type?: string;
}