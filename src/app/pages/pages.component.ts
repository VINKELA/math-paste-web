import { Component } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  // Point to the SCSS file where we handle the theme colors
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      
      <nb-menu [items]="menu"></nb-menu>

      <div class="split-layout">
        
        <div class="content-pane">
          <router-outlet></router-outlet>
        </div>

        <div class="sidebar-pane">
          <app-history-sidebar></app-history-sidebar>
        </div>

      </div>

    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  menu = MENU_ITEMS;
}