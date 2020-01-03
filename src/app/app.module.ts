import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopBarComponent } from './content/main-content/top-bar/top-bar.component';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import { ContentComponent } from './content/content.component';
import {ReactiveFormsModule} from '@angular/forms';
import { LeftContentComponent } from './content/left-content/left-content.component';
import { MainContentComponent } from './content/main-content/main-content.component';
import { MainContentTabComponent } from './content/main-content/main-content-tab/main-content-tab.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    ContentComponent,
    LeftContentComponent,
    MainContentComponent,
    MainContentTabComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
