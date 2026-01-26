import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogPost, BlogService } from 'app/@core/utils/blog.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {

  post: BlogPost | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) { }

  ngOnInit(): void {
    // 1. Get the 'slug' from the URL (e.g. /blog/my-first-post)
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      // 2. Fetch the post data
      this.blogService.getPostBySlug(slug).subscribe({
        next: (data) => this.post = data,
        error: (err) => console.error('Could not load post', err)
      });
    }
  }
}