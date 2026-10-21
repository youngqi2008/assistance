var se = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function et(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function rt(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var n = e.default;
  if (typeof n == "function") {
    var t = function r() {
      return this instanceof r ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    t.prototype = n.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(e).forEach(function(r) {
    var v = Object.getOwnPropertyDescriptor(e, r);
    Object.defineProperty(t, r, v.get ? v : {
      enumerable: !0,
      get: function() {
        return e[r];
      }
    });
  }), t;
}
var D0 = { exports: {} };
function tt(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var b0 = { exports: {} };
const xt = {}, nt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: xt
}, Symbol.toStringTag, { value: "Module" })), ot = /* @__PURE__ */ rt(nt);
var at = b0.exports, Re;
function I() {
  return Re || (Re = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r();
    })(at, function() {
      var t = t || (function(r, v) {
        var B;
        if (typeof window < "u" && window.crypto && (B = window.crypto), typeof self < "u" && self.crypto && (B = self.crypto), typeof globalThis < "u" && globalThis.crypto && (B = globalThis.crypto), !B && typeof window < "u" && window.msCrypto && (B = window.msCrypto), !B && typeof se < "u" && se.crypto && (B = se.crypto), !B && typeof tt == "function")
          try {
            B = ot;
          } catch {
          }
        var y = function() {
          if (B) {
            if (typeof B.getRandomValues == "function")
              try {
                return B.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof B.randomBytes == "function")
              try {
                return B.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, h = Object.create || /* @__PURE__ */ (function() {
          function s() {
          }
          return function(c) {
            var d;
            return s.prototype = c, d = new s(), s.prototype = null, d;
          };
        })(), C = {}, x = C.lib = {}, i = x.Base = /* @__PURE__ */ (function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(s) {
              var c = h(this);
              return s && c.mixIn(s), (!c.hasOwnProperty("init") || this.init === c.init) && (c.init = function() {
                c.$super.init.apply(this, arguments);
              }), c.init.prototype = c, c.$super = this, c;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var s = this.extend();
              return s.init.apply(s, arguments), s;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(s) {
              for (var c in s)
                s.hasOwnProperty(c) && (this[c] = s[c]);
              s.hasOwnProperty("toString") && (this.toString = s.toString);
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        })(), E = x.WordArray = i.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(s, c) {
            s = this.words = s || [], c != v ? this.sigBytes = c : this.sigBytes = s.length * 4;
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(s) {
            return (s || l).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(s) {
            var c = this.words, d = s.words, D = this.sigBytes, b = s.sigBytes;
            if (this.clamp(), D % 4)
              for (var F = 0; F < b; F++) {
                var m = d[F >>> 2] >>> 24 - F % 4 * 8 & 255;
                c[D + F >>> 2] |= m << 24 - (D + F) % 4 * 8;
              }
            else
              for (var _ = 0; _ < b; _ += 4)
                c[D + _ >>> 2] = d[_ >>> 2];
            return this.sigBytes += b, this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var s = this.words, c = this.sigBytes;
            s[c >>> 2] &= 4294967295 << 32 - c % 4 * 8, s.length = r.ceil(c / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var s = i.clone.call(this);
            return s.words = this.words.slice(0), s;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(s) {
            for (var c = [], d = 0; d < s; d += 4)
              c.push(y());
            return new E.init(c, s);
          }
        }), a = C.enc = {}, l = a.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(s) {
            for (var c = s.words, d = s.sigBytes, D = [], b = 0; b < d; b++) {
              var F = c[b >>> 2] >>> 24 - b % 4 * 8 & 255;
              D.push((F >>> 4).toString(16)), D.push((F & 15).toString(16));
            }
            return D.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(s) {
            for (var c = s.length, d = [], D = 0; D < c; D += 2)
              d[D >>> 3] |= parseInt(s.substr(D, 2), 16) << 24 - D % 8 * 4;
            return new E.init(d, c / 2);
          }
        }, u = a.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(s) {
            for (var c = s.words, d = s.sigBytes, D = [], b = 0; b < d; b++) {
              var F = c[b >>> 2] >>> 24 - b % 4 * 8 & 255;
              D.push(String.fromCharCode(F));
            }
            return D.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(s) {
            for (var c = s.length, d = [], D = 0; D < c; D++)
              d[D >>> 2] |= (s.charCodeAt(D) & 255) << 24 - D % 4 * 8;
            return new E.init(d, c);
          }
        }, o = a.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(s) {
            try {
              return decodeURIComponent(escape(u.stringify(s)));
            } catch {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(s) {
            return u.parse(unescape(encodeURIComponent(s)));
          }
        }, f = x.BufferedBlockAlgorithm = i.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new E.init(), this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(s) {
            typeof s == "string" && (s = o.parse(s)), this._data.concat(s), this._nDataBytes += s.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(s) {
            var c, d = this._data, D = d.words, b = d.sigBytes, F = this.blockSize, m = F * 4, _ = b / m;
            s ? _ = r.ceil(_) : _ = r.max((_ | 0) - this._minBufferSize, 0);
            var p = _ * F, g = r.min(p * 4, b);
            if (p) {
              for (var k = 0; k < p; k += F)
                this._doProcessBlock(D, k);
              c = D.splice(0, p), d.sigBytes -= g;
            }
            return new E.init(c, g);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var s = i.clone.call(this);
            return s._data = this._data.clone(), s;
          },
          _minBufferSize: 0
        });
        x.Hasher = f.extend({
          /**
           * Configuration options.
           */
          cfg: i.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(s) {
            this.cfg = this.cfg.extend(s), this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            f.reset.call(this), this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(s) {
            return this._append(s), this._process(), this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(s) {
            s && this._append(s);
            var c = this._doFinalize();
            return c;
          },
          blockSize: 16,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(s) {
            return function(c, d) {
              return new s.init(d).finalize(c);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(s) {
            return function(c, d) {
              return new A.HMAC.init(s, d).finalize(c);
            };
          }
        });
        var A = C.algo = {};
        return C;
      })(Math);
      return t;
    });
  })(b0)), b0.exports;
}
var g0 = { exports: {} }, it = g0.exports, He;
function oe() {
  return He || (He = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(it, function(t) {
      return (function(r) {
        var v = t, B = v.lib, y = B.Base, h = B.WordArray, C = v.x64 = {};
        C.Word = y.extend({
          /**
           * Initializes a newly created 64-bit word.
           *
           * @param {number} high The high 32 bits.
           * @param {number} low The low 32 bits.
           *
           * @example
           *
           *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
           */
          init: function(x, i) {
            this.high = x, this.low = i;
          }
          /**
           * Bitwise NOTs this word.
           *
           * @return {X64Word} A new x64-Word object after negating.
           *
           * @example
           *
           *     var negated = x64Word.not();
           */
          // not: function () {
          // var high = ~this.high;
          // var low = ~this.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ANDs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to AND with this word.
           *
           * @return {X64Word} A new x64-Word object after ANDing.
           *
           * @example
           *
           *     var anded = x64Word.and(anotherX64Word);
           */
          // and: function (word) {
          // var high = this.high & word.high;
          // var low = this.low & word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to OR with this word.
           *
           * @return {X64Word} A new x64-Word object after ORing.
           *
           * @example
           *
           *     var ored = x64Word.or(anotherX64Word);
           */
          // or: function (word) {
          // var high = this.high | word.high;
          // var low = this.low | word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise XORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to XOR with this word.
           *
           * @return {X64Word} A new x64-Word object after XORing.
           *
           * @example
           *
           *     var xored = x64Word.xor(anotherX64Word);
           */
          // xor: function (word) {
          // var high = this.high ^ word.high;
          // var low = this.low ^ word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the left.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftL(25);
           */
          // shiftL: function (n) {
          // if (n < 32) {
          // var high = (this.high << n) | (this.low >>> (32 - n));
          // var low = this.low << n;
          // } else {
          // var high = this.low << (n - 32);
          // var low = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the right.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftR(7);
           */
          // shiftR: function (n) {
          // if (n < 32) {
          // var low = (this.low >>> n) | (this.high << (32 - n));
          // var high = this.high >>> n;
          // } else {
          // var low = this.high >>> (n - 32);
          // var high = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Rotates this word n bits to the left.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotL(25);
           */
          // rotL: function (n) {
          // return this.shiftL(n).or(this.shiftR(64 - n));
          // },
          /**
           * Rotates this word n bits to the right.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotR(7);
           */
          // rotR: function (n) {
          // return this.shiftR(n).or(this.shiftL(64 - n));
          // },
          /**
           * Adds this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to add with this word.
           *
           * @return {X64Word} A new x64-Word object after adding.
           *
           * @example
           *
           *     var added = x64Word.add(anotherX64Word);
           */
          // add: function (word) {
          // var low = (this.low + word.low) | 0;
          // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
          // var high = (this.high + word.high + carry) | 0;
          // return X64Word.create(high, low);
          // }
        }), C.WordArray = y.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.x64.WordArray.create();
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ]);
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ], 10);
           */
          init: function(x, i) {
            x = this.words = x || [], i != r ? this.sigBytes = i : this.sigBytes = x.length * 8;
          },
          /**
           * Converts this 64-bit word array to a 32-bit word array.
           *
           * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
           *
           * @example
           *
           *     var x32WordArray = x64WordArray.toX32();
           */
          toX32: function() {
            for (var x = this.words, i = x.length, E = [], a = 0; a < i; a++) {
              var l = x[a];
              E.push(l.high), E.push(l.low);
            }
            return h.create(E, this.sigBytes);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {X64WordArray} The clone.
           *
           * @example
           *
           *     var clone = x64WordArray.clone();
           */
          clone: function() {
            for (var x = y.clone.call(this), i = x.words = this.words.slice(0), E = i.length, a = 0; a < E; a++)
              i[a] = i[a].clone();
            return x;
          }
        });
      })(), t;
    });
  })(g0)), g0.exports;
}
var y0 = { exports: {} }, st = y0.exports, Pe;
function ct() {
  return Pe || (Pe = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(st, function(t) {
      return (function() {
        if (typeof ArrayBuffer == "function") {
          var r = t, v = r.lib, B = v.WordArray, y = B.init, h = B.init = function(C) {
            if (C instanceof ArrayBuffer && (C = new Uint8Array(C)), (C instanceof Int8Array || typeof Uint8ClampedArray < "u" && C instanceof Uint8ClampedArray || C instanceof Int16Array || C instanceof Uint16Array || C instanceof Int32Array || C instanceof Uint32Array || C instanceof Float32Array || C instanceof Float64Array) && (C = new Uint8Array(C.buffer, C.byteOffset, C.byteLength)), C instanceof Uint8Array) {
              for (var x = C.byteLength, i = [], E = 0; E < x; E++)
                i[E >>> 2] |= C[E] << 24 - E % 4 * 8;
              y.call(this, i, x);
            } else
              y.apply(this, arguments);
          };
          h.prototype = B;
        }
      })(), t.lib.WordArray;
    });
  })(y0)), y0.exports;
}
var m0 = { exports: {} }, ft = m0.exports, ze;
function ut() {
  return ze || (ze = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(ft, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = r.enc;
        y.Utf16 = y.Utf16BE = {
          /**
           * Converts a word array to a UTF-16 BE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 BE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
           */
          stringify: function(C) {
            for (var x = C.words, i = C.sigBytes, E = [], a = 0; a < i; a += 2) {
              var l = x[a >>> 2] >>> 16 - a % 4 * 8 & 65535;
              E.push(String.fromCharCode(l));
            }
            return E.join("");
          },
          /**
           * Converts a UTF-16 BE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 BE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
           */
          parse: function(C) {
            for (var x = C.length, i = [], E = 0; E < x; E++)
              i[E >>> 1] |= C.charCodeAt(E) << 16 - E % 2 * 16;
            return B.create(i, x * 2);
          }
        }, y.Utf16LE = {
          /**
           * Converts a word array to a UTF-16 LE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 LE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
           */
          stringify: function(C) {
            for (var x = C.words, i = C.sigBytes, E = [], a = 0; a < i; a += 2) {
              var l = h(x[a >>> 2] >>> 16 - a % 4 * 8 & 65535);
              E.push(String.fromCharCode(l));
            }
            return E.join("");
          },
          /**
           * Converts a UTF-16 LE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 LE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
           */
          parse: function(C) {
            for (var x = C.length, i = [], E = 0; E < x; E++)
              i[E >>> 1] |= h(C.charCodeAt(E) << 16 - E % 2 * 16);
            return B.create(i, x * 2);
          }
        };
        function h(C) {
          return C << 8 & 4278255360 | C >>> 8 & 16711935;
        }
      })(), t.enc.Utf16;
    });
  })(m0)), m0.exports;
}
var _0 = { exports: {} }, dt = _0.exports, Te;
function n0() {
  return Te || (Te = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(dt, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = r.enc;
        y.Base64 = {
          /**
           * Converts a word array to a Base64 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Base64 string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
           */
          stringify: function(C) {
            var x = C.words, i = C.sigBytes, E = this._map;
            C.clamp();
            for (var a = [], l = 0; l < i; l += 3)
              for (var u = x[l >>> 2] >>> 24 - l % 4 * 8 & 255, o = x[l + 1 >>> 2] >>> 24 - (l + 1) % 4 * 8 & 255, f = x[l + 2 >>> 2] >>> 24 - (l + 2) % 4 * 8 & 255, A = u << 16 | o << 8 | f, s = 0; s < 4 && l + s * 0.75 < i; s++)
                a.push(E.charAt(A >>> 6 * (3 - s) & 63));
            var c = E.charAt(64);
            if (c)
              for (; a.length % 4; )
                a.push(c);
            return a.join("");
          },
          /**
           * Converts a Base64 string to a word array.
           *
           * @param {string} base64Str The Base64 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
           */
          parse: function(C) {
            var x = C.length, i = this._map, E = this._reverseMap;
            if (!E) {
              E = this._reverseMap = [];
              for (var a = 0; a < i.length; a++)
                E[i.charCodeAt(a)] = a;
            }
            var l = i.charAt(64);
            if (l) {
              var u = C.indexOf(l);
              u !== -1 && (x = u);
            }
            return h(C, x, E);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function h(C, x, i) {
          for (var E = [], a = 0, l = 0; l < x; l++)
            if (l % 4) {
              var u = i[C.charCodeAt(l - 1)] << l % 4 * 2, o = i[C.charCodeAt(l)] >>> 6 - l % 4 * 2, f = u | o;
              E[a >>> 2] |= f << 24 - a % 4 * 8, a++;
            }
          return B.create(E, a);
        }
      })(), t.enc.Base64;
    });
  })(_0)), _0.exports;
}
var S0 = { exports: {} }, lt = S0.exports, $e;
function vt() {
  return $e || ($e = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(lt, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = r.enc;
        y.Base64url = {
          /**
           * Converts a word array to a Base64url string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {string} The Base64url string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
           */
          stringify: function(C, x) {
            x === void 0 && (x = !0);
            var i = C.words, E = C.sigBytes, a = x ? this._safe_map : this._map;
            C.clamp();
            for (var l = [], u = 0; u < E; u += 3)
              for (var o = i[u >>> 2] >>> 24 - u % 4 * 8 & 255, f = i[u + 1 >>> 2] >>> 24 - (u + 1) % 4 * 8 & 255, A = i[u + 2 >>> 2] >>> 24 - (u + 2) % 4 * 8 & 255, s = o << 16 | f << 8 | A, c = 0; c < 4 && u + c * 0.75 < E; c++)
                l.push(a.charAt(s >>> 6 * (3 - c) & 63));
            var d = a.charAt(64);
            if (d)
              for (; l.length % 4; )
                l.push(d);
            return l.join("");
          },
          /**
           * Converts a Base64url string to a word array.
           *
           * @param {string} base64Str The Base64url string.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
           */
          parse: function(C, x) {
            x === void 0 && (x = !0);
            var i = C.length, E = x ? this._safe_map : this._map, a = this._reverseMap;
            if (!a) {
              a = this._reverseMap = [];
              for (var l = 0; l < E.length; l++)
                a[E.charCodeAt(l)] = l;
            }
            var u = E.charAt(64);
            if (u) {
              var o = C.indexOf(u);
              o !== -1 && (i = o);
            }
            return h(C, i, a);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function h(C, x, i) {
          for (var E = [], a = 0, l = 0; l < x; l++)
            if (l % 4) {
              var u = i[C.charCodeAt(l - 1)] << l % 4 * 2, o = i[C.charCodeAt(l)] >>> 6 - l % 4 * 2, f = u | o;
              E[a >>> 2] |= f << 24 - a % 4 * 8, a++;
            }
          return B.create(E, a);
        }
      })(), t.enc.Base64url;
    });
  })(S0)), S0.exports;
}
var w0 = { exports: {} }, ht = w0.exports, Le;
function o0() {
  return Le || (Le = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(ht, function(t) {
      return (function(r) {
        var v = t, B = v.lib, y = B.WordArray, h = B.Hasher, C = v.algo, x = [];
        (function() {
          for (var o = 0; o < 64; o++)
            x[o] = r.abs(r.sin(o + 1)) * 4294967296 | 0;
        })();
        var i = C.MD5 = h.extend({
          _doReset: function() {
            this._hash = new y.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(o, f) {
            for (var A = 0; A < 16; A++) {
              var s = f + A, c = o[s];
              o[s] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
            }
            var d = this._hash.words, D = o[f + 0], b = o[f + 1], F = o[f + 2], m = o[f + 3], _ = o[f + 4], p = o[f + 5], g = o[f + 6], k = o[f + 7], w = o[f + 8], T = o[f + 9], $ = o[f + 10], z = o[f + 11], L = o[f + 12], O = o[f + 13], N = o[f + 14], q = o[f + 15], S = d[0], H = d[1], P = d[2], R = d[3];
            S = E(S, H, P, R, D, 7, x[0]), R = E(R, S, H, P, b, 12, x[1]), P = E(P, R, S, H, F, 17, x[2]), H = E(H, P, R, S, m, 22, x[3]), S = E(S, H, P, R, _, 7, x[4]), R = E(R, S, H, P, p, 12, x[5]), P = E(P, R, S, H, g, 17, x[6]), H = E(H, P, R, S, k, 22, x[7]), S = E(S, H, P, R, w, 7, x[8]), R = E(R, S, H, P, T, 12, x[9]), P = E(P, R, S, H, $, 17, x[10]), H = E(H, P, R, S, z, 22, x[11]), S = E(S, H, P, R, L, 7, x[12]), R = E(R, S, H, P, O, 12, x[13]), P = E(P, R, S, H, N, 17, x[14]), H = E(H, P, R, S, q, 22, x[15]), S = a(S, H, P, R, b, 5, x[16]), R = a(R, S, H, P, g, 9, x[17]), P = a(P, R, S, H, z, 14, x[18]), H = a(H, P, R, S, D, 20, x[19]), S = a(S, H, P, R, p, 5, x[20]), R = a(R, S, H, P, $, 9, x[21]), P = a(P, R, S, H, q, 14, x[22]), H = a(H, P, R, S, _, 20, x[23]), S = a(S, H, P, R, T, 5, x[24]), R = a(R, S, H, P, N, 9, x[25]), P = a(P, R, S, H, m, 14, x[26]), H = a(H, P, R, S, w, 20, x[27]), S = a(S, H, P, R, O, 5, x[28]), R = a(R, S, H, P, F, 9, x[29]), P = a(P, R, S, H, k, 14, x[30]), H = a(H, P, R, S, L, 20, x[31]), S = l(S, H, P, R, p, 4, x[32]), R = l(R, S, H, P, w, 11, x[33]), P = l(P, R, S, H, z, 16, x[34]), H = l(H, P, R, S, N, 23, x[35]), S = l(S, H, P, R, b, 4, x[36]), R = l(R, S, H, P, _, 11, x[37]), P = l(P, R, S, H, k, 16, x[38]), H = l(H, P, R, S, $, 23, x[39]), S = l(S, H, P, R, O, 4, x[40]), R = l(R, S, H, P, D, 11, x[41]), P = l(P, R, S, H, m, 16, x[42]), H = l(H, P, R, S, g, 23, x[43]), S = l(S, H, P, R, T, 4, x[44]), R = l(R, S, H, P, L, 11, x[45]), P = l(P, R, S, H, q, 16, x[46]), H = l(H, P, R, S, F, 23, x[47]), S = u(S, H, P, R, D, 6, x[48]), R = u(R, S, H, P, k, 10, x[49]), P = u(P, R, S, H, N, 15, x[50]), H = u(H, P, R, S, p, 21, x[51]), S = u(S, H, P, R, L, 6, x[52]), R = u(R, S, H, P, m, 10, x[53]), P = u(P, R, S, H, $, 15, x[54]), H = u(H, P, R, S, b, 21, x[55]), S = u(S, H, P, R, w, 6, x[56]), R = u(R, S, H, P, q, 10, x[57]), P = u(P, R, S, H, g, 15, x[58]), H = u(H, P, R, S, O, 21, x[59]), S = u(S, H, P, R, _, 6, x[60]), R = u(R, S, H, P, z, 10, x[61]), P = u(P, R, S, H, F, 15, x[62]), H = u(H, P, R, S, T, 21, x[63]), d[0] = d[0] + S | 0, d[1] = d[1] + H | 0, d[2] = d[2] + P | 0, d[3] = d[3] + R | 0;
          },
          _doFinalize: function() {
            var o = this._data, f = o.words, A = this._nDataBytes * 8, s = o.sigBytes * 8;
            f[s >>> 5] |= 128 << 24 - s % 32;
            var c = r.floor(A / 4294967296), d = A;
            f[(s + 64 >>> 9 << 4) + 15] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360, f[(s + 64 >>> 9 << 4) + 14] = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360, o.sigBytes = (f.length + 1) * 4, this._process();
            for (var D = this._hash, b = D.words, F = 0; F < 4; F++) {
              var m = b[F];
              b[F] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360;
            }
            return D;
          },
          clone: function() {
            var o = h.clone.call(this);
            return o._hash = this._hash.clone(), o;
          }
        });
        function E(o, f, A, s, c, d, D) {
          var b = o + (f & A | ~f & s) + c + D;
          return (b << d | b >>> 32 - d) + f;
        }
        function a(o, f, A, s, c, d, D) {
          var b = o + (f & s | A & ~s) + c + D;
          return (b << d | b >>> 32 - d) + f;
        }
        function l(o, f, A, s, c, d, D) {
          var b = o + (f ^ A ^ s) + c + D;
          return (b << d | b >>> 32 - d) + f;
        }
        function u(o, f, A, s, c, d, D) {
          var b = o + (A ^ (f | ~s)) + c + D;
          return (b << d | b >>> 32 - d) + f;
        }
        v.MD5 = h._createHelper(i), v.HmacMD5 = h._createHmacHelper(i);
      })(Math), t.MD5;
    });
  })(w0)), w0.exports;
}
var k0 = { exports: {} }, At = k0.exports, Ue;
function Dr() {
  return Ue || (Ue = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(At, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = v.Hasher, h = r.algo, C = [], x = h.SHA1 = y.extend({
          _doReset: function() {
            this._hash = new B.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(i, E) {
            for (var a = this._hash.words, l = a[0], u = a[1], o = a[2], f = a[3], A = a[4], s = 0; s < 80; s++) {
              if (s < 16)
                C[s] = i[E + s] | 0;
              else {
                var c = C[s - 3] ^ C[s - 8] ^ C[s - 14] ^ C[s - 16];
                C[s] = c << 1 | c >>> 31;
              }
              var d = (l << 5 | l >>> 27) + A + C[s];
              s < 20 ? d += (u & o | ~u & f) + 1518500249 : s < 40 ? d += (u ^ o ^ f) + 1859775393 : s < 60 ? d += (u & o | u & f | o & f) - 1894007588 : d += (u ^ o ^ f) - 899497514, A = f, f = o, o = u << 30 | u >>> 2, u = l, l = d;
            }
            a[0] = a[0] + l | 0, a[1] = a[1] + u | 0, a[2] = a[2] + o | 0, a[3] = a[3] + f | 0, a[4] = a[4] + A | 0;
          },
          _doFinalize: function() {
            var i = this._data, E = i.words, a = this._nDataBytes * 8, l = i.sigBytes * 8;
            return E[l >>> 5] |= 128 << 24 - l % 32, E[(l + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296), E[(l + 64 >>> 9 << 4) + 15] = a, i.sigBytes = E.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var i = y.clone.call(this);
            return i._hash = this._hash.clone(), i;
          }
        });
        r.SHA1 = y._createHelper(x), r.HmacSHA1 = y._createHmacHelper(x);
      })(), t.SHA1;
    });
  })(k0)), k0.exports;
}
var R0 = { exports: {} }, Ct = R0.exports, Ie;
function ve() {
  return Ie || (Ie = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(Ct, function(t) {
      return (function(r) {
        var v = t, B = v.lib, y = B.WordArray, h = B.Hasher, C = v.algo, x = [], i = [];
        (function() {
          function l(A) {
            for (var s = r.sqrt(A), c = 2; c <= s; c++)
              if (!(A % c))
                return !1;
            return !0;
          }
          function u(A) {
            return (A - (A | 0)) * 4294967296 | 0;
          }
          for (var o = 2, f = 0; f < 64; )
            l(o) && (f < 8 && (x[f] = u(r.pow(o, 1 / 2))), i[f] = u(r.pow(o, 1 / 3)), f++), o++;
        })();
        var E = [], a = C.SHA256 = h.extend({
          _doReset: function() {
            this._hash = new y.init(x.slice(0));
          },
          _doProcessBlock: function(l, u) {
            for (var o = this._hash.words, f = o[0], A = o[1], s = o[2], c = o[3], d = o[4], D = o[5], b = o[6], F = o[7], m = 0; m < 64; m++) {
              if (m < 16)
                E[m] = l[u + m] | 0;
              else {
                var _ = E[m - 15], p = (_ << 25 | _ >>> 7) ^ (_ << 14 | _ >>> 18) ^ _ >>> 3, g = E[m - 2], k = (g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10;
                E[m] = p + E[m - 7] + k + E[m - 16];
              }
              var w = d & D ^ ~d & b, T = f & A ^ f & s ^ A & s, $ = (f << 30 | f >>> 2) ^ (f << 19 | f >>> 13) ^ (f << 10 | f >>> 22), z = (d << 26 | d >>> 6) ^ (d << 21 | d >>> 11) ^ (d << 7 | d >>> 25), L = F + z + w + i[m] + E[m], O = $ + T;
              F = b, b = D, D = d, d = c + L | 0, c = s, s = A, A = f, f = L + O | 0;
            }
            o[0] = o[0] + f | 0, o[1] = o[1] + A | 0, o[2] = o[2] + s | 0, o[3] = o[3] + c | 0, o[4] = o[4] + d | 0, o[5] = o[5] + D | 0, o[6] = o[6] + b | 0, o[7] = o[7] + F | 0;
          },
          _doFinalize: function() {
            var l = this._data, u = l.words, o = this._nDataBytes * 8, f = l.sigBytes * 8;
            return u[f >>> 5] |= 128 << 24 - f % 32, u[(f + 64 >>> 9 << 4) + 14] = r.floor(o / 4294967296), u[(f + 64 >>> 9 << 4) + 15] = o, l.sigBytes = u.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var l = h.clone.call(this);
            return l._hash = this._hash.clone(), l;
          }
        });
        v.SHA256 = h._createHelper(a), v.HmacSHA256 = h._createHmacHelper(a);
      })(Math), t.SHA256;
    });
  })(R0)), R0.exports;
}
var H0 = { exports: {} }, Bt = H0.exports, Oe;
function Et() {
  return Oe || (Oe = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), ve());
    })(Bt, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = r.algo, h = y.SHA256, C = y.SHA224 = h.extend({
          _doReset: function() {
            this._hash = new B.init([
              3238371032,
              914150663,
              812702999,
              4144912697,
              4290775857,
              1750603025,
              1694076839,
              3204075428
            ]);
          },
          _doFinalize: function() {
            var x = h._doFinalize.call(this);
            return x.sigBytes -= 4, x;
          }
        });
        r.SHA224 = h._createHelper(C), r.HmacSHA224 = h._createHmacHelper(C);
      })(), t.SHA224;
    });
  })(H0)), H0.exports;
}
var P0 = { exports: {} }, pt = P0.exports, qe;
function br() {
  return qe || (qe = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), oe());
    })(pt, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.Hasher, y = r.x64, h = y.Word, C = y.WordArray, x = r.algo;
        function i() {
          return h.create.apply(h, arguments);
        }
        var E = [
          i(1116352408, 3609767458),
          i(1899447441, 602891725),
          i(3049323471, 3964484399),
          i(3921009573, 2173295548),
          i(961987163, 4081628472),
          i(1508970993, 3053834265),
          i(2453635748, 2937671579),
          i(2870763221, 3664609560),
          i(3624381080, 2734883394),
          i(310598401, 1164996542),
          i(607225278, 1323610764),
          i(1426881987, 3590304994),
          i(1925078388, 4068182383),
          i(2162078206, 991336113),
          i(2614888103, 633803317),
          i(3248222580, 3479774868),
          i(3835390401, 2666613458),
          i(4022224774, 944711139),
          i(264347078, 2341262773),
          i(604807628, 2007800933),
          i(770255983, 1495990901),
          i(1249150122, 1856431235),
          i(1555081692, 3175218132),
          i(1996064986, 2198950837),
          i(2554220882, 3999719339),
          i(2821834349, 766784016),
          i(2952996808, 2566594879),
          i(3210313671, 3203337956),
          i(3336571891, 1034457026),
          i(3584528711, 2466948901),
          i(113926993, 3758326383),
          i(338241895, 168717936),
          i(666307205, 1188179964),
          i(773529912, 1546045734),
          i(1294757372, 1522805485),
          i(1396182291, 2643833823),
          i(1695183700, 2343527390),
          i(1986661051, 1014477480),
          i(2177026350, 1206759142),
          i(2456956037, 344077627),
          i(2730485921, 1290863460),
          i(2820302411, 3158454273),
          i(3259730800, 3505952657),
          i(3345764771, 106217008),
          i(3516065817, 3606008344),
          i(3600352804, 1432725776),
          i(4094571909, 1467031594),
          i(275423344, 851169720),
          i(430227734, 3100823752),
          i(506948616, 1363258195),
          i(659060556, 3750685593),
          i(883997877, 3785050280),
          i(958139571, 3318307427),
          i(1322822218, 3812723403),
          i(1537002063, 2003034995),
          i(1747873779, 3602036899),
          i(1955562222, 1575990012),
          i(2024104815, 1125592928),
          i(2227730452, 2716904306),
          i(2361852424, 442776044),
          i(2428436474, 593698344),
          i(2756734187, 3733110249),
          i(3204031479, 2999351573),
          i(3329325298, 3815920427),
          i(3391569614, 3928383900),
          i(3515267271, 566280711),
          i(3940187606, 3454069534),
          i(4118630271, 4000239992),
          i(116418474, 1914138554),
          i(174292421, 2731055270),
          i(289380356, 3203993006),
          i(460393269, 320620315),
          i(685471733, 587496836),
          i(852142971, 1086792851),
          i(1017036298, 365543100),
          i(1126000580, 2618297676),
          i(1288033470, 3409855158),
          i(1501505948, 4234509866),
          i(1607167915, 987167468),
          i(1816402316, 1246189591)
        ], a = [];
        (function() {
          for (var u = 0; u < 80; u++)
            a[u] = i();
        })();
        var l = x.SHA512 = B.extend({
          _doReset: function() {
            this._hash = new C.init([
              new h.init(1779033703, 4089235720),
              new h.init(3144134277, 2227873595),
              new h.init(1013904242, 4271175723),
              new h.init(2773480762, 1595750129),
              new h.init(1359893119, 2917565137),
              new h.init(2600822924, 725511199),
              new h.init(528734635, 4215389547),
              new h.init(1541459225, 327033209)
            ]);
          },
          _doProcessBlock: function(u, o) {
            for (var f = this._hash.words, A = f[0], s = f[1], c = f[2], d = f[3], D = f[4], b = f[5], F = f[6], m = f[7], _ = A.high, p = A.low, g = s.high, k = s.low, w = c.high, T = c.low, $ = d.high, z = d.low, L = D.high, O = D.low, N = b.high, q = b.low, S = F.high, H = F.low, P = m.high, R = m.low, W = _, M = p, G = g, U = k, u0 = w, a0 = T, ae = $, d0 = z, Q = L, X = O, E0 = N, l0 = q, p0 = S, v0 = H, ie = P, h0 = R, J = 0; J < 80; J++) {
              var Z, r0, F0 = a[J];
              if (J < 16)
                r0 = F0.high = u[o + J * 2] | 0, Z = F0.low = u[o + J * 2 + 1] | 0;
              else {
                var Ee = a[J - 15], i0 = Ee.high, A0 = Ee.low, qr = (i0 >>> 1 | A0 << 31) ^ (i0 >>> 8 | A0 << 24) ^ i0 >>> 7, pe = (A0 >>> 1 | i0 << 31) ^ (A0 >>> 8 | i0 << 24) ^ (A0 >>> 7 | i0 << 25), Fe = a[J - 2], s0 = Fe.high, C0 = Fe.low, Nr = (s0 >>> 19 | C0 << 13) ^ (s0 << 3 | C0 >>> 29) ^ s0 >>> 6, De = (C0 >>> 19 | s0 << 13) ^ (C0 << 3 | s0 >>> 29) ^ (C0 >>> 6 | s0 << 26), be = a[J - 7], Mr = be.high, Wr = be.low, ge = a[J - 16], Kr = ge.high, ye = ge.low;
                Z = pe + Wr, r0 = qr + Mr + (Z >>> 0 < pe >>> 0 ? 1 : 0), Z = Z + De, r0 = r0 + Nr + (Z >>> 0 < De >>> 0 ? 1 : 0), Z = Z + ye, r0 = r0 + Kr + (Z >>> 0 < ye >>> 0 ? 1 : 0), F0.high = r0, F0.low = Z;
              }
              var jr = Q & E0 ^ ~Q & p0, me = X & l0 ^ ~X & v0, Gr = W & G ^ W & u0 ^ G & u0, Xr = M & U ^ M & a0 ^ U & a0, Yr = (W >>> 28 | M << 4) ^ (W << 30 | M >>> 2) ^ (W << 25 | M >>> 7), _e = (M >>> 28 | W << 4) ^ (M << 30 | W >>> 2) ^ (M << 25 | W >>> 7), Zr = (Q >>> 14 | X << 18) ^ (Q >>> 18 | X << 14) ^ (Q << 23 | X >>> 9), Vr = (X >>> 14 | Q << 18) ^ (X >>> 18 | Q << 14) ^ (X << 23 | Q >>> 9), Se = E[J], Qr = Se.high, we = Se.low, Y = h0 + Vr, t0 = ie + Zr + (Y >>> 0 < h0 >>> 0 ? 1 : 0), Y = Y + me, t0 = t0 + jr + (Y >>> 0 < me >>> 0 ? 1 : 0), Y = Y + we, t0 = t0 + Qr + (Y >>> 0 < we >>> 0 ? 1 : 0), Y = Y + Z, t0 = t0 + r0 + (Y >>> 0 < Z >>> 0 ? 1 : 0), ke = _e + Xr, Jr = Yr + Gr + (ke >>> 0 < _e >>> 0 ? 1 : 0);
              ie = p0, h0 = v0, p0 = E0, v0 = l0, E0 = Q, l0 = X, X = d0 + Y | 0, Q = ae + t0 + (X >>> 0 < d0 >>> 0 ? 1 : 0) | 0, ae = u0, d0 = a0, u0 = G, a0 = U, G = W, U = M, M = Y + ke | 0, W = t0 + Jr + (M >>> 0 < Y >>> 0 ? 1 : 0) | 0;
            }
            p = A.low = p + M, A.high = _ + W + (p >>> 0 < M >>> 0 ? 1 : 0), k = s.low = k + U, s.high = g + G + (k >>> 0 < U >>> 0 ? 1 : 0), T = c.low = T + a0, c.high = w + u0 + (T >>> 0 < a0 >>> 0 ? 1 : 0), z = d.low = z + d0, d.high = $ + ae + (z >>> 0 < d0 >>> 0 ? 1 : 0), O = D.low = O + X, D.high = L + Q + (O >>> 0 < X >>> 0 ? 1 : 0), q = b.low = q + l0, b.high = N + E0 + (q >>> 0 < l0 >>> 0 ? 1 : 0), H = F.low = H + v0, F.high = S + p0 + (H >>> 0 < v0 >>> 0 ? 1 : 0), R = m.low = R + h0, m.high = P + ie + (R >>> 0 < h0 >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var u = this._data, o = u.words, f = this._nDataBytes * 8, A = u.sigBytes * 8;
            o[A >>> 5] |= 128 << 24 - A % 32, o[(A + 128 >>> 10 << 5) + 30] = Math.floor(f / 4294967296), o[(A + 128 >>> 10 << 5) + 31] = f, u.sigBytes = o.length * 4, this._process();
            var s = this._hash.toX32();
            return s;
          },
          clone: function() {
            var u = B.clone.call(this);
            return u._hash = this._hash.clone(), u;
          },
          blockSize: 1024 / 32
        });
        r.SHA512 = B._createHelper(l), r.HmacSHA512 = B._createHmacHelper(l);
      })(), t.SHA512;
    });
  })(P0)), P0.exports;
}
var z0 = { exports: {} }, Ft = z0.exports, Ne;
function Dt() {
  return Ne || (Ne = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), oe(), br());
    })(Ft, function(t) {
      return (function() {
        var r = t, v = r.x64, B = v.Word, y = v.WordArray, h = r.algo, C = h.SHA512, x = h.SHA384 = C.extend({
          _doReset: function() {
            this._hash = new y.init([
              new B.init(3418070365, 3238371032),
              new B.init(1654270250, 914150663),
              new B.init(2438529370, 812702999),
              new B.init(355462360, 4144912697),
              new B.init(1731405415, 4290775857),
              new B.init(2394180231, 1750603025),
              new B.init(3675008525, 1694076839),
              new B.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var i = C._doFinalize.call(this);
            return i.sigBytes -= 16, i;
          }
        });
        r.SHA384 = C._createHelper(x), r.HmacSHA384 = C._createHmacHelper(x);
      })(), t.SHA384;
    });
  })(z0)), z0.exports;
}
var T0 = { exports: {} }, bt = T0.exports, Me;
function gt() {
  return Me || (Me = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), oe());
    })(bt, function(t) {
      return (function(r) {
        var v = t, B = v.lib, y = B.WordArray, h = B.Hasher, C = v.x64, x = C.Word, i = v.algo, E = [], a = [], l = [];
        (function() {
          for (var f = 1, A = 0, s = 0; s < 24; s++) {
            E[f + 5 * A] = (s + 1) * (s + 2) / 2 % 64;
            var c = A % 5, d = (2 * f + 3 * A) % 5;
            f = c, A = d;
          }
          for (var f = 0; f < 5; f++)
            for (var A = 0; A < 5; A++)
              a[f + 5 * A] = A + (2 * f + 3 * A) % 5 * 5;
          for (var D = 1, b = 0; b < 24; b++) {
            for (var F = 0, m = 0, _ = 0; _ < 7; _++) {
              if (D & 1) {
                var p = (1 << _) - 1;
                p < 32 ? m ^= 1 << p : F ^= 1 << p - 32;
              }
              D & 128 ? D = D << 1 ^ 113 : D <<= 1;
            }
            l[b] = x.create(F, m);
          }
        })();
        var u = [];
        (function() {
          for (var f = 0; f < 25; f++)
            u[f] = x.create();
        })();
        var o = i.SHA3 = h.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: h.cfg.extend({
            outputLength: 512
          }),
          _doReset: function() {
            for (var f = this._state = [], A = 0; A < 25; A++)
              f[A] = new x.init();
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(f, A) {
            for (var s = this._state, c = this.blockSize / 2, d = 0; d < c; d++) {
              var D = f[A + 2 * d], b = f[A + 2 * d + 1];
              D = (D << 8 | D >>> 24) & 16711935 | (D << 24 | D >>> 8) & 4278255360, b = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360;
              var F = s[d];
              F.high ^= b, F.low ^= D;
            }
            for (var m = 0; m < 24; m++) {
              for (var _ = 0; _ < 5; _++) {
                for (var p = 0, g = 0, k = 0; k < 5; k++) {
                  var F = s[_ + 5 * k];
                  p ^= F.high, g ^= F.low;
                }
                var w = u[_];
                w.high = p, w.low = g;
              }
              for (var _ = 0; _ < 5; _++)
                for (var T = u[(_ + 4) % 5], $ = u[(_ + 1) % 5], z = $.high, L = $.low, p = T.high ^ (z << 1 | L >>> 31), g = T.low ^ (L << 1 | z >>> 31), k = 0; k < 5; k++) {
                  var F = s[_ + 5 * k];
                  F.high ^= p, F.low ^= g;
                }
              for (var O = 1; O < 25; O++) {
                var p, g, F = s[O], N = F.high, q = F.low, S = E[O];
                S < 32 ? (p = N << S | q >>> 32 - S, g = q << S | N >>> 32 - S) : (p = q << S - 32 | N >>> 64 - S, g = N << S - 32 | q >>> 64 - S);
                var H = u[a[O]];
                H.high = p, H.low = g;
              }
              var P = u[0], R = s[0];
              P.high = R.high, P.low = R.low;
              for (var _ = 0; _ < 5; _++)
                for (var k = 0; k < 5; k++) {
                  var O = _ + 5 * k, F = s[O], W = u[O], M = u[(_ + 1) % 5 + 5 * k], G = u[(_ + 2) % 5 + 5 * k];
                  F.high = W.high ^ ~M.high & G.high, F.low = W.low ^ ~M.low & G.low;
                }
              var F = s[0], U = l[m];
              F.high ^= U.high, F.low ^= U.low;
            }
          },
          _doFinalize: function() {
            var f = this._data, A = f.words;
            this._nDataBytes * 8;
            var s = f.sigBytes * 8, c = this.blockSize * 32;
            A[s >>> 5] |= 1 << 24 - s % 32, A[(r.ceil((s + 1) / c) * c >>> 5) - 1] |= 128, f.sigBytes = A.length * 4, this._process();
            for (var d = this._state, D = this.cfg.outputLength / 8, b = D / 8, F = [], m = 0; m < b; m++) {
              var _ = d[m], p = _.high, g = _.low;
              p = (p << 8 | p >>> 24) & 16711935 | (p << 24 | p >>> 8) & 4278255360, g = (g << 8 | g >>> 24) & 16711935 | (g << 24 | g >>> 8) & 4278255360, F.push(g), F.push(p);
            }
            return new y.init(F, D);
          },
          clone: function() {
            for (var f = h.clone.call(this), A = f._state = this._state.slice(0), s = 0; s < 25; s++)
              A[s] = A[s].clone();
            return f;
          }
        });
        v.SHA3 = h._createHelper(o), v.HmacSHA3 = h._createHmacHelper(o);
      })(Math), t.SHA3;
    });
  })(T0)), T0.exports;
}
var $0 = { exports: {} }, yt = $0.exports, We;
function mt() {
  return We || (We = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(yt, function(t) {
      /** @preserve
      			(c) 2012 by Cédric Mesnil. All rights reserved.
      
      			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
      
      			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
      
      			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      			*/
      return (function(r) {
        var v = t, B = v.lib, y = B.WordArray, h = B.Hasher, C = v.algo, x = y.create([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13
        ]), i = y.create([
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11
        ]), E = y.create([
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6
        ]), a = y.create([
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11
        ]), l = y.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), u = y.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), o = C.RIPEMD160 = h.extend({
          _doReset: function() {
            this._hash = y.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(b, F) {
            for (var m = 0; m < 16; m++) {
              var _ = F + m, p = b[_];
              b[_] = (p << 8 | p >>> 24) & 16711935 | (p << 24 | p >>> 8) & 4278255360;
            }
            var g = this._hash.words, k = l.words, w = u.words, T = x.words, $ = i.words, z = E.words, L = a.words, O, N, q, S, H, P, R, W, M, G;
            P = O = g[0], R = N = g[1], W = q = g[2], M = S = g[3], G = H = g[4];
            for (var U, m = 0; m < 80; m += 1)
              U = O + b[F + T[m]] | 0, m < 16 ? U += f(N, q, S) + k[0] : m < 32 ? U += A(N, q, S) + k[1] : m < 48 ? U += s(N, q, S) + k[2] : m < 64 ? U += c(N, q, S) + k[3] : U += d(N, q, S) + k[4], U = U | 0, U = D(U, z[m]), U = U + H | 0, O = H, H = S, S = D(q, 10), q = N, N = U, U = P + b[F + $[m]] | 0, m < 16 ? U += d(R, W, M) + w[0] : m < 32 ? U += c(R, W, M) + w[1] : m < 48 ? U += s(R, W, M) + w[2] : m < 64 ? U += A(R, W, M) + w[3] : U += f(R, W, M) + w[4], U = U | 0, U = D(U, L[m]), U = U + G | 0, P = G, G = M, M = D(W, 10), W = R, R = U;
            U = g[1] + q + M | 0, g[1] = g[2] + S + G | 0, g[2] = g[3] + H + P | 0, g[3] = g[4] + O + R | 0, g[4] = g[0] + N + W | 0, g[0] = U;
          },
          _doFinalize: function() {
            var b = this._data, F = b.words, m = this._nDataBytes * 8, _ = b.sigBytes * 8;
            F[_ >>> 5] |= 128 << 24 - _ % 32, F[(_ + 64 >>> 9 << 4) + 14] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360, b.sigBytes = (F.length + 1) * 4, this._process();
            for (var p = this._hash, g = p.words, k = 0; k < 5; k++) {
              var w = g[k];
              g[k] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360;
            }
            return p;
          },
          clone: function() {
            var b = h.clone.call(this);
            return b._hash = this._hash.clone(), b;
          }
        });
        function f(b, F, m) {
          return b ^ F ^ m;
        }
        function A(b, F, m) {
          return b & F | ~b & m;
        }
        function s(b, F, m) {
          return (b | ~F) ^ m;
        }
        function c(b, F, m) {
          return b & m | F & ~m;
        }
        function d(b, F, m) {
          return b ^ (F | ~m);
        }
        function D(b, F) {
          return b << F | b >>> 32 - F;
        }
        v.RIPEMD160 = h._createHelper(o), v.HmacRIPEMD160 = h._createHmacHelper(o);
      })(), t.RIPEMD160;
    });
  })($0)), $0.exports;
}
var L0 = { exports: {} }, _t = L0.exports, Ke;
function he() {
  return Ke || (Ke = 1, (function(e, n) {
    (function(t, r) {
      e.exports = r(I());
    })(_t, function(t) {
      (function() {
        var r = t, v = r.lib, B = v.Base, y = r.enc, h = y.Utf8, C = r.algo;
        C.HMAC = B.extend({
          /**
           * Initializes a newly created HMAC.
           *
           * @param {Hasher} hasher The hash algorithm to use.
           * @param {WordArray|string} key The secret key.
           *
           * @example
           *
           *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
           */
          init: function(x, i) {
            x = this._hasher = new x.init(), typeof i == "string" && (i = h.parse(i));
            var E = x.blockSize, a = E * 4;
            i.sigBytes > a && (i = x.finalize(i)), i.clamp();
            for (var l = this._oKey = i.clone(), u = this._iKey = i.clone(), o = l.words, f = u.words, A = 0; A < E; A++)
              o[A] ^= 1549556828, f[A] ^= 909522486;
            l.sigBytes = u.sigBytes = a, this.reset();
          },
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: function() {
            var x = this._hasher;
            x.reset(), x.update(this._iKey);
          },
          /**
           * Updates this HMAC with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {HMAC} This HMAC instance.
           *
           * @example
           *
           *     hmacHasher.update('message');
           *     hmacHasher.update(wordArray);
           */
          update: function(x) {
            return this._hasher.update(x), this;
          },
          /**
           * Finalizes the HMAC computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The HMAC.
           *
           * @example
           *
           *     var hmac = hmacHasher.finalize();
           *     var hmac = hmacHasher.finalize('message');
           *     var hmac = hmacHasher.finalize(wordArray);
           */
          finalize: function(x) {
            var i = this._hasher, E = i.finalize(x);
            i.reset();
            var a = i.finalize(this._oKey.clone().concat(E));
            return a;
          }
        });
      })();
    });
  })(L0)), L0.exports;
}
var U0 = { exports: {} }, St = U0.exports, je;
function wt() {
  return je || (je = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), ve(), he());
    })(St, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.Base, y = v.WordArray, h = r.algo, C = h.SHA256, x = h.HMAC, i = h.PBKDF2 = B.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: B.extend({
            keySize: 128 / 32,
            hasher: C,
            iterations: 25e4
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.PBKDF2.create();
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
           */
          init: function(E) {
            this.cfg = this.cfg.extend(E);
          },
          /**
           * Computes the Password-Based Key Derivation Function 2.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(E, a) {
            for (var l = this.cfg, u = x.create(l.hasher, E), o = y.create(), f = y.create([1]), A = o.words, s = f.words, c = l.keySize, d = l.iterations; A.length < c; ) {
              var D = u.update(a).finalize(f);
              u.reset();
              for (var b = D.words, F = b.length, m = D, _ = 1; _ < d; _++) {
                m = u.finalize(m), u.reset();
                for (var p = m.words, g = 0; g < F; g++)
                  b[g] ^= p[g];
              }
              o.concat(D), s[0]++;
            }
            return o.sigBytes = c * 4, o;
          }
        });
        r.PBKDF2 = function(E, a, l) {
          return i.create(l).compute(E, a);
        };
      })(), t.PBKDF2;
    });
  })(U0)), U0.exports;
}
var I0 = { exports: {} }, kt = I0.exports, Ge;
function x0() {
  return Ge || (Ge = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), Dr(), he());
    })(kt, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.Base, y = v.WordArray, h = r.algo, C = h.MD5, x = h.EvpKDF = B.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: B.extend({
            keySize: 128 / 32,
            hasher: C,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.EvpKDF.create();
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
           */
          init: function(i) {
            this.cfg = this.cfg.extend(i);
          },
          /**
           * Derives a key from a password.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(i, E) {
            for (var a, l = this.cfg, u = l.hasher.create(), o = y.create(), f = o.words, A = l.keySize, s = l.iterations; f.length < A; ) {
              a && u.update(a), a = u.update(i).finalize(E), u.reset();
              for (var c = 1; c < s; c++)
                a = u.finalize(a), u.reset();
              o.concat(a);
            }
            return o.sigBytes = A * 4, o;
          }
        });
        r.EvpKDF = function(i, E, a) {
          return x.create(a).compute(i, E);
        };
      })(), t.EvpKDF;
    });
  })(I0)), I0.exports;
}
var O0 = { exports: {} }, Rt = O0.exports, Xe;
function K() {
  return Xe || (Xe = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), x0());
    })(Rt, function(t) {
      t.lib.Cipher || (function(r) {
        var v = t, B = v.lib, y = B.Base, h = B.WordArray, C = B.BufferedBlockAlgorithm, x = v.enc;
        x.Utf8;
        var i = x.Base64, E = v.algo, a = E.EvpKDF, l = B.Cipher = C.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: y.extend(),
          /**
           * Creates this cipher in encryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
           */
          createEncryptor: function(p, g) {
            return this.create(this._ENC_XFORM_MODE, p, g);
          },
          /**
           * Creates this cipher in decryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
           */
          createDecryptor: function(p, g) {
            return this.create(this._DEC_XFORM_MODE, p, g);
          },
          /**
           * Initializes a newly created cipher.
           *
           * @param {number} xformMode Either the encryption or decryption transormation mode constant.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
           */
          init: function(p, g, k) {
            this.cfg = this.cfg.extend(k), this._xformMode = p, this._key = g, this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            C.reset.call(this), this._doReset();
          },
          /**
           * Adds data to be encrypted or decrypted.
           *
           * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
           *
           * @return {WordArray} The data after processing.
           *
           * @example
           *
           *     var encrypted = cipher.process('data');
           *     var encrypted = cipher.process(wordArray);
           */
          process: function(p) {
            return this._append(p), this._process();
          },
          /**
           * Finalizes the encryption or decryption process.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
           *
           * @return {WordArray} The data after final processing.
           *
           * @example
           *
           *     var encrypted = cipher.finalize();
           *     var encrypted = cipher.finalize('data');
           *     var encrypted = cipher.finalize(wordArray);
           */
          finalize: function(p) {
            p && this._append(p);
            var g = this._doFinalize();
            return g;
          },
          keySize: 128 / 32,
          ivSize: 128 / 32,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          /**
           * Creates shortcut functions to a cipher's object interface.
           *
           * @param {Cipher} cipher The cipher to create a helper for.
           *
           * @return {Object} An object with encrypt and decrypt shortcut functions.
           *
           * @static
           *
           * @example
           *
           *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
           */
          _createHelper: /* @__PURE__ */ (function() {
            function p(g) {
              return typeof g == "string" ? _ : b;
            }
            return function(g) {
              return {
                encrypt: function(k, w, T) {
                  return p(w).encrypt(g, k, w, T);
                },
                decrypt: function(k, w, T) {
                  return p(w).decrypt(g, k, w, T);
                }
              };
            };
          })()
        });
        B.StreamCipher = l.extend({
          _doFinalize: function() {
            var p = this._process(!0);
            return p;
          },
          blockSize: 1
        });
        var u = v.mode = {}, o = B.BlockCipherMode = y.extend({
          /**
           * Creates this mode for encryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
           */
          createEncryptor: function(p, g) {
            return this.Encryptor.create(p, g);
          },
          /**
           * Creates this mode for decryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
           */
          createDecryptor: function(p, g) {
            return this.Decryptor.create(p, g);
          },
          /**
           * Initializes a newly created mode.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
           */
          init: function(p, g) {
            this._cipher = p, this._iv = g;
          }
        }), f = u.CBC = (function() {
          var p = o.extend();
          p.Encryptor = p.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(k, w) {
              var T = this._cipher, $ = T.blockSize;
              g.call(this, k, w, $), T.encryptBlock(k, w), this._prevBlock = k.slice(w, w + $);
            }
          }), p.Decryptor = p.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(k, w) {
              var T = this._cipher, $ = T.blockSize, z = k.slice(w, w + $);
              T.decryptBlock(k, w), g.call(this, k, w, $), this._prevBlock = z;
            }
          });
          function g(k, w, T) {
            var $, z = this._iv;
            z ? ($ = z, this._iv = r) : $ = this._prevBlock;
            for (var L = 0; L < T; L++)
              k[w + L] ^= $[L];
          }
          return p;
        })(), A = v.pad = {}, s = A.Pkcs7 = {
          /**
           * Pads data using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to pad.
           * @param {number} blockSize The multiple that the data should be padded to.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
           */
          pad: function(p, g) {
            for (var k = g * 4, w = k - p.sigBytes % k, T = w << 24 | w << 16 | w << 8 | w, $ = [], z = 0; z < w; z += 4)
              $.push(T);
            var L = h.create($, w);
            p.concat(L);
          },
          /**
           * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to unpad.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.unpad(wordArray);
           */
          unpad: function(p) {
            var g = p.words[p.sigBytes - 1 >>> 2] & 255;
            p.sigBytes -= g;
          }
        };
        B.BlockCipher = l.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: l.cfg.extend({
            mode: f,
            padding: s
          }),
          reset: function() {
            var p;
            l.reset.call(this);
            var g = this.cfg, k = g.iv, w = g.mode;
            this._xformMode == this._ENC_XFORM_MODE ? p = w.createEncryptor : (p = w.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == p ? this._mode.init(this, k && k.words) : (this._mode = p.call(w, this, k && k.words), this._mode.__creator = p);
          },
          _doProcessBlock: function(p, g) {
            this._mode.processBlock(p, g);
          },
          _doFinalize: function() {
            var p, g = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (g.pad(this._data, this.blockSize), p = this._process(!0)) : (p = this._process(!0), g.unpad(p)), p;
          },
          blockSize: 128 / 32
        });
        var c = B.CipherParams = y.extend({
          /**
           * Initializes a newly created cipher params object.
           *
           * @param {Object} cipherParams An object with any of the possible cipher parameters.
           *
           * @example
           *
           *     var cipherParams = CryptoJS.lib.CipherParams.create({
           *         ciphertext: ciphertextWordArray,
           *         key: keyWordArray,
           *         iv: ivWordArray,
           *         salt: saltWordArray,
           *         algorithm: CryptoJS.algo.AES,
           *         mode: CryptoJS.mode.CBC,
           *         padding: CryptoJS.pad.PKCS7,
           *         blockSize: 4,
           *         formatter: CryptoJS.format.OpenSSL
           *     });
           */
          init: function(p) {
            this.mixIn(p);
          },
          /**
           * Converts this cipher params object to a string.
           *
           * @param {Format} formatter (Optional) The formatting strategy to use.
           *
           * @return {string} The stringified cipher params.
           *
           * @throws Error If neither the formatter nor the default formatter is set.
           *
           * @example
           *
           *     var string = cipherParams + '';
           *     var string = cipherParams.toString();
           *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
           */
          toString: function(p) {
            return (p || this.formatter).stringify(this);
          }
        }), d = v.format = {}, D = d.OpenSSL = {
          /**
           * Converts a cipher params object to an OpenSSL-compatible string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The OpenSSL-compatible string.
           *
           * @static
           *
           * @example
           *
           *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
           */
          stringify: function(p) {
            var g, k = p.ciphertext, w = p.salt;
            return w ? g = h.create([1398893684, 1701076831]).concat(w).concat(k) : g = k, g.toString(i);
          },
          /**
           * Converts an OpenSSL-compatible string to a cipher params object.
           *
           * @param {string} openSSLStr The OpenSSL-compatible string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
           */
          parse: function(p) {
            var g, k = i.parse(p), w = k.words;
            return w[0] == 1398893684 && w[1] == 1701076831 && (g = h.create(w.slice(2, 4)), w.splice(0, 4), k.sigBytes -= 16), c.create({ ciphertext: k, salt: g });
          }
        }, b = B.SerializableCipher = y.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: y.extend({
            format: D
          }),
          /**
           * Encrypts a message.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(p, g, k, w) {
            w = this.cfg.extend(w);
            var T = p.createEncryptor(k, w), $ = T.finalize(g), z = T.cfg;
            return c.create({
              ciphertext: $,
              key: k,
              iv: z.iv,
              algorithm: p,
              mode: z.mode,
              padding: z.padding,
              blockSize: p.blockSize,
              formatter: w.format
            });
          },
          /**
           * Decrypts serialized ciphertext.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(p, g, k, w) {
            w = this.cfg.extend(w), g = this._parse(g, w.format);
            var T = p.createDecryptor(k, w).finalize(g.ciphertext);
            return T;
          },
          /**
           * Converts serialized ciphertext to CipherParams,
           * else assumed CipherParams already and returns ciphertext unchanged.
           *
           * @param {CipherParams|string} ciphertext The ciphertext.
           * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
           *
           * @return {CipherParams} The unserialized ciphertext.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
           */
          _parse: function(p, g) {
            return typeof p == "string" ? g.parse(p, this) : p;
          }
        }), F = v.kdf = {}, m = F.OpenSSL = {
          /**
           * Derives a key and IV from a password.
           *
           * @param {string} password The password to derive from.
           * @param {number} keySize The size in words of the key to generate.
           * @param {number} ivSize The size in words of the IV to generate.
           * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
           *
           * @return {CipherParams} A cipher params object with the key, IV, and salt.
           *
           * @static
           *
           * @example
           *
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
           */
          execute: function(p, g, k, w, T) {
            if (w || (w = h.random(64 / 8)), T)
              var $ = a.create({ keySize: g + k, hasher: T }).compute(p, w);
            else
              var $ = a.create({ keySize: g + k }).compute(p, w);
            var z = h.create($.words.slice(g), k * 4);
            return $.sigBytes = g * 4, c.create({ key: $, iv: z, salt: w });
          }
        }, _ = B.PasswordBasedCipher = b.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: b.cfg.extend({
            kdf: m
          }),
          /**
           * Encrypts a message using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(p, g, k, w) {
            w = this.cfg.extend(w);
            var T = w.kdf.execute(k, p.keySize, p.ivSize, w.salt, w.hasher);
            w.iv = T.iv;
            var $ = b.encrypt.call(this, p, g, T.key, w);
            return $.mixIn(T), $;
          },
          /**
           * Decrypts serialized ciphertext using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(p, g, k, w) {
            w = this.cfg.extend(w), g = this._parse(g, w.format);
            var T = w.kdf.execute(k, p.keySize, p.ivSize, g.salt, w.hasher);
            w.iv = T.iv;
            var $ = b.decrypt.call(this, p, g, T.key, w);
            return $;
          }
        });
      })();
    });
  })(O0)), O0.exports;
}
var q0 = { exports: {} }, Ht = q0.exports, Ye;
function Pt() {
  return Ye || (Ye = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Ht, function(t) {
      return t.mode.CFB = (function() {
        var r = t.lib.BlockCipherMode.extend();
        r.Encryptor = r.extend({
          processBlock: function(B, y) {
            var h = this._cipher, C = h.blockSize;
            v.call(this, B, y, C, h), this._prevBlock = B.slice(y, y + C);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(B, y) {
            var h = this._cipher, C = h.blockSize, x = B.slice(y, y + C);
            v.call(this, B, y, C, h), this._prevBlock = x;
          }
        });
        function v(B, y, h, C) {
          var x, i = this._iv;
          i ? (x = i.slice(0), this._iv = void 0) : x = this._prevBlock, C.encryptBlock(x, 0);
          for (var E = 0; E < h; E++)
            B[y + E] ^= x[E];
        }
        return r;
      })(), t.mode.CFB;
    });
  })(q0)), q0.exports;
}
var N0 = { exports: {} }, zt = N0.exports, Ze;
function Tt() {
  return Ze || (Ze = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(zt, function(t) {
      return t.mode.CTR = (function() {
        var r = t.lib.BlockCipherMode.extend(), v = r.Encryptor = r.extend({
          processBlock: function(B, y) {
            var h = this._cipher, C = h.blockSize, x = this._iv, i = this._counter;
            x && (i = this._counter = x.slice(0), this._iv = void 0);
            var E = i.slice(0);
            h.encryptBlock(E, 0), i[C - 1] = i[C - 1] + 1 | 0;
            for (var a = 0; a < C; a++)
              B[y + a] ^= E[a];
          }
        });
        return r.Decryptor = v, r;
      })(), t.mode.CTR;
    });
  })(N0)), N0.exports;
}
var M0 = { exports: {} }, $t = M0.exports, Ve;
function Lt() {
  return Ve || (Ve = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })($t, function(t) {
      /** @preserve
       * Counter block mode compatible with  Dr Brian Gladman fileenc.c
       * derived from CryptoJS.mode.CTR
       * Jan Hruby jhruby.web@gmail.com
       */
      return t.mode.CTRGladman = (function() {
        var r = t.lib.BlockCipherMode.extend();
        function v(h) {
          if ((h >> 24 & 255) === 255) {
            var C = h >> 16 & 255, x = h >> 8 & 255, i = h & 255;
            C === 255 ? (C = 0, x === 255 ? (x = 0, i === 255 ? i = 0 : ++i) : ++x) : ++C, h = 0, h += C << 16, h += x << 8, h += i;
          } else
            h += 1 << 24;
          return h;
        }
        function B(h) {
          return (h[0] = v(h[0])) === 0 && (h[1] = v(h[1])), h;
        }
        var y = r.Encryptor = r.extend({
          processBlock: function(h, C) {
            var x = this._cipher, i = x.blockSize, E = this._iv, a = this._counter;
            E && (a = this._counter = E.slice(0), this._iv = void 0), B(a);
            var l = a.slice(0);
            x.encryptBlock(l, 0);
            for (var u = 0; u < i; u++)
              h[C + u] ^= l[u];
          }
        });
        return r.Decryptor = y, r;
      })(), t.mode.CTRGladman;
    });
  })(M0)), M0.exports;
}
var W0 = { exports: {} }, Ut = W0.exports, Qe;
function It() {
  return Qe || (Qe = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Ut, function(t) {
      return t.mode.OFB = (function() {
        var r = t.lib.BlockCipherMode.extend(), v = r.Encryptor = r.extend({
          processBlock: function(B, y) {
            var h = this._cipher, C = h.blockSize, x = this._iv, i = this._keystream;
            x && (i = this._keystream = x.slice(0), this._iv = void 0), h.encryptBlock(i, 0);
            for (var E = 0; E < C; E++)
              B[y + E] ^= i[E];
          }
        });
        return r.Decryptor = v, r;
      })(), t.mode.OFB;
    });
  })(W0)), W0.exports;
}
var K0 = { exports: {} }, Ot = K0.exports, Je;
function qt() {
  return Je || (Je = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Ot, function(t) {
      return t.mode.ECB = (function() {
        var r = t.lib.BlockCipherMode.extend();
        return r.Encryptor = r.extend({
          processBlock: function(v, B) {
            this._cipher.encryptBlock(v, B);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(v, B) {
            this._cipher.decryptBlock(v, B);
          }
        }), r;
      })(), t.mode.ECB;
    });
  })(K0)), K0.exports;
}
var j0 = { exports: {} }, Nt = j0.exports, er;
function Mt() {
  return er || (er = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Nt, function(t) {
      return t.pad.AnsiX923 = {
        pad: function(r, v) {
          var B = r.sigBytes, y = v * 4, h = y - B % y, C = B + h - 1;
          r.clamp(), r.words[C >>> 2] |= h << 24 - C % 4 * 8, r.sigBytes += h;
        },
        unpad: function(r) {
          var v = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= v;
        }
      }, t.pad.Ansix923;
    });
  })(j0)), j0.exports;
}
var G0 = { exports: {} }, Wt = G0.exports, rr;
function Kt() {
  return rr || (rr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Wt, function(t) {
      return t.pad.Iso10126 = {
        pad: function(r, v) {
          var B = v * 4, y = B - r.sigBytes % B;
          r.concat(t.lib.WordArray.random(y - 1)).concat(t.lib.WordArray.create([y << 24], 1));
        },
        unpad: function(r) {
          var v = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= v;
        }
      }, t.pad.Iso10126;
    });
  })(G0)), G0.exports;
}
var X0 = { exports: {} }, jt = X0.exports, tr;
function Gt() {
  return tr || (tr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(jt, function(t) {
      return t.pad.Iso97971 = {
        pad: function(r, v) {
          r.concat(t.lib.WordArray.create([2147483648], 1)), t.pad.ZeroPadding.pad(r, v);
        },
        unpad: function(r) {
          t.pad.ZeroPadding.unpad(r), r.sigBytes--;
        }
      }, t.pad.Iso97971;
    });
  })(X0)), X0.exports;
}
var Y0 = { exports: {} }, Xt = Y0.exports, xr;
function Yt() {
  return xr || (xr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Xt, function(t) {
      return t.pad.ZeroPadding = {
        pad: function(r, v) {
          var B = v * 4;
          r.clamp(), r.sigBytes += B - (r.sigBytes % B || B);
        },
        unpad: function(r) {
          for (var v = r.words, B = r.sigBytes - 1, B = r.sigBytes - 1; B >= 0; B--)
            if (v[B >>> 2] >>> 24 - B % 4 * 8 & 255) {
              r.sigBytes = B + 1;
              break;
            }
        }
      }, t.pad.ZeroPadding;
    });
  })(Y0)), Y0.exports;
}
var Z0 = { exports: {} }, Zt = Z0.exports, nr;
function Vt() {
  return nr || (nr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Zt, function(t) {
      return t.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      }, t.pad.NoPadding;
    });
  })(Z0)), Z0.exports;
}
var V0 = { exports: {} }, Qt = V0.exports, or;
function Jt() {
  return or || (or = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), K());
    })(Qt, function(t) {
      return (function(r) {
        var v = t, B = v.lib, y = B.CipherParams, h = v.enc, C = h.Hex, x = v.format;
        x.Hex = {
          /**
           * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The hexadecimally encoded string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
           */
          stringify: function(i) {
            return i.ciphertext.toString(C);
          },
          /**
           * Converts a hexadecimally encoded ciphertext string to a cipher params object.
           *
           * @param {string} input The hexadecimally encoded string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
           */
          parse: function(i) {
            var E = C.parse(i);
            return y.create({ ciphertext: E });
          }
        };
      })(), t.format.Hex;
    });
  })(V0)), V0.exports;
}
var Q0 = { exports: {} }, ex = Q0.exports, ar;
function rx() {
  return ar || (ar = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(ex, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.BlockCipher, y = r.algo, h = [], C = [], x = [], i = [], E = [], a = [], l = [], u = [], o = [], f = [];
        (function() {
          for (var c = [], d = 0; d < 256; d++)
            d < 128 ? c[d] = d << 1 : c[d] = d << 1 ^ 283;
          for (var D = 0, b = 0, d = 0; d < 256; d++) {
            var F = b ^ b << 1 ^ b << 2 ^ b << 3 ^ b << 4;
            F = F >>> 8 ^ F & 255 ^ 99, h[D] = F, C[F] = D;
            var m = c[D], _ = c[m], p = c[_], g = c[F] * 257 ^ F * 16843008;
            x[D] = g << 24 | g >>> 8, i[D] = g << 16 | g >>> 16, E[D] = g << 8 | g >>> 24, a[D] = g;
            var g = p * 16843009 ^ _ * 65537 ^ m * 257 ^ D * 16843008;
            l[F] = g << 24 | g >>> 8, u[F] = g << 16 | g >>> 16, o[F] = g << 8 | g >>> 24, f[F] = g, D ? (D = m ^ c[c[c[p ^ m]]], b ^= c[c[b]]) : D = b = 1;
          }
        })();
        var A = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], s = y.AES = B.extend({
          _doReset: function() {
            var c;
            if (!(this._nRounds && this._keyPriorReset === this._key)) {
              for (var d = this._keyPriorReset = this._key, D = d.words, b = d.sigBytes / 4, F = this._nRounds = b + 6, m = (F + 1) * 4, _ = this._keySchedule = [], p = 0; p < m; p++)
                p < b ? _[p] = D[p] : (c = _[p - 1], p % b ? b > 6 && p % b == 4 && (c = h[c >>> 24] << 24 | h[c >>> 16 & 255] << 16 | h[c >>> 8 & 255] << 8 | h[c & 255]) : (c = c << 8 | c >>> 24, c = h[c >>> 24] << 24 | h[c >>> 16 & 255] << 16 | h[c >>> 8 & 255] << 8 | h[c & 255], c ^= A[p / b | 0] << 24), _[p] = _[p - b] ^ c);
              for (var g = this._invKeySchedule = [], k = 0; k < m; k++) {
                var p = m - k;
                if (k % 4)
                  var c = _[p];
                else
                  var c = _[p - 4];
                k < 4 || p <= 4 ? g[k] = c : g[k] = l[h[c >>> 24]] ^ u[h[c >>> 16 & 255]] ^ o[h[c >>> 8 & 255]] ^ f[h[c & 255]];
              }
            }
          },
          encryptBlock: function(c, d) {
            this._doCryptBlock(c, d, this._keySchedule, x, i, E, a, h);
          },
          decryptBlock: function(c, d) {
            var D = c[d + 1];
            c[d + 1] = c[d + 3], c[d + 3] = D, this._doCryptBlock(c, d, this._invKeySchedule, l, u, o, f, C);
            var D = c[d + 1];
            c[d + 1] = c[d + 3], c[d + 3] = D;
          },
          _doCryptBlock: function(c, d, D, b, F, m, _, p) {
            for (var g = this._nRounds, k = c[d] ^ D[0], w = c[d + 1] ^ D[1], T = c[d + 2] ^ D[2], $ = c[d + 3] ^ D[3], z = 4, L = 1; L < g; L++) {
              var O = b[k >>> 24] ^ F[w >>> 16 & 255] ^ m[T >>> 8 & 255] ^ _[$ & 255] ^ D[z++], N = b[w >>> 24] ^ F[T >>> 16 & 255] ^ m[$ >>> 8 & 255] ^ _[k & 255] ^ D[z++], q = b[T >>> 24] ^ F[$ >>> 16 & 255] ^ m[k >>> 8 & 255] ^ _[w & 255] ^ D[z++], S = b[$ >>> 24] ^ F[k >>> 16 & 255] ^ m[w >>> 8 & 255] ^ _[T & 255] ^ D[z++];
              k = O, w = N, T = q, $ = S;
            }
            var O = (p[k >>> 24] << 24 | p[w >>> 16 & 255] << 16 | p[T >>> 8 & 255] << 8 | p[$ & 255]) ^ D[z++], N = (p[w >>> 24] << 24 | p[T >>> 16 & 255] << 16 | p[$ >>> 8 & 255] << 8 | p[k & 255]) ^ D[z++], q = (p[T >>> 24] << 24 | p[$ >>> 16 & 255] << 16 | p[k >>> 8 & 255] << 8 | p[w & 255]) ^ D[z++], S = (p[$ >>> 24] << 24 | p[k >>> 16 & 255] << 16 | p[w >>> 8 & 255] << 8 | p[T & 255]) ^ D[z++];
            c[d] = O, c[d + 1] = N, c[d + 2] = q, c[d + 3] = S;
          },
          keySize: 256 / 32
        });
        r.AES = B._createHelper(s);
      })(), t.AES;
    });
  })(Q0)), Q0.exports;
}
var J0 = { exports: {} }, tx = J0.exports, ir;
function xx() {
  return ir || (ir = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(tx, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.WordArray, y = v.BlockCipher, h = r.algo, C = [
          57,
          49,
          41,
          33,
          25,
          17,
          9,
          1,
          58,
          50,
          42,
          34,
          26,
          18,
          10,
          2,
          59,
          51,
          43,
          35,
          27,
          19,
          11,
          3,
          60,
          52,
          44,
          36,
          63,
          55,
          47,
          39,
          31,
          23,
          15,
          7,
          62,
          54,
          46,
          38,
          30,
          22,
          14,
          6,
          61,
          53,
          45,
          37,
          29,
          21,
          13,
          5,
          28,
          20,
          12,
          4
        ], x = [
          14,
          17,
          11,
          24,
          1,
          5,
          3,
          28,
          15,
          6,
          21,
          10,
          23,
          19,
          12,
          4,
          26,
          8,
          16,
          7,
          27,
          20,
          13,
          2,
          41,
          52,
          31,
          37,
          47,
          55,
          30,
          40,
          51,
          45,
          33,
          48,
          44,
          49,
          39,
          56,
          34,
          53,
          46,
          42,
          50,
          36,
          29,
          32
        ], i = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], E = [
          {
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
          },
          {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
          },
          {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
          },
          {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
          },
          {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
          },
          {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
          },
          {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
          },
          {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
          }
        ], a = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ], l = h.DES = y.extend({
          _doReset: function() {
            for (var A = this._key, s = A.words, c = [], d = 0; d < 56; d++) {
              var D = C[d] - 1;
              c[d] = s[D >>> 5] >>> 31 - D % 32 & 1;
            }
            for (var b = this._subKeys = [], F = 0; F < 16; F++) {
              for (var m = b[F] = [], _ = i[F], d = 0; d < 24; d++)
                m[d / 6 | 0] |= c[(x[d] - 1 + _) % 28] << 31 - d % 6, m[4 + (d / 6 | 0)] |= c[28 + (x[d + 24] - 1 + _) % 28] << 31 - d % 6;
              m[0] = m[0] << 1 | m[0] >>> 31;
              for (var d = 1; d < 7; d++)
                m[d] = m[d] >>> (d - 1) * 4 + 3;
              m[7] = m[7] << 5 | m[7] >>> 27;
            }
            for (var p = this._invSubKeys = [], d = 0; d < 16; d++)
              p[d] = b[15 - d];
          },
          encryptBlock: function(A, s) {
            this._doCryptBlock(A, s, this._subKeys);
          },
          decryptBlock: function(A, s) {
            this._doCryptBlock(A, s, this._invSubKeys);
          },
          _doCryptBlock: function(A, s, c) {
            this._lBlock = A[s], this._rBlock = A[s + 1], u.call(this, 4, 252645135), u.call(this, 16, 65535), o.call(this, 2, 858993459), o.call(this, 8, 16711935), u.call(this, 1, 1431655765);
            for (var d = 0; d < 16; d++) {
              for (var D = c[d], b = this._lBlock, F = this._rBlock, m = 0, _ = 0; _ < 8; _++)
                m |= E[_][((F ^ D[_]) & a[_]) >>> 0];
              this._lBlock = F, this._rBlock = b ^ m;
            }
            var p = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = p, u.call(this, 1, 1431655765), o.call(this, 8, 16711935), o.call(this, 2, 858993459), u.call(this, 16, 65535), u.call(this, 4, 252645135), A[s] = this._lBlock, A[s + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function u(A, s) {
          var c = (this._lBlock >>> A ^ this._rBlock) & s;
          this._rBlock ^= c, this._lBlock ^= c << A;
        }
        function o(A, s) {
          var c = (this._rBlock >>> A ^ this._lBlock) & s;
          this._lBlock ^= c, this._rBlock ^= c << A;
        }
        r.DES = y._createHelper(l);
        var f = h.TripleDES = y.extend({
          _doReset: function() {
            var A = this._key, s = A.words;
            if (s.length !== 2 && s.length !== 4 && s.length < 6)
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            var c = s.slice(0, 2), d = s.length < 4 ? s.slice(0, 2) : s.slice(2, 4), D = s.length < 6 ? s.slice(0, 2) : s.slice(4, 6);
            this._des1 = l.createEncryptor(B.create(c)), this._des2 = l.createEncryptor(B.create(d)), this._des3 = l.createEncryptor(B.create(D));
          },
          encryptBlock: function(A, s) {
            this._des1.encryptBlock(A, s), this._des2.decryptBlock(A, s), this._des3.encryptBlock(A, s);
          },
          decryptBlock: function(A, s) {
            this._des3.decryptBlock(A, s), this._des2.encryptBlock(A, s), this._des1.decryptBlock(A, s);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        r.TripleDES = y._createHelper(f);
      })(), t.TripleDES;
    });
  })(J0)), J0.exports;
}
var ee = { exports: {} }, nx = ee.exports, sr;
function ox() {
  return sr || (sr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(nx, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.StreamCipher, y = r.algo, h = y.RC4 = B.extend({
          _doReset: function() {
            for (var i = this._key, E = i.words, a = i.sigBytes, l = this._S = [], u = 0; u < 256; u++)
              l[u] = u;
            for (var u = 0, o = 0; u < 256; u++) {
              var f = u % a, A = E[f >>> 2] >>> 24 - f % 4 * 8 & 255;
              o = (o + l[u] + A) % 256;
              var s = l[u];
              l[u] = l[o], l[o] = s;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(i, E) {
            i[E] ^= C.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function C() {
          for (var i = this._S, E = this._i, a = this._j, l = 0, u = 0; u < 4; u++) {
            E = (E + 1) % 256, a = (a + i[E]) % 256;
            var o = i[E];
            i[E] = i[a], i[a] = o, l |= i[(i[E] + i[a]) % 256] << 24 - u * 8;
          }
          return this._i = E, this._j = a, l;
        }
        r.RC4 = B._createHelper(h);
        var x = y.RC4Drop = h.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: h.cfg.extend({
            drop: 192
          }),
          _doReset: function() {
            h._doReset.call(this);
            for (var i = this.cfg.drop; i > 0; i--)
              C.call(this);
          }
        });
        r.RC4Drop = B._createHelper(x);
      })(), t.RC4;
    });
  })(ee)), ee.exports;
}
var re = { exports: {} }, ax = re.exports, cr;
function ix() {
  return cr || (cr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(ax, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.StreamCipher, y = r.algo, h = [], C = [], x = [], i = y.Rabbit = B.extend({
          _doReset: function() {
            for (var a = this._key.words, l = this.cfg.iv, u = 0; u < 4; u++)
              a[u] = (a[u] << 8 | a[u] >>> 24) & 16711935 | (a[u] << 24 | a[u] >>> 8) & 4278255360;
            var o = this._X = [
              a[0],
              a[3] << 16 | a[2] >>> 16,
              a[1],
              a[0] << 16 | a[3] >>> 16,
              a[2],
              a[1] << 16 | a[0] >>> 16,
              a[3],
              a[2] << 16 | a[1] >>> 16
            ], f = this._C = [
              a[2] << 16 | a[2] >>> 16,
              a[0] & 4294901760 | a[1] & 65535,
              a[3] << 16 | a[3] >>> 16,
              a[1] & 4294901760 | a[2] & 65535,
              a[0] << 16 | a[0] >>> 16,
              a[2] & 4294901760 | a[3] & 65535,
              a[1] << 16 | a[1] >>> 16,
              a[3] & 4294901760 | a[0] & 65535
            ];
            this._b = 0;
            for (var u = 0; u < 4; u++)
              E.call(this);
            for (var u = 0; u < 8; u++)
              f[u] ^= o[u + 4 & 7];
            if (l) {
              var A = l.words, s = A[0], c = A[1], d = (s << 8 | s >>> 24) & 16711935 | (s << 24 | s >>> 8) & 4278255360, D = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360, b = d >>> 16 | D & 4294901760, F = D << 16 | d & 65535;
              f[0] ^= d, f[1] ^= b, f[2] ^= D, f[3] ^= F, f[4] ^= d, f[5] ^= b, f[6] ^= D, f[7] ^= F;
              for (var u = 0; u < 4; u++)
                E.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            E.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var o = 0; o < 4; o++)
              h[o] = (h[o] << 8 | h[o] >>> 24) & 16711935 | (h[o] << 24 | h[o] >>> 8) & 4278255360, a[l + o] ^= h[o];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function E() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            C[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < C[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < C[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < C[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < C[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < C[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < C[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < C[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < C[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var o = a[u] + l[u], f = o & 65535, A = o >>> 16, s = ((f * f >>> 17) + f * A >>> 15) + A * A, c = ((o & 4294901760) * o | 0) + ((o & 65535) * o | 0);
            x[u] = s ^ c;
          }
          a[0] = x[0] + (x[7] << 16 | x[7] >>> 16) + (x[6] << 16 | x[6] >>> 16) | 0, a[1] = x[1] + (x[0] << 8 | x[0] >>> 24) + x[7] | 0, a[2] = x[2] + (x[1] << 16 | x[1] >>> 16) + (x[0] << 16 | x[0] >>> 16) | 0, a[3] = x[3] + (x[2] << 8 | x[2] >>> 24) + x[1] | 0, a[4] = x[4] + (x[3] << 16 | x[3] >>> 16) + (x[2] << 16 | x[2] >>> 16) | 0, a[5] = x[5] + (x[4] << 8 | x[4] >>> 24) + x[3] | 0, a[6] = x[6] + (x[5] << 16 | x[5] >>> 16) + (x[4] << 16 | x[4] >>> 16) | 0, a[7] = x[7] + (x[6] << 8 | x[6] >>> 24) + x[5] | 0;
        }
        r.Rabbit = B._createHelper(i);
      })(), t.Rabbit;
    });
  })(re)), re.exports;
}
var te = { exports: {} }, sx = te.exports, fr;
function cx() {
  return fr || (fr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(sx, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.StreamCipher, y = r.algo, h = [], C = [], x = [], i = y.RabbitLegacy = B.extend({
          _doReset: function() {
            var a = this._key.words, l = this.cfg.iv, u = this._X = [
              a[0],
              a[3] << 16 | a[2] >>> 16,
              a[1],
              a[0] << 16 | a[3] >>> 16,
              a[2],
              a[1] << 16 | a[0] >>> 16,
              a[3],
              a[2] << 16 | a[1] >>> 16
            ], o = this._C = [
              a[2] << 16 | a[2] >>> 16,
              a[0] & 4294901760 | a[1] & 65535,
              a[3] << 16 | a[3] >>> 16,
              a[1] & 4294901760 | a[2] & 65535,
              a[0] << 16 | a[0] >>> 16,
              a[2] & 4294901760 | a[3] & 65535,
              a[1] << 16 | a[1] >>> 16,
              a[3] & 4294901760 | a[0] & 65535
            ];
            this._b = 0;
            for (var f = 0; f < 4; f++)
              E.call(this);
            for (var f = 0; f < 8; f++)
              o[f] ^= u[f + 4 & 7];
            if (l) {
              var A = l.words, s = A[0], c = A[1], d = (s << 8 | s >>> 24) & 16711935 | (s << 24 | s >>> 8) & 4278255360, D = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360, b = d >>> 16 | D & 4294901760, F = D << 16 | d & 65535;
              o[0] ^= d, o[1] ^= b, o[2] ^= D, o[3] ^= F, o[4] ^= d, o[5] ^= b, o[6] ^= D, o[7] ^= F;
              for (var f = 0; f < 4; f++)
                E.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            E.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var o = 0; o < 4; o++)
              h[o] = (h[o] << 8 | h[o] >>> 24) & 16711935 | (h[o] << 24 | h[o] >>> 8) & 4278255360, a[l + o] ^= h[o];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function E() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            C[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < C[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < C[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < C[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < C[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < C[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < C[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < C[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < C[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var o = a[u] + l[u], f = o & 65535, A = o >>> 16, s = ((f * f >>> 17) + f * A >>> 15) + A * A, c = ((o & 4294901760) * o | 0) + ((o & 65535) * o | 0);
            x[u] = s ^ c;
          }
          a[0] = x[0] + (x[7] << 16 | x[7] >>> 16) + (x[6] << 16 | x[6] >>> 16) | 0, a[1] = x[1] + (x[0] << 8 | x[0] >>> 24) + x[7] | 0, a[2] = x[2] + (x[1] << 16 | x[1] >>> 16) + (x[0] << 16 | x[0] >>> 16) | 0, a[3] = x[3] + (x[2] << 8 | x[2] >>> 24) + x[1] | 0, a[4] = x[4] + (x[3] << 16 | x[3] >>> 16) + (x[2] << 16 | x[2] >>> 16) | 0, a[5] = x[5] + (x[4] << 8 | x[4] >>> 24) + x[3] | 0, a[6] = x[6] + (x[5] << 16 | x[5] >>> 16) + (x[4] << 16 | x[4] >>> 16) | 0, a[7] = x[7] + (x[6] << 8 | x[6] >>> 24) + x[5] | 0;
        }
        r.RabbitLegacy = B._createHelper(i);
      })(), t.RabbitLegacy;
    });
  })(te)), te.exports;
}
var xe = { exports: {} }, fx = xe.exports, ur;
function ux() {
  return ur || (ur = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), n0(), o0(), x0(), K());
    })(fx, function(t) {
      return (function() {
        var r = t, v = r.lib, B = v.BlockCipher, y = r.algo;
        const h = 16, C = [
          608135816,
          2242054355,
          320440878,
          57701188,
          2752067618,
          698298832,
          137296536,
          3964562569,
          1160258022,
          953160567,
          3193202383,
          887688300,
          3232508343,
          3380367581,
          1065670069,
          3041331479,
          2450970073,
          2306472731
        ], x = [
          [
            3509652390,
            2564797868,
            805139163,
            3491422135,
            3101798381,
            1780907670,
            3128725573,
            4046225305,
            614570311,
            3012652279,
            134345442,
            2240740374,
            1667834072,
            1901547113,
            2757295779,
            4103290238,
            227898511,
            1921955416,
            1904987480,
            2182433518,
            2069144605,
            3260701109,
            2620446009,
            720527379,
            3318853667,
            677414384,
            3393288472,
            3101374703,
            2390351024,
            1614419982,
            1822297739,
            2954791486,
            3608508353,
            3174124327,
            2024746970,
            1432378464,
            3864339955,
            2857741204,
            1464375394,
            1676153920,
            1439316330,
            715854006,
            3033291828,
            289532110,
            2706671279,
            2087905683,
            3018724369,
            1668267050,
            732546397,
            1947742710,
            3462151702,
            2609353502,
            2950085171,
            1814351708,
            2050118529,
            680887927,
            999245976,
            1800124847,
            3300911131,
            1713906067,
            1641548236,
            4213287313,
            1216130144,
            1575780402,
            4018429277,
            3917837745,
            3693486850,
            3949271944,
            596196993,
            3549867205,
            258830323,
            2213823033,
            772490370,
            2760122372,
            1774776394,
            2652871518,
            566650946,
            4142492826,
            1728879713,
            2882767088,
            1783734482,
            3629395816,
            2517608232,
            2874225571,
            1861159788,
            326777828,
            3124490320,
            2130389656,
            2716951837,
            967770486,
            1724537150,
            2185432712,
            2364442137,
            1164943284,
            2105845187,
            998989502,
            3765401048,
            2244026483,
            1075463327,
            1455516326,
            1322494562,
            910128902,
            469688178,
            1117454909,
            936433444,
            3490320968,
            3675253459,
            1240580251,
            122909385,
            2157517691,
            634681816,
            4142456567,
            3825094682,
            3061402683,
            2540495037,
            79693498,
            3249098678,
            1084186820,
            1583128258,
            426386531,
            1761308591,
            1047286709,
            322548459,
            995290223,
            1845252383,
            2603652396,
            3431023940,
            2942221577,
            3202600964,
            3727903485,
            1712269319,
            422464435,
            3234572375,
            1170764815,
            3523960633,
            3117677531,
            1434042557,
            442511882,
            3600875718,
            1076654713,
            1738483198,
            4213154764,
            2393238008,
            3677496056,
            1014306527,
            4251020053,
            793779912,
            2902807211,
            842905082,
            4246964064,
            1395751752,
            1040244610,
            2656851899,
            3396308128,
            445077038,
            3742853595,
            3577915638,
            679411651,
            2892444358,
            2354009459,
            1767581616,
            3150600392,
            3791627101,
            3102740896,
            284835224,
            4246832056,
            1258075500,
            768725851,
            2589189241,
            3069724005,
            3532540348,
            1274779536,
            3789419226,
            2764799539,
            1660621633,
            3471099624,
            4011903706,
            913787905,
            3497959166,
            737222580,
            2514213453,
            2928710040,
            3937242737,
            1804850592,
            3499020752,
            2949064160,
            2386320175,
            2390070455,
            2415321851,
            4061277028,
            2290661394,
            2416832540,
            1336762016,
            1754252060,
            3520065937,
            3014181293,
            791618072,
            3188594551,
            3933548030,
            2332172193,
            3852520463,
            3043980520,
            413987798,
            3465142937,
            3030929376,
            4245938359,
            2093235073,
            3534596313,
            375366246,
            2157278981,
            2479649556,
            555357303,
            3870105701,
            2008414854,
            3344188149,
            4221384143,
            3956125452,
            2067696032,
            3594591187,
            2921233993,
            2428461,
            544322398,
            577241275,
            1471733935,
            610547355,
            4027169054,
            1432588573,
            1507829418,
            2025931657,
            3646575487,
            545086370,
            48609733,
            2200306550,
            1653985193,
            298326376,
            1316178497,
            3007786442,
            2064951626,
            458293330,
            2589141269,
            3591329599,
            3164325604,
            727753846,
            2179363840,
            146436021,
            1461446943,
            4069977195,
            705550613,
            3059967265,
            3887724982,
            4281599278,
            3313849956,
            1404054877,
            2845806497,
            146425753,
            1854211946
          ],
          [
            1266315497,
            3048417604,
            3681880366,
            3289982499,
            290971e4,
            1235738493,
            2632868024,
            2414719590,
            3970600049,
            1771706367,
            1449415276,
            3266420449,
            422970021,
            1963543593,
            2690192192,
            3826793022,
            1062508698,
            1531092325,
            1804592342,
            2583117782,
            2714934279,
            4024971509,
            1294809318,
            4028980673,
            1289560198,
            2221992742,
            1669523910,
            35572830,
            157838143,
            1052438473,
            1016535060,
            1802137761,
            1753167236,
            1386275462,
            3080475397,
            2857371447,
            1040679964,
            2145300060,
            2390574316,
            1461121720,
            2956646967,
            4031777805,
            4028374788,
            33600511,
            2920084762,
            1018524850,
            629373528,
            3691585981,
            3515945977,
            2091462646,
            2486323059,
            586499841,
            988145025,
            935516892,
            3367335476,
            2599673255,
            2839830854,
            265290510,
            3972581182,
            2759138881,
            3795373465,
            1005194799,
            847297441,
            406762289,
            1314163512,
            1332590856,
            1866599683,
            4127851711,
            750260880,
            613907577,
            1450815602,
            3165620655,
            3734664991,
            3650291728,
            3012275730,
            3704569646,
            1427272223,
            778793252,
            1343938022,
            2676280711,
            2052605720,
            1946737175,
            3164576444,
            3914038668,
            3967478842,
            3682934266,
            1661551462,
            3294938066,
            4011595847,
            840292616,
            3712170807,
            616741398,
            312560963,
            711312465,
            1351876610,
            322626781,
            1910503582,
            271666773,
            2175563734,
            1594956187,
            70604529,
            3617834859,
            1007753275,
            1495573769,
            4069517037,
            2549218298,
            2663038764,
            504708206,
            2263041392,
            3941167025,
            2249088522,
            1514023603,
            1998579484,
            1312622330,
            694541497,
            2582060303,
            2151582166,
            1382467621,
            776784248,
            2618340202,
            3323268794,
            2497899128,
            2784771155,
            503983604,
            4076293799,
            907881277,
            423175695,
            432175456,
            1378068232,
            4145222326,
            3954048622,
            3938656102,
            3820766613,
            2793130115,
            2977904593,
            26017576,
            3274890735,
            3194772133,
            1700274565,
            1756076034,
            4006520079,
            3677328699,
            720338349,
            1533947780,
            354530856,
            688349552,
            3973924725,
            1637815568,
            332179504,
            3949051286,
            53804574,
            2852348879,
            3044236432,
            1282449977,
            3583942155,
            3416972820,
            4006381244,
            1617046695,
            2628476075,
            3002303598,
            1686838959,
            431878346,
            2686675385,
            1700445008,
            1080580658,
            1009431731,
            832498133,
            3223435511,
            2605976345,
            2271191193,
            2516031870,
            1648197032,
            4164389018,
            2548247927,
            300782431,
            375919233,
            238389289,
            3353747414,
            2531188641,
            2019080857,
            1475708069,
            455242339,
            2609103871,
            448939670,
            3451063019,
            1395535956,
            2413381860,
            1841049896,
            1491858159,
            885456874,
            4264095073,
            4001119347,
            1565136089,
            3898914787,
            1108368660,
            540939232,
            1173283510,
            2745871338,
            3681308437,
            4207628240,
            3343053890,
            4016749493,
            1699691293,
            1103962373,
            3625875870,
            2256883143,
            3830138730,
            1031889488,
            3479347698,
            1535977030,
            4236805024,
            3251091107,
            2132092099,
            1774941330,
            1199868427,
            1452454533,
            157007616,
            2904115357,
            342012276,
            595725824,
            1480756522,
            206960106,
            497939518,
            591360097,
            863170706,
            2375253569,
            3596610801,
            1814182875,
            2094937945,
            3421402208,
            1082520231,
            3463918190,
            2785509508,
            435703966,
            3908032597,
            1641649973,
            2842273706,
            3305899714,
            1510255612,
            2148256476,
            2655287854,
            3276092548,
            4258621189,
            236887753,
            3681803219,
            274041037,
            1734335097,
            3815195456,
            3317970021,
            1899903192,
            1026095262,
            4050517792,
            356393447,
            2410691914,
            3873677099,
            3682840055
          ],
          [
            3913112168,
            2491498743,
            4132185628,
            2489919796,
            1091903735,
            1979897079,
            3170134830,
            3567386728,
            3557303409,
            857797738,
            1136121015,
            1342202287,
            507115054,
            2535736646,
            337727348,
            3213592640,
            1301675037,
            2528481711,
            1895095763,
            1721773893,
            3216771564,
            62756741,
            2142006736,
            835421444,
            2531993523,
            1442658625,
            3659876326,
            2882144922,
            676362277,
            1392781812,
            170690266,
            3921047035,
            1759253602,
            3611846912,
            1745797284,
            664899054,
            1329594018,
            3901205900,
            3045908486,
            2062866102,
            2865634940,
            3543621612,
            3464012697,
            1080764994,
            553557557,
            3656615353,
            3996768171,
            991055499,
            499776247,
            1265440854,
            648242737,
            3940784050,
            980351604,
            3713745714,
            1749149687,
            3396870395,
            4211799374,
            3640570775,
            1161844396,
            3125318951,
            1431517754,
            545492359,
            4268468663,
            3499529547,
            1437099964,
            2702547544,
            3433638243,
            2581715763,
            2787789398,
            1060185593,
            1593081372,
            2418618748,
            4260947970,
            69676912,
            2159744348,
            86519011,
            2512459080,
            3838209314,
            1220612927,
            3339683548,
            133810670,
            1090789135,
            1078426020,
            1569222167,
            845107691,
            3583754449,
            4072456591,
            1091646820,
            628848692,
            1613405280,
            3757631651,
            526609435,
            236106946,
            48312990,
            2942717905,
            3402727701,
            1797494240,
            859738849,
            992217954,
            4005476642,
            2243076622,
            3870952857,
            3732016268,
            765654824,
            3490871365,
            2511836413,
            1685915746,
            3888969200,
            1414112111,
            2273134842,
            3281911079,
            4080962846,
            172450625,
            2569994100,
            980381355,
            4109958455,
            2819808352,
            2716589560,
            2568741196,
            3681446669,
            3329971472,
            1835478071,
            660984891,
            3704678404,
            4045999559,
            3422617507,
            3040415634,
            1762651403,
            1719377915,
            3470491036,
            2693910283,
            3642056355,
            3138596744,
            1364962596,
            2073328063,
            1983633131,
            926494387,
            3423689081,
            2150032023,
            4096667949,
            1749200295,
            3328846651,
            309677260,
            2016342300,
            1779581495,
            3079819751,
            111262694,
            1274766160,
            443224088,
            298511866,
            1025883608,
            3806446537,
            1145181785,
            168956806,
            3641502830,
            3584813610,
            1689216846,
            3666258015,
            3200248200,
            1692713982,
            2646376535,
            4042768518,
            1618508792,
            1610833997,
            3523052358,
            4130873264,
            2001055236,
            3610705100,
            2202168115,
            4028541809,
            2961195399,
            1006657119,
            2006996926,
            3186142756,
            1430667929,
            3210227297,
            1314452623,
            4074634658,
            4101304120,
            2273951170,
            1399257539,
            3367210612,
            3027628629,
            1190975929,
            2062231137,
            2333990788,
            2221543033,
            2438960610,
            1181637006,
            548689776,
            2362791313,
            3372408396,
            3104550113,
            3145860560,
            296247880,
            1970579870,
            3078560182,
            3769228297,
            1714227617,
            3291629107,
            3898220290,
            166772364,
            1251581989,
            493813264,
            448347421,
            195405023,
            2709975567,
            677966185,
            3703036547,
            1463355134,
            2715995803,
            1338867538,
            1343315457,
            2802222074,
            2684532164,
            233230375,
            2599980071,
            2000651841,
            3277868038,
            1638401717,
            4028070440,
            3237316320,
            6314154,
            819756386,
            300326615,
            590932579,
            1405279636,
            3267499572,
            3150704214,
            2428286686,
            3959192993,
            3461946742,
            1862657033,
            1266418056,
            963775037,
            2089974820,
            2263052895,
            1917689273,
            448879540,
            3550394620,
            3981727096,
            150775221,
            3627908307,
            1303187396,
            508620638,
            2975983352,
            2726630617,
            1817252668,
            1876281319,
            1457606340,
            908771278,
            3720792119,
            3617206836,
            2455994898,
            1729034894,
            1080033504
          ],
          [
            976866871,
            3556439503,
            2881648439,
            1522871579,
            1555064734,
            1336096578,
            3548522304,
            2579274686,
            3574697629,
            3205460757,
            3593280638,
            3338716283,
            3079412587,
            564236357,
            2993598910,
            1781952180,
            1464380207,
            3163844217,
            3332601554,
            1699332808,
            1393555694,
            1183702653,
            3581086237,
            1288719814,
            691649499,
            2847557200,
            2895455976,
            3193889540,
            2717570544,
            1781354906,
            1676643554,
            2592534050,
            3230253752,
            1126444790,
            2770207658,
            2633158820,
            2210423226,
            2615765581,
            2414155088,
            3127139286,
            673620729,
            2805611233,
            1269405062,
            4015350505,
            3341807571,
            4149409754,
            1057255273,
            2012875353,
            2162469141,
            2276492801,
            2601117357,
            993977747,
            3918593370,
            2654263191,
            753973209,
            36408145,
            2530585658,
            25011837,
            3520020182,
            2088578344,
            530523599,
            2918365339,
            1524020338,
            1518925132,
            3760827505,
            3759777254,
            1202760957,
            3985898139,
            3906192525,
            674977740,
            4174734889,
            2031300136,
            2019492241,
            3983892565,
            4153806404,
            3822280332,
            352677332,
            2297720250,
            60907813,
            90501309,
            3286998549,
            1016092578,
            2535922412,
            2839152426,
            457141659,
            509813237,
            4120667899,
            652014361,
            1966332200,
            2975202805,
            55981186,
            2327461051,
            676427537,
            3255491064,
            2882294119,
            3433927263,
            1307055953,
            942726286,
            933058658,
            2468411793,
            3933900994,
            4215176142,
            1361170020,
            2001714738,
            2830558078,
            3274259782,
            1222529897,
            1679025792,
            2729314320,
            3714953764,
            1770335741,
            151462246,
            3013232138,
            1682292957,
            1483529935,
            471910574,
            1539241949,
            458788160,
            3436315007,
            1807016891,
            3718408830,
            978976581,
            1043663428,
            3165965781,
            1927990952,
            4200891579,
            2372276910,
            3208408903,
            3533431907,
            1412390302,
            2931980059,
            4132332400,
            1947078029,
            3881505623,
            4168226417,
            2941484381,
            1077988104,
            1320477388,
            886195818,
            18198404,
            3786409e3,
            2509781533,
            112762804,
            3463356488,
            1866414978,
            891333506,
            18488651,
            661792760,
            1628790961,
            3885187036,
            3141171499,
            876946877,
            2693282273,
            1372485963,
            791857591,
            2686433993,
            3759982718,
            3167212022,
            3472953795,
            2716379847,
            445679433,
            3561995674,
            3504004811,
            3574258232,
            54117162,
            3331405415,
            2381918588,
            3769707343,
            4154350007,
            1140177722,
            4074052095,
            668550556,
            3214352940,
            367459370,
            261225585,
            2610173221,
            4209349473,
            3468074219,
            3265815641,
            314222801,
            3066103646,
            3808782860,
            282218597,
            3406013506,
            3773591054,
            379116347,
            1285071038,
            846784868,
            2669647154,
            3771962079,
            3550491691,
            2305946142,
            453669953,
            1268987020,
            3317592352,
            3279303384,
            3744833421,
            2610507566,
            3859509063,
            266596637,
            3847019092,
            517658769,
            3462560207,
            3443424879,
            370717030,
            4247526661,
            2224018117,
            4143653529,
            4112773975,
            2788324899,
            2477274417,
            1456262402,
            2901442914,
            1517677493,
            1846949527,
            2295493580,
            3734397586,
            2176403920,
            1280348187,
            1908823572,
            3871786941,
            846861322,
            1172426758,
            3287448474,
            3383383037,
            1655181056,
            3139813346,
            901632758,
            1897031941,
            2986607138,
            3066810236,
            3447102507,
            1393639104,
            373351379,
            950779232,
            625454576,
            3124240540,
            4148612726,
            2007998917,
            544563296,
            2244738638,
            2330496472,
            2058025392,
            1291430526,
            424198748,
            50039436,
            29584100,
            3605783033,
            2429876329,
            2791104160,
            1057563949,
            3255363231,
            3075367218,
            3463963227,
            1469046755,
            985887462
          ]
        ];
        var i = {
          pbox: [],
          sbox: []
        };
        function E(f, A) {
          let s = A >> 24 & 255, c = A >> 16 & 255, d = A >> 8 & 255, D = A & 255, b = f.sbox[0][s] + f.sbox[1][c];
          return b = b ^ f.sbox[2][d], b = b + f.sbox[3][D], b;
        }
        function a(f, A, s) {
          let c = A, d = s, D;
          for (let b = 0; b < h; ++b)
            c = c ^ f.pbox[b], d = E(f, c) ^ d, D = c, c = d, d = D;
          return D = c, c = d, d = D, d = d ^ f.pbox[h], c = c ^ f.pbox[h + 1], { left: c, right: d };
        }
        function l(f, A, s) {
          let c = A, d = s, D;
          for (let b = h + 1; b > 1; --b)
            c = c ^ f.pbox[b], d = E(f, c) ^ d, D = c, c = d, d = D;
          return D = c, c = d, d = D, d = d ^ f.pbox[1], c = c ^ f.pbox[0], { left: c, right: d };
        }
        function u(f, A, s) {
          for (let F = 0; F < 4; F++) {
            f.sbox[F] = [];
            for (let m = 0; m < 256; m++)
              f.sbox[F][m] = x[F][m];
          }
          let c = 0;
          for (let F = 0; F < h + 2; F++)
            f.pbox[F] = C[F] ^ A[c], c++, c >= s && (c = 0);
          let d = 0, D = 0, b = 0;
          for (let F = 0; F < h + 2; F += 2)
            b = a(f, d, D), d = b.left, D = b.right, f.pbox[F] = d, f.pbox[F + 1] = D;
          for (let F = 0; F < 4; F++)
            for (let m = 0; m < 256; m += 2)
              b = a(f, d, D), d = b.left, D = b.right, f.sbox[F][m] = d, f.sbox[F][m + 1] = D;
          return !0;
        }
        var o = y.Blowfish = B.extend({
          _doReset: function() {
            if (this._keyPriorReset !== this._key) {
              var f = this._keyPriorReset = this._key, A = f.words, s = f.sigBytes / 4;
              u(i, A, s);
            }
          },
          encryptBlock: function(f, A) {
            var s = a(i, f[A], f[A + 1]);
            f[A] = s.left, f[A + 1] = s.right;
          },
          decryptBlock: function(f, A) {
            var s = l(i, f[A], f[A + 1]);
            f[A] = s.left, f[A + 1] = s.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        r.Blowfish = B._createHelper(o);
      })(), t.Blowfish;
    });
  })(xe)), xe.exports;
}
var dx = D0.exports, dr;
function lx() {
  return dr || (dr = 1, (function(e, n) {
    (function(t, r, v) {
      e.exports = r(I(), oe(), ct(), ut(), n0(), vt(), o0(), Dr(), ve(), Et(), br(), Dt(), gt(), mt(), he(), wt(), x0(), K(), Pt(), Tt(), Lt(), It(), qt(), Mt(), Kt(), Gt(), Yt(), Vt(), Jt(), rx(), xx(), ox(), ix(), cx(), ux());
    })(dx, function(t) {
      return t;
    });
  })(D0)), D0.exports;
}
var vx = lx();
const hx = /* @__PURE__ */ et(vx);
function Ax() {
  typeof window > "u" || window.CryptoJS || (window.CryptoJS = hx);
}
class gr extends Error {
  constructor(n, t) {
    super(n), this.methodName = t, this.name = "MobileAuthSdkUnavailableError";
  }
}
function Cx() {
  const e = window.YDRZAuthSF;
  if (!e)
    throw new gr("Mobile auth SDK global unavailable: window.YDRZAuthSF");
  return e;
}
function B0(e) {
  const t = Cx()[e];
  if (typeof t != "function")
    throw new gr(
      `Mobile auth SDK method unavailable: ${String(e)}`,
      e
    );
  return t;
}
function lr(e) {
  try {
    return JSON.stringify(
      e,
      (n, t) => typeof t == "function" ? "[Function]" : t,
      2
    );
  } catch (n) {
    return `[unserializable: ${n instanceof Error ? n.message : String(n)}]`;
  }
}
function Bx() {
  return {
    showAuthPage(e) {
      console.info("[MobileAuthSDK→showAuthPage] params:", lr(e)), B0("showAuthPage")(e);
    },
    initControl(e) {
      console.info("[MobileAuthSDK→initControl] params:", lr(e)), B0("initControl")(e);
    },
    clearControl(e) {
      B0("clearControl")(e);
    },
    getAuthResult(e) {
      B0("getAuthResult")(e);
    },
    updateSubmitBtnStatus(e) {
      B0("updateSubmitBtnStatus")(e);
    }
  };
}
const Ex = "0", px = /* @__PURE__ */ new Set(["0", "1", "3", "4"]);
function Fx(e) {
  const n = (e == null ? void 0 : e.trim()) ?? "";
  return px.has(n) ? n : Ex;
}
const e0 = {
  submitBtnStyle: {
    width: "100%",
    height: "48px",
    bgColor: "#ff2d55",
    borderRadius: "10px",
    fontSize: "16px",
    fontColor: "#FFFFFF",
    name: "确认",
    textAlign: "center"
  },
  submitBtnDisabledStyle: {
    bgColor: "#F5F6F8",
    fontColor: "#8A8F98"
  },
  submitBtnLoadingStyle: {
    height: "48px"
  },
  phoneStyle: {
    bgColor: "#FFFFFF",
    fontColor: "#8A8F98",
    fontSize: "14px",
    borderRadius: "0",
    textAlign: "left",
    width: "auto"
  },
  localTipStyle: {
    fontColor: "#8A8F98",
    fontSize: "12px",
    textAlign: "left"
  },
  unlocalTipStyle: {
    fontColor: "#8A8F98",
    fontSize: "12px",
    textAlign: "left"
  },
  stateStyle: {
    width: "100%",
    bgColor: "#FFFFFF",
    fontColor: "#334155",
    fontSize: "14px",
    borderRadius: "12px",
    textAlign: "center"
  },
  authTextStyle: {
    fontColor: "#334155",
    bgColor: "#FFFFFF",
    borderRadius: "12px",
    textAlign: "center"
  },
  authExpireStyle: {
    fontColor: "#8A8F98",
    fontSize: "14px"
  },
  checkboxStyle: {
    width: "18px",
    height: "18px",
    checkedColor: "#ff2d55",
    borderColor: "#c8ccd1"
  }
};
function Dx(e = {}) {
  return {
    submitBtnStyle: {
      ...e0.submitBtnStyle,
      ...e.submitBtnStyle
    },
    submitBtnDisabledStyle: {
      ...e0.submitBtnDisabledStyle,
      ...e.submitBtnDisabledStyle
    },
    submitBtnLoadingStyle: {
      ...e0.submitBtnLoadingStyle,
      ...e.submitBtnLoadingStyle
    },
    phoneStyle: {
      ...e0.phoneStyle,
      ...e.phoneStyle
    },
    localTipStyle: {
      ...e0.localTipStyle,
      ...e.localTipStyle
    },
    unlocalTipStyle: {
      ...e0.unlocalTipStyle,
      ...e.unlocalTipStyle
    },
    stateStyle: {
      ...e0.stateStyle,
      ...e.stateStyle
    },
    authTextStyle: {
      ...e0.authTextStyle,
      ...e.authTextStyle
    },
    authExpireStyle: {
      ...e0.authExpireStyle,
      ...e.authExpireStyle
    },
    checkboxStyle: {
      ...e0.checkboxStyle,
      ...e.checkboxStyle
    },
    // 仅在调用方显式传入时输出 agreeStyle，避免影响 SDK 默认运营商协议渲染。
    ...e.agreeStyle ? { agreeStyle: e.agreeStyle } : {}
  };
}
function fe(e) {
  if (typeof e != "function") {
    if (e === null)
      return null;
    if (Array.isArray(e))
      return e.map(fe).filter((n) => n !== void 0);
    if (typeof e == "object") {
      const n = {};
      for (const [t, r] of Object.entries(e)) {
        const v = fe(r);
        v !== void 0 && (n[t] = v);
      }
      return n;
    }
    return e;
  }
}
function bx(e) {
  if (!(!e || typeof e != "object"))
    return fe(e);
}
const gx = "https://ginkgo.chinaums.com", yx = "/sign-pay-pro/";
function mx(e) {
  const n = e == null ? void 0 : e.trim();
  if (!n || n === "/")
    return yx;
  const t = /^https?:\/\//i.test(n) ? new URL(n).pathname : n;
  return `${(t.startsWith("/") ? t : `/${t}`).replace(/\/+$/, "")}/`;
}
function _x(e, n) {
  const t = e == null ? void 0 : e.trim();
  return t ? `${new URL(t).toString().replace(/\/+$/, "")}/` : new URL(n.replace(/^\/+/, ""), `${gx}/`).toString();
}
const Sx = "/sign-pay-pro/assist/0.2.0/".trim() || "", wx = mx(Sx), yr = _x("https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.0/", wx);
function kx(e) {
  return new URL(e.replace(/^\/+/, ""), yr).toString();
}
const ce = 50, Rx = ["headerTitle", "idTitle", "phoneTopNotice", "footerNote"], Hx = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, Px = /^(?:[1-9]\d?(?:\.\d+)?px|(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)rem)$/;
function c0(e) {
  return typeof e == "object" && e !== null;
}
function j(e, n, t) {
  var r;
  (r = e == null ? void 0 : e.warn) == null || r.call(e, { path: n, reason: t });
}
function f0(e, n, t) {
  if (typeof e != "string") {
    j(t, n, "Expected a string.");
    return;
  }
  const r = e.trim();
  if (!r) {
    j(t, n, "Expected a non-empty string.");
    return;
  }
  return r;
}
function mr(e, n, t) {
  const r = f0(e, n, t);
  if (r) {
    if (!Hx.test(r)) {
      j(t, n, "Expected #RGB or #RRGGBB.");
      return;
    }
    return r;
  }
}
function zx(e, n, t) {
  const r = f0(e, n, t);
  if (r) {
    if (!Px.test(r)) {
      j(t, n, "Expected a px or rem font size.");
      return;
    }
    return r;
  }
}
function ue(e, n, t) {
  const r = f0(e, n, t);
  if (r)
    try {
      const v = new URL(r);
      if (v.protocol !== "http:" && v.protocol !== "https:") {
        j(t, n, "Expected an http or https URL.");
        return;
      }
      return v.toString();
    } catch {
      j(t, n, "Expected a valid URL.");
      return;
    }
}
function Tx(e, n, t) {
  if (typeof e == "number" && Number.isFinite(e) && e > 0)
    return `${e}px`;
  if (typeof e == "string") {
    const r = e.trim(), v = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/.test(r) ? Number(r.slice(0, -2)) : Number.NaN;
    if (Number.isFinite(v) && v > 0)
      return r;
  }
  j(t, n, "Expected a positive px height.");
}
function $x(e, n, t) {
  if (!c0(e)) {
    j(t, n, "Expected an object.");
    return;
  }
  const r = e.text === void 0 ? void 0 : f0(e.text, `${n}.text`, t), v = e.fontSize === void 0 ? void 0 : zx(e.fontSize, `${n}.fontSize`, t), B = e.color === void 0 ? void 0 : mr(e.color, `${n}.color`, t);
  let y;
  e.bold !== void 0 && (typeof e.bold == "boolean" ? y = e.bold : j(t, `${n}.bold`, "Expected a boolean."));
  const C = Object.entries({ text: r, fontSize: v, color: B, bold: y }).filter(([, x]) => x !== void 0);
  return C.length ? Object.fromEntries(C) : void 0;
}
function vr(e, n, t) {
  if (typeof e == "string") {
    const h = ue(e, `${n}.url`, t);
    return h ? { url: h } : void 0;
  }
  if (!c0(e)) {
    j(t, n, "Expected a URL string or image object.");
    return;
  }
  const r = ue(e.url, `${n}.url`, t);
  if (!r)
    return;
  const v = e.alt === void 0 ? void 0 : f0(e.alt, `${n}.alt`, t), B = e.height === void 0 ? void 0 : Tx(e.height, `${n}.height`, t), y = e.fit === "cover" || e.fit === "contain" ? e.fit : void 0;
  return e.fit !== void 0 && y === void 0 && j(t, `${n}.fit`, "Expected cover or contain."), {
    url: r,
    ...v ? { alt: v } : {},
    ...B ? { height: B } : {},
    ...y ? { fit: y } : {}
  };
}
function Lx(e, n, t) {
  const r = `agreements[${n}]`;
  if (!c0(e)) {
    j(t, r, "Expected an object.");
    return;
  }
  const v = f0(e.title, `${r}.title`, t), B = ue(e.url, `${r}.url`, t);
  return v && B ? { title: v, url: B } : void 0;
}
function _r(e, n = {}) {
  if (e == null)
    return {};
  if (!c0(e))
    return j(n, "ui", "Expected an object."), {};
  const t = e.themeColor === void 0 ? void 0 : mr(e.themeColor, "themeColor", n), r = {};
  if (e.texts !== void 0)
    if (c0(e.texts)) {
      const y = e.texts;
      Rx.forEach((h) => {
        if (h in y) {
          const C = $x(y[h], `texts.${h}`, n);
          C && (r[h] = C);
        }
      });
    } else
      j(n, "texts", "Expected an object.");
  const v = {};
  if (e.images !== void 0)
    if (c0(e.images)) {
      const y = e.images.top === void 0 ? void 0 : vr(e.images.top, "images.top", n), h = e.images.bottom === void 0 ? void 0 : vr(e.images.bottom, "images.bottom", n);
      y && (v.top = y), h && (v.bottom = h);
    } else
      j(n, "images", "Expected an object.");
  let B;
  if (e.agreements !== void 0)
    if (Array.isArray(e.agreements)) {
      const y = e.agreements.map((h, C) => Lx(h, C, n)).filter((h) => h !== void 0);
      B = y.slice(0, ce), y.length > ce && j(n, "agreements", `Only the first ${ce} valid agreements are used.`);
    } else
      j(n, "agreements", "Expected an array.");
  return {
    ...t ? { themeColor: t } : {},
    ...Object.keys(r).length ? { texts: r } : {},
    ...Object.keys(v).length ? { images: v } : {},
    ...B && B.length ? { agreements: B } : {}
  };
}
function Ux(e) {
  return !!(e.themeColor || e.texts && Object.keys(e.texts).length > 0 || e.images && Object.keys(e.images).length > 0 || e.agreements && e.agreements.length > 0);
}
function Ix(e) {
  console.warn(`[AssistanceMobileAuth] Ignored invalid ui config at ${e.path}: ${e.reason}`);
}
const Sr = "assistance-mobile-auth", wr = "ASSISTANCE_AUTH_READY", kr = "ASSISTANCE_AUTH_SUCCESS", Rr = "ASSISTANCE_AUTH_CANCEL", Hr = "ASSISTANCE_AUTH_ERROR", Pr = "ASSISTANCE_AUTH_ERROR_NOTICE", Ae = "ASSISTANCE_AUTH_CONFIG", zr = "ASSISTANCE_AUTH_PHONE_READY", Tr = "ASSISTANCE_AUTH_RESIZE", Ce = "ASSISTANCE_AUTH_CLOSE", $r = "ASSISTANCE_AUTH_PROBE_RESULT", Lr = "ASSISTANCE_AUTH_STYLE", Ox = {
  closable: !0,
  useCustomKeyboard: !0,
  heightMode: "auto"
};
function qx(e, n = Ox) {
  return V(e) ? {
    closable: typeof e.closable == "boolean" ? e.closable : n.closable,
    useCustomKeyboard: typeof e.useCustomKeyboard == "boolean" ? e.useCustomKeyboard : n.useCustomKeyboard,
    heightMode: e.heightMode === "auto" || e.heightMode === "fixed" ? e.heightMode : n.heightMode
  } : { ...n };
}
function V(e) {
  return typeof e == "object" && e !== null;
}
function Nx(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function Mx(e) {
  return e === wr || e === kr || e === Rr || e === Hr || e === Pr || e === Ae || e === zr || e === Tr || e === Ce || e === $r || e === Lr;
}
function hr() {
  return `assistance-auth-${typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
function Ar(e) {
  if (!e || typeof e != "object")
    return null;
  const n = e, t = typeof n.src == "string" ? n.src.trim() : "";
  if (!t)
    return null;
  const r = { src: t };
  return typeof n.width == "string" && n.width.trim() && (r.width = n.width.trim()), typeof n.height == "string" && n.height.trim() && (r.height = n.height.trim()), r;
}
function Cr({
  sessionId: e,
  request: n,
  verificationUrl: t,
  pageImages: r,
  mode: v,
  expectsUiConfig: B,
  appId: y
}) {
  const h = t ?? kx("verification"), C = new URL(h, typeof window < "u" ? window.location.href : "http://localhost");
  C.searchParams.set("assistanceAuthSessionId", e), y && C.searchParams.set("appId", y), B && C.searchParams.set("expectsUiConfig", "1"), v === "probe" && C.searchParams.set("mode", "probe"), n != null && n.scene && C.searchParams.set("scene", n.scene), n != null && n.requestId && C.searchParams.set("requestId", n.requestId);
  const x = Ar(r == null ? void 0 : r.top);
  x && C.searchParams.set("topImage", JSON.stringify(x));
  const i = Ar(r == null ? void 0 : r.bottom);
  if (i && C.searchParams.set("bottomImage", JSON.stringify(i)), typeof window < "u") {
    const a = new URLSearchParams(window.location.search).get("flow");
    a && v !== "probe" && C.searchParams.set("flow", a);
  }
  return C.toString();
}
function de(e, n, t) {
  return {
    source: Sr,
    type: e,
    sessionId: n,
    payload: t
  };
}
function Wx(e, n) {
  return V(e) && e.source === Sr && Mx(e.type) && typeof e.sessionId == "string" && (!n || e.sessionId === n);
}
function Ur(e) {
  return V(e) && typeof e.message == "string" ? {
    code: typeof e.code == "string" ? e.code : void 0,
    message: e.message
  } : { message: "验证失败，请稍后重试。" };
}
function Kx(e) {
  const n = Ur(e);
  return V(e) ? {
    ...n,
    phase: e.phase === "resourceLoad" || e.phase === "showAuthPage" || e.phase === "initControl" ? e.phase : void 0,
    carrier: typeof e.carrier == "string" ? e.carrier : void 0
  } : n;
}
function jx(e) {
  return V(e) && V(e.ui) ? { ui: _r(e.ui) } : { ui: {} };
}
function Gx(e, n) {
  return de(Ae, e, { ui: n });
}
const Xx = /1\d{2}\*{4}\d{4}/, Yx = /1\d{10}/;
function Zx(e) {
  return e.replace(/\s+/g, " ").trim();
}
function Vx(e) {
  var v;
  if (!V(e) || e.source !== "ydrzPhoneControl")
    return null;
  const t = (v = (typeof e.maskedMobile == "string" ? e.maskedMobile.trim() : "").match(Xx)) == null ? void 0 : v[0];
  if (!t)
    return null;
  let r = t;
  if (typeof e.rawText == "string") {
    const B = Zx(e.rawText);
    if (!B.includes(t) || Yx.test(B))
      return null;
    r = B;
  }
  return {
    maskedMobile: t,
    rawText: r,
    source: "ydrzPhoneControl"
  };
}
function Qx(e) {
  return !V(e) || !Nx(e.height) ? null : {
    height: Math.ceil(e.height),
    ...typeof e.keyboardFocused == "boolean" ? { keyboardFocused: e.keyboardFocused } : {}
  };
}
function Jx(e) {
  if (!V(e) || e.status !== "success")
    return null;
  const n = typeof e.token == "string" ? e.token : "", t = typeof e.idLast4 == "string" ? e.idLast4 : "", r = typeof e.keyA == "string" ? e.keyA : "";
  return !n.trim() || !t.trim() || !r.trim() ? null : {
    status: "success",
    token: n,
    idLast4: t,
    keyA: r,
    requestId: typeof e.requestId == "string" ? e.requestId : void 0,
    message: typeof e.message == "string" ? e.message : void 0,
    mock: typeof e.mock == "boolean" ? e.mock : void 0
  };
}
const en = ["ok", "wifi", "non-mobile", "ambiguous", "unknown"];
function rn(e) {
  const n = {};
  for (const t of ["YD", "CT", "CU"])
    typeof e[t] == "string" && (n[t] = e[t]);
  return Object.keys(n).length > 0 ? n : void 0;
}
function tn(e) {
  if (!V(e))
    return { eligible: !1, reason: "unknown" };
  const n = en.includes(e.reason) ? e.reason : "unknown";
  let t;
  if (V(e.raw)) {
    const r = V(e.raw.carriers) ? rn(e.raw.carriers) : void 0, v = e.raw.networkType, B = v === "wifi" || v === "cellular" || v === "unknown" ? v : void 0, y = {
      ...typeof e.raw.code == "string" ? { code: e.raw.code } : {},
      ...typeof e.raw.carrier == "string" ? { carrier: e.raw.carrier } : {},
      ...r ? { carriers: r } : {},
      ...B ? { networkType: B } : {}
    };
    Object.keys(y).length > 0 && (t = y);
  }
  return { eligible: n === "ok", reason: n, ...t ? { raw: t } : {} };
}
function Br(e, n, t, r) {
  const v = (B) => {
    var y, h, C, x, i, E, a, l, u, o, f;
    if (!(r && B.origin !== r) && Wx(B.data, n))
      switch (B.data.type) {
        case wr:
          (y = t.onReady) == null || y.call(t);
          break;
        case kr:
          {
            const A = Jx(B.data.payload);
            if (!A) {
              (h = t.onError) == null || h.call(t, {
                code: "INVALID_SUCCESS_PAYLOAD",
                message: "验证结果返回异常，请稍后重试。"
              });
              break;
            }
            (C = t.onSuccess) == null || C.call(t, A);
          }
          break;
        case Rr:
          (x = t.onCancel) == null || x.call(t, B.data.payload);
          break;
        case Hr:
          (i = t.onError) == null || i.call(t, Ur(B.data.payload));
          break;
        case Pr:
          (E = t.onErrorNotice) == null || E.call(t, Kx(B.data.payload));
          break;
        case Ae:
          (a = t.onConfig) == null || a.call(t, jx(B.data.payload));
          break;
        case zr:
          {
            const A = Vx(B.data.payload);
            A && ((l = t.onPhoneReady) == null || l.call(t, A));
          }
          break;
        case Tr:
          {
            const A = Qx(B.data.payload);
            A && ((u = t.onResize) == null || u.call(t, A));
          }
          break;
        case Ce:
          (o = t.onClose) == null || o.call(t);
          break;
        case $r:
          (f = t.onProbeResult) == null || f.call(t, tn(B.data.payload));
          break;
      }
  };
  return e.addEventListener("message", v), () => e.removeEventListener("message", v);
}
const xn = 12, nn = 1, on = 500;
function ne(e) {
  return Number.isFinite(e);
}
function an(e) {
  return ne(e) && e >= 0;
}
function sn({
  targetWindow: e,
  frame: n,
  positioningLayer: t
}) {
  let r = "idle", v = 0, B = !1, y = 0, h, C, x = !1, i = !1, E;
  const a = () => {
    const F = e.visualViewport;
    return {
      top: (F == null ? void 0 : F.offsetTop) ?? 0,
      height: (F == null ? void 0 : F.height) ?? e.innerHeight
    };
  }, l = a().height, u = () => {
    h !== void 0 && (e.cancelAnimationFrame(h), h = void 0);
  }, o = () => {
    C !== void 0 && (e.clearTimeout(C), C = void 0);
  }, f = () => {
    y = 0, t.style.transform = "", delete n.dataset.assistanceAuthKeyboardConstrained, B && (n.style.height = `${v}px`);
  }, A = () => {
    const F = e.visualViewport ?? void 0;
    E !== F && (E == null || E.removeEventListener("resize", D), E == null || E.removeEventListener("scroll", D), E = F, x && (E == null || E.addEventListener("resize", D), E == null || E.addEventListener("scroll", D)));
  }, s = () => {
    x && (x = !1, e.removeEventListener("resize", D), E == null || E.removeEventListener("resize", D), E == null || E.removeEventListener("scroll", D), E = void 0);
  }, c = () => {
    r = "idle", u(), o(), s(), f();
  }, d = () => {
    if (h = void 0, i)
      return;
    if (A(), r === "idle") {
      f();
      return;
    }
    const F = a(), m = F.top + F.height, _ = t.getBoundingClientRect();
    if (!ne(F.top) || !ne(F.height) || F.height <= 0 || !ne(_.bottom))
      return;
    const p = Math.max(
      1,
      Math.floor(F.height - xn)
    ), g = Math.min(v, p);
    n.style.height = `${g}px`, g < v ? n.dataset.assistanceAuthKeyboardConstrained = "true" : delete n.dataset.assistanceAuthKeyboardConstrained;
    const k = _.bottom + y;
    y = Math.max(0, Math.ceil(k - m)), t.style.transform = y > 0 ? `translate3d(0, -${y}px, 0)` : "", r === "closing" && F.height >= l - nn && c();
  };
  function D() {
    i || (A(), h === void 0 && (h = e.requestAnimationFrame(d)));
  }
  const b = () => {
    x || (x = !0, e.addEventListener("resize", D)), A();
  };
  return {
    update(F) {
      if (!i) {
        if (an(F.height) && (v = Math.ceil(F.height), B = !0), F.keyboardFocused === !0) {
          r = "focused", o(), b(), D();
          return;
        }
        if (F.keyboardFocused === !1 && r !== "idle") {
          const m = r !== "closing";
          r = "closing", b(), D(), m && (o(), C = e.setTimeout(
            c,
            on
          ));
          return;
        }
        r === "idle" ? f() : D();
      }
    },
    dispose() {
      i = !0, u(), o(), s(), f();
    }
  };
}
const Ir = {
  version: "1.0.6",
  jsUrl: "https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js",
  cssUrl: "https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css",
  localJsPath: "src/wrapper/vendor/jssdk-1.0.6.min.js",
  localCssPath: "src/wrapper/vendor/new-control-style.css",
  jsSha256: "caf9cd6ef6efe96fcc91111ac7d0bf7d314d0bc657a80c4a1db168afcac18486",
  cssSha256: "35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e",
  retrievedAt: "2026-05-07",
  license: "official-customer-documentation-no-redistribution-license-text-found",
  redistributionStatus: "approved",
  approvalSource: "Project owner approved official CSS use on 2026-05-07",
  approvalDate: "2026-05-07",
  h5CssStrategy: "env-dynamic-remote-css",
  wrapperCssStrategy: "caller-required-local-asset",
  updatePolicy: "replace only after source URL/hash/license review"
};
function cn(e = Ir) {
  const n = [
    "version",
    "jsUrl",
    "cssUrl",
    "localCssPath",
    "cssSha256",
    "h5CssStrategy",
    "wrapperCssStrategy"
  ];
  for (const t of n)
    if (!e[t].trim())
      throw new Error(`Mobile official JSSDK metadata is missing ${t}`);
}
function fn(e = {}) {
  return Ir;
}
function Be() {
  return fn();
}
const un = "assistance-mobile-auth-official-css", dn = "assistance-mobile-auth-frame-shell", ln = "assistance-auth-frame-enter", vn = 280, hn = "verification", An = 12e3;
function Cn(e) {
  return Array.isArray(e) ? e.filter(
    (n) => !!n && typeof n.name == "string" && typeof n.link == "string"
  ) : [];
}
function Bn(e) {
  if (typeof e != "string")
    return e;
  const n = document.querySelector(e);
  if (!n)
    throw new Error("AssistanceMobileAuth container not found");
  return n;
}
const Er = "assistance-mobile-auth-official-jssdk";
function En() {
  const e = Be();
  if (cn(e), !e.jsUrl.trim())
    throw new Error("Mobile official JSSDK remote jsUrl is missing");
}
function pr() {
  if (typeof window > "u" || typeof document > "u")
    return Promise.reject(new Error("Mobile official JSSDK requires a browser window and document"));
  if (Ax(), window.YDRZAuthSF)
    return Promise.resolve();
  const e = Be().jsUrl, n = document.getElementById(Er);
  return n instanceof HTMLScriptElement ? n.dataset.assistanceMobileAuthLoaded === "true" && window.YDRZAuthSF ? Promise.resolve() : new Promise((t, r) => {
    n.addEventListener(
      "load",
      () => {
        n.dataset.assistanceMobileAuthLoaded = "true", t();
      },
      { once: !0 }
    ), n.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    );
  }) : new Promise((t, r) => {
    const v = document.createElement("script");
    v.id = Er, v.async = !0, v.src = e, v.addEventListener(
      "load",
      () => {
        if (v.dataset.assistanceMobileAuthLoaded = "true", !window.YDRZAuthSF) {
          r(new Error("Mobile official JSSDK loaded but did not initialize window.YDRZAuthSF"));
          return;
        }
        t();
      },
      { once: !0 }
    ), v.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    ), document.head.appendChild(v);
  });
}
function pn(e, n) {
  return `${e ? e.replace(/\/?$/, "/") : ""}vendor/${n}`;
}
function Fn() {
  const e = document.createElement("div");
  e.id = dn, e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), e.dataset.assistanceAuthOverlay = "true", e.style.position = "fixed", e.style.inset = "0", e.style.zIndex = "2147483647", e.style.background = "rgba(15,23,42,0)", e.style.display = "flex", e.style.alignItems = "flex-end", e.style.justifyContent = "center", e.style.opacity = "0", e.style.transition = "opacity 220ms ease, background-color 220ms ease", e.style.willChange = "opacity, background-color";
  const n = document.createElement("div");
  return n.dataset.assistanceAuthPositioningLayer = "true", n.style.display = "flex", n.style.width = "100%", n.style.justifyContent = "center", n.style.willChange = "transform", e.appendChild(n), { shell: e, positioningLayer: n };
}
function Dn(e) {
  return /iPad|iPhone|iPod/i.test(e.userAgent) || e.platform === "MacIntel" && e.maxTouchPoints > 1;
}
function bn(e) {
  if (!Dn(window.navigator))
    return !1;
  const n = document.createElement("input");
  n.type = "text", n.inputMode = "text", n.autocomplete = "off", n.tabIndex = -1, n.dataset.assistanceAuthKeyboardActivator = "true", n.setAttribute("autocapitalize", "characters"), n.setAttribute("autocorrect", "off"), n.style.position = "fixed", n.style.left = "0", n.style.bottom = "0", n.style.width = "1px", n.style.height = "1px", n.style.border = "0", n.style.padding = "0", n.style.opacity = "0.01", n.style.pointerEvents = "none", n.style.fontSize = "16px", n.style.color = "transparent", n.style.background = "transparent", n.style.caretColor = "transparent", e.appendChild(n);
  try {
    n.focus({ preventScroll: !0 });
  } catch {
    n.focus();
  }
  return document.activeElement === n;
}
function gn(e) {
  return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? `${e}dvh` : `${e}vh`;
}
function le(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function yn(e) {
  var v;
  const n = e.getBoundingClientRect().height;
  if (le(n))
    return n;
  const t = (v = /^(\d+(?:\.\d+)?)px$/.exec(e.style.height.trim())) == null ? void 0 : v[1], r = t === void 0 ? Number.NaN : Number(t);
  return le(r) ? r : null;
}
function mn(e, n) {
  return Or(e) ?? n;
}
function Or(e) {
  var B;
  if (le(e))
    return `${e}px`;
  if (typeof e != "string")
    return null;
  const n = e.trim();
  if (!n || /url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(n))
    return null;
  const t = "(?:px|vh|dvh|svh|lvh|%|rem)";
  if (new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d+)?${t}$`, "i").test(n))
    return n;
  const v = (B = n.match(/^calc\((.*)\)$/i)) == null ? void 0 : B[1];
  if (v && /^[\d\s.+\-*/()%a-z]+$/i.test(v)) {
    const y = new RegExp(`(?:0|[1-9]\\d*)(?:\\.\\d+)?${t}`, "gi"), h = v.replace(y, "");
    if (/^[\d\s.+\-*/()]*$/.test(h))
      return n;
  }
  return null;
}
const _n = "820px", Sn = "420px";
function wn(e) {
  const n = Or(e.authWindowHeight), t = n ? "fixed" : e.authWindowHeightMode === "auto" ? "auto" : "fixed";
  return {
    heightMode: t,
    height: n ?? (t === "auto" ? Sn : gn(92)),
    maxHeight: mn(e.authWindowMaxHeight, _n)
  };
}
function kn(e, n, t) {
  const r = document.createElement("iframe");
  return r.title = n, r.src = e, r.dataset.assistanceAuthFrame = "true", r.style.width = "100%", r.style.height = t.height, r.style.maxHeight = t.maxHeight, r.style.border = "0", r.style.borderRadius = "24px 24px 0 0", r.style.background = "#fff", r.style.boxShadow = "0 -16px 40px rgba(15,23,42,0.18)", r.style.transform = "translateY(100%)", r.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)", r.style.willChange = "transform", r.className = ln, r;
}
function Rn(e) {
  const n = document.createElement("iframe");
  return n.src = e, n.title = "", n.dataset.assistanceAuthProbe = "true", n.setAttribute("aria-hidden", "true"), n.tabIndex = -1, n.style.position = "fixed", n.style.left = "-99999px", n.style.top = "0", n.style.width = "1px", n.style.height = "1px", n.style.border = "0", n.style.opacity = "0", n.style.pointerEvents = "none", n;
}
function Hn() {
  return yr;
}
function Fr() {
  const e = Hn();
  return {
    verificationUrl: new URL(hn, e).toString(),
    allowedOrigin: new URL(e).origin
  };
}
function Pn(e, n) {
  let t = !1, r;
  e.getBoundingClientRect(), n.getBoundingClientRect();
  const v = () => {
    t || !e.isConnected || !n.isConnected || (e.style.background = "rgba(15,23,42,0.35)", e.style.opacity = "1", n.style.transform = "translateY(0)");
  }, B = requestAnimationFrame(() => {
    t || (r = requestAnimationFrame(v));
  });
  return () => {
    t = !0, cancelAnimationFrame(B), r !== void 0 && cancelAnimationFrame(r);
  };
}
function zn(e, n) {
  return new Promise((t) => {
    let r = !1;
    const v = () => {
      r || (r = !0, n.removeEventListener("transitionend", v), t());
    };
    n.addEventListener("transitionend", v), window.setTimeout(v, vn + 80), requestAnimationFrame(() => {
      e.style.background = "rgba(15,23,42,0)", e.style.opacity = "0", n.style.transform = "translateY(100%)";
    });
  });
}
function Tn(e) {
  const n = Be();
  return {
    href: pn(e, "new-control-style.css"),
    integrity: `sha256-${n.cssSha256}`,
    version: n.version
  };
}
function $n(e = {}) {
  const n = e.document ?? document, t = e.id ?? un, r = n.getElementById(t);
  if (r instanceof n.defaultView.HTMLLinkElement)
    return r;
  const v = Tn(e.baseUrl), B = n.createElement("link");
  return B.id = t, B.rel = "stylesheet", B.href = v.href, B.integrity = v.integrity, B.dataset.assistanceMobileAuthOfficialCssVersion = v.version, n.head.appendChild(B), B;
}
function Ln(e) {
  const n = typeof e.appId == "string" ? e.appId.trim() : "";
  if (!n)
    throw new Error("AssistanceMobileAuth: appId is required since 0.2.0");
  const t = _r(e.ui, { warn: Ix }), r = Ux(t);
  let v;
  if (e.container || e.authParams) {
    if (!e.container || !e.authParams)
      throw new Error("AssistanceMobileAuth legacy authorize mode requires container and authParams");
    En(), Bn(e.container), v = pr();
  }
  let B, y, h, C;
  function x() {
    return B ?? (B = Bx()), B;
  }
  function i(o = y) {
    var f, A, s;
    if (o) {
      if (y !== o) {
        o.shell.remove();
        return;
      }
      (f = o.keyboardAvoidance) == null || f.dispose(), o.keyboardAvoidance = void 0, (A = o.cancelPendingEnterAnimation) == null || A.call(o), o.cancelPendingEnterAnimation = void 0, (s = o.disposeMessageListener) == null || s.call(o), o.disposeMessageListener = void 0, o.shell.remove(), document.body.style.overflow = o.previousBodyOverflow, y = void 0;
    }
  }
  function E(o, f) {
    if (o.settled) {
      i(o);
      return;
    }
    const A = o.reject;
    o.settled = !0, i(o), A == null || A(f);
  }
  async function a(o) {
    var f;
    (f = o.cancelPendingEnterAnimation) == null || f.call(o), o.cancelPendingEnterAnimation = void 0, await zn(o.shell, o.frame), i(o);
  }
  function l(o) {
    var f;
    if (String(o.code) !== "103000") {
      (f = e.onError) == null || f.call(e, o);
      return;
    }
    x().initControl({
      styleOption: Dx(e.styleOption),
      beforeSubmit: () => !0,
      authReady: e.onAuthReady,
      success: e.onSuccess,
      error: e.onError
    });
  }
  const u = {
    authorize() {
      if (!e.container || !e.authParams)
        throw new Error("AssistanceMobileAuth authorize requires container and authParams");
      const o = Fx(e.authParams.authType), f = o === e.authParams.authType ? e.authParams : { ...e.authParams, authType: o }, A = v ?? pr();
      v = A, A.then(() => {
        x().showAuthPage({
          data: f,
          success: l,
          error: e.onError
        });
      }).catch((s) => {
        var d;
        const c = s instanceof Error ? s : new Error(String(s));
        (d = e.onError) == null || d.call(e, { code: "sdk-script-load-failed", message: c.message });
      });
    },
    clear(o) {
      x().clearControl(o);
    },
    open(o) {
      return u.openVerification(o);
    },
    openVerification(o) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth requires a browser window and document"));
      const f = y;
      f && E(f, new Error("Assistance auth replaced"));
      const A = hr(), s = Fr(), c = wn(e), d = qx({
        closable: e.closable,
        useCustomKeyboard: e.useCustomKeyboard,
        heightMode: c.heightMode
      }), D = Cr({
        verificationUrl: s.verificationUrl,
        sessionId: A,
        request: o,
        expectsUiConfig: r,
        appId: n
      }), { shell: b, positioningLayer: F } = Fn(), m = kn(
        D,
        e.authWindowTitle ?? "移动认证验证窗口",
        c
      );
      F.appendChild(m);
      const _ = {
        sessionId: A,
        shell: b,
        frame: m,
        previousBodyOverflow: document.body.style.overflow,
        settled: !1
      };
      if (c.heightMode === "auto" && (_.keyboardAvoidance = sn({
        targetWindow: window,
        frame: m,
        positioningLayer: F
      })), y = _, document.body.style.overflow = "hidden", document.body.appendChild(b), _.keyboardAvoidance && !d.useCustomKeyboard && bn(b)) {
        const w = yn(m);
        w !== null && _.keyboardAvoidance.update({
          height: w,
          keyboardFocused: !0
        });
      }
      _.cancelPendingEnterAnimation = Pn(b, m);
      const p = m.contentWindow, g = () => {
        !r || !p || p.postMessage(
          Gx(A, t),
          s.allowedOrigin
        );
      }, k = () => {
        p == null || p.postMessage(
          de(
            Lr,
            A,
            {
              styleOption: bx(e.styleOption) ?? {},
              agreements: Cn(e.agreements),
              iframeOptions: d
            }
          ),
          s.allowedOrigin
        );
      };
      return new Promise((w, T) => {
        _.reject = T;
        const $ = (z) => {
          _.settled || (_.settled = !0, a(_).then(z));
        };
        _.disposeMessageListener = Br(
          window,
          A,
          {
            onReady: () => {
              var z;
              y === _ && (k(), g(), (z = e.onReady) == null || z.call(e));
            },
            onSuccess: (z) => $(() => {
              var L;
              (L = e.onSuccess) == null || L.call(e, z), w(z);
            }),
            onCancel: (z) => $(() => {
              var L;
              (L = e.onCancel) == null || L.call(e, z), T(new Error("Assistance auth cancelled"));
            }),
            onError: (z) => $(() => {
              var L;
              (L = e.onError) == null || L.call(e, z), T(new Error(`Assistance auth error: ${z.message}`));
            }),
            // 非终态通知：纯透传，不 settle、不关弹窗、不 reject —— 终态语义不变。
            // settled 之后不再透传：关闭动画期间迟到的通知对调用方已无意义（流程已终结）。
            onErrorNotice: (z) => {
              var L;
              y === _ && !_.settled && ((L = e.onErrorNotice) == null || L.call(e, z));
            },
            onPhoneReady: (z) => {
              var L;
              y === _ && !_.settled && ((L = e.onPhoneReady) == null || L.call(e, z));
            },
            onResize: (z) => {
              y !== _ || d.heightMode !== "auto" || !_.keyboardAvoidance || _.keyboardAvoidance.update(z);
            },
            onClose: () => $(() => {
              var z;
              (z = e.onClose) == null || z.call(e), T(new Error("Assistance auth closed"));
            })
          },
          s.allowedOrigin
        );
      });
    },
    precheck(o) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth precheck requires a browser window and document"));
      if (h)
        return h;
      const f = o.timeoutMs ?? An, A = hr(), s = Fr(), c = Cr({
        verificationUrl: s.verificationUrl,
        sessionId: A,
        request: { scene: o.scene, requestId: o.requestId },
        mode: "probe",
        appId: n
      }), d = Rn(c), D = new Promise((b) => {
        let F = !1, m, _;
        const p = (g) => {
          F || (F = !0, _ !== void 0 && clearTimeout(_), m == null || m(), d.remove(), b(g));
        };
        C = () => p({ eligible: !1, reason: "unknown" }), m = Br(
          window,
          A,
          { onProbeResult: (g) => p(g) },
          s.allowedOrigin
        ), _ = setTimeout(() => p({ eligible: !1, reason: "unknown" }), f), document.body.appendChild(d);
      }).finally(() => {
        h = void 0, C = void 0;
      });
      return h = D, D;
    },
    close() {
      const o = y;
      if (o != null && o.frame.contentWindow && o.frame.contentWindow.postMessage(de(Ce, o.sessionId), "*"), o && !o.settled && o.reject) {
        o.settled = !0;
        const f = o.reject;
        a(o).then(() => {
          var A;
          (A = e.onClose) == null || A.call(e), f(new Error("Assistance auth closed"));
        });
        return;
      }
      i(o);
    },
    destroy() {
      C == null || C();
      const o = y;
      o && E(o, new Error("Assistance auth destroyed"));
    }
  };
  return u;
}
export {
  Ln as createAssistanceMobileAuthSdk,
  Tn as getAssistanceMobileAuthOfficialCssAsset,
  $n as injectAssistanceMobileAuthOfficialCss
};
