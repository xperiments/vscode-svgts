interface SVG2TSDimensions {
  height?: number | undefined;
  minx?: number | undefined;
  miny?: number | undefined;
  width?: number | undefined;
}

interface SVG2TSFileTreeContext { [key: string]: string | number | SVG2TSFileTreeContext }

interface SVG2TSFile {
  contextDefaults?: SVG2TSFileTreeContext | undefined;
  context?: SVG2TSFileTreeContext;
  css?: string;
  height?: string | undefined;
  name: string;
  svg: string;
  svgHash: string;
  viewBox?: SVG2TSDimensions | undefined;
  width?: string | undefined;
}
