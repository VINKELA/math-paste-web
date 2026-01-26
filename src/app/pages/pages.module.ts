import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { FormatterComponent } from './formatter/formatter.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistorySidebarComponent } from './history-sidebar/history-sidebar.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    NbButtonModule,
    NbCardModule, // Optional, but recommended for blog posts
  ],
  declarations: [
    PagesComponent,
    FormatterComponent,
    HistorySidebarComponent,
    BlogListComponent,
    BlogDetailComponent,  
  ],
})
export class PagesModule {
}
