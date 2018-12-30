import { Component } from '@angular/core';
import { IconsService } from './services/icons.service';
@Component({
  selector: 'svgts-viewer',
  templateUrl: './svgts-viewer.component.html',
  styleUrls: [ './svgts-viewer.component.scss' ]
})
export class SvgTsViewerComponent  {
      constructor(public icons:IconsService){}
}
