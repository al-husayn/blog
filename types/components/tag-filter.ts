export interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
  panelId?: string;
}
