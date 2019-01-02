import { Component, ElementRef, forwardRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'svgts-drag-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SvgTsDragInputComponent),
      multi: true
    }
  ],
  template: `
    <div
      class="svgTs__textInput"
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

      .svgTs__textInput {
        cursor: ew-resize;
        text-wrap: no-wrap;
        color: rgb(198, 200, 200);
      }

      .svgTs__textInput::selection {
        background: transparent;
        color: #fff;
      }

      .svgTs__textInput:focus {
        color: #fff;
      }

      .svgTs__textInput:after {
        content: attr(title);
      }

      .svgTs__textInput.disabled {
        cursor: not-allowed;
        opacity: 0.5;
        pointer-events: none;
      }
    `
  ]
})
export class SvgTsDragInputComponent implements ControlValueAccessor, OnInit {
  @Input() public decimal = false;
  public onChange: any;
  public onTouched: any;
  @Input() public unit: string;
  private _downBind: (event: MouseEvent) => void;
  @ViewChild('input') private _input: ElementRef;
  private _mouseDown = false;
  private _startPointValue = { x: 0, y: 0, value: null };
  private _upBind: () => void;
  private _updateBind: (event: MouseEvent) => void;

  constructor(private _renderer: Renderer2) {
    this._downBind = this._down.bind(this);
    this._upBind = this._up.bind(this);
    this._updateBind = this._update.bind(this);
  }

  public change($event) {
    const value: string = this._input.nativeElement.textContent;
    this.onChange(value);
    this.onTouched(value);
  }

  public ngOnInit() {
    this._input.nativeElement.addEventListener('mousedown', this._downBind);
  }

  public onKeyPress($event: KeyboardEvent) {
    return $event.key.charCodeAt(0) !== 13;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    const action = isDisabled ? 'addClass' : 'removeClass';
    this._renderer[action](this._input.nativeElement, 'disabled');
  }

  public writeValue(value: any): void {
    this._renderer.setProperty(this._input.nativeElement, 'textContent', value);
  }

  private _down(event: MouseEvent) {
    window.addEventListener('mouseup', this._upBind);
    window.addEventListener('mousemove', this._updateBind);
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
      window.removeEventListener('mouseup', this._upBind);
      window.removeEventListener('mousemove', this._updateBind);
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
      const targetValue = this._startPointValue.value + xDiff * (this.decimal ? 0.05 : 0.5);
      this.writeValue(!this.decimal ? Math.floor(targetValue) : targetValue.toFixed(2));
      this.change(event);
    }
  }
}
