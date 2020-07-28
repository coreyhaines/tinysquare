interface TinySquareConfig {
  defaultColor : string,
  defaultSize : string,
  color : Maybe<string>,
  size : Maybe<number>,
  specialColors : Record<string, Array<string>>
}

interface Window { tinySquare: TinySquareConfig }

window.tinySquare = {
  defaultColor: "0F4C81",
  defaultSize : "200",
  color: undefined,
  size: undefined,
  specialColors: {
    "pride":
      [ "#E70000"
      , "#FF8C00"
      , "#FFEF00"
      , "#00811F"
      , "#0044FF"
      , "#760089"
      ]
  }
};

type Maybe<T> = T | undefined;
function maybeMap<T, U>(mv: Maybe<T>, f: (v:T) => U) : Maybe<U> {
  if(mv !== undefined) {
    return f(mv);
  }else{
    return undefined;
  }
}
function maybeBind<T, U>(mv: Maybe<T>, f: (v:T) => Maybe<U>) : Maybe<U> {
  if(mv !== undefined) {
    return f(mv);
  }else{
    return undefined;
  }
}
function withDefault<T>(mv : Maybe<T>, defaultValue : T) : T {
  if(mv === undefined) {
    return defaultValue;
  }else{
    return mv;
  }
}
function maybeFromNullable<T>(v : T | null) : Maybe<T> {
  if(v === null) {
    return undefined;
  }else{
    return v;
  }
}

function withElementById<U>(id : string, func : ( element : HTMLElement ) => U) : U | void {
  return maybeMap(maybeFromNullable(document.getElementById(id)), func);
}


function getColor() : string {
  if(window.tinySquare.color){
    const color= window.tinySquare.color;
    if(color == "pride") {
      return color;
    }else{
      return color.startsWith("#") ? color : "#" + color;
    }
  }else{
    return window.tinySquare.defaultColor;
  }
}
function getSize() : number {
  if(window.tinySquare.size) {
    return window.tinySquare.size;
  }else{
    return 0;
  }
}
function getColorFromParam() : string {
  const urlParams = new URLSearchParams(window.location.search);
  return withDefault(maybeFromNullable(urlParams.get('color')), window.tinySquare.defaultColor);
}
function setColorFromParam() : string {
  window.tinySquare.color = getColorFromParam();
  return getColor();
}
function getColorFromPicker() : string {
  return (<HTMLInputElement>document.getElementById('color-picker')).value;
}
function setColorFromPicker() : string {
  window.tinySquare.color = getColorFromPicker();
  return getColor();
}
function getSizeFromParam() : number {
  const urlParams = new URLSearchParams(window.location.search);
  const size = withDefault(maybeFromNullable(urlParams.get('size')), window.tinySquare.defaultSize);
  return Math.ceil(parseInt(size));
}
function setSizeFromParam()  : number {
  window.tinySquare.size = getSizeFromParam();
  return getSize();
}

function onLoad() {
  const color : string = setColorFromParam();
  const size = setSizeFromParam();
  if(color in window.tinySquare.specialColors) {
    drawSpecialColor(window.tinySquare.specialColors[color], size);
  }else{
    handleSizeAndColor(size, color);
  }
  displayColorAndSize(color, size);
  initializeColorPicker(color);
  displayDataUrl();
  withElementById('download-image-button', (el) => { el.addEventListener("click", downloadTinySquare); });
  withElementById('dataurl-copy-button', (el) => { el.addEventListener("click", copyDataURLToClipboard); });
}

function displayDataUrl() {
  const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
  const dataUrl = canvas.toDataURL();
  const dataUrlTag = <HTMLInputElement> document.getElementById('dataurl');
  dataUrlTag.value = dataUrl;
}

function shouldAutoCopyDataUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('autocopydataurl');
}
function copyDataURLToClipboard() {
  if(navigator.clipboard) {
    const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
    const dataURL : string = canvas.toDataURL();
    navigator.clipboard.writeText(dataURL);
  }
}

function colorPickerChange(e : Event) {
  const color = setColorFromPicker();
  const size = getSize();
  handleSizeAndColor(size, color);
  displayColorAndSize(color, size);
}
function initializeColorPicker(color : string) {
  const colorPicker = <HTMLInputElement> document.getElementById('color-picker');
  if(color === "pride") {
    const parent = colorPicker.parentNode;
    if(parent) {
      parent.removeChild(colorPicker);
    }
  }else{
    colorPicker.value = color;
    colorPicker.addEventListener("input", colorPickerChange);
    withElementById('color-display', (el) => { el.addEventListener('click', function() { colorPicker.click(); }) });
  }
}

function displayColorAndSize(color : string, size : number) {
  withElementById('color-display', (el) => { el.innerText = color });
  withElementById('size-display', (el) => { el.innerText = size.toString() });
}

function drawSpecialColor(colors: Array<string>, size: number) {
  const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx : CanvasRenderingContext2D | null = canvas.getContext('2d', { alpha: false });
  if(ctx) {
    const increment = 1 / colors.length;
    const grd = ctx.createLinearGradient(0,0,0,size);
    for(let i = 0; i < colors.length; i++) {
      const colorStop = i * increment;
      grd.addColorStop(colorStop, colors[i]);
      grd.addColorStop(colorStop + increment - .001, colors[i]);
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0,0, size, size);
  }
}

function handleSizeAndColor(size : number, color : string) {
  const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
  canvas.width = size;
  canvas.height = size;
  if (canvas.getContext) {
    const ctx : CanvasRenderingContext2D | null = canvas.getContext('2d', { alpha: false });
    if(ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, size, size);
      withElementById('dataurl-copy-button', (el) => { el.style.backgroundColor = color}) ;
      withElementById('download-image-button', (el) => { el.style.backgroundColor = color});
      if(shouldAutoCopyDataUrl()){
        copyDataURLToClipboard();
      }
    }
  }
}
function downloadTinySquare(e : Event) {
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const image =  canvas.toDataURL("image/jpg");
  const filename = 'tinysquare-'.concat(getColor(), '-', getSize().toString(), '.png');
  const el = <HTMLAnchorElement> e.target;
  el.download = filename;
  el.href = image;
}
document.addEventListener("DOMContentLoaded", onLoad);
