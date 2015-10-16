# PNG.ts
JavaScript PNG decoder written in TypeScript

* fork from [arian/pngjs](https://github.com/arian/pngjs)

## Dependence
* PNG.ts needs DEFLATE library like  [pako](https://github.com/nodeca/pako), [zlib.js](https://github.com/imaya/zlib.js/) or other zlib compatible one.

## Usage

### browser
```html
<script src="../bower_components/jszip/dist/jszip.min.js"></script>
<script src="../dist/PNG.js"></script>
<script>
getBuffer("./Lenna.png").then(function(buffer){
  var reader = new PNG.PNGReader(buffer, {deflate:deflate});
  var reader.deflate = JSZip.compressions.DEFLATE.uncompress;
  var png = reader.parse();
  var decoded = png.getUint8ClampedArray();

  var cnv = document.createElement('canvas');
  var ctx = cnv.getContext('2d');
  var width = cnv.width = png.width;
  var height = cnv.height = png.height;
  var imageData = ctx.getImageData(0, 0, width, height);

  imageData.data.set(decoded);
  ctx.putImageData(imageData, 0, 0);
  document.body.appendChild(cnv);
});

function getBuffer(url){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (ev) {
      var arrayBuffer = xhr.response;
      resolve(arrayBuffer);
    };
    xhr.send(null);
  });
}
</script>

```
### webworker
```javascript
importScript("../bower_components/jszip/dist/jszip.min.js");
importScript("../dist/PNG.js");
self.onmessage = function(ev){
  var buffer = ev.data;
  var reader = new PNG.PNGReader(buffer, {deflate:deflate});
  var reader.deflate = JSZip.compressions.DEFLATE.uncompress;
  var png = reader.parse();
  var decoded = png.getUint8ClampedArray();
  self.postMessage(decoded, [decoded]);
}
```

### commonjs
```javascript
var tmp = require("PNG.ts");
var PNG = tmp.PNG;
var PNGReader = tmp.PNGReader;
```

## Development
```sh
npm install -g bower dtsm http-server
npm run init
npm run build
```

## Document

### PNGReader Class
#### constructor(data: ArrayBuffer): PNGReader
#### parse():PNG

### PNG Class
#### width: number
#### height: number
#### getUint8ClampedArray(): Uint8ClampedArray

## TODO
* interlace png decoder

## related works
* https://github.com/yahoo/pngjs-image
* https://github.com/uupaa/PNG.js
* https://github.com/zdobersek/png.js
* https://github.com/devongovett/png.js
