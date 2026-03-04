export interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  readTime?: string;
  thumbnail?: string;
}
