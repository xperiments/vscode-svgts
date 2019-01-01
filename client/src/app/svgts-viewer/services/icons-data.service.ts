import { Injectable } from '@angular/core';
import { Svg2TsService } from './svg2ts.service';
import { BehaviorSubject } from 'rxjs';

export interface SVG2TSExtendedFile extends SVG2TSFile {
  colorMode: 'single' | 'multiple';
  exported: boolean;
  selected: boolean;
  visible: boolean;
}

const loadedIcons = window['svg2ts'] ? window['svg2ts'].icons.files : null;
const exportedIcons: string[] = window['svg2ts'] ? window['svg2ts'].icons.exports : [];

@Injectable({
  providedIn: 'root'
})
export class IconsDataService {
  public icons$ = new BehaviorSubject<SVG2TSExtendedFile[]>(null);
  public isPluging = false;
  constructor(private _svg2ts: Svg2TsService) {
    if (loadedIcons) {
      this.isPluging = true;
      this.icons$.next(this._getExtendedIcons(loadedIcons));
    }
  }

  public addExternalFileIcons(icons: SVG2TSExtendedFile[]) {
    this.icons$.next(this._getExtendedIcons(icons));
  }

  private _getExtendedIcons(icons: SVG2TSFile[]): SVG2TSExtendedFile[] {
    return icons.map(icon => {
      return {
        ...icon,
        colorMode: this._svg2ts.determineColorMode(icon),
        visible: true,
        selected: false,
        exported: exportedIcons.includes(icon.name)
      };
    });
  }
}
