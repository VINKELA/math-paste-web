import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { environment } from 'environments/environment';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

password = '';
  confirmPassword = ''; // Added this field
  token = '';
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    // 1. Get the token from the URL (e.g., ...?token=123)
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.token) {
      this.toastr.danger('Invalid link. Token is missing.', 'Error');
      // Optional: Redirect back to login if no token
      // this.router.navigate(['/auth/login']);
    }
  }

  resetPass(): void {
    // 1. Safety Check: Ensure passwords match
    if (this.password !== this.confirmPassword) {
      this.toastr.warning('Passwords do not match.', 'Validation Error');
      return;
    }

    this.submitted = true;

   

    const fullUrl = `${environment.api}password/confirm/`;

    // 3. Send POST request
    this.http.post(fullUrl, { 
      password: this.password, 
      token: this.token 
    }).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully.', 'Success');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.submitted = false;
        console.error('Reset Failed:', err);
        
        // Provide helpful error messages
        if (err.status === 404) {
             this.toastr.danger('API Endpoint not found. Check environment URL.', 'System Error');
        } else {
             this.toastr.danger('Token expired or invalid.', 'Error');
        }
      }
    });
  }
}
