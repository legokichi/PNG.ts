(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PNG = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// oriinal: https://github.com/arian/pngjs
// modified by legokichi.
// chenge:
//   rewrite in typescript
//   chenge zlib library stream.js to jszip(pako)
//   support bitdepth 1
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function uInt8ToBitArray(uint8) {
    return (uint8 + 256).toString(2).split("").slice(1).map(Number);
}
function uInt8ArrayToBits(arr) {
    var result = [];
    for (var i = 0; arr.length > i; i++) {
        result = result.concat(uInt8ToBitArray(arr[i]));
    }
    return result;
}
function bitsToNum(bits) {
    //return bits.slice().reverse().reduce(function(sum,n,i){return sum+Math.pow(2,i)*n},0);
    return parseInt(bits.join(""), 2);
}
function readBits(buffer, bitOffset, bitLength) {
    var _byteOffset = bitOffset / 8 | 0;
    var _bitOffset = bitOffset % 8;
    var _byteLength = bitLength / 8 | 0;
    var _bitLength = bitLength % 8;
    var _buf = buffer.subarray(_byteOffset, _byteOffset + _byteLength + 1);
    return uInt8ArrayToBits(_buf).slice(_bitOffset, _bitOffset + bitLength);
}

var PNG = (function () {
    function PNG() {
        _classCallCheck(this, PNG);

        this.width = 0;
        this.height = 0;
        this.bitDepth = 0;
        this.colorType = 0;
        this.compressionMethod = 0;
        this.filterMethod = 0;
        this.interlaceMethod = 0;
        this.colors = 0;
        this.alpha = false;
        this.pixelBits = 0;
        this.palette = null;
        this.pixels = null;
    }

    _createClass(PNG, [{
        key: "getWidth",
        value: function getWidth() {
            return this.width;
        }
    }, {
        key: "setWidth",
        value: function setWidth(width) {
            this.width = width;
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.height;
        }
    }, {
        key: "setHeight",
        value: function setHeight(height) {
            this.height = height;
        }
    }, {
        key: "getBitDepth",
        value: function getBitDepth() {
            return this.bitDepth;
        }
    }, {
        key: "setBitDepth",
        value: function setBitDepth(bitDepth) {
            if ([1, 2, 4, 8, 16].indexOf(bitDepth) === -1) {
                throw new Error("invalid bith depth " + bitDepth);
            }
            this.bitDepth = bitDepth;
        }
    }, {
        key: "getColorType",
        value: function getColorType() {
            return this.colorType;
        }
    }, {
        key: "setColorType",
        value: function setColorType(colorType) {
            //   Color    Allowed    Interpretation
            //   Type    Bit Depths
            //
            //   0       1,2,4,8,16  Each pixel is a grayscale sample.
            //
            //   2       8,16        Each pixel is an R,G,B triple.
            //
            //   3       1,2,4,8     Each pixel is a palette index;
            //                       a PLTE chunk must appear.
            //
            //   4       8,16        Each pixel is a grayscale sample,
            //                       followed by an alpha sample.
            //
            //   6       8,16        Each pixel is an R,G,B triple,
            //                       followed by an alpha sample.
            var colors = 0,
                alpha = false;
            switch (colorType) {
                case 0:
                    colors = 1;
                    break;
                case 2:
                    colors = 3;
                    break;
                case 3:
                    colors = 1;
                    break;
                case 4:
                    colors = 2;
                    alpha = true;
                    break;
                case 6:
                    colors = 4;
                    alpha = true;
                    break;
                default:
                    throw new Error("invalid color type");
            }
            this.colors = colors;
            this.alpha = alpha;
            this.colorType = colorType;
        }
    }, {
        key: "getCompressionMethod",
        value: function getCompressionMethod() {
            return this.compressionMethod;
        }
    }, {
        key: "setCompressionMethod",
        value: function setCompressionMethod(compressionMethod) {
            if (compressionMethod !== 0) {
                throw new Error("invalid compression method " + compressionMethod);
            }
            this.compressionMethod = compressionMethod;
        }
    }, {
        key: "getFilterMethod",
        value: function getFilterMethod() {
            return this.filterMethod;
        }
    }, {
        key: "setFilterMethod",
        value: function setFilterMethod(filterMethod) {
            if (filterMethod !== 0) {
                throw new Error("invalid filter method " + filterMethod);
            }
            this.filterMethod = filterMethod;
        }
    }, {
        key: "getInterlaceMethod",
        value: function getInterlaceMethod() {
            return this.interlaceMethod;
        }
    }, {
        key: "setInterlaceMethod",
        value: function setInterlaceMethod(interlaceMethod) {
            if (interlaceMethod !== 0 && interlaceMethod !== 1) {
                throw new Error("invalid interlace method " + interlaceMethod);
            }
            this.interlaceMethod = interlaceMethod;
        }
    }, {
        key: "setPalette",
        value: function setPalette(palette) {
            if (palette.length % 3 !== 0) {
                throw new Error("incorrect PLTE chunk length");
            }
            if (palette.length > Math.pow(2, this.bitDepth) * 3) {
                throw new Error("palette has more colors than 2^bitdepth");
            }
            this.palette = palette;
        }
    }, {
        key: "getPalette",
        value: function getPalette() {
            return this.palette;
        }

        /**
         * get the pixel color on a certain location in a normalized way
         * result is an array: [red, green, blue, alpha]
         */
    }, {
        key: "getPixel",
        value: function getPixel(x, y) {
            if (!this.pixels) throw new Error("pixel data is empty");
            if (x >= this.width || y >= this.height) {
                throw new Error("x,y position out of bound");
            }
            var pixels = this.pixels;
            if (this.bitDepth < 8) {
                //console.info(this.colors, this.bitDepth, pixels.length, this.width, this.height)
                var bitspp = this.colors * this.bitDepth; // bit
                var _scanlineLength = pixels.length / this.height; // byte
                var diff = _scanlineLength * 8 - this.width * bitspp; // bit
                var idbit = y * (bitspp * this.width + diff) + bitspp * x; // x, y is zero origin
                switch (this.colorType) {
                    case 0:
                        var tmp = bitsToNum(readBits(pixels, idbit, this.bitDepth));
                        return [tmp, tmp, tmp, 255];
                    case 2:
                        return [bitsToNum(readBits(pixels, idbit, this.bitDepth)), bitsToNum(readBits(pixels, idbit + 1, this.bitDepth)), bitsToNum(readBits(pixels, idbit + 2, this.bitDepth)), 255];
                    case 3:
                        var tmp = bitsToNum(readBits(pixels, idbit, this.bitDepth)) * 3;
                        return [this.palette[tmp + 0], this.palette[tmp + 1], this.palette[tmp + 2], 255];
                    case 4:
                        var tmp = bitsToNum(readBits(pixels, idbit, this.bitDepth));
                        return [tmp, tmp, tmp, bitsToNum(readBits(pixels, idbit + 1, this.bitDepth))];
                    case 6:
                        return [bitsToNum(readBits(pixels, idbit, this.bitDepth)), bitsToNum(readBits(pixels, idbit + 1, this.bitDepth)), bitsToNum(readBits(pixels, idbit + 2, this.bitDepth)), bitsToNum(readBits(pixels, idbit + 3, this.bitDepth))];
                    default:
                        throw new Error("invalid color type: " + this.colorType);
                }
            } else {
                var i = this.colors * this.bitDepth / 8 * (y * this.width + x);
                switch (this.colorType) {
                    case 0:
                        return [pixels[i], pixels[i], pixels[i], 255];
                    case 2:
                        return [pixels[i], pixels[i + 1], pixels[i + 2], 255];
                    case 3:
                        return [this.palette[pixels[i] * 3 + 0], this.palette[pixels[i] * 3 + 1], this.palette[pixels[i] * 3 + 2], 255];
                    case 4:
                        return [pixels[i], pixels[i], pixels[i], pixels[i + 1]];
                    case 6:
                        return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
                    default:
                        throw new Error("invalid color type: " + this.colorType);
                }
            }
        }
    }, {
        key: "getUint8ClampedArray",
        value: function getUint8ClampedArray() {
            var width = this.width;
            var height = this.height;
            var arr = new Uint8ClampedArray(width * height * 4);
            var i = 0;
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var colors = this.getPixel(x, y);
                    arr[i++] = colors[0];
                    arr[i++] = colors[1];
                    arr[i++] = colors[2];
                    arr[i++] = colors[3];
                }
            }
            return arr;
        }
    }]);

    return PNG;
})();

exports["default"] = PNG;
module.exports = exports["default"];
},{}],2:[function(require,module,exports){
// oriinal: https://github.com/arian/pngjs
// modified by legokichi.
// chenge:
//   typescriptnize
//   chenge zlib library stream.js to jszip(pako)
//   support bitdepth 1
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _PNG = require("./PNG");

var _PNG2 = _interopRequireDefault(_PNG);

function equalBytes(a, b) {
    if (a.length != b.length) return false;
    for (var l = a.length; l--;) if (a[l] != b[l]) return false;
    return true;
}
function readUInt32(buffer, offset) {
    return (buffer[offset] << 24) + (buffer[offset + 1] << 16) + (buffer[offset + 2] << 8) + (buffer[offset + 3] << 0);
}
function readUInt16(buffer, offset) {
    return (buffer[offset + 1] << 8) + (buffer[offset] << 0);
}
function readUInt8(buffer, offset) {
    return buffer[offset] << 0;
}
function bufferToString(buffer) {
    var str = '';
    for (var i = 0; i < buffer.length; i++) {
        str += String.fromCharCode(buffer[i]);
    }
    return str;
}

var PNGReader = (function () {
    function PNGReader(data) {
        _classCallCheck(this, PNGReader);

        // bytes buffer
        this.bytes = new Uint8Array(data);
        // current pointer
        this.i = 0;
        this.dataChunks = [];
        // Output object
        this.png = new _PNG2['default']();
    }

    _createClass(PNGReader, [{
        key: 'readBytes',
        value: function readBytes(length) {
            var end = this.i + length;
            if (end > this.bytes.length) {
                throw new Error('Unexpectedly reached end of file');
            }
            var bytes = this.bytes.subarray(this.i, end);
            this.i = end;
            return bytes;
        }

        /**
         * http://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
         */
    }, {
        key: 'decodeHeader',
        value: function decodeHeader() {
            if (this.i !== 0) {
                throw new Error('file pointer should be at 0 to read the header');
            }
            var header = this.readBytes(8);
            if (!equalBytes(header, new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
                throw new Error('invalid PNGReader file (bad signature)');
            }
            this.header = header;
        }

        /**
         * http://www.w3.org/TR/2003/REC-PNG-20031110/#5Chunk-layout
         *
         * length =  4      bytes
         * type   =  4      bytes (IHDR, PLTE, IDAT, IEND or others)
         * chunk  =  length bytes
         * crc    =  4      bytes
         */
    }, {
        key: 'decodeChunk',
        value: function decodeChunk() {
            var length = readUInt32(this.readBytes(4), 0);
            if (length < 0) {
                throw new Error('Bad chunk length ' + (0xFFFFFFFF & length));
            }
            var type = bufferToString(this.readBytes(4));
            var chunk = this.readBytes(length);
            var crc = this.readBytes(4);
            switch (type) {
                case 'IHDR':
                    this.decodeIHDR(chunk);
                    break;
                case 'PLTE':
                    this.decodePLTE(chunk);
                    break;
                case 'IDAT':
                    this.decodeIDAT(chunk);
                    break;
                case 'IEND':
                    this.decodeIEND(chunk);
                    break;
                default:
                    console.warn("PNGReader: ", type, " is not support chunk type.");
                    break;
            }
            return type;
        }

        /**
         * http://www.w3.org/TR/2003/REC-PNG-20031110/#11IHDR
         * http://www.libpng.org/pub/png/spec/1.2/png-1.2-pdg.html#C.IHDR
         *
         * Width               4 bytes
         * Height              4 bytes
         * Bit depth           1 byte
         * Colour type         1 byte
         * Compression method  1 byte
         * Filter method       1 byte
         * Interlace method    1 byte
         */
    }, {
        key: 'decodeIHDR',
        value: function decodeIHDR(chunk) {
            var png = this.png;
            png.setWidth(readUInt32(chunk, 0));
            png.setHeight(readUInt32(chunk, 4));
            png.setBitDepth(readUInt8(chunk, 8));
            png.setColorType(readUInt8(chunk, 9));
            png.setCompressionMethod(readUInt8(chunk, 10));
            png.setFilterMethod(readUInt8(chunk, 11));
            png.setInterlaceMethod(readUInt8(chunk, 12));
        }

        /**
         *
         * http://www.w3.org/TR/PNG/#11PLTE
         */
    }, {
        key: 'decodePLTE',
        value: function decodePLTE(chunk) {
            this.png.setPalette(chunk);
        }

        /**
         * http://www.w3.org/TR/2003/REC-PNG-20031110/#11IDAT
         */
    }, {
        key: 'decodeIDAT',
        value: function decodeIDAT(chunk) {
            // multiple IDAT chunks will concatenated
            this.dataChunks.push(chunk);
        }

        /**
         * http://www.w3.org/TR/2003/REC-PNG-20031110/#11IEND
         */
    }, {
        key: 'decodeIEND',
        value: function decodeIEND(chunk) {}

        /**
         * Uncompress IDAT chunks
         */
    }, {
        key: 'decodePixels',
        value: function decodePixels() {
            var png = this.png;
            var length = 0;
            var i = 0;
            var j = 0;
            var k = 0;
            var l = 0;
            for (l = this.dataChunks.length; l--;) length += this.dataChunks[l].length;
            var data = new Uint8Array(new ArrayBuffer(length));
            for (i = 0, k = 0, l = this.dataChunks.length; i < l; i++) {
                var chunk = this.dataChunks[i];
                for (j = 0; j < chunk.length; j++) data[k++] = chunk[j];
            }
            // http://www.fileformat.info/format/png/corion.htm
            // Deflate-compressed datastreams within PNG are stored in the "zlib"
            // format, which has the structure:
            // Compression method/flags code: 1 byte
            // Additional flags/check bits:   1 byte
            // Compressed data blocks:        n bytes
            // Checksum:                      4 bytes
            var rawdata = data.subarray(2, data.length - 4);
            try {
                var _data = this.deflate(rawdata);
            } catch (err) {
                throw new Error(err || "pako: zlib inflate error");
            }
            if (png.getInterlaceMethod() === 0) {
                this.interlaceNone(_data);
            } else {
                this.interlaceAdam7(_data);
            }
        }

        // Different interlace methods
    }, {
        key: 'interlaceNone',
        value: function interlaceNone(data) {
            var png = this.png;
            if (png.bitDepth < 8) {
                // bits per pixel
                var bitspp = png.colors * png.bitDepth;
                var scanlineLength = data.length / png.height;
                var pixels = new Uint8Array(new ArrayBuffer((scanlineLength - 1) * png.height));
                //console.info(png.bitDepth, png.colors, png.colorType, scanlineLength, bitspp * png.width, png.width, png.height, data.length);
                var offset = 0;
                for (var i = 0; i < data.length; i += scanlineLength) {
                    var scanline = data.subarray(i, i + scanlineLength);
                    var filtertype = readUInt8(scanline, i);
                    var _scanline = scanline.subarray(1, scanline.length);
                    switch (filtertype) {
                        case 0:
                            pixels.set(_scanline, offset);
                            break;
                        default:
                            throw new Error("unsupport filtered scanline: " + filtertype + ":" + offset + ":" + i);
                    }
                    offset += scanlineLength - 1;
                }
            } else {
                // bytes per pixel
                var bpp = Math.max(1, png.colors * png.bitDepth / 8);
                // color bytes per row
                var cpr = bpp * png.width;
                var pixels = new Uint8Array(new ArrayBuffer(bpp * png.width * png.height));
                var offset = 0;
                for (var i = 0; i < data.length; i += cpr + 1) {
                    var scanline = data.subarray(i + 1, i + cpr + 1);
                    var filtertype = readUInt8(data, i);
                    switch (filtertype) {
                        case 0:
                            this.unFilterNone(scanline, pixels, bpp, offset, cpr);
                            break;
                        case 1:
                            this.unFilterSub(scanline, pixels, bpp, offset, cpr);
                            break;
                        case 2:
                            this.unFilterUp(scanline, pixels, bpp, offset, cpr);
                            break;
                        case 3:
                            this.unFilterAverage(scanline, pixels, bpp, offset, cpr);
                            break;
                        case 4:
                            this.unFilterPaeth(scanline, pixels, bpp, offset, cpr);
                            break;
                        default:
                            throw new Error("unkown filtered scanline: " + filtertype + ":" + bpp + ":" + offset + ":" + cpr + ":" + i);
                    }
                    offset += cpr;
                }
            }
            png.pixels = pixels;
        }
    }, {
        key: 'interlaceAdam7',
        value: function interlaceAdam7(data) {
            throw new Error("Adam7 interlacing is not implemented yet");
        }

        // Unfiltering
        /**
         * No filtering, direct copy
         */
    }, {
        key: 'unFilterNone',
        value: function unFilterNone(scanline, pixels, bpp, offset, length) {
            for (var i = 0, to = length; i < to; i++) {
                pixels[offset + i] = scanline[i];
            }
        }

        /**
         * The Sub() filter transmits the difference between each byte and the value
         * of the corresponding byte of the prior pixel.
         * Sub(x) = Raw(x) + Raw(x - bpp)
         */
    }, {
        key: 'unFilterSub',
        value: function unFilterSub(scanline, pixels, bpp, offset, length) {
            var i = 0;
            for (; i < bpp; i++) pixels[offset + i] = scanline[i];
            for (; i < length; i++) {
                // Raw(x) + Raw(x - bpp)
                pixels[offset + i] = scanline[i] + pixels[offset + i - bpp] & 0xFF;
            }
        }

        /**
         * The Up() filter is just like the Sub() filter except that the pixel
         * immediately above the current pixel, rather than just to its left, is used
         * as the predictor.
         * Up(x) = Raw(x) + Prior(x)
         */
    }, {
        key: 'unFilterUp',
        value: function unFilterUp(scanline, pixels, bpp, offset, length) {
            var i = 0;
            var byte;
            var prev;
            // Prior(x) is 0 for all x on the first scanline
            if (offset - length < 0) for (; i < length; i++) {
                pixels[offset + i] = scanline[i];
            } else for (; i < length; i++) {
                // Raw(x)
                byte = scanline[i];
                // Prior(x)
                prev = pixels[offset + i - length];
                pixels[offset + i] = byte + prev & 0xFF;
            }
        }

        /**
         * The Average() filter uses the average of the two neighboring pixels (left
         * and above) to predict the value of a pixel.
         * Average(x) = Raw(x) + floor((Raw(x-bpp)+Prior(x))/2)
         */
    }, {
        key: 'unFilterAverage',
        value: function unFilterAverage(scanline, pixels, bpp, offset, length) {
            var i = 0;
            var byte;
            var prev;
            var prior;
            if (offset - length < 0) {
                // Prior(x) == 0 && Raw(x - bpp) == 0
                for (; i < bpp; i++) {
                    pixels[offset + i] = scanline[i];
                }
                // Prior(x) == 0 && Raw(x - bpp) != 0 (right shift, prevent doubles)
                for (; i < length; i++) {
                    pixels[offset + i] = scanline[i] + (pixels[offset + i - bpp] >> 1) & 0xFF;
                }
            } else {
                // Prior(x) != 0 && Raw(x - bpp) == 0
                for (; i < bpp; i++) {
                    pixels[offset + i] = scanline[i] + (pixels[offset - length + i] >> 1) & 0xFF;
                }
                // Prior(x) != 0 && Raw(x - bpp) != 0
                for (; i < length; i++) {
                    byte = scanline[i];
                    prev = pixels[offset + i - bpp];
                    prior = pixels[offset + i - length];
                    pixels[offset + i] = byte + (prev + prior >> 1) & 0xFF;
                }
            }
        }

        /**
         * The Paeth() filter computes a simple linear function of the three
         * neighboring pixels (left, above, upper left), then chooses as predictor
         * the neighboring pixel closest to the computed value. This technique is due
         * to Alan W. Paeth.
         * Paeth(x) = Raw(x) +
         *            PaethPredictor(Raw(x-bpp), Prior(x), Prior(x-bpp))
         *  function PaethPredictor (a, b, c)
         *  begin
         *       ; a = left, b = above, c = upper left
         *       p := a + b - c        ; initial estimate
         *       pa := abs(p - a)      ; distances to a, b, c
         *       pb := abs(p - b)
         *       pc := abs(p - c)
         *       ; return nearest of a,b,c,
         *       ; breaking ties in order a,b,c.
         *       if pa <= pb AND pa <= pc then return a
         *       else if pb <= pc then return b
         *       else return c
         *  end
         */
    }, {
        key: 'unFilterPaeth',
        value: function unFilterPaeth(scanline, pixels, bpp, offset, length) {
            var i = 0;
            var raw;
            var a;
            var b;
            var c;
            var p;
            var pa;
            var pb;
            var pc;
            var pr;
            if (offset - length < 0) {
                // Prior(x) == 0 && Raw(x - bpp) == 0
                for (; i < bpp; i++) {
                    pixels[offset + i] = scanline[i];
                }
                // Prior(x) == 0 && Raw(x - bpp) != 0
                // paethPredictor(x, 0, 0) is always x
                for (; i < length; i++) {
                    pixels[offset + i] = scanline[i] + pixels[offset + i - bpp] & 0xFF;
                }
            } else {
                // Prior(x) != 0 && Raw(x - bpp) == 0
                // paethPredictor(x, 0, 0) is always x
                for (; i < bpp; i++) {
                    pixels[offset + i] = scanline[i] + pixels[offset + i - length] & 0xFF;
                }
                // Prior(x) != 0 && Raw(x - bpp) != 0
                for (; i < length; i++) {
                    raw = scanline[i];
                    a = pixels[offset + i - bpp];
                    b = pixels[offset + i - length];
                    c = pixels[offset + i - length - bpp];
                    p = a + b - c;
                    pa = Math.abs(p - a);
                    pb = Math.abs(p - b);
                    pc = Math.abs(p - c);
                    if (pa <= pb && pa <= pc) pr = a;else if (pb <= pc) pr = b;else pr = c;
                    pixels[offset + i] = raw + pr & 0xFF;
                }
            }
        }
    }, {
        key: 'parse',
        value: function parse(options) {
            options = options || { data: true };
            this.decodeHeader();
            while (this.i < this.bytes.length) {
                var type = this.decodeChunk();
                // stop after IHDR chunk, or after IEND
                if (type == 'IHDR' && options.data === false || type == 'IEND') break;
            }
            var png = this.png;
            this.decodePixels();
            return this.png;
        }
    }]);

    return PNGReader;
})();

exports['default'] = PNGReader;
module.exports = exports['default'];
},{"./PNG":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _PNGReader = require("./PNGReader");

var _PNGReader2 = _interopRequireDefault(_PNGReader);

var _PNG = require("./PNG");

var _PNG2 = _interopRequireDefault(_PNG);

exports.PNG = _PNG2["default"];
exports.PNGReader = _PNGReader2["default"];
},{"./PNG":1,"./PNGReader":2}]},{},[3])(3)
});