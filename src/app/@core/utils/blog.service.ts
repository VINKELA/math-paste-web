import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// This defines what a "Post" looks like so TypeScript understands it
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  // Uses your environment API URL (works for Localhost AND Render)
  private apiUrl = `${environment.api}blog/posts`;

  constructor(private http: HttpClient) { }

  // Get all published posts
  getPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/`);
  }

  // Get a single post by its slug (e.g., /api/blog/posts/welcome-to-mathpaste/)
  getPostBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${slug}/`);
  }
}