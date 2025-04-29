export interface Post {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content?: string;
  timeToRead: number;
  viewCount: number;
  timeCount: number;
  category?: string;
  tags: string[];
}
