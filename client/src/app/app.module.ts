import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";

import { SvgTsViewerModule } from "./svgts-viewer/svgts-viewer.module";

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, SvgTsViewerModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
