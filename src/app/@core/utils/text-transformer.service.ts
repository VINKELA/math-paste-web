import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import * as katex from 'katex';
import { environment } from 'environments/environment';

export interface HistoryItem {
  id: number;
  original_text: string;
  transformed_text: string;
  editor_type: string;
  created_at: string;
}

export type TargetEditor = 'OFFICE' | 'GDOCS' | 'MARKDOWN' | 'LATEX' | 'UNICODE';

@Injectable({
  providedIn: 'root'
})
export class TextTransformerService {
private apiUrl = `${environment.api}save-history/`  ;
  
  // 1. Communication Signal
  private refreshHistorySource = new Subject<void>();
  public historyRefresh$ = this.refreshHistorySource.asObservable();

  // Map for Unicode conversion
  private unicodeMap: { [key: string]: string } = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\theta': 'θ', '\\pi': 'π', 
    '\\Delta': 'Δ', '\\Sigma': 'Σ', '\\infty': '∞', '\\approx': '≈', 
    '\\neq': '≠', '\\leq': '≤', '\\geq': '≥', '\\pm': '±', '\\rightarrow': '→',
    '\\times': '×', '\\cdot': '⋅'
  };

  constructor(private http: HttpClient, private authService: NbAuthService) {}

  // 2. Trigger Method
  triggerRefresh() {
    this.refreshHistorySource.next();
  }

  // 3. API Calls
  getUserHistory(): Observable<HistoryItem[]> {
    return this.authService.getToken().pipe(
      switchMap((token: NbAuthJWTToken) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token.getValue()}`
        });
        return this.http.get<HistoryItem[]>(this.apiUrl, { headers });
      })
    );
  }

  processText(rawText: string, target: TargetEditor): string {
    if (target === 'LATEX') return rawText;
    if (target === 'MARKDOWN') return rawText;

    return rawText.replace(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g, (match) => {
      const isDisplayMode = match.startsWith('$$');
      const cleanLatex = isDisplayMode ? match.slice(2, -2) : match.slice(1, -1);
      
      try {
        switch (target) {
          case 'OFFICE': return this.convertToMathML(cleanLatex, isDisplayMode);
          case 'GDOCS': return this.convertToHtml(cleanLatex, isDisplayMode);
          case 'UNICODE': return this.convertToUnicode(cleanLatex);
          default: return match;
        }
      } catch (e) {
        return match;
      }
    });
  }

  private convertToMathML(latex: string, displayMode: boolean): string {
    return katex.renderToString(latex, { throwOnError: false, output: 'mathml', displayMode });
  }

  private convertToHtml(latex: string, displayMode: boolean): string {
    return katex.renderToString(latex, { throwOnError: false, output: 'html', displayMode });
  }

  private convertToUnicode(latex: string): string {
    let text = latex;
    Object.keys(this.unicodeMap).forEach(key => {
      const regex = new RegExp(key.replace(/\\/g, '\\\\'), 'g');
      text = text.replace(regex, this.unicodeMap[key]);
    });
    const superscripts: {[k:string]: string} = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
    text = text.replace(/\^([0-9])/g, (_, digit) => superscripts[digit]);
    const subscripts: {[k:string]: string} = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
    text = text.replace(/_([0-9])/g, (_, digit) => subscripts[digit]);
    return text.replace(/[{}]/g, '');
  }
 // 2. Delete Item (Protected)
  deleteItem(id: number): Observable<void> {
    return this.authService.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token.getValue()}`
        });
        return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers });
      })
    );
  }
  // Add this function
deleteHistoryItem(item: any, event: Event) {
  event.stopPropagation(); // Prevent clicking the "Trash" from pasting the text
  
  if (!confirm('Delete this item?')) return;

  this.deleteItem(item.id).subscribe({
    next: () => {
      // Remove it from the list instantly without reloading
      this.triggerRefresh();
    },
    error: (err) => console.error(err)
  });
}
 
  
}