import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorModule } from './error/error.module';
import { LocaleSwitcherComponent } from './components/locale-switcher/locale-switcher.component';

@NgModule({
  declarations: [
    AppComponent,
    LocaleSwitcherComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ErrorModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
