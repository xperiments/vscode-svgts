import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ClipboardService } from "../services/clipboard.service";
import { getContextMetadata } from "../services/reflection.service";
import { SvgTsViewerIconComponent } from "../svgts-viewer-icon/svgts-viewer-icon.component";

@Component({
  selector: "svgts-viewer-form",
  templateUrl: "./svgts-viewer-form.component.html",
  styleUrls: ["./svgts-viewer-form.component.scss"]
})
export class SvgViewerTsFormComponent {
  public metadata: any;
  @Input() public set dataObject({
    current,
    currentComponent
  }: {
    current: SVG2TSFile;
    currentComponent: SvgTsViewerIconComponent;
  }) {
    const obj = current.contextDefaults;
    this.metadata = getContextMetadata(obj);
    // setup the form
    const formGroup = this.traverse(obj, this.metadata);
    this.form = new FormGroup(formGroup);

    this.form.valueChanges.subscribe(() => {
      // currentComponent.contextDefaults = this.form.value;
      currentComponent.render(this.form.value);
    });
  }
  public form: FormGroup;
  constructor(private _clipboard: ClipboardService) {}
  public traverse(obj, metadata) {
    return Object["entries"](obj).reduce((acc, [key, value]) => {
      if (typeof value === "object") {
        acc[key] = new FormGroup(this.traverse(value, metadata[key]));
      } else {
        acc[key] = new FormControl(metadata[key].value, [Validators.required]);
      }
      return acc;
    }, {});
  }

  onSubmit(form) {}

  public copyToClipboard(value: string | {}) {
    this._clipboard.copy(value);
  }
}
