import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

const INPUT_DRAG_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SvgTsDragInputComponent),
  multi: true
};

@Component({
  selector: "svgts-drag-input",
  providers: [INPUT_DRAG_VALUE_ACCESSOR],
  template: `
    <div
      class="svg2ts__textInput"
      contenteditable="true"
      #input
      tabindex="1"
      title="{{ unit }}"
      (input)="change($event)"
      (keypress)="onKeyPress($event)"
    ></div>
  `,
  styles: [
    `
      :host.-block {
        width: 100%;
      }

      .svg2ts__textInput {
        cursor: ew-resize;
        text-wrap: no-wrap;
        color: rgb(198, 200, 200);
      }

      .svg2ts__textInput::selection {
        background: transparent;
        color: #fff;
      }

      .svg2ts__textInput:focus {
        color: #fff;
      }

      .svg2ts__textInput:after {
        content: attr(title);
      }

      .svg2ts__textInput.disabled {
        cursor: not-allowed;
        opacity: 0.5;
        pointer-events: none;
      }
    `
  ]
})
export class SvgTsDragInputComponent implements ControlValueAccessor, OnInit {
  @Input() public unit: string;
  @Input() public decimal = false;
  public onChange: any;
  public onTouched: any;
  @ViewChild("input") private _input: ElementRef;
  private _mouseDown = false;
  private _startPointValue = {
    x: 0,
    y: 0,
    value: null
  };

  private _downBind: (event: MouseEvent) => void;
  private _upBind: () => void;
  private _updateBind: (event: MouseEvent) => void;

  constructor(private renderer: Renderer2) {
    this._downBind = this._down.bind(this);
    this._upBind = this._up.bind(this);
    this._updateBind = this._update.bind(this);
  }

  public ngOnInit() {
    this._input.nativeElement.addEventListener("mousedown", this._downBind);
  }
  public change($event) {
    const value: string = this._input.nativeElement.textContent;
    this.onChange(value);
    this.onTouched(value);
  }

  public writeValue(value: any): void {
    this.renderer.setProperty(this._input.nativeElement, "textContent", value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    const action = isDisabled ? "addClass" : "removeClass";
    this.renderer[action](this._input.nativeElement, "disabled");
  }

  public onKeyPress($event: KeyboardEvent) {
    return $event.which != 13;
  }

  private _down(event: MouseEvent) {
    window.addEventListener("mouseup", this._upBind);
    window.addEventListener("mousemove", this._updateBind);
    this._mouseDown = true;
    this._startPointValue = {
      x: event.clientX,
      y: event.clientY,
      value: parseFloat(this._input.nativeElement.textContent)
    };
  }

  private _up(event) {
    if (this._mouseDown) {
      this.change(event);
      this._mouseDown = false;
      window.removeEventListener("mouseup", this._upBind);
      window.removeEventListener("mousemove", this._updateBind);
      this._startPointValue = {
        x: 0,
        y: 0,
        value: null
      };
    }
    this._mouseDown = false;
  }

  private _update(event: MouseEvent) {
    if (this._mouseDown) {
      const xDiff = event.clientX - this._startPointValue.x;
      const targetValue =
        this._startPointValue.value + xDiff * (this.decimal ? 0.05 : 0.5);
      this.writeValue(
        !this.decimal ? Math.floor(targetValue) : targetValue.toFixed(2)
      );
      this.change(event);
    }
  }
}
