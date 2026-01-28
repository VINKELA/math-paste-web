import { Component, OnInit } from '@angular/core';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { HistoryItem, TargetEditor, TextTransformerService } from 'app/@core/utils/text-transformer.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-history-sidebar',
  templateUrl: './history-sidebar.component.html',
  styleUrls: ['./history-sidebar.component.scss'],
})
export class HistorySidebarComponent implements OnInit {
historyList: HistoryItem[] = [];
  isAuthenticated = false;
  private refreshSub: Subscription = new Subscription();

  constructor(
    private service: TextTransformerService, 
    private authService: NbAuthService
  ) {}

  ngOnInit() {
    // 1. Initial Auth Check
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      this.isAuthenticated = token.isValid();
      if (this.isAuthenticated) this.loadHistory();
      else this.historyList = [];
    });

    // 2. Listen for Refreshes from Main Component
    this.refreshSub = this.service.historyRefresh$.subscribe(() => {
      if (this.isAuthenticated) this.loadHistory();
    });
  }

  ngOnDestroy() {
    this.refreshSub.unsubscribe();
  }

  loadHistory() {
    this.service.getUserHistory().subscribe({
      next: (data) => this.historyList = data,
      error: (err) => console.error('History load failed', err)
    });
  }

  async copyItem(item: HistoryItem) {
    const ClipboardItemPolyfill = (window as any).ClipboardItem;
    const plainBlob = new Blob([item.transformed_text], { type: 'text/plain' });
    
    try {
      if (ClipboardItemPolyfill) {
         // Create a simple clipboard item
         const data = { 'text/plain': plainBlob };
         
         // If it was OFFICE/GDOCS, try to fake HTML to preserve richness (optional)
         if (item.editor_type === 'OFFICE' || item.editor_type === 'GDOCS') {
             const wrapper = `<div style="font-family: Calibri, Arial; font-size: 11pt;">${item.transformed_text}</div>`;
             data['text/html'] = new Blob([wrapper], { type: 'text/html' });
         }

         await (navigator.clipboard as any).write([new ClipboardItemPolyfill(data)]);
      } else {
         await navigator.clipboard.writeText(item.transformed_text);
      }
      alert('Copied to clipboard!');
    } catch(e) { console.error(e); }
  }
  // NEW: Download logic for a specific history item
  downloadItem(item: HistoryItem) {
    let blob: Blob;
    let extension = '.txt';
    let mimeType = 'text/plain';

    // 1. Determine file type based on how it was originally saved
    switch (item.editor_type as TargetEditor) {
      case 'OFFICE':
        const wordContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head><meta charset='utf-8'><title>Doc</title></head>
          <body>${item.transformed_text}</body>
          </html>`;
        blob = new Blob([wordContent], { type: 'application/msword' });
        extension = '.doc';
        break;

      case 'GDOCS':
        blob = new Blob([item.transformed_text], { type: 'text/html' });
        extension = '.html';
        break;

      case 'MARKDOWN':
        blob = new Blob([item.transformed_text], { type: 'text/markdown' });
        extension = '.md';
        break;

      default:
        blob = new Blob([item.transformed_text], { type: 'text/plain' });
        extension = '.txt';
        break;
    }

    // 2. Trigger Download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Filename: "math-paste-[ID].[ext]"
    a.download = `math-paste-${item.id}${extension}`; 
    a.click();
    
    window.URL.revokeObjectURL(url);
  }

  deleteHistoryItem(item: HistoryItem, event: Event) {
  event.stopPropagation(); // Prevent clicking the "Trash" from pasting the text
  
  if (!confirm('Delete this item?')) return;

  this.service.deleteItem(item.id).subscribe({
    next: () => {
      // Remove it from the list instantly without reloading
      this.historyList = this.historyList.filter(h => h.id !== item.id);
    },
    error: (err) => console.error('Delete failed', err)
  });
}

}
