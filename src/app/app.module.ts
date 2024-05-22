import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IncomingDialogComponent, RegisterDialogComponent, TopBarComponent} from './content/top-bar/top-bar.component';
import {ContentComponent} from './content/content.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomePageComponent} from './content/home-page/home-page.component';
import {CallRecordComponent} from './content/call-record/call-record.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';

// import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    ContentComponent,
    HomePageComponent,
    CallRecordComponent,
    RegisterDialogComponent,
    IncomingDialogComponent
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
        MatTableModule,
        MatPaginatorModule,
        MatSelectModule,
        MatDialogModule,
        FormsModule,
        MatCheckboxModule,
        // AppRoutingModule
    ],
  providers: [],
  // entryComponents: [HomePageComponent, CallRecordComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
