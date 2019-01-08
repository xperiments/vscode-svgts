import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SVGTSExtendedFile } from '../services/icons-data.service';
import { IconsService } from '../services/icons.service';
import { KeyboardService } from '../services/keyboard.service';
import { SvgTsService } from '../services/svg-ts.service';

@Component({
  selector: 'svgts-viewer-icon',
  templateUrl: './svgts-viewer-icon.component.html',
  styleUrls: ['./svgts-viewer-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgTsViewerIconComponent implements OnInit {
  public browsingMode: IconsService['browsingMode'] = 'module';
  public browsingModeSubscription: Subscription;
  @HostBinding('class.-detail') public detail = false;
  @HostBinding('class.-exported') public exported: boolean;
  public iconFile: SVGTSExtendedFile;
  @HostBinding('class.-selected') public selected = false;
  public svgContents: SafeHtml;
  @ViewChild('svgIcon') public svgIcon: ElementRef;

  @Input() public set icon(svgViewerFile: SVGTSExtendedFile) {
    this.iconFile = svgViewerFile;
    this.exported = this.iconFile.exported;
  }

  public get icon() {
    return this.iconFile;
  }

  constructor(
    private _iconService: IconsService,
    private _keyboard: KeyboardService,
    private _svgTs: SvgTsService,
    private _cdr: ChangeDetectorRef
  ) {}

  public deselect() {
    this.selected = false;
    this.icon.selected = false;
    this._iconService.updateSelected();
    this.detectChanges();
  }

  public detectChanges() {
    this.exported = this.iconFile.exported;
    this._cdr.markForCheck();
  }

  public getViewBox() {
    return this._svgTs.viewBoxString(this.iconFile);
  }

  public hide() {
    this.icon.visible = false;
    this.detectChanges();
  }

  public iconClick() {
    if (this.detail) {
      this.detail = false;
      if (this.iconFile.contextDefaults) {
        this.reset();
      }
    }
    this._iconService.currentIconFile = this.icon;
    this._iconService.currentComponent = this;

    if (this._keyboard.cmdDown) {
      this.toggleSelection();
      return;
    }
  }

  public mustShowExportIcon() {
    return this.icon.exported && this.browsingMode === 'module';
  }

  public ngOnInit() {
    this.browsingModeSubscription = this._iconService.browsingMode$.subscribe(mode => {
      this.browsingMode = mode;
      this._cdr.markForCheck();
    });
    this.svgContents = this._svgTs.getInnerHtml(this.iconFile);
  }

  public render(context?: any) {
    this.svgContents = this._svgTs.getInnerHtml(this.iconFile, context);

    this.detectChanges();
  }

  public reset() {
    this.iconFile.context = JSON.parse(JSON.stringify(this.iconFile.contextDefaults));
    this.render();
  }

  public select() {
    this.selected = true;
    this.icon.selected = true;
    this._iconService.updateSelected();
    this.detectChanges();
  }

  public show() {
    this.icon.visible = true;
    this.detectChanges();
  }

  public showDetail() {
    this.detail = true;
  }

  public tint(baseColor?: string, currentColor?: string): any {
    this.svgContents = baseColor
      ? this._svgTs.getTintInnerHtml(this.iconFile, baseColor, currentColor)
      : this._svgTs.getInnerHtml(this.iconFile);

    this.detectChanges();
  }

  public toggleSelection() {
    this.selected = !this.selected;
    this.icon.selected = !this.icon.selected;

    this._iconService.updateSelected();

    if (this.selected) {
      if (this._iconService.selectedAreSingle && this.icon.colorMode === 'single' && !this.icon.contextDefaults) {
        this.tint(this._iconService.baseColor, this._iconService.currentColor);
      }
    } else {
      if (this.icon.colorMode === 'single' && !this.icon.contextDefaults) {
        this.tint();
      }
    }
    this.detectChanges();
  }
}
