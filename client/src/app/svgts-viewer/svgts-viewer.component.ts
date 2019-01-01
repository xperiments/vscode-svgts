import { Component } from "@angular/core";
import { IconsService } from "./services/icons.service";
import { IconsDataService } from "./services/icons-data.service";
@Component({
  selector: "svgts-viewer",
  templateUrl: "./svgts-viewer.component.html",
  styleUrls: ["./svgts-viewer.component.scss"]
})
export class SvgTsViewerComponent {
  constructor(public icons: IconsService, public iconsData: IconsDataService) {}
}
