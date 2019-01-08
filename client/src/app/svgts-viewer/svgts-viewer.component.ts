import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IconsDataService } from './services/icons-data.service';
import { IconsService } from './services/icons.service';
import { VscodeService } from './services/vscode.service';
import { SvgTsViewerIconsComponent } from './svgts-viewer-icons/svgts-viewer-icons.component';

// https://code.visualstudio.com/api/extension-guides/webview

@Component({
  selector: 'svgts-viewer',
  templateUrl: './svgts-viewer.component.html',
  styleUrls: ['./svgts-viewer.component.scss']
})
export class SvgTsViewerComponent implements OnInit {
  @ViewChild('viewerIcons')
  public viewerIcons: SvgTsViewerIconsComponent;
  constructor(public icons: IconsService, public iconsData: IconsDataService, private _vscode: VscodeService) {}

  public ngOnInit() {
    this._vscode.editor.postMessage({ command: 'loaded' });
  }

  @HostListener('window:message', ['$event'])
  public onPostMessage(event: MessageEvent) {
    const message: { command: string; data: any } = event.data;
    if (!message) {
      return;
    }

    switch (message.command) {
      case 'svgts.command.setBrowsingMode': {
        this.icons.setBrowsingMode(message.data as IconsService['browsingMode']);
        break;
      }
      case 'svgts.command.iconDetail': {
        this.viewerIcons.viewList
          .filter(element => {
            return element.iconFile.name === (message.data as string);
          })
          .map(element => {
            element.iconClick();
            element.showDetail();
            element.detectChanges();
          });

        break;
      }
    }
  }
}
