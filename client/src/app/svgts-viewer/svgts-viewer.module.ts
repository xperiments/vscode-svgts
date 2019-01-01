import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClipboardService } from './services/clipboard.service';
import { IconsDataService } from './services/icons-data.service';
import { IconsService } from './services/icons.service';
import { KeyboardService } from './services/keyboard.service';
import { SvgTsService } from './services/svg-ts.service';
import { SvgTsDragInputComponent } from './svgts-drag-input/svgts-drag-input.component';
import { SvgViewerTsNestedFormComponent } from './svgts-viewer-form/nested-form/svgts-viewer-nested-form.component';
import { SvgViewerTsFormComponent } from './svgts-viewer-form/svgts-viewer-form.component';
import { SvgTsViewerIconComponent } from './svgts-viewer-icon/svgts-viewer-icon.component';
import { SvgTsViewerIconsComponent } from './svgts-viewer-icons/svgts-viewer-icons.component';
import { SvgTsViewerSidebarComponent } from './svgts-viewer-sidebar/svgts-viewer-sidebar.component';
import { SvgTsViewerComponent } from './svgts-viewer.component';

const declarations = [
  SvgTsViewerComponent,
  SvgTsViewerSidebarComponent,
  SvgTsViewerIconComponent,
  SvgTsViewerIconsComponent,
  SvgViewerTsFormComponent,
  SvgViewerTsNestedFormComponent,
  SvgTsDragInputComponent
];

const providers = [KeyboardService, IconsService, IconsDataService, ClipboardService, SvgTsService];

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers,
  declarations,
  exports: declarations
})
export class SvgTsViewerModule {}
