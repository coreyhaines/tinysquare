interface Window { tinySquare: any; }

window.tinySquare = {
  defaultColor: "FF6F61",
  defaultSize : "200",
  color: null,
  size: null,
};
function getColor() : string {
  return window.tinySquare.color;
}
function getSize() : string {
  return window.tinySquare.size;
}

function getColorFromParam() : string {
	const urlParams = new URLSearchParams(window.location.search);
	if(urlParams.has('color')) {
		return urlParams.get('color');
	}else{
		return window.tinySquare.defaultColor;
	}
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
	if(urlParams.has('size')) {
		const size = urlParams.get('size');
		return Math.ceil(parseInt(size));
	}else{
		return parseInt(window.tinySquare.defaultSize);
	}
}
function setSizeFromParam()  : string {
  window.tinySquare.size = getSizeFromParam();
  return getSize();
}

function onLoad() {
  const color : string = setColorFromParam();
  const size = setSizeFromParam();
  handleSizeAndColor(size, color);
}

function shouldAutoCopyDataUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.has('autocopydataurl');
}
function copyDataURLToClipboard() {
	if(navigator.clipboard) {
		const canvas : HTMLCanvasElement= <HTMLCanvasElement> document.getElementById('canvas');
		const dataURL : string = canvas.toDataURL();
		navigator.clipboard.writeText(dataURL);
	}
}

function colorPickerChange(e) {
  const color = setColorFromPicker();
  handleSizeAndColor(getSize(), color);
}
function initializeColorPicker(color) {
  const colorPicker = <HTMLInputElement> document.getElementById('color-picker');
  colorPicker.value = color;
  colorPicker.addEventListener("input", colorPickerChange);
  document.getElementById('color-display').addEventListener('click', function() { document.getElementById('color-picker').click(); });
}

function displayColorAndSize(color, size) {
  document.getElementById('color-display').innerText = color;
  document.getElementById('size-display').innerText = size;
}

function handleSizeAndColor(size, color) {
	const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
  color = color.startsWith("#") ? color : "#" + color;
	canvas.width = size;
	canvas.height = size;
	if (canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: false });
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, size, size);
    displayColorAndSize(color, size);
    initializeColorPicker(color);
		document.getElementById('dataurl-copy-button').style.backgroundColor = color;
		document.getElementById('download-image-button').style.backgroundColor = color;
		const dataUrl = canvas.toDataURL();
		const dataUrlTag = <HTMLInputElement> document.getElementById('dataurl');
		dataUrlTag.value = dataUrl;
		if(shouldAutoCopyDataUrl()){
			copyDataURLToClipboard();
		}
	}
}
function downloadTinySquare(el) {
	const canvas = <HTMLCanvasElement> document.getElementById('canvas');
	const image =  canvas.toDataURL("image/jpg");
	const filename = 'tinysquare-'.concat(getColor(), '-', getSize().toString(), '.png');
	el.download = filename;
	el.href = image;
}
document.addEventListener("DOMContentLoaded", onLoad);
