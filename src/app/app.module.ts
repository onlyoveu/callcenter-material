import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TopBarComponent} from './content/top-bar/top-bar.component';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import {ContentComponent} from './content/content.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HomePageComponent} from './content/home-page/home-page.component';
import {CallRecordComponent} from './content/call-record/call-record.component';

// import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    ContentComponent,
    HomePageComponent,
    CallRecordComponent,
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
    MatTabsModule,
    // AppRoutingModule
  ],
  providers: [],
  entryComponents: [HomePageComponent, CallRecordComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
