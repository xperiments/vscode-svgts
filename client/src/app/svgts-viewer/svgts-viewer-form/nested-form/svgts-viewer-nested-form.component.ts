import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "svgts-viewer-nested-form",
  templateUrl: "svgts-viewer-nested-form.component.html",
  styles: [".svg2ts__viewerFormSpacer { margin-bottom:8px;};"]
})
export class SvgViewerTsNestedFormComponent {
  @Input("nestedFormGroup")
  public nestedFormGroup: FormGroup;
  isFormGroup(a) {
    return a instanceof FormGroup;
  }

  @Input("nestedFormMeta") public nestedFormMeta: any;
  @Input("nestedFormKey") public nestedFormKey: string;

  compare(A, B) {
    if (A.value instanceof FormGroup) return 1;

    return A.key > B.key ? 1 : -1;
  }
}
