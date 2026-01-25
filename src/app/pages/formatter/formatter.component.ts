// @ts-nocheck
import { Component, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { TargetEditor, TextTransformerService } from 'app/@core/utils/text-transformer.service';

@Component({
  selector: 'formatter',
  templateUrl: './formatter.component.html',
  styleUrls: ['./formatter.component.scss']
})
export class FormatterComponent {
rawText: string = '';
  selectedTarget: TargetEditor = 'OFFICE';
  copyStatus: string = '';
  statusType: 'success' | 'error' = 'success';
  user: any = {};
  isAuthenticated = false;

  private readonly DJANGO_API_URL = `${environment.api}save-history/`;

  constructor(
    private transformer: TextTransformerService,
    private authService: NbAuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      this.isAuthenticated = token.isValid();
      if (this.isAuthenticated) this.user = token.getPayload();
    });
  }

  async processAndCopy(): Promise<void> {
    if (!this.rawText) return;

    const processedText = this.transformer.processText(this.rawText, this.selectedTarget);
    
    try {
      await this.copyToClipboard(processedText);
      this.showFeedback('Copied! Ready to paste.', 'success');

      if (this.isAuthenticated) {
        this.saveToHistory(this.rawText, processedText);
      }
    } catch (err) {
      this.showFeedback('Failed to copy.', 'error');
    }
  }

  private async copyToClipboard(processedText: string): Promise<void> {
    const plainBlob = new Blob([processedText], { type: 'text/plain' });
    let blob = plainBlob;

    if (this.selectedTarget === 'OFFICE' || this.selectedTarget === 'GDOCS') {
      const wrapper = `<div style="font-family: Calibri, Arial; font-size: 11pt;">${processedText}</div>`;
      blob = new Blob([wrapper], { type: 'text/html' });
    }

    const ClipboardItemPolyfill = (window as any).ClipboardItem;
    if (!ClipboardItemPolyfill) throw new Error('No Clipboard API');

    const data: any = { 'text/plain': plainBlob };
    if (this.selectedTarget === 'OFFICE' || this.selectedTarget === 'GDOCS') {
      data['text/html'] = blob;
    }

    await (navigator.clipboard as any).write([new ClipboardItemPolyfill(data)]);
  }

  private saveToHistory(original: string, result: string): void {
    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token.getValue()}` });

        this.http.post(this.DJANGO_API_URL, {
          original_text: original,
          transformed_text: result,
          editor_type: this.selectedTarget
        }, { headers }).subscribe({
          next: () => {
            // TRIGGER THE SIDEBAR REFRESH
            this.transformer.triggerRefresh();
          },
          error: (err) => console.error('Save failed', err)
        });
      }
    });
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    this.copyStatus = msg;
    this.statusType = type;
    setTimeout(() => this.copyStatus = '', 3000);
  }
  downloadFile() {
    if (!this.rawText) return;

    // 1. Get the transformed text
    const processedText = this.transformer.processText(this.rawText, this.selectedTarget);
    let blob: Blob;
    let filename = 'math-paste-doc';

    // 2. Create the correct Blob based on the target
    switch (this.selectedTarget) {
      case 'OFFICE':
        // Trick: Word can open HTML files containing MathML if saved as .doc
        const wordContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>Document</title></head>
          <body>${processedText}</body>
          </html>`;
        blob = new Blob([wordContent], { type: 'application/msword' });
        filename += '.doc';
        break;

      case 'GDOCS':
        // Google Docs likes standard HTML
        blob = new Blob([processedText], { type: 'text/html' });
        filename += '.html';
        break;

      case 'MARKDOWN':
        blob = new Blob([processedText], { type: 'text/markdown' });
        filename += '.md';
        break;

      case 'UNICODE':
      default:
        blob = new Blob([processedText], { type: 'text/plain' });
        filename += '.txt';
        break;
    }

    // 3. Trigger the Download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // 4. Cleanup
    window.URL.revokeObjectURL(url);
    this.showFeedback('Document Downloaded!', 'success');}

  logout(): void {
    this.authService.logout('email').subscribe(() => {
      // 1. Reset Local State
      this.isAuthenticated = false;
      this.user = {};
      
      // 2. Trigger Sidebar Refresh (it will see token is gone and clear itself)
      this.transformer.triggerRefresh();
    });
  }
}