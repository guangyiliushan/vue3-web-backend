import { Article } from './article.model';
import { Comment } from './comment.model';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  image: any | null;
  favorites: Article[];
  comments: Comment[];
}