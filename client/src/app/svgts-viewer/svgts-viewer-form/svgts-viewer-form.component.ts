import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipboardService } from '../services/clipboard.service';
import { getContextMetadata } from '../services/reflection.service';
import { SvgTsViewerIconComponent } from '../svgts-viewer-icon/svgts-viewer-icon.component';

@Component({
  selector: 'svgts-viewer-form',
  templateUrl: './svgts-viewer-form.component.html'
})
export class SvgViewerTsFormComponent {
  public form: FormGroup;
  public metadata: any;

  @Input()
  public set dataObject({
    current,
    currentComponent
  }: {
    current: SVGTSFile;
    currentComponent: SvgTsViewerIconComponent;
  }) {
    const obj = current.contextDefaults;
    this.metadata = getContextMetadata(obj);
    // setup the form
    const formGroup = this.traverse(obj, this.metadata);
    this.form = new FormGroup(formGroup);

    this.form.valueChanges.subscribe(() => {
      currentComponent.render(this.form.value);
    });
  }

  constructor(private _clipboard: ClipboardService) {}

  public copyToClipboard(value: string | {}) {
    this._clipboard.copy(value);
  }

  public traverse(
    obj: SVGTSFileTreeContext | { [s: string]: {} } | ArrayLike<{}>,
    metadata: { [x: string]: { value: any } }
  ) {
    return Object['entries'](obj).reduce((acc, [key, value]) => {
      if (typeof value === 'object') {
        acc[key] = new FormGroup(this.traverse(value, metadata[key]));
      } else {
        acc[key] = new FormControl(metadata[key].value, [Validators.required]);
      }
      return acc;
    }, {});
  }
}
