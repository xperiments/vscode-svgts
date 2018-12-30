import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList
} from "@angular/core";
import {
  IconsDataService,
  SVG2TSExtendedFile
} from "../services/icons-data.service";
import { IconsService } from "../services/icons.service";
import { filter } from "rxjs/operators";
import { SvgTsViewerIconComponent } from "../svgts-viewer-icon/svgts-viewer-icon.component";

@Component({
  selector: "svgts-viewer-icons",
  templateUrl: "./svgts-viewer-icons.component.html",
  styleUrls: ["./svgts-viewer-icons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgTsViewerIconsComponent {
  @Input() public gridSize = 5;
  @ViewChildren(SvgTsViewerIconComponent) viewList: QueryList<
    SvgTsViewerIconComponent
  >;

  constructor(
    public iconsData: IconsDataService,
    public iconsService: IconsService
  ) {}
  public ngAfterViewInit() {
    this.iconsService.viewList = this.viewList;
  }
}
