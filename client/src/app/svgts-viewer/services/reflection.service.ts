import { cssColors } from "./css-colors";

export type SVG2TSViewerContextUnits =
  | "px"
  | "em"
  | "rem"
  | "vw"
  | "vh"
  | "deg"
  | "%";

export type SVG2TSViewerContextTypes =
  | "integer"
  | "undefined"
  | "float"
  | "color.short"
  | "color.long"
  | "color.name"
  | "rgba"
  | "text.short"
  | "text.long"
  | "child";

export interface SVG2TSViewerContext {
  label: string;
  type: SVG2TSViewerContextTypes;
  unit?: SVG2TSViewerContextUnits;

  range?: {
    min: number;
    max: number;
    step: number;
  };
  value: string | number;
  validation: { required: boolean };
}

const cssColorsNames = Object.keys(cssColors);

function getNumberRange(value, unit) {
  const intValue = parseInt(value, 10);
  const floatValue = parseFloat(value);
  const step = isFloat(value) ? 0.1 : 1;
  switch (true) {
    case unit === "%":
      return { min: 0, max: 100, step };
      break;
    case unit === "deg":
      return { min: 0, max: 360, step };
      break;

    case floatValue < 10:
      return { min: 0, max: intValue * 2, step };
      break;
    case floatValue >= 10 && floatValue < 100:
      return { min: 0, max: intValue * 2, step };
      break;
    case floatValue >= 100 && floatValue < 1000:
      return { min: 0, max: intValue * 2, step: 1 };
      break;
  }
}

function isFloat(n: number) {
  return Number(n) === n && n % 1 !== 0;
}

function isInt(n: number) {
  return Number(n) === n && n % 1 === 0;
}

function traverseTree(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    if (typeof obj[key] !== "object") {
      acc[key] = determineType("" + obj[key], key);
    } else {
      acc[key] = traverseTree(obj[key]);
    }
    return acc;
  }, {});
}

export function determineType(value: string, key: string): SVG2TSViewerContext {
  value += "";
  const units = ["px", "em", "rem", "vw", "vh", "deg", "%"];
  const numberValue = parseInt(value, 10);
  const floatValue = parseFloat(value);
  const isNumber = isInt(numberValue);
  const isFloatNumber = isFloat(floatValue);
  const isNumeric = isNumber || isFloatNumber;
  const unit: SVG2TSViewerContextUnits = value.replace(
    String(
      isNumber && !isFloatNumber
        ? numberValue
        : isFloatNumber
        ? floatValue
        : "-never-"
    ),
    ""
  ) as SVG2TSViewerContextUnits;
  const isNumericUnit = isNumber && units["includes"](unit);
  const isLongColor = /#[abcdefABCDEF0123456789]{6}/.exec(value) ? true : false;
  const isShortColor =
    !isLongColor && /#[abcdefABCDEF0123456789]{3}/.exec(value) ? true : false;
  const isNamedColor = cssColorsNames["includes"](value);
  const isColor = isShortColor || isLongColor || isNamedColor;
  const isRGBA = value.match(/rgba\((.*?)\)/) ? true : false;
  const isString = typeof value === "string" && isNaN(numberValue);

  switch (true) {
    case isNumeric && !isNumericUnit:
      return {
        label: key,
        type: isNumber && !isFloatNumber ? "integer" : "float",
        range: getNumberRange(!isFloatNumber ? numberValue : floatValue, unit),
        value: floatValue,
        validation: { required: true }
      };
      break;
    case isNumeric && isNumericUnit:
      return {
        label: key,
        type: isNumber && !isFloatNumber ? `integer` : `float`,
        unit,
        range: getNumberRange(!isFloatNumber ? numberValue : floatValue, unit),
        value: floatValue,
        validation: { required: true }
      };
      break;
    case isString && isShortColor:
      return {
        label: key,
        type: "color.short",
        value:
          "#" +
          value
            .substr(1)
            .split("")
            .map(_ => _ + _)
            .join(""),
        validation: { required: true }
      };
      break;
    case isString && isLongColor:
      return {
        label: key,
        type: "color.long",
        value,
        validation: { required: true }
      };
      break;
    case isString && isNamedColor:
      return {
        label: key,
        type: "color.name",
        value: cssColors[value],
        validation: { required: true }
      };
      break;
    case isString && isRGBA:
      return {
        label: key,
        type: "rgba",
        value,
        validation: { required: true }
      };
      break;
    case isString && !isRGBA && !isColor && value.length < 30:
      return {
        label: key,
        type: "text.short",
        value,
        validation: { required: true }
      };
      break;
    case isString && !isRGBA && !isLongColor && value.length >= 30:
      return {
        label: key,
        type: "text.long",
        value,
        validation: { required: true }
      };
      break;
    default:
      return {
        label: key,
        type: "text.short",
        value,
        validation: { required: true }
      };
      break;
  }
}

export function getContextMetadata(context: any) {
  return traverseTree(JSON.parse(JSON.stringify(context)));
}
