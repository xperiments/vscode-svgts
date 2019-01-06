import { ElementRef, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SVGTSExtendedFile } from './icons-data.service';

@Injectable({
  providedIn: 'root'
})
export class SvgTsService {
  constructor(private _sanitizer: DomSanitizer) {}

  public determineColorMode(icon: SVGTSFile): 'multiple' | 'single' | 'bicolor' {
    // tslint:disable-next-line:max-line-length
    const regexp = /rgb[a]?\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen/g;
    const matches = icon.svg.match(regexp);
    const isMultipleColor = new Set(matches ? matches.map(match => match.replace(/ /g, '')) : null).size > 1;
    const isBicolor = icon.svg.indexOf('"current"') !== -1;
    return isMultipleColor ? 'multiple' : isBicolor ? 'bicolor' : 'single';
  }

  public getIconEncodedUri(iconFile: SVGTSExtendedFile, iconElement: ElementRef) {
    const content = this.getIconSvg(iconFile, iconElement)
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      // tslint:disable-next-line:quotemark
      .replace(/\"/gi, "'")
      .replace(/%/gi, '%25')
      .replace(/#/gi, '%23')
      .replace(/</gi, '%3C')
      .replace(/>/gi, '%3E')
      .replace(/%3E %3C/gi, '%3E%3C');

    return `.${iconFile.name} {
  width: ${iconFile.viewBox.width}px;
  height: ${iconFile.viewBox.height}px;
  background-image: url("data:image/svg+xml;charset=utf8,${content}");
}`;
  }

  public getIconSvg(iconFile: SVGTSExtendedFile, iconElement: ElementRef) {
    return new XMLSerializer()
      .serializeToString(
        iconFile.contextDefaults ? iconElement.nativeElement.querySelector('svg') : iconElement.nativeElement
      )
      .replace(/\s_ngcontent-.+?=(""|"(.+?)?")/g, '');
  }

  public getInnerHtml(icon: SVGTSFile, context?: any) {
    return this._sanitizer.bypassSecurityTrustHtml(
      this.isDynamic(icon) ? this._dynamicIconHtml(icon, context) : this._staticIconHtml(icon)
    );
  }

  public getTintInnerHtml(icon: SVGTSFile, baseColor: string, currentColor?: string) {
    const svg = this._staticIconHtml(icon);
    const regexp = /rgba\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}/g;
    const matches = svg.match(regexp);
    const colors = new Set(matches ? matches.map(match => match.replace(/ /g, '')) : null).size;
    const currentColorStyle = currentColor ? ` color:${currentColor}` : '';
    let svgOutput = '';
    if (colors === 0) {
      svgOutput = `<g style="fill:${baseColor};${currentColorStyle}">${svg}</g>`;
    } else {
      svgOutput = `<g style="fill:${baseColor};${currentColorStyle}">${svg.replace(
        /rgba\((.*?)\)|#[abcdefABCDEF0123456789]{6}|#[abcdefABCDEF0123456789]{3}/g,
        baseColor
      )}</g>`;
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

  private _dynamicIconHtml(iconFile: SVGTSFile, context = JSON.parse(JSON.stringify(iconFile.contextDefaults))) {
    iconFile['context'] = context;
    const svgSource = iconFile.svg;
    const foundAttributes = svgSource.match(/\[attr\.(.*?)]="(.*?)"/g);

    if (foundAttributes) {
      const result = foundAttributes.reduce((svgOutput, foundAttribute) => {
        let targetAttribute = foundAttribute;
        if (targetAttribute.indexOf('context.uuid') !== -1) {
          targetAttribute = targetAttribute
            .replace(/\\'(.+?)\\'\+context.uuid\+\\'(.+?)\\'/gm, '$10$2')
            .replace(/\\'(.+?)\\'\+context.uuid/g, '$10');
        }
        if (targetAttribute.indexOf('getURLBase') !== -1) {
          targetAttribute = targetAttribute.replace(/getURLBase\((.*?)\)/g, 'url($1)');
        }
        const [, attribute, target] = targetAttribute.match(/\[attr\.(.*?)]="(.*?)"/);
        if (attribute === 'viewBox' && target === 'viewBox') {
          svgOutput = svgOutput.replace(foundAttribute, this.viewBoxAttribute(iconFile));
          return svgOutput;
        } else {
          const dest = target.split('.').reduce((o, i) => o[i], iconFile);

          if (dest) {
            svgOutput = svgOutput.replace(foundAttribute, `${attribute}="${dest}"`);
          } else {
            if (attribute === 'class') {
              svgOutput = svgOutput.replace(foundAttribute, `class="${target}"`);
            } else {
              if (target.indexOf('context.') === 0) {
                const destProp = target.split('.').reduce((o, i) => o[i], iconFile);
                svgOutput = svgOutput.replace(foundAttribute, `${attribute}="${destProp}"`);
              } else {
                svgOutput = svgOutput.replace(foundAttribute, `${attribute}="${target.replace(/^context\./, '')}"`);
              }
            }
          }

          return svgOutput;
        }
      }, svgSource);

      const foundContexts = result.match(/{{(.*?)}}/g);
      if (foundContexts) {
        return foundContexts.reduce((acc, value) => {
          const target = value.match(/{{(.*?)}}/)[1].replace(/^context\./, '');
          const dest = target.split('.').reduce((o, i) => o[i], iconFile.context);
          return acc.replace(value, dest as string);
        }, result);
      }

      return result;
    }
    return svgSource;
  }

  private _staticIconHtml(iconFile: SVGTSFile) {
    return iconFile.svg.replace(/{{uuid}}/g, '0').replace('<svg ', `<svg class="${iconFile.svgHash}" `);
  }
}
