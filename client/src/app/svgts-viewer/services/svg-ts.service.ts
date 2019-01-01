import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SvgTsService {
  constructor(private _sanitizer: DomSanitizer) {}

  public determineColorMode(icon: SVGTSFile): 'multiple' | 'single' {
    // tslint:disable-next-line:max-line-length
    const regexp = /rgb[a]?\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen/g;
    const matches = icon.svg.match(regexp);
    return new Set(matches ? matches.map(match => match.replace(/ /g, '')) : null).size > 1 ? 'multiple' : 'single';
  }

  public getInnerHtml(icon: SVGTSFile, context?: any) {
    return this._sanitizer.bypassSecurityTrustHtml(
      this.isDynamic(icon) ? this._getDynamicIcon(icon, context) : icon.svg
    );
  }

  public getTintInnerHtml(icon: SVGTSFile, baseColor: string) {
    const regexp = /rgba\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}/g;
    const matches = icon.svg.match(regexp);
    const colors = new Set(matches ? matches.map(match => match.replace(/ /g, '')) : null).size;
    let svgOutput = '';
    if (colors === 0) {
      svgOutput = `<g fill="${baseColor}">${icon.svg}</g>`;
    } else {
      svgOutput = icon.svg.replace(
        /rgba\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}/g,
        baseColor
      );
    }

    return this._sanitizer.bypassSecurityTrustHtml(svgOutput);
  }

  public isDynamic(icon: SVGTSFile) {
    return icon && icon.contextDefaults ? true : false;
  }

  public viewBoxAttribute(icon: SVGTSFile) {
    return `viewBox="${this.viewBoxString(icon)}"`;
  }

  public viewBoxString(icon: SVGTSFile) {
    const { width, height, minx, miny } = icon.viewBox;
    return `${minx} ${miny} ${width} ${height}`;
  }

  private _getDynamicIcon(iconFile: SVGTSFile, context = JSON.parse(JSON.stringify(iconFile.contextDefaults))) {
    iconFile['context'] = context;

    const foundAttributes = iconFile.svg.match(/\[attr\.(.*?)]="(.*?)"/g);

    let svg = iconFile.svg.replace(
      /\[attr.xlink:href]="getXlinkBase\('(.*?)'\)"/g,
      `xlink:href="#$1-${iconFile.contextDefaults.uuid}"`
    );

    if (foundAttributes) {
      svg = foundAttributes.reduce((acc, value) => {
        const [, attribute, target] = value.match(/\[attr\.(.*?)]="(.*?)"/);

        if (target.indexOf('context.uuid') !== -1 || target === 'viewBox') {
          if (target === 'viewBox') {
            acc = acc.replace(value, this.viewBoxAttribute(iconFile));
          } else {
            acc = acc.replace(/\\'(.+?)\\'\+context.uuid"/g, '$10"');
            acc = acc.replace(/\\'(.+?)\\'\+context.uuid\+\\'(.+?)\\'/gm, '$10$2');
          }
        } else {
          const dest = target.split('.').reduce((o, i) => o[i], iconFile);
          acc = acc.replace(value, `${attribute}="${dest}"`);
        }

        return acc;
      }, svg);
    }

    const foundContexts = svg.match(/{{(.*?)}}/g);
    if (foundContexts) {
      return foundContexts.reduce((acc, value) => {
        const target = value.match(/{{(.*?)}}/)[1];
        const dest = target.split('.').reduce((o, i) => o[i], iconFile);
        return acc.replace(value, dest);
      }, svg);
    }

    svg = svg.replace(/\[attr.(.+?)\]/g, '$1');
    return svg;
  }
}
