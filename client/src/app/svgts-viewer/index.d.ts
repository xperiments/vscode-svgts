interface SVGTSDimensions {
  height?: number | undefined;
  minx?: number | undefined;
  miny?: number | undefined;
  width?: number | undefined;
}

interface SVGTSFileTreeContext {
  [key: string]: string | number | SVGTSFileTreeContext;
}

interface SVGTSFile {
  contextDefaults?: SVGTSFileTreeContext | undefined;
  context?: SVGTSFileTreeContext;
  css?: string;
  height?: string | undefined;
  name: string;
  svg: string;
  svgHash: string;
  viewBox?: SVGTSDimensions | undefined;
  width?: string | undefined;
}
