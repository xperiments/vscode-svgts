import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SvgTsService } from './svg-ts.service';

export interface SVGTSExtendedFile extends SVGTSFile {
  colorMode: 'single' | 'multiple' | 'bicolor';
  exported: boolean;
  selected: boolean;
  visible: boolean;
}

const loadedIcons = window['svgts'] ? window['svgts'].icons.files : null;
const exportedIcons: string[] = window['svgts'] ? window['svgts'].icons.exports : [];
const moduleName: string = window['svgts'] ? window['svgts'].icons.module : 'vscode-svgts';

@Injectable({
  providedIn: 'root'
})
export class IconsDataService {
  public icons$ = new BehaviorSubject<SVGTSExtendedFile[]>(null);
  public isPluging = false;
  public moduleName = moduleName;

  constructor(private _svgTs: SvgTsService) {
    if (loadedIcons) {
      this.isPluging = true;
      this.icons$.next(this._getExtendedIcons(loadedIcons));
    }
  }

  public addExternalFileIcons(icons: SVGTSExtendedFile[]) {
    this.icons$.next(this._getExtendedIcons(icons));
  }

  private _getExtendedIcons(icons: SVGTSFile[]): SVGTSExtendedFile[] {
    return icons.map(icon => {
      return {
        ...icon,
        colorMode: this._svgTs.determineColorMode(icon),
        visible: true,
        selected: false,
        exported: exportedIcons.includes(icon.name)
      };
    });
  }
}
