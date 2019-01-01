import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'svgts-viewer-nested-form',
  templateUrl: 'svgts-viewer-nested-form.component.html',
  styles: ['.svg2ts__viewerFormSpacer { margin-bottom:8px;}']
})
export class SvgViewerTsNestedFormComponent {
  @Input() public nestedFormGroup: FormGroup;
  @Input() public nestedFormKey: string;
  @Input() public nestedFormMeta: any;

  public compare(formOrGroupA: { key: string; value: any }, formOrGroupB: { key: string }) {
    if (formOrGroupA.value instanceof FormGroup) {
      return 1;
    }

    return formOrGroupA.key > formOrGroupB.key ? 1 : -1;
  }

  public isFormGroup(formGroup: any) {
    return formGroup instanceof FormGroup;
  }
}
