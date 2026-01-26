import { Component, OnInit } from '@angular/core';
import { BlogPost, BlogService } from 'app/@core/utils/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {

  posts: BlogPost[] = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        console.log('Posts loaded:', data);
      },
      error: (err) => console.error('Failed to load posts', err)
    });
  }
}