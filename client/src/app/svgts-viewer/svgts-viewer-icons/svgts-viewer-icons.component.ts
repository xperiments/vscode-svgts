import { ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { IconsDataService } from '../services/icons-data.service';
import { IconsService } from '../services/icons.service';
import { SvgTsViewerIconComponent } from '../svgts-viewer-icon/svgts-viewer-icon.component';

@Component({
  selector: 'svgts-viewer-icons',
  templateUrl: './svgts-viewer-icons.component.html',
  styleUrls: ['./svgts-viewer-icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgTsViewerIconsComponent implements AfterViewInit {
  @Input() public gridSize = 5;
  @ViewChildren(SvgTsViewerIconComponent) private _viewList: QueryList<SvgTsViewerIconComponent>;

  constructor(public iconsData: IconsDataService, public iconsService: IconsService) {}

  public fileAdded(event) {
    const targetFile = event.target.files[0];
    if (targetFile.name.indexOf('.svg2ts') !== -1) {
      const reader = new FileReader();
      reader.onload = () => {
        this.iconsData.addExternalFileIcons(JSON.parse(reader.result as string).files);
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  public ngAfterViewInit() {
    this.iconsService.viewList = this._viewList;
  }
}
