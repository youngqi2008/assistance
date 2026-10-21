var le = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function hn(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function vn(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var r = t.default;
  if (typeof r == "function") {
    var e = function n() {
      return this instanceof n ? Reflect.construct(r, arguments, this.constructor) : r.apply(this, arguments);
    };
    e.prototype = r.prototype;
  } else e = {};
  return Object.defineProperty(e, "__esModule", { value: !0 }), Object.keys(t).forEach(function(n) {
    var s = Object.getOwnPropertyDescriptor(t, n);
    Object.defineProperty(e, n, s.get ? s : {
      enumerable: !0,
      get: function() {
        return t[n];
      }
    });
  }), e;
}
var gt = { exports: {} };
function kn(t) {
  throw new Error('Could not dynamically require "' + t + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Bt = { exports: {} };
const Pn = {}, bn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Pn
}, Symbol.toStringTag, { value: "Module" })), Hn = /* @__PURE__ */ vn(bn);
var wn = Bt.exports, Ne;
function q() {
  return Ne || (Ne = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n();
    })(wn, function() {
      var e = e || (function(n, s) {
        var h;
        if (typeof window < "u" && window.crypto && (h = window.crypto), typeof self < "u" && self.crypto && (h = self.crypto), typeof globalThis < "u" && globalThis.crypto && (h = globalThis.crypto), !h && typeof window < "u" && window.msCrypto && (h = window.msCrypto), !h && typeof le < "u" && le.crypto && (h = le.crypto), !h && typeof kn == "function")
          try {
            h = Hn;
          } catch {
          }
        var y = function() {
          if (h) {
            if (typeof h.getRandomValues == "function")
              try {
                return h.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof h.randomBytes == "function")
              try {
                return h.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, A = Object.create || /* @__PURE__ */ (function() {
          function x() {
          }
          return function(f) {
            var l;
            return x.prototype = f, l = new x(), x.prototype = null, l;
          };
        })(), k = {}, i = k.lib = {}, a = i.Base = /* @__PURE__ */ (function() {
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
            extend: function(x) {
              var f = A(this);
              return x && f.mixIn(x), (!f.hasOwnProperty("init") || this.init === f.init) && (f.init = function() {
                f.$super.init.apply(this, arguments);
              }), f.init.prototype = f, f.$super = this, f;
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
              var x = this.extend();
              return x.init.apply(x, arguments), x;
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
            mixIn: function(x) {
              for (var f in x)
                x.hasOwnProperty(f) && (this[f] = x[f]);
              x.hasOwnProperty("toString") && (this.toString = x.toString);
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
        })(), P = i.WordArray = a.extend({
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
          init: function(x, f) {
            x = this.words = x || [], f != s ? this.sigBytes = f : this.sigBytes = x.length * 4;
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
          toString: function(x) {
            return (x || u).stringify(this);
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
          concat: function(x) {
            var f = this.words, l = x.words, d = this.sigBytes, b = x.sigBytes;
            if (this.clamp(), d % 4)
              for (var S = 0; S < b; S++) {
                var D = l[S >>> 2] >>> 24 - S % 4 * 8 & 255;
                f[d + S >>> 2] |= D << 24 - (d + S) % 4 * 8;
              }
            else
              for (var R = 0; R < b; R += 4)
                f[d + R >>> 2] = l[R >>> 2];
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
            var x = this.words, f = this.sigBytes;
            x[f >>> 2] &= 4294967295 << 32 - f % 4 * 8, x.length = n.ceil(f / 4);
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
            var x = a.clone.call(this);
            return x.words = this.words.slice(0), x;
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
          random: function(x) {
            for (var f = [], l = 0; l < x; l += 4)
              f.push(y());
            return new P.init(f, x);
          }
        }), o = k.enc = {}, u = o.Hex = {
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
          stringify: function(x) {
            for (var f = x.words, l = x.sigBytes, d = [], b = 0; b < l; b++) {
              var S = f[b >>> 2] >>> 24 - b % 4 * 8 & 255;
              d.push((S >>> 4).toString(16)), d.push((S & 15).toString(16));
            }
            return d.join("");
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
          parse: function(x) {
            for (var f = x.length, l = [], d = 0; d < f; d += 2)
              l[d >>> 3] |= parseInt(x.substr(d, 2), 16) << 24 - d % 8 * 4;
            return new P.init(l, f / 2);
          }
        }, p = o.Latin1 = {
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
          stringify: function(x) {
            for (var f = x.words, l = x.sigBytes, d = [], b = 0; b < l; b++) {
              var S = f[b >>> 2] >>> 24 - b % 4 * 8 & 255;
              d.push(String.fromCharCode(S));
            }
            return d.join("");
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
          parse: function(x) {
            for (var f = x.length, l = [], d = 0; d < f; d++)
              l[d >>> 2] |= (x.charCodeAt(d) & 255) << 24 - d % 4 * 8;
            return new P.init(l, f);
          }
        }, v = o.Utf8 = {
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
          stringify: function(x) {
            try {
              return decodeURIComponent(escape(p.stringify(x)));
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
          parse: function(x) {
            return p.parse(unescape(encodeURIComponent(x)));
          }
        }, c = i.BufferedBlockAlgorithm = a.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new P.init(), this._nDataBytes = 0;
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
          _append: function(x) {
            typeof x == "string" && (x = v.parse(x)), this._data.concat(x), this._nDataBytes += x.sigBytes;
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
          _process: function(x) {
            var f, l = this._data, d = l.words, b = l.sigBytes, S = this.blockSize, D = S * 4, R = b / D;
            x ? R = n.ceil(R) : R = n.max((R | 0) - this._minBufferSize, 0);
            var H = R * S, j = n.min(H * 4, b);
            if (H) {
              for (var g = 0; g < H; g += S)
                this._doProcessBlock(d, g);
              f = d.splice(0, H), l.sigBytes -= j;
            }
            return new P.init(f, j);
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
            var x = a.clone.call(this);
            return x._data = this._data.clone(), x;
          },
          _minBufferSize: 0
        });
        i.Hasher = c.extend({
          /**
           * Configuration options.
           */
          cfg: a.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(x) {
            this.cfg = this.cfg.extend(x), this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            c.reset.call(this), this._doReset();
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
          update: function(x) {
            return this._append(x), this._process(), this;
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
          finalize: function(x) {
            x && this._append(x);
            var f = this._doFinalize();
            return f;
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
          _createHelper: function(x) {
            return function(f, l) {
              return new x.init(l).finalize(f);
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
          _createHmacHelper: function(x) {
            return function(f, l) {
              return new w.HMAC.init(x, l).finalize(f);
            };
          }
        });
        var w = k.algo = {};
        return k;
      })(Math);
      return e;
    });
  })(Bt)), Bt.exports;
}
var Tt = { exports: {} }, yn = Tt.exports, Ie;
function ue() {
  return Ie || (Ie = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(yn, function(e) {
      return (function(n) {
        var s = e, h = s.lib, y = h.Base, A = h.WordArray, k = s.x64 = {};
        k.Word = y.extend({
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
          init: function(i, a) {
            this.high = i, this.low = a;
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
        }), k.WordArray = y.extend({
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
          init: function(i, a) {
            i = this.words = i || [], a != n ? this.sigBytes = a : this.sigBytes = i.length * 8;
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
            for (var i = this.words, a = i.length, P = [], o = 0; o < a; o++) {
              var u = i[o];
              P.push(u.high), P.push(u.low);
            }
            return A.create(P, this.sigBytes);
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
            for (var i = y.clone.call(this), a = i.words = this.words.slice(0), P = a.length, o = 0; o < P; o++)
              a[o] = a[o].clone();
            return i;
          }
        });
      })(), e;
    });
  })(Tt)), Tt.exports;
}
var Ct = { exports: {} }, Sn = Ct.exports, qe;
function Dn() {
  return qe || (qe = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Sn, function(e) {
      return (function() {
        if (typeof ArrayBuffer == "function") {
          var n = e, s = n.lib, h = s.WordArray, y = h.init, A = h.init = function(k) {
            if (k instanceof ArrayBuffer && (k = new Uint8Array(k)), (k instanceof Int8Array || typeof Uint8ClampedArray < "u" && k instanceof Uint8ClampedArray || k instanceof Int16Array || k instanceof Uint16Array || k instanceof Int32Array || k instanceof Uint32Array || k instanceof Float32Array || k instanceof Float64Array) && (k = new Uint8Array(k.buffer, k.byteOffset, k.byteLength)), k instanceof Uint8Array) {
              for (var i = k.byteLength, a = [], P = 0; P < i; P++)
                a[P >>> 2] |= k[P] << 24 - P % 4 * 8;
              y.call(this, a, i);
            } else
              y.apply(this, arguments);
          };
          A.prototype = h;
        }
      })(), e.lib.WordArray;
    });
  })(Ct)), Ct.exports;
}
var Ft = { exports: {} }, jn = Ft.exports, Ke;
function mn() {
  return Ke || (Ke = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(jn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = n.enc;
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
          stringify: function(k) {
            for (var i = k.words, a = k.sigBytes, P = [], o = 0; o < a; o += 2) {
              var u = i[o >>> 2] >>> 16 - o % 4 * 8 & 65535;
              P.push(String.fromCharCode(u));
            }
            return P.join("");
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
          parse: function(k) {
            for (var i = k.length, a = [], P = 0; P < i; P++)
              a[P >>> 1] |= k.charCodeAt(P) << 16 - P % 2 * 16;
            return h.create(a, i * 2);
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
          stringify: function(k) {
            for (var i = k.words, a = k.sigBytes, P = [], o = 0; o < a; o += 2) {
              var u = A(i[o >>> 2] >>> 16 - o % 4 * 8 & 65535);
              P.push(String.fromCharCode(u));
            }
            return P.join("");
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
          parse: function(k) {
            for (var i = k.length, a = [], P = 0; P < i; P++)
              a[P >>> 1] |= A(k.charCodeAt(P) << 16 - P % 2 * 16);
            return h.create(a, i * 2);
          }
        };
        function A(k) {
          return k << 8 & 4278255360 | k >>> 8 & 16711935;
        }
      })(), e.enc.Utf16;
    });
  })(Ft)), Ft.exports;
}
var Rt = { exports: {} }, gn = Rt.exports, Ue;
function ut() {
  return Ue || (Ue = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(gn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = n.enc;
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
          stringify: function(k) {
            var i = k.words, a = k.sigBytes, P = this._map;
            k.clamp();
            for (var o = [], u = 0; u < a; u += 3)
              for (var p = i[u >>> 2] >>> 24 - u % 4 * 8 & 255, v = i[u + 1 >>> 2] >>> 24 - (u + 1) % 4 * 8 & 255, c = i[u + 2 >>> 2] >>> 24 - (u + 2) % 4 * 8 & 255, w = p << 16 | v << 8 | c, x = 0; x < 4 && u + x * 0.75 < a; x++)
                o.push(P.charAt(w >>> 6 * (3 - x) & 63));
            var f = P.charAt(64);
            if (f)
              for (; o.length % 4; )
                o.push(f);
            return o.join("");
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
          parse: function(k) {
            var i = k.length, a = this._map, P = this._reverseMap;
            if (!P) {
              P = this._reverseMap = [];
              for (var o = 0; o < a.length; o++)
                P[a.charCodeAt(o)] = o;
            }
            var u = a.charAt(64);
            if (u) {
              var p = k.indexOf(u);
              p !== -1 && (i = p);
            }
            return A(k, i, P);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function A(k, i, a) {
          for (var P = [], o = 0, u = 0; u < i; u++)
            if (u % 4) {
              var p = a[k.charCodeAt(u - 1)] << u % 4 * 2, v = a[k.charCodeAt(u)] >>> 6 - u % 4 * 2, c = p | v;
              P[o >>> 2] |= c << 24 - o % 4 * 8, o++;
            }
          return h.create(P, o);
        }
      })(), e.enc.Base64;
    });
  })(Rt)), Rt.exports;
}
var Xt = { exports: {} }, Bn = Xt.exports, Ge;
function Tn() {
  return Ge || (Ge = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Bn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = n.enc;
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
          stringify: function(k, i) {
            i === void 0 && (i = !0);
            var a = k.words, P = k.sigBytes, o = i ? this._safe_map : this._map;
            k.clamp();
            for (var u = [], p = 0; p < P; p += 3)
              for (var v = a[p >>> 2] >>> 24 - p % 4 * 8 & 255, c = a[p + 1 >>> 2] >>> 24 - (p + 1) % 4 * 8 & 255, w = a[p + 2 >>> 2] >>> 24 - (p + 2) % 4 * 8 & 255, x = v << 16 | c << 8 | w, f = 0; f < 4 && p + f * 0.75 < P; f++)
                u.push(o.charAt(x >>> 6 * (3 - f) & 63));
            var l = o.charAt(64);
            if (l)
              for (; u.length % 4; )
                u.push(l);
            return u.join("");
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
          parse: function(k, i) {
            i === void 0 && (i = !0);
            var a = k.length, P = i ? this._safe_map : this._map, o = this._reverseMap;
            if (!o) {
              o = this._reverseMap = [];
              for (var u = 0; u < P.length; u++)
                o[P.charCodeAt(u)] = u;
            }
            var p = P.charAt(64);
            if (p) {
              var v = k.indexOf(p);
              v !== -1 && (a = v);
            }
            return A(k, a, o);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function A(k, i, a) {
          for (var P = [], o = 0, u = 0; u < i; u++)
            if (u % 4) {
              var p = a[k.charCodeAt(u - 1)] << u % 4 * 2, v = a[k.charCodeAt(u)] >>> 6 - u % 4 * 2, c = p | v;
              P[o >>> 2] |= c << 24 - o % 4 * 8, o++;
            }
          return h.create(P, o);
        }
      })(), e.enc.Base64url;
    });
  })(Xt)), Xt.exports;
}
var Et = { exports: {} }, Cn = Et.exports, ze;
function lt() {
  return ze || (ze = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Cn, function(e) {
      return (function(n) {
        var s = e, h = s.lib, y = h.WordArray, A = h.Hasher, k = s.algo, i = [];
        (function() {
          for (var v = 0; v < 64; v++)
            i[v] = n.abs(n.sin(v + 1)) * 4294967296 | 0;
        })();
        var a = k.MD5 = A.extend({
          _doReset: function() {
            this._hash = new y.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(v, c) {
            for (var w = 0; w < 16; w++) {
              var x = c + w, f = v[x];
              v[x] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360;
            }
            var l = this._hash.words, d = v[c + 0], b = v[c + 1], S = v[c + 2], D = v[c + 3], R = v[c + 4], H = v[c + 5], j = v[c + 6], g = v[c + 7], B = v[c + 8], E = v[c + 9], O = v[c + 10], V = v[c + 11], N = v[c + 12], W = v[c + 13], G = v[c + 14], K = v[c + 15], m = l[0], C = l[1], F = l[2], T = l[3];
            m = P(m, C, F, T, d, 7, i[0]), T = P(T, m, C, F, b, 12, i[1]), F = P(F, T, m, C, S, 17, i[2]), C = P(C, F, T, m, D, 22, i[3]), m = P(m, C, F, T, R, 7, i[4]), T = P(T, m, C, F, H, 12, i[5]), F = P(F, T, m, C, j, 17, i[6]), C = P(C, F, T, m, g, 22, i[7]), m = P(m, C, F, T, B, 7, i[8]), T = P(T, m, C, F, E, 12, i[9]), F = P(F, T, m, C, O, 17, i[10]), C = P(C, F, T, m, V, 22, i[11]), m = P(m, C, F, T, N, 7, i[12]), T = P(T, m, C, F, W, 12, i[13]), F = P(F, T, m, C, G, 17, i[14]), C = P(C, F, T, m, K, 22, i[15]), m = o(m, C, F, T, b, 5, i[16]), T = o(T, m, C, F, j, 9, i[17]), F = o(F, T, m, C, V, 14, i[18]), C = o(C, F, T, m, d, 20, i[19]), m = o(m, C, F, T, H, 5, i[20]), T = o(T, m, C, F, O, 9, i[21]), F = o(F, T, m, C, K, 14, i[22]), C = o(C, F, T, m, R, 20, i[23]), m = o(m, C, F, T, E, 5, i[24]), T = o(T, m, C, F, G, 9, i[25]), F = o(F, T, m, C, D, 14, i[26]), C = o(C, F, T, m, B, 20, i[27]), m = o(m, C, F, T, W, 5, i[28]), T = o(T, m, C, F, S, 9, i[29]), F = o(F, T, m, C, g, 14, i[30]), C = o(C, F, T, m, N, 20, i[31]), m = u(m, C, F, T, H, 4, i[32]), T = u(T, m, C, F, B, 11, i[33]), F = u(F, T, m, C, V, 16, i[34]), C = u(C, F, T, m, G, 23, i[35]), m = u(m, C, F, T, b, 4, i[36]), T = u(T, m, C, F, R, 11, i[37]), F = u(F, T, m, C, g, 16, i[38]), C = u(C, F, T, m, O, 23, i[39]), m = u(m, C, F, T, W, 4, i[40]), T = u(T, m, C, F, d, 11, i[41]), F = u(F, T, m, C, D, 16, i[42]), C = u(C, F, T, m, j, 23, i[43]), m = u(m, C, F, T, E, 4, i[44]), T = u(T, m, C, F, N, 11, i[45]), F = u(F, T, m, C, K, 16, i[46]), C = u(C, F, T, m, S, 23, i[47]), m = p(m, C, F, T, d, 6, i[48]), T = p(T, m, C, F, g, 10, i[49]), F = p(F, T, m, C, G, 15, i[50]), C = p(C, F, T, m, H, 21, i[51]), m = p(m, C, F, T, N, 6, i[52]), T = p(T, m, C, F, D, 10, i[53]), F = p(F, T, m, C, O, 15, i[54]), C = p(C, F, T, m, b, 21, i[55]), m = p(m, C, F, T, B, 6, i[56]), T = p(T, m, C, F, K, 10, i[57]), F = p(F, T, m, C, j, 15, i[58]), C = p(C, F, T, m, W, 21, i[59]), m = p(m, C, F, T, R, 6, i[60]), T = p(T, m, C, F, V, 10, i[61]), F = p(F, T, m, C, S, 15, i[62]), C = p(C, F, T, m, E, 21, i[63]), l[0] = l[0] + m | 0, l[1] = l[1] + C | 0, l[2] = l[2] + F | 0, l[3] = l[3] + T | 0;
          },
          _doFinalize: function() {
            var v = this._data, c = v.words, w = this._nDataBytes * 8, x = v.sigBytes * 8;
            c[x >>> 5] |= 128 << 24 - x % 32;
            var f = n.floor(w / 4294967296), l = w;
            c[(x + 64 >>> 9 << 4) + 15] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, c[(x + 64 >>> 9 << 4) + 14] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360, v.sigBytes = (c.length + 1) * 4, this._process();
            for (var d = this._hash, b = d.words, S = 0; S < 4; S++) {
              var D = b[S];
              b[S] = (D << 8 | D >>> 24) & 16711935 | (D << 24 | D >>> 8) & 4278255360;
            }
            return d;
          },
          clone: function() {
            var v = A.clone.call(this);
            return v._hash = this._hash.clone(), v;
          }
        });
        function P(v, c, w, x, f, l, d) {
          var b = v + (c & w | ~c & x) + f + d;
          return (b << l | b >>> 32 - l) + c;
        }
        function o(v, c, w, x, f, l, d) {
          var b = v + (c & x | w & ~x) + f + d;
          return (b << l | b >>> 32 - l) + c;
        }
        function u(v, c, w, x, f, l, d) {
          var b = v + (c ^ w ^ x) + f + d;
          return (b << l | b >>> 32 - l) + c;
        }
        function p(v, c, w, x, f, l, d) {
          var b = v + (w ^ (c | ~x)) + f + d;
          return (b << l | b >>> 32 - l) + c;
        }
        s.MD5 = A._createHelper(a), s.HmacMD5 = A._createHmacHelper(a);
      })(Math), e.MD5;
    });
  })(Et)), Et.exports;
}
var Ot = { exports: {} }, Fn = Ot.exports, Me;
function X0() {
  return Me || (Me = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Fn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = s.Hasher, A = n.algo, k = [], i = A.SHA1 = y.extend({
          _doReset: function() {
            this._hash = new h.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(a, P) {
            for (var o = this._hash.words, u = o[0], p = o[1], v = o[2], c = o[3], w = o[4], x = 0; x < 80; x++) {
              if (x < 16)
                k[x] = a[P + x] | 0;
              else {
                var f = k[x - 3] ^ k[x - 8] ^ k[x - 14] ^ k[x - 16];
                k[x] = f << 1 | f >>> 31;
              }
              var l = (u << 5 | u >>> 27) + w + k[x];
              x < 20 ? l += (p & v | ~p & c) + 1518500249 : x < 40 ? l += (p ^ v ^ c) + 1859775393 : x < 60 ? l += (p & v | p & c | v & c) - 1894007588 : l += (p ^ v ^ c) - 899497514, w = c, c = v, v = p << 30 | p >>> 2, p = u, u = l;
            }
            o[0] = o[0] + u | 0, o[1] = o[1] + p | 0, o[2] = o[2] + v | 0, o[3] = o[3] + c | 0, o[4] = o[4] + w | 0;
          },
          _doFinalize: function() {
            var a = this._data, P = a.words, o = this._nDataBytes * 8, u = a.sigBytes * 8;
            return P[u >>> 5] |= 128 << 24 - u % 32, P[(u + 64 >>> 9 << 4) + 14] = Math.floor(o / 4294967296), P[(u + 64 >>> 9 << 4) + 15] = o, a.sigBytes = P.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var a = y.clone.call(this);
            return a._hash = this._hash.clone(), a;
          }
        });
        n.SHA1 = y._createHelper(i), n.HmacSHA1 = y._createHmacHelper(i);
      })(), e.SHA1;
    });
  })(Ot)), Ot.exports;
}
var Wt = { exports: {} }, Rn = Wt.exports, Ye;
function He() {
  return Ye || (Ye = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Rn, function(e) {
      return (function(n) {
        var s = e, h = s.lib, y = h.WordArray, A = h.Hasher, k = s.algo, i = [], a = [];
        (function() {
          function u(w) {
            for (var x = n.sqrt(w), f = 2; f <= x; f++)
              if (!(w % f))
                return !1;
            return !0;
          }
          function p(w) {
            return (w - (w | 0)) * 4294967296 | 0;
          }
          for (var v = 2, c = 0; c < 64; )
            u(v) && (c < 8 && (i[c] = p(n.pow(v, 1 / 2))), a[c] = p(n.pow(v, 1 / 3)), c++), v++;
        })();
        var P = [], o = k.SHA256 = A.extend({
          _doReset: function() {
            this._hash = new y.init(i.slice(0));
          },
          _doProcessBlock: function(u, p) {
            for (var v = this._hash.words, c = v[0], w = v[1], x = v[2], f = v[3], l = v[4], d = v[5], b = v[6], S = v[7], D = 0; D < 64; D++) {
              if (D < 16)
                P[D] = u[p + D] | 0;
              else {
                var R = P[D - 15], H = (R << 25 | R >>> 7) ^ (R << 14 | R >>> 18) ^ R >>> 3, j = P[D - 2], g = (j << 15 | j >>> 17) ^ (j << 13 | j >>> 19) ^ j >>> 10;
                P[D] = H + P[D - 7] + g + P[D - 16];
              }
              var B = l & d ^ ~l & b, E = c & w ^ c & x ^ w & x, O = (c << 30 | c >>> 2) ^ (c << 19 | c >>> 13) ^ (c << 10 | c >>> 22), V = (l << 26 | l >>> 6) ^ (l << 21 | l >>> 11) ^ (l << 7 | l >>> 25), N = S + V + B + a[D] + P[D], W = O + E;
              S = b, b = d, d = l, l = f + N | 0, f = x, x = w, w = c, c = N + W | 0;
            }
            v[0] = v[0] + c | 0, v[1] = v[1] + w | 0, v[2] = v[2] + x | 0, v[3] = v[3] + f | 0, v[4] = v[4] + l | 0, v[5] = v[5] + d | 0, v[6] = v[6] + b | 0, v[7] = v[7] + S | 0;
          },
          _doFinalize: function() {
            var u = this._data, p = u.words, v = this._nDataBytes * 8, c = u.sigBytes * 8;
            return p[c >>> 5] |= 128 << 24 - c % 32, p[(c + 64 >>> 9 << 4) + 14] = n.floor(v / 4294967296), p[(c + 64 >>> 9 << 4) + 15] = v, u.sigBytes = p.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var u = A.clone.call(this);
            return u._hash = this._hash.clone(), u;
          }
        });
        s.SHA256 = A._createHelper(o), s.HmacSHA256 = A._createHmacHelper(o);
      })(Math), e.SHA256;
    });
  })(Wt)), Wt.exports;
}
var Vt = { exports: {} }, Xn = Vt.exports, Ze;
function En() {
  return Ze || (Ze = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), He());
    })(Xn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = n.algo, A = y.SHA256, k = y.SHA224 = A.extend({
          _doReset: function() {
            this._hash = new h.init([
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
            var i = A._doFinalize.call(this);
            return i.sigBytes -= 4, i;
          }
        });
        n.SHA224 = A._createHelper(k), n.HmacSHA224 = A._createHmacHelper(k);
      })(), e.SHA224;
    });
  })(Vt)), Vt.exports;
}
var Lt = { exports: {} }, On = Lt.exports, Je;
function E0() {
  return Je || (Je = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ue());
    })(On, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.Hasher, y = n.x64, A = y.Word, k = y.WordArray, i = n.algo;
        function a() {
          return A.create.apply(A, arguments);
        }
        var P = [
          a(1116352408, 3609767458),
          a(1899447441, 602891725),
          a(3049323471, 3964484399),
          a(3921009573, 2173295548),
          a(961987163, 4081628472),
          a(1508970993, 3053834265),
          a(2453635748, 2937671579),
          a(2870763221, 3664609560),
          a(3624381080, 2734883394),
          a(310598401, 1164996542),
          a(607225278, 1323610764),
          a(1426881987, 3590304994),
          a(1925078388, 4068182383),
          a(2162078206, 991336113),
          a(2614888103, 633803317),
          a(3248222580, 3479774868),
          a(3835390401, 2666613458),
          a(4022224774, 944711139),
          a(264347078, 2341262773),
          a(604807628, 2007800933),
          a(770255983, 1495990901),
          a(1249150122, 1856431235),
          a(1555081692, 3175218132),
          a(1996064986, 2198950837),
          a(2554220882, 3999719339),
          a(2821834349, 766784016),
          a(2952996808, 2566594879),
          a(3210313671, 3203337956),
          a(3336571891, 1034457026),
          a(3584528711, 2466948901),
          a(113926993, 3758326383),
          a(338241895, 168717936),
          a(666307205, 1188179964),
          a(773529912, 1546045734),
          a(1294757372, 1522805485),
          a(1396182291, 2643833823),
          a(1695183700, 2343527390),
          a(1986661051, 1014477480),
          a(2177026350, 1206759142),
          a(2456956037, 344077627),
          a(2730485921, 1290863460),
          a(2820302411, 3158454273),
          a(3259730800, 3505952657),
          a(3345764771, 106217008),
          a(3516065817, 3606008344),
          a(3600352804, 1432725776),
          a(4094571909, 1467031594),
          a(275423344, 851169720),
          a(430227734, 3100823752),
          a(506948616, 1363258195),
          a(659060556, 3750685593),
          a(883997877, 3785050280),
          a(958139571, 3318307427),
          a(1322822218, 3812723403),
          a(1537002063, 2003034995),
          a(1747873779, 3602036899),
          a(1955562222, 1575990012),
          a(2024104815, 1125592928),
          a(2227730452, 2716904306),
          a(2361852424, 442776044),
          a(2428436474, 593698344),
          a(2756734187, 3733110249),
          a(3204031479, 2999351573),
          a(3329325298, 3815920427),
          a(3391569614, 3928383900),
          a(3515267271, 566280711),
          a(3940187606, 3454069534),
          a(4118630271, 4000239992),
          a(116418474, 1914138554),
          a(174292421, 2731055270),
          a(289380356, 3203993006),
          a(460393269, 320620315),
          a(685471733, 587496836),
          a(852142971, 1086792851),
          a(1017036298, 365543100),
          a(1126000580, 2618297676),
          a(1288033470, 3409855158),
          a(1501505948, 4234509866),
          a(1607167915, 987167468),
          a(1816402316, 1246189591)
        ], o = [];
        (function() {
          for (var p = 0; p < 80; p++)
            o[p] = a();
        })();
        var u = i.SHA512 = h.extend({
          _doReset: function() {
            this._hash = new k.init([
              new A.init(1779033703, 4089235720),
              new A.init(3144134277, 2227873595),
              new A.init(1013904242, 4271175723),
              new A.init(2773480762, 1595750129),
              new A.init(1359893119, 2917565137),
              new A.init(2600822924, 725511199),
              new A.init(528734635, 4215389547),
              new A.init(1541459225, 327033209)
            ]);
          },
          _doProcessBlock: function(p, v) {
            for (var c = this._hash.words, w = c[0], x = c[1], f = c[2], l = c[3], d = c[4], b = c[5], S = c[6], D = c[7], R = w.high, H = w.low, j = x.high, g = x.low, B = f.high, E = f.low, O = l.high, V = l.low, N = d.high, W = d.low, G = b.high, K = b.low, m = S.high, C = S.low, F = D.high, T = D.low, z = R, U = H, I = j, X = g, it = B, xt = E, st = O, ft = V, nt = N, $ = W, ht = G, Y = K, M = m, J = C, ot = F, tt = T, Q = 0; Q < 80; Q++) {
              var L, at, mt = o[Q];
              if (Q < 16)
                at = mt.high = p[v + Q * 2] | 0, L = mt.low = p[v + Q * 2 + 1] | 0;
              else {
                var ge = o[Q - 15], vt = ge.high, Ht = ge.low, nn = (vt >>> 1 | Ht << 31) ^ (vt >>> 8 | Ht << 24) ^ vt >>> 7, Be = (Ht >>> 1 | vt << 31) ^ (Ht >>> 8 | vt << 24) ^ (Ht >>> 7 | vt << 25), Te = o[Q - 2], kt = Te.high, wt = Te.low, rn = (kt >>> 19 | wt << 13) ^ (kt << 3 | wt >>> 29) ^ kt >>> 6, Ce = (wt >>> 19 | kt << 13) ^ (wt << 3 | kt >>> 29) ^ (wt >>> 6 | kt << 26), Fe = o[Q - 7], on = Fe.high, an = Fe.low, Re = o[Q - 16], dn = Re.high, Xe = Re.low;
                L = Be + an, at = nn + on + (L >>> 0 < Be >>> 0 ? 1 : 0), L = L + Ce, at = at + rn + (L >>> 0 < Ce >>> 0 ? 1 : 0), L = L + Xe, at = at + dn + (L >>> 0 < Xe >>> 0 ? 1 : 0), mt.high = at, mt.low = L;
              }
              var xn = nt & ht ^ ~nt & M, Ee = $ & Y ^ ~$ & J, sn = z & I ^ z & it ^ I & it, fn = U & X ^ U & xt ^ X & xt, cn = (z >>> 28 | U << 4) ^ (z << 30 | U >>> 2) ^ (z << 25 | U >>> 7), Oe = (U >>> 28 | z << 4) ^ (U << 30 | z >>> 2) ^ (U << 25 | z >>> 7), pn = (nt >>> 14 | $ << 18) ^ (nt >>> 18 | $ << 14) ^ (nt << 23 | $ >>> 9), An = ($ >>> 14 | nt << 18) ^ ($ >>> 18 | nt << 14) ^ ($ << 23 | nt >>> 9), We = P[Q], un = We.high, Ve = We.low, rt = tt + An, ct = ot + pn + (rt >>> 0 < tt >>> 0 ? 1 : 0), rt = rt + Ee, ct = ct + xn + (rt >>> 0 < Ee >>> 0 ? 1 : 0), rt = rt + Ve, ct = ct + un + (rt >>> 0 < Ve >>> 0 ? 1 : 0), rt = rt + L, ct = ct + at + (rt >>> 0 < L >>> 0 ? 1 : 0), Le = Oe + fn, ln = cn + sn + (Le >>> 0 < Oe >>> 0 ? 1 : 0);
              ot = M, tt = J, M = ht, J = Y, ht = nt, Y = $, $ = ft + rt | 0, nt = st + ct + ($ >>> 0 < ft >>> 0 ? 1 : 0) | 0, st = it, ft = xt, it = I, xt = X, I = z, X = U, U = rt + Le | 0, z = ct + ln + (U >>> 0 < rt >>> 0 ? 1 : 0) | 0;
            }
            H = w.low = H + U, w.high = R + z + (H >>> 0 < U >>> 0 ? 1 : 0), g = x.low = g + X, x.high = j + I + (g >>> 0 < X >>> 0 ? 1 : 0), E = f.low = E + xt, f.high = B + it + (E >>> 0 < xt >>> 0 ? 1 : 0), V = l.low = V + ft, l.high = O + st + (V >>> 0 < ft >>> 0 ? 1 : 0), W = d.low = W + $, d.high = N + nt + (W >>> 0 < $ >>> 0 ? 1 : 0), K = b.low = K + Y, b.high = G + ht + (K >>> 0 < Y >>> 0 ? 1 : 0), C = S.low = C + J, S.high = m + M + (C >>> 0 < J >>> 0 ? 1 : 0), T = D.low = T + tt, D.high = F + ot + (T >>> 0 < tt >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var p = this._data, v = p.words, c = this._nDataBytes * 8, w = p.sigBytes * 8;
            v[w >>> 5] |= 128 << 24 - w % 32, v[(w + 128 >>> 10 << 5) + 30] = Math.floor(c / 4294967296), v[(w + 128 >>> 10 << 5) + 31] = c, p.sigBytes = v.length * 4, this._process();
            var x = this._hash.toX32();
            return x;
          },
          clone: function() {
            var p = h.clone.call(this);
            return p._hash = this._hash.clone(), p;
          },
          blockSize: 1024 / 32
        });
        n.SHA512 = h._createHelper(u), n.HmacSHA512 = h._createHmacHelper(u);
      })(), e.SHA512;
    });
  })(Lt)), Lt.exports;
}
var Nt = { exports: {} }, Wn = Nt.exports, Qe;
function Vn() {
  return Qe || (Qe = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ue(), E0());
    })(Wn, function(e) {
      return (function() {
        var n = e, s = n.x64, h = s.Word, y = s.WordArray, A = n.algo, k = A.SHA512, i = A.SHA384 = k.extend({
          _doReset: function() {
            this._hash = new y.init([
              new h.init(3418070365, 3238371032),
              new h.init(1654270250, 914150663),
              new h.init(2438529370, 812702999),
              new h.init(355462360, 4144912697),
              new h.init(1731405415, 4290775857),
              new h.init(2394180231, 1750603025),
              new h.init(3675008525, 1694076839),
              new h.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var a = k._doFinalize.call(this);
            return a.sigBytes -= 16, a;
          }
        });
        n.SHA384 = k._createHelper(i), n.HmacSHA384 = k._createHmacHelper(i);
      })(), e.SHA384;
    });
  })(Nt)), Nt.exports;
}
var It = { exports: {} }, Ln = It.exports, _e;
function Nn() {
  return _e || (_e = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ue());
    })(Ln, function(e) {
      return (function(n) {
        var s = e, h = s.lib, y = h.WordArray, A = h.Hasher, k = s.x64, i = k.Word, a = s.algo, P = [], o = [], u = [];
        (function() {
          for (var c = 1, w = 0, x = 0; x < 24; x++) {
            P[c + 5 * w] = (x + 1) * (x + 2) / 2 % 64;
            var f = w % 5, l = (2 * c + 3 * w) % 5;
            c = f, w = l;
          }
          for (var c = 0; c < 5; c++)
            for (var w = 0; w < 5; w++)
              o[c + 5 * w] = w + (2 * c + 3 * w) % 5 * 5;
          for (var d = 1, b = 0; b < 24; b++) {
            for (var S = 0, D = 0, R = 0; R < 7; R++) {
              if (d & 1) {
                var H = (1 << R) - 1;
                H < 32 ? D ^= 1 << H : S ^= 1 << H - 32;
              }
              d & 128 ? d = d << 1 ^ 113 : d <<= 1;
            }
            u[b] = i.create(S, D);
          }
        })();
        var p = [];
        (function() {
          for (var c = 0; c < 25; c++)
            p[c] = i.create();
        })();
        var v = a.SHA3 = A.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: A.cfg.extend({
            outputLength: 512
          }),
          _doReset: function() {
            for (var c = this._state = [], w = 0; w < 25; w++)
              c[w] = new i.init();
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(c, w) {
            for (var x = this._state, f = this.blockSize / 2, l = 0; l < f; l++) {
              var d = c[w + 2 * l], b = c[w + 2 * l + 1];
              d = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360, b = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360;
              var S = x[l];
              S.high ^= b, S.low ^= d;
            }
            for (var D = 0; D < 24; D++) {
              for (var R = 0; R < 5; R++) {
                for (var H = 0, j = 0, g = 0; g < 5; g++) {
                  var S = x[R + 5 * g];
                  H ^= S.high, j ^= S.low;
                }
                var B = p[R];
                B.high = H, B.low = j;
              }
              for (var R = 0; R < 5; R++)
                for (var E = p[(R + 4) % 5], O = p[(R + 1) % 5], V = O.high, N = O.low, H = E.high ^ (V << 1 | N >>> 31), j = E.low ^ (N << 1 | V >>> 31), g = 0; g < 5; g++) {
                  var S = x[R + 5 * g];
                  S.high ^= H, S.low ^= j;
                }
              for (var W = 1; W < 25; W++) {
                var H, j, S = x[W], G = S.high, K = S.low, m = P[W];
                m < 32 ? (H = G << m | K >>> 32 - m, j = K << m | G >>> 32 - m) : (H = K << m - 32 | G >>> 64 - m, j = G << m - 32 | K >>> 64 - m);
                var C = p[o[W]];
                C.high = H, C.low = j;
              }
              var F = p[0], T = x[0];
              F.high = T.high, F.low = T.low;
              for (var R = 0; R < 5; R++)
                for (var g = 0; g < 5; g++) {
                  var W = R + 5 * g, S = x[W], z = p[W], U = p[(R + 1) % 5 + 5 * g], I = p[(R + 2) % 5 + 5 * g];
                  S.high = z.high ^ ~U.high & I.high, S.low = z.low ^ ~U.low & I.low;
                }
              var S = x[0], X = u[D];
              S.high ^= X.high, S.low ^= X.low;
            }
          },
          _doFinalize: function() {
            var c = this._data, w = c.words;
            this._nDataBytes * 8;
            var x = c.sigBytes * 8, f = this.blockSize * 32;
            w[x >>> 5] |= 1 << 24 - x % 32, w[(n.ceil((x + 1) / f) * f >>> 5) - 1] |= 128, c.sigBytes = w.length * 4, this._process();
            for (var l = this._state, d = this.cfg.outputLength / 8, b = d / 8, S = [], D = 0; D < b; D++) {
              var R = l[D], H = R.high, j = R.low;
              H = (H << 8 | H >>> 24) & 16711935 | (H << 24 | H >>> 8) & 4278255360, j = (j << 8 | j >>> 24) & 16711935 | (j << 24 | j >>> 8) & 4278255360, S.push(j), S.push(H);
            }
            return new y.init(S, d);
          },
          clone: function() {
            for (var c = A.clone.call(this), w = c._state = this._state.slice(0), x = 0; x < 25; x++)
              w[x] = w[x].clone();
            return c;
          }
        });
        s.SHA3 = A._createHelper(v), s.HmacSHA3 = A._createHmacHelper(v);
      })(Math), e.SHA3;
    });
  })(It)), It.exports;
}
var qt = { exports: {} }, In = qt.exports, $e;
function qn() {
  return $e || ($e = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(In, function(e) {
      /** @preserve
      			(c) 2012 by Cédric Mesnil. All rights reserved.
      
      			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
      
      			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
      
      			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      			*/
      return (function(n) {
        var s = e, h = s.lib, y = h.WordArray, A = h.Hasher, k = s.algo, i = y.create([
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
        ]), a = y.create([
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
        ]), P = y.create([
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
        ]), o = y.create([
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
        ]), u = y.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), p = y.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), v = k.RIPEMD160 = A.extend({
          _doReset: function() {
            this._hash = y.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(b, S) {
            for (var D = 0; D < 16; D++) {
              var R = S + D, H = b[R];
              b[R] = (H << 8 | H >>> 24) & 16711935 | (H << 24 | H >>> 8) & 4278255360;
            }
            var j = this._hash.words, g = u.words, B = p.words, E = i.words, O = a.words, V = P.words, N = o.words, W, G, K, m, C, F, T, z, U, I;
            F = W = j[0], T = G = j[1], z = K = j[2], U = m = j[3], I = C = j[4];
            for (var X, D = 0; D < 80; D += 1)
              X = W + b[S + E[D]] | 0, D < 16 ? X += c(G, K, m) + g[0] : D < 32 ? X += w(G, K, m) + g[1] : D < 48 ? X += x(G, K, m) + g[2] : D < 64 ? X += f(G, K, m) + g[3] : X += l(G, K, m) + g[4], X = X | 0, X = d(X, V[D]), X = X + C | 0, W = C, C = m, m = d(K, 10), K = G, G = X, X = F + b[S + O[D]] | 0, D < 16 ? X += l(T, z, U) + B[0] : D < 32 ? X += f(T, z, U) + B[1] : D < 48 ? X += x(T, z, U) + B[2] : D < 64 ? X += w(T, z, U) + B[3] : X += c(T, z, U) + B[4], X = X | 0, X = d(X, N[D]), X = X + I | 0, F = I, I = U, U = d(z, 10), z = T, T = X;
            X = j[1] + K + U | 0, j[1] = j[2] + m + I | 0, j[2] = j[3] + C + F | 0, j[3] = j[4] + W + T | 0, j[4] = j[0] + G + z | 0, j[0] = X;
          },
          _doFinalize: function() {
            var b = this._data, S = b.words, D = this._nDataBytes * 8, R = b.sigBytes * 8;
            S[R >>> 5] |= 128 << 24 - R % 32, S[(R + 64 >>> 9 << 4) + 14] = (D << 8 | D >>> 24) & 16711935 | (D << 24 | D >>> 8) & 4278255360, b.sigBytes = (S.length + 1) * 4, this._process();
            for (var H = this._hash, j = H.words, g = 0; g < 5; g++) {
              var B = j[g];
              j[g] = (B << 8 | B >>> 24) & 16711935 | (B << 24 | B >>> 8) & 4278255360;
            }
            return H;
          },
          clone: function() {
            var b = A.clone.call(this);
            return b._hash = this._hash.clone(), b;
          }
        });
        function c(b, S, D) {
          return b ^ S ^ D;
        }
        function w(b, S, D) {
          return b & S | ~b & D;
        }
        function x(b, S, D) {
          return (b | ~S) ^ D;
        }
        function f(b, S, D) {
          return b & D | S & ~D;
        }
        function l(b, S, D) {
          return b ^ (S | ~D);
        }
        function d(b, S) {
          return b << S | b >>> 32 - S;
        }
        s.RIPEMD160 = A._createHelper(v), s.HmacRIPEMD160 = A._createHmacHelper(v);
      })(), e.RIPEMD160;
    });
  })(qt)), qt.exports;
}
var Kt = { exports: {} }, Kn = Kt.exports, t0;
function we() {
  return t0 || (t0 = 1, (function(t, r) {
    (function(e, n) {
      t.exports = n(q());
    })(Kn, function(e) {
      (function() {
        var n = e, s = n.lib, h = s.Base, y = n.enc, A = y.Utf8, k = n.algo;
        k.HMAC = h.extend({
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
          init: function(i, a) {
            i = this._hasher = new i.init(), typeof a == "string" && (a = A.parse(a));
            var P = i.blockSize, o = P * 4;
            a.sigBytes > o && (a = i.finalize(a)), a.clamp();
            for (var u = this._oKey = a.clone(), p = this._iKey = a.clone(), v = u.words, c = p.words, w = 0; w < P; w++)
              v[w] ^= 1549556828, c[w] ^= 909522486;
            u.sigBytes = p.sigBytes = o, this.reset();
          },
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: function() {
            var i = this._hasher;
            i.reset(), i.update(this._iKey);
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
          update: function(i) {
            return this._hasher.update(i), this;
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
          finalize: function(i) {
            var a = this._hasher, P = a.finalize(i);
            a.reset();
            var o = a.finalize(this._oKey.clone().concat(P));
            return o;
          }
        });
      })();
    });
  })(Kt)), Kt.exports;
}
var Ut = { exports: {} }, Un = Ut.exports, e0;
function Gn() {
  return e0 || (e0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), He(), we());
    })(Un, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.Base, y = s.WordArray, A = n.algo, k = A.SHA256, i = A.HMAC, a = A.PBKDF2 = h.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: h.extend({
            keySize: 128 / 32,
            hasher: k,
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
          init: function(P) {
            this.cfg = this.cfg.extend(P);
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
          compute: function(P, o) {
            for (var u = this.cfg, p = i.create(u.hasher, P), v = y.create(), c = y.create([1]), w = v.words, x = c.words, f = u.keySize, l = u.iterations; w.length < f; ) {
              var d = p.update(o).finalize(c);
              p.reset();
              for (var b = d.words, S = b.length, D = d, R = 1; R < l; R++) {
                D = p.finalize(D), p.reset();
                for (var H = D.words, j = 0; j < S; j++)
                  b[j] ^= H[j];
              }
              v.concat(d), x[0]++;
            }
            return v.sigBytes = f * 4, v;
          }
        });
        n.PBKDF2 = function(P, o, u) {
          return a.create(u).compute(P, o);
        };
      })(), e.PBKDF2;
    });
  })(Ut)), Ut.exports;
}
var Gt = { exports: {} }, zn = Gt.exports, n0;
function At() {
  return n0 || (n0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), X0(), we());
    })(zn, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.Base, y = s.WordArray, A = n.algo, k = A.MD5, i = A.EvpKDF = h.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: h.extend({
            keySize: 128 / 32,
            hasher: k,
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
          init: function(a) {
            this.cfg = this.cfg.extend(a);
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
          compute: function(a, P) {
            for (var o, u = this.cfg, p = u.hasher.create(), v = y.create(), c = v.words, w = u.keySize, x = u.iterations; c.length < w; ) {
              o && p.update(o), o = p.update(a).finalize(P), p.reset();
              for (var f = 1; f < x; f++)
                o = p.finalize(o), p.reset();
              v.concat(o);
            }
            return v.sigBytes = w * 4, v;
          }
        });
        n.EvpKDF = function(a, P, o) {
          return i.create(o).compute(a, P);
        };
      })(), e.EvpKDF;
    });
  })(Gt)), Gt.exports;
}
var zt = { exports: {} }, Mn = zt.exports, r0;
function Z() {
  return r0 || (r0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), At());
    })(Mn, function(e) {
      e.lib.Cipher || (function(n) {
        var s = e, h = s.lib, y = h.Base, A = h.WordArray, k = h.BufferedBlockAlgorithm, i = s.enc;
        i.Utf8;
        var a = i.Base64, P = s.algo, o = P.EvpKDF, u = h.Cipher = k.extend({
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
          createEncryptor: function(H, j) {
            return this.create(this._ENC_XFORM_MODE, H, j);
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
          createDecryptor: function(H, j) {
            return this.create(this._DEC_XFORM_MODE, H, j);
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
          init: function(H, j, g) {
            this.cfg = this.cfg.extend(g), this._xformMode = H, this._key = j, this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            k.reset.call(this), this._doReset();
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
          process: function(H) {
            return this._append(H), this._process();
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
          finalize: function(H) {
            H && this._append(H);
            var j = this._doFinalize();
            return j;
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
            function H(j) {
              return typeof j == "string" ? R : b;
            }
            return function(j) {
              return {
                encrypt: function(g, B, E) {
                  return H(B).encrypt(j, g, B, E);
                },
                decrypt: function(g, B, E) {
                  return H(B).decrypt(j, g, B, E);
                }
              };
            };
          })()
        });
        h.StreamCipher = u.extend({
          _doFinalize: function() {
            var H = this._process(!0);
            return H;
          },
          blockSize: 1
        });
        var p = s.mode = {}, v = h.BlockCipherMode = y.extend({
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
          createEncryptor: function(H, j) {
            return this.Encryptor.create(H, j);
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
          createDecryptor: function(H, j) {
            return this.Decryptor.create(H, j);
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
          init: function(H, j) {
            this._cipher = H, this._iv = j;
          }
        }), c = p.CBC = (function() {
          var H = v.extend();
          H.Encryptor = H.extend({
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
            processBlock: function(g, B) {
              var E = this._cipher, O = E.blockSize;
              j.call(this, g, B, O), E.encryptBlock(g, B), this._prevBlock = g.slice(B, B + O);
            }
          }), H.Decryptor = H.extend({
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
            processBlock: function(g, B) {
              var E = this._cipher, O = E.blockSize, V = g.slice(B, B + O);
              E.decryptBlock(g, B), j.call(this, g, B, O), this._prevBlock = V;
            }
          });
          function j(g, B, E) {
            var O, V = this._iv;
            V ? (O = V, this._iv = n) : O = this._prevBlock;
            for (var N = 0; N < E; N++)
              g[B + N] ^= O[N];
          }
          return H;
        })(), w = s.pad = {}, x = w.Pkcs7 = {
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
          pad: function(H, j) {
            for (var g = j * 4, B = g - H.sigBytes % g, E = B << 24 | B << 16 | B << 8 | B, O = [], V = 0; V < B; V += 4)
              O.push(E);
            var N = A.create(O, B);
            H.concat(N);
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
          unpad: function(H) {
            var j = H.words[H.sigBytes - 1 >>> 2] & 255;
            H.sigBytes -= j;
          }
        };
        h.BlockCipher = u.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: u.cfg.extend({
            mode: c,
            padding: x
          }),
          reset: function() {
            var H;
            u.reset.call(this);
            var j = this.cfg, g = j.iv, B = j.mode;
            this._xformMode == this._ENC_XFORM_MODE ? H = B.createEncryptor : (H = B.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == H ? this._mode.init(this, g && g.words) : (this._mode = H.call(B, this, g && g.words), this._mode.__creator = H);
          },
          _doProcessBlock: function(H, j) {
            this._mode.processBlock(H, j);
          },
          _doFinalize: function() {
            var H, j = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (j.pad(this._data, this.blockSize), H = this._process(!0)) : (H = this._process(!0), j.unpad(H)), H;
          },
          blockSize: 128 / 32
        });
        var f = h.CipherParams = y.extend({
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
          init: function(H) {
            this.mixIn(H);
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
          toString: function(H) {
            return (H || this.formatter).stringify(this);
          }
        }), l = s.format = {}, d = l.OpenSSL = {
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
          stringify: function(H) {
            var j, g = H.ciphertext, B = H.salt;
            return B ? j = A.create([1398893684, 1701076831]).concat(B).concat(g) : j = g, j.toString(a);
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
          parse: function(H) {
            var j, g = a.parse(H), B = g.words;
            return B[0] == 1398893684 && B[1] == 1701076831 && (j = A.create(B.slice(2, 4)), B.splice(0, 4), g.sigBytes -= 16), f.create({ ciphertext: g, salt: j });
          }
        }, b = h.SerializableCipher = y.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: y.extend({
            format: d
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
          encrypt: function(H, j, g, B) {
            B = this.cfg.extend(B);
            var E = H.createEncryptor(g, B), O = E.finalize(j), V = E.cfg;
            return f.create({
              ciphertext: O,
              key: g,
              iv: V.iv,
              algorithm: H,
              mode: V.mode,
              padding: V.padding,
              blockSize: H.blockSize,
              formatter: B.format
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
          decrypt: function(H, j, g, B) {
            B = this.cfg.extend(B), j = this._parse(j, B.format);
            var E = H.createDecryptor(g, B).finalize(j.ciphertext);
            return E;
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
          _parse: function(H, j) {
            return typeof H == "string" ? j.parse(H, this) : H;
          }
        }), S = s.kdf = {}, D = S.OpenSSL = {
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
          execute: function(H, j, g, B, E) {
            if (B || (B = A.random(64 / 8)), E)
              var O = o.create({ keySize: j + g, hasher: E }).compute(H, B);
            else
              var O = o.create({ keySize: j + g }).compute(H, B);
            var V = A.create(O.words.slice(j), g * 4);
            return O.sigBytes = j * 4, f.create({ key: O, iv: V, salt: B });
          }
        }, R = h.PasswordBasedCipher = b.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: b.cfg.extend({
            kdf: D
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
          encrypt: function(H, j, g, B) {
            B = this.cfg.extend(B);
            var E = B.kdf.execute(g, H.keySize, H.ivSize, B.salt, B.hasher);
            B.iv = E.iv;
            var O = b.encrypt.call(this, H, j, E.key, B);
            return O.mixIn(E), O;
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
          decrypt: function(H, j, g, B) {
            B = this.cfg.extend(B), j = this._parse(j, B.format);
            var E = B.kdf.execute(g, H.keySize, H.ivSize, j.salt, B.hasher);
            B.iv = E.iv;
            var O = b.decrypt.call(this, H, j, E.key, B);
            return O;
          }
        });
      })();
    });
  })(zt)), zt.exports;
}
var Mt = { exports: {} }, Yn = Mt.exports, i0;
function Zn() {
  return i0 || (i0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(Yn, function(e) {
      return e.mode.CFB = (function() {
        var n = e.lib.BlockCipherMode.extend();
        n.Encryptor = n.extend({
          processBlock: function(h, y) {
            var A = this._cipher, k = A.blockSize;
            s.call(this, h, y, k, A), this._prevBlock = h.slice(y, y + k);
          }
        }), n.Decryptor = n.extend({
          processBlock: function(h, y) {
            var A = this._cipher, k = A.blockSize, i = h.slice(y, y + k);
            s.call(this, h, y, k, A), this._prevBlock = i;
          }
        });
        function s(h, y, A, k) {
          var i, a = this._iv;
          a ? (i = a.slice(0), this._iv = void 0) : i = this._prevBlock, k.encryptBlock(i, 0);
          for (var P = 0; P < A; P++)
            h[y + P] ^= i[P];
        }
        return n;
      })(), e.mode.CFB;
    });
  })(Mt)), Mt.exports;
}
var Yt = { exports: {} }, Jn = Yt.exports, o0;
function Qn() {
  return o0 || (o0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(Jn, function(e) {
      return e.mode.CTR = (function() {
        var n = e.lib.BlockCipherMode.extend(), s = n.Encryptor = n.extend({
          processBlock: function(h, y) {
            var A = this._cipher, k = A.blockSize, i = this._iv, a = this._counter;
            i && (a = this._counter = i.slice(0), this._iv = void 0);
            var P = a.slice(0);
            A.encryptBlock(P, 0), a[k - 1] = a[k - 1] + 1 | 0;
            for (var o = 0; o < k; o++)
              h[y + o] ^= P[o];
          }
        });
        return n.Decryptor = s, n;
      })(), e.mode.CTR;
    });
  })(Yt)), Yt.exports;
}
var Zt = { exports: {} }, _n = Zt.exports, a0;
function $n() {
  return a0 || (a0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(_n, function(e) {
      /** @preserve
       * Counter block mode compatible with  Dr Brian Gladman fileenc.c
       * derived from CryptoJS.mode.CTR
       * Jan Hruby jhruby.web@gmail.com
       */
      return e.mode.CTRGladman = (function() {
        var n = e.lib.BlockCipherMode.extend();
        function s(A) {
          if ((A >> 24 & 255) === 255) {
            var k = A >> 16 & 255, i = A >> 8 & 255, a = A & 255;
            k === 255 ? (k = 0, i === 255 ? (i = 0, a === 255 ? a = 0 : ++a) : ++i) : ++k, A = 0, A += k << 16, A += i << 8, A += a;
          } else
            A += 1 << 24;
          return A;
        }
        function h(A) {
          return (A[0] = s(A[0])) === 0 && (A[1] = s(A[1])), A;
        }
        var y = n.Encryptor = n.extend({
          processBlock: function(A, k) {
            var i = this._cipher, a = i.blockSize, P = this._iv, o = this._counter;
            P && (o = this._counter = P.slice(0), this._iv = void 0), h(o);
            var u = o.slice(0);
            i.encryptBlock(u, 0);
            for (var p = 0; p < a; p++)
              A[k + p] ^= u[p];
          }
        });
        return n.Decryptor = y, n;
      })(), e.mode.CTRGladman;
    });
  })(Zt)), Zt.exports;
}
var Jt = { exports: {} }, tr = Jt.exports, d0;
function er() {
  return d0 || (d0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(tr, function(e) {
      return e.mode.OFB = (function() {
        var n = e.lib.BlockCipherMode.extend(), s = n.Encryptor = n.extend({
          processBlock: function(h, y) {
            var A = this._cipher, k = A.blockSize, i = this._iv, a = this._keystream;
            i && (a = this._keystream = i.slice(0), this._iv = void 0), A.encryptBlock(a, 0);
            for (var P = 0; P < k; P++)
              h[y + P] ^= a[P];
          }
        });
        return n.Decryptor = s, n;
      })(), e.mode.OFB;
    });
  })(Jt)), Jt.exports;
}
var Qt = { exports: {} }, nr = Qt.exports, x0;
function rr() {
  return x0 || (x0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(nr, function(e) {
      return e.mode.ECB = (function() {
        var n = e.lib.BlockCipherMode.extend();
        return n.Encryptor = n.extend({
          processBlock: function(s, h) {
            this._cipher.encryptBlock(s, h);
          }
        }), n.Decryptor = n.extend({
          processBlock: function(s, h) {
            this._cipher.decryptBlock(s, h);
          }
        }), n;
      })(), e.mode.ECB;
    });
  })(Qt)), Qt.exports;
}
var _t = { exports: {} }, ir = _t.exports, s0;
function or() {
  return s0 || (s0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(ir, function(e) {
      return e.pad.AnsiX923 = {
        pad: function(n, s) {
          var h = n.sigBytes, y = s * 4, A = y - h % y, k = h + A - 1;
          n.clamp(), n.words[k >>> 2] |= A << 24 - k % 4 * 8, n.sigBytes += A;
        },
        unpad: function(n) {
          var s = n.words[n.sigBytes - 1 >>> 2] & 255;
          n.sigBytes -= s;
        }
      }, e.pad.Ansix923;
    });
  })(_t)), _t.exports;
}
var $t = { exports: {} }, ar = $t.exports, f0;
function dr() {
  return f0 || (f0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(ar, function(e) {
      return e.pad.Iso10126 = {
        pad: function(n, s) {
          var h = s * 4, y = h - n.sigBytes % h;
          n.concat(e.lib.WordArray.random(y - 1)).concat(e.lib.WordArray.create([y << 24], 1));
        },
        unpad: function(n) {
          var s = n.words[n.sigBytes - 1 >>> 2] & 255;
          n.sigBytes -= s;
        }
      }, e.pad.Iso10126;
    });
  })($t)), $t.exports;
}
var te = { exports: {} }, xr = te.exports, c0;
function sr() {
  return c0 || (c0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(xr, function(e) {
      return e.pad.Iso97971 = {
        pad: function(n, s) {
          n.concat(e.lib.WordArray.create([2147483648], 1)), e.pad.ZeroPadding.pad(n, s);
        },
        unpad: function(n) {
          e.pad.ZeroPadding.unpad(n), n.sigBytes--;
        }
      }, e.pad.Iso97971;
    });
  })(te)), te.exports;
}
var ee = { exports: {} }, fr = ee.exports, p0;
function cr() {
  return p0 || (p0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(fr, function(e) {
      return e.pad.ZeroPadding = {
        pad: function(n, s) {
          var h = s * 4;
          n.clamp(), n.sigBytes += h - (n.sigBytes % h || h);
        },
        unpad: function(n) {
          for (var s = n.words, h = n.sigBytes - 1, h = n.sigBytes - 1; h >= 0; h--)
            if (s[h >>> 2] >>> 24 - h % 4 * 8 & 255) {
              n.sigBytes = h + 1;
              break;
            }
        }
      }, e.pad.ZeroPadding;
    });
  })(ee)), ee.exports;
}
var ne = { exports: {} }, pr = ne.exports, A0;
function Ar() {
  return A0 || (A0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(pr, function(e) {
      return e.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      }, e.pad.NoPadding;
    });
  })(ne)), ne.exports;
}
var re = { exports: {} }, ur = re.exports, u0;
function lr() {
  return u0 || (u0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), Z());
    })(ur, function(e) {
      return (function(n) {
        var s = e, h = s.lib, y = h.CipherParams, A = s.enc, k = A.Hex, i = s.format;
        i.Hex = {
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
          stringify: function(a) {
            return a.ciphertext.toString(k);
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
          parse: function(a) {
            var P = k.parse(a);
            return y.create({ ciphertext: P });
          }
        };
      })(), e.format.Hex;
    });
  })(re)), re.exports;
}
var ie = { exports: {} }, hr = ie.exports, l0;
function vr() {
  return l0 || (l0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(hr, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.BlockCipher, y = n.algo, A = [], k = [], i = [], a = [], P = [], o = [], u = [], p = [], v = [], c = [];
        (function() {
          for (var f = [], l = 0; l < 256; l++)
            l < 128 ? f[l] = l << 1 : f[l] = l << 1 ^ 283;
          for (var d = 0, b = 0, l = 0; l < 256; l++) {
            var S = b ^ b << 1 ^ b << 2 ^ b << 3 ^ b << 4;
            S = S >>> 8 ^ S & 255 ^ 99, A[d] = S, k[S] = d;
            var D = f[d], R = f[D], H = f[R], j = f[S] * 257 ^ S * 16843008;
            i[d] = j << 24 | j >>> 8, a[d] = j << 16 | j >>> 16, P[d] = j << 8 | j >>> 24, o[d] = j;
            var j = H * 16843009 ^ R * 65537 ^ D * 257 ^ d * 16843008;
            u[S] = j << 24 | j >>> 8, p[S] = j << 16 | j >>> 16, v[S] = j << 8 | j >>> 24, c[S] = j, d ? (d = D ^ f[f[f[H ^ D]]], b ^= f[f[b]]) : d = b = 1;
          }
        })();
        var w = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], x = y.AES = h.extend({
          _doReset: function() {
            var f;
            if (!(this._nRounds && this._keyPriorReset === this._key)) {
              for (var l = this._keyPriorReset = this._key, d = l.words, b = l.sigBytes / 4, S = this._nRounds = b + 6, D = (S + 1) * 4, R = this._keySchedule = [], H = 0; H < D; H++)
                H < b ? R[H] = d[H] : (f = R[H - 1], H % b ? b > 6 && H % b == 4 && (f = A[f >>> 24] << 24 | A[f >>> 16 & 255] << 16 | A[f >>> 8 & 255] << 8 | A[f & 255]) : (f = f << 8 | f >>> 24, f = A[f >>> 24] << 24 | A[f >>> 16 & 255] << 16 | A[f >>> 8 & 255] << 8 | A[f & 255], f ^= w[H / b | 0] << 24), R[H] = R[H - b] ^ f);
              for (var j = this._invKeySchedule = [], g = 0; g < D; g++) {
                var H = D - g;
                if (g % 4)
                  var f = R[H];
                else
                  var f = R[H - 4];
                g < 4 || H <= 4 ? j[g] = f : j[g] = u[A[f >>> 24]] ^ p[A[f >>> 16 & 255]] ^ v[A[f >>> 8 & 255]] ^ c[A[f & 255]];
              }
            }
          },
          encryptBlock: function(f, l) {
            this._doCryptBlock(f, l, this._keySchedule, i, a, P, o, A);
          },
          decryptBlock: function(f, l) {
            var d = f[l + 1];
            f[l + 1] = f[l + 3], f[l + 3] = d, this._doCryptBlock(f, l, this._invKeySchedule, u, p, v, c, k);
            var d = f[l + 1];
            f[l + 1] = f[l + 3], f[l + 3] = d;
          },
          _doCryptBlock: function(f, l, d, b, S, D, R, H) {
            for (var j = this._nRounds, g = f[l] ^ d[0], B = f[l + 1] ^ d[1], E = f[l + 2] ^ d[2], O = f[l + 3] ^ d[3], V = 4, N = 1; N < j; N++) {
              var W = b[g >>> 24] ^ S[B >>> 16 & 255] ^ D[E >>> 8 & 255] ^ R[O & 255] ^ d[V++], G = b[B >>> 24] ^ S[E >>> 16 & 255] ^ D[O >>> 8 & 255] ^ R[g & 255] ^ d[V++], K = b[E >>> 24] ^ S[O >>> 16 & 255] ^ D[g >>> 8 & 255] ^ R[B & 255] ^ d[V++], m = b[O >>> 24] ^ S[g >>> 16 & 255] ^ D[B >>> 8 & 255] ^ R[E & 255] ^ d[V++];
              g = W, B = G, E = K, O = m;
            }
            var W = (H[g >>> 24] << 24 | H[B >>> 16 & 255] << 16 | H[E >>> 8 & 255] << 8 | H[O & 255]) ^ d[V++], G = (H[B >>> 24] << 24 | H[E >>> 16 & 255] << 16 | H[O >>> 8 & 255] << 8 | H[g & 255]) ^ d[V++], K = (H[E >>> 24] << 24 | H[O >>> 16 & 255] << 16 | H[g >>> 8 & 255] << 8 | H[B & 255]) ^ d[V++], m = (H[O >>> 24] << 24 | H[g >>> 16 & 255] << 16 | H[B >>> 8 & 255] << 8 | H[E & 255]) ^ d[V++];
            f[l] = W, f[l + 1] = G, f[l + 2] = K, f[l + 3] = m;
          },
          keySize: 256 / 32
        });
        n.AES = h._createHelper(x);
      })(), e.AES;
    });
  })(ie)), ie.exports;
}
var oe = { exports: {} }, kr = oe.exports, h0;
function Pr() {
  return h0 || (h0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(kr, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.WordArray, y = s.BlockCipher, A = n.algo, k = [
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
        ], i = [
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
        ], a = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], P = [
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
        ], o = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ], u = A.DES = y.extend({
          _doReset: function() {
            for (var w = this._key, x = w.words, f = [], l = 0; l < 56; l++) {
              var d = k[l] - 1;
              f[l] = x[d >>> 5] >>> 31 - d % 32 & 1;
            }
            for (var b = this._subKeys = [], S = 0; S < 16; S++) {
              for (var D = b[S] = [], R = a[S], l = 0; l < 24; l++)
                D[l / 6 | 0] |= f[(i[l] - 1 + R) % 28] << 31 - l % 6, D[4 + (l / 6 | 0)] |= f[28 + (i[l + 24] - 1 + R) % 28] << 31 - l % 6;
              D[0] = D[0] << 1 | D[0] >>> 31;
              for (var l = 1; l < 7; l++)
                D[l] = D[l] >>> (l - 1) * 4 + 3;
              D[7] = D[7] << 5 | D[7] >>> 27;
            }
            for (var H = this._invSubKeys = [], l = 0; l < 16; l++)
              H[l] = b[15 - l];
          },
          encryptBlock: function(w, x) {
            this._doCryptBlock(w, x, this._subKeys);
          },
          decryptBlock: function(w, x) {
            this._doCryptBlock(w, x, this._invSubKeys);
          },
          _doCryptBlock: function(w, x, f) {
            this._lBlock = w[x], this._rBlock = w[x + 1], p.call(this, 4, 252645135), p.call(this, 16, 65535), v.call(this, 2, 858993459), v.call(this, 8, 16711935), p.call(this, 1, 1431655765);
            for (var l = 0; l < 16; l++) {
              for (var d = f[l], b = this._lBlock, S = this._rBlock, D = 0, R = 0; R < 8; R++)
                D |= P[R][((S ^ d[R]) & o[R]) >>> 0];
              this._lBlock = S, this._rBlock = b ^ D;
            }
            var H = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = H, p.call(this, 1, 1431655765), v.call(this, 8, 16711935), v.call(this, 2, 858993459), p.call(this, 16, 65535), p.call(this, 4, 252645135), w[x] = this._lBlock, w[x + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function p(w, x) {
          var f = (this._lBlock >>> w ^ this._rBlock) & x;
          this._rBlock ^= f, this._lBlock ^= f << w;
        }
        function v(w, x) {
          var f = (this._rBlock >>> w ^ this._lBlock) & x;
          this._lBlock ^= f, this._rBlock ^= f << w;
        }
        n.DES = y._createHelper(u);
        var c = A.TripleDES = y.extend({
          _doReset: function() {
            var w = this._key, x = w.words;
            if (x.length !== 2 && x.length !== 4 && x.length < 6)
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            var f = x.slice(0, 2), l = x.length < 4 ? x.slice(0, 2) : x.slice(2, 4), d = x.length < 6 ? x.slice(0, 2) : x.slice(4, 6);
            this._des1 = u.createEncryptor(h.create(f)), this._des2 = u.createEncryptor(h.create(l)), this._des3 = u.createEncryptor(h.create(d));
          },
          encryptBlock: function(w, x) {
            this._des1.encryptBlock(w, x), this._des2.decryptBlock(w, x), this._des3.encryptBlock(w, x);
          },
          decryptBlock: function(w, x) {
            this._des3.decryptBlock(w, x), this._des2.encryptBlock(w, x), this._des1.decryptBlock(w, x);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        n.TripleDES = y._createHelper(c);
      })(), e.TripleDES;
    });
  })(oe)), oe.exports;
}
var ae = { exports: {} }, br = ae.exports, v0;
function Hr() {
  return v0 || (v0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(br, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.StreamCipher, y = n.algo, A = y.RC4 = h.extend({
          _doReset: function() {
            for (var a = this._key, P = a.words, o = a.sigBytes, u = this._S = [], p = 0; p < 256; p++)
              u[p] = p;
            for (var p = 0, v = 0; p < 256; p++) {
              var c = p % o, w = P[c >>> 2] >>> 24 - c % 4 * 8 & 255;
              v = (v + u[p] + w) % 256;
              var x = u[p];
              u[p] = u[v], u[v] = x;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(a, P) {
            a[P] ^= k.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function k() {
          for (var a = this._S, P = this._i, o = this._j, u = 0, p = 0; p < 4; p++) {
            P = (P + 1) % 256, o = (o + a[P]) % 256;
            var v = a[P];
            a[P] = a[o], a[o] = v, u |= a[(a[P] + a[o]) % 256] << 24 - p * 8;
          }
          return this._i = P, this._j = o, u;
        }
        n.RC4 = h._createHelper(A);
        var i = y.RC4Drop = A.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: A.cfg.extend({
            drop: 192
          }),
          _doReset: function() {
            A._doReset.call(this);
            for (var a = this.cfg.drop; a > 0; a--)
              k.call(this);
          }
        });
        n.RC4Drop = h._createHelper(i);
      })(), e.RC4;
    });
  })(ae)), ae.exports;
}
var de = { exports: {} }, wr = de.exports, k0;
function yr() {
  return k0 || (k0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(wr, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.StreamCipher, y = n.algo, A = [], k = [], i = [], a = y.Rabbit = h.extend({
          _doReset: function() {
            for (var o = this._key.words, u = this.cfg.iv, p = 0; p < 4; p++)
              o[p] = (o[p] << 8 | o[p] >>> 24) & 16711935 | (o[p] << 24 | o[p] >>> 8) & 4278255360;
            var v = this._X = [
              o[0],
              o[3] << 16 | o[2] >>> 16,
              o[1],
              o[0] << 16 | o[3] >>> 16,
              o[2],
              o[1] << 16 | o[0] >>> 16,
              o[3],
              o[2] << 16 | o[1] >>> 16
            ], c = this._C = [
              o[2] << 16 | o[2] >>> 16,
              o[0] & 4294901760 | o[1] & 65535,
              o[3] << 16 | o[3] >>> 16,
              o[1] & 4294901760 | o[2] & 65535,
              o[0] << 16 | o[0] >>> 16,
              o[2] & 4294901760 | o[3] & 65535,
              o[1] << 16 | o[1] >>> 16,
              o[3] & 4294901760 | o[0] & 65535
            ];
            this._b = 0;
            for (var p = 0; p < 4; p++)
              P.call(this);
            for (var p = 0; p < 8; p++)
              c[p] ^= v[p + 4 & 7];
            if (u) {
              var w = u.words, x = w[0], f = w[1], l = (x << 8 | x >>> 24) & 16711935 | (x << 24 | x >>> 8) & 4278255360, d = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, b = l >>> 16 | d & 4294901760, S = d << 16 | l & 65535;
              c[0] ^= l, c[1] ^= b, c[2] ^= d, c[3] ^= S, c[4] ^= l, c[5] ^= b, c[6] ^= d, c[7] ^= S;
              for (var p = 0; p < 4; p++)
                P.call(this);
            }
          },
          _doProcessBlock: function(o, u) {
            var p = this._X;
            P.call(this), A[0] = p[0] ^ p[5] >>> 16 ^ p[3] << 16, A[1] = p[2] ^ p[7] >>> 16 ^ p[5] << 16, A[2] = p[4] ^ p[1] >>> 16 ^ p[7] << 16, A[3] = p[6] ^ p[3] >>> 16 ^ p[1] << 16;
            for (var v = 0; v < 4; v++)
              A[v] = (A[v] << 8 | A[v] >>> 24) & 16711935 | (A[v] << 24 | A[v] >>> 8) & 4278255360, o[u + v] ^= A[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function P() {
          for (var o = this._X, u = this._C, p = 0; p < 8; p++)
            k[p] = u[p];
          u[0] = u[0] + 1295307597 + this._b | 0, u[1] = u[1] + 3545052371 + (u[0] >>> 0 < k[0] >>> 0 ? 1 : 0) | 0, u[2] = u[2] + 886263092 + (u[1] >>> 0 < k[1] >>> 0 ? 1 : 0) | 0, u[3] = u[3] + 1295307597 + (u[2] >>> 0 < k[2] >>> 0 ? 1 : 0) | 0, u[4] = u[4] + 3545052371 + (u[3] >>> 0 < k[3] >>> 0 ? 1 : 0) | 0, u[5] = u[5] + 886263092 + (u[4] >>> 0 < k[4] >>> 0 ? 1 : 0) | 0, u[6] = u[6] + 1295307597 + (u[5] >>> 0 < k[5] >>> 0 ? 1 : 0) | 0, u[7] = u[7] + 3545052371 + (u[6] >>> 0 < k[6] >>> 0 ? 1 : 0) | 0, this._b = u[7] >>> 0 < k[7] >>> 0 ? 1 : 0;
          for (var p = 0; p < 8; p++) {
            var v = o[p] + u[p], c = v & 65535, w = v >>> 16, x = ((c * c >>> 17) + c * w >>> 15) + w * w, f = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            i[p] = x ^ f;
          }
          o[0] = i[0] + (i[7] << 16 | i[7] >>> 16) + (i[6] << 16 | i[6] >>> 16) | 0, o[1] = i[1] + (i[0] << 8 | i[0] >>> 24) + i[7] | 0, o[2] = i[2] + (i[1] << 16 | i[1] >>> 16) + (i[0] << 16 | i[0] >>> 16) | 0, o[3] = i[3] + (i[2] << 8 | i[2] >>> 24) + i[1] | 0, o[4] = i[4] + (i[3] << 16 | i[3] >>> 16) + (i[2] << 16 | i[2] >>> 16) | 0, o[5] = i[5] + (i[4] << 8 | i[4] >>> 24) + i[3] | 0, o[6] = i[6] + (i[5] << 16 | i[5] >>> 16) + (i[4] << 16 | i[4] >>> 16) | 0, o[7] = i[7] + (i[6] << 8 | i[6] >>> 24) + i[5] | 0;
        }
        n.Rabbit = h._createHelper(a);
      })(), e.Rabbit;
    });
  })(de)), de.exports;
}
var xe = { exports: {} }, Sr = xe.exports, P0;
function Dr() {
  return P0 || (P0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(Sr, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.StreamCipher, y = n.algo, A = [], k = [], i = [], a = y.RabbitLegacy = h.extend({
          _doReset: function() {
            var o = this._key.words, u = this.cfg.iv, p = this._X = [
              o[0],
              o[3] << 16 | o[2] >>> 16,
              o[1],
              o[0] << 16 | o[3] >>> 16,
              o[2],
              o[1] << 16 | o[0] >>> 16,
              o[3],
              o[2] << 16 | o[1] >>> 16
            ], v = this._C = [
              o[2] << 16 | o[2] >>> 16,
              o[0] & 4294901760 | o[1] & 65535,
              o[3] << 16 | o[3] >>> 16,
              o[1] & 4294901760 | o[2] & 65535,
              o[0] << 16 | o[0] >>> 16,
              o[2] & 4294901760 | o[3] & 65535,
              o[1] << 16 | o[1] >>> 16,
              o[3] & 4294901760 | o[0] & 65535
            ];
            this._b = 0;
            for (var c = 0; c < 4; c++)
              P.call(this);
            for (var c = 0; c < 8; c++)
              v[c] ^= p[c + 4 & 7];
            if (u) {
              var w = u.words, x = w[0], f = w[1], l = (x << 8 | x >>> 24) & 16711935 | (x << 24 | x >>> 8) & 4278255360, d = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, b = l >>> 16 | d & 4294901760, S = d << 16 | l & 65535;
              v[0] ^= l, v[1] ^= b, v[2] ^= d, v[3] ^= S, v[4] ^= l, v[5] ^= b, v[6] ^= d, v[7] ^= S;
              for (var c = 0; c < 4; c++)
                P.call(this);
            }
          },
          _doProcessBlock: function(o, u) {
            var p = this._X;
            P.call(this), A[0] = p[0] ^ p[5] >>> 16 ^ p[3] << 16, A[1] = p[2] ^ p[7] >>> 16 ^ p[5] << 16, A[2] = p[4] ^ p[1] >>> 16 ^ p[7] << 16, A[3] = p[6] ^ p[3] >>> 16 ^ p[1] << 16;
            for (var v = 0; v < 4; v++)
              A[v] = (A[v] << 8 | A[v] >>> 24) & 16711935 | (A[v] << 24 | A[v] >>> 8) & 4278255360, o[u + v] ^= A[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function P() {
          for (var o = this._X, u = this._C, p = 0; p < 8; p++)
            k[p] = u[p];
          u[0] = u[0] + 1295307597 + this._b | 0, u[1] = u[1] + 3545052371 + (u[0] >>> 0 < k[0] >>> 0 ? 1 : 0) | 0, u[2] = u[2] + 886263092 + (u[1] >>> 0 < k[1] >>> 0 ? 1 : 0) | 0, u[3] = u[3] + 1295307597 + (u[2] >>> 0 < k[2] >>> 0 ? 1 : 0) | 0, u[4] = u[4] + 3545052371 + (u[3] >>> 0 < k[3] >>> 0 ? 1 : 0) | 0, u[5] = u[5] + 886263092 + (u[4] >>> 0 < k[4] >>> 0 ? 1 : 0) | 0, u[6] = u[6] + 1295307597 + (u[5] >>> 0 < k[5] >>> 0 ? 1 : 0) | 0, u[7] = u[7] + 3545052371 + (u[6] >>> 0 < k[6] >>> 0 ? 1 : 0) | 0, this._b = u[7] >>> 0 < k[7] >>> 0 ? 1 : 0;
          for (var p = 0; p < 8; p++) {
            var v = o[p] + u[p], c = v & 65535, w = v >>> 16, x = ((c * c >>> 17) + c * w >>> 15) + w * w, f = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            i[p] = x ^ f;
          }
          o[0] = i[0] + (i[7] << 16 | i[7] >>> 16) + (i[6] << 16 | i[6] >>> 16) | 0, o[1] = i[1] + (i[0] << 8 | i[0] >>> 24) + i[7] | 0, o[2] = i[2] + (i[1] << 16 | i[1] >>> 16) + (i[0] << 16 | i[0] >>> 16) | 0, o[3] = i[3] + (i[2] << 8 | i[2] >>> 24) + i[1] | 0, o[4] = i[4] + (i[3] << 16 | i[3] >>> 16) + (i[2] << 16 | i[2] >>> 16) | 0, o[5] = i[5] + (i[4] << 8 | i[4] >>> 24) + i[3] | 0, o[6] = i[6] + (i[5] << 16 | i[5] >>> 16) + (i[4] << 16 | i[4] >>> 16) | 0, o[7] = i[7] + (i[6] << 8 | i[6] >>> 24) + i[5] | 0;
        }
        n.RabbitLegacy = h._createHelper(a);
      })(), e.RabbitLegacy;
    });
  })(xe)), xe.exports;
}
var se = { exports: {} }, jr = se.exports, b0;
function mr() {
  return b0 || (b0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ut(), lt(), At(), Z());
    })(jr, function(e) {
      return (function() {
        var n = e, s = n.lib, h = s.BlockCipher, y = n.algo;
        const A = 16, k = [
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
        ], i = [
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
        var a = {
          pbox: [],
          sbox: []
        };
        function P(c, w) {
          let x = w >> 24 & 255, f = w >> 16 & 255, l = w >> 8 & 255, d = w & 255, b = c.sbox[0][x] + c.sbox[1][f];
          return b = b ^ c.sbox[2][l], b = b + c.sbox[3][d], b;
        }
        function o(c, w, x) {
          let f = w, l = x, d;
          for (let b = 0; b < A; ++b)
            f = f ^ c.pbox[b], l = P(c, f) ^ l, d = f, f = l, l = d;
          return d = f, f = l, l = d, l = l ^ c.pbox[A], f = f ^ c.pbox[A + 1], { left: f, right: l };
        }
        function u(c, w, x) {
          let f = w, l = x, d;
          for (let b = A + 1; b > 1; --b)
            f = f ^ c.pbox[b], l = P(c, f) ^ l, d = f, f = l, l = d;
          return d = f, f = l, l = d, l = l ^ c.pbox[1], f = f ^ c.pbox[0], { left: f, right: l };
        }
        function p(c, w, x) {
          for (let S = 0; S < 4; S++) {
            c.sbox[S] = [];
            for (let D = 0; D < 256; D++)
              c.sbox[S][D] = i[S][D];
          }
          let f = 0;
          for (let S = 0; S < A + 2; S++)
            c.pbox[S] = k[S] ^ w[f], f++, f >= x && (f = 0);
          let l = 0, d = 0, b = 0;
          for (let S = 0; S < A + 2; S += 2)
            b = o(c, l, d), l = b.left, d = b.right, c.pbox[S] = l, c.pbox[S + 1] = d;
          for (let S = 0; S < 4; S++)
            for (let D = 0; D < 256; D += 2)
              b = o(c, l, d), l = b.left, d = b.right, c.sbox[S][D] = l, c.sbox[S][D + 1] = d;
          return !0;
        }
        var v = y.Blowfish = h.extend({
          _doReset: function() {
            if (this._keyPriorReset !== this._key) {
              var c = this._keyPriorReset = this._key, w = c.words, x = c.sigBytes / 4;
              p(a, w, x);
            }
          },
          encryptBlock: function(c, w) {
            var x = o(a, c[w], c[w + 1]);
            c[w] = x.left, c[w + 1] = x.right;
          },
          decryptBlock: function(c, w) {
            var x = u(a, c[w], c[w + 1]);
            c[w] = x.left, c[w + 1] = x.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        n.Blowfish = h._createHelper(v);
      })(), e.Blowfish;
    });
  })(se)), se.exports;
}
var gr = gt.exports, H0;
function Br() {
  return H0 || (H0 = 1, (function(t, r) {
    (function(e, n, s) {
      t.exports = n(q(), ue(), Dn(), mn(), ut(), Tn(), lt(), X0(), He(), En(), E0(), Vn(), Nn(), qn(), we(), Gn(), At(), Z(), Zn(), Qn(), $n(), er(), rr(), or(), dr(), sr(), cr(), Ar(), lr(), vr(), Pr(), Hr(), yr(), Dr(), mr());
    })(gr, function(e) {
      return e;
    });
  })(gt)), gt.exports;
}
var Tr = Br();
const Cr = /* @__PURE__ */ hn(Tr);
function Fr() {
  typeof window > "u" || window.CryptoJS || (window.CryptoJS = Cr);
}
class O0 extends Error {
  constructor(r, e) {
    super(r), this.methodName = e, this.name = "MobileAuthSdkUnavailableError";
  }
}
function Rr() {
  const t = window.YDRZAuthSF;
  if (!t)
    throw new O0("Mobile auth SDK global unavailable: window.YDRZAuthSF");
  return t;
}
function yt(t) {
  const e = Rr()[t];
  if (typeof e != "function")
    throw new O0(
      `Mobile auth SDK method unavailable: ${String(t)}`,
      t
    );
  return e;
}
function w0(t) {
  try {
    return JSON.stringify(
      t,
      (r, e) => typeof e == "function" ? "[Function]" : e,
      2
    );
  } catch (r) {
    return `[unserializable: ${r instanceof Error ? r.message : String(r)}]`;
  }
}
function Xr() {
  return {
    showAuthPage(t) {
      w0(t), yt("showAuthPage")(t);
    },
    initControl(t) {
      w0(t), yt("initControl")(t);
    },
    clearControl(t) {
      yt("clearControl")(t);
    },
    getAuthResult(t) {
      yt("getAuthResult")(t);
    },
    updateSubmitBtnStatus(t) {
      yt("updateSubmitBtnStatus")(t);
    }
  };
}
const Er = "0", Or = /* @__PURE__ */ new Set(["0", "1", "3", "4"]);
function Wr(t) {
  const r = t?.trim() ?? "";
  return Or.has(r) ? r : Er;
}
const dt = {
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
function Vr(t = {}) {
  return {
    submitBtnStyle: {
      ...dt.submitBtnStyle,
      ...t.submitBtnStyle
    },
    submitBtnDisabledStyle: {
      ...dt.submitBtnDisabledStyle,
      ...t.submitBtnDisabledStyle
    },
    submitBtnLoadingStyle: {
      ...dt.submitBtnLoadingStyle,
      ...t.submitBtnLoadingStyle
    },
    phoneStyle: {
      ...dt.phoneStyle,
      ...t.phoneStyle
    },
    localTipStyle: {
      ...dt.localTipStyle,
      ...t.localTipStyle
    },
    unlocalTipStyle: {
      ...dt.unlocalTipStyle,
      ...t.unlocalTipStyle
    },
    stateStyle: {
      ...dt.stateStyle,
      ...t.stateStyle
    },
    authTextStyle: {
      ...dt.authTextStyle,
      ...t.authTextStyle
    },
    authExpireStyle: {
      ...dt.authExpireStyle,
      ...t.authExpireStyle
    },
    checkboxStyle: {
      ...dt.checkboxStyle,
      ...t.checkboxStyle
    },
    // 仅在调用方显式传入时输出 agreeStyle，避免影响 SDK 默认运营商协议渲染。
    ...t.agreeStyle ? { agreeStyle: t.agreeStyle } : {}
  };
}
function ve(t) {
  if (typeof t != "function") {
    if (t === null)
      return null;
    if (Array.isArray(t))
      return t.map(ve).filter((r) => r !== void 0);
    if (typeof t == "object") {
      const r = {};
      for (const [e, n] of Object.entries(t)) {
        const s = ve(n);
        s !== void 0 && (r[e] = s);
      }
      return r;
    }
    return t;
  }
}
function Lr(t) {
  if (!(!t || typeof t != "object"))
    return ve(t);
}
const Nr = "https://ginkgo.chinaums.com", Ir = "/sign-pay-pro/";
function qr(t) {
  const r = t?.trim();
  if (!r || r === "/")
    return Ir;
  const e = /^https?:\/\//i.test(r) ? new URL(r).pathname : r;
  return `${(e.startsWith("/") ? e : `/${e}`).replace(/\/+$/, "")}/`;
}
function Kr(t, r) {
  const e = t?.trim();
  return e ? `${new URL(e).toString().replace(/\/+$/, "")}/` : new URL(r.replace(/^\/+/, ""), `${Nr}/`).toString();
}
const Ur = "/sign-pay-pro/assist/0.3.2/".trim() || "", Gr = qr(Ur), ye = Kr("https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/", Gr);
function zr(t) {
  return new URL(t.replace(/^\/+/, ""), ye).toString();
}
const Mr = 'var AssistanceInjectedRuntime=(function(k0){"use strict";const _0={0:["customerValueScore","insuranceFraudScore","renewalRenewalForecastData","theCountrySpreadData","BAA05","BBA02","BAB01","BAA07","BAA06","BBA01","BBA04","BBB01","BBA03","BBB02","BBB03","BCA05","BCA02","BCA03","BCA04","BCA10","BCA01","BCA09","BDD07","BDB08","BDB01","BDB02","BDB04","BDD09","BDD03","BDD04","BEB01","BFA01","BDD12","BDD02","BDD08","BCA07","3ElementsAuthAssistFill"],1:["applyQos","updateQos","releaseQos","typeQueryQos"],3:["creditTreasure"],4:["integralPayment"]},S0={jsUrl:"https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js",cssUrl:"https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css"};function b0(){return{enabled:!0,mode:"live",debugEntry:!1,jsUrl:S0.jsUrl,cssUrl:S0.cssUrl,authParams:{version:"",appId:"",sign:"",traceId:"",timestamp:"",authType:"",scope:""}}}function Xe(t={}){return{resolve(x={}){const n=x.overrides;return!n||["appId","sign","traceId","timestamp","authType","scope"].some(o=>typeof n[o]!="string"||!n[o].trim())?{status:"not-ready",source:"manual",reason:"missing-required-field"}:(Object.hasOwn(_0,n.authType)?_0[n.authType]:void 0)?.includes(n.scope)?{status:"ready",source:"manual",data:{...n}}:{status:"invalid",source:"manual",reason:"invalid-auth-scope"}}}}const je=["取消","cancel"],Ze=new Set(["102507","103119","103120"]),Qe=new Set(["103000","200"]);function Je(t){const x=t.code==null?"":String(t.code),n=typeof t.message=="string"?t.message.toLowerCase():"";return Qe.has(x)?"success":Ze.has(x)||je.some(i=>n.includes(i))?"cancel":"failure"}var l0=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function tn(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function en(t){if(Object.prototype.hasOwnProperty.call(t,"__esModule"))return t;var x=t.default;if(typeof x=="function"){var n=function i(){return this instanceof i?Reflect.construct(x,arguments,this.constructor):x.apply(this,arguments)};n.prototype=x.prototype}else n={};return Object.defineProperty(n,"__esModule",{value:!0}),Object.keys(t).forEach(function(i){var c=Object.getOwnPropertyDescriptor(t,i);Object.defineProperty(n,i,c.get?c:{enumerable:!0,get:function(){return t[i]}})}),n}var bt={exports:{}};function nn(t){throw new Error(\'Could not dynamically require "\'+t+\'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.\')}var yt={exports:{}};const rn=en(Object.freeze(Object.defineProperty({__proto__:null,default:{}},Symbol.toStringTag,{value:"Module"})));var xn=yt.exports,y0;function z(){return y0||(y0=1,(function(t,x){(function(n,i){t.exports=i()})(xn,function(){var n=n||(function(i,c){var o;if(typeof window<"u"&&window.crypto&&(o=window.crypto),typeof self<"u"&&self.crypto&&(o=self.crypto),typeof globalThis<"u"&&globalThis.crypto&&(o=globalThis.crypto),!o&&typeof window<"u"&&window.msCrypto&&(o=window.msCrypto),!o&&typeof l0<"u"&&l0.crypto&&(o=l0.crypto),!o&&typeof nn=="function")try{o=rn}catch{}var m=function(){if(o){if(typeof o.getRandomValues=="function")try{return o.getRandomValues(new Uint32Array(1))[0]}catch{}if(typeof o.randomBytes=="function")try{return o.randomBytes(4).readInt32LE()}catch{}}throw new Error("Native crypto module could not be used to get secure random number.")},f=Object.create||(function(){function a(){}return function(s){var h;return a.prototype=s,h=new a,a.prototype=null,h}})(),E={},e=E.lib={},r=e.Base=(function(){return{extend:function(a){var s=f(this);return a&&s.mixIn(a),(!s.hasOwnProperty("init")||this.init===s.init)&&(s.init=function(){s.$super.init.apply(this,arguments)}),s.init.prototype=s,s.$super=this,s},create:function(){var a=this.extend();return a.init.apply(a,arguments),a},init:function(){},mixIn:function(a){for(var s in a)a.hasOwnProperty(s)&&(this[s]=a[s]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}}})(),D=e.WordArray=r.extend({init:function(a,s){a=this.words=a||[],s!=c?this.sigBytes=s:this.sigBytes=a.length*4},toString:function(a){return(a||p).stringify(this)},concat:function(a){var s=this.words,h=a.words,S=this.sigBytes,C=a.sigBytes;if(this.clamp(),S%4)for(var B=0;B<C;B++){var b=h[B>>>2]>>>24-B%4*8&255;s[S+B>>>2]|=b<<24-(S+B)%4*8}else for(var y=0;y<C;y+=4)s[S+y>>>2]=h[y>>>2];return this.sigBytes+=C,this},clamp:function(){var a=this.words,s=this.sigBytes;a[s>>>2]&=4294967295<<32-s%4*8,a.length=i.ceil(s/4)},clone:function(){var a=r.clone.call(this);return a.words=this.words.slice(0),a},random:function(a){for(var s=[],h=0;h<a;h+=4)s.push(m());return new D.init(s,a)}}),d=E.enc={},p=d.Hex={stringify:function(a){for(var s=a.words,h=a.sigBytes,S=[],C=0;C<h;C++){var B=s[C>>>2]>>>24-C%4*8&255;S.push((B>>>4).toString(16)),S.push((B&15).toString(16))}return S.join("")},parse:function(a){for(var s=a.length,h=[],S=0;S<s;S+=2)h[S>>>3]|=parseInt(a.substr(S,2),16)<<24-S%8*4;return new D.init(h,s/2)}},l=d.Latin1={stringify:function(a){for(var s=a.words,h=a.sigBytes,S=[],C=0;C<h;C++){var B=s[C>>>2]>>>24-C%4*8&255;S.push(String.fromCharCode(B))}return S.join("")},parse:function(a){for(var s=a.length,h=[],S=0;S<s;S++)h[S>>>2]|=(a.charCodeAt(S)&255)<<24-S%4*8;return new D.init(h,s)}},A=d.Utf8={stringify:function(a){try{return decodeURIComponent(escape(l.stringify(a)))}catch{throw new Error("Malformed UTF-8 data")}},parse:function(a){return l.parse(unescape(encodeURIComponent(a)))}},k=e.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new D.init,this._nDataBytes=0},_append:function(a){typeof a=="string"&&(a=A.parse(a)),this._data.concat(a),this._nDataBytes+=a.sigBytes},_process:function(a){var s,h=this._data,S=h.words,C=h.sigBytes,B=this.blockSize,b=B*4,y=C/b;a?y=i.ceil(y):y=i.max((y|0)-this._minBufferSize,0);var u=y*B,_=i.min(u*4,C);if(u){for(var I=0;I<u;I+=B)this._doProcessBlock(S,I);s=S.splice(0,u),h.sigBytes-=_}return new D.init(s,_)},clone:function(){var a=r.clone.call(this);return a._data=this._data.clone(),a},_minBufferSize:0});e.Hasher=k.extend({cfg:r.extend(),init:function(a){this.cfg=this.cfg.extend(a),this.reset()},reset:function(){k.reset.call(this),this._doReset()},update:function(a){return this._append(a),this._process(),this},finalize:function(a){a&&this._append(a);var s=this._doFinalize();return s},blockSize:16,_createHelper:function(a){return function(s,h){return new a.init(h).finalize(s)}},_createHmacHelper:function(a){return function(s,h){return new v.HMAC.init(a,h).finalize(s)}}});var v=E.algo={};return E})(Math);return n})})(yt)),yt.exports}var Ft={exports:{}},dn=Ft.exports,F0;function gt(){return F0||(F0=1,(function(t,x){(function(n,i){t.exports=i(z())})(dn,function(n){return(function(i){var c=n,o=c.lib,m=o.Base,f=o.WordArray,E=c.x64={};E.Word=m.extend({init:function(e,r){this.high=e,this.low=r}}),E.WordArray=m.extend({init:function(e,r){e=this.words=e||[],r!=i?this.sigBytes=r:this.sigBytes=e.length*8},toX32:function(){for(var e=this.words,r=e.length,D=[],d=0;d<r;d++){var p=e[d];D.push(p.high),D.push(p.low)}return f.create(D,this.sigBytes)},clone:function(){for(var e=m.clone.call(this),r=e.words=this.words.slice(0),D=r.length,d=0;d<D;d++)r[d]=r[d].clone();return e}})})(),n})})(Ft)),Ft.exports}var It={exports:{}},on=It.exports,g0;function an(){return g0||(g0=1,(function(t,x){(function(n,i){t.exports=i(z())})(on,function(n){return(function(){if(typeof ArrayBuffer=="function"){var i=n,c=i.lib,o=c.WordArray,m=o.init,f=o.init=function(E){if(E instanceof ArrayBuffer&&(E=new Uint8Array(E)),(E instanceof Int8Array||typeof Uint8ClampedArray<"u"&&E instanceof Uint8ClampedArray||E instanceof Int16Array||E instanceof Uint16Array||E instanceof Int32Array||E instanceof Uint32Array||E instanceof Float32Array||E instanceof Float64Array)&&(E=new Uint8Array(E.buffer,E.byteOffset,E.byteLength)),E instanceof Uint8Array){for(var e=E.byteLength,r=[],D=0;D<e;D++)r[D>>>2]|=E[D]<<24-D%4*8;m.call(this,r,e)}else m.apply(this,arguments)};f.prototype=o}})(),n.lib.WordArray})})(It)),It.exports}var wt={exports:{}},sn=wt.exports,I0;function cn(){return I0||(I0=1,(function(t,x){(function(n,i){t.exports=i(z())})(sn,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=i.enc;m.Utf16=m.Utf16BE={stringify:function(E){for(var e=E.words,r=E.sigBytes,D=[],d=0;d<r;d+=2){var p=e[d>>>2]>>>16-d%4*8&65535;D.push(String.fromCharCode(p))}return D.join("")},parse:function(E){for(var e=E.length,r=[],D=0;D<e;D++)r[D>>>1]|=E.charCodeAt(D)<<16-D%2*16;return o.create(r,e*2)}},m.Utf16LE={stringify:function(E){for(var e=E.words,r=E.sigBytes,D=[],d=0;d<r;d+=2){var p=f(e[d>>>2]>>>16-d%4*8&65535);D.push(String.fromCharCode(p))}return D.join("")},parse:function(E){for(var e=E.length,r=[],D=0;D<e;D++)r[D>>>1]|=f(E.charCodeAt(D)<<16-D%2*16);return o.create(r,e*2)}};function f(E){return E<<8&4278255360|E>>>8&16711935}})(),n.enc.Utf16})})(wt)),wt.exports}var Tt={exports:{}},pn=Tt.exports,w0;function kt(){return w0||(w0=1,(function(t,x){(function(n,i){t.exports=i(z())})(pn,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=i.enc;m.Base64={stringify:function(E){var e=E.words,r=E.sigBytes,D=this._map;E.clamp();for(var d=[],p=0;p<r;p+=3)for(var l=e[p>>>2]>>>24-p%4*8&255,A=e[p+1>>>2]>>>24-(p+1)%4*8&255,k=e[p+2>>>2]>>>24-(p+2)%4*8&255,v=l<<16|A<<8|k,a=0;a<4&&p+a*.75<r;a++)d.push(D.charAt(v>>>6*(3-a)&63));var s=D.charAt(64);if(s)for(;d.length%4;)d.push(s);return d.join("")},parse:function(E){var e=E.length,r=this._map,D=this._reverseMap;if(!D){D=this._reverseMap=[];for(var d=0;d<r.length;d++)D[r.charCodeAt(d)]=d}var p=r.charAt(64);if(p){var l=E.indexOf(p);l!==-1&&(e=l)}return f(E,e,D)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="};function f(E,e,r){for(var D=[],d=0,p=0;p<e;p++)if(p%4){var l=r[E.charCodeAt(p-1)]<<p%4*2,A=r[E.charCodeAt(p)]>>>6-p%4*2,k=l|A;D[d>>>2]|=k<<24-d%4*8,d++}return o.create(D,d)}})(),n.enc.Base64})})(Tt)),Tt.exports}var Rt={exports:{}},kn=Rt.exports,T0;function ln(){return T0||(T0=1,(function(t,x){(function(n,i){t.exports=i(z())})(kn,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=i.enc;m.Base64url={stringify:function(E,e){e===void 0&&(e=!0);var r=E.words,D=E.sigBytes,d=e?this._safe_map:this._map;E.clamp();for(var p=[],l=0;l<D;l+=3)for(var A=r[l>>>2]>>>24-l%4*8&255,k=r[l+1>>>2]>>>24-(l+1)%4*8&255,v=r[l+2>>>2]>>>24-(l+2)%4*8&255,a=A<<16|k<<8|v,s=0;s<4&&l+s*.75<D;s++)p.push(d.charAt(a>>>6*(3-s)&63));var h=d.charAt(64);if(h)for(;p.length%4;)p.push(h);return p.join("")},parse:function(E,e){e===void 0&&(e=!0);var r=E.length,D=e?this._safe_map:this._map,d=this._reverseMap;if(!d){d=this._reverseMap=[];for(var p=0;p<D.length;p++)d[D.charCodeAt(p)]=p}var l=D.charAt(64);if(l){var A=E.indexOf(l);A!==-1&&(r=A)}return f(E,r,d)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",_safe_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"};function f(E,e,r){for(var D=[],d=0,p=0;p<e;p++)if(p%4){var l=r[E.charCodeAt(p-1)]<<p%4*2,A=r[E.charCodeAt(p)]>>>6-p%4*2,k=l|A;D[d>>>2]|=k<<24-d%4*8,d++}return o.create(D,d)}})(),n.enc.Base64url})})(Rt)),Rt.exports}var Pt={exports:{}},fn=Pt.exports,R0;function lt(){return R0||(R0=1,(function(t,x){(function(n,i){t.exports=i(z())})(fn,function(n){return(function(i){var c=n,o=c.lib,m=o.WordArray,f=o.Hasher,E=c.algo,e=[];(function(){for(var A=0;A<64;A++)e[A]=i.abs(i.sin(A+1))*4294967296|0})();var r=E.MD5=f.extend({_doReset:function(){this._hash=new m.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(A,k){for(var v=0;v<16;v++){var a=k+v,s=A[a];A[a]=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360}var h=this._hash.words,S=A[k+0],C=A[k+1],B=A[k+2],b=A[k+3],y=A[k+4],u=A[k+5],_=A[k+6],I=A[k+7],F=A[k+8],P=A[k+9],H=A[k+10],L=A[k+11],Y=A[k+12],W=A[k+13],$=A[k+14],G=A[k+15],g=h[0],T=h[1],R=h[2],w=h[3];g=D(g,T,R,w,S,7,e[0]),w=D(w,g,T,R,C,12,e[1]),R=D(R,w,g,T,B,17,e[2]),T=D(T,R,w,g,b,22,e[3]),g=D(g,T,R,w,y,7,e[4]),w=D(w,g,T,R,u,12,e[5]),R=D(R,w,g,T,_,17,e[6]),T=D(T,R,w,g,I,22,e[7]),g=D(g,T,R,w,F,7,e[8]),w=D(w,g,T,R,P,12,e[9]),R=D(R,w,g,T,H,17,e[10]),T=D(T,R,w,g,L,22,e[11]),g=D(g,T,R,w,Y,7,e[12]),w=D(w,g,T,R,W,12,e[13]),R=D(R,w,g,T,$,17,e[14]),T=D(T,R,w,g,G,22,e[15]),g=d(g,T,R,w,C,5,e[16]),w=d(w,g,T,R,_,9,e[17]),R=d(R,w,g,T,L,14,e[18]),T=d(T,R,w,g,S,20,e[19]),g=d(g,T,R,w,u,5,e[20]),w=d(w,g,T,R,H,9,e[21]),R=d(R,w,g,T,G,14,e[22]),T=d(T,R,w,g,y,20,e[23]),g=d(g,T,R,w,P,5,e[24]),w=d(w,g,T,R,$,9,e[25]),R=d(R,w,g,T,b,14,e[26]),T=d(T,R,w,g,F,20,e[27]),g=d(g,T,R,w,W,5,e[28]),w=d(w,g,T,R,B,9,e[29]),R=d(R,w,g,T,I,14,e[30]),T=d(T,R,w,g,Y,20,e[31]),g=p(g,T,R,w,u,4,e[32]),w=p(w,g,T,R,F,11,e[33]),R=p(R,w,g,T,L,16,e[34]),T=p(T,R,w,g,$,23,e[35]),g=p(g,T,R,w,C,4,e[36]),w=p(w,g,T,R,y,11,e[37]),R=p(R,w,g,T,I,16,e[38]),T=p(T,R,w,g,H,23,e[39]),g=p(g,T,R,w,W,4,e[40]),w=p(w,g,T,R,S,11,e[41]),R=p(R,w,g,T,b,16,e[42]),T=p(T,R,w,g,_,23,e[43]),g=p(g,T,R,w,P,4,e[44]),w=p(w,g,T,R,Y,11,e[45]),R=p(R,w,g,T,G,16,e[46]),T=p(T,R,w,g,B,23,e[47]),g=l(g,T,R,w,S,6,e[48]),w=l(w,g,T,R,I,10,e[49]),R=l(R,w,g,T,$,15,e[50]),T=l(T,R,w,g,u,21,e[51]),g=l(g,T,R,w,Y,6,e[52]),w=l(w,g,T,R,b,10,e[53]),R=l(R,w,g,T,H,15,e[54]),T=l(T,R,w,g,C,21,e[55]),g=l(g,T,R,w,F,6,e[56]),w=l(w,g,T,R,G,10,e[57]),R=l(R,w,g,T,_,15,e[58]),T=l(T,R,w,g,W,21,e[59]),g=l(g,T,R,w,y,6,e[60]),w=l(w,g,T,R,L,10,e[61]),R=l(R,w,g,T,B,15,e[62]),T=l(T,R,w,g,P,21,e[63]),h[0]=h[0]+g|0,h[1]=h[1]+T|0,h[2]=h[2]+R|0,h[3]=h[3]+w|0},_doFinalize:function(){var A=this._data,k=A.words,v=this._nDataBytes*8,a=A.sigBytes*8;k[a>>>5]|=128<<24-a%32;var s=i.floor(v/4294967296),h=v;k[(a+64>>>9<<4)+15]=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360,k[(a+64>>>9<<4)+14]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360,A.sigBytes=(k.length+1)*4,this._process();for(var S=this._hash,C=S.words,B=0;B<4;B++){var b=C[B];C[B]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360}return S},clone:function(){var A=f.clone.call(this);return A._hash=this._hash.clone(),A}});function D(A,k,v,a,s,h,S){var C=A+(k&v|~k&a)+s+S;return(C<<h|C>>>32-h)+k}function d(A,k,v,a,s,h,S){var C=A+(k&a|v&~a)+s+S;return(C<<h|C>>>32-h)+k}function p(A,k,v,a,s,h,S){var C=A+(k^v^a)+s+S;return(C<<h|C>>>32-h)+k}function l(A,k,v,a,s,h,S){var C=A+(v^(k|~a))+s+S;return(C<<h|C>>>32-h)+k}c.MD5=f._createHelper(r),c.HmacMD5=f._createHmacHelper(r)})(Math),n.MD5})})(Pt)),Pt.exports}var Ht={exports:{}},hn=Ht.exports,P0;function H0(){return P0||(P0=1,(function(t,x){(function(n,i){t.exports=i(z())})(hn,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=c.Hasher,f=i.algo,E=[],e=f.SHA1=m.extend({_doReset:function(){this._hash=new o.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(r,D){for(var d=this._hash.words,p=d[0],l=d[1],A=d[2],k=d[3],v=d[4],a=0;a<80;a++){if(a<16)E[a]=r[D+a]|0;else{var s=E[a-3]^E[a-8]^E[a-14]^E[a-16];E[a]=s<<1|s>>>31}var h=(p<<5|p>>>27)+v+E[a];a<20?h+=(l&A|~l&k)+1518500249:a<40?h+=(l^A^k)+1859775393:a<60?h+=(l&A|l&k|A&k)-1894007588:h+=(l^A^k)-899497514,v=k,k=A,A=l<<30|l>>>2,l=p,p=h}d[0]=d[0]+p|0,d[1]=d[1]+l|0,d[2]=d[2]+A|0,d[3]=d[3]+k|0,d[4]=d[4]+v|0},_doFinalize:function(){var r=this._data,D=r.words,d=this._nDataBytes*8,p=r.sigBytes*8;return D[p>>>5]|=128<<24-p%32,D[(p+64>>>9<<4)+14]=Math.floor(d/4294967296),D[(p+64>>>9<<4)+15]=d,r.sigBytes=D.length*4,this._process(),this._hash},clone:function(){var r=m.clone.call(this);return r._hash=this._hash.clone(),r}});i.SHA1=m._createHelper(e),i.HmacSHA1=m._createHmacHelper(e)})(),n.SHA1})})(Ht)),Ht.exports}var Nt={exports:{}},un=Nt.exports,N0;function f0(){return N0||(N0=1,(function(t,x){(function(n,i){t.exports=i(z())})(un,function(n){return(function(i){var c=n,o=c.lib,m=o.WordArray,f=o.Hasher,E=c.algo,e=[],r=[];(function(){function p(v){for(var a=i.sqrt(v),s=2;s<=a;s++)if(!(v%s))return!1;return!0}function l(v){return(v-(v|0))*4294967296|0}for(var A=2,k=0;k<64;)p(A)&&(k<8&&(e[k]=l(i.pow(A,.5))),r[k]=l(i.pow(A,.3333333333333333)),k++),A++})();var D=[],d=E.SHA256=f.extend({_doReset:function(){this._hash=new m.init(e.slice(0))},_doProcessBlock:function(p,l){for(var A=this._hash.words,k=A[0],v=A[1],a=A[2],s=A[3],h=A[4],S=A[5],C=A[6],B=A[7],b=0;b<64;b++){if(b<16)D[b]=p[l+b]|0;else{var y=D[b-15],u=(y<<25|y>>>7)^(y<<14|y>>>18)^y>>>3,_=D[b-2],I=(_<<15|_>>>17)^(_<<13|_>>>19)^_>>>10;D[b]=u+D[b-7]+I+D[b-16]}var F=h&S^~h&C,P=k&v^k&a^v&a,H=(k<<30|k>>>2)^(k<<19|k>>>13)^(k<<10|k>>>22),L=(h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25),Y=B+L+F+r[b]+D[b],W=H+P;B=C,C=S,S=h,h=s+Y|0,s=a,a=v,v=k,k=Y+W|0}A[0]=A[0]+k|0,A[1]=A[1]+v|0,A[2]=A[2]+a|0,A[3]=A[3]+s|0,A[4]=A[4]+h|0,A[5]=A[5]+S|0,A[6]=A[6]+C|0,A[7]=A[7]+B|0},_doFinalize:function(){var p=this._data,l=p.words,A=this._nDataBytes*8,k=p.sigBytes*8;return l[k>>>5]|=128<<24-k%32,l[(k+64>>>9<<4)+14]=i.floor(A/4294967296),l[(k+64>>>9<<4)+15]=A,p.sigBytes=l.length*4,this._process(),this._hash},clone:function(){var p=f.clone.call(this);return p._hash=this._hash.clone(),p}});c.SHA256=f._createHelper(d),c.HmacSHA256=f._createHmacHelper(d)})(Math),n.SHA256})})(Nt)),Nt.exports}var Ot={exports:{}},An=Ot.exports,O0;function En(){return O0||(O0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),f0())})(An,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=i.algo,f=m.SHA256,E=m.SHA224=f.extend({_doReset:function(){this._hash=new o.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var e=f._doFinalize.call(this);return e.sigBytes-=4,e}});i.SHA224=f._createHelper(E),i.HmacSHA224=f._createHmacHelper(E)})(),n.SHA224})})(Ot)),Ot.exports}var Lt={exports:{}},vn=Lt.exports,L0;function K0(){return L0||(L0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),gt())})(vn,function(n){return(function(){var i=n,c=i.lib,o=c.Hasher,m=i.x64,f=m.Word,E=m.WordArray,e=i.algo;function r(){return f.create.apply(f,arguments)}var D=[r(1116352408,3609767458),r(1899447441,602891725),r(3049323471,3964484399),r(3921009573,2173295548),r(961987163,4081628472),r(1508970993,3053834265),r(2453635748,2937671579),r(2870763221,3664609560),r(3624381080,2734883394),r(310598401,1164996542),r(607225278,1323610764),r(1426881987,3590304994),r(1925078388,4068182383),r(2162078206,991336113),r(2614888103,633803317),r(3248222580,3479774868),r(3835390401,2666613458),r(4022224774,944711139),r(264347078,2341262773),r(604807628,2007800933),r(770255983,1495990901),r(1249150122,1856431235),r(1555081692,3175218132),r(1996064986,2198950837),r(2554220882,3999719339),r(2821834349,766784016),r(2952996808,2566594879),r(3210313671,3203337956),r(3336571891,1034457026),r(3584528711,2466948901),r(113926993,3758326383),r(338241895,168717936),r(666307205,1188179964),r(773529912,1546045734),r(1294757372,1522805485),r(1396182291,2643833823),r(1695183700,2343527390),r(1986661051,1014477480),r(2177026350,1206759142),r(2456956037,344077627),r(2730485921,1290863460),r(2820302411,3158454273),r(3259730800,3505952657),r(3345764771,106217008),r(3516065817,3606008344),r(3600352804,1432725776),r(4094571909,1467031594),r(275423344,851169720),r(430227734,3100823752),r(506948616,1363258195),r(659060556,3750685593),r(883997877,3785050280),r(958139571,3318307427),r(1322822218,3812723403),r(1537002063,2003034995),r(1747873779,3602036899),r(1955562222,1575990012),r(2024104815,1125592928),r(2227730452,2716904306),r(2361852424,442776044),r(2428436474,593698344),r(2756734187,3733110249),r(3204031479,2999351573),r(3329325298,3815920427),r(3391569614,3928383900),r(3515267271,566280711),r(3940187606,3454069534),r(4118630271,4000239992),r(116418474,1914138554),r(174292421,2731055270),r(289380356,3203993006),r(460393269,320620315),r(685471733,587496836),r(852142971,1086792851),r(1017036298,365543100),r(1126000580,2618297676),r(1288033470,3409855158),r(1501505948,4234509866),r(1607167915,987167468),r(1816402316,1246189591)],d=[];(function(){for(var l=0;l<80;l++)d[l]=r()})();var p=e.SHA512=o.extend({_doReset:function(){this._hash=new E.init([new f.init(1779033703,4089235720),new f.init(3144134277,2227873595),new f.init(1013904242,4271175723),new f.init(2773480762,1595750129),new f.init(1359893119,2917565137),new f.init(2600822924,725511199),new f.init(528734635,4215389547),new f.init(1541459225,327033209)])},_doProcessBlock:function(l,A){for(var k=this._hash.words,v=k[0],a=k[1],s=k[2],h=k[3],S=k[4],C=k[5],B=k[6],b=k[7],y=v.high,u=v.low,_=a.high,I=a.low,F=s.high,P=s.low,H=h.high,L=h.low,Y=S.high,W=S.low,$=C.high,G=C.low,g=B.high,T=B.low,R=b.high,w=b.low,q=y,V=u,Q=_,M=I,ot=F,at=P,N=H,K=L,O=Y,X=W,j=$,U=G,nt=g,st=T,m0=R,mt=w,it=0;it<80;it++){var et,ct,p0=d[it];if(it<16)ct=p0.high=l[A+it*2]|0,et=p0.low=l[A+it*2+1]|0;else{var Oe=d[it-15],At=Oe.high,_t=Oe.low,Mr=(At>>>1|_t<<31)^(At>>>8|_t<<24)^At>>>7,Le=(_t>>>1|At<<31)^(_t>>>8|At<<24)^(_t>>>7|At<<25),Ke=d[it-2],Et=Ke.high,St=Ke.low,Ur=(Et>>>19|St<<13)^(Et<<3|St>>>29)^Et>>>6,Me=(St>>>19|Et<<13)^(St<<3|Et>>>29)^(St>>>6|Et<<26),Ue=d[it-7],zr=Ue.high,Wr=Ue.low,ze=d[it-16],Gr=ze.high,We=ze.low;et=Le+Wr,ct=Mr+zr+(et>>>0<Le>>>0?1:0),et=et+Me,ct=ct+Ur+(et>>>0<Me>>>0?1:0),et=et+We,ct=ct+Gr+(et>>>0<We>>>0?1:0),p0.high=ct,p0.low=et}var $r=O&j^~O&nt,Ge=X&U^~X&st,qr=q&Q^q&ot^Q&ot,Yr=V&M^V&at^M&at,Vr=(q>>>28|V<<4)^(q<<30|V>>>2)^(q<<25|V>>>7),$e=(V>>>28|q<<4)^(V<<30|q>>>2)^(V<<25|q>>>7),Xr=(O>>>14|X<<18)^(O>>>18|X<<14)^(O<<23|X>>>9),jr=(X>>>14|O<<18)^(X>>>18|O<<14)^(X<<23|O>>>9),qe=D[it],Zr=qe.high,Ye=qe.low,J=mt+jr,pt=m0+Xr+(J>>>0<mt>>>0?1:0),J=J+Ge,pt=pt+$r+(J>>>0<Ge>>>0?1:0),J=J+Ye,pt=pt+Zr+(J>>>0<Ye>>>0?1:0),J=J+et,pt=pt+ct+(J>>>0<et>>>0?1:0),Ve=$e+Yr,Qr=Vr+qr+(Ve>>>0<$e>>>0?1:0);m0=nt,mt=st,nt=j,st=U,j=O,U=X,X=K+J|0,O=N+pt+(X>>>0<K>>>0?1:0)|0,N=ot,K=at,ot=Q,at=M,Q=q,M=V,V=J+Ve|0,q=pt+Qr+(V>>>0<J>>>0?1:0)|0}u=v.low=u+V,v.high=y+q+(u>>>0<V>>>0?1:0),I=a.low=I+M,a.high=_+Q+(I>>>0<M>>>0?1:0),P=s.low=P+at,s.high=F+ot+(P>>>0<at>>>0?1:0),L=h.low=L+K,h.high=H+N+(L>>>0<K>>>0?1:0),W=S.low=W+X,S.high=Y+O+(W>>>0<X>>>0?1:0),G=C.low=G+U,C.high=$+j+(G>>>0<U>>>0?1:0),T=B.low=T+st,B.high=g+nt+(T>>>0<st>>>0?1:0),w=b.low=w+mt,b.high=R+m0+(w>>>0<mt>>>0?1:0)},_doFinalize:function(){var l=this._data,A=l.words,k=this._nDataBytes*8,v=l.sigBytes*8;A[v>>>5]|=128<<24-v%32,A[(v+128>>>10<<5)+30]=Math.floor(k/4294967296),A[(v+128>>>10<<5)+31]=k,l.sigBytes=A.length*4,this._process();var a=this._hash.toX32();return a},clone:function(){var l=o.clone.call(this);return l._hash=this._hash.clone(),l},blockSize:1024/32});i.SHA512=o._createHelper(p),i.HmacSHA512=o._createHmacHelper(p)})(),n.SHA512})})(Lt)),Lt.exports}var Kt={exports:{}},Cn=Kt.exports,M0;function Dn(){return M0||(M0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),gt(),K0())})(Cn,function(n){return(function(){var i=n,c=i.x64,o=c.Word,m=c.WordArray,f=i.algo,E=f.SHA512,e=f.SHA384=E.extend({_doReset:function(){this._hash=new m.init([new o.init(3418070365,3238371032),new o.init(1654270250,914150663),new o.init(2438529370,812702999),new o.init(355462360,4144912697),new o.init(1731405415,4290775857),new o.init(2394180231,1750603025),new o.init(3675008525,1694076839),new o.init(1203062813,3204075428)])},_doFinalize:function(){var r=E._doFinalize.call(this);return r.sigBytes-=16,r}});i.SHA384=E._createHelper(e),i.HmacSHA384=E._createHmacHelper(e)})(),n.SHA384})})(Kt)),Kt.exports}var Mt={exports:{}},Bn=Mt.exports,U0;function mn(){return U0||(U0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),gt())})(Bn,function(n){return(function(i){var c=n,o=c.lib,m=o.WordArray,f=o.Hasher,E=c.x64,e=E.Word,r=c.algo,D=[],d=[],p=[];(function(){for(var k=1,v=0,a=0;a<24;a++){D[k+5*v]=(a+1)*(a+2)/2%64;var s=v%5,h=(2*k+3*v)%5;k=s,v=h}for(var k=0;k<5;k++)for(var v=0;v<5;v++)d[k+5*v]=v+(2*k+3*v)%5*5;for(var S=1,C=0;C<24;C++){for(var B=0,b=0,y=0;y<7;y++){if(S&1){var u=(1<<y)-1;u<32?b^=1<<u:B^=1<<u-32}S&128?S=S<<1^113:S<<=1}p[C]=e.create(B,b)}})();var l=[];(function(){for(var k=0;k<25;k++)l[k]=e.create()})();var A=r.SHA3=f.extend({cfg:f.cfg.extend({outputLength:512}),_doReset:function(){for(var k=this._state=[],v=0;v<25;v++)k[v]=new e.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(k,v){for(var a=this._state,s=this.blockSize/2,h=0;h<s;h++){var S=k[v+2*h],C=k[v+2*h+1];S=(S<<8|S>>>24)&16711935|(S<<24|S>>>8)&4278255360,C=(C<<8|C>>>24)&16711935|(C<<24|C>>>8)&4278255360;var B=a[h];B.high^=C,B.low^=S}for(var b=0;b<24;b++){for(var y=0;y<5;y++){for(var u=0,_=0,I=0;I<5;I++){var B=a[y+5*I];u^=B.high,_^=B.low}var F=l[y];F.high=u,F.low=_}for(var y=0;y<5;y++)for(var P=l[(y+4)%5],H=l[(y+1)%5],L=H.high,Y=H.low,u=P.high^(L<<1|Y>>>31),_=P.low^(Y<<1|L>>>31),I=0;I<5;I++){var B=a[y+5*I];B.high^=u,B.low^=_}for(var W=1;W<25;W++){var u,_,B=a[W],$=B.high,G=B.low,g=D[W];g<32?(u=$<<g|G>>>32-g,_=G<<g|$>>>32-g):(u=G<<g-32|$>>>64-g,_=$<<g-32|G>>>64-g);var T=l[d[W]];T.high=u,T.low=_}var R=l[0],w=a[0];R.high=w.high,R.low=w.low;for(var y=0;y<5;y++)for(var I=0;I<5;I++){var W=y+5*I,B=a[W],q=l[W],V=l[(y+1)%5+5*I],Q=l[(y+2)%5+5*I];B.high=q.high^~V.high&Q.high,B.low=q.low^~V.low&Q.low}var B=a[0],M=p[b];B.high^=M.high,B.low^=M.low}},_doFinalize:function(){var k=this._data,v=k.words;this._nDataBytes*8;var a=k.sigBytes*8,s=this.blockSize*32;v[a>>>5]|=1<<24-a%32,v[(i.ceil((a+1)/s)*s>>>5)-1]|=128,k.sigBytes=v.length*4,this._process();for(var h=this._state,S=this.cfg.outputLength/8,C=S/8,B=[],b=0;b<C;b++){var y=h[b],u=y.high,_=y.low;u=(u<<8|u>>>24)&16711935|(u<<24|u>>>8)&4278255360,_=(_<<8|_>>>24)&16711935|(_<<24|_>>>8)&4278255360,B.push(_),B.push(u)}return new m.init(B,S)},clone:function(){for(var k=f.clone.call(this),v=k._state=this._state.slice(0),a=0;a<25;a++)v[a]=v[a].clone();return k}});c.SHA3=f._createHelper(A),c.HmacSHA3=f._createHmacHelper(A)})(Math),n.SHA3})})(Mt)),Mt.exports}var Ut={exports:{}},_n=Ut.exports,z0;function Sn(){return z0||(z0=1,(function(t,x){(function(n,i){t.exports=i(z())})(_n,function(n){/** @preserve\n  			(c) 2012 by Cédric Mesnil. All rights reserved.\n\n  			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\n  			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n  			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n\n  			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n  			*/return(function(i){var c=n,o=c.lib,m=o.WordArray,f=o.Hasher,E=c.algo,e=m.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),r=m.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),D=m.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),d=m.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),p=m.create([0,1518500249,1859775393,2400959708,2840853838]),l=m.create([1352829926,1548603684,1836072691,2053994217,0]),A=E.RIPEMD160=f.extend({_doReset:function(){this._hash=m.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(C,B){for(var b=0;b<16;b++){var y=B+b,u=C[y];C[y]=(u<<8|u>>>24)&16711935|(u<<24|u>>>8)&4278255360}var _=this._hash.words,I=p.words,F=l.words,P=e.words,H=r.words,L=D.words,Y=d.words,W,$,G,g,T,R,w,q,V,Q;R=W=_[0],w=$=_[1],q=G=_[2],V=g=_[3],Q=T=_[4];for(var M,b=0;b<80;b+=1)M=W+C[B+P[b]]|0,b<16?M+=k($,G,g)+I[0]:b<32?M+=v($,G,g)+I[1]:b<48?M+=a($,G,g)+I[2]:b<64?M+=s($,G,g)+I[3]:M+=h($,G,g)+I[4],M=M|0,M=S(M,L[b]),M=M+T|0,W=T,T=g,g=S(G,10),G=$,$=M,M=R+C[B+H[b]]|0,b<16?M+=h(w,q,V)+F[0]:b<32?M+=s(w,q,V)+F[1]:b<48?M+=a(w,q,V)+F[2]:b<64?M+=v(w,q,V)+F[3]:M+=k(w,q,V)+F[4],M=M|0,M=S(M,Y[b]),M=M+Q|0,R=Q,Q=V,V=S(q,10),q=w,w=M;M=_[1]+G+V|0,_[1]=_[2]+g+Q|0,_[2]=_[3]+T+R|0,_[3]=_[4]+W+w|0,_[4]=_[0]+$+q|0,_[0]=M},_doFinalize:function(){var C=this._data,B=C.words,b=this._nDataBytes*8,y=C.sigBytes*8;B[y>>>5]|=128<<24-y%32,B[(y+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360,C.sigBytes=(B.length+1)*4,this._process();for(var u=this._hash,_=u.words,I=0;I<5;I++){var F=_[I];_[I]=(F<<8|F>>>24)&16711935|(F<<24|F>>>8)&4278255360}return u},clone:function(){var C=f.clone.call(this);return C._hash=this._hash.clone(),C}});function k(C,B,b){return C^B^b}function v(C,B,b){return C&B|~C&b}function a(C,B,b){return(C|~B)^b}function s(C,B,b){return C&b|B&~b}function h(C,B,b){return C^(B|~b)}function S(C,B){return C<<B|C>>>32-B}c.RIPEMD160=f._createHelper(A),c.HmacRIPEMD160=f._createHmacHelper(A)})(),n.RIPEMD160})})(Ut)),Ut.exports}var zt={exports:{}},bn=zt.exports,W0;function h0(){return W0||(W0=1,(function(t,x){(function(n,i){t.exports=i(z())})(bn,function(n){(function(){var i=n,c=i.lib,o=c.Base,m=i.enc,f=m.Utf8,E=i.algo;E.HMAC=o.extend({init:function(e,r){e=this._hasher=new e.init,typeof r=="string"&&(r=f.parse(r));var D=e.blockSize,d=D*4;r.sigBytes>d&&(r=e.finalize(r)),r.clamp();for(var p=this._oKey=r.clone(),l=this._iKey=r.clone(),A=p.words,k=l.words,v=0;v<D;v++)A[v]^=1549556828,k[v]^=909522486;p.sigBytes=l.sigBytes=d,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var r=this._hasher,D=r.finalize(e);r.reset();var d=r.finalize(this._oKey.clone().concat(D));return d}})})()})})(zt)),zt.exports}var Wt={exports:{}},yn=Wt.exports,G0;function Fn(){return G0||(G0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),f0(),h0())})(yn,function(n){return(function(){var i=n,c=i.lib,o=c.Base,m=c.WordArray,f=i.algo,E=f.SHA256,e=f.HMAC,r=f.PBKDF2=o.extend({cfg:o.extend({keySize:128/32,hasher:E,iterations:25e4}),init:function(D){this.cfg=this.cfg.extend(D)},compute:function(D,d){for(var p=this.cfg,l=e.create(p.hasher,D),A=m.create(),k=m.create([1]),v=A.words,a=k.words,s=p.keySize,h=p.iterations;v.length<s;){var S=l.update(d).finalize(k);l.reset();for(var C=S.words,B=C.length,b=S,y=1;y<h;y++){b=l.finalize(b),l.reset();for(var u=b.words,_=0;_<B;_++)C[_]^=u[_]}A.concat(S),a[0]++}return A.sigBytes=s*4,A}});i.PBKDF2=function(D,d,p){return r.create(p).compute(D,d)}})(),n.PBKDF2})})(Wt)),Wt.exports}var Gt={exports:{}},gn=Gt.exports,$0;function dt(){return $0||($0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),H0(),h0())})(gn,function(n){return(function(){var i=n,c=i.lib,o=c.Base,m=c.WordArray,f=i.algo,E=f.MD5,e=f.EvpKDF=o.extend({cfg:o.extend({keySize:128/32,hasher:E,iterations:1}),init:function(r){this.cfg=this.cfg.extend(r)},compute:function(r,D){for(var d,p=this.cfg,l=p.hasher.create(),A=m.create(),k=A.words,v=p.keySize,a=p.iterations;k.length<v;){d&&l.update(d),d=l.update(r).finalize(D),l.reset();for(var s=1;s<a;s++)d=l.finalize(d),l.reset();A.concat(d)}return A.sigBytes=v*4,A}});i.EvpKDF=function(r,D,d){return e.create(d).compute(r,D)}})(),n.EvpKDF})})(Gt)),Gt.exports}var $t={exports:{}},In=$t.exports,q0;function Z(){return q0||(q0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),dt())})(In,function(n){n.lib.Cipher||(function(i){var c=n,o=c.lib,m=o.Base,f=o.WordArray,E=o.BufferedBlockAlgorithm,e=c.enc;e.Utf8;var r=e.Base64,D=c.algo,d=D.EvpKDF,p=o.Cipher=E.extend({cfg:m.extend(),createEncryptor:function(u,_){return this.create(this._ENC_XFORM_MODE,u,_)},createDecryptor:function(u,_){return this.create(this._DEC_XFORM_MODE,u,_)},init:function(u,_,I){this.cfg=this.cfg.extend(I),this._xformMode=u,this._key=_,this.reset()},reset:function(){E.reset.call(this),this._doReset()},process:function(u){return this._append(u),this._process()},finalize:function(u){u&&this._append(u);var _=this._doFinalize();return _},keySize:128/32,ivSize:128/32,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:(function(){function u(_){return typeof _=="string"?y:C}return function(_){return{encrypt:function(I,F,P){return u(F).encrypt(_,I,F,P)},decrypt:function(I,F,P){return u(F).decrypt(_,I,F,P)}}}})()});o.StreamCipher=p.extend({_doFinalize:function(){var u=this._process(!0);return u},blockSize:1});var l=c.mode={},A=o.BlockCipherMode=m.extend({createEncryptor:function(u,_){return this.Encryptor.create(u,_)},createDecryptor:function(u,_){return this.Decryptor.create(u,_)},init:function(u,_){this._cipher=u,this._iv=_}}),k=l.CBC=(function(){var u=A.extend();u.Encryptor=u.extend({processBlock:function(I,F){var P=this._cipher,H=P.blockSize;_.call(this,I,F,H),P.encryptBlock(I,F),this._prevBlock=I.slice(F,F+H)}}),u.Decryptor=u.extend({processBlock:function(I,F){var P=this._cipher,H=P.blockSize,L=I.slice(F,F+H);P.decryptBlock(I,F),_.call(this,I,F,H),this._prevBlock=L}});function _(I,F,P){var H,L=this._iv;L?(H=L,this._iv=i):H=this._prevBlock;for(var Y=0;Y<P;Y++)I[F+Y]^=H[Y]}return u})(),v=c.pad={},a=v.Pkcs7={pad:function(u,_){for(var I=_*4,F=I-u.sigBytes%I,P=F<<24|F<<16|F<<8|F,H=[],L=0;L<F;L+=4)H.push(P);var Y=f.create(H,F);u.concat(Y)},unpad:function(u){var _=u.words[u.sigBytes-1>>>2]&255;u.sigBytes-=_}};o.BlockCipher=p.extend({cfg:p.cfg.extend({mode:k,padding:a}),reset:function(){var u;p.reset.call(this);var _=this.cfg,I=_.iv,F=_.mode;this._xformMode==this._ENC_XFORM_MODE?u=F.createEncryptor:(u=F.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==u?this._mode.init(this,I&&I.words):(this._mode=u.call(F,this,I&&I.words),this._mode.__creator=u)},_doProcessBlock:function(u,_){this._mode.processBlock(u,_)},_doFinalize:function(){var u,_=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(_.pad(this._data,this.blockSize),u=this._process(!0)):(u=this._process(!0),_.unpad(u)),u},blockSize:4});var s=o.CipherParams=m.extend({init:function(u){this.mixIn(u)},toString:function(u){return(u||this.formatter).stringify(this)}}),h=c.format={},S=h.OpenSSL={stringify:function(u){var _,I=u.ciphertext,F=u.salt;return F?_=f.create([1398893684,1701076831]).concat(F).concat(I):_=I,_.toString(r)},parse:function(u){var _,I=r.parse(u),F=I.words;return F[0]==1398893684&&F[1]==1701076831&&(_=f.create(F.slice(2,4)),F.splice(0,4),I.sigBytes-=16),s.create({ciphertext:I,salt:_})}},C=o.SerializableCipher=m.extend({cfg:m.extend({format:S}),encrypt:function(u,_,I,F){F=this.cfg.extend(F);var P=u.createEncryptor(I,F),H=P.finalize(_),L=P.cfg;return s.create({ciphertext:H,key:I,iv:L.iv,algorithm:u,mode:L.mode,padding:L.padding,blockSize:u.blockSize,formatter:F.format})},decrypt:function(u,_,I,F){F=this.cfg.extend(F),_=this._parse(_,F.format);var P=u.createDecryptor(I,F).finalize(_.ciphertext);return P},_parse:function(u,_){return typeof u=="string"?_.parse(u,this):u}}),B=c.kdf={},b=B.OpenSSL={execute:function(u,_,I,F,P){if(F||(F=f.random(64/8)),P)var H=d.create({keySize:_+I,hasher:P}).compute(u,F);else var H=d.create({keySize:_+I}).compute(u,F);var L=f.create(H.words.slice(_),I*4);return H.sigBytes=_*4,s.create({key:H,iv:L,salt:F})}},y=o.PasswordBasedCipher=C.extend({cfg:C.cfg.extend({kdf:b}),encrypt:function(u,_,I,F){F=this.cfg.extend(F);var P=F.kdf.execute(I,u.keySize,u.ivSize,F.salt,F.hasher);F.iv=P.iv;var H=C.encrypt.call(this,u,_,P.key,F);return H.mixIn(P),H},decrypt:function(u,_,I,F){F=this.cfg.extend(F),_=this._parse(_,F.format);var P=F.kdf.execute(I,u.keySize,u.ivSize,_.salt,F.hasher);F.iv=P.iv;var H=C.decrypt.call(this,u,_,P.key,F);return H}})})()})})($t)),$t.exports}var qt={exports:{}},wn=qt.exports,Y0;function Tn(){return Y0||(Y0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(wn,function(n){return n.mode.CFB=(function(){var i=n.lib.BlockCipherMode.extend();i.Encryptor=i.extend({processBlock:function(o,m){var f=this._cipher,E=f.blockSize;c.call(this,o,m,E,f),this._prevBlock=o.slice(m,m+E)}}),i.Decryptor=i.extend({processBlock:function(o,m){var f=this._cipher,E=f.blockSize,e=o.slice(m,m+E);c.call(this,o,m,E,f),this._prevBlock=e}});function c(o,m,f,E){var e,r=this._iv;r?(e=r.slice(0),this._iv=void 0):e=this._prevBlock,E.encryptBlock(e,0);for(var D=0;D<f;D++)o[m+D]^=e[D]}return i})(),n.mode.CFB})})(qt)),qt.exports}var Yt={exports:{}},Rn=Yt.exports,V0;function Pn(){return V0||(V0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Rn,function(n){return n.mode.CTR=(function(){var i=n.lib.BlockCipherMode.extend(),c=i.Encryptor=i.extend({processBlock:function(o,m){var f=this._cipher,E=f.blockSize,e=this._iv,r=this._counter;e&&(r=this._counter=e.slice(0),this._iv=void 0);var D=r.slice(0);f.encryptBlock(D,0),r[E-1]=r[E-1]+1|0;for(var d=0;d<E;d++)o[m+d]^=D[d]}});return i.Decryptor=c,i})(),n.mode.CTR})})(Yt)),Yt.exports}var Vt={exports:{}},Hn=Vt.exports,X0;function Nn(){return X0||(X0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Hn,function(n){/** @preserve\n * Counter block mode compatible with  Dr Brian Gladman fileenc.c\n * derived from CryptoJS.mode.CTR\n * Jan Hruby jhruby.web@gmail.com\n */return n.mode.CTRGladman=(function(){var i=n.lib.BlockCipherMode.extend();function c(f){if((f>>24&255)===255){var E=f>>16&255,e=f>>8&255,r=f&255;E===255?(E=0,e===255?(e=0,r===255?r=0:++r):++e):++E,f=0,f+=E<<16,f+=e<<8,f+=r}else f+=16777216;return f}function o(f){return(f[0]=c(f[0]))===0&&(f[1]=c(f[1])),f}var m=i.Encryptor=i.extend({processBlock:function(f,E){var e=this._cipher,r=e.blockSize,D=this._iv,d=this._counter;D&&(d=this._counter=D.slice(0),this._iv=void 0),o(d);var p=d.slice(0);e.encryptBlock(p,0);for(var l=0;l<r;l++)f[E+l]^=p[l]}});return i.Decryptor=m,i})(),n.mode.CTRGladman})})(Vt)),Vt.exports}var Xt={exports:{}},On=Xt.exports,j0;function Ln(){return j0||(j0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(On,function(n){return n.mode.OFB=(function(){var i=n.lib.BlockCipherMode.extend(),c=i.Encryptor=i.extend({processBlock:function(o,m){var f=this._cipher,E=f.blockSize,e=this._iv,r=this._keystream;e&&(r=this._keystream=e.slice(0),this._iv=void 0),f.encryptBlock(r,0);for(var D=0;D<E;D++)o[m+D]^=r[D]}});return i.Decryptor=c,i})(),n.mode.OFB})})(Xt)),Xt.exports}var jt={exports:{}},Kn=jt.exports,Z0;function Mn(){return Z0||(Z0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Kn,function(n){return n.mode.ECB=(function(){var i=n.lib.BlockCipherMode.extend();return i.Encryptor=i.extend({processBlock:function(c,o){this._cipher.encryptBlock(c,o)}}),i.Decryptor=i.extend({processBlock:function(c,o){this._cipher.decryptBlock(c,o)}}),i})(),n.mode.ECB})})(jt)),jt.exports}var Zt={exports:{}},Un=Zt.exports,Q0;function zn(){return Q0||(Q0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Un,function(n){return n.pad.AnsiX923={pad:function(i,c){var o=i.sigBytes,m=c*4,f=m-o%m,E=o+f-1;i.clamp(),i.words[E>>>2]|=f<<24-E%4*8,i.sigBytes+=f},unpad:function(i){var c=i.words[i.sigBytes-1>>>2]&255;i.sigBytes-=c}},n.pad.Ansix923})})(Zt)),Zt.exports}var Qt={exports:{}},Wn=Qt.exports,J0;function Gn(){return J0||(J0=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Wn,function(n){return n.pad.Iso10126={pad:function(i,c){var o=c*4,m=o-i.sigBytes%o;i.concat(n.lib.WordArray.random(m-1)).concat(n.lib.WordArray.create([m<<24],1))},unpad:function(i){var c=i.words[i.sigBytes-1>>>2]&255;i.sigBytes-=c}},n.pad.Iso10126})})(Qt)),Qt.exports}var Jt={exports:{}},$n=Jt.exports,te;function qn(){return te||(te=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})($n,function(n){return n.pad.Iso97971={pad:function(i,c){i.concat(n.lib.WordArray.create([2147483648],1)),n.pad.ZeroPadding.pad(i,c)},unpad:function(i){n.pad.ZeroPadding.unpad(i),i.sigBytes--}},n.pad.Iso97971})})(Jt)),Jt.exports}var t0={exports:{}},Yn=t0.exports,ee;function Vn(){return ee||(ee=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Yn,function(n){return n.pad.ZeroPadding={pad:function(i,c){var o=c*4;i.clamp(),i.sigBytes+=o-(i.sigBytes%o||o)},unpad:function(i){for(var c=i.words,o=i.sigBytes-1,o=i.sigBytes-1;o>=0;o--)if(c[o>>>2]>>>24-o%4*8&255){i.sigBytes=o+1;break}}},n.pad.ZeroPadding})})(t0)),t0.exports}var e0={exports:{}},Xn=e0.exports,ne;function jn(){return ne||(ne=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Xn,function(n){return n.pad.NoPadding={pad:function(){},unpad:function(){}},n.pad.NoPadding})})(e0)),e0.exports}var n0={exports:{}},Zn=n0.exports,ie;function Qn(){return ie||(ie=1,(function(t,x){(function(n,i,c){t.exports=i(z(),Z())})(Zn,function(n){return(function(i){var c=n,o=c.lib,m=o.CipherParams,f=c.enc,E=f.Hex,e=c.format;e.Hex={stringify:function(r){return r.ciphertext.toString(E)},parse:function(r){var D=E.parse(r);return m.create({ciphertext:D})}}})(),n.format.Hex})})(n0)),n0.exports}var i0={exports:{}},Jn=i0.exports,re;function ti(){return re||(re=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(Jn,function(n){return(function(){var i=n,c=i.lib,o=c.BlockCipher,m=i.algo,f=[],E=[],e=[],r=[],D=[],d=[],p=[],l=[],A=[],k=[];(function(){for(var s=[],h=0;h<256;h++)h<128?s[h]=h<<1:s[h]=h<<1^283;for(var S=0,C=0,h=0;h<256;h++){var B=C^C<<1^C<<2^C<<3^C<<4;B=B>>>8^B&255^99,f[S]=B,E[B]=S;var b=s[S],y=s[b],u=s[y],_=s[B]*257^B*16843008;e[S]=_<<24|_>>>8,r[S]=_<<16|_>>>16,D[S]=_<<8|_>>>24,d[S]=_;var _=u*16843009^y*65537^b*257^S*16843008;p[B]=_<<24|_>>>8,l[B]=_<<16|_>>>16,A[B]=_<<8|_>>>24,k[B]=_,S?(S=b^s[s[s[u^b]]],C^=s[s[C]]):S=C=1}})();var v=[0,1,2,4,8,16,32,64,128,27,54],a=m.AES=o.extend({_doReset:function(){var s;if(!(this._nRounds&&this._keyPriorReset===this._key)){for(var h=this._keyPriorReset=this._key,S=h.words,C=h.sigBytes/4,B=this._nRounds=C+6,b=(B+1)*4,y=this._keySchedule=[],u=0;u<b;u++)u<C?y[u]=S[u]:(s=y[u-1],u%C?C>6&&u%C==4&&(s=f[s>>>24]<<24|f[s>>>16&255]<<16|f[s>>>8&255]<<8|f[s&255]):(s=s<<8|s>>>24,s=f[s>>>24]<<24|f[s>>>16&255]<<16|f[s>>>8&255]<<8|f[s&255],s^=v[u/C|0]<<24),y[u]=y[u-C]^s);for(var _=this._invKeySchedule=[],I=0;I<b;I++){var u=b-I;if(I%4)var s=y[u];else var s=y[u-4];I<4||u<=4?_[I]=s:_[I]=p[f[s>>>24]]^l[f[s>>>16&255]]^A[f[s>>>8&255]]^k[f[s&255]]}}},encryptBlock:function(s,h){this._doCryptBlock(s,h,this._keySchedule,e,r,D,d,f)},decryptBlock:function(s,h){var S=s[h+1];s[h+1]=s[h+3],s[h+3]=S,this._doCryptBlock(s,h,this._invKeySchedule,p,l,A,k,E);var S=s[h+1];s[h+1]=s[h+3],s[h+3]=S},_doCryptBlock:function(s,h,S,C,B,b,y,u){for(var _=this._nRounds,I=s[h]^S[0],F=s[h+1]^S[1],P=s[h+2]^S[2],H=s[h+3]^S[3],L=4,Y=1;Y<_;Y++){var W=C[I>>>24]^B[F>>>16&255]^b[P>>>8&255]^y[H&255]^S[L++],$=C[F>>>24]^B[P>>>16&255]^b[H>>>8&255]^y[I&255]^S[L++],G=C[P>>>24]^B[H>>>16&255]^b[I>>>8&255]^y[F&255]^S[L++],g=C[H>>>24]^B[I>>>16&255]^b[F>>>8&255]^y[P&255]^S[L++];I=W,F=$,P=G,H=g}var W=(u[I>>>24]<<24|u[F>>>16&255]<<16|u[P>>>8&255]<<8|u[H&255])^S[L++],$=(u[F>>>24]<<24|u[P>>>16&255]<<16|u[H>>>8&255]<<8|u[I&255])^S[L++],G=(u[P>>>24]<<24|u[H>>>16&255]<<16|u[I>>>8&255]<<8|u[F&255])^S[L++],g=(u[H>>>24]<<24|u[I>>>16&255]<<16|u[F>>>8&255]<<8|u[P&255])^S[L++];s[h]=W,s[h+1]=$,s[h+2]=G,s[h+3]=g},keySize:256/32});i.AES=o._createHelper(a)})(),n.AES})})(i0)),i0.exports}var r0={exports:{}},ei=r0.exports,xe;function ni(){return xe||(xe=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(ei,function(n){return(function(){var i=n,c=i.lib,o=c.WordArray,m=c.BlockCipher,f=i.algo,E=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],e=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],r=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],D=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],d=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],p=f.DES=m.extend({_doReset:function(){for(var v=this._key,a=v.words,s=[],h=0;h<56;h++){var S=E[h]-1;s[h]=a[S>>>5]>>>31-S%32&1}for(var C=this._subKeys=[],B=0;B<16;B++){for(var b=C[B]=[],y=r[B],h=0;h<24;h++)b[h/6|0]|=s[(e[h]-1+y)%28]<<31-h%6,b[4+(h/6|0)]|=s[28+(e[h+24]-1+y)%28]<<31-h%6;b[0]=b[0]<<1|b[0]>>>31;for(var h=1;h<7;h++)b[h]=b[h]>>>(h-1)*4+3;b[7]=b[7]<<5|b[7]>>>27}for(var u=this._invSubKeys=[],h=0;h<16;h++)u[h]=C[15-h]},encryptBlock:function(v,a){this._doCryptBlock(v,a,this._subKeys)},decryptBlock:function(v,a){this._doCryptBlock(v,a,this._invSubKeys)},_doCryptBlock:function(v,a,s){this._lBlock=v[a],this._rBlock=v[a+1],l.call(this,4,252645135),l.call(this,16,65535),A.call(this,2,858993459),A.call(this,8,16711935),l.call(this,1,1431655765);for(var h=0;h<16;h++){for(var S=s[h],C=this._lBlock,B=this._rBlock,b=0,y=0;y<8;y++)b|=D[y][((B^S[y])&d[y])>>>0];this._lBlock=B,this._rBlock=C^b}var u=this._lBlock;this._lBlock=this._rBlock,this._rBlock=u,l.call(this,1,1431655765),A.call(this,8,16711935),A.call(this,2,858993459),l.call(this,16,65535),l.call(this,4,252645135),v[a]=this._lBlock,v[a+1]=this._rBlock},keySize:64/32,ivSize:64/32,blockSize:64/32});function l(v,a){var s=(this._lBlock>>>v^this._rBlock)&a;this._rBlock^=s,this._lBlock^=s<<v}function A(v,a){var s=(this._rBlock>>>v^this._lBlock)&a;this._lBlock^=s,this._rBlock^=s<<v}i.DES=m._createHelper(p);var k=f.TripleDES=m.extend({_doReset:function(){var v=this._key,a=v.words;if(a.length!==2&&a.length!==4&&a.length<6)throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");var s=a.slice(0,2),h=a.length<4?a.slice(0,2):a.slice(2,4),S=a.length<6?a.slice(0,2):a.slice(4,6);this._des1=p.createEncryptor(o.create(s)),this._des2=p.createEncryptor(o.create(h)),this._des3=p.createEncryptor(o.create(S))},encryptBlock:function(v,a){this._des1.encryptBlock(v,a),this._des2.decryptBlock(v,a),this._des3.encryptBlock(v,a)},decryptBlock:function(v,a){this._des3.decryptBlock(v,a),this._des2.encryptBlock(v,a),this._des1.decryptBlock(v,a)},keySize:192/32,ivSize:64/32,blockSize:64/32});i.TripleDES=m._createHelper(k)})(),n.TripleDES})})(r0)),r0.exports}var x0={exports:{}},ii=x0.exports,de;function ri(){return de||(de=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(ii,function(n){return(function(){var i=n,c=i.lib,o=c.StreamCipher,m=i.algo,f=m.RC4=o.extend({_doReset:function(){for(var r=this._key,D=r.words,d=r.sigBytes,p=this._S=[],l=0;l<256;l++)p[l]=l;for(var l=0,A=0;l<256;l++){var k=l%d,v=D[k>>>2]>>>24-k%4*8&255;A=(A+p[l]+v)%256;var a=p[l];p[l]=p[A],p[A]=a}this._i=this._j=0},_doProcessBlock:function(r,D){r[D]^=E.call(this)},keySize:256/32,ivSize:0});function E(){for(var r=this._S,D=this._i,d=this._j,p=0,l=0;l<4;l++){D=(D+1)%256,d=(d+r[D])%256;var A=r[D];r[D]=r[d],r[d]=A,p|=r[(r[D]+r[d])%256]<<24-l*8}return this._i=D,this._j=d,p}i.RC4=o._createHelper(f);var e=m.RC4Drop=f.extend({cfg:f.cfg.extend({drop:192}),_doReset:function(){f._doReset.call(this);for(var r=this.cfg.drop;r>0;r--)E.call(this)}});i.RC4Drop=o._createHelper(e)})(),n.RC4})})(x0)),x0.exports}var d0={exports:{}},xi=d0.exports,oe;function di(){return oe||(oe=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(xi,function(n){return(function(){var i=n,c=i.lib,o=c.StreamCipher,m=i.algo,f=[],E=[],e=[],r=m.Rabbit=o.extend({_doReset:function(){for(var d=this._key.words,p=this.cfg.iv,l=0;l<4;l++)d[l]=(d[l]<<8|d[l]>>>24)&16711935|(d[l]<<24|d[l]>>>8)&4278255360;var A=this._X=[d[0],d[3]<<16|d[2]>>>16,d[1],d[0]<<16|d[3]>>>16,d[2],d[1]<<16|d[0]>>>16,d[3],d[2]<<16|d[1]>>>16],k=this._C=[d[2]<<16|d[2]>>>16,d[0]&4294901760|d[1]&65535,d[3]<<16|d[3]>>>16,d[1]&4294901760|d[2]&65535,d[0]<<16|d[0]>>>16,d[2]&4294901760|d[3]&65535,d[1]<<16|d[1]>>>16,d[3]&4294901760|d[0]&65535];this._b=0;for(var l=0;l<4;l++)D.call(this);for(var l=0;l<8;l++)k[l]^=A[l+4&7];if(p){var v=p.words,a=v[0],s=v[1],h=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360,S=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360,C=h>>>16|S&4294901760,B=S<<16|h&65535;k[0]^=h,k[1]^=C,k[2]^=S,k[3]^=B,k[4]^=h,k[5]^=C,k[6]^=S,k[7]^=B;for(var l=0;l<4;l++)D.call(this)}},_doProcessBlock:function(d,p){var l=this._X;D.call(this),f[0]=l[0]^l[5]>>>16^l[3]<<16,f[1]=l[2]^l[7]>>>16^l[5]<<16,f[2]=l[4]^l[1]>>>16^l[7]<<16,f[3]=l[6]^l[3]>>>16^l[1]<<16;for(var A=0;A<4;A++)f[A]=(f[A]<<8|f[A]>>>24)&16711935|(f[A]<<24|f[A]>>>8)&4278255360,d[p+A]^=f[A]},blockSize:128/32,ivSize:64/32});function D(){for(var d=this._X,p=this._C,l=0;l<8;l++)E[l]=p[l];p[0]=p[0]+1295307597+this._b|0,p[1]=p[1]+3545052371+(p[0]>>>0<E[0]>>>0?1:0)|0,p[2]=p[2]+886263092+(p[1]>>>0<E[1]>>>0?1:0)|0,p[3]=p[3]+1295307597+(p[2]>>>0<E[2]>>>0?1:0)|0,p[4]=p[4]+3545052371+(p[3]>>>0<E[3]>>>0?1:0)|0,p[5]=p[5]+886263092+(p[4]>>>0<E[4]>>>0?1:0)|0,p[6]=p[6]+1295307597+(p[5]>>>0<E[5]>>>0?1:0)|0,p[7]=p[7]+3545052371+(p[6]>>>0<E[6]>>>0?1:0)|0,this._b=p[7]>>>0<E[7]>>>0?1:0;for(var l=0;l<8;l++){var A=d[l]+p[l],k=A&65535,v=A>>>16,a=((k*k>>>17)+k*v>>>15)+v*v,s=((A&4294901760)*A|0)+((A&65535)*A|0);e[l]=a^s}d[0]=e[0]+(e[7]<<16|e[7]>>>16)+(e[6]<<16|e[6]>>>16)|0,d[1]=e[1]+(e[0]<<8|e[0]>>>24)+e[7]|0,d[2]=e[2]+(e[1]<<16|e[1]>>>16)+(e[0]<<16|e[0]>>>16)|0,d[3]=e[3]+(e[2]<<8|e[2]>>>24)+e[1]|0,d[4]=e[4]+(e[3]<<16|e[3]>>>16)+(e[2]<<16|e[2]>>>16)|0,d[5]=e[5]+(e[4]<<8|e[4]>>>24)+e[3]|0,d[6]=e[6]+(e[5]<<16|e[5]>>>16)+(e[4]<<16|e[4]>>>16)|0,d[7]=e[7]+(e[6]<<8|e[6]>>>24)+e[5]|0}i.Rabbit=o._createHelper(r)})(),n.Rabbit})})(d0)),d0.exports}var o0={exports:{}},oi=o0.exports,ae;function ai(){return ae||(ae=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(oi,function(n){return(function(){var i=n,c=i.lib,o=c.StreamCipher,m=i.algo,f=[],E=[],e=[],r=m.RabbitLegacy=o.extend({_doReset:function(){var d=this._key.words,p=this.cfg.iv,l=this._X=[d[0],d[3]<<16|d[2]>>>16,d[1],d[0]<<16|d[3]>>>16,d[2],d[1]<<16|d[0]>>>16,d[3],d[2]<<16|d[1]>>>16],A=this._C=[d[2]<<16|d[2]>>>16,d[0]&4294901760|d[1]&65535,d[3]<<16|d[3]>>>16,d[1]&4294901760|d[2]&65535,d[0]<<16|d[0]>>>16,d[2]&4294901760|d[3]&65535,d[1]<<16|d[1]>>>16,d[3]&4294901760|d[0]&65535];this._b=0;for(var k=0;k<4;k++)D.call(this);for(var k=0;k<8;k++)A[k]^=l[k+4&7];if(p){var v=p.words,a=v[0],s=v[1],h=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360,S=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360,C=h>>>16|S&4294901760,B=S<<16|h&65535;A[0]^=h,A[1]^=C,A[2]^=S,A[3]^=B,A[4]^=h,A[5]^=C,A[6]^=S,A[7]^=B;for(var k=0;k<4;k++)D.call(this)}},_doProcessBlock:function(d,p){var l=this._X;D.call(this),f[0]=l[0]^l[5]>>>16^l[3]<<16,f[1]=l[2]^l[7]>>>16^l[5]<<16,f[2]=l[4]^l[1]>>>16^l[7]<<16,f[3]=l[6]^l[3]>>>16^l[1]<<16;for(var A=0;A<4;A++)f[A]=(f[A]<<8|f[A]>>>24)&16711935|(f[A]<<24|f[A]>>>8)&4278255360,d[p+A]^=f[A]},blockSize:128/32,ivSize:64/32});function D(){for(var d=this._X,p=this._C,l=0;l<8;l++)E[l]=p[l];p[0]=p[0]+1295307597+this._b|0,p[1]=p[1]+3545052371+(p[0]>>>0<E[0]>>>0?1:0)|0,p[2]=p[2]+886263092+(p[1]>>>0<E[1]>>>0?1:0)|0,p[3]=p[3]+1295307597+(p[2]>>>0<E[2]>>>0?1:0)|0,p[4]=p[4]+3545052371+(p[3]>>>0<E[3]>>>0?1:0)|0,p[5]=p[5]+886263092+(p[4]>>>0<E[4]>>>0?1:0)|0,p[6]=p[6]+1295307597+(p[5]>>>0<E[5]>>>0?1:0)|0,p[7]=p[7]+3545052371+(p[6]>>>0<E[6]>>>0?1:0)|0,this._b=p[7]>>>0<E[7]>>>0?1:0;for(var l=0;l<8;l++){var A=d[l]+p[l],k=A&65535,v=A>>>16,a=((k*k>>>17)+k*v>>>15)+v*v,s=((A&4294901760)*A|0)+((A&65535)*A|0);e[l]=a^s}d[0]=e[0]+(e[7]<<16|e[7]>>>16)+(e[6]<<16|e[6]>>>16)|0,d[1]=e[1]+(e[0]<<8|e[0]>>>24)+e[7]|0,d[2]=e[2]+(e[1]<<16|e[1]>>>16)+(e[0]<<16|e[0]>>>16)|0,d[3]=e[3]+(e[2]<<8|e[2]>>>24)+e[1]|0,d[4]=e[4]+(e[3]<<16|e[3]>>>16)+(e[2]<<16|e[2]>>>16)|0,d[5]=e[5]+(e[4]<<8|e[4]>>>24)+e[3]|0,d[6]=e[6]+(e[5]<<16|e[5]>>>16)+(e[4]<<16|e[4]>>>16)|0,d[7]=e[7]+(e[6]<<8|e[6]>>>24)+e[5]|0}i.RabbitLegacy=o._createHelper(r)})(),n.RabbitLegacy})})(o0)),o0.exports}var a0={exports:{}},si=a0.exports,se;function ci(){return se||(se=1,(function(t,x){(function(n,i,c){t.exports=i(z(),kt(),lt(),dt(),Z())})(si,function(n){return(function(){var i=n,c=i.lib,o=c.BlockCipher,m=i.algo;const f=16,E=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],e=[[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946],[1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055],[3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504],[976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462]];var r={pbox:[],sbox:[]};function D(k,v){let a=v>>24&255,s=v>>16&255,h=v>>8&255,S=v&255,C=k.sbox[0][a]+k.sbox[1][s];return C=C^k.sbox[2][h],C=C+k.sbox[3][S],C}function d(k,v,a){let s=v,h=a,S;for(let C=0;C<f;++C)s=s^k.pbox[C],h=D(k,s)^h,S=s,s=h,h=S;return S=s,s=h,h=S,h=h^k.pbox[f],s=s^k.pbox[f+1],{left:s,right:h}}function p(k,v,a){let s=v,h=a,S;for(let C=f+1;C>1;--C)s=s^k.pbox[C],h=D(k,s)^h,S=s,s=h,h=S;return S=s,s=h,h=S,h=h^k.pbox[1],s=s^k.pbox[0],{left:s,right:h}}function l(k,v,a){for(let B=0;B<4;B++){k.sbox[B]=[];for(let b=0;b<256;b++)k.sbox[B][b]=e[B][b]}let s=0;for(let B=0;B<f+2;B++)k.pbox[B]=E[B]^v[s],s++,s>=a&&(s=0);let h=0,S=0,C=0;for(let B=0;B<f+2;B+=2)C=d(k,h,S),h=C.left,S=C.right,k.pbox[B]=h,k.pbox[B+1]=S;for(let B=0;B<4;B++)for(let b=0;b<256;b+=2)C=d(k,h,S),h=C.left,S=C.right,k.sbox[B][b]=h,k.sbox[B][b+1]=S;return!0}var A=m.Blowfish=o.extend({_doReset:function(){if(this._keyPriorReset!==this._key){var k=this._keyPriorReset=this._key,v=k.words,a=k.sigBytes/4;l(r,v,a)}},encryptBlock:function(k,v){var a=d(r,k[v],k[v+1]);k[v]=a.left,k[v+1]=a.right},decryptBlock:function(k,v){var a=p(r,k[v],k[v+1]);k[v]=a.left,k[v+1]=a.right},blockSize:64/32,keySize:128/32,ivSize:64/32});i.Blowfish=o._createHelper(A)})(),n.Blowfish})})(a0)),a0.exports}var pi=bt.exports,ce;function ki(){return ce||(ce=1,(function(t,x){(function(n,i,c){t.exports=i(z(),gt(),an(),cn(),kt(),ln(),lt(),H0(),f0(),En(),K0(),Dn(),mn(),Sn(),h0(),Fn(),dt(),Z(),Tn(),Pn(),Nn(),Ln(),Mn(),zn(),Gn(),qn(),Vn(),jn(),Qn(),ti(),ni(),ri(),di(),ai(),ci())})(pi,function(n){return n})})(bt)),bt.exports}var li=ki();const fi=tn(li);function pe(){typeof window>"u"||window.CryptoJS||(window.CryptoJS=fi)}class ke extends Error{constructor(x,n){super(x),this.methodName=n,this.name="MobileAuthSdkUnavailableError"}}function hi(){const t=window.YDRZAuthSF;if(!t)throw new ke("Mobile auth SDK global unavailable: window.YDRZAuthSF");return t}function vt(t){const n=hi()[t];if(typeof n!="function")throw new ke(`Mobile auth SDK method unavailable: ${String(t)}`,t);return n}function le(t){try{return JSON.stringify(t,(x,n)=>typeof n=="function"?"[Function]":n,2)}catch(x){return`[unserializable: ${x instanceof Error?x.message:String(x)}]`}}function ui(){return{showAuthPage(t){le(t),vt("showAuthPage")(t)},initControl(t){le(t),vt("initControl")(t)},clearControl(t){vt("clearControl")(t)},getAuthResult(t){vt("getAuthResult")(t)},updateSubmitBtnStatus(t){vt("updateSubmitBtnStatus")(t)}}}const u0="mobile-auth-sdk-script",A0="mobile-auth-sdk-style",fe=12e3;let Ct=null,ft=null;function Dt(t,x={}){return{state:t,scriptId:u0,styleId:A0,...x}}function Ai(){Ct=null}function he(t,x){return new Error(`Failed to load mobile auth SDK ${t} resource: ${x}`)}function Ei(t){const x=document.getElementById(u0);if(x instanceof HTMLScriptElement)return x.src=t,x;const n=document.createElement("script");return n.id=u0,n.async=!0,n.src=t,document.head.appendChild(n),n}function vi(t){const x=document.getElementById(A0);if(x instanceof HTMLLinkElement)return x.href=t,x;const n=document.createElement("link");return n.id=A0,n.rel="stylesheet",n.href=t,document.head.appendChild(n),n}function Ci(t){const x=Ei(t);return new Promise((n,i)=>{let c=!1;const o=()=>{c=!0,clearTimeout(m)},m=setTimeout(()=>{if(c)return;o();const e=new Error(`Mobile auth SDK script load timed out after ${fe}ms: ${t}`);e.reason="timeout",i(e)},fe),f=()=>{c||(o(),x.dataset.mobileAuthSdkLoaded="true",n())},E=()=>{if(c)return;o();const e=he("script",t);e.reason="error",i(e)};if(x.dataset.mobileAuthSdkLoaded==="true"){o(),n();return}x.addEventListener("load",f,{once:!0}),x.addEventListener("error",E,{once:!0})})}function Di(t){const x=vi(t);return new Promise((n,i)=>{const c=()=>{x.dataset.mobileAuthSdkLoaded="true",n()},o=()=>{i(he("style",t))};if(x.dataset.mobileAuthSdkLoaded==="true"){n();return}x.addEventListener("load",c,{once:!0}),x.addEventListener("error",o,{once:!0})})}function ue(t=b0()){if(!t.enabled){const n=Dt("disabled",{reason:"sdk-disabled"});return ft=n,Promise.resolve(n)}if(!t.jsUrl.trim()){const n=Dt("disabled",{reason:"missing-js-url"});return ft=n,Promise.resolve(n)}pe();const x=[Ci(t.jsUrl.trim())];return t.cssUrl.trim()&&x.push(Di(t.cssUrl.trim())),Promise.all(x).then(()=>{if(typeof window.YDRZAuthSF!="object"||window.YDRZAuthSF==null){const i=new Error("Mobile auth SDK script loaded but window.YDRZAuthSF is not registered"),c=Dt("error",{error:i,reason:"spa-html-fallback"});return ft=c,c}const n=Dt("ready");return ft=n,n}).catch(n=>{const i=n instanceof Error?n:new Error(String(n)),o=i.reason==="timeout"?"network-timeout":"error",m=Dt("error",{error:i,reason:o});return ft=m,m}).finally(()=>{Ai()})}function Bi(t){return t?ue(t):ft?.state==="ready"?Promise.resolve(ft):Ct||(Ct=ue(),Ct)}const xt=["确认当前手机号是中国移动号码","关闭 Wi-Fi 与 VPN/代理","打开手机的移动数据（4G/5G 蜂窝网络）","回到本页面，刷新或重新发起验证"],mi={103111:{uiText:"当前网络无法识别本机号码（WAP 网关 IP 错误），通常是因为没有使用中国移动的数据网络。",errorKind:"carrier-mismatch",source:"doc",steps:xt},103119:{uiText:"AppID 配置异常，请联系管理员。",errorKind:"sdk-init-failed",source:"doc"},103120:{uiText:"运管配置异常，请稍后再试。",errorKind:"sdk-init-failed",source:"doc"},103124:{uiText:"该号码暂不支持电信网络验证。",errorKind:"carrier-mismatch",source:"doc",steps:xt},103125:{uiText:"该号码暂不支持联通网络验证。",errorKind:"carrier-mismatch",source:"doc",steps:xt},103126:{uiText:"认证权益已失效，请联系管理员。",errorKind:"sdk-init-failed",source:"doc"},103127:{uiText:"应用没有认证权益，请联系管理员。",errorKind:"sdk-init-failed",source:"doc"},103130:{uiText:"本机号码校验失败。",errorKind:"carrier-mismatch",source:"doc",steps:xt},103131:{uiText:"当前网络号码与请求号码不一致。",errorKind:"carrier-mismatch",source:"doc",steps:xt},103135:{uiText:"请勾选阅读并同意隐私协议后重试。",errorKind:"sdk-init-failed",source:"doc"},105110:{uiText:"该号码暂不支持本次验证。",errorKind:"carrier-mismatch",source:"doc",steps:xt},105302:{uiText:"应用未在白名单，请联系管理员。",errorKind:"sdk-init-failed",source:"doc"},105312:{uiText:"认证能力余量不足，请稍后再试。",errorKind:"sdk-init-failed",source:"doc"},105016:{uiText:"已达到使用次数限制，请稍后再试。",errorKind:"sdk-init-failed",source:"doc"},105999:{uiText:"系统繁忙，请稍后再试。",errorKind:"sdk-init-failed",source:"doc"},110031:{uiText:"该号码不在中国移动网络环境。",errorKind:"carrier-mismatch",source:"business",steps:xt},110032:{uiText:"当前网络环境暂不支持验证。",errorKind:"carrier-mismatch",source:"business",steps:xt},ALL_CARRIERS_FAILED:{uiText:"本机号码识别需要使用中国移动手机号 + 中国移动数据网络（4G/5G 流量）。当前检测到三个运营商网络都无法识别，通常是因为正在使用 Wi-Fi 或非中国移动蜂窝网络。",errorKind:"carrier-mismatch",source:"sentinel",steps:xt},NETWORK_TIMEOUT:{uiText:"网络较慢加载超时，建议切换到中国移动数据网络后重试。",errorKind:"network-timeout",source:"sentinel"},SPA_HTML_FALLBACK:{uiText:"SDK 资源未正确加载，请刷新页面或联系技术支持。",errorKind:"sdk-init-failed",source:"sentinel"},SDK_DISABLED:{uiText:"SDK 已禁用，无法继续验证。",errorKind:"sdk-disabled",source:"sentinel"},CDN_BLOCKED:{uiText:"无法加载 SDK 资源，请检查网络或防火墙设置。",errorKind:"sdk-init-failed",source:"sentinel"}};function ht(t){const x=t==null?"":String(t).trim(),n=mi[x];return n||{uiText:`验证失败（错误码 ${x||"未知"}），请稍后再试。`,errorKind:"unknown",source:"sentinel"}}const E0=["YDData","CTData","CUData"],_i="103000";function Ae(t){const x={};for(const n of t)(n.carrier==="YD"||n.carrier==="CT"||n.carrier==="CU")&&(x[n.carrier]=n.code);return Object.keys(x).length>0?x:void 0}function Si(t){if(t==null||typeof t!="object")return{code:"",desc:"",carrier:"unknown"};const x=t,n=[],i=[];for(const o of E0){const m=x[o];if(!m||typeof m!="object")continue;n.push(o.slice(0,2));const f=m,E=f.resultCode??f.code;if(E==null||E===""||String(E).trim()===_i)continue;const e=typeof f.desc=="string"&&f.desc||typeof f.message=="string"&&f.message||"";i.push({code:String(E).trim(),desc:e,carrier:o.slice(0,2)})}if(n.length===E0.length&&i.length===E0.length)return{code:"ALL_CARRIERS_FAILED",desc:i.map(o=>`${o.carrier}:${o.code}/${o.desc}`).join(" | "),carrier:"unknown",carriers:Ae(i)};if(i.length>0)return{...i[0],carriers:Ae(i)};const c=x.code??x.resultCode;return c!=null&&c!==""?{code:String(c).trim(),desc:typeof x.desc=="string"&&x.desc||typeof x.message=="string"&&x.message||"",carrier:"unknown"}:{code:"",desc:"",carrier:"unknown"}}const Ee={phone:"ydrzPhoneControl",tips:"ydrzTipsControl",state:"ydrzStateControl","sms-input":"ydrzYZMControl","sms-button":"ydrzYZMBtnControl",submit:"ydrzSubmitControl",agreement:"ydrzAgreementControl"},bi=Object.freeze(Object.values(Ee)),yi="https://ginkgo.chinaums.com",Fi="/sign-pay-pro/";function gi(t){const x=t?.trim();if(!x||x==="/")return Fi;const n=/^https?:\\/\\//i.test(x)?new URL(x).pathname:x;return`${(n.startsWith("/")?n:`/${n}`).replace(/\\/+$/,"")}/`}function Ii(t,x){const n=t?.trim();return n?`${new URL(n).toString().replace(/\\/+$/,"")}/`:new URL(x.replace(/^\\/+/,""),`${yi}/`).toString()}const wi="/sign-pay-pro/assist/0.3.2/".trim()||"",Ti=gi(wi);Ii("https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/",Ti);const ve="assistance-mobile-auth",Ri="ASSISTANCE_AUTH_READY",Pi="ASSISTANCE_AUTH_PRESENTATION_READY",Hi="ASSISTANCE_AUTH_SUCCESS",Ni="ASSISTANCE_AUTH_CANCEL",Oi="ASSISTANCE_AUTH_ERROR",Li="ASSISTANCE_AUTH_ERROR_NOTICE",Ki="ASSISTANCE_AUTH_CONFIG",Mi="ASSISTANCE_AUTH_PHONE_READY",Ui="ASSISTANCE_AUTH_RESIZE",zi="ASSISTANCE_AUTH_CLOSE",Wi="ASSISTANCE_AUTH_PROBE_RESULT",Gi="ASSISTANCE_AUTH_STATE_CHANGE",$i="ASSISTANCE_AUTH_STYLE",qi="ASSISTANCE_AUTH_CUSTOM_BOOT";function Yi(t){return typeof t=="object"&&t!==null}function Vi(t){return t===Ri||t===Pi||t===Hi||t===Ni||t===Oi||t===Li||t===Ki||t===Mi||t===Ui||t===zi||t===Wi||t===Gi||t===$i||t===qi}function Xi(t){if(typeof t!="string"||!t.trim())return null;try{const x=new URL(t.trim());return x.protocol!=="http:"&&x.protocol!=="https:"||x.username||x.password||x.pathname!=="/"||x.search||x.hash||x.origin==="null"?null:x.origin}catch{return null}}function ut(t,x,n){return{source:ve,type:t,sessionId:x,payload:n}}function ji(t,x){return Yi(t)&&t.source===ve&&Vi(t.type)&&typeof t.sessionId=="string"&&(!x||t.sessionId===x)}function Zi(t){let x,n=!1,i=!1,c=!1,o;const m=(e,r)=>t.onError(e instanceof Error?e:new Error(String(e)),r);function f(){const e=new TypeError("Caller agreement index or checked value is invalid");if(!i)throw e;m(e,"input")}return{api:{register(e){if(!c){if(n||x)throw new Error("Customer hooks must register synchronously, once");if(!e||typeof e!="object"||e.onStateChange!==void 0&&typeof e.onStateChange!="function"||e.dispose!==void 0&&typeof e.dispose!="function"||e.ready!==void 0&&typeof e.ready.then!="function")throw new TypeError("Customer hooks are invalid");x={...e},o=Promise.resolve(e.ready),o.catch(()=>{})}},setIdLast4(e){if(!c){if(typeof e!="string"||!/^[0-9xX]{0,4}$/.test(e)){m(new TypeError("Identity input accepts at most four digits or X"),"input");return}t.onIdLast4(e.toUpperCase())}},setCallerAgreementChecked(e,r){if(!c){if(!Number.isInteger(e)||e<0||e>=t.callerAgreementCount||typeof r!="boolean"){f();return}t.onCallerAgreement(e,r)}},close(){c||t.onClose()}},sealRegistration(){return n=!0,o??=Promise.resolve(),o.then(()=>{c||(i=!0)})},publish(e){if(!c)try{x?.onStateChange?.({...e})}catch(r){m(r,"hook")}},dispose(){if(!c){c=!0;try{x?.dispose?.()}catch(e){m(e,"hook")}finally{x=void 0}}}}}function s0(t,x){const n=t.trim();if(!n||n.startsWith("#"))return n;if(!x&&!/^[a-z][a-z\\d+.-]*:/i.test(n))throw new TypeError("Relative customer resources require baseUrl");return new URL(n,x).toString()}function tt(t){if(t.signal.aborted)throw new DOMException("Customer page aborted","AbortError");if(Date.now()>=t.deadline)throw new Error("Customer page startup deadline exceeded")}function Bt(t,x){return new Promise((n,i)=>{try{tt(x)}catch(f){i(f);return}const c=f=>{clearTimeout(m),x.signal.removeEventListener("abort",o),f()},o=()=>c(()=>i(new DOMException("Customer page aborted","AbortError"))),m=setTimeout(()=>c(()=>i(new Error("Customer page startup deadline exceeded"))),Math.max(0,x.deadline-Date.now()));x.signal.addEventListener("abort",o,{once:!0}),Promise.resolve(t).then(f=>c(()=>{try{tt(x),n(f)}catch(E){i(E)}}),f=>c(()=>i(f)))})}const v0=new WeakMap,C0=new WeakSet;function Ce(t){return t.tagName==="STYLE"?t.textContent??"":["href","rel","src","srcset"].map(x=>t.getAttribute(x)??"").join(`\n`)}function D0(t,x){v0.set(t,{source:Ce(t),loaded:x})}function Qi(t){const x=n=>{const i=n.target;i?.matches?.(\'style, link[rel~="stylesheet"]\')&&D0(i,n.type==="load")};return C0.add(t),t.addEventListener("load",x,!0),t.addEventListener("error",x,!0),()=>{C0.delete(t),t.removeEventListener("load",x,!0),t.removeEventListener("error",x,!0)}}function c0(t,x){const n=v0.get(t);return n?.source===Ce(t)?Promise.resolve(n.loaded):new Promise((i,c)=>{try{tt(x)}catch(r){c(r);return}const o=()=>{clearTimeout(e),t.removeEventListener("load",m),t.removeEventListener("error",f),x.signal.removeEventListener("abort",E)},m=()=>{o(),D0(t,!0),i(!0)},f=()=>{o(),D0(t,!1),i(!1)},E=()=>{o(),c(new DOMException("Customer page aborted","AbortError"))},e=setTimeout(()=>{o(),c(new Error("Customer page startup deadline exceeded"))},Math.max(0,x.deadline-Date.now()));t.addEventListener("load",m,{once:!0}),t.addEventListener("error",f,{once:!0}),x.signal.addEventListener("abort",E,{once:!0})})}async function De(t,x){const n=[...t.querySelectorAll(\'link[rel~="stylesheet"]\')],i=[...t.querySelectorAll("style")].filter(o=>/@import\\b/i.test(o.textContent??"")),c=[...n.map(o=>v0.has(o)||C0.has(t)?c0(o,x):o.sheet?Promise.resolve(!0):c0(o,x)),...i.map(o=>c0(o,x))];await Promise.all(c.map(async o=>{if(!await o)throw new Error("Customer stylesheet CSS failed to load")})),tt(x)}async function Ji(t,x){tt(x),await De(t,x);let n=!1;const i=t.ownerDocument.defaultView,c=i?.innerHeight??t.ownerDocument.documentElement.clientHeight,o=i?.innerWidth??t.ownerDocument.documentElement.clientWidth,f=[...t.querySelectorAll("img")].filter(r=>{if(!r.getAttribute("src")&&!r.getAttribute("srcset"))return!1;const D=r.getBoundingClientRect();return D.bottom>=0&&D.top<c&&D.right>=0&&D.left<o}).map(async r=>{(r.complete?r.naturalWidth>0:await c0(r,x))||(n=!0)}),E=t.ownerDocument.fonts,e=E?Bt(Promise.resolve(E.ready).catch(()=>{n=!0}),x):Promise.resolve();await Promise.all([...f,e]),tt(x),E?.forEach?.(r=>{r.status==="error"&&(n=!0)}),n&&x.onNotice("Some customer images or fonts could not load")}function B0(t,x){return t.replace(/url\\(\\s*(?:"([^"]*)"|\'([^\']*)\'|([^)]*?))\\s*\\)/gi,(n,i,c,o)=>`url("${s0(i??c??o??"",x).replace(/"/g,"%22")}")`).replace(/(@import\\s+)(["\'])([^"\']+)\\2/gi,(n,i,c,o)=>`${i}"${s0(o,x)}"`)}function tr(t,x){const n=[];let i=t.trim();for(;i;){const c=/^(\\S+)(?:\\s+([^,]+))?\\s*,?\\s*/.exec(i);if(!c)break;let o=c[1],m=c[2]?.trim()??"",f=c[0].length;if(!o.startsWith("data:")&&o.includes(",")){const E=o.indexOf(",");f=E+1,o=o.slice(0,E),m=""}else o=o.replace(/,+$/,"");n.push(`${s0(o,x)}${m?` ${m}`:""}`),i=i.slice(f).trim()}return n.join(", ")}function Be(t,x){for(const n of[t,...t.querySelectorAll("*")]){for(const c of["src","poster","href","action","formaction","xlink:href"]){const o=n.getAttribute(c);if(o!==null){const m=s0(o,x);m!==o&&n.setAttribute(c,m)}}for(const c of["srcset","imagesrcset"]){const o=n.getAttribute(c);if(o!==null){const m=tr(o,x);m!==o&&n.setAttribute(c,m)}}const i=n.getAttribute("style");if(i!==null){const c=B0(i,x);c!==i&&n.setAttribute("style",c)}if(n.tagName==="STYLE"){const c=n.textContent??"",o=B0(c,x);o!==c&&(n.textContent=o)}}}function er(t){if(t.hasAttribute("src"))throw new Error("Customer external script src is unsupported");const x=t.type.trim().toLowerCase();if(x==="module")throw new Error("Customer module scripts are unsupported");x&&!["text/javascript","application/javascript","text/ecmascript","application/ecmascript"].includes(x)||me(t.textContent??"")}function me(t){let x=0;const n=c=>{for(x++;x<t.length;){const o=t[x++];if(o==="\\\\")x++;else if(o===c)break}},i=(c=!1)=>{let o="",m=0;for(;x<t.length;){const f=t[x];if(f===\'"\'||f==="\'"){n(f),o+=\'""\';continue}if(t.startsWith("//",x)){for(;x<t.length&&!/[\\r\\n]/.test(t[x]);)x++;o+=" ";continue}if(t.startsWith("/*",x)){const E=t.indexOf("*/",x+2);x=E<0?t.length:E+2,o+=" ";continue}if(f==="`"){for(x++,o+=\'""\';x<t.length;){if(t[x]==="\\\\"){x+=2;continue}if(t[x]==="`"){x++;break}t.startsWith("${",x)?(x+=2,o+=` (${i(!0)}) `):x++}continue}if(f==="}"&&c&&m===0){x++;break}f==="{"&&m++,f==="}"&&m--,o+=f,x++}return o};if(/(?<![\\w$.])\\bimport\\s*(?:\\(|["\'{*]|[\\w$]+\\s*(?:,|from\\b))/.test(i()))throw new Error("Customer external module import is unsupported")}async function nr(t,x){const n=x.document.defaultView;if(!n)throw new Error("Customer page needs a live document window");tt(x);let i,c=t.baseUrl;if(t.kind==="url"){const v=await Bt(fetch(t.url,{signal:x.signal}),x);if(!v.ok)throw new Error("Customer HTML fetch failed");i=await Bt(v.text(),x),c??=v.url||t.url}else i=t.html;tt(x);const o=new n.DOMParser().parseFromString(i,"text/html");o.querySelectorAll("base").forEach(v=>v.remove());const m=x.document.createElement("div");m.setAttribute("data-custom-root","");const f={};for(const v of[o.documentElement,o.body])for(const a of v.attributes)(a.name==="class"||a.name.startsWith("data-"))&&(f[a.name]=a.value,m.setAttribute(a.name,a.value));m.append(...[...o.head.childNodes,...o.body.childNodes].map(v=>x.document.importNode(v,!0)));const E=[...m.querySelectorAll("script")];E.forEach(er),t.js&&me(t.js),E.forEach(v=>v.remove()),Be(m,c);const e=t.css?B0(t.css,c):void 0,r=Object.getOwnPropertyDescriptor(n,"AssistanceCustomPage");let D=!1,d=!1;const p=new AbortController,l={...x,signal:p.signal},A=Qi(m),k=()=>{d||(d=!0,p.abort(),A(),x.signal.removeEventListener("abort",k),m.remove(),D&&(r?Object.defineProperty(n,"AssistanceCustomPage",r):Reflect.deleteProperty(n,"AssistanceCustomPage")))};x.signal.addEventListener("abort",k,{once:!0});try{Object.defineProperty(n,"AssistanceCustomPage",{configurable:!0,writable:!0,value:x.api}),D=!0,m.inert=!0;const v=m.style.opacity;m.style.opacity="0";const a=De(m,l);x.document.body.append(m),await a;const s=C=>{tt(x);let B;const b=F=>{B=F.error instanceof Error?F.error:new Error(F.message),F.preventDefault()},y=x.document.createElement("script"),u="__assistanceCustomerScriptComplete",_=Object.getOwnPropertyDescriptor(n,u);let I=!1;n.addEventListener("error",b);try{if(Object.defineProperty(n,u,{configurable:!0,value:()=>{I=!0}}),y.textContent=`${C}\n;this[${JSON.stringify(u)}]();`,m.append(y),B)throw B;if(!I)throw new Error("Customer script did not execute; check Content Security Policy")}finally{n.removeEventListener("error",b),_?Object.defineProperty(n,u,_):Reflect.deleteProperty(n,u)}tt(x)};for(const C of E)!C.type||/^(?:text|application)\\/(?:javascript|ecmascript)$/i.test(C.type.trim())?s(C.textContent??""):m.append(C);if(t.js&&s(t.js),await Bt(x.sealRegistration(),l),tt(x),e){const C=x.document.createElement("style");C.textContent=e,m.append(C)}const h=new Set;for(const C of m.querySelectorAll("[id]")){if(h.has(C.id))throw new Error(`Duplicate customer ID: ${C.id}`);h.add(C.id)}for(const C of bi)if(!h.has(C))throw new Error(`Required customer slot missing: ${C}`);Be(m,c),await Ji(m,l),tt(x),m.inert=!1,m.style.opacity=v;const S={css:[...m.querySelectorAll("style")].map(C=>C.textContent??"").join(`\n`),urls:[...m.querySelectorAll(\'link[rel~="stylesheet"]\')].map(C=>C.href),rootAttributes:f};return{root:m,styles:S,dispose:k}}catch(v){throw k(),v}}const rt={submitBtnStyle:{width:"100%",height:"48px",bgColor:"#ff2d55",borderRadius:"10px",fontSize:"16px",fontColor:"#FFFFFF",name:"确认",textAlign:"center"},submitBtnDisabledStyle:{bgColor:"#F5F6F8",fontColor:"#8A8F98"},submitBtnLoadingStyle:{height:"48px"},phoneStyle:{bgColor:"#FFFFFF",fontColor:"#8A8F98",fontSize:"14px",borderRadius:"0",textAlign:"left",width:"auto"},localTipStyle:{fontColor:"#8A8F98",fontSize:"12px",textAlign:"left"},unlocalTipStyle:{fontColor:"#8A8F98",fontSize:"12px",textAlign:"left"},stateStyle:{width:"100%",bgColor:"#FFFFFF",fontColor:"#334155",fontSize:"14px",borderRadius:"12px",textAlign:"center"},authTextStyle:{fontColor:"#334155",bgColor:"#FFFFFF",borderRadius:"12px",textAlign:"center"},authExpireStyle:{fontColor:"#8A8F98",fontSize:"14px"},checkboxStyle:{width:"18px",height:"18px",checkedColor:"#ff2d55",borderColor:"#c8ccd1"}};function ir(t={}){return{submitBtnStyle:{...rt.submitBtnStyle,...t.submitBtnStyle},submitBtnDisabledStyle:{...rt.submitBtnDisabledStyle,...t.submitBtnDisabledStyle},submitBtnLoadingStyle:{...rt.submitBtnLoadingStyle,...t.submitBtnLoadingStyle},phoneStyle:{...rt.phoneStyle,...t.phoneStyle},localTipStyle:{...rt.localTipStyle,...t.localTipStyle},unlocalTipStyle:{...rt.unlocalTipStyle,...t.unlocalTipStyle},stateStyle:{...rt.stateStyle,...t.stateStyle},authTextStyle:{...rt.authTextStyle,...t.authTextStyle},authExpireStyle:{...rt.authExpireStyle,...t.authExpireStyle},checkboxStyle:{...rt.checkboxStyle,...t.checkboxStyle},...t.agreeStyle?{agreeStyle:t.agreeStyle}:{}}}function rr(t){const{agreeStyle:x,topImageStyle:n,bottomImageStyle:i,...c}=t.customer??{},o={};for(const m of["width","fontFamily","fontSize","textAlign","fontColor","hrefColor"])x?.[m]!==void 0&&(o[m]=x[m]);if(x?.checkboxStyle){const m={};for(const f of["width","height","checkedColor","borderColor","checkBgImg","checkedBgImg"])x.checkboxStyle[f]!==void 0&&(m[f]=x.checkboxStyle[f]);o.checkboxStyle=m}return o.agreeArr=t.agreeArr,o.childArr=t.childArr,ir({...c,submitBtnStyle:{...c.submitBtnStyle,name:c.submitBtnStyle?.name??"同意并授权"},agreeStyle:o})}const xr={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[[{kind:"text",text:"合作方",colSpan:7}],["合作方名称","共享目的","共享场景","个人信息","提供方式","隐私政策或官网","联系方式"],["安行天下保险经纪（上海）有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口",{kind:"doc-link",text:"《安行天下个人信息保护政策》",docKey:"anxingtianxia-v2-privacy-policy"},"4006-199-588"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口",{kind:"doc-link",text:"《中国移动认证梧桐数盾隐私政策》",docKey:"anxingtianxia-v2-cmcc-privacy-policy"},"10086"]]}]},dr={title:"《安行天下个人信息保护政策》",blocks:[{kind:"h1",text:"安行天下个人信息保护政策"},{kind:"p",text:"本版发布日期∶2026年5月21日"},{kind:"p",text:"本版生效日期∶2026年5月28日"},{kind:"p",text:\'安行天下保险经纪（上海）有限公司（以下简称"安行天下"或者"我们"）一直致力于用户的隐私和个人信息保护，并且承诺将按照业界成熟的安全标准，根据国家相关法律法规的要求，尽全力保护您的个人信息安全。我们希望通过本《个人信息保护政策》向您说明当您使用我们的产品或服务时，我们如何处理您的个人信息，以及我们为您提供的访问、更新、删除和保护这些信息的方式。\'},{kind:"b",text:"请您在使用我们所提供的产品或服务前，务必仔细阅读本《个人信息保护政策》，做出您认为适当的选择。我们努力用通俗易懂、简明扼要的文字表达，并对本政策中的涉及的敏感个人信息以及与您的利益存在重大关系的条款、个人信息采用粗体字进行标注以提示您注意。您需在充分理解并同意本政策的情况下使用我们的产品或服务，一旦您开始使用我们提供的产品或服务，即表示您已充分理解并同意本政策。如您对本政策内容有任何疑问、意见或建议，您可通过本政策“如何联系我们”章节所列的反馈渠道联系我们，我们会尽快为您作出解答。"},{kind:"p",text:"本政策将帮助您了解以下内容∶"},{kind:"h1",text:"一、协议适用主体范围"},{kind:"h1",text:"二、我们如何收集您的个人信息"},{kind:"h1",text:"三、我们如何存储您的个人信息"},{kind:"h1",text:"四、我们如何使用您的个人信息"},{kind:"h1",text:"五、我们如何提供、委托处理、转让、公开披露您的个人信息"},{kind:"h1",text:"六、征得授权同意的例外"},{kind:"h1",text:"七、您如何行使您的个人信息权利"},{kind:"h1",text:"八、我们如何保护未成年人的个人信息权益"},{kind:"h1",text:"九、本政策如何更新"},{kind:"h1",text:"十、如何联系我们"},{kind:"h1",text:"十一、本政策中关键词说明"},{kind:"h1",text:"一、协议适用主体范围"},{kind:"h2",text:"（一）本政策适用于我们通过安行天下官网（www.axinsur.com）、自营微信公众号（名称：星火保，ID：xinghuobaoxian）、APP、安行天下所拥有的H5页面、小程序、在第三方平台嵌入的链接及功能模块等自营互联网平台（以下合称“安行天下平台”）以及通过线下方式为您提供的所有产品或服务，如保险产品的购买、保险咨询预约服务、保险方案的拟定与讲解、保单查询与退保申请、保险与理赔咨询、理赔服务申请、持续的客户服务与回访、个人权益查看、会员权益及福利活动的开展等。"},{kind:"h2",text:"（二）您也可能通过其他网站或平台的链接访问安行天下平台，由于本政策不适用于这些第三方网站或平台，我们建议您查看该等网站的隐私政策、个人信息保护政策或涉及您个人信息的相应条款与约定，了解他们如何处理您的个人信息，该等网站对您的个人信息的收集、使用、存储、提供、转移、公开披露等行为独立承担责任。"},{kind:"h2",text:"（三）本政策不适用于您通过我们提供的服务/产品而接入的其他第三方服务/产品，亦不适用于您通过其他第三方在我们平台中嵌入的独立入口而接触的第三方提供的服务/产品（统称“第三方服务/产品”）。这些第三方服务/产品有关于您个人信息的具体规定请参照提供该服务/产品的第三方的个人信息保护政策或类似声明。我们会在与这些第三方开展合作过程中尽最大努力督促其保护您的个人信息，但您理解这些产品/服务由第三方独立向您提供，第三方将依照其个人信息保护政策或用户协议单独对您的个人信息处理承担责任。您在选择接受第三方服务/产品前应充分了解第三方服务/产品的详细信息、个人信息保护政策或隐私政策或类似声明，再选择是否使用。"},{kind:"h1",text:"二、我们如何收集您的个人信息"},{kind:"p",text:"在您使用安行天下产品、服务过程中，我们会基于不同情形并按照如下方式收集您在使用产品、服务时产生或为了使用产品、服务所必要的个人信息，以便向您提供产品/服务以及保障您的账户安全："},{kind:"h2",text:"基于安行天下平台账户注册及会员服务"},{kind:"h2",text:"1.在您注册安行天下平台账户时，您需要向我们提供手机号码，我们将通过发送短信验证码的方式来验证您的手机号是否有效，验证无误后我们会为您创建会员账号。您也可使用第三方平台（如微信、中国移动、苏周到APP等）账号信息注册并登录安行天下平台，您将授权我们获取您在上述第三方平台合法留存的手机号码用于完成安行天下平台的注册登录。如您拒绝提供相关注册信息，您可能无法注册成为安行天下平台会员及享有相关会员权益或服务，但不影响您使用安行天下平台的其他服务。"},{kind:"h2",text:"2.当您通过安行天下平台参与安行天下提供的特色会员活动、提升会员等级特权、享受会员专属权益时，我们可能需要向您收集并使用您在参与此类特色会员活动、提升会员等级特权、享受会员权益时所必要的个人信息（如您之前已提交过相应个人信息，则我们可能会利用已收集的您的个人信息进行相应同步），如姓名、有效身份证件及其号码、手机号、地址，以保证您能正常享有该会员服务的使用权益。如您拒绝提供相关活动所需的个人信息，您可能无法享有、参与此类特色会员活动的相关权益或服务，但不影响您使用我们的其他服务。"},{kind:"h2",text:"3.当您关注我们的微信公众号、小程序或通过微信环境访问我们的页面时，我们可能需要收集您的微信openID、unionID、昵称、头像、手机号用于我们向您提供注册、关注、推送消息、支付服务。"},{kind:"h2",text:"实名认证管理要求"},{kind:"p",text:"1.在您使用安行天下平台的投保服务时，基于投保人实名制管理要求，您需要向我们提供手机号码、验证码用于实名认证。您也可以授权我们获取您在第三方平台（如微信、中国移动、苏周到APP等）注册的姓名、手机号码用于实名认证，以满足法律法规关于投保人信息实名及保证投保行为是您本人自主操作的要求。我们会经您明确同意后收集该信息，如您不同意提供该等信息，可能无法使用与监管要求相关的部分服务，但不影响您使用其他服务。"},{kind:"p",text:"2.在您申请退保时，基于实名制管理要求及为了验证您的身份，我们会向您收集您的姓名、手机号、验证码、出生年月日、有效身份证件的类型及其号码、身份证正反面照片信息，从而进行实名认证。前述加粗信息属于您的敏感个人信息，我们基于履行法定义务收集上述信息，如您不同意提供该等敏感个人信息，可能无法进行实名认证，可能进一步无法使用与监管相关的部分服务，但不影响您使用我们提供的其他服务。"},{kind:"h2",text:"基于保险咨询、保险产品投保、理赔、合同变更、客服及争议处理服务"},{kind:"p",text:"1.当您通过访问安行天下平台使用保险咨询服务时，我们可能会向您收集姓名、性别、年龄、地域、手机号、感兴趣的产品、是否买过保险、家庭收入、保险预算、身份证号码、邮箱、婚姻状态、社保参保状态、家庭成员关系，以向您推荐合适的保险机构为您提供详细的保险保障计划制定等保险咨询服务或推荐合适的保险产品，如您拒绝提供上述信息，我们可能无法为您提供保险咨询服务，但不影响您使用我们提供的其他服务。"},{kind:"p",text:"2.当您通过微信公众号、官方网站、投放链路（公域媒体或短信链接入口）、小程序或其他方式访问安行天下平台或通过线下方式在安行天下进行保险产品投保时，我们可能会根据您所投保的保险产品类型在如下范围内收集您相应的投保信息，以便协助您与保险公司订立保险合同。这些信息主要包括：投保人的姓名、有效身份证件类型及号码（如身份证及身份证号码）、手机号码、性别、生日、地址、邮编、职业、职级、银行卡号、银行开户行、行驶证;被保险人的姓名、有效身份证件类型及号码（如身份证及身份证号码）、手机号码及联系方式、职业、投被保人关系、被保人社保参保状态；受益人的姓名、有效身份证件类型及号码（如身份证及身份证号码）、银行账户信息（银行账号、网点、开户行）、与被保险人关系、联系方式。如涉及公司信息按所投保产品的要求提供，如您为他人提供个人信息的，您需保证已取得他人合法同意。如果您拒绝提供这些信息，我们将无法为您提供相关服务以完成投保手续，但不影响您使用我们提供的其他服务。"},{kind:"p",text:"3.当您通过我们申请理赔时、我们可能协助承保的保险公司收集您申请理赔时所需的相关个人信息，包括被保险人或者受益人的姓名、保单号、有效身份证件类型及号码、出险描述、所在医院类型、职业、银行卡信息（可能包括银行账户）、诊断证明、病历信息、就诊费用（包括因病医治产生的相关记录信息）信息;在报案人并非被保险人的情况下，我们还可能收集报案人姓名、电话、与被保险人或受益人的关系、微信号信息。如果您拒绝提供这些信息，我们将无法为您提供保险理赔相关服务，但不影响您使用我们提供的其他服务。"},{kind:"p",text:"4.在向您提供投保、理赔等保险服务过程中，为核验您是否具备投保或理赔资格，我们可能会向与我们合作的保险公司、服务平台、政府机关授权单位及其他合法留存您个人信息的第三方主体（如健康服务机构、信息技术服务机构）处收集与我们为您所提供的产品/服务相关且必须的、您合法留存的个人信息（如有效身份证件类型及其号码和有效期、保险标的信息、产品/服务订单信息及必要的风险信息）。例如，针对意外险，我们可能需要收集职业类别及风险信息；针对健康险，我们可能需要收集健康状况信息；针对财产险，我们可能需要收集标的信息、订单信息；针对车险，我们可能需要收集车辆相关的必要信息，后续报案理赔过程中可能还需要收集事故情况、车辆损毁情况等；我们承诺所收集的信息均是与您投保的产品/服务所相关且必须的。"},{kind:"p",text:"5.当您投保成功后通过安行天下平台查看保险单时，由于保险单实际是由为您承保的保险公司提供，因此我们需从为您承保的保险公司或我们合作的保险中介机构处（如您通过我们在我们合作的保险中介机构处完成投保的）获取您的保险单信息，以方便为您提供查询、下载等服务。当您访问安行天下公众号查看保险单时，我们需要收集您微信账号的昵称、头像、OpenID、UnionID，以便为您提供查询、下载服务。"},{kind:"p",text:"6.当您通过我们进行保险合同变更或退保时，我们可能收集您申请变更或退保时主动提供的保险单号、联系方式、投保人及被保险人姓名、投保人及被保险人有效身份证件类型及号码和有效期、投保人身份证正反面影像、变更/退保事由、微信号、邮箱、保险订单信息（保费金额及可能包括消费交易记录）、银行卡号及开户行、其他需配合提供的协议文件等，当您通过线上进行变更操作时，为方便您的操作，我们可能视情况在流程中对此前您投保时提供的部分信息进行同步。如果您拒绝提供这些信息，我们将无法为您提供保险合同变更相关服务，但不影响您使用我们提供的其他服务。"},{kind:"p",text:"7.当您与我们联系或提出售前、售中、售后、争议纠纷处理申请时，为了保障您的账户及系统安全，我们需要您提供必要的个人信息如您的姓名、手机号、验证码、出生年月日、有效身份证件的类型及其号码以核验您的用户身份。"},{kind:"p",text:"为便于与您联系、尽快帮助您解决问题或记录相关问题的处理方案及结果或为了履行法律法规对于我们提供保险业务客户服务的要求，我们可能会收集您的微信号以及保存您与我们的沟通、通信/通话记录及相关内容（包括您的健康状况、年龄、职业、既往病史、有无社保情况、性别、平台账户信息、订单信息（可能包括交易消费记录）、投保过程的页面操作轨迹、身份证号码及有效期、身份证正反面照片、银行卡号及账户信息、手机号码及验证码、本人手持身份证件照片、支付宝账号、邮箱、咨询或投诉的事由详情、您为了证明相关事实提供的其他信息（包括但不限于短信、录音、网址链接、视频或图片等）、联系地址或您留下的联系方式信息、其他需配合提供的协议文件等）。如果您针对具体订单进行咨询、投诉或提供建议的，我们会使用您的账户信息、订单或保单信息。如您委托他人进行咨询、投诉或提供建议的，我们还可能会收集委托人与受托人关系信息、委托证明、受托人手机号码、受托人姓名及身份证号码。"},{kind:"h2",text:"基于您访问星辰APP需要收集的信息"},{kind:"h2",text:"1.当您访问星辰APP使用注册功能时，我们会收集您的手机号、密码、验证码用于为您创建账号并完成注册流程。"},{kind:"h2",text:"2.当您登录星辰APP时，我们会收集您的手机号及密码用于完成登录程序。"},{kind:"h2",text:"3.当您作为保险代理人注册星辰APP时，为向您提供注册服务，我们将从您所属的保险机构获得您的用户名（工号/姓名）、账户、密码、出单代码、手机号用于完成注册流程。"},{kind:"h2",text:"4.当您作为保险代理人登录星辰APP时，我们会收集您的账户、密码用于完成登录程序。"},{kind:"h2",text:"为了您的账户安全需要收集的信息"},{kind:"p",text:"1.为了识别风险以及线上欺诈行为，从而保障您的账户或信息安全，保障您正常参与安行天下各项活动权利，我们会向您收集您的操作日志、位置信息、安行天下平台版本信息、设备型号、IP地址、设备操作系统信息以及其他与安行天下服务相关的日志信息等。其中，我们需要您开启设备中的位置信息权限、网络访问权限以收集您的地理位置，若您选择不开启网络访问权限，安行天下平台的所有功能均无法使用，若您选择不开启位置信息权限，可能无法正常使用地理位置的特定功能，但不影响您使用我们提供的其他服务。除此以外的前述其他设备信息，我们通过您的计算机、手机及其他访问设备服务端或客户端发给我们的信息进行收集。前述加粗信息属于您的敏感个人信息，我们基于履行法定义务收集该信息，如您不同意提供或不同意我们记录前述信息，可能无法实现我们对您的账户或信息安全管理。"},{kind:"p",text:"2.为排查系统崩溃原因、减少崩溃情况的发生，以不断改进我们的产品或服务。当您使用我们的产品或服务时，我们可能会收集您的您使用设备的相关信息，如点击或浏览我们的产品或服务功能、页面的URL地址及其使用情况。"},{kind:"p",text:"3.基于安全管理的原因，我们可能会从行政机关、司法机关、征信机构、医疗机构及合作机构、关联方（如星火智云（上海）科技发展有限公司）以及其他合法了解掌握相关信息的自然人和法人处收集或查询您的身份、财产、健康状况等相关信息以及经去标识化处理后的安全类、风控类信息，用于风控、保险反欺诈、反黑灰产等，以保障您的信息安全及满足法律法规要求。"},{kind:"p",text:"4.基于行业监管规定，为落实保险销售行为可回溯管理要求，我们通过在用户页面操作日志埋点上报的方式，收集您在保险投保页面上的操作轨迹、客户端信息、手机号、客户端设备信息。"},{kind:"h2",text:"提供拓展服务"},{kind:"p",text:"1.为提升安行天下平台服务体验，了解您如何接入和使用安行天下的产品或服务，为您提供产品推荐、个性化展示、投保交易及智能核保等服务。因此，我们可能收集您合法留存在安行天下合作方、行政、司法机关以及安行天下的关联公司（例如星火智云（上海）科技发展有限公司）的经去标识化处理后的风险水平类信息，这类信息对于我们来说无法识别、还原到个人。"},{kind:"p",text:"2.当您参与平台活动时，我们可能收集您参与活动的必要信息，如产品或服务领取的收件地址、联系人姓名、联系电话、订单信息、邮箱地址。如该产品或服务由第三方服务商负责提供，我们需将您的上述信息提供至第三方服务商为您提供产品或服务。如您拒绝提供这些信息，我们将无法为您提供活动相关服务，但不影响您使用我们提供的其他服务。"},{kind:"p",text:"3.在双保险中介合作的业务中，当您通过我们在我们的合作保险机构参加活动或享受保险咨询或投保服务后，为方便我们为您提供后续的保险经纪服务以及出于我们与合作机构结算费用的需要，我们可能会从合作机构处获取您的服务项目名称、所属分公司、保单号、投保人姓名、主险名称、保单期缴保费、缴费频率、交费年期、保障年期、首期保费、交至日、累计缴费期数、年化首年保费（AFYP）、承保日期、保单状态。"},{kind:"h2",text:"（七）使用 Cookie 和同类技术收集的信息"},{kind:"p",text:\'1.为确保我们的网站正常运转、为您获得更轻松的访问体验、向您推荐您可能感兴趣的内容、当您使用安行天下的产品或服务时，我们可能会保存您的登录状态并且为您分配一个或多个"Cookie"（一种很小的文本文件）。\'},{kind:"p",text:"2.Cookie 文件将保存在您的计算机硬盘或设备终端的闪存上，它只能被设置它们的服务器阅读。您可以随时使用自带清除 Cookie 功能的浏览器或操作系统软件将其删除。"},{kind:"p",text:"3.为了向您提供更为方便、快捷、顺畅、个性化的服务，我们通过 Cookie 等技术为您提供以下服务："},{kind:"p",text:"（1）记住您的账户。例如，Cookie可能帮助您省去为使用安行天下服务而重复输入账户信息的步骤。"},{kind:"p",text:"（2）分析您使用安行天下产品或服务的情况。例如，我们可通过 Cookie 等技术来了解您使用安行天下产品或服务的具体用途，或哪些网页或服务最受您的欢迎。"},{kind:"p",text:"（3）广告优化。我们可能会根据您访问相关网站的统计信息为您显示您可能感兴趣的产品或广告信息。这些统计信息并不包括您的任何个人信息，cookie等技术有助于我们根据您的信息，您提供与您相关的广告而非进行普遍的广告投放。"},{kind:"p",text:"（4）我们也可能通过cookie技术来统计匿名访问的数据，同样，这些统计信息并不包括您的个人信息。"},{kind:"p",text:\'（5）您也可以通过浏览器选择"不使用Cookie"，但是您如选择这样做可能会影响您对安行天下产品或服务的使用，或是您无法享受到更加安全、快捷、顺畅、个性化的服务，但不影响您正常使用我们提供的其他服务。\'},{kind:"h2",text:"（八）第三方服务商与第三方插件"},{kind:"h2",text:"您知晓，我们在提供产品或服务过程中可能会部署第三方插件，例如软件开发工具包SDK、部署统计分析工具等，该类插件可能会收集您的个人信息。同时，我们可能会在平台上为您提供其他第三方产品或服务，该产品或服务可能会收集您与产品服务相关的必要个人信息。"},{kind:"b",text:"为便于您了解上述第三方服务商和第三方插件服务的提供主体、信息收集方式、信息收集范围等关于您的个人信息收集使用的相关信息，您可以通过本政策附录2《第三方SDK服务列表》进行查阅。"},{kind:"h2",text:"（九）特别提示与说明"},{kind:"p",text:"请您理解，我们向您所提供的产品/服务是不断更新的，基于提供产品/服务的目的我们可能需要收集您的其他信息，并通过页面提示、各类交互、协议约定等方式向您说明收集的范围与目的。我们将严格遵照本政策的约定处理您的信息；如您选择不提供相应信息，可能将无法使用某项或者部分产品/服务，但不影响您使用无须提供该对应信息的产品/服务。"},{kind:"p",text:"此外，与我们合作的第三方可能将产品/服务接入我们的产品/服务或者在我们的平台上提供其产品/服务的独立入口，请您务必注意：这些产品/服务相关的页面以及实际的产品/服务将由该等第三方机构独立所有、运营、提供，涉及到第三方向您收集个人信息时，我们强烈建议您在提供个人信息前仔细查看该等第三方的个人信息保护政策或类似协议约定，并做出符合您个人需要的选择。"},{kind:"h1",text:"三、我们如何存储您的个人信息"},{kind:"p",text:"1.我们在中华人民共和国境内收集和产生的个人信息将存储在中华人民共和国境内。"},{kind:"p",text:"2.我们将会基于您使用安行天下产品或服务的必要以及在法律法规或监管规定的期限内保存您的个人信息。"},{kind:"p",text:"3.如我们停止运营安行天下的产品或服务，我们将及时停止继续收集您个人信息的活动。同时，对我们存储的个人信息我们将根据法律法规或者监管规定要求进行继续储存、删除或匿名化处理。"},{kind:"p",text:"4.为了保障您的信息安全，我们会在现有技术水平下采取合理必要的措施来保护您的信息，采取物理防护、安全技术、管理制度等措施来降低丢失、误用、非授权访问、披露和更改的风险，包括但不限于数据加密传输、防火墙和加密存储、物理访问控制以及信息访问授权控制。同时，我们也会采用各类必要的去标识化、匿名化处理等手段来保护信息处理过程中的信息安全。若发生个人信息相关的安全事件，我们将启动应急预案及补救措施以最快地阻止事件扩大并最大化减小潜在损失，并依法履行相关报告及通知义务。目前，我们的核心系统已经通过国家网络安全等级保护（三级）测评，符合互联网保险业务开展的相应要求。"},{kind:"h1",text:"四、我们如何使用您的个人信息"},{kind:"p",text:"1.基于收集目的（详见“我们如何收集信息”），向您提供保险产品或服务时。同时，为了向您提供更匹配您个人情况和需求的产品/服务，我们可能会结合您向我们提供并授权处理的个人信息，例如性别、出生日期、所在地、身体健康情况、既往保障情况、风险评估的问题回答和其他相关内容，综合评估您的保障是否充分、有无重复投保等，从而在风险评估基础上，对比、评估不同保险公司的不同保险产品，向您提出保险建议，为您量身拟定投保方案。请您注意，前述字体加粗的信息为您的敏感个人信息，我们会经您明确单独同意后收集该信息，如果您不提供上述信息，我们将不能向您提供相关的功能及服务。"},{kind:"p",text:"2.根据国家相关主管部门的要求向相关部门进行报告。"},{kind:"p",text:"3.在使用我们的产品或服务时，将基于收集目的所收集的信息用于身份验证、保险实名查验、客户服务、安全防范、诈骗监测、存档和备份用途，以确保我们向您提供的产品和服务的安全性。"},{kind:"p",text:"4.基于提升安行天下平台服务体验"},{kind:"p",text:"当您首次进入安行天下平台成功提交信息后，我们可能基于您在投保或预约保险咨询服务过程中已收集验证的手机号码、有效身份证件类型及其号码等实名信息，在您再次访问安行天下平台时以非明文形式同步显示到页面中，方便您后续使用安行天下提供的相关服务。如您不同意使用该快捷显示服务，您可以拨打安行天下客服热线4006-199-588联系我们为您取消。"},{kind:"p",text:"5.采取脱敏、匿名化方式对您的个人信息等进行综合统计、分析或加工等处理，以改善我们现有的产品或服务，帮助我们设计新产品及服务，以为您提供更加个性化、更便捷的服务。"},{kind:"p",text:"6.为了解您如何接入和使用安行天下的产品或服务，从而满足您的个性化需求，我们可能对从安行天下合作方、行政、司法机关处合法收集的经去标识化处理后的您的风险水平类信息，进行数据抽象分析，以为您提供产品推荐、个性化展示、投保交易及智能核保等服务。这类信息对于我们来说无法识别、还原到个人。若您不同意我们向您提供产品推荐、个性化展示、投保交易及智能核保等服务，您可联系我们的客服4006-199-588要求我们停止进行该类个性化服务。取消该等个性化服务会导致您无法看到基于对您信息分析所提供的个性化推荐产品和/或服务，从而影响您的用户体验，但不会影响您使用安行天下平台的基本功能。"},{kind:"p",text:"7.为保证服务得以完成或向您提供您可能需要的服务，我们可能会通过短信或电话等方式向您发送信息，包括但不限于验证码、保单生效通知、续期缴费/续保通知、扣款成功/失败通知、保险合同终止/中止等。"},{kind:"p",text:"8.为了改进我们的产品和服务，我们可能将收集到的您的信息进行数据分析以形成用户画像，用于向您发送营销活动通知、会员客户权益消息、商业性电子信息以及提供与您相关的营销信息。如您不希望继续接收上述信息，可以根据信息中提供的退订方式予以退订或者联系我们的客服4006-199-588要求退订。"},{kind:"p",text:"9.基于我们与相关合作保险公司或保险中介机构联合进行的一些营销宣传活动的需要，我们会将所收集到的您的联系方式进行去标识化处理后，允许我们的合作方通过我们的系统与公司线路以拨打您的电话号码的形式，向您直接宣传营销活动。若您不同意，您可联系我们的客服4006-199-588要求我们停止向您开展该类活动。"},{kind:"p",text:"10.经您授权的其他用途。"},{kind:"h1",text:"五、我们如何提供、委托处理、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）提供"},{kind:"p",text:"我们对您的个人信息严格保密，在特定条件下经您单独同意我们会将您的个人信息提供给第三方主体（以下简称“第三方”），第三方包括我们的合作方、行政司法机关、关联公司以及其他合作伙伴（具体详见本政策附录1《合作机构信息共享清单》）。在将信息提供给第三方前，我们将会充分评估该第三方收集您的个人信息的合法性、正当性和必要性，并按照法律法规及相关要求以包括但不限于点击确认授权文本、具体场景下的点击确认动作等形式征求您的单独同意。我们可能将您的个人信息进行提供的情形如下∶"},{kind:"p",text:"1.向您提供产品或服务：我们为您提供某些服务和（或）产品功能时，可能实质上由我们的合作伙伴提供或由我们与合作伙伴共同提供，只有将您的个人信息提供给第三方时，才能向您提供上述服务。此种情形下，安行天下需要将提供产品/服务所必须的信息提供至第三方。"},{kind:"p",text:"例如，为了协助您完成投保、订立保险合同并持续享受后续服务，我们会将您提供的必要的投保信息（具体详见附录1《合作机构信息共享清单》中所列示的个人信息），根据实际承保的保险公司提供保险合同服务（包括但不限于承保、理赔、提供后续客户服务等）的需要，全部或部分提供给实际承保的保险公司，您可以在产品页面或实际的保单了解实际承保的保险公司的名称，并通过国家金融监督管理总局公开信息查询其资质。实际承保公司将可能会依据其内部客户信息管理原则，在提供保险合同服务或提供持续服务（具体包括：向您提供保险服务，签订或履行相关保险合同、提供保险售后服务与增值服务、进行直接营销、市场调研、数据分析。）所必须的前提下，对您的个人信息进行收集、存储、使用、传输等处理，其中具体处理方式、目的详见附录1《合作机构信息共享清单》。"},{kind:"p",text:"例如，当我们与其他保险中介机构联合为您提供产品/服务时，为协助您完成投保、订立保险合同并持续享受后续服务，我们可能需要将该等产品/服务所必须的信息（具体详见附录1《合作机构信息共享清单》中所列示的个人信息）提供至合作的保险中介机构以及实际承保的保险公司，以确保您能够顺利完成产品/服务的购买并持续性的享受相应的服务。联合提供该等产品/服务的保险中介机构，将可能根据其内部客户信息管理原则，在提供保险合同服务或提供持续服务（具体包括：向您提供保险服务，签订或履行相关保险合同、提供售后服务与增值服务、进行直接营销、市场调研、数据分析。）所必须的前提下，对您的信息进行收集、存储、使用、传输等处理，其中具体处理方式、目的详见附录1《合作机构信息共享清单》。"},{kind:"p",text:"例如，当您享受保险产品中的健康增值服务时，此类增值服务可能由具有国家相关许可资质的第三方机构所提供，在此情形下，我们可能需要将提供健康增值服务所必要的个人信息提供至实际提供服务的机构，具体个人信息提供情况详见附录1《合作机构信息共享清单》。"},{kind:"p",text:"例如，在为您提供保险产品/服务的过程中，我们可能会与合作的保险中介机构协同作业。为保障服务效率与专业性，安行天下可能会将部分保险经纪服务（如保险产品的营销宣传、销售、回访、咨询、协助理赔等）转委托给具备相应资质的保险经纪人、保险代理人等第三方服务机构。我们高度重视您的个人信息安全，除非获得您的明确授权或属于法律允许的必要情形，上述第三方服务机构仅能通过我司提供的虚拟号码与您联系，以保护您的个人信息。非法定或必要情形下（例如按照监管要求进行业务档案保存等），我们不会向上述第三方机构提供您的信息。（具体详见附录1《合作机构信息共享清单》中所列示的个人信息）"},{kind:"b",text:"我们会尽最大努力确保实际承保的保险公司、联合提供产品/服务的保险中介机构以及实际提供产品/服务的第三方以符合相关行业监管要求的标准对您的信息采取保护措施，但我们仍建议您单独、详细了解实际承保的保险公司、联合提供产品/服务的保险中介机构以及实际提供产品/服务的第三方的个人信息保护政策或类似协议约定，具体第三方的信息处理目的和联系方式可参见附录1《合作机构信息共享清单》中的隐私政策。"},{kind:"p",text:"2.我们可能与第三方合作举办营销宣传活动，为了方便您能及时参与具体的营销活动，以及使得我们的合作伙伴能及时与您联系、发放奖品、领取权益，我们可能需要将在相应营销宣传活动过程中产生的、为完成相应营销活动所必要的一些个人信息提供给第三方。为此，我们会依据法律法规及相关要求，在相应营销活动规则页面、电话或通过其他途径向您明确告知安行天下基于何种营销活动需要向第三方共享您个人信息的相关情况，包括第三方的名称、联系方式、我们提供给该第三方的有关您个人信息的种类，以及第三方处理您这些个人信息的目的、方式，并在取得您的单独同意后，才会将您的上述相关个人信息提供至我们合作的第三方。"},{kind:"p",text:"3.个性化服务：为改进我们的服务、优化我们的产品、从而为您提供个性化服务。您在安行天下平台上的登录ID、浏览轨迹、操作方式等信息将会被记录。我们会将上述信息以及您在投保时提供的信息进行脱敏、去标识化、匿名化等加工处理后，提供至安行天下合作机构（保险公司、保险中介机构等）、关联方（如星火智云（上海）科技发展有限公司），用于为您提供营销推荐、信息展示等个性化服务。"},{kind:"p",text:"例如，当我们为您提供投保方案定制服务或会员福利时，我们可能会使用您先前使用我们产品/服务时所提供的信息（姓名、性别、生日、年龄、省份、已购买保险产品的产品名称及保费情况）为您拟定相应投保方案，并可能会委托合作的保险公司或保险中介机构（合称“保险机构”）向您解释投保方案并共同协助您完成投保，享受后续服务。该等场景下，我们合作的保险机构仅可以通过我们提供的虚拟号码联系您，我们仅会出于合法、正当、必要的目的提供您的个人信息，并要求第三方对您的信息采取保护措施并严格遵守法律法规与监管要求。除非您另行授权同意，我们的合作伙伴无权将您的个人信息用于任何其他用途。"},{kind:"b",text:"若您不同意接受此类个性化服务，您可以直接根据电话/短信中的指示取消该等服务，或直接联系我们的客服4006-199-588要求我们停止个性化服务。"},{kind:"p",text:"4.为了遵守法律法规要求、落实监管部门规定、保护良好的金融秩序，或者为防止欺诈等违法活动，而与其他金融相关的公司和组织交换必要的信息。"},{kind:"p",text:"5.根据法律法规的规定、有权机关的要求，或是为了依法维护我们的合法权益，或是经您明示同意的。"},{kind:"p",text:"6.如我们向任何上述第三方提供您的个人信息，我们将努力确保该等第三方在使用您的个人信息时遵守本协议及我们要求其遵守的其他适当的保密和安全措施。"},{kind:"h2",text:"（二）委托处理"},{kind:"p",text:"为了提升信息处理的质量与效率，我们可能会在法律法规允许的范围内，委托有能力的合作机构代表我们来处理信息。具体场景如下："},{kind:"p",text:"1.为实现身份信息、账户信息真实性认证以及履行反欺诈等法定义务。根据法律法规及监管要求，为您提供保险服务时，我们需要依法对投保人、被保险人、受益人身份信息（如姓名、身份证件类型、证件号码、证件有效期等信息）、账户信息、保险标的信息（如车辆信息）提供至法律法规规定的保险实名查验登记系统或合法第三方信息认证机构，用于验证投保人、被保险人、受益人身份信息真实性、保险标的真实性、投保人账户信息真实性等。"},{kind:"p",text:"2.账户安全管理"},{kind:"p",text:"为防范和打击网络黑灰产，保障微信账户登录下的安行天下平台账户安全，我们会将您的登录ID等信息进行脱敏、去标识化、匿名化加工处理后提供至行政机关、司法机关、安行天下合作机构、关联方（如星火智云（上海）科技发展有限公司等），由行政机关、司法机关、合作机构、关联方协助安行天下识别账户安全状态，包括账户安全等级、风险状况评估等。"},{kind:"p",text:"3.为提供相应的客户服务及提升服务体验"},{kind:"p",text:"（1）我们可能会委托第三方广告商、电信运营商、分析服务提供商等具有大数据建模与处理能力（包括但不限于查询、核实、采集、整理、保存、加工）的授权合作伙伴处理您的信息，并将查询处理结果反馈给我司，以用于汇聚分析、提供广告曝光检测或服务决策，为您提供更好的服务。"},{kind:"p",text:"我们委托这些合作伙伴处理的是统计类信息、去标识化或匿名化后的信息或者其他不会识别到您个人身份的信息。我们会不时对该等合作伙伴进行监督或审计，以最大限度地确保其依法、依规、依约收集和使用数据。具体第三方的信息处理目的和方式可参见附录3《委托处理清单》。"},{kind:"p",text:"（2）为提供客户服务以及在取得您的营销授权后开展合法营销的目的，我们也可能会委托合作的短信、语音等服务供应商及运营商向您发送营销信息或拨打营销活动电话。如您拒绝接收此类营销信息，您可以通过联系在线客服、拨打400-619-9588客服热线或接收营销类短信时回复退订指令等方式拒绝后续接收该类营销信息。"},{kind:"p",text:"我们郑重承诺，我们会遵守法律法规关于委托处理的相关规定，充分审查、评估此类合作机构保护个人信息的能力，通过书面协议、审计等方式要求合作机构严格遵守保密义务，采取技术方式对委托处理的信息进行脱敏处理，并禁止其将这些信息用于未经您授权的用途。在委托关系解除时，我们会要求合作机构不再保存相关信息。"},{kind:"h2",text:"（三）转让"},{kind:"p",text:"我们不会主动将您的个人信息转让至第三方，但以下情形除外∶"},{kind:"p",text:"1.该转让已经征得您的单独同意;"},{kind:"p",text:"2.根据法律法规的规定、有权机关的要求需要转让您的个人信息的。"},{kind:"p",text:"另外，为完成合并、分立、收购或资产转让而将您的信息转移或披露给任何非关联权利承接的第三方时，我们会按照法律法规及不低于本政策所规定的标准继续保护或要求该等第三方继续保护您的个人信息。如转让后变更个人信息使用目的时，我们将要求该等第三方重新取得您的明确同意。"},{kind:"h2",text:"（四）公开披露"},{kind:"p",text:"我们不会对外公开披露您的个人信息;如必须公开披露时，我们会向您告知公开披露的目的、披露信息的类型及可能涉及的敏感信息，并征得您的单独同意。"},{kind:"h1",text:"六、征得授权同意的例外"},{kind:"p",text:"根据相关法律法规及国家标准，在以下情形中，我们可能会依法收集、使用或提供、转让、公开披露您的个人信息，且无需征得您的同意∶"},{kind:"p",text:"1.为订立、履行个人作为一方当事人的合同所必需，或者按照依法制定的劳动规章制度和依法签订的集体合同实施人力资源管理所必需；"},{kind:"p",text:"2.为履行法定职责或者法定义务所必需；"},{kind:"p",text:"3.为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"p",text:"4.为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理个人信息；"},{kind:"p",text:"5.依照《个人信息保护法》规定在合理的范围内处理个人自行公开或者其他已经合法公开的个人信息；"},{kind:"p",text:"6.法律、行政法规规定的其他情形。"},{kind:"h1",text:"七、您如何行使您的个人信息权利"},{kind:"b",text:"您明确知晓并同意，在符合法定的情形下，您对个人信息拥有合法的查阅、复制、更正、补充、删除、撤回同意等权利。与此同时，您行使上述权利不得与安行天下需要遵循的法定义务相违背，也不应超出下列合法需求范围。"},{kind:"h2",text:"（一）查阅、复制您的个人信息"},{kind:"p",text:"您有权随时访问、查询、复制我们平台上您的头像、联系人、地址、保单、理赔进度等个人信息，但法律法规规定的例外情况除外。您可以联系客服4006-199-588行使上述权利。"},{kind:"h2",text:"（二）更正、补充您的个人信息"},{kind:"p",text:"当您发现我们处理的关于您的个人信息有错误时，您有权要求我们作出更正、补充。我们将对其您的个人信息予以核实，并及时更正、补充。您可以联系客服4006-199-588行使上述权利。"},{kind:"h2",text:"（三）删除您的个人信息"},{kind:"p",text:"在以下情形中，我们会主动删除您的个人信息，您也可以向我们提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理您个人信息的目的已实现、无法实现或者为实现处理目的不再必要；"},{kind:"p",text:"2.如果您撤回您的同意；"},{kind:"p",text:"3.如果我们违反法律、行政法规或者违反约定处理您的个人信息；"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了账户；"},{kind:"p",text:"5.如果我们不再为您提供产品或服务，或者保存期限已届满。"},{kind:"p",text:"若法律、行政法规规定的保存期限未届满，或者删除个人信息从技术上难以实现的，我们会停止除存储和采取必要的安全保护措施之外的处理。您可联系客服4006-199-588要求删除已在安行天下注册登记的实名信息。当您删除实名信息后，安行天下将不再向您展示您在安行天下的投保记录、生效中的保单信息。为了保障您的合法权益，建议您谨慎操作。如您删除实名信息后仍需查询投保记录或生效中的保单，请您与我们的客服联系，我们会在核对完您的身份信息后为您提供查询服务。"},{kind:"h2",text:"（四）改变您的授权同意范围或撤销授权"},{kind:"p",text:"您有权决定我们是否对您的个人信息进行采集、存储等授权，您可以通过联系客服4006-199-588，撤销同意《安行天下个人信息保护政策》中涉及到的授权内容。撤销后，安行天下将不再处理您的个人信息（如您已就具体产品或服务与安行天下另行签署授权的除外）。撤销授权后，您可以以访客身份继续浏览安行天下提供的产品或服务，但您撤销授权的，不会影响安行天下此前基于您授权已经开展的个人信息处理活动。"},{kind:"p",text:"如您还有其他关于个人信息主体权利的疑问，请您随时与安行天下客服取得联系，我们会尽快协助您解决。"},{kind:"h2",text:"（五）注销您的账户"},{kind:"p",text:"您随时可联系客服4006-199-588要求注销此前注册的账户，在注销账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（六）个人信息处理规则的解释说明"},{kind:"p",text:"您可以随时联系客服4006-199-588要求安行天下对我们的个人信息处理规则进行解释说明。"},{kind:"h2",text:"（七）逝者相关权利"},{kind:"p",text:"若您身故，您的近亲属为了自身的合法、正当利益，可以联系客服4006-199-588对您的相关个人信息行使本条款规定的查阅、复制、更正、删除等相关权利；您生前另有安排的除外。"},{kind:"h2",text:"（八）响应您的上述请求"},{kind:"p",text:"为保障安全，您可能需要提供书面请求，或以其他方式证明您的身份。我们可能会先要求您验证自己的身份，然后再处理您的请求。"},{kind:"p",text:"对于您合理的请求，我们原则上不收取费用，但对多次重复、超出合理限度的请求，我们将视情况收取一定成本费用。对于无端重复、需要过多技术手段（例如，需要开发新系统或从根本上改变现行惯例）、给他人合法权益带来风险或者非常不切实际的请求，我们可能会予以拒绝，但会向您说明理由。"},{kind:"p",text:"此外，在以下情形中，我们可能无法响应您的请求，但会向您说明理由："},{kind:"p",text:"1.与我们履行法律法规规定的义务相关的；"},{kind:"p",text:"2.与国家安全、国防安全有关的；"},{kind:"p",text:"3.与公共安全、公共卫生、重大公共利益有关的；"},{kind:"p",text:"4.与犯罪侦查、起诉、审判和执行判决等有关的；"},{kind:"p",text:"5.有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"p",text:"6.出于维护您或其他个人的生命、财产等重大合法权益但又很难得到本人同意的；"},{kind:"p",text:"7.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；"},{kind:"p",text:"8.涉及商业秘密的。"},{kind:"h1",text:"八、我们如何保护未成年人的个人信息权益"},{kind:"p",text:"我们非常重视对未成年人信息的保护。您理解并同意，我们仅向实名登记且具有法律规定的完全民事权利能力和民事行为能力、能够独立承担民事责任的成年人提供安行天下产品和服务。如果您是18周岁以下的未成年人，我们将不会对您提供服务(但在未提供相应服务情况下进行的有限浏览情形除外)。"},{kind:"p",text:"平台涉及的某些特定产品和/或服务可能会涉及收集未成年人的个人信息。我们承诺，我们将根据国家相关法律法规及本政策的规定确保未成年人个人信息的保密性及安全性。如果我们发现自己在未事先获得可证实的父母或法定监护人同意的情况下收集了未成年人的个人信息，我们会采取必要措施主动及时地删除相关信息。"},{kind:"p",text:"若您是未成年人的监护人，当您注意到您所监护的未成年人存在使用平台上的产品和/或服务或自行向我们提供的个人信息的情况时，请您及时与我们联系。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的个人信息保护政策可能变更。未经您明确同意，我们不会削减您按照本政策所应享有的权利。我们会在官网以及相关页面上及时更新本政策。对于重大变更，我们还会以更为显著的方式，如弹窗等方式通知您，以便您能及时了解本政策的变更。"},{kind:"p",text:"本政策所指的重大变更包括但不限于："},{kind:"p",text:"1.我们的服务模式发生重大变化。如处理个人信息的目的、处理个人信息的类型、个人信息的使用方式等；"},{kind:"p",text:"2.我们在控制权等方面发生重大变化。如并购重组等；"},{kind:"p",text:"3.个人信息共享、转让或公开披露的主要对象发生变化；"},{kind:"p",text:"4.您参与个人信息处理方面的权利及其行使方式发生重大变化；"},{kind:"p",text:"5.我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化；"},{kind:"p",text:"若您在本政策修订后继续使用安行天下提供的产品或服务，即视为您已充分阅读、理解并愿意接受修订后的政策约束，如果您不接受修改后的政策内容，您有权停止使用安行天下提供的产品或服务。"},{kind:"h1",text:"十、如何联系我们"},{kind:"b",text:"我们设立了专职个人信息保护负责人和个人信息保护工作机构，个人信息保护负责人的联系方式为data-security@axinsur.com.如您在使用安行天下服务时就您的个人信息的收集、使用、共享、保存等事宜有任何困惑，或您对本政策有任何意见或建议，甚至因本政策产生任何争议的，可通过上述邮箱地址或客服专线：4006-199-588联系我们，我们将在收到您的请求或者投诉的15日内，进行受理、核查及处理。"},{kind:"b",text:"为保障我们高效处理您的问题并及时向您反馈，部分情况下我们可能会要求您提交身份证明、有效联系方式和书面请求及相关证据，我们会在验证您的身份后处理您的请求。"},{kind:"b",text:"如果您对我们的回复不满意，特别是您认为我们的个人信息处理行为损害了您的合法权益，您还可以通过以下外部途径寻求解决方案：向上海市浦东新区人民法院提起诉讼，您也可向有关政府部门或者行业协会进行反映。"},{kind:"h1",text:"十一、本政策中关键词说明"},{kind:"p",text:"本政策中的“敏感个人信息”是指：一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。"},{kind:"b",text:"附录1：合作机构信息共享清单"},{kind:"table",rows:[["序号","第三方接受主体名称","信息处理目的","信息处理方式","涉及的个人信息","隐私政策链接地址/客服热线"],["1","泰康在线财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","http://www.tk.cn"],["2","中国平安财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除",`投保人姓名、被保人姓名、证件号码、手机号码\n投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）`,"https://property.pingan.com/"],["3","众安在线财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.zhongan.com"],["4","招商信诺人寿保险有限公司","投保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）、营业执照、身份证、投保单盖章件、财产原值、财产照片、财产标的地址、工程合同、法人身份证复印件、公司信息","https://www.cignacmb.com"],["5","太平人寿保险有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://ife.cntaiping.com"],["6","永诚财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.alltrust.com.cn"],["7","太平财产保险有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://caixian.cntaiping.com"],["8","中国太平洋财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://property.cpic.com.cn"],["9","平安健康保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://health.pingan.com"],["10","阳光财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.4000-000-000.com"],["11","国泰财产保险有限责任公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.cathay-ins.com.cn"],["12","中国人寿财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.chinalife-p.com.cn"],["13","融盛财产保险股份有限公司","承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.erongsheng.com"],["14","中国人民人寿保险股份有限公司","保险咨询、承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.picclife.com/picclifewebsite/webfile//yszc/index.html"],["15","幸福人寿保险股份有限公司","保险咨询、承保","收集、存储、使用、传输、加工、删除","投保人姓名、投保人身份证号码、投保人手机号、投保人护照号、投保人港澳通行证号码、投保人军官证号码、投保人台胞证号码、投保人性别、投保人生日、投保人户口本号码（身份证号码）、被保人姓名、被保人身份证号码、被保人手机号、被保人护照号、被保人港澳通行证号码、被保人军官证号码、被保人台胞证号码、被保人性别、被保人生日、被保人户口本号码（身份证号码）、投被保人关系、被保人社保参保状态、职业、地址、邮编、投保人身份证影像（正反面）","https://www.happyinsurance.com.cn/other/single_189_184.html"],["16","黑龙江鹤芝灵生物科技有限公司","领取健康服务礼包","收集、存储、使用、传输、加工、删除","姓名、手机号、地域、地址",""],["17","青岛海尔保险代理有限公司","互联网保险业务转委托","收集、存储、使用、传输、删除（仅限于依据监管要求的业务存档及双方业务结算）","投保人姓名、投保人证件类型、投保人证件号码、投保人性别、投保人出生日期、投保人手机号、被保人姓名、被保人证件类型、被保人证件号码、被保人性别、被保人出生日期、被保人手机号、被保人与投保人关系","https://h5.haierbx.net/home/aggrement/2"]]},{kind:"b",text:"附录2：第三方SDK服务列表"},{kind:"b",text:"WEB类SDK"},{kind:"table",rows:[["序号","SDK类型","功能类型","第三方名称","使用目的","使用场景","个人信息类型","第三方隐私政策或官网链接"],["1","Web","埋点SDK","星火智云（上海）科技发展有限公司","收集用户在系统上的行为数据，分析用户行为习惯改善用户体验","用户访问投放页面","用户行为数据、浏览器信息UA、客户端信息、用户手机号","https://www.axinsur.com/"],["2","Web","广告SDK","星火智云（上海）科技发展有限公司","广告素材曝光、数据采集，评估广告效果，改善用户体验","部分手机广告位页面，比如投保成功页，用户左划弹框","用户在系统中的id、手机号（登录状态下）","https://www.axinsur.com/"],["3","Web","众安可回溯SDK","众安信息技术服务有限公司","收集用户在投保页面的行为数据，满足监管要求","投保页面","用户行为数据","https://zhongan.io/"],["4","Web","一键登录","中国移动通信集团有限公司、中国移动通信集团上海有限公司","手机号一键登录、减少用户操作","部分投保页面","用户手机号、用户网络环境","https://dev.10086.cn/docInside?contentId=11039014795609"],["5","Web","微信 JS SDK","深圳市腾讯计算机系统有限公司","微信分享、静默授权、小程序","微信环境下","无信息收集场景","https://open.weixin.qq.com/"],["6","Web","闪验","深圳市和讯华谷信息技术有限公司","快速验证手机号","部分投保页面","用户手机号、用户网络环境","https://www.jiguang.cn/"],["7","Web","阿里云ARMS监控","阿里巴巴集团控股有限公司","监控页面性能指标","所有页面","用户信息:用户标识(默认随机生成字符串作为用户标识,用户可通过配置自定义标识替换)应用信息:应用ID设备信息:包括:设备ID、设备型号、品牌信息、操作系统及系统版本号、宿主应用、屏幕分辨率网络状态信息:包括:IP地址、网络制式、运营商信息","https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20240614153247459/20240614153247459.html"],["8","Web","在线客服","杭州网易智企科技有限公司","在线客服","部分投保页面","唯一设备识别码(APNSToken)最终用户的语音信息最终用户的图片和视频信息设备信息:设备品牌及型号、设备所运行系统版本、名称、编辑版本信息;日志信息:浏览器类型及版本信息、网络连接类型及状态、通信服务运行日志信息网络信息:网络状态、wifi信息,IP地址IOS应用的BundleID及/或您开发的Android应用的应用包名距离传感器信息","https://b.163.com/home/privacypolicy/privacy-ys-intelligent"],["9","Web","H5掩码一键登录","深圳市和讯华谷信息技术有限公司","在手机H5页面中，一键点击完成登录/注册","部分投保页面","用户手机号、用户网络环境","https://www.jiguang.cn/"]]},{kind:"b",text:"APP类SDK"},{kind:"table",rows:[["序号","SDK类型","SDK名称","包含信息","使用目的","使用权限","个人信息类型","第三方隐私政策或官网链接"],["1","APP","微信开放平台","com.tencent.mm","登录、分享、支付","android.permission.ACCESS_NETWORK_STATEandroid.permission.ACCESS_WIFI_STATE","存储的个人文件、网络信息","https://weixin.qq.com/cgi-bin/readtemplate?lang=zh_CN&t=weixin_agreement&s=privacy"],["2","APP","新浪开放平台","com.sina.weibo","登录、分享","android.permission.ACCESS_NETWORK_STATEandroid.permission.ACCESS_WIFI_STATE","存储的个人文件、网络信息","https://weibo.com/signup/v5/privacy?spm=a1zaa.8161610.0.0.4f8776217Wu8R1"],["3","APP","QQ开放平台","com.tencent.open","登录、分享","android.permission.MODIFY_AUDIO_SETTINGSandroid.permission.ACCESS_NETWORK_STATEandroid.permission.ACCESS_WIFI_STATE","存储的个人文件、读取手机状态和身份、网络信息","https://wiki.connect.qq.com/qq%e4%ba%92%e8%81%94sdk%e9%9a%90%e7%a7%81%e4%bf%9d%e6%8a%a4%e5%a3%b0%e6%98%8e"],["4","APP","支付宝开放平台","com.alipay","登录、分享","android.permission.ACCESS_NETWORK_STATEandroid.permission.ACCESS_WIFI_STATE","网络信息","https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000132"],["5","APP","个验一键登录","com.g.elogin、com.g.gysdk","登录","android.permission.READ_PHONE_STATEandroid.permission.READ_EXTERNAL_STORAGEandroid.permission.WRITE_EXTERNAL_STORAGEandroid.permission.ACCESS_NETWORK_STATEandroid.permission.ACCESS_WIFI_STATEandroid.permission.CHANGE_NETWORK_STATE","存储的个人文件、读取手机状态和身份、网络信息","https://docs.getui.com/privacy/"],["6","APP","阿里weexSDK","com.taobao","uni-app基础模块默认集成，用于渲染uniapp的nvue页面引擎","android.permission.WRITE_EXTERNAL_STORAGEandroid.permission.READ_EXTERNAL_STORAG","存储的个人文件","https://weexapp.com/zh/"],["7","APP","Fresco图库","com.facebook.fresco","用于nvue页面加载图片使用","android.permission.WRITE_EXTERNAL_STORAGEandroid.permission.READ_EXTERNAL_STORAG","存储的个人文件","https://www.fresco-cn.org/"],["8","APP","glide图库","com.bumptech.glide","用于图片预览使用","android.permission.WRITE_EXTERNAL_STORAGEandroid.permission.READ_EXTERNAL_STORAG","存储的个人文件","http://bumptech.github.io/glide/"],["9","APP","gif-drawable","pl.droidsonroids.gif","加载gif图","android.permission.WRITE_EXTERNAL_STORAGEandroid.permission.READ_EXTERNAL_STORAG","存储文件","https://github.com/koral--/android-gif-drawable"],["10","APP","移动安全联盟 OAID","com.bun.miitmdid、com.zui.opendeviceidlibrary、com.netease.nis、com.samsung.android、com.huawei.hms","获取oaid","无","设备信息","http://www.msa-alliance.cn/col.jsp?id=122"],["11","APP","uni-app(5+、web2app)","io.dcloud","基础模块","android.permission.INTERNETandroid.permission.ACCESS_NETWORK_STATEandroid.permission.WRITE_EXTERNAL_STORAGEandroid.permission.READ_EXTERNAL_STORAGandroid.permission.READ_PHONE_STATE","存储的个人文件，设备信息（IMEI、ANDROID_ID、DEVICE_ID、IMSI），网络信息","https://ask.dcloud.net.cn/protocol.html"],["12","APP","Messaging","io.dcloud.feature.messagings","管理设备通讯功能，可用于短信、彩信、邮件发送等","android.permission.SEND_SMS","读写短信、彩信、邮件",""]]},{kind:"b",text:"附录3：委托处理清单"},{kind:"table",rows:[["序号","委托处理机构名称","委托处理目的","委托处理方式","涉及的个人信息","备注","第三方隐私政策或官网链接"],["1","上海数因网络科技有限公司","基于提升服务的目的，了解用户消费及银行卡使用偏好（不涉及任何具体消费校验明细或相关账户查询等敏感数据）","查询、核实、采集、整理、保存、加工","手机号码、身份证号码","处理中部分工作将由中国银联股份有限公司、银联智策顾问(上海)有限公司、银联商务支付股份有限公司完成",""],["","","基于提升服务目的，对用户身份进行有效性核验及信息便捷填写","采集、查询、核验、加工、保存","姓名、手机号码、身份证号码","处理中部分工作将由银联商务支付股份有限公司、中移互联网有限公司、中国移动通信集团有限公司完成",""],["2","中国银联股份有限公司、银联智策顾问（上海）有限公司、银联商务支付股份有限公司","基于提升服务的目的，了解用户消费及银行卡使用偏好（不涉及任何具体消费校验明细或相关账户查询等敏感数据）","查询、核实、采集、整理、保存、加工","手机号码、身份证号码","通过与上海数因网络科技有限公司合作产生间接委托处理关系",""],["3","银联商务支付股份有限公司、中移互联网有限公司、中国移动通信集团有限公司","基于提升服务目的，对用户身份进行有效性核验及信息便捷填写","采集、查询、核验、加工、保存","姓名、手机号码、身份证号码","通过与上海数因网络科技有限公司合作产生间接委托处理关系",""]]}]},or={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年6月3日"},{kind:"p",text:"生效时间：2026年6月3日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一. 我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"h2",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"p",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息展示的服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、手机号、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，我们会从您的可信数据空间中获取您的【姓名、手机号、身份证号码前十四位】信息并提供给银联商务支付股份有限公司及相关使用方，并使用该信息为您完成H5场景下展示的服务。为保障您的数据安全，在向银联商务支付股份有限公司及相关使用方提供您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"h2",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"h2",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"h2",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"h2",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"h2",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给银联商务支付股份有限公司及相关使用方，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"p",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"p",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"h2",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"h1",text:"七、我们如何处理未成年人的个人信息"},{kind:"h2",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"h2",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"h2",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},ar={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[[{kind:"text",text:"合作方",colSpan:7}],["合作方名称","共享目的","共享场景","个人信息","提供方式","隐私政策或官网","联系方式"],["东方大地（武汉）保险经纪有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口",{kind:"doc-link",text:"《隐私政策》",docKey:"dongfangdadi-v2-privacy-policy"},"doc@dfdadi.com"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口",{kind:"doc-link",text:"《中国移动认证梧桐数盾隐私政策》",docKey:"dongfangdadi-v2-cmcc-privacy-policy"},"10086"]]}]},sr={title:"《隐私政策》",blocks:[{kind:"h1",text:"隐私政策"},{kind:"p",text:"【更新日期】2026年8月12日"},{kind:"p",text:"【生效日期】2026年8月12日"},{kind:"p",text:"【特别提示】尊敬的用户：感谢您的信任，为了帮助您了解我们对个人信息的处理和保护规则，我们特制定“隐私政策”。请您仔细阅读本隐私政策尤其是粗体显示的内容。如您有任何疑问、意见或建议，您可通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"本隐私政策适用于东方大地（武汉）保险经纪有限公司及其关联公司（统称“我们”）通过官方网站、基于Android（安卓）系统和iOS系统开发的应用程序（APP）、及相关小程序、公众号、H5页面、网页以及随技术发展出现的新形态向您提供的产品和服务。为了更好地为您提供贴心的服务，您在使用我们的产品或服务时，我们可能会收集和使用您的相关信息。我们非常重视用户的隐私和个人信息保护，我们希望通过本隐私政策向您说明我们在您使用我们的产品或服务时如何收集、使用、保存、共享、转让和保护这些信息，以及我们为您提供的管理这些信息的方式。"},{kind:"p",text:"在本隐私政策中，个人信息，是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。敏感个人信息，是指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。我们将在本隐私政策中对个人信息以粗体进行显著标识。"},{kind:"p",text:"我们在此特别提醒您：我们致力于打造多样的产品和服务以满足您的需求。因我们向您提供的产品和服务种类众多，且不同用户选择使用的具体产品/服务范围存在差异，故收集使用的个人信息类型、范围会有所区别，请以具体的产品/服务功能为准。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一、 我们收集了哪些个人信息"},{kind:"h1",text:"二、 我们如何使用您的个人信息"},{kind:"h1",text:"三、 征得授权同意的例外"},{kind:"h1",text:"四、 我们如何存储您的个人信息"},{kind:"h1",text:"五、 我们如何共享、委托、转让、公开披露您的个人信息"},{kind:"h1",text:"六、 我们如何保护您的个人信息"},{kind:"h1",text:"七、 您管理个人信息的权利"},{kind:"h1",text:"八、 未成年人个人信息保护"},{kind:"h1",text:"九、 隐私政策的适用范围、变更和修订"},{kind:"h1",text:"十、 如何联系我们"},{kind:"h1",text:"一、我们收集了哪些个人信息"},{kind:"p",text:"在您使用我们服务过程中，我们将按照如下方式收集您在使用服务时主动提供或因您使用服务而产生的信息，用以向您提供下述服务、优化我们的服务并保障您的账号安全。由于我们产品和服务的形态较多，具体的服务类型和可能处理的个人信息以您使用的产品界面展示为准。"},{kind:"h2",text:"（一）为您提供保险服务基本功能相关的个人信息"},{kind:"p",text:"1. 投保"},{kind:"p",text:"当您购买保险产品投保时，我们将收集您的投保信息，以便帮助您与保险公司签订保险单，完成投保，这些信息包括投保人的姓名、身份证件信息、手机号码、社保状态（有无）、住址、邮箱，被保险人的姓名、性别、与投保人关系、身份证件号码、联系方式、健康状况、职业，受益人的姓名、受益比例，保险订单信息及其他投保所需的必要信息（以您在投保时相关产品界面所要求提供的信息字段为准）。除上述基本信息，我们还可能获取您的保险标的相关信息，例如您通过我们购买机动车保险时，我们需要您提供车辆行驶证信息、车牌号、车架号、投保地区及其它必要信息。根据法律法规及监管规定，我们将完整记录和保存投保的主要业务过程，包括在您拨打或接听保险客服顾问电话时，我们将会对电话通话过程全程录音，或者按照监管要求对投保过程进行同步录音录像或投保轨迹记录和保存。"},{kind:"p",text:"您可以通过我们为其他人投保保险产品，您向我们提供该实际被保险人的前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法为您订购保险产品并办理投保手续，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"2. 保险理赔"},{kind:"p",text:"当您通过我们申请理赔时，基于法律法规等要求，我们可能收集您申请理赔时所需的相关信息，包括被保险人或者受益人的姓名或者名称、联系方式、有效身份证件信息、出险描述、所在医院、职业、银行卡信息、诊断证明、病历信息、就诊费用信息、保险标的信息、在线沟通记录和电话记录及必要的风险信息。在报案人并非被保险人的情况下，我们还将收集报案人姓名、电话、投保信息、与被保险人的关系、在线沟通记录和电话记录，您向我们提供该实际被保险人的前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法协助您向保险公司申请保险理赔，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"3. 保险合同变更、退保"},{kind:"p",text:"当您通过我们进行保险合同变更、退保时，我们还将收集您主动提供或上传的信息，包括保单号、投保人电话、被保人的姓名、身份证号码、身份证照片、保全申请事由信息、退保申请事由信息、银行账户信息。在涉及您的父母、配偶或子女的情况下，我们会向您收集您的父母、配偶、或子女的相应上述个人信息。您向我们提供前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法向您提供合同变更、退保等服务，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"根据法律法规及监管规定，当您通过我们投保成功，或使用我们提供的协助理赔、协助保全、协助退保、保单查询功能时，由于保险单实际是由为您承保的保险公司提供，因此我们需要从为您承保的保险公司获取您的保险单信息，以便为您提供上述服务。"},{kind:"p",text:"4. 资格核验、风险控制及适当性管理"},{kind:"p",text:"在向您提供各项保险服务过程中，我们可能会向第三方核验调查您是否具备相应的资格或符合法定的条件。在这种情况下，我们可能会收集您留存在我们关联公司、与我们合作的保险公司处的个人信息，我们还可能向行政机关、司法机关、征信机构、医疗机构、保险公估公司、健康服务机构、背景调查公司、信息技术服务机构、电信运营商（或其授权的服务商）以及其他合法了解掌握相关信息的自然人和法人收集或查询相关信息。您同意我们向上述机构收集、查询、使用您的身份、医疗、财产、信用、风险水平、健康状况相关信息以核验您的身份信息的真实性以及是否具有相应的资格或符合法定的条件，防范欺诈等违法活动和减少信用风险。"},{kind:"p",text:"基于账户安全管理、风险控制、防范保险欺诈、消费者适当性管理等原因，我们可能从行政机关、司法机关及我们的合作机构、关联公司等第三方获取去标识化处理后的风险水平类、账户安全类、风控类信息，用于提供风险控制、保险反欺诈、反黑灰产、产品推荐、投保交易风控、智能协助理赔等服务，保障您的账户安全、信息安全及满足法律法规要求。"},{kind:"p",text:"5. 依据法律法规及监管规定履行法定义务"},{kind:"p",text:"根据互联网及金融监管等要求，我们需履行法定义务，如：保险交易可回溯管理义务、实名制管理义务、反洗钱反恐怖融资义务（客户身份识别、客户身份资料和交易记录保存、尽职调查、严格保密等）等。这些法定义务要求我们向您收集您的个人身份信息、电话录音、录音录像、投保轨迹等，其中“身份信息”包括您的姓名、性别、国籍、职业、住所地（或经常居住地）或者工作单位地址、联系方式、身份证件或者身份证明文件的种类、号码和有效期限。“投保轨迹”包括相关交易信息、保单信息、账户信息。如您拒绝提供上述信息，则可能无法使用与监管要求相关的部分服务，但不影响您使用我们提供的其他服务。您知晓并同意，根据您所需的保险产品和服务的不同以及监管机构的要求，我们所收集的信息类型以具体产品或服务申请页面为准。"},{kind:"h2",text:"（二）与改善和优化服务及保障账号安全相关的个人信息"},{kind:"p",text:"为了保障用户的账号安全、交易安全、系统运行安全，满足法律法规和我们协议规则的相关要求，以及不断地改进我们的产品，在您使用我们的产品和服务时，我们需要收集相关的设备信息与日志信息。设备信息包括与您使用设备的软硬件特征和设备环境信息相关的信息，例如IMEI、Android ID、OAID、IDFA、IMSI、网络设备地址（MAC）、BSSID、iccid、设备型号、设备名称、系统版本号、任务列表、设备应用安装列表、手机制造商、运营商名称；日志信息包括IP地址、访问的浏览器信息、点击和浏览我们产品和服务功能或页面的URL地址及其使用情况与频率、应用崩溃情况、总体安装使用情况、性能数据、应用来源。如果您需要使用微信分享功能，我们将使用您的剪切板信息，以确保功能正常使用。"},{kind:"h2",text:"（三）与信息推送、搜索和展示有关的个人信息"},{kind:"p",text:"我们可能收集和使用包括IMEI、Android ID、OAID、IDFA、网络设备地址（MAC）、IMSI、BSSID、MEID、设备型号、设备名称、系统版本号、设备应用安装列表、手机制造商在内的与您使用设备的软硬件特征和设备环境信息相关的信息，用于向您推送信息和内容，该等信息展示与推送可能使用第三方服务。您有权按照本隐私政策第七节“您管理个人信息的权利”指引的撤回同意的方式关闭该等信息推送，在您关闭后，您的设备将不再收到我们的推送信息，关闭信息推送不会影响您使用其他服务。"},{kind:"p",text:"当您使用搜索功能时，我们会自动收集您输入的关键字信息和搜索记录。如果您拒绝提供上述信息，您无法享受搜索服务，但不影响您使用我们提供的其他功能。"},{kind:"h2",text:"（四）为您提供客服和售后服务有关的个人信息"},{kind:"p",text:"在您使用我们产品或服务的过程中，如果您有任何疑问、意见或建议，您可以通过在线客服、发送邮件或拨打电话与我们取得联系，我们将可能收集您的账号信息、电话录音、在线沟通记录、您与客服人员的对话信息（其中可能包括您主动提供的个人信息）。如果您参与问卷调查，我们还将收集您在问卷中向我们提供的信息。为了保证服务体验、改善服务品质，您与客服的通话信息可能会被录音。当您在保险服务过程中出现服务投诉或纠纷时，我们可依法调取并使用录音信息作为解决纠纷的参考依据。"},{kind:"p",text:"当您需要我们提供与保单相关的客户服务时，我们可能会查询您的相关交易信息以便向您提供适当的服务。当您需要客服协助您修改有关信息（如地址、联系方式等）时，您可能还需要提供相应的信息以完成修改。您知悉并同意，如果我们的客服人员无法立刻解决您的问题，我们可能在核实情况后，通过您主动提供的联系方式与您取得联系、解答您的问题、回应您的诉求。"},{kind:"h2",text:"（五）支付订单的个人信息"},{kind:"p",text:"您通过我们支付订单时，可以选择我们合作的银行和第三方支付机构（如支付宝、微信支付等合作方）所提供的服务进行支付。我们需要收集您的订单信息、对账信息及其他法律要求的必要信息并与这些合作机构共享，以确认您的支付指令并帮助您完成支付。同时，为了帮助您实现基于银行卡支付的功能，您授权并同意，我们收集您的姓名、身份证号、银行卡号、银行卡预留手机号、发卡行、卡类型等银行卡信息，以便于将您的银行卡与您的账户进行绑定。我们会将该等信息通过我们的第三方合作支付机构向发卡银行进行验证。在您使用支付服务时，我们还需要记录、收集您的交易信息。您授权我们在向您提供支付服务时可以向必要的第三方合作支付机构提供前述支付必要信息，以确认您的支付指令并帮助您完成支付。"},{kind:"h2",text:"（六）扩展业务、增值服务相关的个人信息"},{kind:"p",text:"我们可能会提供保险产品或服务相关扩展业务、增值服务，具体包括以下内容："},{kind:"p",text:"1. 选择保险方案"},{kind:"p",text:"为向您提供“免费领取保险方案”功能，您需要向我们提供您的年龄、投保金额、您的姓名、您的电话，以根据您提供的信息测算适合您的保险方案，并向您发送测算结果。如果您拒绝提供这些信息，我们无法为您提供“免费领取保险方案”功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"为向您提供“保险定制”功能，您需要向我们提供您的手机号、年龄、个人月收入区间、家庭成员、家庭年收入。如果您拒绝提供这些信息，我们无法为您提供“保险定制”功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"2. 保费计算"},{kind:"p",text:"在您投保过程中，为方便您计算保费，您需要向我们提供您的生日、投保份数、保障期限、交费方式、性别。如果您拒绝提供这些信息，我们无法为您提供保费计算功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"3. 邮寄纸质保单或发送电子保单"},{kind:"p",text:"如果您选择由我们为您提供邮寄纸质保单服务，您需要提供收件人的姓名、手机号码、收货地址及您需要备注的其他信息，以便于您的保单能够安全准确送达并完成。如收件人不是您本人，请您知悉收件人可能接收到包括保单在内的上述信息，并确认收件人已经获得了接收这些信息的授权同意。同时，您已就向我们提供收件人的相关信息取得收件人的授权同意。如果您选择由我们向您发送电子保单，需要您提供接受电子保单的邮箱地址。如果您拒绝提供收件人信息或邮箱地址，我们无法向您发送保单，但不影响您使用我们提供的其他功能。"},{kind:"h2",text:"（七）使用 Cookie 和同类技术收集的信息"},{kind:"p",text:"为确保我们网站正常运转、为您获得更轻松的访问体验，我们会在您的计算机或移动设备上放置安全的Cookie及相关技术（统称“Cookie”）收集信息。Cookie是您浏览网页时，网站服务器放在客户端（您的计算机、移动电话或其他智能终端）里面的一个小小的文本文件，存储了一些与用户访问网站有关的信息。Cookie可帮助我们："},{kind:"p",text:"1. 按照您所希望的服务样式、外观设置为您提供服务；"},{kind:"p",text:"2. 保障数据和服务的安全性，排查针对我们的产品和服务的作弊、黑客、欺诈行为；"},{kind:"p",text:"3. 避免不必要的服务器负载，提高服务效率，节省资源、能源；"},{kind:"p",text:"4. 了解您使用我们服务的方式，以求改善我们的产品和服务的用户体验，为新产品或功能的研发提供参考数据。"},{kind:"p",text:"如果您的浏览器或浏览器附加服务允许，您可修改对Cookie的接受程度或拒绝我们的Cookie。但如果您这么做，在某些情况下可能会影响您安全访问我们的网站，且可能需要在每一次访问我们的网站时更改用户设置。"},{kind:"h2",text:"（八）通过获取权限收集的信息"},{kind:"p",text:"为实现相关业务功能，我们需要调用以下权限并收集您的信息："},{kind:"p",text:"1. 为了保障您的账号及交易安全、统计我们产品的用户数量、分析产品的使用状况以不断改进我们的产品以及向您推荐您可能感兴趣的产品和服务，当您首次使用我们的产品和服务时，我们会在获得您的自主选择同意后，获取您的读取电话状态权限，收集您使用设备的设备唯一标识信息。拒绝提供该权限会使您无法使用上述功能，但不影响您正常使用我们其他功能。"},{kind:"p",text:"2. 为向您发送消息和通知，帮助您更及时地了解我们的服务动态，当您首次使用我们的产品和服务时，我们会在获得您的自主选择同意后，获取您的推送信息权限（通知权限），向您推送保单状态信息等服务消息。拒绝提供该权限会使您无法收到我们的信息推送，但不影响您正常使用我们其他功能。"},{kind:"p",text:"请您注意，尽管我们会通过合同和技术手段要求该等第三方严格保护您的个人信息，但该等第三方将依据其个人信息保护政策对您的个人信息独立承担保护责任。"},{kind:"h1",text:"二、我们如何使用您的个人信息"},{kind:"h2",text:"（一）使用您的相关个人信息，用以实现本隐私政策第一部分所列产品和服务的功能。"},{kind:"h2",text:"（二）为提供投保服务、理赔、合同变更、退保服务之目的，将会有调查公司、公估公司等提供调查服务。此等服务提供商可能会利用您提供的或根据本隐私政策所合法收集的信息，核验并确定您是否具有相应资格及是否符合法定的条件，防止欺诈等违法活动和减少信用风险。"},{kind:"h2",text:"（三）为防止欺诈等违法活动和减少信用风险的目的,您授权我司使用您去标识化后的信息(包括手机号码、身份证件号码等去标识化的信息)向第三方机构(包括中国银联股份有限公司、银联智策顾问(上海)有限公司、银联商务支付股份有限公司等)查询、核实、采集、整理、保存、加工您的消费信息、银行卡交易信息等,并且将查询处理所得信息反馈给我司。前述第三方机构将仅在本项目的提升服务目的范围内使用您的信息,在取得您的授权同意前,第三方机构不会擅自将此信息提供给其他第三方或用于其他目的。"},{kind:"h2",text:"（四）为保险实名制、银行卡支付绑卡等身份有效性核验、便利信息填写的目的,您授权我司向第三方机构(包括银联商务支付股份有限公司、中移互联网有限公司及中国移动通信集团有限公司等)采集、查询、核验、加工、保存您的个人身份信息(包含姓名、身份证号、手机号),并将查询、核验结果提供给我司。"},{kind:"h2",text:"（五）我们可能采取去标识化等方式将在业务中收集的您的个人信息以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息进行综合研究、统计分析和预测，以统计产品的用户数量、分析产品的使用状况、排查产品崩溃原因、减少崩溃的情况，改善我们的产品和服务的设计和功能，优化用户体验或进行学术研究、科学研究。"},{kind:"h2",text:"（六）为保证服务得以完成或向您提供您可能需要的服务，我们还可能根据您提供的联系方式对您进行必要的电话回访或短信通知，包括但不限于验证码、保单生效通知等。如因您的联系方式（如手机号码）发生改变或无法触达，导致我们无法继续为您提供服务时，您授权我们可以通过合法的失联修复服务提供商（例如电信业务运营商）对您进行失联修复，以便及时与您取得联系，履行法律法规规定的我们的义务，避免您或其它用户的合法利益受到损害。"},{kind:"h2",text:"（七）为提高您使用我们及我们关联公司、合作伙伴提供服务的安全性，保护您或其他用户或公众的人身财产安全免遭侵害，更好地预防钓鱼网站、欺诈、网络漏洞、计算机病毒、网络攻击、网络侵入等安全风险，更准确地识别违反法律法规或我们相关协议规则的情况，我们可能会使用或整合您的个人信息，如账号信息、设备信息、服务日志信息、应用程序使用信息等以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息。为了依法维护您或我们的合法权益，我们可能使用上述信息解决您与我们、保险机构或者其他服务机构之间产生的违约纠纷或投诉。"},{kind:"h2",text:"（八）为了解您的保险需求及风险水平是否与保险产品相匹配，满足消费者适当性管理的要求、向您推荐保险产品、健康产品及其他您可能感兴趣的产品或服务，我们可能会根据您使用我们的产品和服务，包括通过我们选购保险产品、投保及理赔的情况，结合您使用我们的关联公司服务的情况，以及行政机关、司法机关及我们的合作机构等第三方合法收集的去标识化处理后的风险水平类、风险控制类信息，提取您的兴趣偏好、消费及服务需求等特征，进行数据抽象分析，以向您展示和推送我们、我们关联公司及合作伙伴提供产品或服务的信息。在向您展示个性化内容时，我们会标注“为您推荐”或提供类似标识。"},{kind:"p",text:"我们还可能会根据您提供的联系方式，通过短信或电话或您同意的其他方式联系您，向您推荐我们、我们关联公司及合作伙伴提供的您可能感兴趣的产品或服务，以及向您发送营销活动通知、商业性电子信息、提供与您相关的广告。如您拒绝接受短信或电话联系，您可以根据短信或电话中的指引，退订我们的短信或要求拒绝通过电话联系。"},{kind:"h2",text:"（九）为及时向您推荐符合您需求的保险或健康产品服务，提升您的保险服务体验，与我们有合作关系的保险中介机构可能会通过我们平台联系您，向您提供回访咨询、产品咨询或推荐符合您需求的保险或健康产品或服务。该等第三方合作伙伴仅可以通过我们提供的虚拟号码与您进行联系，非必要情形下，我们不会向这些合作伙伴提供您的身份信息或其它可识别到您的个人身份的信息，确保您的个人信息安全。同时，我们将努力通过采取“号码保护”、“保单信息去标识化”等合理的举措尽全力保护您的个人信息安全。如您拒绝接受此等服务，您有权根据电话中的指引，要求拒绝通过电话联系提供服务。"},{kind:"h2",text:"（十）您知悉并理解，我们的业务是由我们的合作伙伴提供的，如果您最终选择通过我们使用该等合作伙伴以其独立名义提供的相关服务，则我们将根据您的授权同意向其提供您的必要个人信息以缔结和履行相关产品或服务合同（详见本隐私政策第五节关于您个人信息的共享）。"},{kind:"h2",text:"（十一）根据适用的法律法规，我们可能会对您与我们的沟通记录及相关内容（包括语音通话信息、您在使用客服服务时输入的文字对话信息）进行去标识化处理，在无法识别您身份的情况下，将其用于算法模型训练，为您提供智能问答对话客服服务或智能语音服务，但我们不会根据您的对话内容对您个人进行特定身份的识别。"},{kind:"h2",text:"（十二）如果您购买的保险产品中附赠或您单独通过我们的产品购买或获得电话医生服务、健康体检服务、图文问诊服务或其他健康产品或服务，则我们需要向该等服务提供商提供上述服务所必要的个人信息，包括您的姓名、身份证件号码、手机号码、保单号及其它必要的保单信息（如保单状态、保单起始日期等）。我们收集该信息是为了帮助您完成实名认证，确保您可享受电话医生、健康体检等服务，防止欺诈或滥用他人身份享受服务。"},{kind:"h2",text:"（十三）如果我们将信息用于本隐私政策未载明的其他用途，或者将基于特定目的收集而来的信息用于其他目的，我们会事先征求您的同意。我们可能在某些具体服务或功能项下，通过交互文案、产品界面或弹窗等方式向您单独告知处理个人信息的目的、方式或范围，若单独告知的内容与本隐私政策不一致的，以单独告知的内容为准。"},{kind:"h1",text:"三、征得授权同意的例外"},{kind:"p",text:"根据相关法律法规规定，以下情形中收集和使用您的个人信息无需征得您的授权同意："},{kind:"p",text:"1. 与我们履行法律法规规定的义务相关的；"},{kind:"p",text:"2. 与国家安全、国防安全直接有关的；"},{kind:"p",text:"3. 与公共安全、公共卫生、重大公共利益直接相关的。例如：为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"p",text:"4. 与刑事侦查、起诉、审判和判决执行等直接有关的；"},{kind:"p",text:"5. 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到您本人同意的；"},{kind:"p",text:"6. 为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理您的个人信息；"},{kind:"p",text:"7. 所涉及的个人信息是您自行向社会公众公开的；"},{kind:"p",text:"8. 根据您要求签订和履行合同所必需的；"},{kind:"p",text:"9. 从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道；"},{kind:"p",text:"10. 维护所提供的产品或服务的安全稳定运行所必需的，例如发现、处置产品或服务的故障；"},{kind:"p",text:"11. 学术研究机构出于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的；"},{kind:"p",text:"12. 法律、法规或国家标准规定的其他情形。"},{kind:"p",text:"请注意，经匿名化处理的、单独或与其它信息相结合无法识别您的身份或者与您直接建立联系的信息，不属于个人信息，我们对此类数据的处理将无需另行向您通知并征得您的同意。如果我们将单独无法与任何特定个人建立联系的信息与其它信息结合用于识别自然人个人身份，或者将其与个人信息结合使用，则在结合使用期间，此类信息将被视为个人信息，按照本隐私政策进行处理与保护。"},{kind:"h1",text:"四、我们如何存储您的个人信息"},{kind:"p",text:"我们在中华人民共和国境内收集和产生的个人信息将存储在中华人民共和国境内。如涉及到跨境传输，我们会按照国家相关法律法规及相关标准的规定执行。"},{kind:"p",text:"我们只会在达成本隐私政策所述目的所需的期限内保留您的个人信息，除非法律有强制的留存要求。我们判断个人信息的存储期限主要参考以下标准并以其中较长者为准："},{kind:"p",text:"1. 完成您同意使用的业务功能；"},{kind:"p",text:"2. 保证我们为您提供服务的安全和质量；"},{kind:"p",text:"3. 您同意的更长的留存期间；"},{kind:"p",text:"4. 是否存在有关保留期限的其他特别约定。"},{kind:"p",text:"在超出保留期间后，我们会根据适用法律的要求删除您的个人信息，或使其匿名化处理。"},{kind:"p",text:"如我们停止运营我们的产品或服务，我们将及时停止继续收集您个人信息的活动，并将以公告的形式进行停止运营通知。同时，对我们存储的个人信息进行删除或匿名化处理。"},{kind:"h1",text:"五、我们如何共享、委托、转让、公开披露您的个人信息"},{kind:"h2",text:"（一） 共享"},{kind:"p",text:"我们不会与任何公司、组织或个人共享您的个人信息，但以下情况除外："},{kind:"p",text:"1. 取得您同意的情况下共享：在获取您明示同意的情况下，我们会与其他方共享您的个人信息。"},{kind:"p",text:"2. 履行法定义务所必需的共享：我们可能会根据法律法规规定、诉讼、争议解决需要，或按行政、司法机关依法提出的要求，以及其它法定义务履行的需要，共享必要的您的个人信息。"},{kind:"p",text:"3. 为订立、履行您作为一方当事人的合同所必需的情况下的共享："},{kind:"p",text:"如您通过我们订购或获得保险或健康产品或服务，为缔结和履行保险或健康产品或服务合同，提供相关产品或服务，我们需要向健康服务公司、医疗机构、物流服务供应商、保险公司、保险中介机构，披露提供上述服务所必需的个人信息，例如您的身份信息、财产信息、健康信息、保单信息、投保过程（如录音录像、通话录音、投保轨迹等）、申请理赔、保全、退保及其它保单服务的信息。我们还可能与这些机构联合研发或优化保险或健康服务产品。您理解，在这种情况下这些产品或服务提供者构成独立的个人信息控制者，他们对您个人信息的收集、使用、存储及采取安全保护措施将受他们的隐私协议或服务条款约束，他们可能自行将您的个人信息用于提供产品或服务之外的其他目的。这些产品或服务提供者将对他们处理您个人信息的活动独立承担责任。"},{kind:"p",text:"4. 在法律法规允许的范围内，为维护我们、我们的关联公司或合作伙伴、您或其他我们用户或社会公众的合法利益，或者为了解决您与我们、保险机构或者其他服务机构之间产生的纠纷争议或投诉处理而有必要共享您的个人信息。"},{kind:"p",text:"5. 为了配合合作保险机构履行法律法规的规定及行政/司法机关的要求，如实名制管理、反洗钱、反保险欺诈、保险可回溯管理等，我们可能需要将收集的信息（如投保人与被保险人身份信息、保险标的信息、投保过程信息（如录音录像、通话录音、投保轨迹等）及必要的风险信息等）向合作保险机构提供，或提交监管机构或其指定机构进行核验。"},{kind:"p",text:"6. 与我们的关联公司共享。您购买我们的其他产品或服务，这些服务可能是由我们的关联公司提供。为向您提供前述产品或服务、防止欺诈与安全风险以及便于您进行统一账号管理，我们可能会将您的个人信息与我们的关联公司共享。但我们只会共享必要的个人信息，且关联公司对您个人信息的使用受本隐私政策，或经过您授权同意的且对您的个人信息提供与本隐私政策保护水平实质相同的关联公司隐私政策的约束（您可以在相关应用程序或我们的官方网站上查看我们旗下相关产品适用的隐私政策）。我们和我们的关联公司均会严格遵守我们的个人信息及数据安全保护制度和政策。"},{kind:"h2",text:"（二） 委托处理"},{kind:"p",text:"我们可能会委托第三方合作伙伴代我们处理个人信息，以便授权合作伙伴代表我们为您提供某些服务或履行职能。但我们仅会出于合法、正当、必要、明确的目的委托其处理您的个人信息，授权合作伙伴只能接触到其提供服务或履行职能所必要的个人信息。我们将会通过协议要求其不得将此信息用于其它任何超出委托范围的目的。除非您另行授权同意，我们的合作伙伴无权将您的个人信息用于任何其他我们未委托的用途。我们委托的合作伙伴包括以下类型："},{kind:"p",text:"1. 保险或健康产品或服务提供者及其代理人。为向您推荐符合您需求的保险，我们可能会委托与我们有合作关系的保险中介机构通过我们的平台联系您向您提供回访咨询、产品咨询或推荐您可能感兴趣的产品或服务。在这种情况下，该等第三方合作伙伴仅可以通过我们提供的虚拟号码联系您，非必要情形下，我们不会向这些合作伙伴提供您的身份信息或其它可识别到您的个人身份的信息，确保您的个人信息安全。我们将努力通过采取“号码保护”、 “保单信息去标识化”等合理的举措尽全力保护您的个人信息安全。"},{kind:"p",text:"2. 供应商、服务提供商和其它合作伙伴。我们可能会将您的个人信息提供给支持我们提供服务的第三方服务提供商及合作伙伴。这些服务提供商、合作伙伴包括为我们提供基础设施技术服务、数据处理、核验、公估、信用审查、风控和客户服务、支付服务、完成交易所必须的快递服务或进行学术研究和调查等的机构。但我们要求这些服务提供商、合作伙伴只能出于为我们提供服务的目的使用您的信息，而不得出于其自身利益使用您的信息。"},{kind:"p",text:"3. 广告、分析服务类的授权合作伙伴。经您授权，我们会与提供广告投放推广的服务提供商、统计分析服务提供商（例如应用流量监测服务提供商）或其他合作伙伴共享信息，但我们仅会向这些合作伙伴提供汇总后的信息、匿名化后的信息或者其他不会识别到您的个人身份的信息，不会分享您的任何身份信息、账号信息或其他可识别信息。例如，我们的产品中可能会嵌入第三方软件工具开发包（SDK），以统计用户使用应用程序的习惯或偏好，或点击访问广告的情况。我们会不时对该等合作伙伴进行技术检测和行为审计，以最大限度地确保其依法、依规、依约收集和使用数据。"},{kind:"h2",text:"（三）转让"},{kind:"p",text:"我们不会将您的个人信息转让给其他任何公司、组织和个人，但以下情形除外："},{kind:"p",text:"1. 事先获得您明确的同意或授权；"},{kind:"p",text:"2. 根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；"},{kind:"p",text:"3. 符合与您签署的相关协议（包括在线签署的电子协议以及相应的平台规则）或其他的法律文件约定所提供；"},{kind:"p",text:"4. 随着我们公司业务的发展，我们及我们的关联公司有可能进行合并、收购、资产转让或其他类似的交易。如相关交易涉及到您的个人信息转让，我们会要求新持有您个人信息的公司、组织和个人继续受此政策约束，否则我们将要求该公司、组织和个人重新征得您的授权同意。"},{kind:"h2",text:"（四）公开披露"},{kind:"p",text:"我们仅会在以下情况，且采取符合业界标准的安全防护措施的前提下，才会公开披露您的个人信息："},{kind:"p",text:"1. 根据您的需求，在您明确同意的披露方式下披露您所指定的个人信息；"},{kind:"p",text:"2. 根据法律、法规的要求、强制性的行政执法或司法要求所必须提供您个人信息的情况下，我们可能会依据所要求的个人信息类型和披露方式公开披露您的个人信息。在符合法律法规的前提下，当我们收到上述披露信息的请求时，我们会要求必须出具与之相应的法律文件，如传票或核查函。我们坚信，对于要求我们提供的信息，应该在法律允许的范围内尽可能保持透明。我们对所有的请求都进行了慎重的审查，以确保其具备合法依据，且仅限于执法部门因特定核查目的且有合法权利获取的数据。"},{kind:"p",text:"请注意，您在使用我们服务时自愿发布甚至公开分享的信息，可能会涉及您或他人的个人信息甚至敏感个人信息，如您的交易信息，以及您在评价时选择上传包含个人信息的文字、图片或视频等各种形式的信息。请您在使用我们的服务时更加谨慎地考虑，是否要发布甚至公开分享相关信息。"},{kind:"h1",text:"六、我们如何保护您的个人信息"},{kind:"p",text:"我们已采取符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。"},{kind:"p",text:"1. 我们设置了专门的个人信息保护负责人，负责处理我们相关产品和服务可能涉及到用户个人信息的各项事务，以及规划和制定公司的隐私政策、审核各产品的用户使用协议、监督各产品的工作原理和信息处理机制等。"},{kind:"p",text:"2. 我们进行了信息安全等级保护的定级测评，我们的信息系统被认定为符合信息安全等级保护第三等级（金融机构信息系统级别的保护）要求，并按照法律法规要求就定级报告向公安机关进行了备案。我们按照信息安全等级保护的要求制定了信息安全工作的总体方针和安全策略，建立了覆盖主机、数据、应用、管理等层面的安全管理制度，设立了专职部门负责信息安全管理工作，明确了安全管理机构内的各个部门和岗位的职责、分工和技能要求，制定了明确的人员录用和离职管理规范。"},{kind:"p",text:"3. 我们会对可识别的敏感个人信息进行加密传输和存储，以确保数据的保密性。"},{kind:"p",text:"4. 我们存储用户个人信息的服务器系统均为安全加固后的操作系统。我们会对服务器操作进行账号审计及监控。如果发现外部公告有安全问题的服务器操作系统，我们会在第一时间进行服务器安全升级，确保我们所有服务器系统及应用安全。"},{kind:"p",text:"5. 我们为工作人员定期举办个人信息保护相关法律法规培训，以加强工作人员的用户个人隐私保护意识。"},{kind:"p",text:"6. 我们制定了信息安全事件应急预案，并调配足够的资源保障确保应急预案的执行。我们每年对应急预案进行了培训和应急事件演练。如果我们的物理、技术或管理防护措施不幸遭到破坏，我们会及时启动应急预案，防止安全事件扩大，按照法律法规的要求上报国家主管机关，并及时采取推送、公告等合理、有效的方式向您告知安全事件的基本情况、可能的影响、已经采取的措施或将要采取的措施等。"},{kind:"h1",text:"七、您管理个人信息的权利"},{kind:"p",text:"按照中国相关的法律、法规、标准，在您使用我们的产品或服务期间，您可以参考下述指引查询、复制、更正、删除您的个人信息，行使撤回同意以及注销账号的权利。另外，您可以通过本隐私政策第十节载明的方式与我们联系，您的意见会及时得到处理。"},{kind:"h2",text:"（一）查询、复制、更正、删除您的个人信息"},{kind:"p",text:"您可以通过本政策第十节提供的联系方式联系我们查询、复制、更正和删除您的个人信息。"},{kind:"p",text:"以下情况发生时，您可以通过本隐私政策提供的联系方式要求我们删除您的个人信息："},{kind:"p",text:"1. 我们没有征求您的明确同意，收集了您的个人信息。"},{kind:"p",text:"2. 我们处理您的个人信息违反了法律法规要求。"},{kind:"p",text:"3. 我们违反了与您的约定来使用和处理您的个人信息。"},{kind:"p",text:"4. 您注销了我们账号、卸载或者不再使用我们的产品或服务。"},{kind:"p",text:"5. 我们停止对您提供服务。"},{kind:"p",text:"您可以通过本隐私政策第十节提供的方式联系我们要求删除您的个人信息，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。当我们从服务器中删除您的个人信息后，我们可能不会立即从备份系统中删除相应的数据，但会在备份更新的时候删除这些信息。"},{kind:"h2",text:"（二）获得解释的权利"},{kind:"p",text:"您有权要求我们就个人信息处理规则作出解释说明。您可以通过本隐私政策载明的联系方式与我们取得联系。"},{kind:"p",text:"三） 逝者近亲属相关权利"},{kind:"p",text:"若我们用户不幸身故，其近亲属为了自身的合法、正当利益，可以对我们用户的相关个人信息行使本条款规定的查阅、复制、更正、删除等相关权利；我们用户生前另有安排的除外。"},{kind:"h2",text:"（四）响应您的上述请求"},{kind:"p",text:"如果您选择删除个人信息或者注销个人账号，您可以通过本隐私政策第十节的联系方式联系我们，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。"},{kind:"p",text:"在以下情形中，按照法律法规要求，我们将无法响应您的请求："},{kind:"p",text:"1. 与我们履行法律法规规定的义务相关的；"},{kind:"p",text:"2. 与国家安全、国防安全直接相关的；"},{kind:"p",text:"3. 与公共安全、公共卫生、重大公共利益直接相关的；"},{kind:"p",text:"4. 与刑事侦查、起诉、审判和判决执行等直接相关的；"},{kind:"p",text:"5. 有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"p",text:"6. 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到本人同意的;"},{kind:"p",text:"7. 响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；"},{kind:"p",text:"8. 涉及商业秘密的。"},{kind:"h1",text:"八、未成年人个人信息保护"},{kind:"p",text:"我们非常重视未成年个人信息的保护。我们的产品和服务主要面对成人。我们原则上不会主动从未成年人处收集未成年人的个人信息；如果没有父母或监护人的同意，未成年人不应注册和使用我们的服务。如您为未成年人，我们建议您请您的父母或监护人为您阅读本隐私政策，并在您提交个人信息之前征得父母或监护人的同意。若您是未成年人的监护人，当您对您所监护的未成年人的个人信息有疑问时，您可以通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"如果特定服务需要提供未成年人个人信息（例如父母或监护人为未成年子女投保时，需要提供未成年人的姓名、身份证号等个人信息），那么我们仅会在法律法规允许、父母或监护人同意并主动提交这些信息的情况下，收集这些信息。对于经父母或监护人同意使用我们的产品或服务而收集未成年人个人信息的情况，我们只会在法律法规允许、父母或监护人明确同意或者保护未成年人所必要的情况下使用、共享、转让或披露此信息。如果我们发现自己在未事先获得可证实的父母或法定监护人同意的情况下收集了未成年人的个人信息，则会在法律要求的情况下尽快删除相关数据。"},{kind:"h1",text:"九、隐私政策的适用范围、变更和修订"},{kind:"p",text:"如我们在本隐私政策序言部分所述，本隐私政策适用于我们产品和服务。您可能通过我们产品中的链接跳转至我们运营的其他产品或服务，这些产品或服务可能会通过其另行设置的隐私政策向您说明收集和使用您个人信息的情况并据此处理您的个人信息。我们的产品或服务均会按照与本隐私政策实质相同的标准对您的个人信息提供完善的保护。"},{kind:"p",text:"需要特别说明的是，本隐私政策不适用于其他第三方向您提供的服务。例如您通过我们链接或购买的保险产品。我们会在与这些第三方开展合作过程中尽最大努力督促其保护您的个人信息，但您理解这些服务由第三方独立向您提供，第三方将依照其隐私政策或用户协议单独对您的个人信息处理承担责任。"},{kind:"p",text:"我们的隐私政策可能变更。未经您明确同意，我们不会限制您按照本隐私政策所应享有的权利。"},{kind:"p",text:"本政策所指的重大变更包括但不限于："},{kind:"p",text:"1. 我们的服务模式发生重大变化。如处理个人信息的目的、处理个人信息的类型、个人信息的使用方式等；"},{kind:"p",text:"2. 我们在控制权等方面发生重大变化。如并购重组等引起的所有者变更等；"},{kind:"p",text:"3. 个人信息共享、转让或公开披露的主要对象发生变化；"},{kind:"p",text:"4. 您参与个人信息处理方面的权利及其行使方式发生重大变化；"},{kind:"p",text:"5. 我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化时；"},{kind:"p",text:"6. 个人信息安全影响评估报告表明存在高风险时。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您在使用我们产品或服务的过程中对本个人信息保护政策有任何疑问或建议，请通过以下联系方式与我们联系："},{kind:"p",text:"公司名称： 东方大地（武汉）保险经纪有限公司"},{kind:"p",text:"地址： 湖北省武汉市江汉区新华路385号南达大楼9楼909、910室"},{kind:"p",text:"网络安全负责人：荣谦"},{kind:"p",text:"电子邮件： doc@dfdadi.com"},{kind:"p",text:"为保障我们高效处理您的问题并及时向您反馈，需要您提交身份证明、有效联系"},{kind:"p",text:"方式和书面请求及相关证据，我们会在验证您的身份后处理您的请求。 一般情况"},{kind:"p",text:"下，我们将在三十天内回复。"},{kind:"p",text:"如果您对我们的回复不满意，特别是您认为我们的个人信息处理行为损害了您的"},{kind:"p",text:"合法权益，您还可以通过以下外部途径寻求解决方案：向东方大地（武汉）保险经纪有限公司住所地有管辖权的法院提起诉讼。"}]},cr={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年6月3日"},{kind:"p",text:"生效时间：2026年6月3日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一. 我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"h2",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"p",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息展示的服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、手机号、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，我们会从您的可信数据空间中获取您的【姓名、手机号、身份证号码前十四位】信息并提供给银联商务支付股份有限公司及相关使用方，并使用该信息为您完成H5场景下展示的服务。为保障您的数据安全，在向银联商务支付股份有限公司及相关使用方提供您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"h2",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"h2",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"h2",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"h2",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"h2",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给银联商务支付股份有限公司及相关使用方，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"p",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"p",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"h2",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"h1",text:"七、我们如何处理未成年人的个人信息"},{kind:"h2",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"h2",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"h2",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},pr={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[[{kind:"text",text:"合作方",colSpan:7}],["合作方名称","共享目的","共享场景","个人信息","提供方式","隐私政策或官网","联系方式"],["海客（天津）保险经纪有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口",{kind:"doc-link",text:"《蓝鲸保隐私政策》",docKey:"haike-v2-privacy-policy"},"4000-161-100"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口",{kind:"doc-link",text:"《中国移动认证梧桐数盾隐私政策》",docKey:"haike-v2-cmcc-privacy-policy"},"10086"]]}]},kr={title:"《蓝鲸保隐私政策》",blocks:[{kind:"h1",text:"隐私政策"},{kind:"p",text:"【发布日期】2026年1月23日"},{kind:"p",text:"【生效日期】2026年1月23日"},{kind:"p",text:"【特别提示】尊敬的用户：感谢您的信任，为了帮助您了解我们对个人信息的处理和保护规则，我们特制定《蓝鲸保隐私政策》（“隐私政策”）。请您仔细阅读本隐私政策尤其是粗体显示的内容。如您有任何疑问、意见或建议，您可通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"本隐私政策适用于海客（天津）保险经纪有限公司及其关联公司（统称“我们”或“蓝鲸保”）通过官方网站（https://www.hkinur.com）、相关小程序、公众号、H5页面、网页以及随技术发展出现的新形态向您提供的产品和服务（统称“蓝鲸保”）。为了更好地为您提供贴心的服务，您在使用我们的产品或服务时，我们可能会收集和使用您的相关信息。我们非常重视用户的隐私和个人信息保护，希望通过本隐私政策向您说明我们在您使用我们的产品或服务时如何收集、使用、保存、共享、转让和保护这些信息，以及我们为您提供的管理这些信息的方式。"},{kind:"p",text:"在本隐私政策中，个人信息，是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。敏感个人信息，是指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。我们将在本隐私政策中对个人信息以粗体进行显著标识。"},{kind:"p",text:"我们在此特别提醒您：我们致力于打造多样的产品和服务以满足您的需求。因我们向您提供的产品和服务种类众多，且不同用户选择使用的具体产品/服务范围存在差异，故收集使用的个人信息类型、范围会有所区别，请以具体的产品/服务功能为准。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"li",text:"我们收集了哪些个人信息"},{kind:"li",text:"我们如何使用您的个人信息"},{kind:"li",text:"征得授权同意的例外"},{kind:"li",text:"我们如何存储您的个人信息"},{kind:"li",text:"我们如何共享、委托处理、转让、公开披露您的个人信息"},{kind:"li",text:"我们如何保护您的个人信息"},{kind:"li",text:"您管理个人信息的权利"},{kind:"li",text:"未成年人个人信息保护"},{kind:"li",text:"隐私政策的适用范围、变更和修订"},{kind:"li",text:"如何联系我们"},{kind:"li",text:"隐私政策的生效"},{kind:"li",text:"我们收集了哪些个人信息"},{kind:"b",text:"在您使用服务过程中，我们将按照如下方式收集您在使用服务时主动提供或因您使用服务而产生的信息，用以向您提供下述服务、优化我们的服务并保障您的账号安全。由于蓝鲸保产品和服务的形态较多，具体的服务类型和可能处理的个人信息以您使用的产品界面展示为准。"},{kind:"li",text:"账号注册、登录相关的个人信息"},{kind:"p",text:"当您注册、登录成为我们用户时，我们可能会收集您的手机号码以创建账号；当您选择授权使用第三方账号（如微信）登录时，我们会通过第三方获取您授权共享的第三方账号信息（包括微信昵称、微信头像、openid、unionid等，具体以第三方平台授权的个人信息类型为准）并可能收集您的手机号码进行账号绑定。收集这些信息是为了帮助您完成账号注册，保护您的账号安全。我们收集手机号码，是为了验证您的身份，满足相关法律法规的网络实名制要求。如果您拒绝提供这些信息，您可能无法正常注册账号，亦无法在我们的平台上购买保险产品。"},{kind:"p",text:"基于我们与通信运营商的合作，当您使用一键登录功能时，经过您的同意，我们会使用运营商提供的功能，将您设备中的手机号码作为您的注册、登录账号并免于密码或动态验证码核验，为您提供快捷的注册、登录服务。"},{kind:"li",text:"为您提供保险服务基本功能相关的个人信息"},{kind:"li",text:"投保"},{kind:"p",text:"当您购买保险产品投保时，我们将收集您的投保信息，以便帮助您与保险公司签订保险单，完成投保，这些信息包括投保人的姓名、身份证件信息、身份证件号码、手机号码、社保状态（有无）、住址或者有效联系地址、邮箱，被保险人的姓名、性别、与投保人关系、身份证件信息、身份证件号码、手机号码、健康状况、职业，受益人的姓名、受益比例，保险订单信息及其他投保所需的必要信息（以您在投保时相关产品界面所要求提供的信息字段为准）。除上述基本信息，我们还可能根据您购买保险产品种类或接受服务的不同，收集与所提供服务相关的您的信息，具体以您购买的保险产品要求为准。收集方式包括您在使用服务时主动提供、从我们的关联公司或与您购买保险产品相关的服务场景平台、保险机构、政府机关授权单位以及其它合法留存您的信息的服务提供方（如健康服务机构、信息技术服务机构、服务提供商等）处收集。根据法律法规及监管规定，我们将完整记录和保存投保的主要业务过程，包括在您拨打或接听保险客服顾问电话时，我们将会对电话通话过程全程录音，或者按照监管要求对投保过程进行同步录音录像或投保轨迹记录和保存。"},{kind:"p",text:"您可以通过蓝鲸保为其他人投保保险产品，您向蓝鲸保提供该实际被保险人的前述个人信息之前，您需确保您已经取得其授权同意。"},{kind:"p",text:"如果您拒绝提供这些信息，我们无法为您订购保险产品并办理投保手续，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"保险合同变更、退保"},{kind:"p",text:"当您通过我们进行保险合同变更、退保时，我们还将收集您主动提供或上传的信息，包括保单号、投保人电话、被保人的姓名、身份证件信息、身份证件号码、身份证照片、保全申请事由信息、退保申请事由信息、银行账户信息及其他必要信息。在涉及您的父母、配偶或子女的情况下，我们会向您收集您的父母、配偶、或子女的相应上述个人信息。您向蓝鲸保提供前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法向您提供合同变更、退保等服务，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"根据法律法规及监管规定，当您通过我们投保成功，或使用我们提供的协助理赔、协助保全、协助退保、保单查询功能时，由于保险单实际是由为您承保的保险公司提供，因此我们需要从为您承保的保险公司获取您的保险单信息，以便为您提供上述服务。"},{kind:"li",text:"资格核验、风险控制及适当性管理"},{kind:"p",text:"在向您提供各项保险服务过程中，我们可能会向第三方核验调查您是否具备相应的资格或符合法定的条件。在这种情况下，我们可能会收集您留存在我们关联公司、与我们合作的保险公司、保险中介机构处的个人信息，我们还可能向行政机关、司法机关、征信机构、医疗机构、社保机构、保险公估公司、健康服务机构、背景调查公司、信息技术服务机构、银联、电信运营商（或其授权的服务提供商）、服务提供商以及其他合法了解掌握相关信息的自然人和法人收集或查询相关信息。您同意我们向上述机构收集、查询、使用您的身份信息、医疗健康信息、社保信息、财产信息、个人信用信息、涉诉信息、在网信息等相关信息以核验您的身份信息的真实性以及是否具有相应的资格或符合法定的条件，防范欺诈等违法活动和减少信用风险。"},{kind:"p",text:"基于账户安全管理、风险控制、防范保险欺诈、个性化展示、消费者适当性管理等原因，我们可能从行政机关、司法机关及我们的合作机构（包括服务提供商、征信机构、信息技术服务机构、社保机构或其授权的服务提供商、银联或其授权的服务提供商、电信运营商或其授权的服务提供商）、关联公司等第三方获取去标识化处理后的风险水平类、账户安全类、风控类、标签类相关信息，用于提供风险控制、保险反欺诈、反黑灰产、产品推荐、投保交易风控、智能协助理赔等服务，保障您的账户安全、信息安全及满足法律法规要求。"},{kind:"li",text:"依据法律法规及监管规定履行法定义务"},{kind:"p",text:"根据互联网及金融监管等要求，我们需履行法定义务，如：保险交易可回溯管理义务、实名制管理义务、反洗钱反恐怖融资义务（客户身份识别、客户身份资料和交易记录保存、尽职调查、严格保密等）等。这些法定义务要求我们向您收集您的个人身份信息、电话录音、录音录像、投保轨迹等，并根据您所投保的产品向相应保险机构提供。其中“身份信息”包括您的姓名、性别、国籍、职业、住所地（或经常居住地）或者工作单位地址、联系方式、身份证件或者身份证明文件的种类、号码和有效期限。“投保轨迹”包括相关交易信息、保单信息、账户信息。如您拒绝提供上述信息，则可能无法使用与监管要求相关的部分服务，但不影响您使用我们提供的其他服务。您知晓并同意，根据您所需的保险产品和服务的不同以及监管机构的要求，我们所收集的信息类型以具体产品或服务申请页面为准。"},{kind:"p",text:"为了提升您的服务体验，如果您在使用我们的关联公司服务过程中曾经留存过有效的个人身份信息（姓名、联系方式、身份证件号码等），我们可能会向关联公司收集上述信息并帮助您自动填写您合法留存的历史信息（以您最近一次保存的内容为准），以免您重复提交，并满足互联网及金融监管法定义务。上述关联公司情况详见《自动填写信息授权书》（请嵌入文件超链接后删除标黄文字）"},{kind:"li",text:"与改善和优化服务及保障账号安全相关的个人信息"},{kind:"p",text:"为了保障用户的账号安全、交易安全、系统运行安全，满足法律法规和我们协议规则的相关要求，以及不断地改进我们的产品、提高用户体验，我们需要收集相关的设备信息与日志信息。设备信息包括与您使用设备的软硬件特征和设备环境信息相关的信息，例如IMEI、Android ID、OAID、IDFA、IMSI、网络设备地址（MAC）、BSSID、iccid、设备型号、设备名称、系统版本号、任务列表、设备应用安装列表、手机制造商、运营商名称；日志信息包括IP地址、访问的浏览器信息、点击和浏览我们产品和服务功能或页面的URL地址及其使用情况与频率、应用崩溃情况、总体安装使用情况、性能数据、应用来源。收集方式包括您在使用服务时主动提供、从我们的关联公司、合作伙伴或与您购买保险产品相关的服务场景平台、保险机构、政府机关授权单位以及其它合法留存您的信息的服务提供方（如健康服务机构、信息技术服务机构、服务提供商等）处收集。如果您需要使用微信分享功能，我们将使用您的剪切板信息，以确保功能正常使用。"},{kind:"li",text:"与信息推送、搜索和展示有关的个人信息"},{kind:"p",text:"我们可能收集和使用包括设备信息（例如IMEI、Android ID、OAID、IDFA、网络设备地址（MAC）、IMSI、BSSID、MEID、设备型号、设备名称、系统版本号、设备应用安装列表、手机制造商、运营商名称）、日志信息（包括IP地址、访问的浏览器信息、点击和浏览我们产品和服务功能或页面的URL地址及其使用情况与频率、总体安装使用情况、性能数据、应用来源），用于向您推送信息和内容，该等信息展示与推送可能使用第三方服务。基于为您提供更精准的信息推荐、产品推荐的目的，我们可能向合作的第三方机构收集、查询、核验相关信息（该信息为无法识别用户个人身份的信息，如开放匿名设备标识符OAID等设备信息、曝光、点击等广告媒体数据、去标识化标签数据等）。您理解并同意，部分保险产品可能仅面向特定地域提供服务，我们在向您提供相关服务时，可能需要获取您的所处位置信息，用于为您匹配相应产品和服务信息。您有权按照本隐私政策第七节“您管理个人信息的权利”指引的撤回同意的方式关闭该等信息推送，在您关闭后，您的设备将不再收到我们的推送信息，关闭信息推送不会影响您使用其他服务。"},{kind:"p",text:"当您使用搜索功能时，我们会自动收集您输入的关键字信息和搜索记录。如果您拒绝提供上述信息，您无法享受搜索服务，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"为您提供客服和售后服务有关的个人信息"},{kind:"p",text:"在您使用我们产品或服务的过程中，如果您有任何疑问、意见或建议，您可以通过在线客服、发送邮件或拨打电话与我们取得联系，我们将可能收集您的账号信息、电话录音、在线沟通记录、您与客服人员的对话信息（其中可能包括您主动提供的个人信息）。如果您参与问卷调查，我们还将收集您在问卷中向我们提供的信息。为了保证服务体验、改善服务品质，您与客服的通话信息可能会被录音。当您在保险服务过程中出现服务投诉或纠纷时，我们可依法调取并使用录音信息作为解决纠纷的参考依据。"},{kind:"p",text:"当您需要我们提供与保单相关的客户服务时，我们可能会查询您的相关交易信息以便向您提供适当的服务。当您需要客服协助您修改有关信息（如地址、联系方式等）时，您可能还需要提供相应的信息以完成修改。您知悉并同意，如果我们的客服人员无法立刻解决您的问题，我们可能在核实情况后，通过您主动提供的联系方式与您取得联系、解答您的问题、回应您的诉求。"},{kind:"p",text:"为了向您提供智能客服等相关服务，我们将收集您主动输入或提供的文本、语音、图片、视频、语音通话等多个模态的信息以及与我们的沟通记录及相关内容。上述信息将作为智能对话（包括文本对话、语音对话等）的内容识别、语义理解和生成回复的基础。该等智能客服等相关服务可能使用第三方服务（包括阿里巴巴达摩院(杭州)科技有限公司、北京百度网讯科技有限公司、腾讯云计算（北京）有限责任公司等）。"},{kind:"li",text:"支付订单的个人信息"},{kind:"p",text:"您通过我们支付订单时，可以选择我们合作的银行和第三方支付机构（如支付宝、微信支付等合作方）所提供的服务进行支付。我们需要收集您的订单信息、对账信息及其他法律要求的必要信息并与这些合作机构共享，以确认您的支付指令并帮助您完成支付。同时，为了帮助您实现基于银行卡支付的功能，您授权并同意，我们收集您主动提交的或从合法留存您信息的第三方收集您的姓名、身份证号、银行卡号、银行卡预留手机号、发卡行、卡类型等银行卡信息，以便于将您的银行卡与您的账户进行绑定。我们会将该等信息提供给我们的第三方合作支付机构（以具体的产品/服务页面展示的第三方合作支付机构为准）用于验证、支付。在您使用支付服务时，我们还需要记录、收集您的交易信息。您授权我们在向您提供支付服务时可以向必要的第三方合作支付机构提供前述支付必要信息，以确认您的支付指令并帮助您完成支付。"},{kind:"b",text:"您理解并同意，为提升您的服务体验，便于您便捷地选择需要进行绑定的银行卡，您授权我们将您的必要身份信息（包括姓名、银行预留手机号码、身份证号码）或具体产品/服务页面提示的其它信息，提供给我们的合作伙伴（包括蚂蚁区块链科技(上海)有限公司等），以加密展示、查询验证相关银行卡及活跃状态等信息，并在相关支付页面为您展示或推荐更优质或更便捷的银行卡支付服务。"},{kind:"li",text:"扩展业务、增值服务相关的个人信息"},{kind:"p",text:"我们可能会提供保险产品或服务相关扩展业务、增值服务，具体包括以下内容："},{kind:"li",text:"选择保险方案"},{kind:"p",text:"为向您提供选择保险方案服务，您需要向我们提供您的年龄、投保金额、您的姓名、您的电话，以根据您提供的信息测算适合您的保险方案，并向您发送测算结果。如果您拒绝提供这些信息，我们无法为您提供相应服务，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"为向您提供保险定制功能，您需要向我们提供您的手机号、年龄、个人月收入区间、家庭成员、家庭年收入。如果您拒绝提供这些信息，我们无法为您提供相应服务，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"保费计算"},{kind:"p",text:"在您投保过程中，为方便您计算保费，我们还向您提供保费计算功能。您需要向我们提供您的生日、投保份数、保障期限、交费方式、性别。如果您拒绝提供这些信息，我们无法为您提供相应服务，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"发送电子保单"},{kind:"p",text:"如果您选择由我们向您发送电子保单，需要您提供接受电子保单的邮箱地址。如果您拒绝提供收件人信息或邮箱地址，我们无法向您发送保单，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"视频播放/直播功能"},{kind:"p",text:"当您使用视频播放/直播功能，我们会收集您的设备信息及日志信息。除“改善和优化服务及保障账号安全”功能部分提到的日志信息外，我们还将收集您的播放时间、软件版本型号、您的浏览记录、播放记录、播放时长、访问日期和时间、收藏/关注/订阅/阅读记录。如果您拒绝提供上述信息，您无法享受视频播放/直播服务，但不影响您使用我们提供的其他功能。"},{kind:"li",text:"点赞、分享、信息公开发布功能相关的个人信息"},{kind:"p",text:"当您、点赞、分享您感兴趣的视频、推文，我们需要收集您的点赞、分享记录。"},{kind:"p",text:"如您在蓝鲸保相关页面公开发表评价、发布图文等，我们将收集您发布的信息并在商品评价等公共页面向所有用户公开展示您的昵称、头像、您账户发布的内容等。请注意，您公开发布的信息中可能会涉及您或他人的个人信息甚至敏感个人信息，如您在评价时选择上传包含个人信息的图片，请您更加谨慎地考虑，是否在使用我们的服务时共享甚至公开分享相关信息。若您公开发布的信息中涉及他人个人信息的，您需在发布前征得他人的同意。如您选择以匿名方式发布评价信息时，我们将不展示您的昵称、头像。如我们在其它产品功能中使用您发表的评论，我们将通过去标识化的方式展示，确保您的个人信息安全。"},{kind:"p",text:"以上增值服务均为扩展业务功能服务，我们会在符合法律规定的情况下收集并使用您主动提供或因您使用服务而产生的信息。您可以拒绝提供或收集相关信息，但不影响您使用我们提供的基本功能及其它服务。"},{kind:"li",text:"使用 Cookie 和同类技术收集的信息"},{kind:"p",text:"为确保我们网站正常运转、为您获得更轻松的访问体验，我们会在您的计算机或移动设备上放置安全的Cookie及相关技术（统称“Cookie”）收集信息。Cookie是您浏览网页时，网站服务器放在客户端（您的计算机、移动电话或其他智能终端）里面的一个小小的文本文件，存储了一些与用户访问网站有关的信息。Cookie可帮助我们："},{kind:"li",text:"按照您所希望的服务样式、外观设置为您提供服务；"},{kind:"li",text:"保障数据和服务的安全性，排查针对我们的产品和服务的作弊、黑客、欺诈行为；"},{kind:"li",text:"避免不必要的服务器负载，提高服务效率，节省资源、能源；"},{kind:"li",text:"了解您使用我们服务的方式，以求改善我们的产品和服务的用户体验，为新产品或功能的研发提供参考数据。"},{kind:"p",text:"如果您的浏览器或浏览器附加服务允许，您可修改对Cookie的接受程度或拒绝我们的Cookie。但如果您这么做，在某些情况下可能会影响您安全访问我们的网站，且可能需要在每一次访问我们的网站时更改用户设置。"},{kind:"li",text:"第三方SDK的使用情况"},{kind:"p",text:"在某些特定业务场景下，为了保障本服务的稳定运行、功能实现，使您能够使用和享受更多的服务及功能，我们的应用中会嵌入第三方的SDK或其他类似的应用程序（简称SDK）来为您提供服务。"},{kind:"p",text:"请您点击此处查看我们产品中接入的第三方SDK目录（《接入第三方SDK目录》）（请嵌入《接入第三方SDK目录》文件超链接后删除标黄文字），以了解可能获得您信息的第三方SDK、相关服务提供方身份、其通过蓝鲸保收集或获取的您的个人信息范围以及使用目的。我们会不时对该等合作伙伴或服务提供商进行技术检测和行为审计，并要求其遵循合作法律协议，以最大限度地确保其依法、依规、依约收集和使用数据。"},{kind:"b",text:"请您注意，尽管我们会通过合同和技术手段要求该等第三方严格保护您的个人信息，但该等第三方将依据其个人信息保护政策对您的个人信息独立承担保护责任。"},{kind:"li",text:"我们如何使用您的个人信息"},{kind:"h2",text:"（一）使用您的相关个人信息，用以实现本隐私政策第一部分所列产品和服务的功能。"},{kind:"h2",text:"（二）为提供投保服务、理赔、合同变更、退保服务之目的，将会有调查公司、公估公司等提供调查服务。此等服务提供商可能会利用您提供的或根据本隐私政策所合法收集的信息，核验并确定您是否具有相应资格及是否符合法定的条件，防止欺诈等违法活动和减少信用风险。"},{kind:"h2",text:"（三）我们可能采取去标识化等方式将在业务中收集的您的个人信息以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息进行综合研究、统计分析和预测，以统计产品的用户数量、分析产品的使用状况、排查产品崩溃原因、减少崩溃的情况，改善我们的产品和服务的设计和功能，优化用户体验或进行学术研究、科学研究。"},{kind:"h2",text:"（四）为保证服务得以完成或向您提供您可能需要的服务，我们还可能根据您提供的联系方式对您进行必要的电话回访或短信通知，包括但不限于验证码、保单生效通知等。"},{kind:"h2",text:"（五）为提高您使用我们及我们关联公司、合作伙伴提供服务的安全性，保护您或其他用户或公众的人身财产安全免遭侵害，更好地预防钓鱼网站、欺诈、网络漏洞、计算机病毒、网络攻击、网络侵入等安全风险，更准确地识别违反法律法规或蓝鲸保相关协议规则的情况，我们可能会使用或整合您的个人信息，如账号信息、设备信息、服务日志信息、应用程序使用信息等以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息。为了依法维护您或我们的合法权益，我们可能使用上述信息解决您与蓝鲸保、保险机构或者其他服务机构之间产生的违约纠纷或投诉。"},{kind:"h2",text:"（六）为了解您的保险需求及风险水平是否与保险产品相匹配，满足消费者适当性管理的要求、向您推荐保险产品、健康管理增值服务及其他您可能感兴趣的产品或服务，我们可能会根据您使用我们的产品和服务，包括您通过蓝鲸保选购保险产品、投保、理赔、享受客服服务等信息及在蓝鲸保平台的浏览记录、操作记录、日志信息、设备信息、网络信息、位置信息等，结合您使用我们的关联公司服务的情况，以及行政机关、司法机关及我们的合作机构等第三方合法收集的去标识化处理后的风险水平类、风险控制类、标签类信息，综合分析并提取您的兴趣偏好、消费及服务需求等特征，用于向您展示和推送我们、我们关联公司及合作伙伴提供产品或服务的信息。"},{kind:"h2",text:"（七）我们可能会将合法合规收集的用户个人信息（包括身份信息、设备信息、日志信息、网络信息、位置信息、操作记录、投保状态等）进行综合分析，根据您提供的联系方式或者与互联网流量平台、第三方广告发布平台合作，通过页面、网络客户端消息推送、短信、企微消息、电话或您同意的其他方式联系您，向您推荐我们、我们关联公司及合作伙伴提供的您可能感兴趣的产品或服务，以及向您发送营销活动通知、商业性电子信息以及提供与您相关的广告，进行相关产品的精准投放与营销触达。如您拒绝接受短信或电话联系，您可以根据短信或电话中的指引，退订我们的短信或要求拒绝通过电话联系。"},{kind:"h2",text:"（八）根据适用的法律法规，我们可能会对您与我们的沟通记录及相关内容（包括语音通话信息、您在使用客服服务时输入的文字对话信息）进行去标识化处理，在无法识别您身份的情况下，将其用于算法模型训练，为您提供智能问答对话客服服务或智能语音服务，但我们不会根据您的对话内容对您个人进行特定身份的识别。"},{kind:"h2",text:"（九）如果您通过我们的产品享有电话医生服务、健康体检服务、图文问诊服务或其他健康管理产品或服务，则我们需要向该等服务提供商提供上述服务所必要的个人信息，包括您的姓名、身份证件号码、手机号码、保单号及其它必要的保单信息（如保单状态、保单起始日期等）。我们收集该信息是为了帮助您完成实名认证，确保您可享受电话医生、健康体检等服务，防止欺诈或滥用他人身份享受服务。"},{kind:"h2",text:"（十）如果我们将信息用于本隐私政策未载明的其他用途，或者将基于特定目的收集而来的信息用于其他目的，我们会事先征求您的同意。我们可能在某些具体服务或功能项下，通过交互文案、产品界面或弹窗等方式向您单独告知处理个人信息的目的、方式或范围，若单独告知的内容与本隐私政策不一致的，以单独告知的内容为准。"},{kind:"li",text:"征得授权同意的例外"},{kind:"b",text:"根据相关法律法规规定，以下情形中收集和使用您的个人信息无需征得您的授权同意："},{kind:"li",text:"与我们履行法律法规规定的义务相关的；"},{kind:"li",text:"与国家安全、国防安全直接有关的；"},{kind:"li",text:"与公共安全、公共卫生、重大公共利益直接相关的。例如：为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"li",text:"与刑事侦查、起诉、审判和判决执行等直接有关的；"},{kind:"li",text:"出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到您本人同意的；"},{kind:"li",text:"为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理您的个人信息；"},{kind:"li",text:"所涉及的个人信息是您自行向社会公众公开的；"},{kind:"li",text:"根据您要求签订和履行合同所必需的；"},{kind:"li",text:"从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道；"},{kind:"li",text:"维护所提供的产品或服务的安全稳定运行所必需的，例如发现、处置产品或服务的故障；"},{kind:"li",text:"学术研究机构出于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的；"},{kind:"li",text:"法律、法规或国家标准规定的其他情形。"},{kind:"p",text:"请注意，经匿名化处理的、单独或与其它信息相结合无法识别您的身份或者与您直接建立联系的信息，不属于个人信息，我们对此类数据的处理将无需另行向您通知并征得您的同意。如果我们将单独无法与任何特定个人建立联系的信息与其它信息结合用于识别自然人个人身份，或者将其与个人信息结合使用，则在结合使用期间，此类信息将被视为个人信息，按照本隐私政策进行处理与保护。"},{kind:"li",text:"我们如何存储您的个人信息"},{kind:"p",text:"我们在中华人民共和国境内收集和产生的个人信息将存储在中华人民共和国境内。如涉及到跨境传输，我们会按照国家相关法律法规及相关标准的规定执行。"},{kind:"p",text:"我们只会在达成本隐私政策所述目的所需的期限内保留您的个人信息，除非法律有强制的留存要求。我们判断个人信息的存储期限主要参考以下标准并以其中较长者为准："},{kind:"li",text:"完成您同意使用的业务功能；"},{kind:"li",text:"保证我们为您提供服务的安全和质量；"},{kind:"li",text:"您同意的更长的留存期间；"},{kind:"li",text:"是否存在有关保留期限的其他特别约定。"},{kind:"p",text:"在超出保留期间后，我们会根据适用法律的要求删除您的个人信息，或使其匿名化处理。"},{kind:"p",text:"如我们停止运营蓝鲸保的产品或服务，我们将及时停止继续收集您个人信息的活动，并将以公告的形式进行停止运营通知。同时，对我们存储的个人信息进行删除或匿名化处理。"},{kind:"li",text:"我们如何共享、委托处理、转让、公开披露您的个人信息"},{kind:"li",text:"共享"},{kind:"p",text:"我们不会与任何公司、组织或个人共享您的个人信息，但以下情况除外（具体第三方信息情况请查看《与第三方共享个人信息清单》【请嵌入文件超链接后删除标黄文字】，主要包括以下情形）："},{kind:"li",text:"取得您同意的情况下共享：在获取您明示同意的情况下，我们会与其他方共享您的个人信息。"},{kind:"li",text:"履行法定义务所必需的共享：我们可能会根据法律法规规定、诉讼、争议解决需要，或按行政、司法机关依法提出的要求，以及其它法定义务履行的需要，共享必要的您的个人信息。"},{kind:"li",text:"为订立、履行您作为一方当事人的合同所必需的情况下的共享："},{kind:"p",text:"如您通过我们订购或获得保险或健康管理产品或服务，为缔结和履行保险或健康管理产品或服务合同，提供相关产品或服务，我们需要向健康服务公司、医疗机构、物流服务提供商、保险公司、保险中介机构，披露提供上述服务所必需的个人信息，例如您的身份信息、财产信息、健康信息、保单信息、投保过程（如录音录像、通话录音、投保轨迹等）、申请理赔、保全、退保及其它保单服务的信息。我们还可能与这些机构联合研发或优化保险或健康管理服务产品。您理解，在这种情况下这些产品或服务提供者构成独立的个人信息控制者，他们对您个人信息的收集、使用、存储及采取安全保护措施将受他们的隐私协议或服务条款约束，他们可能自行将您的个人信息用于提供产品或服务之外的其他目的。这些产品或服务提供者将对他们处理您个人信息的活动独立承担责任。"},{kind:"li",text:"在法律法规允许的范围内，为维护我们、我们的关联公司或合作伙伴、您或其他蓝鲸保用户或社会公众的合法利益，或者为了解决您与我们、保险机构或者其他服务机构之间产生的纠纷争议或投诉处理而有必要共享您的个人信息。"},{kind:"li",text:"为了配合合作保险机构履行法律法规的规定及行政/司法机关的要求，如实名制管理、反洗钱、反保险欺诈、保险可回溯管理等，我们可能需要将收集的信息（如投保人与被保险人身份信息、保险标的信息、投保过程信息（如录音录像、通话录音、投保轨迹等）及必要的风险信息等）向合作保险机构提供，或提交监管机构或其指定机构进行核验。"},{kind:"li",text:"与我们的关联公司共享。您可以通过统一的账号登录我们的其他产品或服务，这些服务可能是由我们的关联公司提供。为向您提供前述基于统一账号的产品或服务、防止欺诈与安全风险以及便于您进行统一账号管理，我们可能会将您的基础用户账号信息（如账号ID、头像、昵称、手机号码）、必要的身份信息（姓名、身份证件号码）等个人信息与我们的关联公司共享。但我们只会共享必要的个人信息，且关联公司对您个人信息的使用受本隐私政策，或经过您授权同意的且对您的个人信息提供与本隐私政策保护水平实质相同的关联公司隐私政策的约束（您可以在相关应用程序或我们的官方网站上查看相关产品适用的隐私政策）。我们和我们的关联公司均会严格遵守相应的个人信息及数据安全保护制度和政策。"},{kind:"li",text:"委托处理"},{kind:"p",text:"我们可能会委托第三方合作伙伴代我们处理个人信息，以便授权合作伙伴代表我们为您提供某些服务或履行职能。但我们仅会出于合法、正当、必要、明确的目的委托其处理您的个人信息，授权合作伙伴只能接触到其提供服务或履行职能所必要的个人信息。我们将会通过协议要求其不得将此信息用于其它任何超出委托范围的目的。除非您另行授权同意，我们的合作伙伴无权将您的个人信息用于任何其他我们未委托的用途。我们委托的合作伙伴包括以下类型："},{kind:"li",text:"供应商、服务提供商和其它合作伙伴。我们可能会将您的个人信息提供给支持我们提供服务的第三方服务提供商及合作伙伴。这些服务提供商、合作伙伴包括为我们提供基础设施技术服务、数据处理、核验、公估、信用审查、风控、质检、短信息服务、语音呼叫服务、客户服务、支付结算服务和完成交易所必须的快递服务或进行学术研究和调查等的机构。但我们要求这些服务提供商、合作伙伴只能出于为我们提供服务的目的使用您的信息，而不得出于其自身利益使用您的信息。"},{kind:"li",text:"广告、分析服务类的授权合作伙伴。经您授权，我们会与提供广告投放推广的服务提供商、统计分析服务提供商（例如应用流量监测服务提供商）或其他合作伙伴共享信息，但我们仅会向这些合作伙伴提供汇总后的信息、匿名化后的信息或者其他不会识别到您的个人身份的信息，不会分享您的任何身份信息、账号信息或其他可识别信息。例如，我们的产品中可能会嵌入第三方软件工具开发包（SDK），以统计用户使用应用程序的习惯或偏好，或点击访问广告的情况。我们会不时对该等合作伙伴进行技术检测和行为审计，以最大限度地确保其依法、依规、依约收集和使用数据。有关广告、分析类服务类第三方SDK的个人信息处理情况详见《接入第三方SDK目录》【请嵌入文件超链接后删除标黄文字】。"},{kind:"li",text:"转让"},{kind:"p",text:"我们不会将您的个人信息转让给其他任何公司、组织和个人，但以下情形除外："},{kind:"li",text:"事先获得您明确的同意或授权；"},{kind:"li",text:"根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；"},{kind:"li",text:"符合与您签署的相关协议（包括在线签署的电子协议以及相应的平台规则）或其他的法律文件约定所提供；"},{kind:"li",text:"随着我们公司业务的发展，我们及我们的关联公司有可能进行合并、收购、资产转让或其他类似的交易。如相关交易涉及到您的个人信息转让，我们会要求新持有您个人信息的公司、组织和个人继续受此政策约束，否则我们将要求该公司、组织和个人重新征得您的授权同意。"},{kind:"li",text:"公开披露"},{kind:"p",text:"我们仅会在以下情况，且采取符合业界标准的安全防护措施的前提下，才会公开披露您的个人信息："},{kind:"li",text:"根据您的需求，在您明确同意的披露方式下披露您所指定的个人信息；"},{kind:"li",text:"根据法律、法规的要求、强制性的行政执法或司法要求所必须提供您个人信息的情况下，我们可能会依据所要求的个人信息类型和披露方式公开披露您的个人信息。在符合法律法规的前提下，当我们收到上述披露信息的请求时，我们会要求必须出具与之相应的法律文件，如传票或核查函。我们坚信，对于要求我们提供的信息，应该在法律允许的范围内尽可能保持透明。我们对所有的请求都进行了慎重的审查，以确保其具备合法依据，且仅限于执法部门因特定核查目的且有合法权利获取的数据。"},{kind:"p",text:"请注意，您在使用我们服务时自愿发布甚至公开分享的信息，可能会涉及您或他人的个人信息甚至敏感个人信息，如您的交易信息，以及您在评价时选择上传包含个人信息的文字、图片或视频等各种形式的信息。请您在使用我们的服务时更加谨慎地考虑，是否要发布甚至公开分享相关信息。"},{kind:"li",text:"我们如何保护您的个人信息"},{kind:"p",text:"我们已采取符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。"},{kind:"li",text:"我们设置了专门的个人信息保护负责人，负责处理我们相关产品和服务可能涉及到用户个人信息的各项事务，以及规划和制定公司的隐私政策、审核各产品的用户使用协议、监督各产品的工作原理和信息处理机制等。"},{kind:"li",text:"我们进行了信息安全等级保护的定级测评，我们的信息系统被认定为符合信息安全等级保护第三等级（金融机构信息系统级别的保护）要求，并按照法律法规要求就定级报告向公安机关进行了备案。我们按照信息安全等级保护的要求制定了信息安全工作的总体方针和安全策略，建立了覆盖主机、数据、应用、管理等层面的安全管理制度，设立了专职部门负责信息安全管理工作，明确了安全管理机构内的各个部门和岗位的职责、分工和技能要求，制定了明确的人员录用和离职管理规范。"},{kind:"li",text:"我们会对可识别的敏感个人信息进行加密传输和存储，以确保数据的保密性。我们的应用系统提供了身份鉴别、用户标识唯一性检查、登录失败处理、基于角色的访问控制等功能，采用HTTPS安全协议进行通信，设置了最大并发会话连接数，能够对系统服务水平降低到预先规定的最小值进行检测和报警。我们在服务端部署访问控制机制，对可能接触到您个人信息的工作人员采取最小够用授权原则，并定期核查访问人员名单和访问记录。我们的服务器操作系统和数据库系统口令有复杂度要求，采用SSH安全协议进行远程管理，严格限制默认账号的访问权限，并修改了默认口令，审计记录全面并覆盖了所有用户。"},{kind:"li",text:"我们存储用户个人信息的服务器系统均为安全加固后的操作系统。我们会对服务器操作进行账号审计及监控。如果发现外部公告有安全问题的服务器操作系统，我们会在第一时间进行服务器安全升级，确保我们所有服务器系统及应用安全。"},{kind:"li",text:"我们为工作人员定期举办个人信息保护相关法律法规培训，以加强工作人员的用户个人隐私保护意识。"},{kind:"li",text:"我们制定了信息安全事件应急预案，并调配足够的资源保障确保应急预案的执行。我们每年对应急预案进行了培训和应急事件演练。如果我们的物理、技术或管理防护措施不幸遭到破坏，我们会及时启动应急预案，防止安全事件扩大，按照法律法规的要求上报国家主管机关，并及时采取推送、公告等合理、有效的方式向您告知安全事件的基本情况、可能的影响、已经采取的措施或将要采取的措施等。"},{kind:"li",text:"您管理个人信息的权利"},{kind:"p",text:"按照中国相关的法律、法规、标准，在您使用我们的产品或服务期间，您可以参考下述指引查询、复制、更正、删除您的个人信息，行使撤回同意以及注销账号的权利。另外，您可以通过本隐私政策第十节载明的方式与我们联系，您的意见会及时得到处理。"},{kind:"li",text:"查询、复制、更正、删除您的个人信息"},{kind:"p",text:"您可以通过本政策第十节提供的联系方式联系我们查询、复制、更正和删除您的个人信息。"},{kind:"p",text:"以下情况发生时，您可以通过本隐私政策提供的联系方式要求我们删除您的个人信息："},{kind:"li",text:"我们没有征求您的明确同意，收集了您的个人信息。"},{kind:"li",text:"我们处理您的个人信息违反了法律法规要求。"},{kind:"li",text:"我们违反了与您的约定来使用和处理您的个人信息。"},{kind:"li",text:"您注销了账号、卸载或者不再使用我们的产品或服务。"},{kind:"li",text:"我们停止对您提供服务。"},{kind:"p",text:"您可以通过本隐私政策第十节提供的方式联系我们要求删除您的个人信息，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。当我们从服务器中删除您的个人信息后，我们可能不会立即从备份系统中删除相应的数据，但会在备份更新的时候删除这些信息。"},{kind:"li",text:"改变或撤回您的授权或改变您授权同意的范围"},{kind:"p",text:"如果您想改变或撤回授予给我们的设备权限，您随时可通过以下方式改变或撤回："},{kind:"li",text:"您可以在您移动设备本身操作系统中的“设置”中关闭对应的权限改变同意范围或撤回您的授权。撤回授权后我们将不再使用该等权限。"},{kind:"li",text:"当您使用小程序时，您可以在小程序界面中管理小程序获得的应用权限，您可以撤回对小程序的应用权限授权。"},{kind:"li",text:"请您理解，每个业务功能需要一些必要的个人信息才能得以完成，当您撤回同意或授权后，我们将无法继续为您提供撤回同意或授权所对应的服务和功能，也不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"li",text:"获得解释的权利"},{kind:"p",text:"您有权要求我们就个人信息处理规则作出解释说明。您可以通过本隐私政策载明的联系方式与我们取得联系。"},{kind:"li",text:"注销您的账号"},{kind:"p",text:"在您通过我们的产品注册了我们账号的情况下，您可以通过本隐私政策第十节的联系方式联系我们注销您的账号，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。我们在此善意地提醒您，您注销账号的行为，将导致我们终止对您提供服务，也将会给您带来诸多不便。"},{kind:"li",text:"如果您经慎重考虑，确定注销您的账号，您的账号需同时满足以下条件："},{kind:"li",text:"账号处于安全状态，无异常行为记录，无被盗风险；"},{kind:"li",text:"账号相关财产权益已结清，无未完成或存在争议的订单和服务；"},{kind:"li",text:"自愿放弃账号中的资产和虚拟权益（包括但不限于账号余额、积分、会员权益等）；"},{kind:"li",text:"账号无任何未结纠纷，包括投诉举报或被投诉举报。"},{kind:"li",text:"账号一旦被注销将不可恢复，请您在操作之前自行备份本账号相关的所有信息和数据，确认与本账号相关的所有服务均已进行妥善处理。账号成功注销后，您将无法再使用本账号，也将无法找回您账号中及与账号相关的任何内容或信息，包括但不限于："},{kind:"li",text:"您将无法登录、使用本账号；"},{kind:"li",text:"本账号的个人资料和历史信息（包括但不限于用户名、头像、身份信息、订单信息等）都将无法查看、无法找回；"},{kind:"li",text:"您通过本账号进行登录的我们旗下产品或服务（包括但不限于蓝鲸保等）的所有记录将无法找回。您将无法再登录、使用前述服务，您曾获得的账号余额、积分、会员权益等视为您自行放弃，将无法继续使用。您理解并同意，我们无法协助您重新恢复前述服务。请您在提交注销申请前，务必先了解您须解绑的其他相关账号信息，具体可通过本隐私政策第十节提供的联系方式与我们联系。"},{kind:"p",text:"注销成功后，除法律法规要求我们保存相关信息的情况外，我们将删除您的个人信息，使其保持不可被检索、访问的状态或对其进行匿名化处理。您知晓并理解，注销账号并不代表注销前的账号行为和相关责任得到豁免或减轻。"},{kind:"li",text:"逝者近亲属相关权利"},{kind:"p",text:"若用户不幸身故，其近亲属为了自身的合法、正当利益，可以对用户的相关个人信息行使本条款规定的查阅、复制、更正、删除等相关权利；用户生前另有安排的除外。"},{kind:"li",text:"响应您的上述请求"},{kind:"p",text:"如果您选择删除个人信息或者注销个人账号，您可以通过本隐私政策第十节的联系方式联系我们，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。"},{kind:"b",text:"在以下情形中，按照法律法规要求，我们将无法响应您的请求："},{kind:"li",text:"与我们履行法律法规规定的义务相关的；"},{kind:"li",text:"与国家安全、国防安全直接相关的；"},{kind:"li",text:"与公共安全、公共卫生、重大公共利益直接相关的；"},{kind:"li",text:"与刑事侦查、起诉、审判和判决执行等直接相关的；"},{kind:"li",text:"有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"li",text:"出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到本人同意的;"},{kind:"li",text:"响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；"},{kind:"li",text:"涉及商业秘密的。"},{kind:"li",text:"未成年人个人信息保护"},{kind:"p",text:"我们非常重视未成年人个人信息的保护。我们的产品和服务主要面对成人。我们原则上不会主动从未成年人处收集未成年人的个人信息；如果没有父母或监护人的同意，未成年人不应注册和使用我们的服务。如您为未成年人，我们建议您请您的父母或监护人为您阅读本隐私政策，并在您提交个人信息之前征得父母或监护人的同意。若您是未成年人的监护人，当您对您所监护的未成年人的个人信息有疑问时，您可以通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"如果特定服务需要提供未成年人个人信息（例如父母或监护人为未成年子女投保时，需要提供未成年人的姓名、身份证号等个人信息），那么我们仅会在法律法规允许、父母或监护人同意并主动提交这些信息的情况下，收集这些信息。对于经父母或监护人同意使用我们的产品或服务而收集未成年人个人信息的情况，我们只会在法律法规允许、父母或监护人明确同意或者保护未成年人所必要的情况下使用、共享、转让或披露此信息。如果我们发现自己在未事先获得可证实的父母或法定监护人同意的情况下收集了未成年人的个人信息，则会在法律要求的情况下尽快删除相关数据。"},{kind:"b",text:"特别提示：我们为处理儿童（不满十四周岁的未成年人）个人信息制定了专门的《儿童个人信息保护政策》(请嵌入《儿童个人信息保护政策》超链接后删除标黄文字）。儿童及其监护人在使用蓝鲸保产品或服务之前，应仔细阅读我们专门制定的《儿童个人信息保护政策》。只有在取得监护人对《儿童个人信息保护政策》的同意后，儿童才能在监护人的指导下使用蓝鲸保产品或服务。"},{kind:"li",text:"隐私政策的适用范围、变更和修订"},{kind:"b",text:"如我们在本隐私政策序言部分所述，本隐私政策适用于蓝鲸保产品和服务。您可能通过蓝鲸保产品中的链接跳转至我们运营的其他产品或服务，这些产品或服务可能会通过其另行设置的隐私政策向您说明收集和使用您个人信息的情况并据此处理您的个人信息。我们的产品或服务均会按照与本隐私政策实质相同的标准对您的个人信息提供完善的保护。"},{kind:"b",text:"需要特别说明的是，本隐私政策不适用于其他第三方向您提供的服务。例如您通过蓝鲸保链接或购买的保险产品或健康服务产品。我们会在与这些第三方开展合作过程中尽最大努力督促其保护您的个人信息，但您理解这些服务由第三方独立向您提供，第三方将依照其隐私政策或用户协议单独对您的个人信息处理承担责任。"},{kind:"p",text:"我们的隐私政策可能变更。未经您明确同意，我们不会限制您按照本隐私政策所应享有的权利。"},{kind:"p",text:"对于本隐私政策的重大变更，我们还会提供显著的通知（例如，在软件改版或升级、或您重新登录时，以消息形式对您进行及时通知）。您亦可以通过蓝鲸保官方网站（https://www.hkinur.com/）随时查看最新版的隐私政策。"},{kind:"p",text:"本政策所指的重大变更包括但不限于："},{kind:"li",text:"我们的服务模式发生重大变化。如处理个人信息的目的、处理个人信息的类型、个人信息的使用方式等；"},{kind:"li",text:"我们在控制权等方面发生重大变化。如并购重组等引起的所有者变更等；"},{kind:"li",text:"个人信息共享、转让或公开披露的主要对象发生变化；"},{kind:"li",text:"您参与个人信息处理方面的权利及其行使方式发生重大变化；"},{kind:"li",text:"我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化时；"},{kind:"li",text:"个人信息安全影响评估报告表明存在高风险时。"},{kind:"li",text:"如何联系我们"},{kind:"p",text:"海客（天津）保险经纪有限公司为我们蓝鲸保的运营主体，注册地址为天津自贸试验区（东疆保税港区）亚洲路6865号金融贸易中心北区1-1-2403-4。如果您对我们的隐私政策及对您个人信息的处理有任何疑问、意见、建议或投诉，或就您个人信息的收集、使用、共享、查询、更正、删除等有任何要求、意见或建议，请拨打电话：4000161100，与我们取得联系。我们将尽快审核所涉问题，并在验证您的用户身份后15个工作日内予以回复。"},{kind:"p",text:"您理解，由于材料审核、业务核对、操作流程等原因，对您请求的处理完成时间可能会长于上述时限。如果您对我们的回复不满意，特别是我们的个人信息处理行为损害了您的合法权益，您还可以向网信、电信、公安及工商等监管部门进行投诉或举报；或向具有管辖权的法院提起诉讼。我们希望您在向政府或法院投诉或起诉前，可以与我们进行友好协商，欢迎并感谢您对我们的监督和建议。"},{kind:"li",text:"隐私政策的生效"},{kind:"p",text:"本隐私政策版本发布日期为2026年1月23日，将于2026年1月23日正式生效。"}]},lr={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年6月3日"},{kind:"p",text:"生效时间：2026年6月3日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一. 我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"h2",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"p",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息展示的服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、手机号、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，我们会从您的可信数据空间中获取您的【姓名、手机号、身份证号码前十四位】信息并提供给银联商务支付股份有限公司及相关使用方，并使用该信息为您完成H5场景下展示的服务。为保障您的数据安全，在向银联商务支付股份有限公司及相关使用方提供您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"h2",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"h2",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"h2",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"h2",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"h2",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给银联商务支付股份有限公司及相关使用方，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"p",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"p",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"h2",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"h1",text:"七、我们如何处理未成年人的个人信息"},{kind:"h2",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"h2",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"h2",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},fr={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[[{kind:"text",text:"合作方",colSpan:7}],["合作方名称","共享目的","共享场景","个人信息","提供方式","隐私政策或官网","联系方式"],["恒大保险经纪有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口",{kind:"doc-link",text:"《恒大保险经纪隐私政策》",docKey:"hengda-v2-privacy-policy"},"0769-33551837"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口",{kind:"doc-link",text:"《中国移动认证梧桐数盾隐私政策》",docKey:"hengda-v2-cmcc-privacy-policy"},"10086"]]}]},hr={title:"《恒大保险经纪隐私政策》",blocks:[{kind:"h1",text:"恒大保险经纪隐私政策"},{kind:"p",text:"【更新日期】2026年7月1日"},{kind:"p",text:"【生效日期】2026年7月1日"},{kind:"p",text:"【特别提示】尊敬的用户：感谢您的信任，为了帮助您了解我们对个人信息的处理和保护规则，我们特制定《隐私政策》（“隐私政策”）。请您仔细阅读本隐私政策尤其是粗体显示的内容。如您有任何疑问、意见或建议，您可通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"本隐私政策适用于恒大保险经纪有限公司及其关联公司（统称“恒大保险经纪”或“我们”）通过恒大保险经纪官方网站（https:// www.hengdainsurance.com）、基于Android（安卓）系统和iOS系统开发的“恒智汇”应用程序（APP）、及恒大保险经纪相关小程序、公众号、H5页面、网页以及随技术发展出现的新形态向您提供的产品和服务（统称“恒大保险经纪”）。为了更好地为您提供贴心的服务，您在使用我们的产品或服务时，我们可能会收集和使用您的相关信息。恒大保险经纪非常重视用户的隐私和个人信息保护，我们希望通过本隐私政策向您说明我们在您使用我们的产品或服务时如何收集、使用、保存、共享、转让和保护这些信息，以及我们为您提供的管理这些信息的方式。"},{kind:"p",text:"在本隐私政策中，个人信息，是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。敏感个人信息，是指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。我们将在本隐私政策中对个人信息以粗体进行显著标识。"},{kind:"p",text:"我们在此特别提醒您：我们致力于打造多样的产品和服务以满足您的需求。因我们向您提供的产品和服务种类众多，且不同用户选择使用的具体产品/服务范围存在差异，故收集使用的个人信息类型、范围会有所区别，请以具体的产品/服务功能为准。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一、 我们收集了哪些个人信息"},{kind:"h1",text:"二、 我们如何使用您的个人信息"},{kind:"h1",text:"三、 征得授权同意的例外"},{kind:"h1",text:"四、 我们如何存储您的个人信息"},{kind:"h1",text:"五、 我们如何共享、委托、转让、公开披露您的个人信息"},{kind:"h1",text:"六、 我们如何保护您的个人信息"},{kind:"h1",text:"七、 您管理个人信息的权利"},{kind:"h1",text:"八、 未成年人个人信息保护"},{kind:"h1",text:"九、 隐私政策的适用范围、变更和修订"},{kind:"h1",text:"十、 如何联系我们"},{kind:"h1",text:"一、我们收集了哪些个人信息"},{kind:"p",text:"在您使用恒大保险经纪服务过程中，我们将按照如下方式收集您在使用服务时主动提供或因您使用服务而产生的信息，用以向您提供下述服务、优化我们的服务并保障您的账号安全。由于恒大保险经纪产品和服务的形态较多，具体的服务类型和可能处理的个人信息以您使用的产品界面展示为准。"},{kind:"h2",text:"（一）账号注册、登录相关的个人信息"},{kind:"p",text:"当您注册、登录成为恒大保险经纪用户时，我们可能会收集您的手机号码以创建恒大保险经纪账号；当您选择授权使用第三方账号（如微信）登录时，我们会通过第三方获取您授权共享的第三方账号信息（包括微信昵称、微信头像）并收集您的手机号码进行账号绑定。收集这些信息是为了帮助您完成恒大保险经纪账号注册，保护您的账号安全。我们收集手机号码，是为了验证您的身份，满足相关法律法规的网络实名制要求。如果您拒绝提供这些信息，您可能无法正常注册恒大保险经纪账号，亦无法在我们的平台上购买保险产品。"},{kind:"p",text:"基于我们与通信运营商的合作，当您使用一键登录功能时，经过您的同意，我们会使用运营商提供的功能，将您设备中的手机号码作为您的注册、登录账号并免于密码或动态验证码核验，为您提供快捷的注册、登录服务。"},{kind:"h2",text:"（二）为您提供保险服务基本功能相关的个人信息"},{kind:"p",text:"1. 投保"},{kind:"p",text:"当您购买保险产品投保时，我们将收集您的投保信息，以便帮助您与保险公司签订保险单，完成投保，这些信息包括投保人的姓名、身份证件信息、手机号码、社保状态（有无）、住址、邮箱，被保险人的姓名、性别、与投保人关系、身份证件号码、联系方式、健康状况、职业，受益人的姓名、受益比例，保险订单信息及其他投保所需的必要信息（以您在投保时相关产品界面所要求提供的信息字段为准）。除上述基本信息，我们还可能获取您的保险标的相关信息，例如您通过我们购买机动车保险时，我们需要您提供车辆行驶证信息、车牌号、车架号、投保地区及其它必要信息。根据法律法规及监管规定，我们将完整记录和保存投保的主要业务过程，包括在您拨打或接听保险客服顾问电话时，我们将会对电话通话过程全程录音，或者按照监管要求对投保过程进行同步录音录像或投保轨迹记录和保存。"},{kind:"p",text:"您可以通过恒大保险经纪为其他人投保保险产品，您向恒大保险经纪提供该实际被保险人的前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法为您订购保险产品并办理投保手续，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"2. 保险理赔"},{kind:"p",text:"当您通过我们申请理赔时，基于法律法规等要求，我们可能收集您申请理赔时所需的相关信息，包括被保险人或者受益人的姓名或者名称、联系方式、有效身份证件信息、出险描述、所在医院、职业、银行卡信息、诊断证明、病历信息、就诊费用信息、保险标的信息、在线沟通记录和电话记录及必要的风险信息。在报案人并非被保险人的情况下，我们还将收集报案人姓名、电话、投保信息、与被保险人的关系、在线沟通记录和电话记录，您向恒大保险经纪提供该实际被保险人的前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法协助您向保险公司申请保险理赔，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"3. 保险合同变更、退保"},{kind:"p",text:"当您通过我们进行保险合同变更、退保时，我们还将收集您主动提供或上传的信息，包括保单号、投保人电话、被保人的姓名、身份证号码、身份证照片、保全申请事由信息、退保申请事由信息、银行账户信息。在涉及您的父母、配偶或子女的情况下，我们会向您收集您的父母、配偶、或子女的相应上述个人信息。您向恒大保险经纪提供前述个人信息之前，您需确保您已经取得其授权同意。如果您拒绝提供这些信息，我们无法向您提供合同变更、退保等服务，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"根据法律法规及监管规定，当您通过我们投保成功，或使用我们提供的协助理赔、协助保全、协助退保、保单查询功能时，由于保险单实际是由为您承保的保险公司提供，因此我们需要从为您承保的保险公司获取您的保险单信息，以便为您提供上述服务。"},{kind:"p",text:"4. 资格核验、风险控制及适当性管理"},{kind:"p",text:"在向您提供各项保险服务过程中，我们可能会向第三方核验调查您是否具备相应的资格或符合法定的条件。在这种情况下，我们可能会收集您留存在我们关联公司、与我们合作的保险公司处的个人信息，我们还可能向行政机关、司法机关、征信机构、医疗机构、保险公估公司、健康服务机构、背景调查公司、信息技术服务机构、电信运营商（或其授权的服务商）以及其他合法了解掌握相关信息的自然人和法人收集或查询相关信息。您同意我们向上述机构收集、查询、使用您的身份、医疗、财产、信用、风险水平、健康状况相关信息以核验您的身份信息的真实性以及是否具有相应的资格或符合法定的条件，防范欺诈等违法活动和减少信用风险。"},{kind:"p",text:"基于账户安全管理、风险控制、防范保险欺诈、消费者适当性管理等原因，我们可能从行政机关、司法机关及我们的合作机构、关联公司等第三方获取去标识化处理后的风险水平类、账户安全类、风控类信息，用于提供风险控制、保险反欺诈、反黑灰产、产品推荐、投保交易风控、智能协助理赔等服务，保障您的账户安全、信息安全及满足法律法规要求。"},{kind:"p",text:"5. 依据法律法规及监管规定履行法定义务"},{kind:"p",text:"根据互联网及金融监管等要求，我们需履行法定义务，如：保险交易可回溯管理义务、实名制管理义务、反洗钱反恐怖融资义务（客户身份识别、客户身份资料和交易记录保存、尽职调查、严格保密等）等。这些法定义务要求我们向您收集您的个人身份信息、电话录音、录音录像、投保轨迹等，其中“身份信息”包括您的姓名、性别、国籍、职业、住所地（或经常居住地）或者工作单位地址、联系方式、身份证件或者身份证明文件的种类、号码和有效期限。“投保轨迹”包括相关交易信息、保单信息、账户信息。如您拒绝提供上述信息，则可能无法使用与监管要求相关的部分服务，但不影响您使用我们提供的其他服务。您知晓并同意，根据您所需的保险产品和服务的不同以及监管机构的要求，我们所收集的信息类型以具体产品或服务申请页面为准。"},{kind:"h2",text:"（三）与改善和优化服务及保障账号安全相关的个人信息"},{kind:"p",text:"为了保障用户的账号安全、交易安全、系统运行安全，满足法律法规和我们协议规则的相关要求，以及不断地改进我们的产品，在您使用我们的产品和服务时，我们需要收集相关的设备信息与日志信息。设备信息包括与您使用设备的软硬件特征和设备环境信息相关的信息，例如IMEI、Android ID、OAID、IDFA、IMSI、网络设备地址（MAC）、BSSID、iccid、设备型号、设备名称、系统版本号、任务列表、设备应用安装列表、手机制造商、运营商名称；日志信息包括IP地址、访问的浏览器信息、点击和浏览我们产品和服务功能或页面的URL地址及其使用情况与频率、应用崩溃情况、总体安装使用情况、性能数据、应用来源。如果您需要使用微信分享功能，我们将使用您的剪切板信息，以确保功能正常使用。"},{kind:"h2",text:"（四）与信息推送、搜索和展示有关的个人信息"},{kind:"p",text:"我们可能收集和使用包括IMEI、Android ID、OAID、IDFA、网络设备地址（MAC）、IMSI、BSSID、MEID、设备型号、设备名称、系统版本号、设备应用安装列表、手机制造商在内的与您使用设备的软硬件特征和设备环境信息相关的信息，用于向您推送信息和内容，该等信息展示与推送可能使用第三方服务。您有权按照本隐私政策第七节“您管理个人信息的权利”指引的撤回同意的方式关闭该等信息推送，在您关闭后，您的设备将不再收到我们的推送信息，关闭信息推送不会影响您使用其他服务。"},{kind:"p",text:"当您使用搜索功能时，我们会自动收集您输入的关键字信息和搜索记录。如果您拒绝提供上述信息，您无法享受搜索服务，但不影响您使用我们提供的其他功能。"},{kind:"h2",text:"（五）为您提供客服和售后服务有关的个人信息"},{kind:"p",text:"在您使用我们产品或服务的过程中，如果您有任何疑问、意见或建议，您可以通过在线客服、发送邮件或拨打电话与我们取得联系，我们将可能收集您的账号信息、电话录音、在线沟通记录、您与客服人员的对话信息（其中可能包括您主动提供的个人信息）。如果您参与问卷调查，我们还将收集您在问卷中向我们提供的信息。为了保证服务体验、改善服务品质，您与客服的通话信息可能会被录音。当您在保险服务过程中出现服务投诉或纠纷时，我们可依法调取并使用录音信息作为解决纠纷的参考依据。"},{kind:"p",text:"当您需要我们提供与保单相关的客户服务时，我们可能会查询您的相关交易信息以便向您提供适当的服务。当您需要客服协助您修改有关信息（如地址、联系方式等）时，您可能还需要提供相应的信息以完成修改。您知悉并同意，如果我们的客服人员无法立刻解决您的问题，我们可能在核实情况后，通过您主动提供的联系方式与您取得联系、解答您的问题、回应您的诉求。"},{kind:"h2",text:"（六）支付订单的个人信息"},{kind:"p",text:"您通过恒大保险经纪支付订单时，可以选择我们合作的银行和第三方支付机构（如支付宝、微信支付等合作方）所提供的服务进行支付。我们需要收集您的订单信息、对账信息及其他法律要求的必要信息并与这些合作机构共享，以确认您的支付指令并帮助您完成支付。同时，为了帮助您实现基于银行卡支付的功能，您授权并同意，我们收集您的姓名、身份证号、银行卡号、银行卡预留手机号、发卡行、卡类型等银行卡信息，以便于将您的银行卡与您的账户进行绑定。我们会将该等信息通过我们的第三方合作支付机构向发卡银行进行验证。在您使用支付服务时，我们还需要记录、收集您的交易信息。您授权我们在向您提供支付服务时可以向必要的第三方合作支付机构提供前述支付必要信息，以确认您的支付指令并帮助您完成支付。"},{kind:"h2",text:"（七）扩展业务、增值服务相关的个人信息"},{kind:"p",text:"恒大保险经纪可能会提供保险产品或服务相关扩展业务、增值服务，具体包括以下内容："},{kind:"p",text:"1. 选择保险方案"},{kind:"p",text:"为向您提供“免费领取保险方案”功能，您需要向我们提供您的年龄、投保金额、您的姓名、您的电话，以根据您提供的信息测算适合您的保险方案，并向您发送测算结果。如果您拒绝提供这些信息，我们无法为您提供“免费领取保险方案”功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"为向您提供“保险定制”功能，您需要向我们提供您的手机号、年龄、个人月收入区间、家庭成员、家庭年收入。如果您拒绝提供这些信息，我们无法为您提供“保险定制”功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"2. 保费计算"},{kind:"p",text:"在您投保过程中，为方便您计算保费，我们还向您提供“算一算保费”功能。您需要向我们提供您的生日、投保份数、保障期限、交费方式、性别。如果您拒绝提供这些信息，我们无法为您提供“算一算保费”功能，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"3. 邮寄纸质保单或发送电子保单"},{kind:"p",text:"如果您选择由恒大保险经纪为您提供邮寄纸质保单服务，您需要提供收件人的姓名、手机号码、收货地址及您需要备注的其他信息，以便于您的保单能够安全准确送达并完成。如收件人不是您本人，请您知悉收件人可能接收到包括保单在内的上述信息，并确认收件人已经获得了接收这些信息的授权同意。同时，您已就向我们提供收件人的相关信息取得收件人的授权同意。如果您选择由恒大保险经纪向您发送电子保单，需要您提供接受电子保单的邮箱地址。如果您拒绝提供收件人信息或邮箱地址，我们无法向您发送保单，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"4. 视频播放/直播功能"},{kind:"p",text:"当您使用视频播放/直播功能，我们会收集您的设备信息及日志信息。除“改善和优化服务及保障账号安全”功能部分提到的日志信息外，我们还将收集您的播放时间、软件版本型号、您的浏览记录、播放记录、播放时长、访问日期和时间、收藏/关注/订阅/阅读记录。如果您拒绝提供上述信息，您无法享受视频播放/直播服务，但不影响您使用我们提供的其他功能。"},{kind:"p",text:"5. 点赞、评价、信息公开发布功能相关的个人信息"},{kind:"p",text:"当您在首页视频、“恒智汇”点赞、评价您感兴趣的保险知识视频、推文，我们需要收集您的点赞、评价记录。"},{kind:"p",text:"如您在恒大保险经纪相关页面公开发表评价、发布图文等，我们将收集您发布的信息并在商品评价等公共页面向所有用户公开展示您的昵称、头像、您账户发布的内容等。请注意，您公开发布的信息中可能会涉及您或他人的个人信息甚至敏感个人信息，如您在评价时选择上传包含个人信息的图片，请您更加谨慎地考虑，是否在使用我们的服务时共享甚至公开分享相关信息。若您公开发布的信息中涉及他人个人信息的，您需在发布前征得他人的同意。如您选择以匿名方式发布评价信息时，我们将不展示您的昵称、头像。如我们在其它产品功能中使用您发表的评论，我们将通过去标识化的方式展示，确保您的个人信息安全。"},{kind:"p",text:"以上增值服务均为扩展业务功能服务，我们会在符合法律规定的情况下收集并使用您主动提供或因您使用服务而产生的信息。您可以拒绝提供或收集相关信息，但不影响您使用我们提供的基本功能及其它服务。"},{kind:"h2",text:"（八）使用 Cookie 和同类技术收集的信息"},{kind:"p",text:"为确保我们网站正常运转、为您获得更轻松的访问体验，我们会在您的计算机或移动设备上放置安全的Cookie及相关技术（统称“Cookie”）收集信息。Cookie是您浏览网页时，网站服务器放在客户端（您的计算机、移动电话或其他智能终端）里面的一个小小的文本文件，存储了一些与用户访问网站有关的信息。Cookie可帮助我们："},{kind:"p",text:"1. 按照您所希望的服务样式、外观设置为您提供服务；"},{kind:"p",text:"2. 保障数据和服务的安全性，排查针对我们的产品和服务的作弊、黑客、欺诈行为；"},{kind:"p",text:"3. 避免不必要的服务器负载，提高服务效率，节省资源、能源；"},{kind:"p",text:"4. 了解您使用我们服务的方式，以求改善我们的产品和服务的用户体验，为新产品或功能的研发提供参考数据。"},{kind:"p",text:"如果您的浏览器或浏览器附加服务允许，您可修改对Cookie的接受程度或拒绝我们的Cookie。但如果您这么做，在某些情况下可能会影响您安全访问我们的网站，且可能需要在每一次访问我们的网站时更改用户设置。"},{kind:"h2",text:"（九）通过获取权限收集的信息"},{kind:"b",text:"为实现相关业务功能，我们需要调用以下权限并收集您的信息："},{kind:"p",text:"1. 为便于您在客服聊天或其它场景中上传图片和视频及日志缓存，我们会对用户拍摄的照片和视频进行存储。因此，当您主动上传时，如果您使用的是Android系统，我们会在获得您的自主选择同意后，获取您的外部存储的读取和写入权限。如果您使用的是iOS系统，我们将获取您的照片权限，用于写入和读取您的相册信息。拒绝提供该权限会使您无法使用上述功能，但不影响您正常使用我们其他功能。您可以随时通过APP-我的-个人中心-权限管理或在手机系统设置中关闭该授权；"},{kind:"p",text:"2. 为了保障您的账号及交易安全、统计我们产品的用户数量、分析产品的使用状况以不断改进我们的产品以及向您推荐您可能感兴趣的产品和服务，当您首次使用我们的产品和服务时，我们会在获得您的自主选择同意后，获取您的登录状态，收集您使用设备的设备唯一标识信息。拒绝提供该权限会使您无法使用上述功能，但不影响您正常使用我们其他功能。您可以随时在手机系统设置中关闭该授权；"},{kind:"p",text:"3. 为向您发送消息和通知，帮助您更及时地了解我们的服务动态，当您首次使用我们的产品和服务时，我们会在获得您的自主选择同意后，获取您的推送信息权限（通知权限），向您推送保单状态信息等服务消息。拒绝提供该权限会使您无法收到我们的信息推送，但不影响您正常使用我们其他功能。您可以随时在手机系统设置中关闭该授权；"},{kind:"p",text:"4. 当您使用我们的拍摄功能时，例如拍摄照片、视频，用于客服聊天或其它场景中上传图片和视频，我们会在获得您的自主选择同意后，获取您的相机（拍摄）权限。拒绝提供该权限会使您无法使用上述功能，但不影响您正常使用我们其他功能。您可以随时在手机系统设置中关闭该授权。"},{kind:"h2",text:"（十）第三方SDK的使用情况"},{kind:"p",text:"在某些特定业务场景下，为了保障本服务的稳定运行、功能实现，使您能够使用和享受更多的服务及功能，我们的应用中会嵌入第三方的SDK或其他类似的应用程序（简称SDK）来为您提供服务。"},{kind:"p",text:"此处查看我们产品中接入的第三方SDK目录，以了解可能获得您信息的第三方SDK、相关服务提供方身份、其通过恒大保险经纪收集或获取的您的个人信息范围以及使用目的。我们会不时对该等合作伙伴或服务提供商进行技术检测和行为审计，并要求其遵循合作法律协议，以最大限度地确保其依法、依规、依约收集和使用数据。"},{kind:"b",text:"请您注意，尽管我们会通过合同和技术手段要求该等第三方严格保护您的个人信息，但该等第三方将依据其个人信息保护政策对您的个人信息独立承担保护责任。"},{kind:"b",text:"数据保护方式：1、采用SSL协议加密及HTTPS传输加密技术保障安全；2、采取加密、去标识化等安全措施脱敏处理。"},{kind:"table",rows:[["SDK名称","使用目的","收集数据类型","隐私政策/官网链接"],["阿里实人认证","认证环节，入司识别","姓名、身份证号、人脸信息设备信息，包括Android ID、OAID、IDFA、BSSID、SSID、IMEI、IMSI、MAC、SN。","https://terms.aliyun.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud202111292014_72878.html"],["腾讯云实人认证","认证环节，入司识别","姓名、身份证号、人脸信息设备信息，包括Android ID、OAID、IDFA、BSSID、SSID、IMEI、IMSI、MAC、SN。","https://cloud.tencent.com/document/product/301/11470"],["极光推送","推送服务","设备信息（IMEI/MAC/Android ID/IDFA/OAID/UAID/OpenUDID/GUID/SIM卡IMSI信息等）网络信息与位置信息（IP地址，WiFi信息，基站信息等相关信息）APP安装列表信息","https://www.jiguang.cn/license/privacy"],["欧畅视点播、直播","学吧视频、音频、直播","恒智汇用户ID","https://www.occloud.net/"],["友盟社会化分享","微信登录，社交平台分享","设备信息（IMEI/MAC/Android ID/IDFA/OpenUDID/GUID/SIM卡IMSI/IP/地理位置）","https://www.umeng.com/page/policy"],["微信开放平台","微信支付","硬件设备型号、终端系统类型、设备识别码、使用的软件版本信息、软件语言设置信息、IP地址、所在的地区、移动网络信息、标准网络日志数据和网络使用习惯以及您使用财付通服务的操作记录","https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/RYiYJkLOrQwu0nb8#__section1"],["百度IDL人脸识别采集","认证环节，入司识别","姓名、身份证号、人脸信息设备信息，包括Android ID、OAID、IDFA、BSSID、SSID、IMEI、IMSI、MAC、SN。","https://ai.baidu.com/ai-doc/REFERENCE/Vkdygjliz"],["Vivo推送","消息推送","设备信息（IMEI/MAC/Android ID/IDFA/OAID/UAID/OpenUDID/GUID/SIM卡IMSI信息等）网络信息与位置信息（IP地址，WiFi信息，基站信息等相关信息）APP安装列表信息","https://dev.vivo.com.cn/documentCenter/doc/359"],["华为推送","消息推送","设备信息（IMEI/MAC/Android ID/IDFA/OAID/UAID/OpenUDID/GUID/SIM卡IMSI信息等）网络信息与位置信息（IP地址，WiFi信息，基站信息等相关信息）APP安装列表信息","https://developer.huawei.com/consumer/cn/doc/development/HMSCore-Guides/sdk-data-security-0000001050042177"],["小米推送","消息推送","设备信息（IMEI/MAC/Android ID/IDFA/OAID/UAID/OpenUDID/GUID/SIM卡IMSI信息等）网络信息与位置信息（IP地址，WiFi信息，基站信息等相关信息）APP安装列表信息","https://dev.mi.com/distribute/doc/details?pId=1534"],["OPPO推送","消息推送","设备信息（IMEI/MAC/Android ID/IDFA/OAID/UAID/OpenUDID/GUID/SIM卡IMSI信息等）网络信息与位置信息（IP地址，WiFi信息，基站信息等相关信息）APP安装列表信息","https://open.oppomobile.com/new/developmentDoc/info?id=10288"]]},{kind:"h1",text:"二、我们如何使用您的个人信息"},{kind:"h2",text:"（一）使用您的相关个人信息，用以实现本隐私政策第一部分所列产品和服务的功能。"},{kind:"h2",text:"（二）为提供投保服务、理赔、合同变更、退保服务之目的，将会有调查公司、公估公司等提供调查服务。此等服务提供商可能会利用您提供的或根据本隐私政策所合法收集的信息，核验并确定您是否具有相应资格及是否符合法定的条件，防止欺诈等违法活动和减少信用风险。"},{kind:"h2",text:"（三）我们可能采取去标识化等方式将在业务中收集的您的个人信息以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息进行综合研究、统计分析和预测，以统计产品的用户数量、分析产品的使用状况、排查产品崩溃原因、减少崩溃的情况，改善我们的产品和服务的设计和功能，优化用户体验或进行学术研究、科学研究。"},{kind:"h2",text:"（四）为保证服务得以完成或向您提供您可能需要的服务，我们还可能根据您提供的联系方式对您进行必要的电话回访或短信通知，包括但不限于验证码、保单生效通知等。"},{kind:"h2",text:"（五）为提高您使用我们及我们关联公司、合作伙伴提供服务的安全性，保护您或其他用户或公众的人身财产安全免遭侵害，更好地预防钓鱼网站、欺诈、网络漏洞、计算机病毒、网络攻击、网络侵入等安全风险，更准确地识别违反法律法规或恒大保险经纪相关协议规则的情况，我们可能会使用或整合您的个人信息，如账号信息、设备信息、服务日志信息、应用程序使用信息等以及我们关联公司、合作伙伴取得您授权或依据法律共享的信息。为了依法维护您或我们的合法权益，我们可能使用上述信息解决您与恒大保险经纪、保险机构或者其他服务机构之间产生的违约纠纷或投诉。"},{kind:"h2",text:"（六）为了解您的保险需求及风险水平是否与保险产品相匹配，满足消费者适当性管理的要求、向您推荐保险产品、健康产品及其他您可能感兴趣的产品或服务。"},{kind:"b",text:"我们还可能会根据您提供的联系方式，通过短信或电话或您同意的其他方式联系您，向您推荐我们、我们关联公司及合作伙伴提供的您可能感兴趣的产品或服务，以及向您发送营销活动通知、商业性电子信息、提供与您相关的广告。如您拒绝接受短信或电话联系，您可以根据短信或电话中的指引，退订我们的短信或要求拒绝通过电话联系。"},{kind:"h2",text:"（七）为及时向您推荐符合您需求的保险或健康产品服务，提升您的保险服务体验，与我们有合作关系的保险中介机构可能会通过我们平台联系您，向您提供回访咨询、产品咨询或推荐符合您需求的保险或健康产品或服务。该等第三方合作伙伴仅可以通过我们提供的虚拟号码与您进行联系，非必要情形下，我们不会向这些合作伙伴提供您的身份信息或其它可识别到您的个人身份的信息，确保您的个人信息安全。同时，我们将努力通过采取“号码保护”、“保单信息去标识化”等合理的举措尽全力保护您的个人信息安全。如您拒绝接受此等服务，您有权根据电话中的指引，要求拒绝通过电话联系提供服务。"},{kind:"h2",text:"（八）您知悉并理解，恒大保险经纪平台上的部分业务（尤其是保险服务）是由我们的合作伙伴提供的，如果您最终选择通过恒大保险经纪平台使用该等合作伙伴以其独立名义提供的相关服务，则我们将根据您的授权同意向其提供您的必要个人信息以缔结和履行相关产品或服务合同（详见本隐私政策第五节关于您个人信息的共享）。"},{kind:"h2",text:"（九）根据适用的法律法规，我们可能会对您与我们的沟通记录及相关内容（包括语音通话信息、您在使用客服服务时输入的文字对话信息）进行去标识化处理，在无法识别您身份的情况下，将其用于算法模型训练，为您提供智能问答对话客服服务或智能语音服务，但我们不会根据您的对话内容对您个人进行特定身份的识别。"},{kind:"h2",text:"（十）如果我们将信息用于本隐私政策未载明的其他用途，或者将基于特定目的收集而来的信息用于其他目的，我们会事先征求您的同意。我们可能在某些具体服务或功能项下，通过交互文案、产品界面或弹窗等方式向您单独告知处理个人信息的目的、方式或范围，若单独告知的内容与本隐私政策不一致的，以单独告知的内容为准。"},{kind:"h1",text:"三、征得授权同意的例外"},{kind:"b",text:"根据相关法律法规规定，以下情形中收集和使用您的个人信息无需征得您的授权同意："},{kind:"p",text:"1. 与我们履行法律法规规定的义务相关的；"},{kind:"p",text:"2. 与国家安全、国防安全直接有关的；"},{kind:"p",text:"3. 与公共安全、公共卫生、重大公共利益直接相关的。例如：为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"p",text:"4. 与刑事侦查、起诉、审判和判决执行等直接有关的；"},{kind:"p",text:"5. 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到您本人同意的；"},{kind:"p",text:"6. 为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理您的个人信息；"},{kind:"p",text:"7. 所涉及的个人信息是您自行向社会公众公开的；"},{kind:"p",text:"8. 根据您要求签订和履行合同所必需的；"},{kind:"p",text:"9. 从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道；"},{kind:"p",text:"10. 维护所提供的产品或服务的安全稳定运行所必需的，例如发现、处置产品或服务的故障；"},{kind:"p",text:"11. 学术研究机构出于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的；"},{kind:"p",text:"12. 法律、法规或国家标准规定的其他情形。"},{kind:"p",text:"请注意，经匿名化处理的、单独或与其它信息相结合无法识别您的身份或者与您直接建立联系的信息，不属于个人信息，我们对此类数据的处理将无需另行向您通知并征得您的同意。如果我们将单独无法与任何特定个人建立联系的信息与其它信息结合用于识别自然人个人身份，或者将其与个人信息结合使用，则在结合使用期间，此类信息将被视为个人信息，按照本隐私政策进行处理与保护。"},{kind:"h1",text:"四、我们如何存储您的个人信息"},{kind:"p",text:"我们在中华人民共和国境内收集和产生的个人信息将存储在中华人民共和国境内。如涉及到跨境传输，我们会按照国家相关法律法规及相关标准的规定执行。"},{kind:"p",text:"我们只会在达成本隐私政策所述目的所需的期限内保留您的个人信息，除非法律有强制的留存要求。我们判断个人信息的存储期限主要参考以下标准并以其中较长者为准："},{kind:"p",text:"1. 完成您同意使用的业务功能；"},{kind:"p",text:"2. 保证我们为您提供服务的安全和质量；"},{kind:"p",text:"3. 您同意的更长的留存期间；"},{kind:"p",text:"4. 是否存在有关保留期限的其他特别约定。"},{kind:"p",text:"在超出保留期间后，我们会根据适用法律的要求删除您的个人信息，或使其匿名化处理。"},{kind:"p",text:"如我们停止运营恒大保险经纪的产品或服务，我们将及时停止继续收集您个人信息的活动，并将以公告的形式进行停止运营通知。同时，对我们存储的个人信息进行删除或匿名化处理。"},{kind:"h1",text:"五、我们如何共享、委托、转让、公开披露您的个人信息"},{kind:"h2",text:"（一） 共享"},{kind:"p",text:"我们不会与任何公司、组织或个人共享您的个人信息，但以下情况除外（主要包括以下情形）："},{kind:"p",text:"1. 取得您同意的情况下共享：在获取您明示同意的情况下，我们会与其他方共享您的个人信息。"},{kind:"p",text:"2. 履行法定义务所必需的共享：我们可能会根据法律法规规定、诉讼、争议解决需要，或按行政、司法机关依法提出的要求，以及其它法定义务履行的需要，共享必要的您的个人信息。"},{kind:"p",text:"3. 为订立、履行您作为一方当事人的合同所必需的情况下的共享："},{kind:"p",text:"如您通过我们订购或获得保险或健康产品或服务，为缔结和履行保险或健康产品或服务合同，提供相关产品或服务，我们需要向健康服务公司、医疗机构、物流服务供应商、保险公司、保险中介机构，披露提供上述服务所必需的个人信息，例如您的身份信息、财产信息、健康信息、保单信息、投保过程（如录音录像、通话录音、投保轨迹等）、申请理赔、保全、退保及其它保单服务的信息。我们还可能与这些机构联合研发或优化保险或健康服务产品。您理解，在这种情况下这些产品或服务提供者构成独立的个人信息控制者，他们对您个人信息的收集、使用、存储及采取安全保护措施将受他们的隐私协议或服务条款约束，他们可能自行将您的个人信息用于提供产品或服务之外的其他目的。这些产品或服务提供者将对他们处理您个人信息的活动独立承担责任。"},{kind:"p",text:"4.  在法律法规允许的范围内，为维护我们、我们的关联公司或合作伙伴、您或其他恒大保险经纪用户或社会公众的合法利益，或者为了解决您与恒大保险经纪、保险机构或者其他服务机构之间产生的纠纷争议或投诉处理而有必要共享您的个人信息。"},{kind:"p",text:"5. 为了配合合作保险机构履行法律法规的规定及行政/司法机关的要求，如实名制管理、反洗钱、反保险欺诈、保险可回溯管理等，我们可能需要将收集的信息（如投保人与被保险人身份信息、保险标的信息、投保过程信息（如录音录像、通话录音、投保轨迹等）及必要的风险信息等）向合作保险机构提供，或提交监管机构或其指定机构进行核验。"},{kind:"p",text:"6. 与我们的关联公司共享。您可以通过统一的恒大保险经纪账号登录恒大保险经纪的其他产品或服务，这些服务可能是由我们的关联公司提供。为向您提供前述基于恒大保险经纪统一账号的产品或服务、防止欺诈与安全风险以及便于您进行统一账号管理，我们可能会将您的个人信息与我们的关联公司共享。但我们只会共享必要的个人信息，且关联公司对您个人信息的使用受本隐私政策，或经过您授权同意的且对您的个人信息提供与本隐私政策保护水平实质相同的关联公司隐私政策的约束（您可以在相关应用程序或我们的官方网站上查看恒大保险经纪旗下相关产品适用的隐私政策）。我们和我们的关联公司均会严格遵守恒大保险经纪的个人信息及数据安全保护制度和政策。"},{kind:"h2",text:"（二） 委托处理"},{kind:"p",text:"我们可能会委托第三方合作伙伴代我们处理个人信息，以便授权合作伙伴代表我们为您提供某些服务或履行职能。但我们仅会出于合法、正当、必要、明确的目的委托其处理您的个人信息，授权合作伙伴只能接触到其提供服务或履行职能所必要的个人信息。我们将会通过协议要求其不得将此信息用于其它任何超出委托范围的目的。除非您另行授权同意，我们的合作伙伴无权将您的个人信息用于任何其他我们未委托的用途。我们委托的合作伙伴包括以下类型："},{kind:"p",text:"1. 保险或健康产品或服务提供者及其代理人。为向您推荐符合您需求的保险或健康产品服务，我们可能会委托与我们有合作关系的保险中介机构通过我们的平台联系您向您提供回访咨询、产品咨询或推荐您可能感兴趣的产品或服务。在这种情况下，该等第三方合作伙伴仅可以通过我们提供的虚拟号码联系您，非必要情形下，我们不会向这些合作伙伴提供您的身份信息或其它可识别到您的个人身份的信息，确保您的个人信息安全。我们将努力通过采取“号码保护”、 “保单信息去标识化”等合理的举措尽全力保护您的个人信息安全。"},{kind:"p",text:"2. 供应商、服务提供商和其它合作伙伴。我们可能会将您的个人信息提供给支持我们提供服务的第三方服务提供商及合作伙伴。这些服务提供商、合作伙伴包括为我们提供基础设施技术服务、数据处理、核验、公估、信用审查、风控和客户服务、支付服务、完成交易所必须的快递服务或进行学术研究和调查等的机构。但我们要求这些服务提供商、合作伙伴只能出于为我们提供服务的目的使用您的信息，而不得出于其自身利益使用您的信息。"},{kind:"p",text:"3. 广告、分析服务类的授权合作伙伴。经您授权，我们会与提供广告投放推广的服务提供商、统计分析服务提供商（例如应用流量监测服务提供商）或其他合作伙伴共享信息，但我们仅会向这些合作伙伴提供汇总后的信息、匿名化后的信息或者其他不会识别到您的个人身份的信息，不会分享您的任何身份信息、账号信息或其他可识别信息。例如，我们的产品中可能会嵌入第三方软件工具开发包（SDK），以统计用户使用应用程序的习惯或偏好，或点击访问广告的情况。我们会不时对该等合作伙伴进行技术检测和行为审计，以最大限度地确保其依法、依规、依约收集和使用数据。"},{kind:"h2",text:"（三）支付服务的委托处理和共享"},{kind:"p",text:"1. 基于提升服务的目的，您授权我司使用您去标识化后的信息 (包括手机号码、身份证件号码等去标识化的信息) 向第三方机构 (包括中国银联股份有限公司、银联智策顾问 (上海) 有限公司、银联商务支付股份有限公司等) 查询、核实、采集、整理、保存、加工您的消费信息、银行卡交易信息等，并且将查询处理所得信息反馈给我司。前述第三方机构将仅在本项目的提升服务目的范围内使用您的信息，在取得您的授权同意前，第三方机构不会擅自将此信息提供给其他第三方或用于其他目的。"},{kind:"p",text:"2. 出于保险实名制、银行卡支付绑卡等身份有效性核验、便利信息填写的目的，您授权我司向第三方机构（包括银联商务支付股份有限公司、中移互联网有限公司及中国移动通信集团有限公司等）采集、查询、核验、加工、保存您的个人身份信息（包含姓名、身份证号、手机号），并将查询、核验结果提供给我司。"},{kind:"h2",text:"（四）转让"},{kind:"p",text:"我们不会将您的个人信息转让给其他任何公司、组织和个人，但以下情形除外："},{kind:"p",text:"1. 事先获得您明确的同意或授权；"},{kind:"p",text:"2. 根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；"},{kind:"p",text:"3. 符合与您签署的相关协议（包括在线签署的电子协议以及相应的平台规则）或其他的法律文件约定所提供；"},{kind:"p",text:"4. 随着我们公司业务的发展，我们及我们的关联公司有可能进行合并、收购、资产转让或其他类似的交易。如相关交易涉及到您的个人信息转让，我们会要求新持有您个人信息的公司、组织和个人继续受此政策约束，否则我们将要求该公司、组织和个人重新征得您的授权同意。"},{kind:"h2",text:"（五）公开披露"},{kind:"p",text:"我们仅会在以下情况，且采取符合业界标准的安全防护措施的前提下，才会公开披露您的个人信息："},{kind:"p",text:"1. 根据您的需求，在您明确同意的披露方式下披露您所指定的个人信息；"},{kind:"p",text:"2. 根据法律、法规的要求、强制性的行政执法或司法要求所必须提供您个人信息的情况下，我们可能会依据所要求的个人信息类型和披露方式公开披露您的个人信息。在符合法律法规的前提下，当我们收到上述披露信息的请求时，我们会要求必须出具与之相应的法律文件，如传票或核查函。我们坚信，对于要求我们提供的信息，应该在法律允许的范围内尽可能保持透明。我们对所有的请求都进行了慎重的审查，以确保其具备合法依据，且仅限于执法部门因特定核查目的且有合法权利获取的数据。"},{kind:"p",text:"请注意，您在使用我们服务时自愿发布甚至公开分享的信息，可能会涉及您或他人的个人信息甚至敏感个人信息，如您的交易信息，以及您在评价时选择上传包含个人信息的文字、图片或视频等各种形式的信息。请您在使用我们的服务时更加谨慎地考虑，是否要发布甚至公开分享相关信息。"},{kind:"h1",text:"六、我们如何保护您的个人信息"},{kind:"p",text:"我们已采取符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。"},{kind:"p",text:"1. 恒大保险经纪设置了专门的个人信息保护负责人，负责处理恒大保险经纪相关产品和服务可能涉及到用户个人信息的各项事务，以及规划和制定公司的隐私政策、审核各产品的用户使用协议、监督各产品的工作原理和信息处理机制等。"},{kind:"p",text:"2. 我们进行了信息安全等级保护的定级测评，我们的信息系统被认定为符合信息安全等级保护第三等级（金融机构信息系统级别的保护）要求，并按照法律法规要求就定级报告向公安机关进行了备案。我们按照信息安全等级保护的要求制定了信息安全工作的总体方针和安全策略，建立了覆盖主机、数据、应用、管理等层面的安全管理制度，设立了专职部门负责信息安全管理工作，明确了安全管理机构内的各个部门和岗位的职责、分工和技能要求，制定了明确的人员录用和离职管理规范。"},{kind:"p",text:"3. 我们会对可识别的敏感个人信息进行加密传输和存储，以确保数据的保密性。我们的应用系统提供了身份鉴别、用户标识唯一性检查、登录失败处理、基于角色的访问控制等功能，采用HTTPS安全协议进行通信，设置了最大并发会话连接数，能够对系统服务水平降低到预先规定的最小值进行检测和报警。我们在服务端部署访问控制机制，对可能接触到您个人信息的工作人员采取最小够用授权原则，并定期核查访问人员名单和访问记录。我们的服务器操作系统和数据库系统口令有复杂度要求，采用SSH安全协议进行远程管理，严格限制默认账号的访问权限，并修改了默认口令，审计记录全面并覆盖了所有用户。"},{kind:"p",text:"4. 我们存储用户个人信息的服务器系统均为安全加固后的操作系统。我们会对服务器操作进行账号审计及监控。如果发现外部公告有安全问题的服务器操作系统，恒大保险经纪会在第一时间进行服务器安全升级，确保恒大保险经纪所有服务器系统及应用安全。"},{kind:"p",text:"5. 我们为工作人员定期举办个人信息保护相关法律法规培训，以加强工作人员的用户个人隐私保护意识。"},{kind:"p",text:"6. 我们制定了信息安全事件应急预案，并调配足够的资源保障确保应急预案的执行。我们每年对应急预案进行了培训和应急事件演练。如果我们的物理、技术或管理防护措施不幸遭到破坏，我们会及时启动应急预案，防止安全事件扩大，按照法律法规的要求上报国家主管机关，并及时采取推送、公告等合理、有效的方式向您告知安全事件的基本情况、可能的影响、已经采取的措施或将要采取的措施等。"},{kind:"h1",text:"七、您管理个人信息的权利"},{kind:"p",text:"按照中国相关的法律、法规、标准，在您使用我们的产品或服务期间，您可以参考下述指引查询、复制、更正、删除您的个人信息，行使撤回同意以及注销账号的权利。另外，您可以通过本隐私政策第十节载明的方式与我们联系，您的意见会及时得到处理。"},{kind:"h2",text:"（一）查询、复制、更正、删除您的个人信息"},{kind:"p",text:"您可以通过恒大保险经纪公众号或恒智汇APP--我的--个人中心，或者通过本政策第十节提供的联系方式联系我们查询、复制、更正和删除您的个人信息。"},{kind:"p",text:"以下情况发生时，您可以通过本隐私政策提供的联系方式要求恒大保险经纪删除您的个人信息："},{kind:"p",text:"1. 我们没有征求您的明确同意，收集了您的个人信息。"},{kind:"p",text:"2. 我们处理您的个人信息违反了法律法规要求。"},{kind:"p",text:"3. 我们违反了与您的约定来使用和处理您的个人信息。"},{kind:"p",text:"4. 您注销了恒大保险经纪账号、卸载或者不再使用我们的产品或服务。"},{kind:"p",text:"5. 我们停止对您提供服务。"},{kind:"p",text:"您可以通过本隐私政策第十节提供的方式联系我们要求删除您的个人信息，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。当我们从服务器中删除您的个人信息后，我们可能不会立即从备份系统中删除相应的数据，但会在备份更新的时候删除这些信息。"},{kind:"h2",text:"（二）改变或撤回您的授权或改变您授权同意的范围"},{kind:"p",text:"如果您想改变或撤回授予给我们的设备权限，您随时可通过以下方式改变或撤回："},{kind:"p",text:"1． 您可以在您移动设备本身操作系统中的“设置”中关闭存储权限、相机权限、照片权限、通知功能，改变同意范围或撤回您的授权。撤回授权后我们将不再使用该等权限。"},{kind:"p",text:"2． 当您使用小程序时，您可以在小程序界面中管理小程序获得的应用权限，您可以撤回对小程序的应用权限授权。"},{kind:"p",text:"3． 请您理解，每个业务功能需要一些必要的个人信息才能得以完成，当您撤回同意或授权后，我们将无法继续为您提供撤回同意或授权所对应的服务和功能，也不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"h2",text:"（三）获得解释的权利"},{kind:"p",text:"您有权要求我们就个人信息处理规则作出解释说明。您可以通过本隐私政策载明的联系方式与我们取得联系。"},{kind:"h2",text:"（四）注销您的账号"},{kind:"p",text:"在您通过我们的产品注册了恒大保险经纪账号的情况下，您可以通过本隐私政策第十节的联系方式联系我们注销您的恒大保险经纪账号，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。我们在此善意地提醒您，您注销账号的行为，将导致我们终止对您提供服务，也将会给您带来诸多不便。"},{kind:"p",text:"1.如果您经慎重考虑，确定注销您的账号，您的账号需同时满足以下条件："},{kind:"p",text:"（1）账号处于安全状态，无异常行为记录，无被盗风险；"},{kind:"p",text:"（2）账号相关财产权益已结清，无未完成或存在争议的订单和服务；"},{kind:"p",text:"（3）自愿放弃账号中的资产和虚拟权益（包括但不限于账号、积分等）；"},{kind:"p",text:"（4）账号无任何未结纠纷，包括投诉举报或被投诉举报。"},{kind:"p",text:"2.账号一旦被注销将不可恢复，请您在操作之前自行备份本账号相关的所有信息和数据，确认与本账号相关的所有服务均已进行妥善处理。账号成功注销后，您将无法再使用本账号，也将无法找回您账号中及与账号相关的任何内容或信息，包括但不限于："},{kind:"p",text:"（1）您将无法登录、使用本账号；"},{kind:"p",text:"（2）本账号的个人资料和历史信息（包括但不限于用户名、头像、身份信息、订单信息等）都将无法查看、无法找回；"},{kind:"p",text:"（3）您通过本账号进行登录的恒大保险经纪旗下产品或服务（包括但不限于恒大保险经纪、恒智汇APP等）的所有记录将无法找回。您将无法再登录、使用前述服务，您曾获得的账号权益等视为您自行放弃，将无法继续使用。您理解并同意，我们无法协助您重新恢复前述服务。请您在提交注销申请前，务必先了解您须解绑的其他相关账号信息，具体可通过本隐私政策第十节提供的联系方式与我们联系。"},{kind:"p",text:"注销成功后，除法律法规要求我们保存相关信息的情况外，我们将删除您的个人信息，使其保持不可被检索、访问的状态或对其进行匿名化处理。您知晓并理解，注销账号并不代表注销前的账号行为和相关责任得到豁免或减轻。"},{kind:"b",text:"(五） 逝者近亲属相关权利"},{kind:"p",text:"若恒大保险经纪用户不幸身故，其近亲属为了自身的合法、正当利益，可以对恒大保险经纪用户的相关个人信息行使本条款规定的查阅、复制、更正、删除等相关权利；恒大保险经纪用户生前另有安排的除外。"},{kind:"h2",text:"（六）响应您的上述请求"},{kind:"p",text:"如果您选择删除个人信息或者注销个人账号，您可以通过本隐私政策第十节的联系方式联系我们，我们会在收到您的反馈并验证您的用户身份后的15个工作日内给予答复。"},{kind:"b",text:"在以下情形中，按照法律法规要求，我们将无法响应您的请求："},{kind:"p",text:"1. 与我们履行法律法规规定的义务相关的；"},{kind:"p",text:"2. 与国家安全、国防安全直接相关的；"},{kind:"p",text:"3. 与公共安全、公共卫生、重大公共利益直接相关的；"},{kind:"p",text:"4. 与刑事侦查、起诉、审判和判决执行等直接相关的；"},{kind:"p",text:"5. 有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"p",text:"6. 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到本人同意的;"},{kind:"p",text:"7. 响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；"},{kind:"p",text:"8. 涉及商业秘密的。"},{kind:"h1",text:"八、未成年人个人信息保护"},{kind:"p",text:"我们非常重视未成年个人信息的保护。我们的产品和服务主要面对成人。我们原则上不会主动从未成年人处收集未成年人的个人信息；如果没有父母或监护人的同意，未成年人不应注册和使用我们的服务。如您为未成年人，我们建议您请您的父母或监护人为您阅读本隐私政策，并在您提交个人信息之前征得父母或监护人的同意。若您是未成年人的监护人，当您对您所监护的未成年人的个人信息有疑问时，您可以通过本隐私政策第十节的联系方式与我们联系。"},{kind:"p",text:"如果特定服务需要提供未成年人个人信息（例如父母或监护人为未成年子女投保时，需要提供未成年人的姓名、身份证号等个人信息），那么我们仅会在法律法规允许、父母或监护人同意并主动提交这些信息的情况下，收集这些信息。对于经父母或监护人同意使用我们的产品或服务而收集未成年人个人信息的情况，我们只会在法律法规允许、父母或监护人明确同意或者保护未成年人所必要的情况下使用、共享、转让或披露此信息。如果我们发现自己在未事先获得可证实的父母或法定监护人同意的情况下收集了未成年人的个人信息，则会在法律要求的情况下尽快删除相关数据。"},{kind:"b",text:"特别提示：本政策中，将未满十四周岁的未成年人称作“儿童”，我们将通过您提供的身份证号码或者其他有效证明文件判断该自然人是否属于儿童。儿童及其监护人在使用恒大保险经纪产品或服务之前，应仔细阅读我们专门制定的《儿童个人信息保护政策》。只有在取得监护人对《儿童个人信息保护政策》的同意后，儿童才能在监护人的指导下使用恒大保险经纪产品或服务。"},{kind:"p",text:"儿童的个人信息构成敏感信息，因此我们制定了不同于成年自然人信息的处理规则。"},{kind:"b",text:"《儿童个人信息保护政策》"},{kind:"p",text:"1. 未经监护人许可不应提供儿童个人信息儿童的个人信息属于敏感信息，未经监护人允许，儿童个人不得提交儿童个人信息；成年自然人在提交该敏感信息之前应确保您为其合法监护人或者您已经获得其合法监护人的同意及授权，否则不应提供。2. 儿童个人信息收集的种类和用途在保险产品购买环节，您提交的被保险人和/或受益人信息中，存在儿童信息的（具体信息和使用用途您可参阅第一部分 我们如何收集您的个人信息 进行详细了解），我们仅应法律法规保存必要信息、向父母或其他合法监护人推荐、提供必要保险产品、验证监护人与儿童身份使用。如果我们需要超出上述用途使用儿童信息，我们将再行向监护人进行告知并征得监护人的同意。3. 儿童个人信息的共享、转移、披露一般情况下，我们不会共享、转移、披露儿童的个人信息，以下情形除外    • 法律法规等规范性文件的要求    • 行政机关、司法机关的命令    • 征得您同意的前提下4 儿童个人信息的存储我们将儿童个人信息储存在中华人民共和国境内并采取技术措施保证儿童个人信息的安全，我们不会超过实现信息收集和使用目的所需要的最短时间。5 您有权更正儿童个人信息监护人发现我们收集、使用的儿童信息有错误时，可以联系我们进行更正。6 儿童信息的删除超过必要处理期限后，我们会对儿童信息做匿名化处理。如果我们发现自己在未事先获得可证实的父母同意的情况下收集了儿童的个人信息，我们会设法尽快删除相关数据。您在以下情形中，也可以要求我们删除处理的儿童信息，在不违反法律法规规定的基础上，我们会尽快删除：    • 您发现我们违反法律法规定或者我们的约定处理儿童信息    • 您撤回授权若您是14周岁以下的未成年人，建议您请您的监护人仔细阅读本个人信息保护政策，并在征得您的监护人同意的前提下使用我们的产品和/或服务或向我们提供信息。本章节未规定之处，参照本隐私政策适用。如果您对章节内容有任何疑问和建议，您可以通过第十条列明的联系方式联系我们。"},{kind:"h1",text:"九、隐私政策的适用范围、变更和修订"},{kind:"b",text:"如我们在本隐私政策序言部分所述，本隐私政策适用于恒大保险经纪产品和服务。您可能通过恒大保险经纪产品中的链接跳转至恒大保险经纪运营的其他产品或服务，这些产品或服务可能会通过其另行设置的隐私政策向您说明收集和使用您个人信息的情况并据此处理您的个人信息。恒大保险经纪的产品或服务均会按照与本隐私政策实质相同的标准对您的个人信息提供完善的保护。"},{kind:"b",text:"需要特别说明的是，本隐私政策不适用于其他第三方向您提供的服务。例如您通过恒大保险经纪链接或购买的保险产品或健康服务产品。我们会在与这些第三方开展合作过程中尽最大努力督促其保护您的个人信息，但您理解这些服务由第三方独立向您提供，第三方将依照其隐私政策或用户协议单独对您的个人信息处理承担责任。"},{kind:"p",text:"我们的隐私政策可能变更。未经您明确同意，我们不会限制您按照本隐私政策所应享有的权利。"},{kind:"b",text:"对于本隐私政策的重大变更，我们还会提供显著的通知（例如，在软件改版或升级、或您重新登录时，以弹窗形式对您进行及时通知）。您亦可以通过恒大保险经纪APP--我的--关于我们或恒大保险经纪官方网站（https://www.hengdainsurance.com/）随时查看最新版的隐私政策。"},{kind:"p",text:"本政策所指的重大变更包括但不限于："},{kind:"p",text:"1. 我们的服务模式发生重大变化。如处理个人信息的目的、处理个人信息的类型、个人信息的使用方式等；"},{kind:"p",text:"2. 我们在控制权等方面发生重大变化。如并购重组等引起的所有者变更等；"},{kind:"p",text:"3. 个人信息共享、转让或公开披露的主要对象发生变化；"},{kind:"p",text:"4. 您参与个人信息处理方面的权利及其行使方式发生重大变化；"},{kind:"p",text:"5. 我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化时；"},{kind:"p",text:"6. 个人信息安全影响评估报告表明存在高风险时。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本隐私政策或您个人信息的相关事宜有任何问题、意见或建议，请通过发送邮件至hdbxxxjjs@evergrande.com或拨打我们客服电话0769-33551837等多种方式与我们联系。我们设立了个人信息保护专职部门（或个人信息保护专员），您可以通过发送邮件至hdbxxxjjs@evergrande.com的方式与其联系。 一般情况下，我们将在十五天内回复。如果您对我们的回复不满意，特别是我们的个人信息处理行为损害了您的合法权益，您还可以向网信、电信、公安及工商等监管部门进行投诉或举报。注：隐私政策中的“我们”或“恒大保险经纪”是指恒大保险经纪有限公司，注册地址为深圳市前海深港合作区南山街道梦海大道5033号前海卓越金融中心（一期）8号楼401-1。再次感谢您对恒大保险经纪及恒智汇APP的信任和使用！"}]},ur={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年6月3日"},{kind:"p",text:"生效时间：2026年6月3日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一. 我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"h2",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"p",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息展示的服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、手机号、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，我们会从您的可信数据空间中获取您的【姓名、手机号、身份证号码前十四位】信息并提供给银联商务支付股份有限公司及相关使用方，并使用该信息为您完成H5场景下展示的服务。为保障您的数据安全，在向银联商务支付股份有限公司及相关使用方提供您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"h2",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"h2",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"h2",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"h2",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"h2",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给银联商务支付股份有限公司及相关使用方，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"p",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"p",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"h2",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"h1",text:"七、我们如何处理未成年人的个人信息"},{kind:"h2",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"h2",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"h2",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},Ar={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[[{kind:"text",text:"合作方",colSpan:7}],["合作方名称","共享目的","共享场景","个人信息","提供方式","隐私政策或官网","联系方式"],["天天有保（湖南）保险经纪服务有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口",{kind:"doc-link",text:"《个人隐私协议》",docKey:"tiantianyoubao-v2-privacy-policy"},"010-87227385"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口",{kind:"doc-link",text:"《中国移动认证梧桐数盾隐私政策》",docKey:"tiantianyoubao-v2-cmcc-privacy-policy"},"10086"]]}]},Er={title:"《个人隐私协议》",blocks:[{kind:"h1",text:"个人隐私协议"},{kind:"p",text:"本政策仅适用于【如果保(重庆)网络科技有限公司】【天天有保（湖南）保险经纪服务有限公司】【无锡信成网络科技有限公司】及其关联公司提供的【如果保】系列产品或服务，包括但不限于【如果有保】、【如果保】等。"},{kind:"p",text:"最近更新日期：2019年03月。"},{kind:"p",text:"如果您有任何疑问、意见或建议，请通过以下联系方式与我们联系："},{kind:"p",text:"电子邮件：service@heiniubao.com"},{kind:"p",text:"电话：010-87227385"},{kind:"p",text:"本政策将帮助您了解以下内容："},{kind:"p",text:"1、我们如何收集和使用您的个人信息"},{kind:"p",text:"2、我们如何使用Cookie和同类技术"},{kind:"p",text:"3、我们如何共享、转让、公开披露您的个人信息"},{kind:"p",text:"4、我们如何保护您的个人信息"},{kind:"p",text:"5、您的权利"},{kind:"p",text:"6、我们如何处理未成年人的个人信息"},{kind:"p",text:"7、本政策如何更新"},{kind:"p",text:"如果保产品和服务的运营商（以下简称“如果保”）深知个人信息对您的重要性，并会尽力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，如果保承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。"},{kind:"p",text:"请在使用我们的产品（或服务）前，仔细阅读并了解本《隐私政策》。"},{kind:"p",text:"本《隐私政策》是如果保系列产品用户协议的组成部分。如果您不明白或不接受本《隐私政策》的内容，请勿使用如果保提供的产品和服务。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。"},{kind:"p",text:"如果保仅会出于本政策所述的以下目的，收集和使用您的个人信息"},{kind:"h2",text:"（一）为您提供网上购物服务（包括购买商品和服务）"},{kind:"p",text:"1、业务功能一：注册成为用户。"},{kind:"p",text:"为完成创建账号，您需提供以下信息：您的姓名、手机号、身份证号。在注册过程中，如果您提供以下额外信息，将有助于我们给您提供更好的服务和体验：工作职位、公司、教育背景等。但如果您不提供这些信息，将不会影响使用本服务的基本功能。"},{kind:"p",text:"2、业务功能二：发送促销营销信息。"},{kind:"p",text:"为向您推荐适合的服务，您需提供以下信息：您的姓名、电话。"},{kind:"p",text:"3、业务功能四：支付结算。"},{kind:"p",text:"为完成线上支付服务，您需提供以下信息：您的姓名、电话、联系地址。"},{kind:"h2",text:"（二）交付产品或服务"},{kind:"p",text:"为向您配送所购买的商品，您需提供以下信息：您的姓名、电话、联系地址。"},{kind:"h2",text:"（三）推荐产品或服务"},{kind:"p",text:"为向合适的第三方推荐您主动申请的产品或服务，您需提供以下信息的部分或全部：您的姓名、手机号、身份证号。"},{kind:"p",text:"在推荐过程中，如果您提供以下额外信息的部分或全部，将有助于我们给您提供更好的服务和体验：手机号、工作职位、公司、教育背景。但如果您不提供这些信息，将不会影响使用相关服务的基本功能。"},{kind:"p",text:"向第三方推荐您的信息时，我们会按照第三章“我们如何共享、转让、公开披露您的个人信息”的要求进行，并按照本隐私政策的规定保护您的合法权益。"},{kind:"h2",text:"（四）开展内部审计、数据分析和研究，改善我们的产品或服务"},{kind:"p",text:"为了规范如果保的用户信息保护，为了向您和其他用户提供更好的服务，我们会使用您所提供的信息进行分析和研究。我们进行分析和研究时，会对您的信息进行去标识化处理。"},{kind:"li",text:"基于提升服务的目的，您授权我司使用您去标识化后的信息 (包括手机号码、身份证件号码等去标识化的信息) 向第三方机构 (包括中国银联股份有限公司、银联智策顾问 (上海) 有限公司、银联商务支付股份有限公司等) 查询、核实、采集、整理、保存、加工您的消费信息、银行卡交易信息等，并且将查询处理所得信息反馈给我司。前述第三方机构将仅在本项目的提升服务目的范围内使用您的信息，在取得您的授权同意前，第三方机构不会擅自将此信息提供给其他第三方或用于其他目的。"},{kind:"li",text:"出于保险实名制、银行卡支付绑卡等身份有效性核验、便利信息填写的目的，您授权我司向第三方机构（包括银联商务支付股份有限公司、中移互联网有限公司及中国移动通信集团有限公司等）采集、查询、核验、加工、保存您的个人身份信息（包含姓名、身份证号、手机号），并将查询、核验结果提供给我司。"},{kind:"h2",text:"（七）其他"},{kind:"p",text:"当我们要将信息用于本政策未载明的其它用途时，会事先征求您的同意。"},{kind:"p",text:"当我们要将基于特定目的收集而来的信息用于其他目的时，会事先征求您的同意。"},{kind:"p",text:"您提供的上述信息，将在您使用本服务期间持续授权我们使用。在您注销账号时，我们将停止使用并删除上述信息。"},{kind:"h1",text:"二、我们如何使用Cookie和同类技术"},{kind:"h2",text:"（一）Cookie"},{kind:"p",text:"为确保网站正常运转，我们会在您的计算机或移动设备上存储名为Cookie的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。借助于Cookie，网站能够存储您的偏好或购物篮内的商品等数据。"},{kind:"p",text:"我们不会将Cookie用于本政策所述目的之外的任何用途。您可根据自己的偏好管理或删除Cookie。有关详情，请参见AboutCookies.org。您可以清除计算机上保存的所有Cookie，大部分网络浏览器都设有阻止Cookie的功能。但如果您这么做，则需要在每一次访问我们的网站时亲自更改用户设置。"},{kind:"h2",text:"（二）网站信标和像素标签"},{kind:"p",text:"除Cookie外，我们还会在网站上使用网站信标和像素标签等其他同类技术。例如，我们向您发送的电子邮件可能含有链接至我们网站内容的点击URL。如果您点击该链接，我们则会跟踪此次点击，帮助我们了解您的产品或服务偏好并改善客户服务。网站信标通常是一种嵌入到网站或电子邮件中的透明图像。借助于电子邮件中的像素标签，我们能够获知电子邮件是否被打开。如果您不希望自己的活动以这种方式被追踪，则可以随时从我们的寄信名单中退订。"},{kind:"h2",text:"（三）DoNotTrack（请勿追踪）"},{kind:"p",text:"很多网络浏览器均设有DoNotTrack功能，该功能可向网站发布DoNotTrack请求。目前，主要互联网标准组织尚未设立相关政策来规定网站应如何应对此类请求。但如果您的浏览器启用了DoNotTrack，那么我们的所有网站都会尊重您的选择。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与无锡信成网络科技有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"（1）在获取明确同意的情况下共享：获得您的明确同意后，我们会与其他方共享您的个人信息；"},{kind:"p",text:"（2）我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息；"},{kind:"p",text:"（3）与我们的附属公司、关联公司共享：您的个人信息可能会与无锡信成网络科技有限公司的附属公司、关联公司共享，我们只会共享必要的个人信息，且受本隐私政策中所声明目的的约束，附属公司、关联公司如要改变个人信息的处理目的，将再次征求您的授权同意；"},{kind:"p",text:"（4）与授权合作伙伴共享：仅为实现本政策中声明的目的，我们的某些服务将由授权合作伙伴提供。我们可能会与合作伙伴共享您的某些个人信息，以提供更好的客户服务和用户体验。"},{kind:"p",text:"对我们与之共享个人信息的公司、组织和个人，我们会与其签署严格的保密协定，要求他们按照我们的说明、本隐私政策以及其他相关的保密和安全措施来处理个人信息。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外："},{kind:"p",text:"1、在获取明确同意的情况下转让：获得您的明确同意后，我们会向其他方转让您的个人信息；"},{kind:"p",text:"2、在涉及合并、收购或破产清算时，如涉及到个人信息转让，我们会在要求新的持有您个人信息的公司、组织继续受此隐私政策的约束，否则我们将要求该公司、组织重新向您征求授权同意。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"我们仅会在以下情况下，公开披露您的个人信息："},{kind:"p",text:"1、获得您明确同意后；"},{kind:"p",text:"2、基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能会公开披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护您的个人信息"},{kind:"h2",text:"（一）我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。"},{kind:"h2",text:"（二）我们会采取合理可行的措施，确保未收集无关的个人信息。我们只会在达成本政策所述目的所需的期限内保留您的个人信息，除非需要延长保留期或受到法律的允许。"},{kind:"h2",text:"（三）互联网并非绝对安全的环境，而且电子邮件、即时通讯、及与其他如果保用户的交流方式并未加密，我们强烈建议您不要通过此类方式发送个人信息。请使用复杂密码，协助我们保证您的账号安全。"},{kind:"h2",text:"（四）我们将定期更新并公开安全风险、个人信息安全影响评估等报告的有关内容。您可通过查看网站公告的方式获得。"},{kind:"h2",text:"（五）互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。"},{kind:"h2",text:"（六）在不幸发生个人信息安全事件后，我们将按照法律法规的要求，及时向您告知：安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等。我们将及时将事件相关情况以邮件、信函、电话、推送通知等方式告知您，难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"h1",text:"五、您的权利"},{kind:"p",text:"按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利："},{kind:"h2",text:"（一）访问您的个人信息您有权访问您的个人信息，法律法规规定的例外情况除外。如果您想行使数据访问权，可以"},{kind:"p",text:"通过以下方式自行访问："},{kind:"p",text:"账户信息——如果您希望访问或编辑您的账户中的个人资料信息和支付信息、更改您的密码、添加安全信息或关闭您的账户等，您可以通过发送电子邮件至service@heiniubao.com我们将在30天内回复您的访问请求。"},{kind:"p",text:"对于您在使用我们的产品或服务过程中产生的其他个人信息，只要我们不需要过多投入，我们会向您提供。如果您想行使数据访问权，请发送电子邮件至service@heiniubao.com。"},{kind:"h2",text:"（二）更正您的个人信息"},{kind:"p",text:"当您发现我们处理的关于您的个人信息有错误时，您有权要求我们做出更正。您可以通过"},{kind:"h2",text:"（一）访问您的个人信息”中罗列的方式提出更正申请。"},{kind:"p",text:"如果您无法通过上述链接更正这些个人信息，您可以随时发送电子邮件至service@heiniubao.com。我们将在30天内回复您的更正请求。"},{kind:"h2",text:"（三）删除您的个人信息"},{kind:"p",text:"在以下情形中，您可以向我们提出删除个人信息的请求："},{kind:"p",text:"1、如果我们处理个人信息的行为违反法律法规；"},{kind:"p",text:"2、如果我们收集、使用您的个人信息，却未征得您的同意；"},{kind:"p",text:"3、如果我们处理个人信息的行为违反了与您的约定；"},{kind:"p",text:"4、如果您不再使用我们的产品或服务，或您注销了账号；"},{kind:"p",text:"5、如果我们不再为您提供产品或服务。"},{kind:"p",text:"若我们决定响应您的删除请求，我们还将同时通知从我们获得您的个人信息的实体，要求其及时删除，除非法律法规另有规定，或这些实体获得您的独立授权。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即备份系统中删除相应的信息，但会在备份更新时删除这些信息。"},{kind:"h2",text:"（四）改变您授权同意的范围"},{kind:"p",text:"每个业务功能需要一些基本的个人信息才能得以完成（见本政策“第一部分”）。对于额外收集的个人信息的收集和使用，您可以随时发送电子邮件至service@heiniubao.com，给予或收回您的授权同意。我们将在30天内回复您的变更请求。"},{kind:"p",text:"当您收回同意后，我们将不再处理相应的个人信息。但您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"如果您不想接受我们给您发送的商业广告，您随时可通过以下方式取消："},{kind:"p",text:"（1）使用短信或电子邮件中的退订；"},{kind:"p",text:"（2）若您无法使用（1）中的方式取消，您可以随时发送电子邮件至service@heiniubao.com要求退订我们的商业广告，我们将在30天内回复您的取消请求。"},{kind:"h2",text:"（五）个人信息主体注销账户"},{kind:"p",text:"您随时可注销此前注册的账户，您可以访问service@heiniubao.com注销您的账户。在注销账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（六）个人信息主体获取个人信息副本"},{kind:"p",text:"您有权获取您的个人信息副本，您可以随时发送电子邮件至service@heiniubao.com，我们将在30天内回复您的获取请求。"},{kind:"h2",text:"（七）约束信息系统自动决策"},{kind:"p",text:"在某些业务功能中，我们可能仅依据信息系统、算法等在内的非人工自动决策机制做出决定。如果这些决定显著影响您的合法权益，您有权要求我们做出解释，我们也将提供适当的救济方式。"},{kind:"h2",text:"（八）响应您的上述请求"},{kind:"p",text:"为保障安全，您可能需要提供书面请求，或以其他方式证明您的身份。我们可能会先要求您验证自己的身份，然后再处理您的请求。"},{kind:"p",text:"我们将在三十天内做出答复。如您不满意，还可以通过如果保产品页面上载明的联系方式进行申诉。"},{kind:"p",text:"对于您合理的请求，我们原则上不收取费用，但对多次重复、超出合理限度的请求，我们将视情收取一定成本费用。对于那些无端重复、需要过多技术手段（例如，需要开发新系统或从根本上改变现行惯例）、给他人合法权益带来风险或者非常不切实际（例如，涉及备份磁带上存放的信息）的请求，我们可能会予以拒绝。"},{kind:"p",text:"在以下情形中，按照法律法规要求，我们将无法响应您的请求："},{kind:"p",text:"1、与国家安全、国防安全直接相关的；"},{kind:"p",text:"2、与公共安全、公共卫生、重大公共利益直接相关的；"},{kind:"p",text:"3、与犯罪侦查、起诉、审判和判决执行等直接相关的；"},{kind:"p",text:"4、有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"p",text:"5、响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的。"},{kind:"p",text:"6、涉及商业秘密的。"},{kind:"h1",text:"六、我们如何处理未成年人的个人信息"},{kind:"p",text:"我们的产品、网站和服务主要面向成人。如果没有父母或监护人的同意，未成年人不得创建自己的用户账户。"},{kind:"p",text:"对于经父母同意而收集未成年人个人信息的情况，我们只会在受到法律允许、父母或监护人明确同意或者保护未成年人所必要的情况下使用或公开披露此信息。尽管当地法律和习俗对未成年人的定义不同，但我们将不满18周岁的任何人均视为未成年人。"},{kind:"p",text:"如果我们发现自己在未事先获得可证实的父母同意的情况下收集了未成年人的个人信息，则会设法尽快删除相关数据。"},{kind:"h1",text:"七、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会在本页面上发布对本政策所做的任何变更。"},{kind:"p",text:"对于重大变更，我们还会提供更为显著的通知（包括对于某些服务，我们会通过电子邮件发送通知，说明隐私政策的具体变更内容）。"},{kind:"p",text:"本政策所指的重大变更包括但不限于："},{kind:"p",text:"1、我们的服务模式发生重大变化。如处理个人信息的目的、处理的个人信息类型、个人信息的使用方式等；"},{kind:"p",text:"2、个人信息共享、转让或公开披露的主要对象发生变化；"},{kind:"p",text:"3、您参与个人信息处理方面的权利及其行使方式发生重大变化；"},{kind:"p",text:"4、个人信息安全影响评估报告表明存在高风险时。"},{kind:"p",text:"我们还会将本政策的旧版本存档，供您查阅。"}]},vr={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年6月3日"},{kind:"p",text:"生效时间：2026年6月3日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一. 我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"h2",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"p",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息展示的服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、手机号、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，我们会从您的可信数据空间中获取您的【姓名、手机号、身份证号码前十四位】信息并提供给银联商务支付股份有限公司及相关使用方，并使用该信息为您完成H5场景下展示的服务。为保障您的数据安全，在向银联商务支付股份有限公司及相关使用方提供您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"h2",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"h2",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"h2",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"h2",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"h2",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给银联商务支付股份有限公司及相关使用方，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"p",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"p",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"h2",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"h1",text:"七、我们如何处理未成年人的个人信息"},{kind:"h2",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"h2",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"h2",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},Cr={title:"《用户信息授权协议》",blocks:[{kind:"p",text:"请阅读以下协议内容。"}]},Dr={title:"《收付通用户信息认证授权协议》",blocks:[{kind:"h1",text:"用户信息认证授权协议"},{kind:"p",text:"《用户信息认证授权协议》(以下简称“本协议”)是银联商务支付股份有限公司及相关使用方关联公司（以下简称“我们或银联商务”）与用户（以下简称“您”）所订立的有效合约。请您先仔细阅读本协议内容，尤其是字体加粗或下划线部分。如您对本协议内容或页面提示信息有疑问，请勿进行下一步操作。您通过页面点击或我们认可的其他方式确认本协议，即表示您已充分阅读、理解并同意接受本协议的全部约定内容。"},{kind:"p",text:"1、您授权我们将您填写身份证后四位提供给中国移动及其关联公司核验身份证后四位有效性，校验成功后，您授权中国移动及其关联公司将您的本机号码对应【姓名/身份证前十四位】信息将以密文形式存放到您在中国移动的个人数据空间中。"},{kind:"p",text:"2. 您授权我们将通过中国移动及其关联公司获取您的本机号码，您授权我们从您的的中国移动个人数据可信空间提取您本机号码对应【姓名及身份证前十四位】信息，并使用该信息为您进行实名认证。"},{kind:"p",text:"为保障您的数据安全，在您的【姓名/身份证前十四位】信息输出后，中国移动通信运营商及其关联公司将从中移互联中国移动个人数据空间删除您的【姓名/身份证前十四位】信息。"},{kind:"p",text:"银联商务与相关使用方关联公司如共享您的上述个人信息会通过相关协议另行取得您的授权。"},{kind:"p",text:"3、客服联系方式：95534。您可以根据《收付通用户隐私政策保护》行使您的个人信息权利。"},{kind:"p",text:"4、我们作为非银行支付机构，依据您的明确授权向第三方提供您的上述信息，第三方向您提供的服务由该第三方独立运营并承担责任。因第三方使用您上述信息而产生的纠纷，我们将协调您与第三方协商解决。"},{kind:"p",text:"5、如我们对本协议进行变更，我们将通过弹窗、服务通知或官网公告（www.chinaums.com）等方式告知您更新内容。更新内容将于公告或通知载明的生效之日起开始生效。如果更新的内容需要您授权向第三方提供您的其他个人信息的，我们会再次以显著方式重新征求您的同意。若您无法同意变更后的协议内容，您有权停止使用相关服务；双方协商一致的，也可另行变更相关服务和对应协议内容。"},{kind:"p",text:"6、本协议之效力、解释、变更、执行与争议解决均适用中华人民共和国法律。因本协议产生的争议，双方应尽量友好协商解决，如协商不成的，您同意将相关争议提交至被告住所地人民法院诉讼解决。"}]},Br={title:"《中国移动认证梧桐数盾隐私政策》",blocks:[{kind:"h1",text:"中国移动认证梧桐数盾隐私政策"},{kind:"p",text:"更新时间：2026年4⽉24日"},{kind:"p",text:"生效时间：2026年4⽉24日"},{kind:"p",text:"中移互联网有限公司移动认证业务（以下称”我们”）非常重视用户的隐私和个人信息安全保护，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。"},{kind:"p",text:"我们希望通过《隐私政策》（以下简称”本政策”）向您说明移动认证（以下简称”本服务”）如何收集、使用、存储和共享您的个人信息，以及您可以如何行使您的隐私权利。"},{kind:"p",text:"请您在使用本服务前，认真阅读并充分理解本《隐私政策》的全部内容，特别是以字体加粗方式标识的内容。在阅读过程中如您对本政策内容有任何疑问、意见或建议，请联系我们。您使用或在我们更新本政策后继续使用我们的产品或服务，即表示您同意本政策（含更新版本）内容，并且同意我们按照本政策收集、存储、使用和共享您的相关信息。您方表示同意的方式包括但不限于主动点击”同意”、”接受”、“授权”选项或签字等。"},{kind:"p",text:"本隐私政策将帮助您了解以下内容："},{kind:"h1",text:"一.  我们如何收集和使用您的个人信息。"},{kind:"h1",text:"二. 我们如何使用Cookie和同类技术。"},{kind:"h1",text:"三. 我们如何共享、转让、公开披露您的个人信息。"},{kind:"h1",text:"四. 我们如何保护和保存您的个人信息。"},{kind:"h1",text:"五. 您的权利。"},{kind:"h1",text:"六. 例外情况。"},{kind:"h1",text:"七. 我们如何处理未成年人的个人信息。"},{kind:"h1",text:"八. 您的个人信息如何在全球范围转移。"},{kind:"h1",text:"九. 本政策如何更新。"},{kind:"h1",text:"十. 如何联系我们。"},{kind:"h1",text:"一、我们如何收集和使用您的个人信息"},{kind:"p",text:"个人信息是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。我们会以“最小化”原则收集、使用、存储和传输用户个人信息，并通过用户协议和隐私政策告知您信息的使用目的和范围。"},{kind:"p",text:"我们会为您提供的各项具体功能场景包括："},{kind:"p",text:"（一）为保证您正常使用本服务的内容，我们需要收集和使用下列与您有关的信息："},{kind:"h2",text:"1、移动认证安全基座SDK功能"},{kind:"p",text:"根据《T/TAF 188-2023 软件开发工具包（SDK）收集个人信息技术要求》，本 SDK 属于认证类。"},{kind:"p",text:"移动认证安全基座SDK包含本机号码校验功能。"},{kind:"p",text:"为实现本机号码校验功能，需要获取您的网络类型、网络地址（ip 地址）、运营商类型、本机号码信息、SIM 卡状态，用于一键获取您的手机号码；同时，使用手机设备类型、手机操作系统、硬件厂商，用于问题查询、分析、风险控制和追踪，如您拒绝提供，将不能使用本服务。"},{kind:"h2",text:"2、H5移动认证安全基座 功能"},{kind:"b",text:"H5移动认证安全基座包含本机号码校验、号码授权、信息助填和区块链存证功能。"},{kind:"p",text:"为实现H5场景本机号码校验和号码授权功能，需要收集您的本机号码、运营商类型、网络类型，用于获取您的手机号码进行本机号码校验和号码授权服务。同时使用您的浏览器指纹用于业务风控，浏览器指纹具体包括：操作系统、用户代理（浏览器类型）、浏览器版本号、浏览器是否启动cookie、cpu 等级、cpu 虚拟核心数、系统语言、浏览器插件、屏幕可用宽度、屏幕可用高度、颜⾊质量、时差区。如您拒绝提供，将不能使用服务。"},{kind:"p",text:"为实现H5场景信息助填服务，您填写身份证号码后四位，并授权我们及中国移动通信集团有限公司获取您的手机号码，在获得您授权后，将您的手机号码提供给应用运营方及相关使用方关联公司用于开通相关服务。同时我们将使用您在我们及中国移动通信集团有限公司预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您的【姓名、身份证号码前十四位】将以密文形式存放到您的中移互联可信数据空间中，在获得您确认授权后，应用运营方及相关使用方关联公司将从中移互联可信数据空间中查询并获取您的【姓名、身份证号码前十四位】信息，并使用该信息为您完成实名认证。为保障您的数据安全，在应用运营方及相关使用方关联公司获取您的【姓名、身份证号码前十四位】信息后，我们将从中移互联可信数据空间删除您的【姓名、身份证号码前十四位】信息。如您拒绝提供，将不能使用H5场景信息助填服务，但不影响使用一键登录和本机号码校验功能。"},{kind:"p",text:"为实现H5场景区块链存证功能，需要获取您的手机号、IP地址、当前操作信息、使用时间、服务协议条款，用于将您的使用信息上传至区块链存证。如您拒绝提供，将不能使用区块链存证服务。"},{kind:"h2",text:"3、移动认证安全基座SDK移动设备系统权限申请声明"},{kind:"li",text:"（1）为满足基本业务要求，需要获取您的以下权限："},{kind:"table",rows:[["权限","操作系统","使用场景","使用目的"],["INTERNET（必选）","Android","网络通信","允许应用程序联网，用于访问网关和认证服务器"],[`ACCESS_NETWORK_STAT\nE（必选）`,"Android","查看网络状态","允许 SDK 访问网络状态，用于判断设备网络类型是蜂窝网络或 WIFI 网络"],[`CHANGE_NETWORK_STA\nTE（必选）`,"Android","进行网络切换通信",`允许程序改变网络连接状态 , 当\n用户未使用数据流量时，切换为数据流量，以获取用户手机号码`],["蜂窝网络权限（必选）","iOS","获取用户手机号","用于一键获取您的手机号码"]]},{kind:"p",text:"如您拒绝提供以上移动设备系统权限，将不能使用服务。"},{kind:"b",text:"（二）从第三方获得您的个人信息："},{kind:"p",text:"为向您提供H5场景信息助填服务，经您授权同意，我们可能会接收中国移动通信集团有限公司提供的您的【加密身份证号码、加密姓名】。我们将在确认接收的个人信息来源的合法性后，依相关法律法规及第三方约定将您的前述信息用于H5场景信息助填服务。"},{kind:"b",text:"（三）在以下情形中我们使用您的信息时无需征得您的授权同意："},{kind:"p",text:"1.关系国家安全、国防安全的情况时。"},{kind:"p",text:"2.关系公共安全、公共卫生、重大公共利益的情况时。"},{kind:"p",text:"3.关系犯罪侦查、起诉、审判和判决执行的情况时。"},{kind:"p",text:"4.出于维护个人信息主体或其他个人的生命、财产安全，但又很难得到本人同意的情况下。"},{kind:"p",text:"5.所收集的个人信息是个人信息主体自行向社会公众公开的信息。"},{kind:"p",text:"6.从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开渠道。"},{kind:"p",text:"7.根据您的要求签订合同所必需的。"},{kind:"p",text:"8.用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障。"},{kind:"p",text:"9.为合法的新闻报道所必需的。"},{kind:"p",text:"10.学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的。"},{kind:"p",text:"11.法律法规规定的其他情形。"},{kind:"p",text:"（四）基于合法获取的数据，我方将依法按照业内领先的去标识化、匿名化等数据安全技术对信息进行处理。对我方及合作方合法合规获取的数据进行汇聚融合、加工分析、开展隐私计算、联邦学习等处理，形成数据产品，为第三方客户提供用户增长、营销辅助、风险识别、广告反作弊等大数据解决方案，如您不希望我们进行前述处理，您可以通过本政策列明的联系方式与我们联系取消授权。"},{kind:"p",text:"（五）请您注意，您同意我们使用以上信息及权限即代表您授权我们可以收集和使用这些个人信息，您关闭权限即代表您取消了这些授权，则我们将不再继续收集和使用您的个人信息，也无法为您提供与这些授权所对应的相关功能。您关闭授权的决定不会影响此前基于您的授权所进行的个人信息的处理。"},{kind:"p",text:"（六）请您放心，我们收集和使用的个人信息均是在经过您的授权后通过合法渠道获得，不会从任何非法渠道间接获取您的个人信息。我们不会使用个人信息对您进行个性化推荐，当我们要将信息用于本政策未载明的其他用途时，会事先征求您的同意。"},{kind:"h1",text:"二、我们如何使用Cookie 和同类技术"},{kind:"p",text:"为确保本服务的正常运转，我们会在您的移动设备上存储名为Cookie 的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。通过Cookie，我们能够缓存您的数据以便下次快速获取您的手机号码。"},{kind:"p",text:"我们不会将Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好清除手机缓存。"},{kind:"h1",text:"三、我们如何共享、转让、公开披露您的个人信息"},{kind:"h2",text:"（一）共享"},{kind:"p",text:"我们不会与中移互联网有限公司以外的任何公司、组织和个人分享您的个人信息，但以下情况除外："},{kind:"p",text:"1.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。"},{kind:"p",text:"2.如您同意本隐私政策，我们可能会将您的【手机号码、授权凭证】共享给中国移动通信集团有限公司，同时将您的【手机号码】共享给应用运营方及相关使用方关联公司，以确保您在可信助填场景中的授权以及身份真实有效。我们只会共享必要的个人信息，且受隐私政策中所声明目的的约束。"},{kind:"h2",text:"（二）转让"},{kind:"p",text:"除以下情况外，我们不会将您的个人信息转让给任何公司、组织和个人。"},{kind:"p",text:"1.获得您的明确授权后，我们会向您授权的第三方转让您的个人信息。"},{kind:"p",text:"2.在本业务合并、收购或破产清算时，如涉及到个人信息转让时，我们会要求新的公司继续按本隐私政策接收、管理、使用和转让您的信息。若无法达成共识，我们会要求新的公司重新向您征求授权。"},{kind:"h2",text:"（三）公开披露"},{kind:"p",text:"除以下情况外，我们不会公开披露您的个人信息："},{kind:"p",text:"1.获得您明确同意后，按您授权情况披露您的个人信息。"},{kind:"p",text:"2.在法律、法律程序或政府主管部门强制性要求的情况下，我们可能会按要求披露您的个人信息。"},{kind:"h1",text:"四、我们如何保护和保存您的个人信息"},{kind:"h2",text:"（一）我们如何保存您的个人信息"},{kind:"h3",text:"1.信息存储的地点"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内，不存在境外收集用户信息情况。"},{kind:"h3",text:"2.信息存储的期限"},{kind:"p",text:"一般而言，移动认证将在您使用期间保存您的个人信息，并且您的个人信息将在法律规定范围内最短期限保留。在超出保留期限后，我们会根据适用法律的要求删除或匿名化处理您的个人信息。"},{kind:"p",text:"当您注销中国移动账户后，我们将删除相应的个人信息或进行匿名化处理。"},{kind:"p",text:"当我们的产品或服务发生停止运营的情形时，我们将以推送通知、公告的形式通知您，并在法律规定的期限内删除您的个人信息或进行匿名化处理。"},{kind:"p",text:"注：法律法规有规定不能删除时或不能匿名化处理的情况除外。"},{kind:"h2",text:"（二）我们如何保护您的个人信息"},{kind:"p",text:"我们会严格按照《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《全国人民代表大会常务委员会关于加强网络信息保护的决定》《电信和互联网用户个人信息保护规定》（工业和信息化部令第24 号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25 号）等法律法规的要求，建立信息安全保障制度，采取技术措施和其他必要措施保护您的个人信息安全。"},{kind:"b",text:"1.我们保护您个人信息的技术与措施"},{kind:"p",text:"我们非常重视个人信息安全，并采取一切合理可行的措施保护您的个人信息："},{kind:"h3",text:"（1）数据安全技术措施"},{kind:"p",text:"我们会采用符合业界标准的安全保护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问使用、修改，避免数据的损坏或丢失。"},{kind:"p",text:"中移互联网的网络服务采取了传输层安全协议和其他加密技术，通过https 和其他方式提供浏览服务，确保用户数据在传输过程中的安全性。"},{kind:"p",text:"中移互联网采取加密技术对用户个人信息进行加密保存，并通过隔离技术进行隔离。"},{kind:"p",text:"在个人信息使用时，例如个人信息展示，我们会采取多种复杂的数据脱敏技术增强个人信息在使用中的安全性。"},{kind:"p",text:"中移互联网采用代码安全检查、数据方位日志分析技术进行个人信息安全审计。"},{kind:"h3",text:"（2）中移互联网为保护个人信息采取的其他安全措施"},{kind:"p",text:"中移互联网通过建立数据分类分级制度、数据安全管理规范、数据安全开发规范来管理规范个人信息的存储和使用。通过信息接触者保密协议、监控和审计制度来对数据进行全⾯安全控 制。同时建立安全管理中心并下设信息保护专职部门、数据安全应急响应组织来推进和保障个人信息安全，加强安全意识。我们还会定期举办安全和隐私保护培训课程来加强对个人信息保护重要性的认识，同时进行定期安全审计。"},{kind:"b",text:"2.安全事件处置"},{kind:"p",text:"为应对个人信息泄露、损毁和丢失等可能出现的风险，中移互联网制定了多项制度，明确安全事件、安全漏洞的分类分级标准及相应的处理流程。中移互联网也为本服务系统安全事件建立了专门的应急响应团队，按照安全事件处置规范要求，针对不同安全事件启动安全预案，进行止损、分析、定位、制定补救措施并联合相关部门进行溯源和打击。"},{kind:"p",text:"若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时告知您安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等信息。我们将及时将事件相关情况以邮件、信函、电话、推送通知的方式告知您。在难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报个人信息安全事件的处置情况。"},{kind:"p",text:"3.请您理解：互联网环境并非百分之百安全，我们将尽力确保或担保您发送给我们的任何信息的安全性。如果我们的物理、技术或管理防护设施遭到破坏，导致信息被非授权访问、公开披露、篡改或毁坏，导致您的合法权益受损，我们将依照法律法规承担相应责任。如果您对我们的个人信息保护有任何疑问，可通过本隐私政策中约定的联系方式联系我们。如果您发现自己的个人信息泄露，尤其是您的账户及密码发生泄露，请您立即通过本隐私政策【十、如何联系我们】中约定的联系方式联络我们，以便我们采取相应措施。"},{kind:"h1",text:"五、您的权利"},{kind:"h2",text:"（一）查询、更正、补充和限制您的个人信息"},{kind:"h2",text:"若您希望查询、更正、补充和限制您的个人信息，您可以联系我们的客服电话10086联系我们，我们会有专门的客服人员帮助您。"},{kind:"h2",text:"删除您的个人信息"},{kind:"p",text:"您可以通过联系10086客服电话的方式删除您的部分信息，或申请注销手机号码删除您的全部信息，我们将在验证通过后的十五天内处理您的删除申请。在以下情形中，您可以向客服申请，提出删除个人信息的请求："},{kind:"p",text:"1.如果我们处理个人信息的行为违反了相关法律法规。"},{kind:"p",text:"2.如果我们收集、使用您的个人信息，却未征得您的同意。"},{kind:"p",text:"3.如果我们处理个人信息的行为违反了与您的约定。"},{kind:"p",text:"4.如果您不再使用我们的产品或服务，或您注销了中国移动手机号。"},{kind:"p",text:"5.如果我们不再为您提供产品或服务。"},{kind:"p",text:"当您从我们的服务中删除信息后，我们可能不会立即从备份系统中删除相应的信息，但会在备份更新时及时删除这些信息。"},{kind:"h2",text:"（三）注销账户"},{kind:"p",text:"您可以通过联系10086客服电话的方式申请注销，我们将在十五天内处理您的注销申请，您主动注销您的账户之后，我们将停止为您提供产品或服务，并依据您的要求，删除或匿名化您的个人信息，法律法规另有规定的除外。"},{kind:"h2",text:"（四）复制个人信息副本"},{kind:"p",text:"如果你需要复制我们收集存储的个人信息，您可以联系10086，联系客服协助您复制、转移你的个人信息。"},{kind:"h2",text:"（五）个人信息可携权"},{kind:"h2",text:"在符合国家相关法律法规及网信部门规定的条件下，如您请求将个人信息转移至指定的个人信息处理者，我们将按照相关规定的要求提供转移的途径。"},{kind:"h2",text:"（六）撤销已同意授权功能"},{kind:"p",text:"如您已授权我们获得某些移动设备系统权限同意我们处理您的个人信息，您可以通过APP 系统权限设置撤回您的授权。您可登录梧桐数盾页面（https://slw.h5cmpassport.com:9091/h5/login），点击底部栏【授权】--【授权凭证】--【可信助填授权凭证】--【撤销授权】路径撤回您的对本产品隐私政策的授权同意，当您收回同意的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"p",text:"当您撤回同意或授权后，我们无法继续为您提供撤回同意或授权所对应的服务，也将不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的同意或授权而开展的个人信息处理。"},{kind:"b",text:"（七）响应时限"},{kind:"p",text:"对于您行使上述（一）至（六）项权利所提出的相关请求，我们将在收到您的申请之日起十五天内作出答复。"},{kind:"h1",text:"六、例外情况"},{kind:"p",text:"请您充分理解并同意，我们在以下情况下收集、使用您的个人信息无需您的授权，且我们可能不会响应您提出的删除、注销的请求："},{kind:"p",text:"1.与国家安全、国防安全有关的情况。"},{kind:"p",text:"2.与公共安全、公共卫生、重大公共利益有关的情况。"},{kind:"p",text:"3.与犯罪侦查、起诉、审判和执行判决等有关的情况。"},{kind:"p",text:"4.有充分证据表明个人信息主体存在主观恶意或滥用权利的情况。"},{kind:"p",text:"5.响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的情况。"},{kind:"p",text:"6.涉及商业秘密的情况。"},{kind:"p",text:"7.法律法规规定的其他情形。"},{kind:"p",text:"七、我们如何处理未成年人的个人信息"},{kind:"p",text:"（一）我们非常重视保护未成年人个人信息，特别是14周岁以下的儿童。若您是未成年人，在使用我们的服务前，应提前取得您的父母或法定监护人的书面同意。我们将根据国家相关法律法规保护未成年人的个人信息。"},{kind:"p",text:"（二）对于已经过未成年人的父母或法定监护人同意而收集的未成年人个人信息，我们只会在法律允许、父母或法定监护人明确同意、保护未成年人所必要的情况下使用或公开披露相关信息。"},{kind:"p",text:"（三）如果我们发现在未事先获得未成年人的父母或法定监护人同意的情况下收集了未成年人的个人信息，会立即删除相关数据。"},{kind:"h1",text:"八、您的个人信息如何在全球范围转移"},{kind:"p",text:"我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内,我们不会将您的个人信息传输至中华人民共和国境外。"},{kind:"h1",text:"九、本政策如何更新"},{kind:"p",text:"我们的隐私政策可能变更。"},{kind:"p",text:"未经您的同意，我们不会削减您应享有的个人隐私权利。我们会以弹窗形式发布对本政策所做的任何变更。对于变更后的隐私政策，我们会再次征求您的同意。"},{kind:"h1",text:"十、如何联系我们"},{kind:"p",text:"如您对本政策存在任何疑问，或对于您的个人信息处理存在任何投诉、意见，请通过以下渠道联系我们："},{kind:"p",text:"公司名称：中移互联网有限公司"},{kind:"p",text:"公司地址：中国广东省广州市天河区高唐路323号中国移动南方基地智汇中心"},{kind:"p",text:"联系方式：10086"},{kind:"p",text:"我们已经建立客户投诉管理机制，包括跟踪流程。一般来说，我们将在验证通过后的五个工作日内处理完成，特殊情形下最长将在不超过十五天内作出答复。"},{kind:"p",text:"中国移动版权所有"}]},_e={title:"《敏感个人信息处理规则》",blocks:[{kind:"h1",text:"敏感个人信息处理规则"},{kind:"p",text:"银联商务支付股份有限公司（以下简称“我们”）非常重视对您的敏感个人信息的保护。我们将遵循合法、正当、必要和诚信原则处理您的敏感个人信息。"},{kind:"p",text:"“敏感个人信息”是指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。"},{kind:"b",text:"本规则将帮助您了解以下内容："},{kind:"h1",text:"一、我们如何收集、使用以及以其他方式处理您的敏感个人信息"},{kind:"h1",text:"二、我们如何存储和保护敏感个人信息"},{kind:"h1",text:"三、用户权利"},{kind:"h1",text:"四、如何联系我们"},{kind:"h1",text:"五、其他"},{kind:"h1",text:"一、我们如何收集、使用以及以其他方式处理您的敏感个人信息"},{kind:"p",text:"1、为向您提供《【用户认证服务】隐私政策》所述的相关服务，您知悉并同意我们在以下场景/业务功能中处理您的敏感个人信息："},{kind:"table",rows:[["场景/业务功能","处理目的","处理方式","敏感个人信息种类"],["银行卡支付绑卡、需实名制验证或管理的金融场景","身份一致性核验和便利信息填写","收集、存储、使用、加工、传输、提供、删除","身份证号"]]},{kind:"p",text:"2、我们处理您的敏感个人信息，是实现前述处理目的所必需的。如您不提供该等信息将导致处理目的无法实现。对您个人权益的影响是：如果前述敏感个人信息泄露或者被非法使用等，可能危害您的人身和财产安全、损害您的个人名誉等人格权益或导致歧视性差别待遇等。"},{kind:"h1",text:"二、我们如何存储和保护敏感个人信息"},{kind:"p",text:"我们会根据相关法律法规妥善保存和保护您的敏感个人信息。关于我们如何保存和保护敏感个人信息，包括个人信息保存期限、保存期限的确定方法、到期后的处理方式等，均适用《用户认证服务隐私政策》中“我们如何保存您的个人信息”和“我们如何保护您的个人信息”部分的约定。"},{kind:"h1",text:"三、用户权利"},{kind:"p",text:"关于您行使查阅、复制、转移、更正、补充、删除、限制处理个人信息等权利，以及注销账号、撤回同意的方法和途径，适用《用户认证服务隐私政策》“用户权利”部分的约定。"},{kind:"h1",text:"四、如何联系我们"},{kind:"p",text:"如果您有任何疑问、投诉、举报、意见或建议，您可以通过以下方式与我们联系："},{kind:"p",text:"客服电话：95534"},{kind:"p",text:"个人信息保护负责人邮箱：yszc@chinaums.com"},{kind:"p",text:"联系地址：中国（上海）自由贸易试验区张衡路1006、1008号"},{kind:"p",text:"我们会尽最大努力为您提供满意的解决方案。一般情况下，我们将在15天内处理您的疑问、投诉、意见、举报或建议。"},{kind:"p",text:"如果您对我们的回复不满意，特别是认为我们的个人信息处理行为损害了您的合法权益，您还可以向人民银行、支付清算协会、网信、电信、公安及工商等监管部门进行投诉或举报，或向被告住所地有管辖权的人民法院提起诉讼。"},{kind:"h1",text:"五、其他"},{kind:"p",text:"1、当您手动勾选、点击同意、签署或以其他主动方式确认本规则时，即表示您已仔细阅读、充分理解并单独同意我们按照本规则及《用户认证服务隐私政策》的约定处理您的敏感个人信息。"},{kind:"p",text:"2、本规则系《用户认证服务隐私政策》的有效组成部分，本规则有约定的，按照本规则执行；本规则未尽事宜，适用《用户认证服务隐私政策》的相关约定。"}]},mr={title:"《第三方共享个人信息清单》",blocks:[{kind:"h1",text:"第三方对外提供个人信息清单"},{kind:"table",rows:[["合作方名称","共享目的","共享场景","个人信息","提供方式"],["您具体使用的保险场景的合作商户","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token、姓名、身份证号前十四位、手机号","API接口"],["中移互联网有限公司","核验身份一致性、便利信息填写","银行卡支付绑卡、需实名制验证或管理的金融场景","身份证后四位、授权token","API接口"]]}]},Se={title:"《个人信息收集清单》",blocks:[{kind:"h1",text:"个人信息收集清单"},{kind:"p",text:"个人信息：身份证号码后四位"},{kind:"p",text:"收集目的：身份一致性核验和便利信息填写"},{kind:"p",text:"收集场景：银行卡支付绑卡、需实名制验证或管理的金融场景"},{kind:"p",text:"收集方式：从自有H5页面或通过JSSDK由第三方收集"},{kind:"p",text:"收集频率：业务触发时收集"},{kind:"p",text:"个人信息：手机号码、姓名、身份证号码前十四位"},{kind:"p",text:"收集目的：身份一致性核验和便利信息填写"},{kind:"p",text:"收集场景：银行卡支付绑卡、需实名制验证或管理的金融场景"},{kind:"p",text:"收集方式：从第三方收集"},{kind:"p",text:"收集频率：业务触发时收集"}]},be={title:"《用户认证服务隐私政策》",blocks:[{kind:"h1",text:"用户认证服务隐私政策"},{kind:"p",text:"发布日期：【2026】年【7】月【3】日"},{kind:"p",text:"生效日期：【2026】年【7】月【3】日"},{kind:"p",text:"版本号：V1.0_2026"},{kind:"p",text:"银联商务支付股份有限公司（以下简称“我们”）非常重视用户（以下简称“您”，如用户为法人或其他组织的，在本政策中所称的用户或“您”亦包含在使用我们产品或服务过程中实际操作账户的自然人）的个人信息保护，我们将在向您提供服务时，按照本隐私政策（以下简称“本政策”）收集、使用、存储、共享、转让或以其他方式处理您的个人信息，我们也会通过本政策向您说明您可以如何管理您的个人信息。本政策与您使用我们的各项服务关系密切，我们在此特别提醒您：在使用我们提供的服务前，请您仔细阅读并了解本政策的全部内容，特别是其中可能与您的合法利益存在重大关系的条款（为了特别提示您并便于您的阅读，我们采用字体加粗或其他显著格式提请您注意），并在此基础上作出您认为适当的选择。如您对本政策内容有疑问，您可以通过本政策列明的联系方式与我们联系。本政策适用于在中华人民共和国境内(为了本隐私政策的目的，港、澳、台地区除外)收集、使用、存储及对外提供您的个人信息的行为。如果您勾选“我已阅读并同意”（具体表述以产品界面为准）并确认提交，即视为您同意本政策并授权我们按照本政策规定处理您的个人信息。"},{kind:"b",text:"本政策将帮助您了解以下内容："},{kind:"li",text:"定义"},{kind:"li",text:"适用范围"},{kind:"li",text:"个人信息的收集和使用"},{kind:"li",text:"我们如何委托处理、对外提供、转让、公开披露您的个人信息"},{kind:"li",text:"我们如何保存您的信息"},{kind:"li",text:"我们如何保护您的信息"},{kind:"li",text:"我们如何保护未成年人的个人信息"},{kind:"li",text:"用户权利"},{kind:"li",text:"本隐私政策的更新"},{kind:"li",text:"如何联系我们"},{kind:"h1",text:"一、定义"},{kind:"p",text:"个人信息：指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息。个人信息包括但不限于姓名、出生日期、身份证件号码、个人生物识别信息、住址、通信通讯联系方式、通信记录和内容、账号密码、财产信息、征信信息、行踪轨迹、住宿信息、健康生理信息、交易信息等。"},{kind:"p",text:"敏感个人信息：指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息。敏感个人信息包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。"},{kind:"p",text:"去标识化：指个人信息经过处理，使其在不借助额外信息的情况下无法识别特定自然人的过程。"},{kind:"p",text:"匿名化：指个人信息经过处理无法识别特定自然人且不能复原的过程。"},{kind:"p",text:"设备：指可用于访问我们的产品和/或服务的装置，例如台式计算机、笔记本电脑、平板电脑或智能手机。"},{kind:"p",text:"唯一设备识别码（专属ID或UUID）：指由设备制造商编入到设备中的一串字符，可用于以独有方式标识相应设备（如IMEI / android ID / IDFA / OpenUDID / GUID / SIM卡IMSI信息等）。"},{kind:"p",text:"IP地址：每台上网的设备都会被指定一个编号，称为互联网协议(IP)地址。这些编号通常都是根据地理区域指定的。IP地址通常可用于识别设备连接至互联网时所在的区域。"},{kind:"li",text:"适用范围"},{kind:"p",text:"本政策适用于【用户认证服务】。如关联公司在其产品或服务中使用了我们的产品或服务，但未设置独立隐私政策的，则本政策同样适用于该用户认证服务部分产品或服务。关联公司就其向您提供的产品或服务单独设立隐私政策的，则相应产品或服务适用该隐私政策。"},{kind:"p",text:"本政策不适用于通过我们的产品或服务而接入的其他第三方所收集的信息，其他第三方有自己的隐私政策，建议您查看并了解其个人信息保护政策。我们会尽商业上的合理努力要求这些主体对您的个人信息采取保护措施，但我们无法保证这些主体一定会按照我们的要求采取保护措施，请您与他们直接联系以获得关于他们的个人信息保护政策的详细情况。如您发现这些第三方创建的网页或第三方开发的应用程序存在风险时，建议您终止相关操作以保护您的合法权益。"},{kind:"li",text:"个人信息的收集和使用"},{kind:"p",text:"我们会按照合法、正当、必要、诚信的原则，收集您因使用服务所产生的、在使用服务时主动提供的信息以及根据法律法规规定或您的同意合法向第三方收集的个人信息，用以向您提供服务。"},{kind:"li",text:"收集的情形"},{kind:"p",text:"1．支付绑卡、实名制验证或管理"},{kind:"p",text:"在您使用【我们及其合作商户的银行卡支付绑卡等支付场景、需实名制验证或管理的金融场景】功能时，出于身份有效性核验和便利信息填写的目的，我们会收集您的【身份证后四位】信息，从第三方【中移互联网有限公司及中国移动通信集团有限公司】收集您的【手机号码、姓名、身份证前十四位】。如您不同意收集、提供上述信息，我们将无法完成对您的身份有效性核验，您将无法使用信息便利填写相关功能。"},{kind:"p",text:"您授权我们将您填写的身份证号码后四位提供给中国移动通信集团有限公司及其关联公司，中国移动通信集团有限公司及其关联公司将使用您在中国移动预留的身份证号码、手机号码进行身份证号码后四位校验，校验成功后，您授权中国移动及其关联公司将您的加密本机号码以及对应的【姓名/身份证前十四位】信息将以密文形式存放到您的中移互联可信数据空间中，并授权中国移动及其关联公司将您的手机号、身份证前十四位、姓名提供给我们。为保障您的数据安全，在您的【姓名/身份证前十四位】信息输出后，中国移动通信集团有限公司及其关联公司将从中移互联可信数据空间中删除您的【姓名/身份证前十四位】信息。"},{kind:"p",text:"请您理解，在您使用服务的过程中，如您同意向第三方提供其他个人信息的，请在第三方的相关页面提供，我们不会收集您向第三方提交的该等个人信息。"},{kind:"b",text:"我们在《个人信息收集清单》中更加简洁、直观地展示了我们收集的个人信息（包括收集频率、信息类型、采用目的、场景描述）。"},{kind:"li",text:"在向您提供服务的过程中，我们可能涉及收集、使用、存储或以其他方式处理您的敏感个人信息，我们处理您的敏感个人信息是向您提供对应功能或服务所必需的。对您个人权益的影响是敏感个人信息一旦泄露或者非法使用，容易导致您的人格尊严受到侵害或者人身、财产安全受到危害。敏感个人信息处理详情请参阅《敏感个人信息处理规则》"},{kind:"li",text:"征得同意的例外"},{kind:"b",text:"您充分知晓，根据相关法律法规，以下情形中，我们收集、使用您的个人信息无需征得您的授权同意："},{kind:"li",text:"为我们履行法律法规规定的义务所必需；"},{kind:"li",text:"为订立、履行您作为一方当事人的合同所必需；"},{kind:"li",text:"为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"li",text:"为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理您的个人信息；"},{kind:"li",text:"依法在合理的范围内处理您自行公开或者其他已经合法公开的个人信息；"},{kind:"li",text:"法律法规规定的其他情形。"},{kind:"li",text:"我们如何使用您的个人信息"},{kind:"p",text:"为了遵守国家法律法规及监管要求、向您提供相应服务并实现风险防控目的，实现风险防控的目的，您同意并授权我们在以下情形中使用您的信息："},{kind:"li",text:"实现本政策中“我们如何收集您的个人信息”所述目的；"},{kind:"li",text:"为了保障服务的稳定性与安全性，我们会将您的个人信息用"},{kind:"li",text:"于身份验证、安全防范、诈骗监测、预防、降低风险或禁止非法活动；"},{kind:"li",text:"根据法律法规或监管要求向相关部门进行报告。"},{kind:"b",text:"当我们要将您的个人信息用于本政策未载明的其他用途时，我们会按照法律法规的要求再次征得您的同意。"},{kind:"li",text:"我们如何委托处理、对外提供、转让、公开披露您的个人信息"},{kind:"li",text:"委托处理"},{kind:"p",text:"在我们向您提供产品和服务的过程中，为了提升信息处理效率，降低信息处理成本，或提高信息处理准确性，请您理解，我们可能会委托有能力的我们的关联公司或其他专业机构代表我们来处理您的个人信息。我们仅会在您向我们所授权的处理目的、方式、范围内或基于法律规定的合法情形，在合法、正当的前提下委托受托方处理您的信息，并将根据法律规定对受托处理方进行约束与监督。我们会要求受托公司履行严格的保密义务并采取有效的保密措施，并按照相关法律法规要求妥善处理您的个人信息。"},{kind:"li",text:"对外提供"},{kind:"p",text:"原则上，除以下所列情形外，我们不会向第三方提供您的个人信息。我们将要求第三方对您的信息采取保护措施，并且严格遵守相关法律法规及监管要求。在取得您单独同意后，我们仅会出于合法、正当、必要、明确的目的提供您的个人信息，并且只会提供服务所必要的个人信息，法律法规另有规定的除外。"},{kind:"li",text:"事先获得您的单独同意；"},{kind:"li",text:"根据法律法规规定、法律程序、政府的强制命令或司法裁定，对外提供您的个人信息；"},{kind:"li",text:"在法律要求或允许的范围内，为了保护用户或社会公众的利益、财产或安全免遭损害而有必要向第三方提供您的个人信息；"},{kind:"li",text:"我们可能会向我们的关联公司提供您的个人信息，我们只会提供必要的个人信息并会单独征得您的同意。我们仅会出于合法、正当且必要的目的向我们的关联公司共享您的个人信息，且仅会共享所提供产品或服务所必要的个人信息。"},{kind:"li",text:"5、依法取得您的单独同意后，我们可能会向相关合作机构提供您的个人信息,以确保您在银行卡支付绑卡等支付场景、需实名制验证或管理的金融场景中使用相关功能时的身份一致性核验和便利填写。"},{kind:"li",text:"我们向第三方共享个人信息的具体情况详见《第三方共享个人信息清单》，我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供功能和服务所必要的个人信息。我们会要求接收方对获取的个人信息严格保密和依法使用，接收方无权将共享的个人信息用于任何其他用途，法律法规另有规定和接收方依法另行取得您同意的除外。"},{kind:"li",text:"转让"},{kind:"b",text:"我们一般不会对外转让您的个人信息。根据法律法规规定，在我们因合并、分立、解散、被宣告破产等原因需要转让个人信息的，我们会告知您接收方的名称或者姓名和联系方式。接收方变更原先的处理目的、处理方式的，应当依照法律法规规定重新取得您的同意。"},{kind:"li",text:"公开披露"},{kind:"b",text:"我们不会公开披露您的个人信息，依法获得您同意的除外。"},{kind:"li",text:"征得同意的例外"},{kind:"b",text:"根据相关法律法规，在以下情形中，我们可能会依法共享、转让、公开披露您的个人信息，无需征得您的同意:"},{kind:"li",text:"为我们履行法律法规规定的义务所必需；"},{kind:"li",text:"为订立、履行您作为一方当事人的合同所必需；"},{kind:"li",text:"为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；"},{kind:"li",text:"为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理您的个人信息；"},{kind:"li",text:"依法在合理的范围内处理您自行公开或者其他已经合法公开的个人信息；"},{kind:"li",text:"法律法规规定的其他情形。"},{kind:"li",text:"我们如何保存您的个人信息"},{kind:"h2",text:"（一）保存地点"},{kind:"b",text:"我们依照法律法规的规定，仅会将收集到的有关您的个人信息存储于中华人民共和国境内。目前我们暂时不存在跨境存储您的个人信息或向境外提供个人信息的场景。如果确有必要进行个人信息的跨境传输，我们会向您明确告知（包括境外接收方的名称或者姓名、联系方式、处理目的、处理方式、个人信息的种类以及个人向境外接收方行使《个人信息保护法》规定权利的方式和程序等），并征得您的单独同意，法律法规另有规定的除外。我们会确保境外接收方有充足的数据保护能力来保护您的个人信息。"},{kind:"h2",text:"（二）保存期限"},{kind:"b",text:"除法律、行政法规另有规定外，我们仅会在为实现处理目的所必要的最短时间内保存您的个人信息。我们将结合以下标准确定个人信息的保存期限：我们为您提供相应功能或服务的期限、我们所承担的法律义务以及合同义务等。超出前述保存期限后，我们会对您的个人信息进行删除或匿名化处理。"},{kind:"b",text:"如我们停止运营，我们将及时停止继续收集您个人信息的活动，并将停止运营的通知以逐一送达或公告的形式通知您，并在终止服务或运营后对所持有的个人信息进行删除或匿名化处理。"},{kind:"b",text:"法律、行政法规规定的保存期限未届满，或者删除、匿名化处理个人信息从技术上难以实现的，我们会停止除存储和采取必要的安全保护措施之外的处理。"},{kind:"li",text:"我们如何保护您的个人信息"},{kind:"h2",text:"我们保护您个人信息的技术与措施"},{kind:"p",text:"1、我们非常重视信息安全，成立了专门的负责团队。我们努力为您提供信息保护，采取了合适的管理、技术以及物理安全措施，参照国内外信息安全标准及最佳实践建立了与业务发展相适应的信息安全保障体系。"},{kind:"p",text:"2、我们使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。从数据的生命周期角度出发，在数据收集、存储、显示、处理、使用、销毁等各个环节建立了安全防护措施，根据信息敏感程度的级别采取不同的控制措施，包括但不限于访问控制、SSL（Secure Socket Layer）加密传输、加密存储、敏感信息脱敏显示等。我们已采取符合业界标准、合理可行的安全防护措施保护您提供的个人信息安全，使用加密技术提高个人信息的安全性，使用受信赖的保护机制防止个人信息遭到恶意攻击，防止个人信息遭到未经授权访问、公开披露、使用、修改、损坏或丢失。"},{kind:"p",text:"3、我们部署了访问控制机制，尽力确保只有授权人员才可访问个人信息。我们对可能接触到您信息的员工也采取了严格管理，可监控他们的操作情况，对于数据访问、内外部传输、使用、脱敏、解密等重要操作建立了审批机制，并与上述员工签署保密协议等。与此同时，我们还定期对员工进行信息安全培训，要求员工在日常工作中形成良好操作习惯，提升数据保护意识。"},{kind:"p",text:"4、我们非常重视信息安全，成立了专门的负责团队。我们努力为您提供信息保护，采取了合适的管理、技术以及物理安全措施，参照国内外信息安全标准及最佳实践建立了与业务发展相适应的信息安全保障体系。"},{kind:"p",text:"5、尽管我们采取了前述的安全措施，但同时也请您理解在网络上不存在“完善的安全措施”。我们会按现有的技术提供相应的安全措施来保护您的信息，提供合理的安全保障，我们将尽力做到使您的信息不被泄露、损毁或丢失。"},{kind:"p",text:"6、请您及时保存或备份您的文字、图片等其他信息，您需理解并接受，您接入我们的服务所用的系统和通讯网络，有可能因超出我们控制范围的因素而出现问题。"},{kind:"h2",text:"安全事件处置"},{kind:"p",text:"在不幸发生个人信息安全事件后，我们会启动应急预案，阻止安全事件扩大，并将按照中华人民共和国法律法规的要求向您告知安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施等。我们将以邮件、电话、推送通知等方式告知您事件相关情况，难以逐一告知个人信息主体时，我们会采取合理、有效的方式发布公告。同时，我们还将按照监管部门要求，主动上报信息安全事件的处置情况。"},{kind:"li",text:"我们如何保护未成年人的个人信息"},{kind:"p",text:"按照中华人民共和国相关法律规定，未满18周岁为未成年人，不满14周岁的未成年人为儿童。"},{kind:"p",text:"【用户认证服务】主要面向成年人，如未经父母或监护人同意，我们不向未成年人，尤其是未满14周岁儿童提供相关服务。如您是未成年人的父母或监护人，我们提示您正确履行监护职责，保护未成年人个人信息安全。若您所监护的未成年人使用我们的服务的，您应予以正确引导和监护。"},{kind:"li",text:"用户权利"},{kind:"p",text:"我们非常重视您对个人信息的关注，并尽力保障您对于您个人信息的删除等权利，以使您能够充分保障自身的隐私和安全。您的权利包括："},{kind:"li",text:"删除您的个人信息"},{kind:"p",text:"我们为您提供了向我们提出删除的方式。如您在此访问过程中遇到操作问题或您需要删除您在使用我们服务过程中产生的其他个人信息，您可通过本政策载明的联系方式联系我们，只要我们无需过多投入，我们会在合理的范围内为您删除，法律法规另有规定的除外。"},{kind:"p",text:"在以下情形中，您可以向我们提出删除个人信息的请求，但已做匿名化处理或法律法规另有规定的除外："},{kind:"li",text:"处理目的已实现、无法实现或者为实现处理目的不再必要；"},{kind:"li",text:"我们停止提供产品或者服务，或者保存期限已届满；"},{kind:"li",text:"您撤回同意；"},{kind:"li",text:"我们违反法律、行政法规或者违反约定处理个人信息；"},{kind:"li",text:"法律、行政法规规定的其他情形。"},{kind:"p",text:"当您或我们协助您删除相关信息后，因适用的法律和安全技术限制，我们可能无法立即从备份系统中删除相应的信息，我们将安全地保存您的个人信息并限制对其任何进一步的处理，直到备份可以清除或实现匿名化。此外，如法律、行政法规规定的保存期限未届满，或者删除个人信息从技术上难以实现的，我们也无法立即删除您的相应个人信息，但会停止除存储和采取必要的安全保护措施之外的处理活动。"},{kind:"li",text:"改变您授权同意的范围或撤回您的授权"},{kind:"p",text:"您可以通过本政策载明的联系方式联系我们的方式改变您授权的范围或撤回您的授权，我们将不再基于对应权限继续收集和使用相关个人信息，也无法继续为您提供该权限所对应的服务。您改变授权的范围或撤回您授权的决定不会影响此前基于您的授权所进行的信息收集及使用。。"},{kind:"p",text:"请您理解，每个业务功能需要一些基本的个人信息才能完成，在您撤回同意或授权后，我们将无法继续为您提供撤回同意或授权所对应的服务，也不再处理您相应的个人信息。但您撤回同意或授权的决定，不会影响此前基于您的授权而开展的个人信息处理。"},{kind:"li",text:"个人信息副本的获取与个人信息转移"},{kind:"p",text:"您有权获取您的个人信息副本，您可以通过拨打本政策载明的客服电话申请。如您请求将您的个人信息转移至您指定的个人信息处理者，且该等转移符合能够验证您的真实身份、所转移的是您本人同意提供的或者基于合同收集的个人信息、具备技术可行性、不损害他人合法权益等国家网信部门规定条件的，我们将提供转移的途径。如您请求转移个人信息的次数等明显超出合理范围的，我们将根据转移个人信息的成本收取必要费用。"},{kind:"li",text:"约束信息系统自动化决策"},{kind:"p",text:"在某些业务功能中，我们可能仅依据包括信息系统、算法等在内的非人工自动决策机制做出决定。如果这些决定显著影响您的合法权益，您有权要求我们做出解释，我们也将提供适当的救济方式。"},{kind:"li",text:"响应您的请求"},{kind:"p",text:"如您需要行使其他个人信息法定权利，请通过本政策载明的联系方式联系我们。"},{kind:"p",text:"为了保障您个人信息的安全，我们可能需要您提供书面请求，或以其他方式证明您的身份，我们将在收到您反馈并验证您的身份后在15天内处理您的请求。对于您合理的请求，我们原则上不收取费用，但对多次重复、超出合理限度的请求，我们将视情收取一定成本费用。对于那些无端重复、需要过多技术手段（例如，需要开发新系统或从根本上改变现行惯例）、给他人合法权益带来风险或者非常不切实际的请求，我们可能会予以拒绝。"},{kind:"b",text:"请您谅解，在以下情形中，按照法律法规要求，我们将无法响应您的请求："},{kind:"li",text:"与国家安全、国防安全有关的；"},{kind:"li",text:"与公共安全、公共卫生、重大公共利益有关的；"},{kind:"li",text:"与犯罪侦查、起诉、审判和执行判决等有关的；"},{kind:"li",text:"有充分证据表明您存在主观恶意或滥用权利的；"},{kind:"li",text:"响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；"},{kind:"li",text:"涉及商业秘密的；"},{kind:"li",text:"出于维护个人信息主体或其他个人的生命、财产等重大合法权益且难以取得本人授权同意的。"},{kind:"li",text:"隐私政策的更新"},{kind:"p",text:"根据国家法律法规的规定以及提供功能和服务、业务运营的需要，我们可能对本政策进行部分或全部修订。但未经您明确同意，我们不会削减您依据本政策所应享有的权利。当下列事项发生变更时，我们会适时对本政策进行更新："},{kind:"li",text:"我们的名称和联系方式；"},{kind:"li",text:"个人信息的处理目的、处理方式，处理的个人信息种类、保存期限；"},{kind:"li",text:"您行使法定权利的方式和程序；"},{kind:"li",text:"法律、行政法规规定应当告知的其他事项。"},{kind:"b",text:"如本政策发生更新，我们可能选择以APP推送通知、弹窗提示、发送邮件/短消息或者发布公告或其他适当的方式来通知您。请您在充分理解我们修改后的隐私政策的基础上，作出您认为适当的选择。如您不同意本政策更新后的内容，应立即停止使用我们提供的服务。"},{kind:"li",text:"如何联系我们"},{kind:"p",text:"如果您有任何疑问、投诉、意见、举报或建议，您可以通过以下方式与我们联系："},{kind:"b",text:"客服电话：95534"},{kind:"b",text:"个人信息保护负责人邮箱：yszc@chinaums.com"},{kind:"b",text:"联系地址：中国(上海)自由贸易试验区张衡路1006、1008号"},{kind:"p",text:"我们会尽最大努力为您提供满意的解决方案，一般情况下，我们将在15天内处理您的疑问、投诉、意见、举报或建议。"},{kind:"b",text:"如果您对我们的回复不满意，特别是认为我们的个人信息处理行为损害了您的合法权益，您还可以向人民银行、支付清算协会、网信、电信、公安及工商等监管部门进行投诉或举报，或向被告住所地有管辖权的人民法院提起诉讼。"}]},ye={entry:Cr,sft:Dr,cmcc:Br,"sensitive-info-rules":_e,"third-party-sharing-list":mr,"personal-info-collection-list":Se,"user-auth-privacy-policy":be,"haike-v2-third-party-sharing":pr,"haike-v2-privacy-policy":kr,"haike-v2-cmcc-privacy-policy":lr,"tiantianyoubao-v2-third-party-sharing":Ar,"tiantianyoubao-v2-privacy-policy":Er,"tiantianyoubao-v2-cmcc-privacy-policy":vr,"dongfangdadi-v2-third-party-sharing":ar,"dongfangdadi-v2-privacy-policy":sr,"dongfangdadi-v2-cmcc-privacy-policy":cr,"anxingtianxia-v2-third-party-sharing":xr,"anxingtianxia-v2-privacy-policy":dr,"anxingtianxia-v2-cmcc-privacy-policy":or,"hengda-v2-third-party-sharing":fr,"hengda-v2-privacy-policy":hr,"hengda-v2-cmcc-privacy-policy":ur};function _r(t){return Object.prototype.hasOwnProperty.call(ye,t)}function Fe(t){return _r(t)?ye[t]:null}const Sr=["10037e6f9d903f86019ed8cfb6320365","8a9481c79c05c8bd019ed8d49fb81df2"],ge="8a9481c79c05c8bd019ed8d7ab571df3",Ie="8a9481c79c05c8bd019f6f42956924a0",br="8a9481c79c05c8bd019f6a0a6c002457",yr="8a9481c79c05c8bd019f8e3061ce25ee",Fr="8a9481c69c05c8c1019ffa21d9722a4b",gr={"haike-v2":{key:"haike-v2",thirdPartySharingDocKey:"haike-v2-third-party-sharing"},"tiantianyoubao-v2":{key:"tiantianyoubao-v2",thirdPartySharingDocKey:"tiantianyoubao-v2-third-party-sharing"},"dongfangdadi-v2":{key:"dongfangdadi-v2",thirdPartySharingDocKey:"dongfangdadi-v2-third-party-sharing"},"anxingtianxia-v2":{key:"anxingtianxia-v2",thirdPartySharingDocKey:"anxingtianxia-v2-third-party-sharing"},"hengda-v2":{key:"hengda-v2",thirdPartySharingDocKey:"hengda-v2-third-party-sharing"},yuanbao:{key:"yuanbao",thirdPartySharingDocKey:"third-party-sharing-list"}},we={[ge]:"haike-v2",[Ie]:"tiantianyoubao-v2",[br]:"dongfangdadi-v2",[yr]:"anxingtianxia-v2",[Fr]:"hengda-v2",...Object.fromEntries(Sr.map(t=>[t,"yuanbao"]))};function Ir(t){if(typeof t!="string")return null;const x=t.trim();if(!Object.prototype.hasOwnProperty.call(we,x))return null;const n=we[x];return n?gr[n]:null}function wr(t){return typeof window>"u"||t?.trim()!==ge?!1:new URLSearchParams(window.location.search).get("layout")==="inline"}function Te(t,x){const{origin:n,pathname:i}=window.location,c=x?.trim(),o=c?`&appId=${encodeURIComponent(c)}`:"",m=wr(x)?"&layout=inline":"";return`${n}${i}?flow=agreement&doc=${encodeURIComponent(t)}${o}${m}`}function Tr(t){return Te("entry",t)}const Re="《用户信息授权协议》",Rr="《第三方共享个人信息清单》",Pe=[{key:"user-auth-privacy-policy",doc:be},{key:"personal-info-collection-list",doc:Se},{key:"sensitive-info-rules",doc:_e}];function Pr(t,x){return[{name:Re,link:x?x("entry",t):Tr(t)}]}function He(t={}){const{appId:x,callerAgreements:n=[],preserveReservedCallerAgreement:i=!1,docUrlResolver:c}=t,m=Ir(x)?.thirdPartySharingDocKey??"third-party-sharing-list",f=Fe(m),E=x?.trim()!==Ie,e=f&&E?[...Pe,{key:m,doc:f}]:Pe,r=i?n:n.filter(({name:D})=>D.trim()!==Rr);return[...e.map(({key:D,doc:d})=>({name:d.title,link:c?c(D,x):Te(D,x)})),...r]}function Ne(t){const x=new URL(t.loaderUrl);if(!["http:","https:"].includes(x.protocol)||!t.sessionId.trim()||Xi(t.parentOrigin)!==t.parentOrigin)throw new TypeError("Invalid custom verification identity or loader URL");return x.search="",x.hash="",x.searchParams.set("sessionId",t.sessionId),x.searchParams.set("parentOrigin",t.parentOrigin),x.searchParams.set("role",t.mode),t.docKey&&x.searchParams.set("doc",t.docKey),x.href}function Hr(t,x,n){const i=new Map,c={},o=window.location.origin,m=window.location.href;function f(y){const u=Ne({loaderUrl:m,mode:"agreement",docKey:y,sessionId:t.sessionId,parentOrigin:o});if(!i.has(u)){i.set(u,y);const _=Fe(y);if(_){c[y]=_;for(const I of _.blocks)if(I.kind==="table")for(const F of I.rows.flat())typeof F!="string"&&F.kind==="doc-link"&&f(F.docKey)}}return u}const E=Pr(t.appId,f),e=He({appId:t.appId,docUrlResolver:f}),r=He({appId:t.appId,docUrlResolver:f,callerAgreements:t.agreements,preserveReservedCallerAgreement:!0}),D=r.map((y,u)=>({name:y.name,link:y.link,...u<e.length?{docKey:i.get(y.link)}:{}}));let d,p,l,A=!1,k,v=!1;const a=new WeakSet,s=y=>{for(let u=y;u;u=u.parentElement){const _=window.getComputedStyle(u);if(u.hidden||_.display==="none"||_.visibility==="hidden")return!1}return!0};function h(){if(!d||v)return;const y=[...d.querySelectorAll(".ydrz-confirm-iframe")];y.forEach(_=>_.querySelectorAll(".ydrz-confirm-header em").forEach(I=>{I.getAttribute("role")!=="button"&&I.setAttribute("role","button"),I.getAttribute("aria-label")!=="关闭协议"&&I.setAttribute("aria-label","关闭协议"),I.tabIndex!==0&&(I.tabIndex=0)}));const u=y.some(_=>_.querySelector("iframe")&&s(_));u!==A&&(A=u,A&&(k=document.activeElement instanceof HTMLElement?document.activeElement:void 0),l?.(A),!A&&k?.isConnected&&k.focus({preventScroll:!0}))}function S(y){y.contentWindow?.postMessage(ut("ASSISTANCE_AUTH_CLOSE",t.sessionId),o);const u=y.closest(".ydrz-confirm-iframe"),_=u.querySelector(".ydrz-confirm-header em");_?_.click():(u.closest(".ydrz-confirm-bg-wrap")??u).remove(),h()}function C(y){if(!d||v||y.origin!==o||!ji(y.data,t.sessionId))return;const u=[...d.querySelectorAll(".ydrz-confirm-iframe iframe")].find(_=>_.contentWindow===y.source&&i.has(_.src));if(u&&(h(),!v)){if(y.data.type==="ASSISTANCE_AUTH_READY"){const _=i.get(u.src),I={mode:"agreement",sessionId:t.sessionId,parentOrigin:o,docKey:_,docs:c,entries:D,css:n.css,styleUrls:n.urls,rootAttributes:n.rootAttributes};u.contentWindow.postMessage(ut("ASSISTANCE_AUTH_CUSTOM_BOOT",t.sessionId,{runtimeSource:x,config:I}),o)}else if(y.data.type==="ASSISTANCE_AUTH_CLOSE")S(u);else if(y.data.type==="ASSISTANCE_AUTH_ERROR_NOTICE"||y.data.type==="ASSISTANCE_AUTH_ERROR"){if(a.has(u))return;a.add(u);const _=y.data.payload;window.parent.postMessage(ut("ASSISTANCE_AUTH_ERROR_NOTICE",t.sessionId,{message:typeof _?.message=="string"?_.message:"阅读资源加载失败，请关闭后重试。",phase:"agreementReader"}),t.parentOrigin)}}}function B(y){(y.key==="Enter"||y.key===" ")&&y.target instanceof HTMLElement&&d?.contains(y.target)&&y.target.matches(".ydrz-confirm-iframe .ydrz-confirm-header em")&&(y.preventDefault(),y.target.click())}function b(){if(!v){v=!0,p?.disconnect(),window.removeEventListener("message",C),document.removeEventListener("keydown",B);for(const y of d?.querySelectorAll(".ydrz-confirm-iframe iframe")??[])i.has(y.src)&&y.contentWindow?.postMessage(ut("ASSISTANCE_AUTH_CLOSE",t.sessionId),o)}}return{agreeArr:E,childArr:r,observe(y,u){v||(p?.disconnect(),d=y,l=u,p=new MutationObserver(h),p.observe(d,{subtree:!0,childList:!0,attributes:!0,attributeFilter:["class","style","hidden","src"]}),window.addEventListener("message",C),document.addEventListener("keydown",B),h())},dispose:b}}async function Nr(t,x,n={}){const i=new AbortController,c=ui();let o,m,f=!1,E=!1,e,r=!1,D=!1,d=!1,p=!1,l="",A=!1,k=!1,v,a,s,h,S,C,B,b=0,y=!1,u=0;const _=new WeakSet,I=t.agreements.map(()=>!1),F={phase:"initializing",idLast4:"",inputError:null,message:null,agreementReaderOpen:!1},P=()=>!f&&!E&&!i.signal.aborted,H=(N,K)=>{!f&&!x.signal.aborted&&window.parent.postMessage(ut(N,t.sessionId,K),t.parentOrigin)},L=()=>{P()&&q.publish(F)},Y=()=>{k=!1,clearInterval(s),clearTimeout(h),s=void 0,h=void 0};function W(){if(!f){f=!0,clearTimeout(C),clearTimeout(B),clearTimeout(S),Y(),v?.disconnect(),a?.disconnect();try{m?.dispose()}catch{}x.signal.removeEventListener("abort",W);try{i.abort()}catch{}try{q.dispose()}catch{}try{o?.dispose()}catch{}if(D||n.recoverableSubmitErrors)try{c.clearControl()}catch{}}}function $(N,K){if(P()){E=!0,F.phase=N==="ASSISTANCE_AUTH_SUCCESS"?"completed":"error";try{q.publish(F),e?(F.phase="error",H("ASSISTANCE_AUTH_ERROR",{code:"CUSTOM_PAGE_FAILED",message:n.safeErrorNotices?G("CUSTOM_PAGE_FAILED"):e.message})):H(N,K)}finally{W()}}}const G=N=>{const K=ht(N);return K.errorKind==="unknown"?"验证失败，请稍后重试。":K.uiText},g=(N,K="CUSTOM_PAGE_FAILED",O)=>{n.safeErrorNotices&&(N=G(K),F.message=N),$("ASSISTANCE_AUTH_ERROR",{code:K,message:N,...O?{phase:O}:{}})},T=(N=b)=>{if(!n.syncSubmitState||!P()||N!==b||!y||p)return;const K=F.phase==="ready"&&/^[0-9X]{4}$/.test(F.idLast4)&&I.every(Boolean);try{c.updateSubmitBtnStatus({disabled:!K,loading:!1})}catch(O){g(O instanceof Error?O.message:String(O))}},R=()=>P()?!r&&Date.now()>=t.deadline?(g("Customer page startup deadline exceeded","NETWORK_TIMEOUT"),!1):!0:!1,w=N=>{clearTimeout(S),F.message=N,L(),P()&&(S=setTimeout(()=>{F.message=null,L()},1400))},q=Zi({callerAgreementCount:t.agreements.length,onIdLast4(N){if(!P()||p)return;const K=F.idLast4.length===4;F.idLast4=N;const O=N.length===4;O&&(F.inputError=null),L(),T(),P()&&r&&O!==K&&(t.stateChangeEnabled||O&&t.beforeLoginNotificationEnabled)&&H("ASSISTANCE_AUTH_STATE_CHANGE",{event:{type:O?"idLast4Complete":"idLast4Incomplete"}})},onCallerAgreement(N,K){!P()||p||(I[N]=K,T())},onClose(){$("ASSISTANCE_AUTH_CANCEL",{message:"用户取消验证"})},onError(N,K){if(E&&!f&&K==="hook"){e=N;return}P()&&(!r||K==="hook"?g(N.message):p||w(n.safeErrorNotices?"请检查输入和协议后重试。":N.message))}});x.signal.addEventListener("abort",W,{once:!0}),x.signal.aborted&&i.abort();const V={signal:i.signal,deadline:t.deadline},Q=N=>{P()&&H("ASSISTANCE_AUTH_ERROR_NOTICE",{message:n.safeErrorNotices?ht("CDN_BLOCKED").uiText:N,phase:"resourceLoad"})};function M(N,K){if(!P())return;const O=Si(N),X=ht(O.code),j=n.safeErrorNotices?G(O.code):X.uiText;if(Je(N)==="cancel"){$("ASSISTANCE_AUTH_CANCEL",{code:O.code||void 0,message:n.safeErrorNotices?"用户取消验证":O.desc||X.uiText});return}if(!r){g(j,O.code||"PROVIDER_VERIFY_FAILED",n.safeErrorNotices?K:void 0);return}if(_.has(N)||(_.add(N),H("ASSISTANCE_AUTH_ERROR_NOTICE",{code:O.code||void 0,message:n.safeErrorNotices?j:O.code==="ALL_CARRIERS_FAILED"?X.uiText:O.desc.trim()||X.uiText,phase:K,...!n.safeErrorNotices&&O.carrier!=="unknown"?{carrier:O.carrier}:{}})),n.recoverableSubmitErrors){K==="initControl"&&p&&l.length===4&&(O.code==="105999"||O.code==="103135")?(p=!1,l="",F.phase="initializing",F.message=j,clearTimeout(S),ot(!0)):g(j,O.code||"PROVIDER_VERIFY_FAILED",n.safeErrorNotices?K:void 0);return}if(p){g(X.uiText,O.code||"PROVIDER_VERIFY_FAILED");return}F.phase="error",F.message=X.uiText,L()}function ot(N=!1){const K=++b;y=!1;const O=N?Date.now()+15e3:t.deadline;let X=!1;const j=()=>!P()||K!==b?!1:N&&!X&&Date.now()>=O?(g(ht("NETWORK_TIMEOUT").uiText,"NETWORK_TIMEOUT"),!1):!0;if(!(N&&(clearTimeout(B),B=setTimeout(()=>{j()&&g(ht("NETWORK_TIMEOUT").uiText,"NETWORK_TIMEOUT")},15e3),L(),!P())))try{D=!0,c.initControl({styleOption:rr({customer:t.styleOption,agreeArr:m.agreeArr,childArr:m.childArr}),beforeSubmit(){if(!j()||!X||p)return!1;if(F.idLast4.length!==4||I.some(U=>!U)){if(F.idLast4.length!==4?(F.inputError="请输入身份证后四位",L()):w("请先同意全部协议"),n.syncSubmitState)T(K);else if(P())try{c.updateSubmitBtnStatus({disabled:!1,loading:!1})}catch{}return!1}return p=!0,l=F.idLast4,F.phase="submitting",F.message="验证中",L(),P()},authReady(){if(!(!j()||X||!N&&!R())&&(X=!0,y=!0,r=!0,clearTimeout(C),clearTimeout(B),F.phase="ready",N||(F.message=null),L(),!!P())){if(n.syncSubmitState){if(T(K),!j())return}else if(N)try{c.updateSubmitBtnStatus({disabled:!1,loading:!1})}catch(U){g(U instanceof Error?U.message:String(U));return}N||(H("ASSISTANCE_AUTH_PRESENTATION_READY"),at())}},success(U){if(!j())return;if(String(U.code??"")!=="103000"){M(U,"initControl");return}if(!p||l.length!==4){g("验证结果返回异常，请稍后重试。","INVALID_SUCCESS_PAYLOAD");return}const nt=typeof U.token=="string"?U.token.trim():"",st=typeof U.encryptPublicKey=="string"?U.encryptPublicKey.trim():"";if(!nt){g("本次授权未返回有效 token，请重新授权后再试。","TOKEN_MISSING");return}if(!st){g("本次授权未返回 keyA，请重新授权后再试。","KEY_A_MISSING");return}$("ASSISTANCE_AUTH_SUCCESS",{status:"success",token:nt,idLast4:l,keyA:st,requestId:t.request.requestId||void 0,message:"验证完成"})},error:U=>{j()&&M(U,"initControl")}})}catch(U){g(U instanceof Error?U.message:String(U))}}function at(){if(!o)return;const N=()=>{if(P()){if(k&&!A){const K=(o.root.querySelector(`#${Ee.phone}`)?.textContent??"").replace(/\\s+/g," ").trim(),O=K.match(/1\\d{2}\\*{4}\\d{4}/)?.[0];O&&(A=!0,Y(),H("ASSISTANCE_AUTH_PHONE_READY",{maskedMobile:O,rawText:K,source:"ydrzPhoneControl"}))}if(t.iframeOptions.heightMode==="auto"){const K=o.root,O=Math.ceil(Math.max(K.getBoundingClientRect().height,K.scrollHeight,K.offsetHeight));Number.isFinite(O)&&O>0&&O!==u&&(u=O,H("ASSISTANCE_AUTH_RESIZE",{height:O}))}}};v=new MutationObserver(N),v.observe(o.root,{childList:!0,subtree:!0,characterData:!0}),typeof ResizeObserver<"u"&&(a=new ResizeObserver(N),a.observe(o.root)),k=!0,s=setInterval(N,50),h=setTimeout(Y,1500),N()}C=setTimeout(()=>g("Customer page startup deadline exceeded","NETWORK_TIMEOUT"),Math.max(0,t.deadline-Date.now()));try{pe();const N={...b0(),enabled:!0,mode:"live"};N.cssUrl=new URL("assistance-mobile-auth/vendor/new-control-style.css",window.location.href).href;const K=Xe({config:N}).resolve({overrides:t.authParams??{appId:t.appId}});if(K.status!=="ready"||!K.data)throw new Error("Mobile authorization parameters are invalid or incomplete");const O=nr(t.page,{document,...V,api:q.api,sealRegistration:q.sealRegistration,onNotice:Q}).then(U=>{if(o=U,!P())throw U.dispose(),new DOMException("Customer page aborted","AbortError");if(L(),!P())throw new DOMException("Customer page aborted","AbortError");return U}),X=Bi(N).then(U=>{if(U.state!=="ready"){const nt=U.reason==="network-timeout"?"NETWORK_TIMEOUT":U.reason==="spa-html-fallback"?"SPA_HTML_FALLBACK":U.state==="disabled"?"SDK_DISABLED":"CDN_BLOCKED";throw g(ht(nt).uiText,nt),U.error??new Error(ht(nt).uiText)}}),j=Promise.all([O,X]);if(j.catch(()=>{}),await Bt(j,V),!P())throw new DOMException("Customer page aborted","AbortError");return m=Hr(t,x.runtimeSource,o.styles),m.observe(document.body,U=>{P()&&(F.agreementReaderOpen=U,L())}),c.showAuthPage({data:K.data,success(U){if(!(!R()||d)){if(d=!0,String(U.code??"")!=="103000"){M(U,"showAuthPage");return}ot()}},error:U=>M(U,"showAuthPage")}),{dispose:W}}catch(N){throw P()&&g(N instanceof Error?N.message:String(N)),W(),n.safeErrorNotices?N instanceof DOMException&&N.name==="AbortError"?new DOMException("Customer page aborted","AbortError"):new Error(G("CUSTOM_PAGE_FAILED")):N}}const Or=".custom-agreement-reader{box-sizing:border-box;width:100%;min-height:100%;padding:16px;color:#333;background:#fff;font:14px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}.custom-agreement-reader header{display:flex;align-items:center;gap:12px;margin-bottom:16px}.custom-agreement-reader button{color:inherit;cursor:pointer;padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#fff}.custom-agreement-reader h1{font-size:18px}.custom-agreement-reader h2{font-size:16px}.custom-agreement-reader h3{font-size:15px}.custom-agreement-reader p,.custom-agreement-reader li{white-space:pre-wrap}.custom-agreement-reader table{width:100%;border-collapse:collapse;margin:12px 0;table-layout:fixed}.custom-agreement-reader td{border:1px solid #ccc;padding:8px;white-space:pre-wrap;vertical-align:top}.custom-agreement-reader a{color:var(--agreement-link-color, #ed611a);text-decoration:underline}.custom-agreement-reader nav a{display:block;padding:12px 0}.custom-agreement-reader [role=alert]{padding:12px;background:#fff1e8}";async function Lr(t,x){const n=new AbortController,i=document.createElement("main");let c=!1,o=!1,m=t.docKey;const f=[],E=[],e=(B,b)=>{!c&&!n.signal.aborted&&window.parent.postMessage(ut(B,t.sessionId,b),t.parentOrigin)};function r(){if(c||n.signal.aborted||o)return;o=!0;const B=document.createElement("p");B.setAttribute("role","alert"),B.textContent="阅读资源加载失败，请关闭后重试。",i.prepend(B),e("ASSISTANCE_AUTH_ERROR_NOTICE",{message:B.textContent,phase:"agreementReader"})}for(const[B,b]of Object.entries(t.rootAttributes))(B==="class"||B.startsWith("data-"))&&i.setAttribute(B,b);i.classList.add("custom-agreement-reader"),i.setAttribute("data-agreement-reader","");const D=document.createElement("style");D.textContent=Or;const d=document.createElement("style");d.textContent=t.css;function p(B,b,y){B.addEventListener(b,y),E.push(()=>B.removeEventListener(b,y))}const l=t.styleUrls.map(B=>{const b=document.createElement("link");return b.rel="stylesheet",b.href=B,p(b,"error",r),b});p(d,"error",r);const A=document.createElement("header"),k=document.createElement("button");k.type="button",k.textContent="返回",k.setAttribute("data-reader-back","");const v=document.createElement("button");v.type="button",v.textContent="关闭协议",v.setAttribute("data-reader-close","");const a=document.createElement("h1"),s=document.createElement("article");A.append(k,a,v),i.append(D,...l,d,A,s);function h(B,b,y){const u=document.createElement("a");return u.textContent=B,u.dataset.docKey=b,u.href=y??Ne({loaderUrl:window.location.href,mode:"agreement",sessionId:t.sessionId,parentOrigin:t.parentOrigin,docKey:b}),u}function S(B){if(c||n.signal.aborted)return;if(m=B,s.replaceChildren(),k.hidden=B==="entry"&&!f.length,B==="entry"){a.textContent=Re;const y=document.createElement("nav");y.setAttribute("aria-label","协议列表");for(const u of t.entries)if(u.docKey)y.append(h(u.name,u.docKey,u.link));else{const _=document.createElement("a");_.textContent=u.name,_.href=u.link,y.append(_)}s.append(y);return}const b=t.docs[B];if(!b){a.textContent="协议阅读",r();return}a.textContent=b.title;for(const y of b.blocks)if(y.kind==="table"){const u=document.createElement("table");for(const _ of y.rows){const I=document.createElement("tr");for(const F of _){const P=document.createElement("td");typeof F=="string"?P.textContent=F:F.kind==="doc-link"?P.append(h(F.text,F.docKey)):(P.textContent=F.text,P.colSpan=F.colSpan),I.append(P)}u.append(I)}s.append(u)}else{const u=document.createElement(y.kind==="b"?"p":y.kind);if(y.kind==="b"){const _=document.createElement("strong");_.textContent=y.text,u.append(_)}else u.textContent=y.text;s.append(u)}}p(s,"click",B=>{const b=B.target instanceof Element?B.target.closest("a[data-doc-key]"):null;!b||!s.contains(b)||(B.preventDefault(),f.push(m),S(b.dataset.docKey))}),p(k,"click",()=>S(f.pop()??"entry")),p(v,"click",()=>e("ASSISTANCE_AUTH_CLOSE"));function C(){c||(c=!0,n.abort(),x?.signal.removeEventListener("abort",C),E.splice(0).forEach(B=>B()),i.remove())}return x?.signal.addEventListener("abort",C,{once:!0}),x?.signal.aborted?C():(S(m),document.body.append(i)),{dispose:C}}async function Kr(t,x){return t.mode==="agreement"?Lr(t,x):Nr(t,x,{recoverableSubmitErrors:!0,safeErrorNotices:!0,syncSubmitState:!0})}return k0.start=Kr,Object.defineProperty(k0,Symbol.toStringTag,{value:"Module"}),k0})({});\n', he = 50, Yr = ["headerTitle", "idTitle", "phoneTopNotice", "footerNote"], Zr = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, Jr = /^(?:[1-9]\d?(?:\.\d+)?px|(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)rem)$/;
function Pt(t) {
  return typeof t == "object" && t !== null;
}
function _(t, r, e) {
  t?.warn?.({ path: r, reason: e });
}
function bt(t, r, e) {
  if (typeof t != "string") {
    _(e, r, "Expected a string.");
    return;
  }
  const n = t.trim();
  if (!n) {
    _(e, r, "Expected a non-empty string.");
    return;
  }
  return n;
}
function W0(t, r, e) {
  const n = bt(t, r, e);
  if (n) {
    if (!Zr.test(n)) {
      _(e, r, "Expected #RGB or #RRGGBB.");
      return;
    }
    return n;
  }
}
function Qr(t, r, e) {
  const n = bt(t, r, e);
  if (n) {
    if (!Jr.test(n)) {
      _(e, r, "Expected a px or rem font size.");
      return;
    }
    return n;
  }
}
function ke(t, r, e) {
  const n = bt(t, r, e);
  if (n)
    try {
      const s = new URL(n);
      if (s.protocol !== "http:" && s.protocol !== "https:") {
        _(e, r, "Expected an http or https URL.");
        return;
      }
      return s.toString();
    } catch {
      _(e, r, "Expected a valid URL.");
      return;
    }
}
function _r(t, r, e) {
  if (typeof t == "number" && Number.isFinite(t) && t > 0)
    return `${t}px`;
  if (typeof t == "string") {
    const n = t.trim(), s = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/.test(n) ? Number(n.slice(0, -2)) : Number.NaN;
    if (Number.isFinite(s) && s > 0)
      return n;
  }
  _(e, r, "Expected a positive px height.");
}
function $r(t, r, e) {
  if (!Pt(t)) {
    _(e, r, "Expected an object.");
    return;
  }
  const n = t.text === void 0 ? void 0 : bt(t.text, `${r}.text`, e), s = t.fontSize === void 0 ? void 0 : Qr(t.fontSize, `${r}.fontSize`, e), h = t.color === void 0 ? void 0 : W0(t.color, `${r}.color`, e);
  let y;
  t.bold !== void 0 && (typeof t.bold == "boolean" ? y = t.bold : _(e, `${r}.bold`, "Expected a boolean."));
  const k = Object.entries({ text: n, fontSize: s, color: h, bold: y }).filter(([, i]) => i !== void 0);
  return k.length ? Object.fromEntries(k) : void 0;
}
function y0(t, r, e) {
  if (typeof t == "string") {
    const A = ke(t, `${r}.url`, e);
    return A ? { url: A } : void 0;
  }
  if (!Pt(t)) {
    _(e, r, "Expected a URL string or image object.");
    return;
  }
  const n = ke(t.url, `${r}.url`, e);
  if (!n)
    return;
  const s = t.alt === void 0 ? void 0 : bt(t.alt, `${r}.alt`, e), h = t.height === void 0 ? void 0 : _r(t.height, `${r}.height`, e), y = t.fit === "cover" || t.fit === "contain" ? t.fit : void 0;
  return t.fit !== void 0 && y === void 0 && _(e, `${r}.fit`, "Expected cover or contain."), {
    url: n,
    ...s ? { alt: s } : {},
    ...h ? { height: h } : {},
    ...y ? { fit: y } : {}
  };
}
function ti(t, r, e) {
  const n = `agreements[${r}]`;
  if (!Pt(t)) {
    _(e, n, "Expected an object.");
    return;
  }
  const s = bt(t.title, `${n}.title`, e), h = ke(t.url, `${n}.url`, e);
  return s && h ? { title: s, url: h } : void 0;
}
function V0(t, r = {}) {
  if (t == null)
    return {};
  if (!Pt(t))
    return _(r, "ui", "Expected an object."), {};
  const e = t.themeColor === void 0 ? void 0 : W0(t.themeColor, "themeColor", r), n = {};
  if (t.texts !== void 0)
    if (Pt(t.texts)) {
      const y = t.texts;
      Yr.forEach((A) => {
        if (A in y) {
          const k = $r(y[A], `texts.${A}`, r);
          k && (n[A] = k);
        }
      });
    } else
      _(r, "texts", "Expected an object.");
  const s = {};
  if (t.images !== void 0)
    if (Pt(t.images)) {
      const y = t.images.top === void 0 ? void 0 : y0(t.images.top, "images.top", r), A = t.images.bottom === void 0 ? void 0 : y0(t.images.bottom, "images.bottom", r);
      y && (s.top = y), A && (s.bottom = A);
    } else
      _(r, "images", "Expected an object.");
  let h;
  if (t.agreements !== void 0)
    if (Array.isArray(t.agreements)) {
      const y = t.agreements.map((A, k) => ti(A, k, r)).filter((A) => A !== void 0);
      h = y.slice(0, he), y.length > he && _(r, "agreements", `Only the first ${he} valid agreements are used.`);
    } else
      _(r, "agreements", "Expected an array.");
  return {
    ...e ? { themeColor: e } : {},
    ...Object.keys(n).length ? { texts: n } : {},
    ...Object.keys(s).length ? { images: s } : {},
    ...h && h.length ? { agreements: h } : {}
  };
}
function ei(t) {
  return !!(t.themeColor || t.texts && Object.keys(t.texts).length > 0 || t.images && Object.keys(t.images).length > 0 || t.agreements && t.agreements.length > 0);
}
function ni(t) {
  `${t.path}${t.reason}`;
}
const L0 = "assistance-mobile-auth", N0 = "ASSISTANCE_AUTH_READY", I0 = "ASSISTANCE_AUTH_PRESENTATION_READY", q0 = "ASSISTANCE_AUTH_SUCCESS", K0 = "ASSISTANCE_AUTH_CANCEL", U0 = "ASSISTANCE_AUTH_ERROR", G0 = "ASSISTANCE_AUTH_ERROR_NOTICE", Se = "ASSISTANCE_AUTH_CONFIG", z0 = "ASSISTANCE_AUTH_PHONE_READY", De = "ASSISTANCE_AUTH_RESIZE", ce = "ASSISTANCE_AUTH_CLOSE", M0 = "ASSISTANCE_AUTH_PROBE_RESULT", pe = "ASSISTANCE_AUTH_STATE_CHANGE", Y0 = "ASSISTANCE_AUTH_STYLE", Z0 = "ASSISTANCE_AUTH_CUSTOM_BOOT", ri = {
  closable: !0,
  useCustomKeyboard: !0,
  heightMode: "auto"
};
function ii(t, r = ri) {
  return et(t) ? {
    closable: typeof t.closable == "boolean" ? t.closable : r.closable,
    useCustomKeyboard: typeof t.useCustomKeyboard == "boolean" ? t.useCustomKeyboard : r.useCustomKeyboard,
    heightMode: t.heightMode === "auto" || t.heightMode === "fixed" ? t.heightMode : r.heightMode
  } : { ...r };
}
function et(t) {
  return typeof t == "object" && t !== null;
}
function oi(t) {
  return typeof t == "number" && Number.isFinite(t) && t > 0;
}
function ai(t) {
  return t === N0 || t === I0 || t === q0 || t === K0 || t === U0 || t === G0 || t === Se || t === z0 || t === De || t === ce || t === M0 || t === pe || t === Y0 || t === Z0;
}
function S0() {
  return `assistance-auth-${typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
function J0(t) {
  if (typeof t != "string" || !t.trim())
    return null;
  try {
    const r = new URL(t.trim());
    return r.protocol !== "http:" && r.protocol !== "https:" || r.username || r.password || r.pathname !== "/" || r.search || r.hash || r.origin === "null" ? null : r.origin;
  } catch {
    return null;
  }
}
function di(t) {
  if (!(typeof t != "string" || !t.trim()))
    try {
      const r = new URL(t.trim());
      return r.protocol !== "http:" && r.protocol !== "https:" ? void 0 : r.toString();
    } catch {
      return;
    }
}
function D0(t) {
  if (!t || typeof t != "object")
    return null;
  const r = t, e = typeof r.src == "string" ? r.src.trim() : "";
  if (!e)
    return null;
  const n = { src: e };
  return typeof r.width == "string" && r.width.trim() && (n.width = r.width.trim()), typeof r.height == "string" && r.height.trim() && (n.height = r.height.trim()), n;
}
function j0({
  sessionId: t,
  request: r,
  verificationUrl: e,
  pageImages: n,
  mode: s,
  layout: h,
  debugVConsole: y,
  expectsUiConfig: A,
  appId: k,
  parentOrigin: i
}) {
  const a = e ?? zr("verification"), P = new URL(a, typeof window < "u" ? window.location.href : "http://localhost");
  P.searchParams.set("assistanceAuthSessionId", t), k && P.searchParams.set("appId", k), A && P.searchParams.set("expectsUiConfig", "1"), s === "probe" && P.searchParams.set("mode", "probe"), h === "inline" && P.searchParams.set("layout", "inline"), y && P.searchParams.set("debugVConsole", "1");
  const o = J0(i);
  s !== "probe" && o && P.searchParams.set("assistanceAuthParentOrigin", o), r?.scene && P.searchParams.set("scene", r.scene), r?.requestId && P.searchParams.set("requestId", r.requestId);
  const u = D0(n?.top);
  u && P.searchParams.set("topImage", JSON.stringify(u));
  const p = D0(n?.bottom);
  if (p && P.searchParams.set("bottomImage", JSON.stringify(p)), typeof window < "u") {
    const c = new URLSearchParams(window.location.search).get("flow");
    c && s !== "probe" && P.searchParams.set("flow", c);
  }
  return P.toString();
}
function St(t, r, e) {
  return {
    source: L0,
    type: t,
    sessionId: r,
    payload: e
  };
}
function xi(t, r) {
  return et(t) && t.source === L0 && ai(t.type) && typeof t.sessionId == "string" && (!r || t.sessionId === r);
}
function Q0(t) {
  return et(t) && typeof t.message == "string" ? {
    code: typeof t.code == "string" ? t.code : void 0,
    message: t.message
  } : { message: "验证失败，请稍后重试。" };
}
function si(t) {
  const r = Q0(t);
  return et(t) ? {
    ...r,
    phase: t.phase === "resourceLoad" || t.phase === "showAuthPage" || t.phase === "initControl" ? t.phase : void 0,
    carrier: typeof t.carrier == "string" ? t.carrier : void 0
  } : r;
}
function fi(t) {
  return et(t) && et(t.ui) ? { ui: V0(t.ui) } : { ui: {} };
}
function ci(t, r) {
  return St(Se, t, { ui: r });
}
const pi = /1\d{2}\*{4}\d{4}/, Ai = /1\d{10}/;
function ui(t) {
  return t.replace(/\s+/g, " ").trim();
}
function li(t) {
  if (!et(t) || t.source !== "ydrzPhoneControl")
    return null;
  const e = (typeof t.maskedMobile == "string" ? t.maskedMobile.trim() : "").match(pi)?.[0];
  if (!e)
    return null;
  let n = e;
  if (typeof t.rawText == "string") {
    const s = ui(t.rawText);
    if (!s.includes(e) || Ai.test(s))
      return null;
    n = s;
  }
  return {
    maskedMobile: e,
    rawText: n,
    source: "ydrzPhoneControl"
  };
}
function hi(t) {
  return !et(t) || !oi(t.height) ? null : {
    height: Math.ceil(t.height),
    ...typeof t.keyboardFocused == "boolean" ? { keyboardFocused: t.keyboardFocused } : {}
  };
}
function vi(t) {
  if (!et(t) || t.status !== "success")
    return null;
  const r = typeof t.token == "string" ? t.token : "", e = typeof t.idLast4 == "string" ? t.idLast4 : "", n = typeof t.keyA == "string" ? t.keyA : "";
  return !r.trim() || !e.trim() || !n.trim() ? null : {
    status: "success",
    token: r,
    idLast4: e,
    keyA: n,
    requestId: typeof t.requestId == "string" ? t.requestId : void 0,
    message: typeof t.message == "string" ? t.message : void 0,
    mock: typeof t.mock == "boolean" ? t.mock : void 0
  };
}
const ki = ["ok", "wifi", "non-mobile", "ambiguous", "unknown"];
function Pi(t) {
  const r = {};
  for (const e of ["YD", "CT", "CU"])
    typeof t[e] == "string" && (r[e] = t[e]);
  return Object.keys(r).length > 0 ? r : void 0;
}
function bi(t) {
  if (!et(t))
    return { eligible: !1, reason: "unknown" };
  const r = ki.includes(t.reason) ? t.reason : "unknown";
  let e;
  if (et(t.raw)) {
    const n = et(t.raw.carriers) ? Pi(t.raw.carriers) : void 0, s = t.raw.networkType, h = s === "wifi" || s === "cellular" || s === "unknown" ? s : void 0, y = {
      ...typeof t.raw.code == "string" ? { code: t.raw.code } : {},
      ...typeof t.raw.carrier == "string" ? { carrier: t.raw.carrier } : {},
      ...n ? { carriers: n } : {},
      ...h ? { networkType: h } : {}
    };
    Object.keys(y).length > 0 && (e = y);
  }
  return { eligible: r === "ok", reason: r, ...e ? { raw: e } : {} };
}
function Hi(t) {
  return !et(t) || !et(t.event) ? null : t.event.type === "idLast4Complete" ? { type: "idLast4Complete" } : t.event.type === "idLast4Incomplete" ? { type: "idLast4Incomplete" } : null;
}
function m0(t, r, e, n, s) {
  const h = (y) => {
    if (!(n && y.origin !== n) && xi(y.data, r) && !(s && "expectedSource" in s && (!s.expectedSourceTypes || s.expectedSourceTypes.includes(y.data.type)) && y.source !== s.expectedSource))
      switch (y.data.type) {
        case N0:
          e.onReady?.();
          break;
        case I0:
          e.onPresentationReady?.();
          break;
        case q0:
          {
            const A = vi(y.data.payload);
            if (!A) {
              e.onError?.({
                code: "INVALID_SUCCESS_PAYLOAD",
                message: "验证结果返回异常，请稍后重试。"
              });
              break;
            }
            e.onSuccess?.(A);
          }
          break;
        case K0:
          e.onCancel?.(y.data.payload);
          break;
        case U0:
          e.onError?.(Q0(y.data.payload));
          break;
        case G0:
          e.onErrorNotice?.(si(y.data.payload));
          break;
        case Se:
          e.onConfig?.(fi(y.data.payload));
          break;
        case z0:
          {
            const A = li(y.data.payload);
            A && e.onPhoneReady?.(A);
          }
          break;
        case De:
          {
            const A = hi(y.data.payload);
            A && e.onResize?.(A);
          }
          break;
        case ce:
          e.onClose?.();
          break;
        case M0:
          e.onProbeResult?.(bi(y.data.payload));
          break;
        case pe:
          {
            const A = Hi(y.data.payload);
            A && e.onStateChange?.(A);
          }
          break;
      }
  };
  return t.addEventListener("message", h), () => t.removeEventListener("message", h);
}
function wi(t) {
  const r = new URL(t.loaderUrl);
  if (!["http:", "https:"].includes(r.protocol) || !t.sessionId.trim() || J0(t.parentOrigin) !== t.parentOrigin)
    throw new TypeError("Invalid custom verification identity or loader URL");
  return r.search = "", r.hash = "", r.searchParams.set("sessionId", t.sessionId), r.searchParams.set("parentOrigin", t.parentOrigin), r.searchParams.set("role", t.mode), t.docKey && r.searchParams.set("doc", t.docKey), r.href;
}
function g0(t, r) {
  const e = new URL(t, r);
  if (e.protocol !== "http:" && e.protocol !== "https:")
    throw new TypeError("customPage addresses must use HTTP or HTTPS");
  return e.toString();
}
function B0(t, r) {
  if (typeof t != "object" || t === null || Array.isArray(t))
    throw new TypeError("customPage must be an object");
  const e = t, n = e.html !== void 0, s = e.url !== void 0;
  if (n === s)
    throw new TypeError("customPage must provide exactly one of html or url");
  const h = n ? e.html : e.url;
  if (typeof h != "string" || !h.trim())
    throw new TypeError("customPage html or url must be a non-empty string");
  const y = n ? { kind: "html", html: h } : { kind: "url", url: g0(h, r) };
  for (const A of ["css", "js", "baseUrl"]) {
    const k = e[A];
    if (k !== void 0) {
      if (typeof k != "string")
        throw new TypeError(`customPage ${A} must be a string`);
      if (A === "baseUrl") {
        if (!k.trim()) throw new TypeError("customPage baseUrl must be non-empty");
        y.baseUrl = g0(k, r);
      } else
        y[A] = k;
    }
  }
  return y;
}
const _0 = 12, yi = 1, Si = 500;
function fe(t) {
  return Number.isFinite(t);
}
function Di(t) {
  return fe(t) && t >= 0;
}
function ji({
  targetWindow: t,
  frame: r,
  positioningLayer: e,
  constrainToViewport: n = !1
}) {
  let s = "idle", h = 0, y = !1, A = 0, k, i, a = !1, P = !1, o;
  const u = () => {
    const D = t.visualViewport;
    return {
      top: D?.offsetTop ?? 0,
      height: D?.height ?? t.innerHeight
    };
  }, p = u().height, v = () => {
    k !== void 0 && (t.cancelAnimationFrame(k), k = void 0);
  }, c = () => {
    i !== void 0 && (t.clearTimeout(i), i = void 0);
  }, w = () => {
    A = 0, e.style.transform = "", delete r.dataset.assistanceAuthKeyboardConstrained, y && (r.style.height = `${h}px`);
  }, x = () => {
    const D = t.visualViewport ?? void 0;
    o !== D && (o?.removeEventListener("resize", b), o?.removeEventListener("scroll", b), o = D, a && (o?.addEventListener("resize", b), o?.addEventListener("scroll", b)));
  }, f = () => {
    a && (a = !1, t.removeEventListener("resize", b), o?.removeEventListener("resize", b), o?.removeEventListener("scroll", b), o = void 0);
  }, l = () => {
    s = "idle", v(), c(), f(), w();
  }, d = () => {
    if (k = void 0, P)
      return;
    if (x(), s === "idle" && !n) {
      w();
      return;
    }
    const D = u(), R = D.top + D.height, H = e.getBoundingClientRect();
    if (!fe(D.top) || !fe(D.height) || D.height <= 0 || !fe(H.bottom))
      return;
    const j = Math.max(
      1,
      Math.floor(D.height - _0)
    ), g = Math.min(h, j);
    r.style.height = `${g}px`, g < h ? r.dataset.assistanceAuthKeyboardConstrained = "true" : delete r.dataset.assistanceAuthKeyboardConstrained;
    const B = H.bottom + A;
    A = Math.max(0, Math.ceil(B - R)), e.style.transform = A > 0 ? `translate3d(0, -${A}px, 0)` : "", s === "closing" && D.height >= p - yi && l();
  };
  function b() {
    P || (x(), k === void 0 && (k = t.requestAnimationFrame(d)));
  }
  const S = () => {
    a || (a = !0, t.addEventListener("resize", b)), x();
  };
  return {
    update(D) {
      if (!P) {
        if (Di(D.height) && (h = Math.ceil(D.height), y = !0), n) {
          S(), b();
          return;
        }
        if (D.keyboardFocused === !0) {
          s = "focused", c(), S(), b();
          return;
        }
        if (D.keyboardFocused === !1 && s !== "idle") {
          const R = s !== "closing";
          s = "closing", S(), b(), R && (c(), i = t.setTimeout(
            l,
            Si
          ));
          return;
        }
        s === "idle" ? w() : b();
      }
    },
    dispose() {
      P = !0, v(), c(), f(), w();
    }
  };
}
const $0 = {
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
function mi(t = $0) {
  const r = [
    "version",
    "jsUrl",
    "cssUrl",
    "localCssPath",
    "cssSha256",
    "h5CssStrategy",
    "wrapperCssStrategy"
  ];
  for (const e of r)
    if (!t[e].trim())
      throw new Error(`Mobile official JSSDK metadata is missing ${e}`);
}
function gi(t = {}) {
  return $0;
}
const Bi = "10037e6f9d903f86019ed8cfb6320365", Ti = "8a9481c79c05c8bd019ed8d49fb81df2", je = [Bi, Ti], tn = "8a9481c79c05c8bd019f6f42956924a0", Ci = {
  "demo-brand": {
    label: "示例品牌",
    ui: {
      themeColor: "#0A6CFF",
      texts: { headerTitle: { text: "示例品牌身份核验" } },
      agreements: [{ title: "示例品牌服务协议", url: "https://example.com/agreement" }]
    }
  },
  // 协议文案由移动 SDK agreement slot 注入（勾选语义由 SDK 承担），此处不得配置
  // ui.agreements：皮肤协议区无勾选框，配置了会让 customAgreementsAllAgreed 永假、授权按钮死锁。
  "chinaums-sheet": {
    label: "银联三要素授权",
    skin: "chinaumsSheet",
    ui: {
      themeColor: "#f75110"
    }
  },
  "chinaums-sheet-v23": {
    label: "银杏助填版本 23",
    skin: "chinaumsSheetV23",
    ui: {
      themeColor: "#ff4a19"
    }
  },
  "haike-inline": {
    label: "海客内嵌授权",
    skin: "haikeInline"
  }
}, Fi = {
  "demo-brand-001": "demo-brand",
  [tn]: "chinaums-sheet-v23",
  ...Object.fromEntries(je.map((t) => [t, "chinaums-sheet-v23"]))
}, Ri = new Map(
  Object.entries(Fi).map(([t, r]) => [
    t,
    { appId: t, ...Ci[r] }
  ])
);
function Xi(t, r) {
  if (typeof r != "string")
    return null;
  const e = r.trim();
  return e ? t.get(e) ?? null : null;
}
function Ei(t, r) {
  return typeof t == "string" && t.trim(), Xi(Ri, t);
}
function en(t) {
  const r = typeof t == "string" ? t.trim() : "";
  return r === tn && Ei(r)?.skin === "chinaumsSheetV23";
}
function Dt(t) {
  return typeof t == "string" && je.includes(t.trim());
}
function me() {
  return gi();
}
const Oi = "assistance-mobile-auth-official-css", Wi = "assistance-mobile-auth-frame-shell", Vi = "assistance-auth-frame-enter", Li = 280, Ni = "verification", Ii = 12e3, qi = "8a9481c79c05c8bd019ed8d7ab571df3";
function Ki(t) {
  return en(t) || Dt(t) ? "ginkgo-v23-viewport-modal" : "bottom-sheet";
}
function Ui() {
  return !1;
}
function Gi(t, r) {
  return t === qi && r === "inline";
}
function pt(t, r, e) {
  if (t)
    try {
      const n = e !== void 0 ? t(e) : t();
      Promise.resolve(n).catch(() => {
        `${r}`;
      });
    } catch {
    }
}
function zi(t) {
  return Array.isArray(t) ? t.filter(
    (r) => !!r && typeof r.name == "string" && typeof r.link == "string"
  ) : [];
}
function Mi(t) {
  if (typeof t != "string")
    return t;
  const r = document.querySelector(t);
  if (!r)
    throw new Error("AssistanceMobileAuth container not found");
  return r;
}
function Yi(t) {
  const r = typeof t == "string" ? document.querySelector(t) : t;
  if (!(r instanceof HTMLElement))
    throw new Error("AssistanceMobileAuth inline renderTo not found");
  return r;
}
function Zi(t) {
  if (!t.isConnected || !document.contains(t))
    throw new Error("AssistanceMobileAuth inline renderTo is no longer connected");
  return t;
}
const T0 = "assistance-mobile-auth-official-jssdk";
function Ji() {
  const t = me();
  if (mi(t), !t.jsUrl.trim())
    throw new Error("Mobile official JSSDK remote jsUrl is missing");
}
function C0() {
  if (typeof window > "u" || typeof document > "u")
    return Promise.reject(new Error("Mobile official JSSDK requires a browser window and document"));
  if (Fr(), window.YDRZAuthSF)
    return Promise.resolve();
  const t = me().jsUrl, r = document.getElementById(T0);
  return r instanceof HTMLScriptElement ? r.dataset.assistanceMobileAuthLoaded === "true" && window.YDRZAuthSF ? Promise.resolve() : new Promise((e, n) => {
    r.addEventListener(
      "load",
      () => {
        r.dataset.assistanceMobileAuthLoaded = "true", e();
      },
      { once: !0 }
    ), r.addEventListener(
      "error",
      () => n(new Error(`Failed to load mobile official JSSDK script: ${t}`)),
      { once: !0 }
    );
  }) : new Promise((e, n) => {
    const s = document.createElement("script");
    s.id = T0, s.async = !0, s.src = t, s.addEventListener(
      "load",
      () => {
        if (s.dataset.assistanceMobileAuthLoaded = "true", !window.YDRZAuthSF) {
          n(new Error("Mobile official JSSDK loaded but did not initialize window.YDRZAuthSF"));
          return;
        }
        e();
      },
      { once: !0 }
    ), s.addEventListener(
      "error",
      () => n(new Error(`Failed to load mobile official JSSDK script: ${t}`)),
      { once: !0 }
    ), document.head.appendChild(s);
  });
}
function Qi(t, r) {
  return `${t ? t.replace(/\/?$/, "/") : ""}vendor/${r}`;
}
function _i(t, r = !1) {
  const e = document.createElement("div");
  e.id = Wi, e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), e.dataset.assistanceAuthOverlay = "true", e.style.position = "fixed", e.style.inset = "0", e.style.zIndex = "2147483647", e.style.background = "rgba(15,23,42,0)", e.style.display = "flex", e.style.alignItems = "flex-end", e.style.justifyContent = "center", e.style.opacity = "0", e.style.transition = "opacity 220ms ease, background-color 220ms ease", e.style.willChange = "opacity, background-color";
  const n = document.createElement("div");
  return n.dataset.assistanceAuthPositioningLayer = "true", n.style.display = "flex", n.style.width = "100%", n.style.justifyContent = "center", n.style.willChange = "transform", (t === "ginkgo-v23-viewport-modal" || r) && (r || (n.dataset.assistanceAuthViewportModal = "true"), n.style.position = "fixed", n.style.left = "0", n.style.top = "0", n.style.height = "100vh", r && (n.style.alignItems = "flex-end")), e.appendChild(n), { shell: e, positioningLayer: n };
}
function $i(t, r) {
  t.style.pointerEvents = "none", t.setAttribute("aria-hidden", "true"), t.inert = !0, t.removeAttribute("role"), t.removeAttribute("aria-modal"), r.setAttribute("aria-hidden", "true"), r.tabIndex = -1;
}
function to(t, r) {
  t.style.pointerEvents = "auto", t.removeAttribute("aria-hidden"), t.inert = !1, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), r.removeAttribute("aria-hidden"), r.removeAttribute("tabindex");
}
function eo(t) {
  const r = t.visualViewport;
  return r && Number.isFinite(r.height) && r.height > 0 && Number.isFinite(r.offsetTop) && r.offsetTop >= 0 ? { height: `${r.height}px`, top: `${r.offsetTop}px` } : Number.isFinite(t.innerHeight) && t.innerHeight > 0 ? { height: `${t.innerHeight}px`, top: "0px" } : { height: typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? "100dvh" : "100vh", top: "0px" };
}
function no({
  targetWindow: t,
  frame: r,
  positioningLayer: e,
  preserveFrameHeight: n = !1
}) {
  let s = !1, h;
  const y = () => {
    if (s)
      return;
    const i = eo(t);
    e.style.top = i.top, e.style.height = i.height, n || (r.style.height = "100%");
  }, A = () => {
    const i = t.visualViewport ?? void 0;
    h !== i && (h?.removeEventListener("resize", y), h?.removeEventListener("scroll", y), h = i, h?.addEventListener("resize", y), h?.addEventListener("scroll", y));
  }, k = () => {
    A(), y();
  };
  return t.addEventListener("resize", k), k(), () => {
    s || (s = !0, t.removeEventListener("resize", k), h?.removeEventListener("resize", y), h?.removeEventListener("scroll", y), h = void 0);
  };
}
function ro(t) {
  return /iPad|iPhone|iPod/i.test(t.userAgent) || t.platform === "MacIntel" && t.maxTouchPoints > 1;
}
function io(t) {
  if (!ro(window.navigator))
    return !1;
  const r = document.createElement("input");
  r.type = "text", r.inputMode = "text", r.autocomplete = "off", r.tabIndex = -1, r.dataset.assistanceAuthKeyboardActivator = "true", r.setAttribute("autocapitalize", "characters"), r.setAttribute("autocorrect", "off"), r.style.position = "fixed", r.style.left = "0", r.style.bottom = "0", r.style.width = "1px", r.style.height = "1px", r.style.border = "0", r.style.padding = "0", r.style.opacity = "0.01", r.style.pointerEvents = "none", r.style.fontSize = "16px", r.style.color = "transparent", r.style.background = "transparent", r.style.caretColor = "transparent", t.appendChild(r);
  try {
    r.focus({ preventScroll: !0 });
  } catch {
    r.focus();
  }
  return document.activeElement === r;
}
function oo(t) {
  return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? `${t}dvh` : `${t}vh`;
}
function Pe(t) {
  return typeof t == "number" && Number.isFinite(t) && t > 0;
}
function ao(t) {
  const r = t.getBoundingClientRect().height;
  if (Pe(r))
    return r;
  const e = /^(\d+(?:\.\d+)?)px$/.exec(t.style.height.trim())?.[1], n = e === void 0 ? Number.NaN : Number(e);
  return Pe(n) ? n : null;
}
function xo(t, r) {
  return Ae(t) ?? r;
}
function Ae(t) {
  if (Pe(t))
    return `${t}px`;
  if (typeof t != "string")
    return null;
  const r = t.trim();
  if (!r || /url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(r))
    return null;
  const e = "(?:px|vh|dvh|svh|lvh|%|rem)";
  if (new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d+)?${e}$`, "i").test(r))
    return r;
  const s = r.match(/^calc\((.*)\)$/i)?.[1];
  if (s && /^[\d\s.+\-*/()%a-z]+$/i.test(s)) {
    const h = new RegExp(`(?:0|[1-9]\\d*)(?:\\.\\d+)?${e}`, "gi"), y = s.replace(h, "");
    if (/^[\d\s.+\-*/()]*$/.test(y))
      return r;
  }
  return null;
}
const so = "820px", jt = "420px";
function F0(t) {
  const r = Ae(t.authWindowHeight), e = r ? "fixed" : t.authWindowHeightMode === "auto" ? "auto" : "fixed";
  return {
    heightMode: e,
    height: r ?? (e === "auto" ? jt : oo(92)),
    maxHeight: xo(t.authWindowMaxHeight, so)
  };
}
function fo(t, r, e, n) {
  const s = document.createElement("iframe");
  return s.title = r, s.src = t, s.dataset.assistanceAuthFrame = "true", s.style.width = "100%", s.style.height = n === "ginkgo-v23-viewport-modal" ? "100%" : e.height, s.style.maxHeight = n === "ginkgo-v23-viewport-modal" ? "none" : e.maxHeight, s.style.border = "0", s.style.borderRadius = n === "ginkgo-v23-viewport-modal" ? "0" : "24px 24px 0 0", s.style.background = n === "ginkgo-v23-viewport-modal" ? "transparent" : "#fff", s.style.boxShadow = n === "ginkgo-v23-viewport-modal" ? "none" : "0 -16px 40px rgba(15,23,42,0.18)", n === "bottom-sheet" && (s.style.transform = "translateY(100%)", s.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)", s.style.willChange = "transform", s.className = Vi), s;
}
function be(t, r = /* @__PURE__ */ new Set()) {
  if (!(t === void 0 || typeof t == "function" || typeof t == "symbol")) {
    if (t === null || typeof t == "string" || typeof t == "boolean" || typeof t == "number" && Number.isFinite(t)) return t;
    if (typeof t != "object" || r.has(t) || !Array.isArray(t) && Object.getPrototypeOf(t) !== Object.prototype && Object.getPrototypeOf(t) !== null)
      throw new TypeError("customPage transport options must contain finite plain data");
    r.add(t);
    try {
      return Array.isArray(t) ? t.map((e) => be(e, r)).filter((e) => e !== void 0) : Object.fromEntries(Object.entries(t).map(([e, n]) => [e, be(n, r)]).filter(([, e]) => e !== void 0));
    } finally {
      r.delete(t);
    }
  }
}
function co(t, r, e = !1) {
  const n = document.createElement("iframe");
  return n.title = r, n.src = t, n.dataset.assistanceAuthFrame = "true", n.dataset.assistanceAuthInline = "true", n.style.display = "block", n.style.width = "100%", n.style.height = e ? "100%" : jt, n.style.maxHeight = "none", n.style.border = "0", n.style.borderRadius = "0", n.style.background = "transparent", n.style.boxShadow = "none", n.style.transform = "none", n.style.transition = "none", n;
}
function po(t) {
  const r = document.createElement("iframe");
  return r.src = t, r.title = "", r.dataset.assistanceAuthProbe = "true", r.setAttribute("aria-hidden", "true"), r.tabIndex = -1, r.style.position = "fixed", r.style.left = "-99999px", r.style.top = "0", r.style.width = "1px", r.style.height = "1px", r.style.border = "0", r.style.opacity = "0", r.style.pointerEvents = "none", r;
}
function Ao() {
  return ye;
}
function R0() {
  const t = Ao();
  return {
    verificationUrl: new URL(Ni, t).toString(),
    allowedOrigin: new URL(t).origin
  };
}
function uo(t, r, e, n = !1) {
  let s = !1, h;
  t.getBoundingClientRect(), r.getBoundingClientRect();
  const y = () => {
    s || !t.isConnected || !r.isConnected || (t.style.background = n ? "transparent" : "rgba(15,23,42,0.35)", t.style.opacity = "1", e === "bottom-sheet" && (r.style.transform = "translateY(0)"));
  }, A = requestAnimationFrame(() => {
    s || (h = requestAnimationFrame(y));
  });
  return () => {
    s = !0, cancelAnimationFrame(A), h !== void 0 && cancelAnimationFrame(h);
  };
}
function lo(t, r, e, n) {
  return new Promise((s) => {
    let h = !1, y, A;
    const k = () => {
      h || (h = !0, y !== void 0 && window.clearTimeout(y), A !== void 0 && cancelAnimationFrame(A), i.removeEventListener("transitionend", k), s());
    }, i = e === "bottom-sheet" ? r : t;
    n(k), i.addEventListener("transitionend", k), y = window.setTimeout(k, Li + 80), A = requestAnimationFrame(() => {
      t.style.background = "rgba(15,23,42,0)", t.style.opacity = "0", e === "bottom-sheet" && (r.style.transform = "translateY(100%)");
    });
  });
}
function ho(t) {
  const r = me();
  return {
    href: Qi(t, "new-control-style.css"),
    integrity: `sha256-${r.cssSha256}`,
    version: r.version
  };
}
function Do(t = {}) {
  const r = t.document ?? document, e = t.id ?? Oi, n = r.getElementById(e);
  if (n instanceof r.defaultView.HTMLLinkElement)
    return n;
  const s = ho(t.baseUrl), h = r.createElement("link");
  return h.id = e, h.rel = "stylesheet", h.href = s.href, h.integrity = s.integrity, h.dataset.assistanceMobileAuthOfficialCssVersion = s.version, r.head.appendChild(h), h;
}
function vo(t) {
  const r = typeof t.appId == "string" ? t.appId.trim() : "";
  if (!r)
    throw new Error("AssistanceMobileAuth: appId is required since 0.2.0");
  const e = t.customPage !== void 0;
  if (e && (B0(t.customPage, window.location.href), t.container !== void 0))
    throw new TypeError("customPage does not support container/authorize mode");
  const n = t.display === "inline" ? "inline" : "modal", s = n === "inline" ? Yi(t.renderTo) : void 0, h = V0(t.ui, { warn: ni }), y = ei(h), A = typeof t.onBeforeLogin == "function", k = typeof t.onStateChange == "function", i = di(t.formHeaderImg);
  let a;
  if (!e && (t.container || t.authParams)) {
    if (!t.container || !t.authParams)
      throw new Error("AssistanceMobileAuth legacy authorize mode requires container and authParams");
    Ji(), Mi(t.container), a = C0();
  }
  let P, o, u, p;
  function v() {
    return P ??= Xr(), P;
  }
  function c(d = o) {
    if (d) {
      if (d.allowedOrigin)
        try {
          d.frame.contentWindow?.postMessage(St(ce, d.sessionId), d.allowedOrigin);
        } catch {
        }
      if (o !== d) {
        d.shell?.remove(), d.frame.remove();
        return;
      }
      d.keyboardAvoidance?.dispose(), d.keyboardAvoidance = void 0, d.disposeViewportFrame?.(), d.disposeViewportFrame = void 0, d.cancelPendingEnterAnimation?.(), d.cancelPendingEnterAnimation = void 0, d.finishPendingExitAnimation?.(), d.finishPendingExitAnimation = void 0, d.disposeMessageListener?.(), d.disposeMessageListener = void 0, d.shell?.remove(), d.frame.remove(), d.presentation !== "inline" && (document.body.style.overflow = d.previousBodyOverflow ?? ""), o = void 0;
    }
  }
  function w(d, b) {
    if (d.settled) {
      c(d);
      return;
    }
    const S = d.reject;
    d.settled = !0, c(d), S?.(b);
  }
  async function x(d) {
    if (d.presentation === "inline") {
      c(d);
      return;
    }
    if (d.cancelPendingEnterAnimation?.(), d.cancelPendingEnterAnimation = void 0, d.disposeViewportFrame?.(), d.disposeViewportFrame = void 0, e && d.presentation === "bottom-sheet" && d.keyboardAvoidance) {
      const b = d.frame.style.height, S = d.frame.parentElement, D = S.style.transform;
      d.keyboardAvoidance.dispose(), d.keyboardAvoidance = void 0, d.frame.style.height = b, S.style.transform = D;
    }
    d.presented && d.shell && (await lo(d.shell, d.frame, d.presentation, (b) => {
      d.finishPendingExitAnimation = b;
    }), d.finishPendingExitAnimation = void 0), c(d);
  }
  function f(d) {
    if (String(d.code) !== "103000") {
      t.onError?.(d);
      return;
    }
    v().initControl({
      styleOption: Vr(t.styleOption),
      beforeSubmit: () => !0,
      authReady: t.onAuthReady,
      success: t.onSuccess,
      error: t.onError
    });
  }
  const l = {
    authorize() {
      if (e) throw new TypeError("customPage does not support authorize mode; use open");
      if (!t.container || !t.authParams)
        throw new Error("AssistanceMobileAuth authorize requires container and authParams");
      const d = Wr(t.authParams.authType), b = d === t.authParams.authType ? t.authParams : { ...t.authParams, authType: d }, S = a ?? C0();
      a = S, S.then(() => {
        v().showAuthPage({
          data: b,
          success: f,
          error: t.onError
        });
      }).catch((D) => {
        const R = D instanceof Error ? D : new Error(String(D));
        t.onError?.({ code: "sdk-script-load-failed", message: R.message });
      });
    },
    clear(d) {
      v().clearControl(d);
    },
    open(d) {
      return l.openVerification(d);
    },
    openVerification(d) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth requires a browser window and document"));
      const b = Date.now();
      let S, D, R, H, j, g = [];
      try {
        if (e) {
          if (S = B0(t.customPage, window.location.href), R = be(t.styleOption), t.agreements !== void 0 && !Array.isArray(t.agreements))
            throw new TypeError("customPage agreements must be an array");
          if (g = Array.from(t.agreements ?? [], (Y) => {
            const M = Y?.name, J = Y?.link;
            if (typeof M != "string" || typeof J != "string")
              throw new TypeError("customPage agreement name and link must be strings");
            return { name: M, link: J };
          }), t.authParams) {
            const Y = ["version", "appId", "sign", "traceId", "timestamp", "authType", "scope"];
            for (const J of Y) {
              const ot = t.authParams[J];
              if (!(J === "version" && ot === void 0) && (typeof ot != "string" || !ot.trim()))
                throw new TypeError(`customPage authParams.${J} must be a non-empty string`);
            }
            const M = t.authParams;
            H = {
              ...M.version === void 0 ? {} : { version: M.version },
              appId: M.appId,
              sign: M.sign,
              traceId: M.traceId,
              timestamp: M.timestamp,
              authType: M.authType,
              scope: M.scope
            };
          }
          if (d?.requestId !== void 0 && typeof d.requestId != "string") throw new TypeError("customPage requestId must be a string");
          if (d?.scene !== void 0 && d.scene !== "native-number") throw new TypeError("customPage scene must be native-number");
          j = { ...d?.requestId ? { requestId: d.requestId } : {}, ...d?.scene ? { scene: d.scene } : {} };
        }
        D = n === "inline" ? Zi(s) : void 0;
      } catch (Y) {
        if (e) return Promise.reject(Y);
        throw Y;
      }
      const B = o;
      B && w(B, new Error("Assistance auth replaced"));
      const E = S0(), O = "https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/custom-verification.html", V = e ? { verificationUrl: O, allowedOrigin: new URL(O).origin } : R0(), N = e && n !== "inline" && !0 && !0, W = n === "inline" ? "inline" : e ? N ? "bottom-sheet" : "ginkgo-v23-viewport-modal" : Ki(r), G = !e && Gi(r, n), K = e ? F0({
        ...t,
        authWindowHeightMode: t.authWindowHeightMode ?? (n === "inline" || N ? "auto" : "fixed")
      }) : void 0, m = Ae(t.authWindowMaxHeight), C = `calc(100% - ${_0}px)`, F = e ? {
        ...K,
        height: Ae(t.authWindowHeight) ?? (K.heightMode === "auto" ? jt : "100%"),
        maxHeight: N ? m ? `min(${m}, ${C})` : C : m ?? "none"
      } : W === "inline" ? { heightMode: "auto", height: jt, maxHeight: "none" } : W === "ginkgo-v23-viewport-modal" ? { heightMode: "fixed", height: "100%", maxHeight: "none" } : F0(t), T = ii({
        closable: t.closable,
        useCustomKeyboard: t.useCustomKeyboard,
        heightMode: F.heightMode
      }), z = e ? wi({
        loaderUrl: O,
        mode: "authorization",
        sessionId: E,
        parentOrigin: window.location.origin
      }) : j0({
        verificationUrl: V.verificationUrl,
        sessionId: E,
        request: d,
        expectsUiConfig: y,
        appId: r,
        parentOrigin: window.location.origin,
        ...W === "inline" ? { layout: "inline" } : {},
        debugVConsole: W === "inline" && Ui()
      }), U = W === "inline" ? void 0 : _i(W, N), I = W === "inline" ? co(
        z,
        t.authWindowTitle ?? "移动认证验证窗口",
        G
      ) : fo(
        z,
        t.authWindowTitle ?? "移动认证验证窗口",
        F,
        W
      );
      U?.positioningLayer.appendChild(I), e && (I.style.height = F.height, I.style.maxHeight = F.maxHeight);
      const X = {
        sessionId: E,
        shell: U?.shell,
        frame: I,
        previousBodyOverflow: W === "inline" ? void 0 : document.body.style.overflow,
        settled: !1,
        presentation: W,
        presented: !1,
        allowedOrigin: e ? V.allowedOrigin : void 0
      }, it = e || W !== "inline" && (en(r) || Dt(r));
      it && (X.shell && $i(X.shell, I), e && (I.style.opacity = "0", I.style.pointerEvents = "none", I.inert = !0, I.tabIndex = -1, I.setAttribute("aria-hidden", "true"))), (W === "ginkgo-v23-viewport-modal" || N) && (X.disposeViewportFrame = no({
        targetWindow: window,
        frame: I,
        positioningLayer: U.positioningLayer,
        preserveFrameHeight: e
      })), W === "bottom-sheet" && F.heightMode === "auto" && (X.keyboardAvoidance = ji({
        targetWindow: window,
        frame: I,
        positioningLayer: U.positioningLayer,
        constrainToViewport: N
      }), N && X.keyboardAvoidance.update({ height: Number.parseFloat(jt) })), o = X, W === "inline" ? D.appendChild(I) : document.body.appendChild(X.shell);
      const xt = () => {
        !e && W === "inline" || X.settled || X.presented || W !== "inline" && !X.shell?.isConnected || !I.isConnected || (X.presented = !0, !(e && (I.style.opacity = "1", I.style.pointerEvents = "auto", I.inert = !1, I.removeAttribute("tabindex"), I.removeAttribute("aria-hidden"), W === "inline")) && (to(X.shell, I), document.body.style.overflow = "hidden", X.cancelPendingEnterAnimation = uo(
          X.shell,
          I,
          W,
          e ? !N : Dt(r)
        )));
      };
      if (it || xt(), !N && X.keyboardAvoidance && !T.useCustomKeyboard && io(X.shell)) {
        const Y = ao(I);
        Y !== null && X.keyboardAvoidance.update({
          height: Y,
          keyboardFocused: !0
        });
      }
      const st = I.contentWindow;
      let ft = !1;
      const nt = S ? {
        mode: "authorization",
        sessionId: E,
        parentOrigin: window.location.origin,
        page: S,
        appId: r,
        request: j,
        authParams: H,
        styleOption: R,
        agreements: g,
        iframeOptions: T,
        trustedBusinessBaseUrl: ye,
        deadline: b + 15e3,
        beforeLoginNotificationEnabled: A,
        stateChangeEnabled: k
      } : void 0, $ = () => {
        !y || !st || st.postMessage(
          ci(E, h),
          V.allowedOrigin
        );
      }, ht = () => {
        st?.postMessage(
          St(
            Y0,
            E,
            {
              styleOption: Lr(t.styleOption) ?? {},
              agreements: zi(t.agreements),
              iframeOptions: T,
              beforeLoginNotificationEnabled: A,
              stateChangeEnabled: k,
              ...i ? { formHeaderImg: i } : {}
            }
          ),
          V.allowedOrigin
        );
      };
      return new Promise((Y, M) => {
        X.reject = M;
        let J, ot;
        const tt = (L) => {
          if (!X.settled) {
            if (X.settled = !0, clearTimeout(J), e && (!N || !X.presented)) {
              c(X), L();
              return;
            }
            if (W === "inline") {
              L();
              return;
            }
            x(X).then(L);
          }
        }, Q = (L) => {
          if (e || Dt(r))
            try {
              t.onError?.(L);
            } catch {
            }
          else
            t.onError?.(L);
          M(new Error(`Assistance auth error: ${L.message}`));
        };
        if (X.disposeMessageListener = m0(
          window,
          E,
          {
            onReady: () => {
              if (o === X)
                if (e) {
                  if (X.settled || ft) return;
                  if (Date.now() >= b + 15e3) {
                    tt(() => Q({ code: "AUTH_READY_TIMEOUT", message: "认证页面初始化超时，请稍后重试。" }));
                    return;
                  }
                  ft = !0;
                  try {
                    st?.postMessage(St(
                      Z0,
                      E,
                      { runtimeSource: Mr, config: nt }
                    ), V.allowedOrigin);
                  } catch (L) {
                    tt(() => Q({ code: "CUSTOM_BOOT_FAILED", message: L instanceof Error ? L.message : String(L) }));
                    return;
                  }
                  pt(t.onReady, "onReady");
                } else
                  ht(), $(), t.onReady?.();
            },
            onPresentationReady: () => {
              if (e && Date.now() >= b + 15e3 && !X.presented) {
                tt(() => Q({ code: "AUTH_READY_TIMEOUT", message: "认证页面初始化超时，请稍后重试。" }));
                return;
              }
              clearTimeout(J), it && xt();
            },
            onStateChange: (L) => {
              o !== X || X.settled || e && ot === L.type || (ot = L.type, pt(t.onStateChange, "onStateChange", L), L.type === "idLast4Complete" && pt(t.onBeforeLogin, "onBeforeLogin"));
            },
            onSuccess: (L) => tt(() => {
              e ? pt(t.onSuccess, "onSuccess", L) : t.onSuccess?.(L), Y(L);
            }),
            onCancel: (L) => tt(() => {
              e ? pt(t.onCancel, "onCancel", L) : t.onCancel?.(L), M(new Error("Assistance auth cancelled"));
            }),
            onError: (L) => tt(() => Q(L)),
            // 非终态通知：纯透传，不 settle、不关弹窗、不 reject —— 终态语义不变。
            // settled 之后不再透传：关闭动画期间迟到的通知对调用方已无意义（流程已终结）。
            onErrorNotice: (L) => {
              o === X && !X.settled && t.onErrorNotice?.(L);
            },
            onPhoneReady: (L) => {
              o === X && !X.settled && t.onPhoneReady?.(L);
            },
            onResize: (L) => {
              if (e) {
                o === X && !X.settled && T.heightMode === "auto" && (N ? X.keyboardAvoidance?.update(L) : I.style.height = `${L.height}px`);
                return;
              }
              if (o === X && W === "inline") {
                G || (X.frame.style.height = `${L.height}px`);
                return;
              }
              o !== X || W === "ginkgo-v23-viewport-modal" || T.heightMode !== "auto" || !X.keyboardAvoidance || X.keyboardAvoidance.update(L);
            },
            onClose: () => tt(() => {
              e ? pt(t.onClose, "onClose") : t.onClose?.(), M(new Error("Assistance auth closed"));
            })
          },
          V.allowedOrigin,
          {
            expectedSource: st,
            expectedSourceTypes: e ? void 0 : W === "inline" ? [pe, De] : [pe]
          }
        ), e || it && Dt(r)) {
          J = setTimeout(() => tt(() => {
            Q({ code: "AUTH_READY_TIMEOUT", message: "认证页面初始化超时，请稍后重试。" });
          }), e ? Math.max(0, b + 15e3 - Date.now()) : 15e3);
          const L = X.disposeMessageListener;
          X.disposeMessageListener = () => {
            clearTimeout(J), L?.();
          };
        }
      });
    },
    precheck(d) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth precheck requires a browser window and document"));
      if (u)
        return u;
      const b = d.timeoutMs ?? Ii, S = S0(), D = R0(), R = j0({
        verificationUrl: D.verificationUrl,
        sessionId: S,
        request: { scene: d.scene, requestId: d.requestId },
        mode: "probe",
        appId: r
      }), H = po(R), j = new Promise((g) => {
        let B = !1, E, O;
        const V = (N) => {
          B || (B = !0, O !== void 0 && clearTimeout(O), E?.(), H.remove(), g(N));
        };
        p = () => V({ eligible: !1, reason: "unknown" }), E = m0(
          window,
          S,
          { onProbeResult: (N) => V(N) },
          D.allowedOrigin
        ), O = setTimeout(() => V({ eligible: !1, reason: "unknown" }), b), document.body.appendChild(H);
      }).finally(() => {
        u = void 0, p = void 0;
      });
      return u = j, j;
    },
    close() {
      const d = o;
      if (d?.frame.contentWindow)
        try {
          d.frame.contentWindow.postMessage(St(ce, d.sessionId), d.allowedOrigin ?? "*");
        } catch {
        }
      if (d && !d.settled && d.reject) {
        d.settled = !0;
        const b = d.reject;
        if (e && (d.presentation !== "bottom-sheet" || !d.presented)) {
          c(d), pt(t.onClose, "onClose"), b(new Error("Assistance auth closed"));
          return;
        }
        x(d).then(() => {
          e ? pt(t.onClose, "onClose") : t.onClose?.(), b(new Error("Assistance auth closed"));
        });
        return;
      }
      c(d);
    },
    destroy() {
      p?.();
      const d = o;
      d && w(d, new Error("Assistance auth destroyed"));
    }
  };
  return l;
}
({
  ...Object.fromEntries(je.map((t) => [t, "yuanbao"]))
});
const ko = "《第三方共享个人信息清单》", Po = `<!doctype html>
<html lang="zh-CN" data-custom-template="duodian-health">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>身份验证</title></head>
<body>
<main data-stage>
  <section data-card aria-label="身份验证">
    <button data-close type="button" aria-label="关闭" hidden>×</button>
    <img data-security-title src="__DUODIAN_SECURITY_IMAGE__" width="318" height="47" alt="信息安全保障中">
    <div data-phone-prompt><span>输入身份证后四位验证您</span><div id="ydrzPhoneControl"></div><span>的实名信息</span></div>
    <img data-identity-guide src="__DUODIAN_IDENTITY_IMAGE__" width="649" height="120" alt="公民身份证号码示意，请填写后四位数">
    <div data-id-entry>
      <div data-id-grid role="button" tabindex="0" aria-label="编辑身份证后四位" aria-describedby="duodian-input-message">
        <span data-id-box><span data-digit></span><span data-caret hidden></span></span>
        <span data-id-box><span data-digit></span><span data-caret hidden></span></span>
        <span data-id-box><span data-digit></span><span data-caret hidden></span></span>
        <span data-id-box><span data-digit></span><span data-caret hidden></span></span>
      </div>
      <input data-id-value type="text" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="身份证后四位" readonly inputmode="none" tabindex="-1">
    </div>
    <p data-message id="duodian-input-message" role="status" hidden></p>
    <div data-sms><div id="ydrzYZMControl"></div><div id="ydrzYZMBtnControl"></div></div>
    <div id="ydrzSubmitControl"></div>
    <button data-other type="button">选择其他方式</button>
    <section data-agreements aria-label="协议与授权说明">
      <div id="ydrzAgreementControl"></div><div id="ydrzTipsControl"></div><div id="ydrzStateControl"></div>
      <div data-caller-agreements></div>
    </section>
  </section>
  <section data-keyboard aria-label="安全键盘" hidden>
    <button data-collapse type="button">收起键盘</button>
    <div data-key-grid>
      <button data-key="1" type="button">1</button><button data-key="2" type="button">2</button><button data-key="3" type="button">3</button>
      <button data-key="4" type="button">4</button><button data-key="5" type="button">5</button><button data-key="6" type="button">6</button>
      <button data-key="7" type="button">7</button><button data-key="8" type="button">8</button><button data-key="9" type="button">9</button>
      <button data-key="X" type="button">X</button><button data-key="0" type="button">0</button><button data-key="delete" type="button" aria-label="删除末位">删除</button>
    </div>
  </section>
</main>
</body></html>
`, bo = `[data-custom-root][data-custom-template="duodian-health"] {
  width:100%; color:#252a32; background:#fff; border-radius:16px 16px 0 0;
  font-family:"PingFang SC","Microsoft YaHei",sans-serif; -webkit-text-size-adjust:100%;
}
/* This stylesheet is injected only into the customer iframe and its reader. */
html, body { margin:0; }
[data-custom-template="duodian-health"] *, [data-custom-template="duodian-health"] *::before, [data-custom-template="duodian-health"] *::after { box-sizing:border-box; }
[data-custom-template="duodian-health"] [hidden] { display:none !important; }
[data-custom-template="duodian-health"] [data-stage] { display:flex; flex-direction:column; width:100%; max-height:var(--duodian-viewport-height,100dvh); overflow:hidden; border-radius:inherit; }
[data-custom-template="duodian-health"] [data-card] { position:relative; flex:0 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:28px 24px max(20px,env(safe-area-inset-bottom,0px)); }
[data-custom-template="duodian-health"] [data-close] { position:absolute; right:12px; top:10px; width:30px; height:30px; padding:0; border:0; border-radius:50%; background:#f5f5f5; color:#7a7a7a; font-size:24px; }
[data-custom-template="duodian-health"] [data-security-title] { display:block; width:48.6%; max-width:318px; height:auto; margin:0 auto 20px; }
[data-custom-template="duodian-health"] [data-phone-prompt] { display:flex; align-items:center; justify-content:center; gap:2px; margin-bottom:14px; color:#8d8d92; font-size:clamp(12px,3.6vw,17px); line-height:1.6; text-align:center; }
[data-custom-template="duodian-health"] #ydrzPhoneControl { display:inline-flex !important; width:auto !important; margin:0; font-size:inherit !important; }
[data-custom-template="duodian-health"] #ydrzPhoneControl :is(.ydrz-maskphone-wrap,p) { max-width:100%; height:auto !important; margin:0 !important; padding:0 !important; font-family:inherit !important; line-height:1.6 !important; }
[data-custom-template="duodian-health"] [data-identity-guide] { display:block; width:100%; height:auto; margin:0 auto 12px; }
[data-custom-template="duodian-health"] [data-id-entry] { position:relative; margin:0 8px 24px; }
[data-custom-template="duodian-health"] [data-id-grid] { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; cursor:text; outline-offset:4px; }
[data-custom-template="duodian-health"] [data-id-box] { display:flex; align-items:center; justify-content:center; aspect-ratio:1.06; border:1px solid #dce8ff; border-radius:8px; background:#eef6ff; font-size:clamp(24px,7vw,38px); }
[data-custom-template="duodian-health"] [data-id-box][data-active="true"] { border:2px solid #ff9b34; background:#fffaf3; }
[data-custom-template="duodian-health"] [data-caret] { width:2px; height:66%; background:#0082ff; animation:duodian-caret 1s step-end infinite; }
[data-custom-template="duodian-health"] [data-id-value] { position:absolute; width:1px; height:1px; padding:0; border:0; opacity:0; pointer-events:none; }
[data-custom-template="duodian-health"][data-input-mode="native"] [data-id-value] { inset:0; width:100%; height:100%; font-size:16px; color:transparent; caret-color:transparent; pointer-events:auto; }
[data-custom-template="duodian-health"] [data-message] { margin:-12px 0 12px; color:#ce4e25; font-size:12px; line-height:1.5; text-align:center; overflow-wrap:anywhere; }
/* The official SDK owns these slots and all control visibility, including SMS. */
[data-custom-template="duodian-health"] #ydrzSubmitControl { width:100%; aspect-ratio:638 / 116; margin:0; }
[data-custom-template="duodian-health"] #ydrzSubmitControl > *, [data-custom-template="duodian-health"] #ydrzSubmitControl .submit-btn { width:100% !important; height:100% !important; margin:0 !important; border:0; border-radius:16px; font-family:inherit !important; font-weight:700; }
[data-custom-template="duodian-health"] [data-other] { display:block; width:100%; margin:16px auto 18px; padding:0; border:0; background:transparent; color:#00bc4e; font:600 16px/1.5 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; }
[data-custom-template="duodian-health"] [data-other]:disabled { opacity:.5; cursor:default; }
[data-custom-template="duodian-health"] [data-agreements] { color:#8d8d92; font-size:12px; line-height:1.8; text-align:left; overflow-wrap:anywhere; }
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl,#ydrzStateControl) { max-width:100%; }
/* Adapt provider text without changing its control visibility or checkbox layout. */
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl,#ydrzStateControl),
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl,#ydrzStateControl) :is(p,.auth-tips-title,.auth-tips,.expire-span) { color:#8d8d92 !important; text-align:left !important; white-space:normal; overflow-wrap:anywhere; }
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl,#ydrzStateControl) p { width:100%; min-width:0; max-width:100%; margin:0 !important; padding:0 !important; }
/* Keep agreement and authorization copy in one flow; the state slot stays separate. */
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl),
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl) p { display:inline !important; width:auto !important; }
/* Provider tips have an independent inline 14px default; match the 12px agreement. */
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl),
[data-custom-template="duodian-health"] :is(#ydrzAgreementControl,#ydrzTipsControl) :is(p,span,a,.auth-tips-title,.auth-tips) { font-size:12px !important; }
[data-custom-template="duodian-health"] #ydrzAgreementControl a { display:inline !important; color:#77777e !important; text-decoration:none; }
[data-custom-template="duodian-health"] [data-caller-agreements] label { display:flex; align-items:flex-start; gap:4px; margin-top:5px; }
[data-custom-template="duodian-health"] [data-caller-agreements] input { flex:0 0 auto; margin:4px 0 0; accent-color:#19be00; }
[data-custom-template="duodian-health"] [data-caller-agreements] a { color:#77777e; text-decoration:none; }
[data-custom-template="duodian-health"] [data-keyboard] { flex:0 0 auto; padding:0 6px max(6px,env(safe-area-inset-bottom,0px)); background:#d1d4da; }
[data-custom-template="duodian-health"] [data-collapse] { display:block; width:100%; height:26px; padding:0 8px; border:0; background:transparent; color:#4b5563; font-size:12px; text-align:right; }
[data-custom-template="duodian-health"] [data-key-grid] { display:grid; height:clamp(144px,43vw,204px); grid-template-columns:repeat(3,minmax(0,1fr)); grid-template-rows:repeat(4,minmax(0,1fr)); gap:6px; }
[data-custom-template="duodian-health"] [data-key] { min-height:0; border:0; border-radius:5px; background:#fff; color:#252a32; font-size:24px; touch-action:manipulation; }
[data-custom-template="duodian-health"] [data-key]:active { background:#eff0f3; }
[data-custom-template="duodian-health"] [data-key="delete"] { background:transparent; font-size:15px; }
/* Agreement reading belongs to the existing SDK reader, outside the page root. */
.ydrz-confirm-iframe { max-width:100% !important; max-height:100% !important; }
[data-custom-template="duodian-health"].custom-agreement-reader { min-height:100%; padding:16px; color:#333; background:#fff; }
[data-custom-template="duodian-health"].custom-agreement-reader nav a { color:#77777e; }
@keyframes duodian-caret { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
@media(max-height:500px) { [data-custom-template="duodian-health"] [data-card] { padding-top:16px; } [data-custom-template="duodian-health"] [data-security-title] { margin-bottom:12px; } }
@media(prefers-reduced-motion:reduce) { [data-custom-template="duodian-health"] [data-caret] { animation:none; } }
`, Ho = `(() => {
  const root = document.querySelector('[data-custom-root][data-custom-template="duodian-health"]');
  const api = window.AssistanceCustomPage;
  const options = window.DuodianHealthPageConfig;
  delete window.DuodianHealthPageConfig;
  const keyboardMode = options.useCustomKeyboard !== false;
  const stage = root.querySelector('[data-stage]');
  const card = root.querySelector('[data-card]');
  const input = root.querySelector('[data-id-value]');
  const grid = root.querySelector('[data-id-grid]');
  const keyboard = root.querySelector('[data-keyboard]');
  const other = root.querySelector('[data-other]');
  const close = root.querySelector('[data-close]');
  const agreements = root.querySelector('[data-agreements]');
  const checks = [];
  const removers = [];
  let state = { phase: 'initializing', idLast4: '', inputError: null, message: null, agreementReaderOpen: false };
  let keyboardOpen = false;
  let readerSnapshot;
  let disposed = false;
  root.dataset.inputMode = keyboardMode ? 'custom' : 'native';
  input.readOnly = keyboardMode;
  input.inputMode = keyboardMode ? 'none' : 'text';
  close.hidden = !options.closable;

  function listen(node, event, action, capture = false) {
    node.addEventListener(event, action, capture);
    removers.push(() => node.removeEventListener(event, action, capture));
  }
  function busy() { return state.phase === 'submitting' || state.phase === 'completed'; }
  function editable() { return !disposed && !busy() && !state.agreementReaderOpen && (state.phase === 'ready' || state.phase === 'error'); }
  function blocked() { return disposed || busy() || state.agreementReaderOpen; }
  function render() {
    if (disposed) return;
    const canEdit = editable();
    const active = canEdit && (keyboardMode ? keyboardOpen : document.activeElement === input);
    const showKeyboard = keyboardMode && keyboardOpen && canEdit;
    stage.dataset.keyboardOpen = String(showKeyboard);
    card.dataset.submitting = String(busy());
    card.dataset.error = String(Boolean(state.inputError));
    keyboard.hidden = !showKeyboard;
    input.value = state.idLast4;
    input.disabled = !canEdit;
    grid.tabIndex = canEdit ? 0 : -1;
    grid.setAttribute('aria-disabled', String(!canEdit));
    root.querySelectorAll('[data-id-box]').forEach((box, index) => {
      box.querySelector('[data-digit]').textContent = state.idLast4[index] || '';
      const current = active && state.idLast4.length < 4 && index === state.idLast4.length;
      box.dataset.active = String(current);
      box.querySelector('[data-caret]').hidden = !current;
    });
    const message = root.querySelector('[data-message]');
    message.textContent = state.inputError || state.message || '';
    message.hidden = !message.textContent;
    other.disabled = blocked();
    close.disabled = blocked();
    agreements.inert = blocked();
    checks.forEach(check => { check.node.disabled = blocked(); check.node.checked = check.checked; });
    root.querySelectorAll('[data-key]').forEach(button => { button.disabled = !canEdit; });
    updateNaturalHeight();
  }
  function update(value) {
    if (editable() && value !== state.idLast4) api.setIdLast4(value);
  }
  function edit() {
    if (!editable()) return;
    keyboardOpen = keyboardMode;
    if (keyboardMode) grid.focus({ preventScroll: true });
    else input.focus({ preventScroll: true });
    render();
  }
  listen(grid, 'click', edit);
  listen(grid, 'keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); edit(); }
  });
  listen(input, 'input', () => {
    if (!keyboardMode) update(input.value.replace(/[^0-9Xx]/g, '').toUpperCase().slice(0, 4));
    render();
  });
  listen(input, 'focus', render);
  listen(input, 'blur', render);
  root.querySelectorAll('[data-key]').forEach(button => listen(button, 'click', () => {
    if (!keyboardMode || !keyboardOpen || !editable()) return;
    const key = button.dataset.key;
    if (key === 'delete') update(state.idLast4.slice(0, -1));
    else if (/^[0-9xX]$/.test(key) && state.idLast4.length < 4) update(state.idLast4 + key.toUpperCase());
  }));
  listen(root.querySelector('[data-collapse]'), 'click', () => {
    if (!editable()) return;
    keyboardOpen = false; render(); grid.focus({ preventScroll: true });
  });
  listen(other, 'click', () => { if (!blocked()) api.close(); });
  listen(close, 'click', () => { if (options.closable && !blocked()) api.close(); });
  // Capture precedes official agreement listeners and blocks even synthetic clicks.
  listen(agreements, 'click', event => {
    if (blocked()) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  options.agreements.forEach((agreement, index) => {
    const row = document.createElement('label');
    const node = document.createElement('input'); node.type = 'checkbox';
    node.setAttribute('aria-label', '同意' + agreement.name);
    const text = document.createElement('span'); text.textContent = '已阅读并同意';
    const link = document.createElement('a'); link.textContent = agreement.name;
    link.href = agreement.link; link.target = '_blank'; link.rel = 'noopener';
    row.append(node, text, link); agreements.querySelector('[data-caller-agreements]').append(row);
    const check = { node, checked: false }; checks.push(check);
    listen(node, 'change', () => {
      if (!blocked()) { check.checked = node.checked; api.setCallerAgreementChecked(index, node.checked); }
      render();
    });
  });
  const viewport = window.visualViewport;
  function updateNaturalHeight() {
    if (disposed) return;
    // Report intrinsic content to the existing RESIZE bridge. The visible stage
    // still fits the iframe; wrapper applies its existing host viewport clamp.
    const height = Math.ceil(card.scrollHeight + (keyboard.hidden ? 0 : keyboard.getBoundingClientRect().height));
    if (height > 0 && root.style.minHeight !== height + 'px') root.style.minHeight = height + 'px';
  }
  function updateViewport() {
    if (disposed) return;
    const height = viewport ? viewport.height : window.innerHeight;
    if (Number.isFinite(height) && height > 0) root.style.setProperty('--duodian-viewport-height', Math.round(height) + 'px');
    updateNaturalHeight();
  }
  listen(window, 'resize', updateViewport);
  listen(window, 'orientationchange', updateViewport);
  if (viewport) { listen(viewport, 'resize', updateViewport); listen(viewport, 'scroll', updateViewport); }
  const contentObserver = new MutationObserver(updateNaturalHeight);
  contentObserver.observe(card, { childList: true, subtree: true, characterData: true });
  removers.push(() => contentObserver.disconnect());
  if (typeof ResizeObserver !== 'undefined') {
    const sizeObserver = new ResizeObserver(updateNaturalHeight);
    sizeObserver.observe(card); sizeObserver.observe(keyboard);
    removers.push(() => sizeObserver.disconnect());
  }
  api.register({
    onStateChange(next) {
      if (disposed) return;
      const openingReader = next.agreementReaderOpen && !state.agreementReaderOpen;
      const closingReader = !next.agreementReaderOpen && state.agreementReaderOpen;
      if (openingReader) {
        readerSnapshot = { keyboardOpen, focus: root.contains(document.activeElement) ? document.activeElement : null };
        keyboardOpen = false;
      }
      if (next.idLast4.length === 4 && state.idLast4.length !== 4 && !next.agreementReaderOpen) keyboardOpen = false;
      state = next;
      if (closingReader && readerSnapshot) {
        keyboardOpen = readerSnapshot.keyboardOpen;
        const focus = readerSnapshot.focus; readerSnapshot = undefined;
        render();
        if (editable() && focus && focus.isConnected) focus.focus({ preventScroll: true });
      }
      render();
    },
    dispose() {
      disposed = true; readerSnapshot = undefined;
      removers.splice(0).forEach(remove => remove());
    },
  });
  updateViewport();
  render();
})();
`, wo = "data:image/jpeg;base64,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", yo = "data:image/jpeg;base64,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";
function So(t) {
  return {
    html: Po.replace("__DUODIAN_SECURITY_IMAGE__", wo).replace("__DUODIAN_IDENTITY_IMAGE__", yo),
    css: bo,
    js: `window.DuodianHealthPageConfig = ${JSON.stringify({
      closable: t.closable,
      useCustomKeyboard: t.useCustomKeyboard,
      agreements: t.agreements
    })};
${Ho}`
  };
}
function jo(t) {
  const r = t.closable ?? !1, e = t.useCustomKeyboard ?? !0, n = (t.agreements ?? []).filter(({ name: s }) => s.trim() !== ko);
  return vo({
    ...t,
    appId: t.appId ?? "8a9481c79c05c8bd019f6a0a6c002457",
    closable: r,
    useCustomKeyboard: e,
    agreements: n,
    customPage: So({ closable: r, useCustomKeyboard: e, agreements: n }),
    styleOption: {
      ...t.styleOption,
      phoneStyle: { width: "100%", height: "auto", fontSize: "14px", fontColor: "#8d8d92", ...t.styleOption?.phoneStyle },
      submitBtnStyle: {
        ...t.styleOption?.submitBtnStyle,
        name: "授权登录",
        width: "100%",
        height: "100%",
        bgColor: "#19be00",
        fontColor: "#FFFFFF",
        fontSize: "22px",
        borderRadius: "16px",
        textAlign: "center"
      },
      submitBtnDisabledStyle: {
        ...t.styleOption?.submitBtnDisabledStyle,
        width: "100%",
        height: "100%",
        bgColor: "#e2e6e2",
        fontColor: "#8a8f8a",
        borderRadius: "16px"
      },
      submitBtnLoadingStyle: {
        ...t.styleOption?.submitBtnLoadingStyle,
        width: "100%",
        height: "100%",
        bgColor: "#8bbe81",
        fontColor: "#FFFFFF",
        borderRadius: "16px"
      },
      agreeStyle: { fontSize: "12px", fontColor: "#8d8d92", hrefColor: "#77777e", ...t.styleOption?.agreeStyle }
    }
  });
}
export {
  jo as createAssistanceMobileAuthSdk,
  ho as getAssistanceMobileAuthOfficialCssAsset,
  Do as injectAssistanceMobileAuthOfficialCss
};
