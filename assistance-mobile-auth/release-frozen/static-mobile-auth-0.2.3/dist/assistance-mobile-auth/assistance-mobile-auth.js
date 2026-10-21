var se = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function tt(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function nt(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var x = e.default;
  if (typeof x == "function") {
    var t = function r() {
      return this instanceof r ? Reflect.construct(x, arguments, this.constructor) : x.apply(this, arguments);
    };
    t.prototype = x.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(e).forEach(function(r) {
    var c = Object.getOwnPropertyDescriptor(e, r);
    Object.defineProperty(t, r, c.get ? c : {
      enumerable: !0,
      get: function() {
        return e[r];
      }
    });
  }), t;
}
var D0 = { exports: {} };
function xt(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var g0 = { exports: {} };
const ot = {}, it = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ot
}, Symbol.toStringTag, { value: "Module" })), at = /* @__PURE__ */ nt(it);
var st = g0.exports, He;
function I() {
  return He || (He = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r();
    })(st, function() {
      var t = t || (function(r, c) {
        var C;
        if (typeof window < "u" && window.crypto && (C = window.crypto), typeof self < "u" && self.crypto && (C = self.crypto), typeof globalThis < "u" && globalThis.crypto && (C = globalThis.crypto), !C && typeof window < "u" && window.msCrypto && (C = window.msCrypto), !C && typeof se < "u" && se.crypto && (C = se.crypto), !C && typeof xt == "function")
          try {
            C = at;
          } catch {
          }
        var y = function() {
          if (C) {
            if (typeof C.getRandomValues == "function")
              try {
                return C.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof C.randomBytes == "function")
              try {
                return C.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, h = Object.create || /* @__PURE__ */ (function() {
          function n() {
          }
          return function(i) {
            var f;
            return n.prototype = i, f = new n(), n.prototype = null, f;
          };
        })(), E = {}, o = E.lib = {}, s = o.Base = /* @__PURE__ */ (function() {
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
            extend: function(n) {
              var i = h(this);
              return n && i.mixIn(n), (!i.hasOwnProperty("init") || this.init === i.init) && (i.init = function() {
                i.$super.init.apply(this, arguments);
              }), i.init.prototype = i, i.$super = this, i;
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
              var n = this.extend();
              return n.init.apply(n, arguments), n;
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
            mixIn: function(n) {
              for (var i in n)
                n.hasOwnProperty(i) && (this[i] = n[i]);
              n.hasOwnProperty("toString") && (this.toString = n.toString);
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
        })(), A = o.WordArray = s.extend({
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
          init: function(n, i) {
            n = this.words = n || [], i != c ? this.sigBytes = i : this.sigBytes = n.length * 4;
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
          toString: function(n) {
            return (n || l).stringify(this);
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
          concat: function(n) {
            var i = this.words, f = n.words, p = this.sigBytes, D = n.sigBytes;
            if (this.clamp(), p % 4)
              for (var F = 0; F < D; F++) {
                var m = f[F >>> 2] >>> 24 - F % 4 * 8 & 255;
                i[p + F >>> 2] |= m << 24 - (p + F) % 4 * 8;
              }
            else
              for (var P = 0; P < D; P += 4)
                i[p + P >>> 2] = f[P >>> 2];
            return this.sigBytes += D, this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var n = this.words, i = this.sigBytes;
            n[i >>> 2] &= 4294967295 << 32 - i % 4 * 8, n.length = r.ceil(i / 4);
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
            var n = s.clone.call(this);
            return n.words = this.words.slice(0), n;
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
          random: function(n) {
            for (var i = [], f = 0; f < n; f += 4)
              i.push(y());
            return new A.init(i, n);
          }
        }), a = E.enc = {}, l = a.Hex = {
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
          stringify: function(n) {
            for (var i = n.words, f = n.sigBytes, p = [], D = 0; D < f; D++) {
              var F = i[D >>> 2] >>> 24 - D % 4 * 8 & 255;
              p.push((F >>> 4).toString(16)), p.push((F & 15).toString(16));
            }
            return p.join("");
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
          parse: function(n) {
            for (var i = n.length, f = [], p = 0; p < i; p += 2)
              f[p >>> 3] |= parseInt(n.substr(p, 2), 16) << 24 - p % 8 * 4;
            return new A.init(f, i / 2);
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
          stringify: function(n) {
            for (var i = n.words, f = n.sigBytes, p = [], D = 0; D < f; D++) {
              var F = i[D >>> 2] >>> 24 - D % 4 * 8 & 255;
              p.push(String.fromCharCode(F));
            }
            return p.join("");
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
          parse: function(n) {
            for (var i = n.length, f = [], p = 0; p < i; p++)
              f[p >>> 2] |= (n.charCodeAt(p) & 255) << 24 - p % 4 * 8;
            return new A.init(f, i);
          }
        }, v = a.Utf8 = {
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
          stringify: function(n) {
            try {
              return decodeURIComponent(escape(u.stringify(n)));
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
          parse: function(n) {
            return u.parse(unescape(encodeURIComponent(n)));
          }
        }, d = o.BufferedBlockAlgorithm = s.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new A.init(), this._nDataBytes = 0;
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
          _append: function(n) {
            typeof n == "string" && (n = v.parse(n)), this._data.concat(n), this._nDataBytes += n.sigBytes;
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
          _process: function(n) {
            var i, f = this._data, p = f.words, D = f.sigBytes, F = this.blockSize, m = F * 4, P = D / m;
            n ? P = r.ceil(P) : P = r.max((P | 0) - this._minBufferSize, 0);
            var B = P * F, b = r.min(B * 4, D);
            if (B) {
              for (var w = 0; w < B; w += F)
                this._doProcessBlock(p, w);
              i = p.splice(0, B), f.sigBytes -= b;
            }
            return new A.init(i, b);
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
            var n = s.clone.call(this);
            return n._data = this._data.clone(), n;
          },
          _minBufferSize: 0
        });
        o.Hasher = d.extend({
          /**
           * Configuration options.
           */
          cfg: s.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(n) {
            this.cfg = this.cfg.extend(n), this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            d.reset.call(this), this._doReset();
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
          update: function(n) {
            return this._append(n), this._process(), this;
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
          finalize: function(n) {
            n && this._append(n);
            var i = this._doFinalize();
            return i;
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
          _createHelper: function(n) {
            return function(i, f) {
              return new n.init(f).finalize(i);
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
          _createHmacHelper: function(n) {
            return function(i, f) {
              return new g.HMAC.init(n, f).finalize(i);
            };
          }
        });
        var g = E.algo = {};
        return E;
      })(Math);
      return t;
    });
  })(g0)), g0.exports;
}
var y0 = { exports: {} }, ct = y0.exports, Pe;
function oe() {
  return Pe || (Pe = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(ct, function(t) {
      return (function(r) {
        var c = t, C = c.lib, y = C.Base, h = C.WordArray, E = c.x64 = {};
        E.Word = y.extend({
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
          init: function(o, s) {
            this.high = o, this.low = s;
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
        }), E.WordArray = y.extend({
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
          init: function(o, s) {
            o = this.words = o || [], s != r ? this.sigBytes = s : this.sigBytes = o.length * 8;
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
            for (var o = this.words, s = o.length, A = [], a = 0; a < s; a++) {
              var l = o[a];
              A.push(l.high), A.push(l.low);
            }
            return h.create(A, this.sigBytes);
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
            for (var o = y.clone.call(this), s = o.words = this.words.slice(0), A = s.length, a = 0; a < A; a++)
              s[a] = s[a].clone();
            return o;
          }
        });
      })(), t;
    });
  })(y0)), y0.exports;
}
var b0 = { exports: {} }, ft = b0.exports, ze;
function ut() {
  return ze || (ze = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(ft, function(t) {
      return (function() {
        if (typeof ArrayBuffer == "function") {
          var r = t, c = r.lib, C = c.WordArray, y = C.init, h = C.init = function(E) {
            if (E instanceof ArrayBuffer && (E = new Uint8Array(E)), (E instanceof Int8Array || typeof Uint8ClampedArray < "u" && E instanceof Uint8ClampedArray || E instanceof Int16Array || E instanceof Uint16Array || E instanceof Int32Array || E instanceof Uint32Array || E instanceof Float32Array || E instanceof Float64Array) && (E = new Uint8Array(E.buffer, E.byteOffset, E.byteLength)), E instanceof Uint8Array) {
              for (var o = E.byteLength, s = [], A = 0; A < o; A++)
                s[A >>> 2] |= E[A] << 24 - A % 4 * 8;
              y.call(this, s, o);
            } else
              y.apply(this, arguments);
          };
          h.prototype = C;
        }
      })(), t.lib.WordArray;
    });
  })(b0)), b0.exports;
}
var m0 = { exports: {} }, dt = m0.exports, Te;
function lt() {
  return Te || (Te = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(dt, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = r.enc;
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
          stringify: function(E) {
            for (var o = E.words, s = E.sigBytes, A = [], a = 0; a < s; a += 2) {
              var l = o[a >>> 2] >>> 16 - a % 4 * 8 & 65535;
              A.push(String.fromCharCode(l));
            }
            return A.join("");
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
          parse: function(E) {
            for (var o = E.length, s = [], A = 0; A < o; A++)
              s[A >>> 1] |= E.charCodeAt(A) << 16 - A % 2 * 16;
            return C.create(s, o * 2);
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
          stringify: function(E) {
            for (var o = E.words, s = E.sigBytes, A = [], a = 0; a < s; a += 2) {
              var l = h(o[a >>> 2] >>> 16 - a % 4 * 8 & 65535);
              A.push(String.fromCharCode(l));
            }
            return A.join("");
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
          parse: function(E) {
            for (var o = E.length, s = [], A = 0; A < o; A++)
              s[A >>> 1] |= h(E.charCodeAt(A) << 16 - A % 2 * 16);
            return C.create(s, o * 2);
          }
        };
        function h(E) {
          return E << 8 & 4278255360 | E >>> 8 & 16711935;
        }
      })(), t.enc.Utf16;
    });
  })(m0)), m0.exports;
}
var _0 = { exports: {} }, ht = _0.exports, Le;
function x0() {
  return Le || (Le = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(ht, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = r.enc;
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
          stringify: function(E) {
            var o = E.words, s = E.sigBytes, A = this._map;
            E.clamp();
            for (var a = [], l = 0; l < s; l += 3)
              for (var u = o[l >>> 2] >>> 24 - l % 4 * 8 & 255, v = o[l + 1 >>> 2] >>> 24 - (l + 1) % 4 * 8 & 255, d = o[l + 2 >>> 2] >>> 24 - (l + 2) % 4 * 8 & 255, g = u << 16 | v << 8 | d, n = 0; n < 4 && l + n * 0.75 < s; n++)
                a.push(A.charAt(g >>> 6 * (3 - n) & 63));
            var i = A.charAt(64);
            if (i)
              for (; a.length % 4; )
                a.push(i);
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
          parse: function(E) {
            var o = E.length, s = this._map, A = this._reverseMap;
            if (!A) {
              A = this._reverseMap = [];
              for (var a = 0; a < s.length; a++)
                A[s.charCodeAt(a)] = a;
            }
            var l = s.charAt(64);
            if (l) {
              var u = E.indexOf(l);
              u !== -1 && (o = u);
            }
            return h(E, o, A);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function h(E, o, s) {
          for (var A = [], a = 0, l = 0; l < o; l++)
            if (l % 4) {
              var u = s[E.charCodeAt(l - 1)] << l % 4 * 2, v = s[E.charCodeAt(l)] >>> 6 - l % 4 * 2, d = u | v;
              A[a >>> 2] |= d << 24 - a % 4 * 8, a++;
            }
          return C.create(A, a);
        }
      })(), t.enc.Base64;
    });
  })(_0)), _0.exports;
}
var S0 = { exports: {} }, vt = S0.exports, $e;
function At() {
  return $e || ($e = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(vt, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = r.enc;
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
          stringify: function(E, o) {
            o === void 0 && (o = !0);
            var s = E.words, A = E.sigBytes, a = o ? this._safe_map : this._map;
            E.clamp();
            for (var l = [], u = 0; u < A; u += 3)
              for (var v = s[u >>> 2] >>> 24 - u % 4 * 8 & 255, d = s[u + 1 >>> 2] >>> 24 - (u + 1) % 4 * 8 & 255, g = s[u + 2 >>> 2] >>> 24 - (u + 2) % 4 * 8 & 255, n = v << 16 | d << 8 | g, i = 0; i < 4 && u + i * 0.75 < A; i++)
                l.push(a.charAt(n >>> 6 * (3 - i) & 63));
            var f = a.charAt(64);
            if (f)
              for (; l.length % 4; )
                l.push(f);
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
          parse: function(E, o) {
            o === void 0 && (o = !0);
            var s = E.length, A = o ? this._safe_map : this._map, a = this._reverseMap;
            if (!a) {
              a = this._reverseMap = [];
              for (var l = 0; l < A.length; l++)
                a[A.charCodeAt(l)] = l;
            }
            var u = A.charAt(64);
            if (u) {
              var v = E.indexOf(u);
              v !== -1 && (s = v);
            }
            return h(E, s, a);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function h(E, o, s) {
          for (var A = [], a = 0, l = 0; l < o; l++)
            if (l % 4) {
              var u = s[E.charCodeAt(l - 1)] << l % 4 * 2, v = s[E.charCodeAt(l)] >>> 6 - l % 4 * 2, d = u | v;
              A[a >>> 2] |= d << 24 - a % 4 * 8, a++;
            }
          return C.create(A, a);
        }
      })(), t.enc.Base64url;
    });
  })(S0)), S0.exports;
}
var w0 = { exports: {} }, Ct = w0.exports, Ue;
function o0() {
  return Ue || (Ue = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(Ct, function(t) {
      return (function(r) {
        var c = t, C = c.lib, y = C.WordArray, h = C.Hasher, E = c.algo, o = [];
        (function() {
          for (var v = 0; v < 64; v++)
            o[v] = r.abs(r.sin(v + 1)) * 4294967296 | 0;
        })();
        var s = E.MD5 = h.extend({
          _doReset: function() {
            this._hash = new y.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(v, d) {
            for (var g = 0; g < 16; g++) {
              var n = d + g, i = v[n];
              v[n] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360;
            }
            var f = this._hash.words, p = v[d + 0], D = v[d + 1], F = v[d + 2], m = v[d + 3], P = v[d + 4], B = v[d + 5], b = v[d + 6], w = v[d + 7], _ = v[d + 8], z = v[d + 9], L = v[d + 10], $ = v[d + 11], M = v[d + 12], O = v[d + 13], N = v[d + 14], T = v[d + 15], S = f[0], R = f[1], H = f[2], k = f[3];
            S = A(S, R, H, k, p, 7, o[0]), k = A(k, S, R, H, D, 12, o[1]), H = A(H, k, S, R, F, 17, o[2]), R = A(R, H, k, S, m, 22, o[3]), S = A(S, R, H, k, P, 7, o[4]), k = A(k, S, R, H, B, 12, o[5]), H = A(H, k, S, R, b, 17, o[6]), R = A(R, H, k, S, w, 22, o[7]), S = A(S, R, H, k, _, 7, o[8]), k = A(k, S, R, H, z, 12, o[9]), H = A(H, k, S, R, L, 17, o[10]), R = A(R, H, k, S, $, 22, o[11]), S = A(S, R, H, k, M, 7, o[12]), k = A(k, S, R, H, O, 12, o[13]), H = A(H, k, S, R, N, 17, o[14]), R = A(R, H, k, S, T, 22, o[15]), S = a(S, R, H, k, D, 5, o[16]), k = a(k, S, R, H, b, 9, o[17]), H = a(H, k, S, R, $, 14, o[18]), R = a(R, H, k, S, p, 20, o[19]), S = a(S, R, H, k, B, 5, o[20]), k = a(k, S, R, H, L, 9, o[21]), H = a(H, k, S, R, T, 14, o[22]), R = a(R, H, k, S, P, 20, o[23]), S = a(S, R, H, k, z, 5, o[24]), k = a(k, S, R, H, N, 9, o[25]), H = a(H, k, S, R, m, 14, o[26]), R = a(R, H, k, S, _, 20, o[27]), S = a(S, R, H, k, O, 5, o[28]), k = a(k, S, R, H, F, 9, o[29]), H = a(H, k, S, R, w, 14, o[30]), R = a(R, H, k, S, M, 20, o[31]), S = l(S, R, H, k, B, 4, o[32]), k = l(k, S, R, H, _, 11, o[33]), H = l(H, k, S, R, $, 16, o[34]), R = l(R, H, k, S, N, 23, o[35]), S = l(S, R, H, k, D, 4, o[36]), k = l(k, S, R, H, P, 11, o[37]), H = l(H, k, S, R, w, 16, o[38]), R = l(R, H, k, S, L, 23, o[39]), S = l(S, R, H, k, O, 4, o[40]), k = l(k, S, R, H, p, 11, o[41]), H = l(H, k, S, R, m, 16, o[42]), R = l(R, H, k, S, b, 23, o[43]), S = l(S, R, H, k, z, 4, o[44]), k = l(k, S, R, H, M, 11, o[45]), H = l(H, k, S, R, T, 16, o[46]), R = l(R, H, k, S, F, 23, o[47]), S = u(S, R, H, k, p, 6, o[48]), k = u(k, S, R, H, w, 10, o[49]), H = u(H, k, S, R, N, 15, o[50]), R = u(R, H, k, S, B, 21, o[51]), S = u(S, R, H, k, M, 6, o[52]), k = u(k, S, R, H, m, 10, o[53]), H = u(H, k, S, R, L, 15, o[54]), R = u(R, H, k, S, D, 21, o[55]), S = u(S, R, H, k, _, 6, o[56]), k = u(k, S, R, H, T, 10, o[57]), H = u(H, k, S, R, b, 15, o[58]), R = u(R, H, k, S, O, 21, o[59]), S = u(S, R, H, k, P, 6, o[60]), k = u(k, S, R, H, $, 10, o[61]), H = u(H, k, S, R, F, 15, o[62]), R = u(R, H, k, S, z, 21, o[63]), f[0] = f[0] + S | 0, f[1] = f[1] + R | 0, f[2] = f[2] + H | 0, f[3] = f[3] + k | 0;
          },
          _doFinalize: function() {
            var v = this._data, d = v.words, g = this._nDataBytes * 8, n = v.sigBytes * 8;
            d[n >>> 5] |= 128 << 24 - n % 32;
            var i = r.floor(g / 4294967296), f = g;
            d[(n + 64 >>> 9 << 4) + 15] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, d[(n + 64 >>> 9 << 4) + 14] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, v.sigBytes = (d.length + 1) * 4, this._process();
            for (var p = this._hash, D = p.words, F = 0; F < 4; F++) {
              var m = D[F];
              D[F] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360;
            }
            return p;
          },
          clone: function() {
            var v = h.clone.call(this);
            return v._hash = this._hash.clone(), v;
          }
        });
        function A(v, d, g, n, i, f, p) {
          var D = v + (d & g | ~d & n) + i + p;
          return (D << f | D >>> 32 - f) + d;
        }
        function a(v, d, g, n, i, f, p) {
          var D = v + (d & n | g & ~n) + i + p;
          return (D << f | D >>> 32 - f) + d;
        }
        function l(v, d, g, n, i, f, p) {
          var D = v + (d ^ g ^ n) + i + p;
          return (D << f | D >>> 32 - f) + d;
        }
        function u(v, d, g, n, i, f, p) {
          var D = v + (g ^ (d | ~n)) + i + p;
          return (D << f | D >>> 32 - f) + d;
        }
        c.MD5 = h._createHelper(s), c.HmacMD5 = h._createHmacHelper(s);
      })(Math), t.MD5;
    });
  })(w0)), w0.exports;
}
var k0 = { exports: {} }, Et = k0.exports, Ie;
function yr() {
  return Ie || (Ie = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(Et, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = c.Hasher, h = r.algo, E = [], o = h.SHA1 = y.extend({
          _doReset: function() {
            this._hash = new C.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(s, A) {
            for (var a = this._hash.words, l = a[0], u = a[1], v = a[2], d = a[3], g = a[4], n = 0; n < 80; n++) {
              if (n < 16)
                E[n] = s[A + n] | 0;
              else {
                var i = E[n - 3] ^ E[n - 8] ^ E[n - 14] ^ E[n - 16];
                E[n] = i << 1 | i >>> 31;
              }
              var f = (l << 5 | l >>> 27) + g + E[n];
              n < 20 ? f += (u & v | ~u & d) + 1518500249 : n < 40 ? f += (u ^ v ^ d) + 1859775393 : n < 60 ? f += (u & v | u & d | v & d) - 1894007588 : f += (u ^ v ^ d) - 899497514, g = d, d = v, v = u << 30 | u >>> 2, u = l, l = f;
            }
            a[0] = a[0] + l | 0, a[1] = a[1] + u | 0, a[2] = a[2] + v | 0, a[3] = a[3] + d | 0, a[4] = a[4] + g | 0;
          },
          _doFinalize: function() {
            var s = this._data, A = s.words, a = this._nDataBytes * 8, l = s.sigBytes * 8;
            return A[l >>> 5] |= 128 << 24 - l % 32, A[(l + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296), A[(l + 64 >>> 9 << 4) + 15] = a, s.sigBytes = A.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var s = y.clone.call(this);
            return s._hash = this._hash.clone(), s;
          }
        });
        r.SHA1 = y._createHelper(o), r.HmacSHA1 = y._createHmacHelper(o);
      })(), t.SHA1;
    });
  })(k0)), k0.exports;
}
var R0 = { exports: {} }, Bt = R0.exports, Oe;
function he() {
  return Oe || (Oe = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(Bt, function(t) {
      return (function(r) {
        var c = t, C = c.lib, y = C.WordArray, h = C.Hasher, E = c.algo, o = [], s = [];
        (function() {
          function l(g) {
            for (var n = r.sqrt(g), i = 2; i <= n; i++)
              if (!(g % i))
                return !1;
            return !0;
          }
          function u(g) {
            return (g - (g | 0)) * 4294967296 | 0;
          }
          for (var v = 2, d = 0; d < 64; )
            l(v) && (d < 8 && (o[d] = u(r.pow(v, 1 / 2))), s[d] = u(r.pow(v, 1 / 3)), d++), v++;
        })();
        var A = [], a = E.SHA256 = h.extend({
          _doReset: function() {
            this._hash = new y.init(o.slice(0));
          },
          _doProcessBlock: function(l, u) {
            for (var v = this._hash.words, d = v[0], g = v[1], n = v[2], i = v[3], f = v[4], p = v[5], D = v[6], F = v[7], m = 0; m < 64; m++) {
              if (m < 16)
                A[m] = l[u + m] | 0;
              else {
                var P = A[m - 15], B = (P << 25 | P >>> 7) ^ (P << 14 | P >>> 18) ^ P >>> 3, b = A[m - 2], w = (b << 15 | b >>> 17) ^ (b << 13 | b >>> 19) ^ b >>> 10;
                A[m] = B + A[m - 7] + w + A[m - 16];
              }
              var _ = f & p ^ ~f & D, z = d & g ^ d & n ^ g & n, L = (d << 30 | d >>> 2) ^ (d << 19 | d >>> 13) ^ (d << 10 | d >>> 22), $ = (f << 26 | f >>> 6) ^ (f << 21 | f >>> 11) ^ (f << 7 | f >>> 25), M = F + $ + _ + s[m] + A[m], O = L + z;
              F = D, D = p, p = f, f = i + M | 0, i = n, n = g, g = d, d = M + O | 0;
            }
            v[0] = v[0] + d | 0, v[1] = v[1] + g | 0, v[2] = v[2] + n | 0, v[3] = v[3] + i | 0, v[4] = v[4] + f | 0, v[5] = v[5] + p | 0, v[6] = v[6] + D | 0, v[7] = v[7] + F | 0;
          },
          _doFinalize: function() {
            var l = this._data, u = l.words, v = this._nDataBytes * 8, d = l.sigBytes * 8;
            return u[d >>> 5] |= 128 << 24 - d % 32, u[(d + 64 >>> 9 << 4) + 14] = r.floor(v / 4294967296), u[(d + 64 >>> 9 << 4) + 15] = v, l.sigBytes = u.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var l = h.clone.call(this);
            return l._hash = this._hash.clone(), l;
          }
        });
        c.SHA256 = h._createHelper(a), c.HmacSHA256 = h._createHmacHelper(a);
      })(Math), t.SHA256;
    });
  })(R0)), R0.exports;
}
var H0 = { exports: {} }, pt = H0.exports, Ne;
function Ft() {
  return Ne || (Ne = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), he());
    })(pt, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = r.algo, h = y.SHA256, E = y.SHA224 = h.extend({
          _doReset: function() {
            this._hash = new C.init([
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
            var o = h._doFinalize.call(this);
            return o.sigBytes -= 4, o;
          }
        });
        r.SHA224 = h._createHelper(E), r.HmacSHA224 = h._createHmacHelper(E);
      })(), t.SHA224;
    });
  })(H0)), H0.exports;
}
var P0 = { exports: {} }, Dt = P0.exports, Me;
function br() {
  return Me || (Me = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), oe());
    })(Dt, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.Hasher, y = r.x64, h = y.Word, E = y.WordArray, o = r.algo;
        function s() {
          return h.create.apply(h, arguments);
        }
        var A = [
          s(1116352408, 3609767458),
          s(1899447441, 602891725),
          s(3049323471, 3964484399),
          s(3921009573, 2173295548),
          s(961987163, 4081628472),
          s(1508970993, 3053834265),
          s(2453635748, 2937671579),
          s(2870763221, 3664609560),
          s(3624381080, 2734883394),
          s(310598401, 1164996542),
          s(607225278, 1323610764),
          s(1426881987, 3590304994),
          s(1925078388, 4068182383),
          s(2162078206, 991336113),
          s(2614888103, 633803317),
          s(3248222580, 3479774868),
          s(3835390401, 2666613458),
          s(4022224774, 944711139),
          s(264347078, 2341262773),
          s(604807628, 2007800933),
          s(770255983, 1495990901),
          s(1249150122, 1856431235),
          s(1555081692, 3175218132),
          s(1996064986, 2198950837),
          s(2554220882, 3999719339),
          s(2821834349, 766784016),
          s(2952996808, 2566594879),
          s(3210313671, 3203337956),
          s(3336571891, 1034457026),
          s(3584528711, 2466948901),
          s(113926993, 3758326383),
          s(338241895, 168717936),
          s(666307205, 1188179964),
          s(773529912, 1546045734),
          s(1294757372, 1522805485),
          s(1396182291, 2643833823),
          s(1695183700, 2343527390),
          s(1986661051, 1014477480),
          s(2177026350, 1206759142),
          s(2456956037, 344077627),
          s(2730485921, 1290863460),
          s(2820302411, 3158454273),
          s(3259730800, 3505952657),
          s(3345764771, 106217008),
          s(3516065817, 3606008344),
          s(3600352804, 1432725776),
          s(4094571909, 1467031594),
          s(275423344, 851169720),
          s(430227734, 3100823752),
          s(506948616, 1363258195),
          s(659060556, 3750685593),
          s(883997877, 3785050280),
          s(958139571, 3318307427),
          s(1322822218, 3812723403),
          s(1537002063, 2003034995),
          s(1747873779, 3602036899),
          s(1955562222, 1575990012),
          s(2024104815, 1125592928),
          s(2227730452, 2716904306),
          s(2361852424, 442776044),
          s(2428436474, 593698344),
          s(2756734187, 3733110249),
          s(3204031479, 2999351573),
          s(3329325298, 3815920427),
          s(3391569614, 3928383900),
          s(3515267271, 566280711),
          s(3940187606, 3454069534),
          s(4118630271, 4000239992),
          s(116418474, 1914138554),
          s(174292421, 2731055270),
          s(289380356, 3203993006),
          s(460393269, 320620315),
          s(685471733, 587496836),
          s(852142971, 1086792851),
          s(1017036298, 365543100),
          s(1126000580, 2618297676),
          s(1288033470, 3409855158),
          s(1501505948, 4234509866),
          s(1607167915, 987167468),
          s(1816402316, 1246189591)
        ], a = [];
        (function() {
          for (var u = 0; u < 80; u++)
            a[u] = s();
        })();
        var l = o.SHA512 = C.extend({
          _doReset: function() {
            this._hash = new E.init([
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
          _doProcessBlock: function(u, v) {
            for (var d = this._hash.words, g = d[0], n = d[1], i = d[2], f = d[3], p = d[4], D = d[5], F = d[6], m = d[7], P = g.high, B = g.low, b = n.high, w = n.low, _ = i.high, z = i.low, L = f.high, $ = f.low, M = p.high, O = p.low, N = D.high, T = D.low, S = F.high, R = F.low, H = m.high, k = m.low, W = P, q = B, G = b, U = w, u0 = _, i0 = z, ie = L, d0 = $, Q = M, Y = O, B0 = N, l0 = T, p0 = S, h0 = R, ae = H, v0 = k, J = 0; J < 80; J++) {
              var V, r0, F0 = a[J];
              if (J < 16)
                r0 = F0.high = u[v + J * 2] | 0, V = F0.low = u[v + J * 2 + 1] | 0;
              else {
                var pe = a[J - 15], a0 = pe.high, A0 = pe.low, qr = (a0 >>> 1 | A0 << 31) ^ (a0 >>> 8 | A0 << 24) ^ a0 >>> 7, Fe = (A0 >>> 1 | a0 << 31) ^ (A0 >>> 8 | a0 << 24) ^ (A0 >>> 7 | a0 << 25), De = a[J - 2], s0 = De.high, C0 = De.low, Wr = (s0 >>> 19 | C0 << 13) ^ (s0 << 3 | C0 >>> 29) ^ s0 >>> 6, ge = (C0 >>> 19 | s0 << 13) ^ (C0 << 3 | s0 >>> 29) ^ (C0 >>> 6 | s0 << 26), ye = a[J - 7], Kr = ye.high, jr = ye.low, be = a[J - 16], Gr = be.high, me = be.low;
                V = Fe + jr, r0 = qr + Kr + (V >>> 0 < Fe >>> 0 ? 1 : 0), V = V + ge, r0 = r0 + Wr + (V >>> 0 < ge >>> 0 ? 1 : 0), V = V + me, r0 = r0 + Gr + (V >>> 0 < me >>> 0 ? 1 : 0), F0.high = r0, F0.low = V;
              }
              var Xr = Q & B0 ^ ~Q & p0, _e = Y & l0 ^ ~Y & h0, Yr = W & G ^ W & u0 ^ G & u0, Zr = q & U ^ q & i0 ^ U & i0, Vr = (W >>> 28 | q << 4) ^ (W << 30 | q >>> 2) ^ (W << 25 | q >>> 7), Se = (q >>> 28 | W << 4) ^ (q << 30 | W >>> 2) ^ (q << 25 | W >>> 7), Qr = (Q >>> 14 | Y << 18) ^ (Q >>> 18 | Y << 14) ^ (Q << 23 | Y >>> 9), Jr = (Y >>> 14 | Q << 18) ^ (Y >>> 18 | Q << 14) ^ (Y << 23 | Q >>> 9), we = A[J], et = we.high, ke = we.low, Z = v0 + Jr, t0 = ae + Qr + (Z >>> 0 < v0 >>> 0 ? 1 : 0), Z = Z + _e, t0 = t0 + Xr + (Z >>> 0 < _e >>> 0 ? 1 : 0), Z = Z + ke, t0 = t0 + et + (Z >>> 0 < ke >>> 0 ? 1 : 0), Z = Z + V, t0 = t0 + r0 + (Z >>> 0 < V >>> 0 ? 1 : 0), Re = Se + Zr, rt = Vr + Yr + (Re >>> 0 < Se >>> 0 ? 1 : 0);
              ae = p0, v0 = h0, p0 = B0, h0 = l0, B0 = Q, l0 = Y, Y = d0 + Z | 0, Q = ie + t0 + (Y >>> 0 < d0 >>> 0 ? 1 : 0) | 0, ie = u0, d0 = i0, u0 = G, i0 = U, G = W, U = q, q = Z + Re | 0, W = t0 + rt + (q >>> 0 < Z >>> 0 ? 1 : 0) | 0;
            }
            B = g.low = B + q, g.high = P + W + (B >>> 0 < q >>> 0 ? 1 : 0), w = n.low = w + U, n.high = b + G + (w >>> 0 < U >>> 0 ? 1 : 0), z = i.low = z + i0, i.high = _ + u0 + (z >>> 0 < i0 >>> 0 ? 1 : 0), $ = f.low = $ + d0, f.high = L + ie + ($ >>> 0 < d0 >>> 0 ? 1 : 0), O = p.low = O + Y, p.high = M + Q + (O >>> 0 < Y >>> 0 ? 1 : 0), T = D.low = T + l0, D.high = N + B0 + (T >>> 0 < l0 >>> 0 ? 1 : 0), R = F.low = R + h0, F.high = S + p0 + (R >>> 0 < h0 >>> 0 ? 1 : 0), k = m.low = k + v0, m.high = H + ae + (k >>> 0 < v0 >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var u = this._data, v = u.words, d = this._nDataBytes * 8, g = u.sigBytes * 8;
            v[g >>> 5] |= 128 << 24 - g % 32, v[(g + 128 >>> 10 << 5) + 30] = Math.floor(d / 4294967296), v[(g + 128 >>> 10 << 5) + 31] = d, u.sigBytes = v.length * 4, this._process();
            var n = this._hash.toX32();
            return n;
          },
          clone: function() {
            var u = C.clone.call(this);
            return u._hash = this._hash.clone(), u;
          },
          blockSize: 1024 / 32
        });
        r.SHA512 = C._createHelper(l), r.HmacSHA512 = C._createHmacHelper(l);
      })(), t.SHA512;
    });
  })(P0)), P0.exports;
}
var z0 = { exports: {} }, gt = z0.exports, qe;
function yt() {
  return qe || (qe = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), oe(), br());
    })(gt, function(t) {
      return (function() {
        var r = t, c = r.x64, C = c.Word, y = c.WordArray, h = r.algo, E = h.SHA512, o = h.SHA384 = E.extend({
          _doReset: function() {
            this._hash = new y.init([
              new C.init(3418070365, 3238371032),
              new C.init(1654270250, 914150663),
              new C.init(2438529370, 812702999),
              new C.init(355462360, 4144912697),
              new C.init(1731405415, 4290775857),
              new C.init(2394180231, 1750603025),
              new C.init(3675008525, 1694076839),
              new C.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var s = E._doFinalize.call(this);
            return s.sigBytes -= 16, s;
          }
        });
        r.SHA384 = E._createHelper(o), r.HmacSHA384 = E._createHmacHelper(o);
      })(), t.SHA384;
    });
  })(z0)), z0.exports;
}
var T0 = { exports: {} }, bt = T0.exports, We;
function mt() {
  return We || (We = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), oe());
    })(bt, function(t) {
      return (function(r) {
        var c = t, C = c.lib, y = C.WordArray, h = C.Hasher, E = c.x64, o = E.Word, s = c.algo, A = [], a = [], l = [];
        (function() {
          for (var d = 1, g = 0, n = 0; n < 24; n++) {
            A[d + 5 * g] = (n + 1) * (n + 2) / 2 % 64;
            var i = g % 5, f = (2 * d + 3 * g) % 5;
            d = i, g = f;
          }
          for (var d = 0; d < 5; d++)
            for (var g = 0; g < 5; g++)
              a[d + 5 * g] = g + (2 * d + 3 * g) % 5 * 5;
          for (var p = 1, D = 0; D < 24; D++) {
            for (var F = 0, m = 0, P = 0; P < 7; P++) {
              if (p & 1) {
                var B = (1 << P) - 1;
                B < 32 ? m ^= 1 << B : F ^= 1 << B - 32;
              }
              p & 128 ? p = p << 1 ^ 113 : p <<= 1;
            }
            l[D] = o.create(F, m);
          }
        })();
        var u = [];
        (function() {
          for (var d = 0; d < 25; d++)
            u[d] = o.create();
        })();
        var v = s.SHA3 = h.extend({
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
            for (var d = this._state = [], g = 0; g < 25; g++)
              d[g] = new o.init();
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(d, g) {
            for (var n = this._state, i = this.blockSize / 2, f = 0; f < i; f++) {
              var p = d[g + 2 * f], D = d[g + 2 * f + 1];
              p = (p << 8 | p >>> 24) & 16711935 | (p << 24 | p >>> 8) & 4278255360, D = (D << 8 | D >>> 24) & 16711935 | (D << 24 | D >>> 8) & 4278255360;
              var F = n[f];
              F.high ^= D, F.low ^= p;
            }
            for (var m = 0; m < 24; m++) {
              for (var P = 0; P < 5; P++) {
                for (var B = 0, b = 0, w = 0; w < 5; w++) {
                  var F = n[P + 5 * w];
                  B ^= F.high, b ^= F.low;
                }
                var _ = u[P];
                _.high = B, _.low = b;
              }
              for (var P = 0; P < 5; P++)
                for (var z = u[(P + 4) % 5], L = u[(P + 1) % 5], $ = L.high, M = L.low, B = z.high ^ ($ << 1 | M >>> 31), b = z.low ^ (M << 1 | $ >>> 31), w = 0; w < 5; w++) {
                  var F = n[P + 5 * w];
                  F.high ^= B, F.low ^= b;
                }
              for (var O = 1; O < 25; O++) {
                var B, b, F = n[O], N = F.high, T = F.low, S = A[O];
                S < 32 ? (B = N << S | T >>> 32 - S, b = T << S | N >>> 32 - S) : (B = T << S - 32 | N >>> 64 - S, b = N << S - 32 | T >>> 64 - S);
                var R = u[a[O]];
                R.high = B, R.low = b;
              }
              var H = u[0], k = n[0];
              H.high = k.high, H.low = k.low;
              for (var P = 0; P < 5; P++)
                for (var w = 0; w < 5; w++) {
                  var O = P + 5 * w, F = n[O], W = u[O], q = u[(P + 1) % 5 + 5 * w], G = u[(P + 2) % 5 + 5 * w];
                  F.high = W.high ^ ~q.high & G.high, F.low = W.low ^ ~q.low & G.low;
                }
              var F = n[0], U = l[m];
              F.high ^= U.high, F.low ^= U.low;
            }
          },
          _doFinalize: function() {
            var d = this._data, g = d.words;
            this._nDataBytes * 8;
            var n = d.sigBytes * 8, i = this.blockSize * 32;
            g[n >>> 5] |= 1 << 24 - n % 32, g[(r.ceil((n + 1) / i) * i >>> 5) - 1] |= 128, d.sigBytes = g.length * 4, this._process();
            for (var f = this._state, p = this.cfg.outputLength / 8, D = p / 8, F = [], m = 0; m < D; m++) {
              var P = f[m], B = P.high, b = P.low;
              B = (B << 8 | B >>> 24) & 16711935 | (B << 24 | B >>> 8) & 4278255360, b = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360, F.push(b), F.push(B);
            }
            return new y.init(F, p);
          },
          clone: function() {
            for (var d = h.clone.call(this), g = d._state = this._state.slice(0), n = 0; n < 25; n++)
              g[n] = g[n].clone();
            return d;
          }
        });
        c.SHA3 = h._createHelper(v), c.HmacSHA3 = h._createHmacHelper(v);
      })(Math), t.SHA3;
    });
  })(T0)), T0.exports;
}
var L0 = { exports: {} }, _t = L0.exports, Ke;
function St() {
  return Ke || (Ke = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(_t, function(t) {
      /** @preserve
      			(c) 2012 by Cédric Mesnil. All rights reserved.
      
      			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
      
      			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
      
      			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      			*/
      return (function(r) {
        var c = t, C = c.lib, y = C.WordArray, h = C.Hasher, E = c.algo, o = y.create([
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
        ]), s = y.create([
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
        ]), A = y.create([
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
        ]), l = y.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), u = y.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), v = E.RIPEMD160 = h.extend({
          _doReset: function() {
            this._hash = y.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(D, F) {
            for (var m = 0; m < 16; m++) {
              var P = F + m, B = D[P];
              D[P] = (B << 8 | B >>> 24) & 16711935 | (B << 24 | B >>> 8) & 4278255360;
            }
            var b = this._hash.words, w = l.words, _ = u.words, z = o.words, L = s.words, $ = A.words, M = a.words, O, N, T, S, R, H, k, W, q, G;
            H = O = b[0], k = N = b[1], W = T = b[2], q = S = b[3], G = R = b[4];
            for (var U, m = 0; m < 80; m += 1)
              U = O + D[F + z[m]] | 0, m < 16 ? U += d(N, T, S) + w[0] : m < 32 ? U += g(N, T, S) + w[1] : m < 48 ? U += n(N, T, S) + w[2] : m < 64 ? U += i(N, T, S) + w[3] : U += f(N, T, S) + w[4], U = U | 0, U = p(U, $[m]), U = U + R | 0, O = R, R = S, S = p(T, 10), T = N, N = U, U = H + D[F + L[m]] | 0, m < 16 ? U += f(k, W, q) + _[0] : m < 32 ? U += i(k, W, q) + _[1] : m < 48 ? U += n(k, W, q) + _[2] : m < 64 ? U += g(k, W, q) + _[3] : U += d(k, W, q) + _[4], U = U | 0, U = p(U, M[m]), U = U + G | 0, H = G, G = q, q = p(W, 10), W = k, k = U;
            U = b[1] + T + q | 0, b[1] = b[2] + S + G | 0, b[2] = b[3] + R + H | 0, b[3] = b[4] + O + k | 0, b[4] = b[0] + N + W | 0, b[0] = U;
          },
          _doFinalize: function() {
            var D = this._data, F = D.words, m = this._nDataBytes * 8, P = D.sigBytes * 8;
            F[P >>> 5] |= 128 << 24 - P % 32, F[(P + 64 >>> 9 << 4) + 14] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360, D.sigBytes = (F.length + 1) * 4, this._process();
            for (var B = this._hash, b = B.words, w = 0; w < 5; w++) {
              var _ = b[w];
              b[w] = (_ << 8 | _ >>> 24) & 16711935 | (_ << 24 | _ >>> 8) & 4278255360;
            }
            return B;
          },
          clone: function() {
            var D = h.clone.call(this);
            return D._hash = this._hash.clone(), D;
          }
        });
        function d(D, F, m) {
          return D ^ F ^ m;
        }
        function g(D, F, m) {
          return D & F | ~D & m;
        }
        function n(D, F, m) {
          return (D | ~F) ^ m;
        }
        function i(D, F, m) {
          return D & m | F & ~m;
        }
        function f(D, F, m) {
          return D ^ (F | ~m);
        }
        function p(D, F) {
          return D << F | D >>> 32 - F;
        }
        c.RIPEMD160 = h._createHelper(v), c.HmacRIPEMD160 = h._createHmacHelper(v);
      })(), t.RIPEMD160;
    });
  })(L0)), L0.exports;
}
var $0 = { exports: {} }, wt = $0.exports, je;
function ve() {
  return je || (je = 1, (function(e, x) {
    (function(t, r) {
      e.exports = r(I());
    })(wt, function(t) {
      (function() {
        var r = t, c = r.lib, C = c.Base, y = r.enc, h = y.Utf8, E = r.algo;
        E.HMAC = C.extend({
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
          init: function(o, s) {
            o = this._hasher = new o.init(), typeof s == "string" && (s = h.parse(s));
            var A = o.blockSize, a = A * 4;
            s.sigBytes > a && (s = o.finalize(s)), s.clamp();
            for (var l = this._oKey = s.clone(), u = this._iKey = s.clone(), v = l.words, d = u.words, g = 0; g < A; g++)
              v[g] ^= 1549556828, d[g] ^= 909522486;
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
            var o = this._hasher;
            o.reset(), o.update(this._iKey);
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
          update: function(o) {
            return this._hasher.update(o), this;
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
          finalize: function(o) {
            var s = this._hasher, A = s.finalize(o);
            s.reset();
            var a = s.finalize(this._oKey.clone().concat(A));
            return a;
          }
        });
      })();
    });
  })($0)), $0.exports;
}
var U0 = { exports: {} }, kt = U0.exports, Ge;
function Rt() {
  return Ge || (Ge = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), he(), ve());
    })(kt, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.Base, y = c.WordArray, h = r.algo, E = h.SHA256, o = h.HMAC, s = h.PBKDF2 = C.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: C.extend({
            keySize: 128 / 32,
            hasher: E,
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
          init: function(A) {
            this.cfg = this.cfg.extend(A);
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
          compute: function(A, a) {
            for (var l = this.cfg, u = o.create(l.hasher, A), v = y.create(), d = y.create([1]), g = v.words, n = d.words, i = l.keySize, f = l.iterations; g.length < i; ) {
              var p = u.update(a).finalize(d);
              u.reset();
              for (var D = p.words, F = D.length, m = p, P = 1; P < f; P++) {
                m = u.finalize(m), u.reset();
                for (var B = m.words, b = 0; b < F; b++)
                  D[b] ^= B[b];
              }
              v.concat(p), n[0]++;
            }
            return v.sigBytes = i * 4, v;
          }
        });
        r.PBKDF2 = function(A, a, l) {
          return s.create(l).compute(A, a);
        };
      })(), t.PBKDF2;
    });
  })(U0)), U0.exports;
}
var I0 = { exports: {} }, Ht = I0.exports, Xe;
function n0() {
  return Xe || (Xe = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), yr(), ve());
    })(Ht, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.Base, y = c.WordArray, h = r.algo, E = h.MD5, o = h.EvpKDF = C.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: C.extend({
            keySize: 128 / 32,
            hasher: E,
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
          init: function(s) {
            this.cfg = this.cfg.extend(s);
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
          compute: function(s, A) {
            for (var a, l = this.cfg, u = l.hasher.create(), v = y.create(), d = v.words, g = l.keySize, n = l.iterations; d.length < g; ) {
              a && u.update(a), a = u.update(s).finalize(A), u.reset();
              for (var i = 1; i < n; i++)
                a = u.finalize(a), u.reset();
              v.concat(a);
            }
            return v.sigBytes = g * 4, v;
          }
        });
        r.EvpKDF = function(s, A, a) {
          return o.create(a).compute(s, A);
        };
      })(), t.EvpKDF;
    });
  })(I0)), I0.exports;
}
var O0 = { exports: {} }, Pt = O0.exports, Ye;
function K() {
  return Ye || (Ye = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), n0());
    })(Pt, function(t) {
      t.lib.Cipher || (function(r) {
        var c = t, C = c.lib, y = C.Base, h = C.WordArray, E = C.BufferedBlockAlgorithm, o = c.enc;
        o.Utf8;
        var s = o.Base64, A = c.algo, a = A.EvpKDF, l = C.Cipher = E.extend({
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
          createEncryptor: function(B, b) {
            return this.create(this._ENC_XFORM_MODE, B, b);
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
          createDecryptor: function(B, b) {
            return this.create(this._DEC_XFORM_MODE, B, b);
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
          init: function(B, b, w) {
            this.cfg = this.cfg.extend(w), this._xformMode = B, this._key = b, this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            E.reset.call(this), this._doReset();
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
          process: function(B) {
            return this._append(B), this._process();
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
          finalize: function(B) {
            B && this._append(B);
            var b = this._doFinalize();
            return b;
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
            function B(b) {
              return typeof b == "string" ? P : D;
            }
            return function(b) {
              return {
                encrypt: function(w, _, z) {
                  return B(_).encrypt(b, w, _, z);
                },
                decrypt: function(w, _, z) {
                  return B(_).decrypt(b, w, _, z);
                }
              };
            };
          })()
        });
        C.StreamCipher = l.extend({
          _doFinalize: function() {
            var B = this._process(!0);
            return B;
          },
          blockSize: 1
        });
        var u = c.mode = {}, v = C.BlockCipherMode = y.extend({
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
          createEncryptor: function(B, b) {
            return this.Encryptor.create(B, b);
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
          createDecryptor: function(B, b) {
            return this.Decryptor.create(B, b);
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
          init: function(B, b) {
            this._cipher = B, this._iv = b;
          }
        }), d = u.CBC = (function() {
          var B = v.extend();
          B.Encryptor = B.extend({
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
            processBlock: function(w, _) {
              var z = this._cipher, L = z.blockSize;
              b.call(this, w, _, L), z.encryptBlock(w, _), this._prevBlock = w.slice(_, _ + L);
            }
          }), B.Decryptor = B.extend({
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
            processBlock: function(w, _) {
              var z = this._cipher, L = z.blockSize, $ = w.slice(_, _ + L);
              z.decryptBlock(w, _), b.call(this, w, _, L), this._prevBlock = $;
            }
          });
          function b(w, _, z) {
            var L, $ = this._iv;
            $ ? (L = $, this._iv = r) : L = this._prevBlock;
            for (var M = 0; M < z; M++)
              w[_ + M] ^= L[M];
          }
          return B;
        })(), g = c.pad = {}, n = g.Pkcs7 = {
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
          pad: function(B, b) {
            for (var w = b * 4, _ = w - B.sigBytes % w, z = _ << 24 | _ << 16 | _ << 8 | _, L = [], $ = 0; $ < _; $ += 4)
              L.push(z);
            var M = h.create(L, _);
            B.concat(M);
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
          unpad: function(B) {
            var b = B.words[B.sigBytes - 1 >>> 2] & 255;
            B.sigBytes -= b;
          }
        };
        C.BlockCipher = l.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: l.cfg.extend({
            mode: d,
            padding: n
          }),
          reset: function() {
            var B;
            l.reset.call(this);
            var b = this.cfg, w = b.iv, _ = b.mode;
            this._xformMode == this._ENC_XFORM_MODE ? B = _.createEncryptor : (B = _.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == B ? this._mode.init(this, w && w.words) : (this._mode = B.call(_, this, w && w.words), this._mode.__creator = B);
          },
          _doProcessBlock: function(B, b) {
            this._mode.processBlock(B, b);
          },
          _doFinalize: function() {
            var B, b = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (b.pad(this._data, this.blockSize), B = this._process(!0)) : (B = this._process(!0), b.unpad(B)), B;
          },
          blockSize: 128 / 32
        });
        var i = C.CipherParams = y.extend({
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
          init: function(B) {
            this.mixIn(B);
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
          toString: function(B) {
            return (B || this.formatter).stringify(this);
          }
        }), f = c.format = {}, p = f.OpenSSL = {
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
          stringify: function(B) {
            var b, w = B.ciphertext, _ = B.salt;
            return _ ? b = h.create([1398893684, 1701076831]).concat(_).concat(w) : b = w, b.toString(s);
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
          parse: function(B) {
            var b, w = s.parse(B), _ = w.words;
            return _[0] == 1398893684 && _[1] == 1701076831 && (b = h.create(_.slice(2, 4)), _.splice(0, 4), w.sigBytes -= 16), i.create({ ciphertext: w, salt: b });
          }
        }, D = C.SerializableCipher = y.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: y.extend({
            format: p
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
          encrypt: function(B, b, w, _) {
            _ = this.cfg.extend(_);
            var z = B.createEncryptor(w, _), L = z.finalize(b), $ = z.cfg;
            return i.create({
              ciphertext: L,
              key: w,
              iv: $.iv,
              algorithm: B,
              mode: $.mode,
              padding: $.padding,
              blockSize: B.blockSize,
              formatter: _.format
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
          decrypt: function(B, b, w, _) {
            _ = this.cfg.extend(_), b = this._parse(b, _.format);
            var z = B.createDecryptor(w, _).finalize(b.ciphertext);
            return z;
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
          _parse: function(B, b) {
            return typeof B == "string" ? b.parse(B, this) : B;
          }
        }), F = c.kdf = {}, m = F.OpenSSL = {
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
          execute: function(B, b, w, _, z) {
            if (_ || (_ = h.random(64 / 8)), z)
              var L = a.create({ keySize: b + w, hasher: z }).compute(B, _);
            else
              var L = a.create({ keySize: b + w }).compute(B, _);
            var $ = h.create(L.words.slice(b), w * 4);
            return L.sigBytes = b * 4, i.create({ key: L, iv: $, salt: _ });
          }
        }, P = C.PasswordBasedCipher = D.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: D.cfg.extend({
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
          encrypt: function(B, b, w, _) {
            _ = this.cfg.extend(_);
            var z = _.kdf.execute(w, B.keySize, B.ivSize, _.salt, _.hasher);
            _.iv = z.iv;
            var L = D.encrypt.call(this, B, b, z.key, _);
            return L.mixIn(z), L;
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
          decrypt: function(B, b, w, _) {
            _ = this.cfg.extend(_), b = this._parse(b, _.format);
            var z = _.kdf.execute(w, B.keySize, B.ivSize, b.salt, _.hasher);
            _.iv = z.iv;
            var L = D.decrypt.call(this, B, b, z.key, _);
            return L;
          }
        });
      })();
    });
  })(O0)), O0.exports;
}
var N0 = { exports: {} }, zt = N0.exports, Ze;
function Tt() {
  return Ze || (Ze = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(zt, function(t) {
      return t.mode.CFB = (function() {
        var r = t.lib.BlockCipherMode.extend();
        r.Encryptor = r.extend({
          processBlock: function(C, y) {
            var h = this._cipher, E = h.blockSize;
            c.call(this, C, y, E, h), this._prevBlock = C.slice(y, y + E);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(C, y) {
            var h = this._cipher, E = h.blockSize, o = C.slice(y, y + E);
            c.call(this, C, y, E, h), this._prevBlock = o;
          }
        });
        function c(C, y, h, E) {
          var o, s = this._iv;
          s ? (o = s.slice(0), this._iv = void 0) : o = this._prevBlock, E.encryptBlock(o, 0);
          for (var A = 0; A < h; A++)
            C[y + A] ^= o[A];
        }
        return r;
      })(), t.mode.CFB;
    });
  })(N0)), N0.exports;
}
var M0 = { exports: {} }, Lt = M0.exports, Ve;
function $t() {
  return Ve || (Ve = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Lt, function(t) {
      return t.mode.CTR = (function() {
        var r = t.lib.BlockCipherMode.extend(), c = r.Encryptor = r.extend({
          processBlock: function(C, y) {
            var h = this._cipher, E = h.blockSize, o = this._iv, s = this._counter;
            o && (s = this._counter = o.slice(0), this._iv = void 0);
            var A = s.slice(0);
            h.encryptBlock(A, 0), s[E - 1] = s[E - 1] + 1 | 0;
            for (var a = 0; a < E; a++)
              C[y + a] ^= A[a];
          }
        });
        return r.Decryptor = c, r;
      })(), t.mode.CTR;
    });
  })(M0)), M0.exports;
}
var q0 = { exports: {} }, Ut = q0.exports, Qe;
function It() {
  return Qe || (Qe = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Ut, function(t) {
      /** @preserve
       * Counter block mode compatible with  Dr Brian Gladman fileenc.c
       * derived from CryptoJS.mode.CTR
       * Jan Hruby jhruby.web@gmail.com
       */
      return t.mode.CTRGladman = (function() {
        var r = t.lib.BlockCipherMode.extend();
        function c(h) {
          if ((h >> 24 & 255) === 255) {
            var E = h >> 16 & 255, o = h >> 8 & 255, s = h & 255;
            E === 255 ? (E = 0, o === 255 ? (o = 0, s === 255 ? s = 0 : ++s) : ++o) : ++E, h = 0, h += E << 16, h += o << 8, h += s;
          } else
            h += 1 << 24;
          return h;
        }
        function C(h) {
          return (h[0] = c(h[0])) === 0 && (h[1] = c(h[1])), h;
        }
        var y = r.Encryptor = r.extend({
          processBlock: function(h, E) {
            var o = this._cipher, s = o.blockSize, A = this._iv, a = this._counter;
            A && (a = this._counter = A.slice(0), this._iv = void 0), C(a);
            var l = a.slice(0);
            o.encryptBlock(l, 0);
            for (var u = 0; u < s; u++)
              h[E + u] ^= l[u];
          }
        });
        return r.Decryptor = y, r;
      })(), t.mode.CTRGladman;
    });
  })(q0)), q0.exports;
}
var W0 = { exports: {} }, Ot = W0.exports, Je;
function Nt() {
  return Je || (Je = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Ot, function(t) {
      return t.mode.OFB = (function() {
        var r = t.lib.BlockCipherMode.extend(), c = r.Encryptor = r.extend({
          processBlock: function(C, y) {
            var h = this._cipher, E = h.blockSize, o = this._iv, s = this._keystream;
            o && (s = this._keystream = o.slice(0), this._iv = void 0), h.encryptBlock(s, 0);
            for (var A = 0; A < E; A++)
              C[y + A] ^= s[A];
          }
        });
        return r.Decryptor = c, r;
      })(), t.mode.OFB;
    });
  })(W0)), W0.exports;
}
var K0 = { exports: {} }, Mt = K0.exports, er;
function qt() {
  return er || (er = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Mt, function(t) {
      return t.mode.ECB = (function() {
        var r = t.lib.BlockCipherMode.extend();
        return r.Encryptor = r.extend({
          processBlock: function(c, C) {
            this._cipher.encryptBlock(c, C);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(c, C) {
            this._cipher.decryptBlock(c, C);
          }
        }), r;
      })(), t.mode.ECB;
    });
  })(K0)), K0.exports;
}
var j0 = { exports: {} }, Wt = j0.exports, rr;
function Kt() {
  return rr || (rr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Wt, function(t) {
      return t.pad.AnsiX923 = {
        pad: function(r, c) {
          var C = r.sigBytes, y = c * 4, h = y - C % y, E = C + h - 1;
          r.clamp(), r.words[E >>> 2] |= h << 24 - E % 4 * 8, r.sigBytes += h;
        },
        unpad: function(r) {
          var c = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= c;
        }
      }, t.pad.Ansix923;
    });
  })(j0)), j0.exports;
}
var G0 = { exports: {} }, jt = G0.exports, tr;
function Gt() {
  return tr || (tr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(jt, function(t) {
      return t.pad.Iso10126 = {
        pad: function(r, c) {
          var C = c * 4, y = C - r.sigBytes % C;
          r.concat(t.lib.WordArray.random(y - 1)).concat(t.lib.WordArray.create([y << 24], 1));
        },
        unpad: function(r) {
          var c = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= c;
        }
      }, t.pad.Iso10126;
    });
  })(G0)), G0.exports;
}
var X0 = { exports: {} }, Xt = X0.exports, nr;
function Yt() {
  return nr || (nr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Xt, function(t) {
      return t.pad.Iso97971 = {
        pad: function(r, c) {
          r.concat(t.lib.WordArray.create([2147483648], 1)), t.pad.ZeroPadding.pad(r, c);
        },
        unpad: function(r) {
          t.pad.ZeroPadding.unpad(r), r.sigBytes--;
        }
      }, t.pad.Iso97971;
    });
  })(X0)), X0.exports;
}
var Y0 = { exports: {} }, Zt = Y0.exports, xr;
function Vt() {
  return xr || (xr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Zt, function(t) {
      return t.pad.ZeroPadding = {
        pad: function(r, c) {
          var C = c * 4;
          r.clamp(), r.sigBytes += C - (r.sigBytes % C || C);
        },
        unpad: function(r) {
          for (var c = r.words, C = r.sigBytes - 1, C = r.sigBytes - 1; C >= 0; C--)
            if (c[C >>> 2] >>> 24 - C % 4 * 8 & 255) {
              r.sigBytes = C + 1;
              break;
            }
        }
      }, t.pad.ZeroPadding;
    });
  })(Y0)), Y0.exports;
}
var Z0 = { exports: {} }, Qt = Z0.exports, or;
function Jt() {
  return or || (or = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(Qt, function(t) {
      return t.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      }, t.pad.NoPadding;
    });
  })(Z0)), Z0.exports;
}
var V0 = { exports: {} }, en = V0.exports, ir;
function rn() {
  return ir || (ir = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), K());
    })(en, function(t) {
      return (function(r) {
        var c = t, C = c.lib, y = C.CipherParams, h = c.enc, E = h.Hex, o = c.format;
        o.Hex = {
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
          stringify: function(s) {
            return s.ciphertext.toString(E);
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
          parse: function(s) {
            var A = E.parse(s);
            return y.create({ ciphertext: A });
          }
        };
      })(), t.format.Hex;
    });
  })(V0)), V0.exports;
}
var Q0 = { exports: {} }, tn = Q0.exports, ar;
function nn() {
  return ar || (ar = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(tn, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.BlockCipher, y = r.algo, h = [], E = [], o = [], s = [], A = [], a = [], l = [], u = [], v = [], d = [];
        (function() {
          for (var i = [], f = 0; f < 256; f++)
            f < 128 ? i[f] = f << 1 : i[f] = f << 1 ^ 283;
          for (var p = 0, D = 0, f = 0; f < 256; f++) {
            var F = D ^ D << 1 ^ D << 2 ^ D << 3 ^ D << 4;
            F = F >>> 8 ^ F & 255 ^ 99, h[p] = F, E[F] = p;
            var m = i[p], P = i[m], B = i[P], b = i[F] * 257 ^ F * 16843008;
            o[p] = b << 24 | b >>> 8, s[p] = b << 16 | b >>> 16, A[p] = b << 8 | b >>> 24, a[p] = b;
            var b = B * 16843009 ^ P * 65537 ^ m * 257 ^ p * 16843008;
            l[F] = b << 24 | b >>> 8, u[F] = b << 16 | b >>> 16, v[F] = b << 8 | b >>> 24, d[F] = b, p ? (p = m ^ i[i[i[B ^ m]]], D ^= i[i[D]]) : p = D = 1;
          }
        })();
        var g = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], n = y.AES = C.extend({
          _doReset: function() {
            var i;
            if (!(this._nRounds && this._keyPriorReset === this._key)) {
              for (var f = this._keyPriorReset = this._key, p = f.words, D = f.sigBytes / 4, F = this._nRounds = D + 6, m = (F + 1) * 4, P = this._keySchedule = [], B = 0; B < m; B++)
                B < D ? P[B] = p[B] : (i = P[B - 1], B % D ? D > 6 && B % D == 4 && (i = h[i >>> 24] << 24 | h[i >>> 16 & 255] << 16 | h[i >>> 8 & 255] << 8 | h[i & 255]) : (i = i << 8 | i >>> 24, i = h[i >>> 24] << 24 | h[i >>> 16 & 255] << 16 | h[i >>> 8 & 255] << 8 | h[i & 255], i ^= g[B / D | 0] << 24), P[B] = P[B - D] ^ i);
              for (var b = this._invKeySchedule = [], w = 0; w < m; w++) {
                var B = m - w;
                if (w % 4)
                  var i = P[B];
                else
                  var i = P[B - 4];
                w < 4 || B <= 4 ? b[w] = i : b[w] = l[h[i >>> 24]] ^ u[h[i >>> 16 & 255]] ^ v[h[i >>> 8 & 255]] ^ d[h[i & 255]];
              }
            }
          },
          encryptBlock: function(i, f) {
            this._doCryptBlock(i, f, this._keySchedule, o, s, A, a, h);
          },
          decryptBlock: function(i, f) {
            var p = i[f + 1];
            i[f + 1] = i[f + 3], i[f + 3] = p, this._doCryptBlock(i, f, this._invKeySchedule, l, u, v, d, E);
            var p = i[f + 1];
            i[f + 1] = i[f + 3], i[f + 3] = p;
          },
          _doCryptBlock: function(i, f, p, D, F, m, P, B) {
            for (var b = this._nRounds, w = i[f] ^ p[0], _ = i[f + 1] ^ p[1], z = i[f + 2] ^ p[2], L = i[f + 3] ^ p[3], $ = 4, M = 1; M < b; M++) {
              var O = D[w >>> 24] ^ F[_ >>> 16 & 255] ^ m[z >>> 8 & 255] ^ P[L & 255] ^ p[$++], N = D[_ >>> 24] ^ F[z >>> 16 & 255] ^ m[L >>> 8 & 255] ^ P[w & 255] ^ p[$++], T = D[z >>> 24] ^ F[L >>> 16 & 255] ^ m[w >>> 8 & 255] ^ P[_ & 255] ^ p[$++], S = D[L >>> 24] ^ F[w >>> 16 & 255] ^ m[_ >>> 8 & 255] ^ P[z & 255] ^ p[$++];
              w = O, _ = N, z = T, L = S;
            }
            var O = (B[w >>> 24] << 24 | B[_ >>> 16 & 255] << 16 | B[z >>> 8 & 255] << 8 | B[L & 255]) ^ p[$++], N = (B[_ >>> 24] << 24 | B[z >>> 16 & 255] << 16 | B[L >>> 8 & 255] << 8 | B[w & 255]) ^ p[$++], T = (B[z >>> 24] << 24 | B[L >>> 16 & 255] << 16 | B[w >>> 8 & 255] << 8 | B[_ & 255]) ^ p[$++], S = (B[L >>> 24] << 24 | B[w >>> 16 & 255] << 16 | B[_ >>> 8 & 255] << 8 | B[z & 255]) ^ p[$++];
            i[f] = O, i[f + 1] = N, i[f + 2] = T, i[f + 3] = S;
          },
          keySize: 256 / 32
        });
        r.AES = C._createHelper(n);
      })(), t.AES;
    });
  })(Q0)), Q0.exports;
}
var J0 = { exports: {} }, xn = J0.exports, sr;
function on() {
  return sr || (sr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(xn, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.WordArray, y = c.BlockCipher, h = r.algo, E = [
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
        ], o = [
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
        ], s = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], A = [
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
            for (var g = this._key, n = g.words, i = [], f = 0; f < 56; f++) {
              var p = E[f] - 1;
              i[f] = n[p >>> 5] >>> 31 - p % 32 & 1;
            }
            for (var D = this._subKeys = [], F = 0; F < 16; F++) {
              for (var m = D[F] = [], P = s[F], f = 0; f < 24; f++)
                m[f / 6 | 0] |= i[(o[f] - 1 + P) % 28] << 31 - f % 6, m[4 + (f / 6 | 0)] |= i[28 + (o[f + 24] - 1 + P) % 28] << 31 - f % 6;
              m[0] = m[0] << 1 | m[0] >>> 31;
              for (var f = 1; f < 7; f++)
                m[f] = m[f] >>> (f - 1) * 4 + 3;
              m[7] = m[7] << 5 | m[7] >>> 27;
            }
            for (var B = this._invSubKeys = [], f = 0; f < 16; f++)
              B[f] = D[15 - f];
          },
          encryptBlock: function(g, n) {
            this._doCryptBlock(g, n, this._subKeys);
          },
          decryptBlock: function(g, n) {
            this._doCryptBlock(g, n, this._invSubKeys);
          },
          _doCryptBlock: function(g, n, i) {
            this._lBlock = g[n], this._rBlock = g[n + 1], u.call(this, 4, 252645135), u.call(this, 16, 65535), v.call(this, 2, 858993459), v.call(this, 8, 16711935), u.call(this, 1, 1431655765);
            for (var f = 0; f < 16; f++) {
              for (var p = i[f], D = this._lBlock, F = this._rBlock, m = 0, P = 0; P < 8; P++)
                m |= A[P][((F ^ p[P]) & a[P]) >>> 0];
              this._lBlock = F, this._rBlock = D ^ m;
            }
            var B = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = B, u.call(this, 1, 1431655765), v.call(this, 8, 16711935), v.call(this, 2, 858993459), u.call(this, 16, 65535), u.call(this, 4, 252645135), g[n] = this._lBlock, g[n + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function u(g, n) {
          var i = (this._lBlock >>> g ^ this._rBlock) & n;
          this._rBlock ^= i, this._lBlock ^= i << g;
        }
        function v(g, n) {
          var i = (this._rBlock >>> g ^ this._lBlock) & n;
          this._lBlock ^= i, this._rBlock ^= i << g;
        }
        r.DES = y._createHelper(l);
        var d = h.TripleDES = y.extend({
          _doReset: function() {
            var g = this._key, n = g.words;
            if (n.length !== 2 && n.length !== 4 && n.length < 6)
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            var i = n.slice(0, 2), f = n.length < 4 ? n.slice(0, 2) : n.slice(2, 4), p = n.length < 6 ? n.slice(0, 2) : n.slice(4, 6);
            this._des1 = l.createEncryptor(C.create(i)), this._des2 = l.createEncryptor(C.create(f)), this._des3 = l.createEncryptor(C.create(p));
          },
          encryptBlock: function(g, n) {
            this._des1.encryptBlock(g, n), this._des2.decryptBlock(g, n), this._des3.encryptBlock(g, n);
          },
          decryptBlock: function(g, n) {
            this._des3.decryptBlock(g, n), this._des2.encryptBlock(g, n), this._des1.decryptBlock(g, n);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        r.TripleDES = y._createHelper(d);
      })(), t.TripleDES;
    });
  })(J0)), J0.exports;
}
var ee = { exports: {} }, an = ee.exports, cr;
function sn() {
  return cr || (cr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(an, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.StreamCipher, y = r.algo, h = y.RC4 = C.extend({
          _doReset: function() {
            for (var s = this._key, A = s.words, a = s.sigBytes, l = this._S = [], u = 0; u < 256; u++)
              l[u] = u;
            for (var u = 0, v = 0; u < 256; u++) {
              var d = u % a, g = A[d >>> 2] >>> 24 - d % 4 * 8 & 255;
              v = (v + l[u] + g) % 256;
              var n = l[u];
              l[u] = l[v], l[v] = n;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(s, A) {
            s[A] ^= E.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function E() {
          for (var s = this._S, A = this._i, a = this._j, l = 0, u = 0; u < 4; u++) {
            A = (A + 1) % 256, a = (a + s[A]) % 256;
            var v = s[A];
            s[A] = s[a], s[a] = v, l |= s[(s[A] + s[a]) % 256] << 24 - u * 8;
          }
          return this._i = A, this._j = a, l;
        }
        r.RC4 = C._createHelper(h);
        var o = y.RC4Drop = h.extend({
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
            for (var s = this.cfg.drop; s > 0; s--)
              E.call(this);
          }
        });
        r.RC4Drop = C._createHelper(o);
      })(), t.RC4;
    });
  })(ee)), ee.exports;
}
var re = { exports: {} }, cn = re.exports, fr;
function fn() {
  return fr || (fr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(cn, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.StreamCipher, y = r.algo, h = [], E = [], o = [], s = y.Rabbit = C.extend({
          _doReset: function() {
            for (var a = this._key.words, l = this.cfg.iv, u = 0; u < 4; u++)
              a[u] = (a[u] << 8 | a[u] >>> 24) & 16711935 | (a[u] << 24 | a[u] >>> 8) & 4278255360;
            var v = this._X = [
              a[0],
              a[3] << 16 | a[2] >>> 16,
              a[1],
              a[0] << 16 | a[3] >>> 16,
              a[2],
              a[1] << 16 | a[0] >>> 16,
              a[3],
              a[2] << 16 | a[1] >>> 16
            ], d = this._C = [
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
              A.call(this);
            for (var u = 0; u < 8; u++)
              d[u] ^= v[u + 4 & 7];
            if (l) {
              var g = l.words, n = g[0], i = g[1], f = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360, p = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, D = f >>> 16 | p & 4294901760, F = p << 16 | f & 65535;
              d[0] ^= f, d[1] ^= D, d[2] ^= p, d[3] ^= F, d[4] ^= f, d[5] ^= D, d[6] ^= p, d[7] ^= F;
              for (var u = 0; u < 4; u++)
                A.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            A.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var v = 0; v < 4; v++)
              h[v] = (h[v] << 8 | h[v] >>> 24) & 16711935 | (h[v] << 24 | h[v] >>> 8) & 4278255360, a[l + v] ^= h[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function A() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            E[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < E[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < E[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < E[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < E[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < E[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < E[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < E[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < E[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var v = a[u] + l[u], d = v & 65535, g = v >>> 16, n = ((d * d >>> 17) + d * g >>> 15) + g * g, i = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            o[u] = n ^ i;
          }
          a[0] = o[0] + (o[7] << 16 | o[7] >>> 16) + (o[6] << 16 | o[6] >>> 16) | 0, a[1] = o[1] + (o[0] << 8 | o[0] >>> 24) + o[7] | 0, a[2] = o[2] + (o[1] << 16 | o[1] >>> 16) + (o[0] << 16 | o[0] >>> 16) | 0, a[3] = o[3] + (o[2] << 8 | o[2] >>> 24) + o[1] | 0, a[4] = o[4] + (o[3] << 16 | o[3] >>> 16) + (o[2] << 16 | o[2] >>> 16) | 0, a[5] = o[5] + (o[4] << 8 | o[4] >>> 24) + o[3] | 0, a[6] = o[6] + (o[5] << 16 | o[5] >>> 16) + (o[4] << 16 | o[4] >>> 16) | 0, a[7] = o[7] + (o[6] << 8 | o[6] >>> 24) + o[5] | 0;
        }
        r.Rabbit = C._createHelper(s);
      })(), t.Rabbit;
    });
  })(re)), re.exports;
}
var te = { exports: {} }, un = te.exports, ur;
function dn() {
  return ur || (ur = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(un, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.StreamCipher, y = r.algo, h = [], E = [], o = [], s = y.RabbitLegacy = C.extend({
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
            ], v = this._C = [
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
            for (var d = 0; d < 4; d++)
              A.call(this);
            for (var d = 0; d < 8; d++)
              v[d] ^= u[d + 4 & 7];
            if (l) {
              var g = l.words, n = g[0], i = g[1], f = (n << 8 | n >>> 24) & 16711935 | (n << 24 | n >>> 8) & 4278255360, p = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, D = f >>> 16 | p & 4294901760, F = p << 16 | f & 65535;
              v[0] ^= f, v[1] ^= D, v[2] ^= p, v[3] ^= F, v[4] ^= f, v[5] ^= D, v[6] ^= p, v[7] ^= F;
              for (var d = 0; d < 4; d++)
                A.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            A.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var v = 0; v < 4; v++)
              h[v] = (h[v] << 8 | h[v] >>> 24) & 16711935 | (h[v] << 24 | h[v] >>> 8) & 4278255360, a[l + v] ^= h[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function A() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            E[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < E[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < E[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < E[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < E[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < E[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < E[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < E[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < E[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var v = a[u] + l[u], d = v & 65535, g = v >>> 16, n = ((d * d >>> 17) + d * g >>> 15) + g * g, i = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            o[u] = n ^ i;
          }
          a[0] = o[0] + (o[7] << 16 | o[7] >>> 16) + (o[6] << 16 | o[6] >>> 16) | 0, a[1] = o[1] + (o[0] << 8 | o[0] >>> 24) + o[7] | 0, a[2] = o[2] + (o[1] << 16 | o[1] >>> 16) + (o[0] << 16 | o[0] >>> 16) | 0, a[3] = o[3] + (o[2] << 8 | o[2] >>> 24) + o[1] | 0, a[4] = o[4] + (o[3] << 16 | o[3] >>> 16) + (o[2] << 16 | o[2] >>> 16) | 0, a[5] = o[5] + (o[4] << 8 | o[4] >>> 24) + o[3] | 0, a[6] = o[6] + (o[5] << 16 | o[5] >>> 16) + (o[4] << 16 | o[4] >>> 16) | 0, a[7] = o[7] + (o[6] << 8 | o[6] >>> 24) + o[5] | 0;
        }
        r.RabbitLegacy = C._createHelper(s);
      })(), t.RabbitLegacy;
    });
  })(te)), te.exports;
}
var ne = { exports: {} }, ln = ne.exports, dr;
function hn() {
  return dr || (dr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), x0(), o0(), n0(), K());
    })(ln, function(t) {
      return (function() {
        var r = t, c = r.lib, C = c.BlockCipher, y = r.algo;
        const h = 16, E = [
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
        ], o = [
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
        var s = {
          pbox: [],
          sbox: []
        };
        function A(d, g) {
          let n = g >> 24 & 255, i = g >> 16 & 255, f = g >> 8 & 255, p = g & 255, D = d.sbox[0][n] + d.sbox[1][i];
          return D = D ^ d.sbox[2][f], D = D + d.sbox[3][p], D;
        }
        function a(d, g, n) {
          let i = g, f = n, p;
          for (let D = 0; D < h; ++D)
            i = i ^ d.pbox[D], f = A(d, i) ^ f, p = i, i = f, f = p;
          return p = i, i = f, f = p, f = f ^ d.pbox[h], i = i ^ d.pbox[h + 1], { left: i, right: f };
        }
        function l(d, g, n) {
          let i = g, f = n, p;
          for (let D = h + 1; D > 1; --D)
            i = i ^ d.pbox[D], f = A(d, i) ^ f, p = i, i = f, f = p;
          return p = i, i = f, f = p, f = f ^ d.pbox[1], i = i ^ d.pbox[0], { left: i, right: f };
        }
        function u(d, g, n) {
          for (let F = 0; F < 4; F++) {
            d.sbox[F] = [];
            for (let m = 0; m < 256; m++)
              d.sbox[F][m] = o[F][m];
          }
          let i = 0;
          for (let F = 0; F < h + 2; F++)
            d.pbox[F] = E[F] ^ g[i], i++, i >= n && (i = 0);
          let f = 0, p = 0, D = 0;
          for (let F = 0; F < h + 2; F += 2)
            D = a(d, f, p), f = D.left, p = D.right, d.pbox[F] = f, d.pbox[F + 1] = p;
          for (let F = 0; F < 4; F++)
            for (let m = 0; m < 256; m += 2)
              D = a(d, f, p), f = D.left, p = D.right, d.sbox[F][m] = f, d.sbox[F][m + 1] = p;
          return !0;
        }
        var v = y.Blowfish = C.extend({
          _doReset: function() {
            if (this._keyPriorReset !== this._key) {
              var d = this._keyPriorReset = this._key, g = d.words, n = d.sigBytes / 4;
              u(s, g, n);
            }
          },
          encryptBlock: function(d, g) {
            var n = a(s, d[g], d[g + 1]);
            d[g] = n.left, d[g + 1] = n.right;
          },
          decryptBlock: function(d, g) {
            var n = l(s, d[g], d[g + 1]);
            d[g] = n.left, d[g + 1] = n.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        r.Blowfish = C._createHelper(v);
      })(), t.Blowfish;
    });
  })(ne)), ne.exports;
}
var vn = D0.exports, lr;
function An() {
  return lr || (lr = 1, (function(e, x) {
    (function(t, r, c) {
      e.exports = r(I(), oe(), ut(), lt(), x0(), At(), o0(), yr(), he(), Ft(), br(), yt(), mt(), St(), ve(), Rt(), n0(), K(), Tt(), $t(), It(), Nt(), qt(), Kt(), Gt(), Yt(), Vt(), Jt(), rn(), nn(), on(), sn(), fn(), dn(), hn());
    })(vn, function(t) {
      return t;
    });
  })(D0)), D0.exports;
}
var Cn = An();
const En = /* @__PURE__ */ tt(Cn);
function Bn() {
  typeof window > "u" || window.CryptoJS || (window.CryptoJS = En);
}
class mr extends Error {
  constructor(x, t) {
    super(x), this.methodName = t, this.name = "MobileAuthSdkUnavailableError";
  }
}
function pn() {
  const e = window.YDRZAuthSF;
  if (!e)
    throw new mr("Mobile auth SDK global unavailable: window.YDRZAuthSF");
  return e;
}
function E0(e) {
  const t = pn()[e];
  if (typeof t != "function")
    throw new mr(
      `Mobile auth SDK method unavailable: ${String(e)}`,
      e
    );
  return t;
}
function hr(e) {
  try {
    return JSON.stringify(
      e,
      (x, t) => typeof t == "function" ? "[Function]" : t,
      2
    );
  } catch (x) {
    return `[unserializable: ${x instanceof Error ? x.message : String(x)}]`;
  }
}
function Fn() {
  return {
    showAuthPage(e) {
      console.info("[MobileAuthSDK→showAuthPage] params:", hr(e)), E0("showAuthPage")(e);
    },
    initControl(e) {
      console.info("[MobileAuthSDK→initControl] params:", hr(e)), E0("initControl")(e);
    },
    clearControl(e) {
      E0("clearControl")(e);
    },
    getAuthResult(e) {
      E0("getAuthResult")(e);
    },
    updateSubmitBtnStatus(e) {
      E0("updateSubmitBtnStatus")(e);
    }
  };
}
const Dn = "0", gn = /* @__PURE__ */ new Set(["0", "1", "3", "4"]);
function yn(e) {
  const x = (e == null ? void 0 : e.trim()) ?? "";
  return gn.has(x) ? x : Dn;
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
function bn(e = {}) {
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
      return e.map(fe).filter((x) => x !== void 0);
    if (typeof e == "object") {
      const x = {};
      for (const [t, r] of Object.entries(e)) {
        const c = fe(r);
        c !== void 0 && (x[t] = c);
      }
      return x;
    }
    return e;
  }
}
function mn(e) {
  if (!(!e || typeof e != "object"))
    return fe(e);
}
const _n = "https://ginkgo.chinaums.com", Sn = "/sign-pay-pro/";
function wn(e) {
  const x = e == null ? void 0 : e.trim();
  if (!x || x === "/")
    return Sn;
  const t = /^https?:\/\//i.test(x) ? new URL(x).pathname : x;
  return `${(t.startsWith("/") ? t : `/${t}`).replace(/\/+$/, "")}/`;
}
function kn(e, x) {
  const t = e == null ? void 0 : e.trim();
  return t ? `${new URL(t).toString().replace(/\/+$/, "")}/` : new URL(x.replace(/^\/+/, ""), `${_n}/`).toString();
}
const Rn = "/sign-pay-pro/assist/0.2.3/".trim() || "", Hn = wn(Rn), _r = kn("https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.3/", Hn);
function Pn(e) {
  return new URL(e.replace(/^\/+/, ""), _r).toString();
}
const ce = 50, zn = ["headerTitle", "idTitle", "phoneTopNotice", "footerNote"], Tn = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, Ln = /^(?:[1-9]\d?(?:\.\d+)?px|(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)rem)$/;
function c0(e) {
  return typeof e == "object" && e !== null;
}
function j(e, x, t) {
  var r;
  (r = e == null ? void 0 : e.warn) == null || r.call(e, { path: x, reason: t });
}
function f0(e, x, t) {
  if (typeof e != "string") {
    j(t, x, "Expected a string.");
    return;
  }
  const r = e.trim();
  if (!r) {
    j(t, x, "Expected a non-empty string.");
    return;
  }
  return r;
}
function Sr(e, x, t) {
  const r = f0(e, x, t);
  if (r) {
    if (!Tn.test(r)) {
      j(t, x, "Expected #RGB or #RRGGBB.");
      return;
    }
    return r;
  }
}
function $n(e, x, t) {
  const r = f0(e, x, t);
  if (r) {
    if (!Ln.test(r)) {
      j(t, x, "Expected a px or rem font size.");
      return;
    }
    return r;
  }
}
function ue(e, x, t) {
  const r = f0(e, x, t);
  if (r)
    try {
      const c = new URL(r);
      if (c.protocol !== "http:" && c.protocol !== "https:") {
        j(t, x, "Expected an http or https URL.");
        return;
      }
      return c.toString();
    } catch {
      j(t, x, "Expected a valid URL.");
      return;
    }
}
function Un(e, x, t) {
  if (typeof e == "number" && Number.isFinite(e) && e > 0)
    return `${e}px`;
  if (typeof e == "string") {
    const r = e.trim(), c = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/.test(r) ? Number(r.slice(0, -2)) : Number.NaN;
    if (Number.isFinite(c) && c > 0)
      return r;
  }
  j(t, x, "Expected a positive px height.");
}
function In(e, x, t) {
  if (!c0(e)) {
    j(t, x, "Expected an object.");
    return;
  }
  const r = e.text === void 0 ? void 0 : f0(e.text, `${x}.text`, t), c = e.fontSize === void 0 ? void 0 : $n(e.fontSize, `${x}.fontSize`, t), C = e.color === void 0 ? void 0 : Sr(e.color, `${x}.color`, t);
  let y;
  e.bold !== void 0 && (typeof e.bold == "boolean" ? y = e.bold : j(t, `${x}.bold`, "Expected a boolean."));
  const E = Object.entries({ text: r, fontSize: c, color: C, bold: y }).filter(([, o]) => o !== void 0);
  return E.length ? Object.fromEntries(E) : void 0;
}
function vr(e, x, t) {
  if (typeof e == "string") {
    const h = ue(e, `${x}.url`, t);
    return h ? { url: h } : void 0;
  }
  if (!c0(e)) {
    j(t, x, "Expected a URL string or image object.");
    return;
  }
  const r = ue(e.url, `${x}.url`, t);
  if (!r)
    return;
  const c = e.alt === void 0 ? void 0 : f0(e.alt, `${x}.alt`, t), C = e.height === void 0 ? void 0 : Un(e.height, `${x}.height`, t), y = e.fit === "cover" || e.fit === "contain" ? e.fit : void 0;
  return e.fit !== void 0 && y === void 0 && j(t, `${x}.fit`, "Expected cover or contain."), {
    url: r,
    ...c ? { alt: c } : {},
    ...C ? { height: C } : {},
    ...y ? { fit: y } : {}
  };
}
function On(e, x, t) {
  const r = `agreements[${x}]`;
  if (!c0(e)) {
    j(t, r, "Expected an object.");
    return;
  }
  const c = f0(e.title, `${r}.title`, t), C = ue(e.url, `${r}.url`, t);
  return c && C ? { title: c, url: C } : void 0;
}
function wr(e, x = {}) {
  if (e == null)
    return {};
  if (!c0(e))
    return j(x, "ui", "Expected an object."), {};
  const t = e.themeColor === void 0 ? void 0 : Sr(e.themeColor, "themeColor", x), r = {};
  if (e.texts !== void 0)
    if (c0(e.texts)) {
      const y = e.texts;
      zn.forEach((h) => {
        if (h in y) {
          const E = In(y[h], `texts.${h}`, x);
          E && (r[h] = E);
        }
      });
    } else
      j(x, "texts", "Expected an object.");
  const c = {};
  if (e.images !== void 0)
    if (c0(e.images)) {
      const y = e.images.top === void 0 ? void 0 : vr(e.images.top, "images.top", x), h = e.images.bottom === void 0 ? void 0 : vr(e.images.bottom, "images.bottom", x);
      y && (c.top = y), h && (c.bottom = h);
    } else
      j(x, "images", "Expected an object.");
  let C;
  if (e.agreements !== void 0)
    if (Array.isArray(e.agreements)) {
      const y = e.agreements.map((h, E) => On(h, E, x)).filter((h) => h !== void 0);
      C = y.slice(0, ce), y.length > ce && j(x, "agreements", `Only the first ${ce} valid agreements are used.`);
    } else
      j(x, "agreements", "Expected an array.");
  return {
    ...t ? { themeColor: t } : {},
    ...Object.keys(r).length ? { texts: r } : {},
    ...Object.keys(c).length ? { images: c } : {},
    ...C && C.length ? { agreements: C } : {}
  };
}
function Nn(e) {
  return !!(e.themeColor || e.texts && Object.keys(e.texts).length > 0 || e.images && Object.keys(e.images).length > 0 || e.agreements && e.agreements.length > 0);
}
function Mn(e) {
  console.warn(`[AssistanceMobileAuth] Ignored invalid ui config at ${e.path}: ${e.reason}`);
}
const kr = "assistance-mobile-auth", Rr = "ASSISTANCE_AUTH_READY", Hr = "ASSISTANCE_AUTH_SUCCESS", Pr = "ASSISTANCE_AUTH_CANCEL", zr = "ASSISTANCE_AUTH_ERROR", Tr = "ASSISTANCE_AUTH_ERROR_NOTICE", Ae = "ASSISTANCE_AUTH_CONFIG", Lr = "ASSISTANCE_AUTH_PHONE_READY", $r = "ASSISTANCE_AUTH_RESIZE", Ce = "ASSISTANCE_AUTH_CLOSE", Ur = "ASSISTANCE_AUTH_PROBE_RESULT", Ee = "ASSISTANCE_AUTH_STATE_CHANGE", Ir = "ASSISTANCE_AUTH_STYLE", qn = {
  closable: !0,
  useCustomKeyboard: !0,
  heightMode: "auto"
};
function Wn(e, x = qn) {
  return X(e) ? {
    closable: typeof e.closable == "boolean" ? e.closable : x.closable,
    useCustomKeyboard: typeof e.useCustomKeyboard == "boolean" ? e.useCustomKeyboard : x.useCustomKeyboard,
    heightMode: e.heightMode === "auto" || e.heightMode === "fixed" ? e.heightMode : x.heightMode
  } : { ...x };
}
function X(e) {
  return typeof e == "object" && e !== null;
}
function Kn(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function jn(e) {
  return e === Rr || e === Hr || e === Pr || e === zr || e === Tr || e === Ae || e === Lr || e === $r || e === Ce || e === Ur || e === Ee || e === Ir;
}
function Ar() {
  return `assistance-auth-${typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
function Gn(e) {
  if (typeof e != "string" || !e.trim())
    return null;
  try {
    const x = new URL(e.trim());
    return x.protocol !== "http:" && x.protocol !== "https:" || x.username || x.password || x.pathname !== "/" || x.search || x.hash || x.origin === "null" ? null : x.origin;
  } catch {
    return null;
  }
}
function Xn(e) {
  if (!(typeof e != "string" || !e.trim()))
    try {
      const x = new URL(e.trim());
      return x.protocol !== "http:" && x.protocol !== "https:" ? void 0 : x.toString();
    } catch {
      return;
    }
}
function Cr(e) {
  if (!e || typeof e != "object")
    return null;
  const x = e, t = typeof x.src == "string" ? x.src.trim() : "";
  if (!t)
    return null;
  const r = { src: t };
  return typeof x.width == "string" && x.width.trim() && (r.width = x.width.trim()), typeof x.height == "string" && x.height.trim() && (r.height = x.height.trim()), r;
}
function Er({
  sessionId: e,
  request: x,
  verificationUrl: t,
  pageImages: r,
  mode: c,
  expectsUiConfig: C,
  appId: y,
  parentOrigin: h
}) {
  const E = t ?? Pn("verification"), o = new URL(E, typeof window < "u" ? window.location.href : "http://localhost");
  o.searchParams.set("assistanceAuthSessionId", e), y && o.searchParams.set("appId", y), C && o.searchParams.set("expectsUiConfig", "1"), c === "probe" && o.searchParams.set("mode", "probe");
  const s = Gn(h);
  c !== "probe" && s && o.searchParams.set("assistanceAuthParentOrigin", s), x != null && x.scene && o.searchParams.set("scene", x.scene), x != null && x.requestId && o.searchParams.set("requestId", x.requestId);
  const A = Cr(r == null ? void 0 : r.top);
  A && o.searchParams.set("topImage", JSON.stringify(A));
  const a = Cr(r == null ? void 0 : r.bottom);
  if (a && o.searchParams.set("bottomImage", JSON.stringify(a)), typeof window < "u") {
    const u = new URLSearchParams(window.location.search).get("flow");
    u && c !== "probe" && o.searchParams.set("flow", u);
  }
  return o.toString();
}
function de(e, x, t) {
  return {
    source: kr,
    type: e,
    sessionId: x,
    payload: t
  };
}
function Yn(e, x) {
  return X(e) && e.source === kr && jn(e.type) && typeof e.sessionId == "string" && (!x || e.sessionId === x);
}
function Or(e) {
  return X(e) && typeof e.message == "string" ? {
    code: typeof e.code == "string" ? e.code : void 0,
    message: e.message
  } : { message: "验证失败，请稍后重试。" };
}
function Zn(e) {
  const x = Or(e);
  return X(e) ? {
    ...x,
    phase: e.phase === "resourceLoad" || e.phase === "showAuthPage" || e.phase === "initControl" ? e.phase : void 0,
    carrier: typeof e.carrier == "string" ? e.carrier : void 0
  } : x;
}
function Vn(e) {
  return X(e) && X(e.ui) ? { ui: wr(e.ui) } : { ui: {} };
}
function Qn(e, x) {
  return de(Ae, e, { ui: x });
}
const Jn = /1\d{2}\*{4}\d{4}/, ex = /1\d{10}/;
function rx(e) {
  return e.replace(/\s+/g, " ").trim();
}
function tx(e) {
  var c;
  if (!X(e) || e.source !== "ydrzPhoneControl")
    return null;
  const t = (c = (typeof e.maskedMobile == "string" ? e.maskedMobile.trim() : "").match(Jn)) == null ? void 0 : c[0];
  if (!t)
    return null;
  let r = t;
  if (typeof e.rawText == "string") {
    const C = rx(e.rawText);
    if (!C.includes(t) || ex.test(C))
      return null;
    r = C;
  }
  return {
    maskedMobile: t,
    rawText: r,
    source: "ydrzPhoneControl"
  };
}
function nx(e) {
  return !X(e) || !Kn(e.height) ? null : {
    height: Math.ceil(e.height),
    ...typeof e.keyboardFocused == "boolean" ? { keyboardFocused: e.keyboardFocused } : {}
  };
}
function xx(e) {
  if (!X(e) || e.status !== "success")
    return null;
  const x = typeof e.token == "string" ? e.token : "", t = typeof e.idLast4 == "string" ? e.idLast4 : "", r = typeof e.keyA == "string" ? e.keyA : "";
  return !x.trim() || !t.trim() || !r.trim() ? null : {
    status: "success",
    token: x,
    idLast4: t,
    keyA: r,
    requestId: typeof e.requestId == "string" ? e.requestId : void 0,
    message: typeof e.message == "string" ? e.message : void 0,
    mock: typeof e.mock == "boolean" ? e.mock : void 0
  };
}
const ox = ["ok", "wifi", "non-mobile", "ambiguous", "unknown"];
function ix(e) {
  const x = {};
  for (const t of ["YD", "CT", "CU"])
    typeof e[t] == "string" && (x[t] = e[t]);
  return Object.keys(x).length > 0 ? x : void 0;
}
function ax(e) {
  if (!X(e))
    return { eligible: !1, reason: "unknown" };
  const x = ox.includes(e.reason) ? e.reason : "unknown";
  let t;
  if (X(e.raw)) {
    const r = X(e.raw.carriers) ? ix(e.raw.carriers) : void 0, c = e.raw.networkType, C = c === "wifi" || c === "cellular" || c === "unknown" ? c : void 0, y = {
      ...typeof e.raw.code == "string" ? { code: e.raw.code } : {},
      ...typeof e.raw.carrier == "string" ? { carrier: e.raw.carrier } : {},
      ...r ? { carriers: r } : {},
      ...C ? { networkType: C } : {}
    };
    Object.keys(y).length > 0 && (t = y);
  }
  return { eligible: x === "ok", reason: x, ...t ? { raw: t } : {} };
}
function sx(e) {
  return !X(e) || !X(e.event) ? null : e.event.type === "idLast4Complete" ? { type: "idLast4Complete" } : e.event.type === "idLast4Incomplete" ? { type: "idLast4Incomplete" } : null;
}
function Br(e, x, t, r, c) {
  const C = (y) => {
    var h, E, o, s, A, a, l, u, v, d, g, n;
    if (!(r && y.origin !== r) && Yn(y.data, x) && !(c && "expectedSource" in c && (!c.expectedSourceTypes || c.expectedSourceTypes.includes(y.data.type)) && y.source !== c.expectedSource))
      switch (y.data.type) {
        case Rr:
          (h = t.onReady) == null || h.call(t);
          break;
        case Hr:
          {
            const i = xx(y.data.payload);
            if (!i) {
              (E = t.onError) == null || E.call(t, {
                code: "INVALID_SUCCESS_PAYLOAD",
                message: "验证结果返回异常，请稍后重试。"
              });
              break;
            }
            (o = t.onSuccess) == null || o.call(t, i);
          }
          break;
        case Pr:
          (s = t.onCancel) == null || s.call(t, y.data.payload);
          break;
        case zr:
          (A = t.onError) == null || A.call(t, Or(y.data.payload));
          break;
        case Tr:
          (a = t.onErrorNotice) == null || a.call(t, Zn(y.data.payload));
          break;
        case Ae:
          (l = t.onConfig) == null || l.call(t, Vn(y.data.payload));
          break;
        case Lr:
          {
            const i = tx(y.data.payload);
            i && ((u = t.onPhoneReady) == null || u.call(t, i));
          }
          break;
        case $r:
          {
            const i = nx(y.data.payload);
            i && ((v = t.onResize) == null || v.call(t, i));
          }
          break;
        case Ce:
          (d = t.onClose) == null || d.call(t);
          break;
        case Ur:
          (g = t.onProbeResult) == null || g.call(t, ax(y.data.payload));
          break;
        case Ee:
          {
            const i = sx(y.data.payload);
            i && ((n = t.onStateChange) == null || n.call(t, i));
          }
          break;
      }
  };
  return e.addEventListener("message", C), () => e.removeEventListener("message", C);
}
const cx = 12, fx = 1, ux = 500;
function xe(e) {
  return Number.isFinite(e);
}
function dx(e) {
  return xe(e) && e >= 0;
}
function lx({
  targetWindow: e,
  frame: x,
  positioningLayer: t
}) {
  let r = "idle", c = 0, C = !1, y = 0, h, E, o = !1, s = !1, A;
  const a = () => {
    const F = e.visualViewport;
    return {
      top: (F == null ? void 0 : F.offsetTop) ?? 0,
      height: (F == null ? void 0 : F.height) ?? e.innerHeight
    };
  }, l = a().height, u = () => {
    h !== void 0 && (e.cancelAnimationFrame(h), h = void 0);
  }, v = () => {
    E !== void 0 && (e.clearTimeout(E), E = void 0);
  }, d = () => {
    y = 0, t.style.transform = "", delete x.dataset.assistanceAuthKeyboardConstrained, C && (x.style.height = `${c}px`);
  }, g = () => {
    const F = e.visualViewport ?? void 0;
    A !== F && (A == null || A.removeEventListener("resize", p), A == null || A.removeEventListener("scroll", p), A = F, o && (A == null || A.addEventListener("resize", p), A == null || A.addEventListener("scroll", p)));
  }, n = () => {
    o && (o = !1, e.removeEventListener("resize", p), A == null || A.removeEventListener("resize", p), A == null || A.removeEventListener("scroll", p), A = void 0);
  }, i = () => {
    r = "idle", u(), v(), n(), d();
  }, f = () => {
    if (h = void 0, s)
      return;
    if (g(), r === "idle") {
      d();
      return;
    }
    const F = a(), m = F.top + F.height, P = t.getBoundingClientRect();
    if (!xe(F.top) || !xe(F.height) || F.height <= 0 || !xe(P.bottom))
      return;
    const B = Math.max(
      1,
      Math.floor(F.height - cx)
    ), b = Math.min(c, B);
    x.style.height = `${b}px`, b < c ? x.dataset.assistanceAuthKeyboardConstrained = "true" : delete x.dataset.assistanceAuthKeyboardConstrained;
    const w = P.bottom + y;
    y = Math.max(0, Math.ceil(w - m)), t.style.transform = y > 0 ? `translate3d(0, -${y}px, 0)` : "", r === "closing" && F.height >= l - fx && i();
  };
  function p() {
    s || (g(), h === void 0 && (h = e.requestAnimationFrame(f)));
  }
  const D = () => {
    o || (o = !0, e.addEventListener("resize", p)), g();
  };
  return {
    update(F) {
      if (!s) {
        if (dx(F.height) && (c = Math.ceil(F.height), C = !0), F.keyboardFocused === !0) {
          r = "focused", v(), D(), p();
          return;
        }
        if (F.keyboardFocused === !1 && r !== "idle") {
          const m = r !== "closing";
          r = "closing", D(), p(), m && (v(), E = e.setTimeout(
            i,
            ux
          ));
          return;
        }
        r === "idle" ? d() : p();
      }
    },
    dispose() {
      s = !0, u(), v(), n(), d();
    }
  };
}
const Nr = {
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
function hx(e = Nr) {
  const x = [
    "version",
    "jsUrl",
    "cssUrl",
    "localCssPath",
    "cssSha256",
    "h5CssStrategy",
    "wrapperCssStrategy"
  ];
  for (const t of x)
    if (!e[t].trim())
      throw new Error(`Mobile official JSSDK metadata is missing ${t}`);
}
function vx(e = {}) {
  return Nr;
}
function Be() {
  return vx();
}
const Ax = "assistance-mobile-auth-official-css", Cx = "assistance-mobile-auth-frame-shell", Ex = "assistance-auth-frame-enter", Bx = 280, px = "verification", Fx = 12e3, Dx = "8a9481c79c05c8bd019f6f42956924a0";
function gx(e) {
  return e.trim() === Dx ? "ginkgo-v23-viewport-modal" : "bottom-sheet";
}
function pr(e, x, t) {
  if (e)
    try {
      const r = t ? e(t) : e();
      Promise.resolve(r).catch(() => {
        console.warn(`[AssistanceMobileAuth] ${x} failed; notification was ignored.`);
      });
    } catch {
      console.warn(`[AssistanceMobileAuth] ${x} failed; notification was ignored.`);
    }
}
function yx(e) {
  return Array.isArray(e) ? e.filter(
    (x) => !!x && typeof x.name == "string" && typeof x.link == "string"
  ) : [];
}
function bx(e) {
  if (typeof e != "string")
    return e;
  const x = document.querySelector(e);
  if (!x)
    throw new Error("AssistanceMobileAuth container not found");
  return x;
}
const Fr = "assistance-mobile-auth-official-jssdk";
function mx() {
  const e = Be();
  if (hx(e), !e.jsUrl.trim())
    throw new Error("Mobile official JSSDK remote jsUrl is missing");
}
function Dr() {
  if (typeof window > "u" || typeof document > "u")
    return Promise.reject(new Error("Mobile official JSSDK requires a browser window and document"));
  if (Bn(), window.YDRZAuthSF)
    return Promise.resolve();
  const e = Be().jsUrl, x = document.getElementById(Fr);
  return x instanceof HTMLScriptElement ? x.dataset.assistanceMobileAuthLoaded === "true" && window.YDRZAuthSF ? Promise.resolve() : new Promise((t, r) => {
    x.addEventListener(
      "load",
      () => {
        x.dataset.assistanceMobileAuthLoaded = "true", t();
      },
      { once: !0 }
    ), x.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    );
  }) : new Promise((t, r) => {
    const c = document.createElement("script");
    c.id = Fr, c.async = !0, c.src = e, c.addEventListener(
      "load",
      () => {
        if (c.dataset.assistanceMobileAuthLoaded = "true", !window.YDRZAuthSF) {
          r(new Error("Mobile official JSSDK loaded but did not initialize window.YDRZAuthSF"));
          return;
        }
        t();
      },
      { once: !0 }
    ), c.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    ), document.head.appendChild(c);
  });
}
function _x(e, x) {
  return `${e ? e.replace(/\/?$/, "/") : ""}vendor/${x}`;
}
function Sx(e) {
  const x = document.createElement("div");
  x.id = Cx, x.setAttribute("role", "dialog"), x.setAttribute("aria-modal", "true"), x.dataset.assistanceAuthOverlay = "true", x.style.position = "fixed", x.style.inset = "0", x.style.zIndex = "2147483647", x.style.background = "rgba(15,23,42,0)", x.style.display = "flex", x.style.alignItems = "flex-end", x.style.justifyContent = "center", x.style.opacity = "0", x.style.transition = "opacity 220ms ease, background-color 220ms ease", x.style.willChange = "opacity, background-color";
  const t = document.createElement("div");
  return t.dataset.assistanceAuthPositioningLayer = "true", t.style.display = "flex", t.style.width = "100%", t.style.justifyContent = "center", t.style.willChange = "transform", e === "ginkgo-v23-viewport-modal" && (t.dataset.assistanceAuthViewportModal = "true", t.style.position = "fixed", t.style.left = "0", t.style.top = "0", t.style.height = "100vh"), x.appendChild(t), { shell: x, positioningLayer: t };
}
function wx(e) {
  const x = e.visualViewport;
  return x && Number.isFinite(x.height) && x.height > 0 && Number.isFinite(x.offsetTop) && x.offsetTop >= 0 ? { height: `${x.height}px`, top: `${x.offsetTop}px` } : Number.isFinite(e.innerHeight) && e.innerHeight > 0 ? { height: `${e.innerHeight}px`, top: "0px" } : { height: typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? "100dvh" : "100vh", top: "0px" };
}
function kx({
  targetWindow: e,
  frame: x,
  positioningLayer: t
}) {
  let r = !1, c;
  const C = () => {
    if (r)
      return;
    const E = wx(e);
    t.style.top = E.top, t.style.height = E.height, x.style.height = "100%";
  }, y = () => {
    const E = e.visualViewport ?? void 0;
    c !== E && (c == null || c.removeEventListener("resize", C), c == null || c.removeEventListener("scroll", C), c = E, c == null || c.addEventListener("resize", C), c == null || c.addEventListener("scroll", C));
  }, h = () => {
    y(), C();
  };
  return e.addEventListener("resize", h), h(), () => {
    r || (r = !0, e.removeEventListener("resize", h), c == null || c.removeEventListener("resize", C), c == null || c.removeEventListener("scroll", C), c = void 0);
  };
}
function Rx(e) {
  return /iPad|iPhone|iPod/i.test(e.userAgent) || e.platform === "MacIntel" && e.maxTouchPoints > 1;
}
function Hx(e) {
  if (!Rx(window.navigator))
    return !1;
  const x = document.createElement("input");
  x.type = "text", x.inputMode = "text", x.autocomplete = "off", x.tabIndex = -1, x.dataset.assistanceAuthKeyboardActivator = "true", x.setAttribute("autocapitalize", "characters"), x.setAttribute("autocorrect", "off"), x.style.position = "fixed", x.style.left = "0", x.style.bottom = "0", x.style.width = "1px", x.style.height = "1px", x.style.border = "0", x.style.padding = "0", x.style.opacity = "0.01", x.style.pointerEvents = "none", x.style.fontSize = "16px", x.style.color = "transparent", x.style.background = "transparent", x.style.caretColor = "transparent", e.appendChild(x);
  try {
    x.focus({ preventScroll: !0 });
  } catch {
    x.focus();
  }
  return document.activeElement === x;
}
function Px(e) {
  return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? `${e}dvh` : `${e}vh`;
}
function le(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function zx(e) {
  var c;
  const x = e.getBoundingClientRect().height;
  if (le(x))
    return x;
  const t = (c = /^(\d+(?:\.\d+)?)px$/.exec(e.style.height.trim())) == null ? void 0 : c[1], r = t === void 0 ? Number.NaN : Number(t);
  return le(r) ? r : null;
}
function Tx(e, x) {
  return Mr(e) ?? x;
}
function Mr(e) {
  var C;
  if (le(e))
    return `${e}px`;
  if (typeof e != "string")
    return null;
  const x = e.trim();
  if (!x || /url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(x))
    return null;
  const t = "(?:px|vh|dvh|svh|lvh|%|rem)";
  if (new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d+)?${t}$`, "i").test(x))
    return x;
  const c = (C = x.match(/^calc\((.*)\)$/i)) == null ? void 0 : C[1];
  if (c && /^[\d\s.+\-*/()%a-z]+$/i.test(c)) {
    const y = new RegExp(`(?:0|[1-9]\\d*)(?:\\.\\d+)?${t}`, "gi"), h = c.replace(y, "");
    if (/^[\d\s.+\-*/()]*$/.test(h))
      return x;
  }
  return null;
}
const Lx = "820px", $x = "420px";
function Ux(e) {
  const x = Mr(e.authWindowHeight), t = x ? "fixed" : e.authWindowHeightMode === "auto" ? "auto" : "fixed";
  return {
    heightMode: t,
    height: x ?? (t === "auto" ? $x : Px(92)),
    maxHeight: Tx(e.authWindowMaxHeight, Lx)
  };
}
function Ix(e, x, t, r) {
  const c = document.createElement("iframe");
  return c.title = x, c.src = e, c.dataset.assistanceAuthFrame = "true", c.style.width = "100%", c.style.height = r === "ginkgo-v23-viewport-modal" ? "100%" : t.height, c.style.maxHeight = r === "ginkgo-v23-viewport-modal" ? "none" : t.maxHeight, c.style.border = "0", c.style.borderRadius = r === "ginkgo-v23-viewport-modal" ? "0" : "24px 24px 0 0", c.style.background = r === "ginkgo-v23-viewport-modal" ? "transparent" : "#fff", c.style.boxShadow = r === "ginkgo-v23-viewport-modal" ? "none" : "0 -16px 40px rgba(15,23,42,0.18)", r === "bottom-sheet" && (c.style.transform = "translateY(100%)", c.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)", c.style.willChange = "transform", c.className = Ex), c;
}
function Ox(e) {
  const x = document.createElement("iframe");
  return x.src = e, x.title = "", x.dataset.assistanceAuthProbe = "true", x.setAttribute("aria-hidden", "true"), x.tabIndex = -1, x.style.position = "fixed", x.style.left = "-99999px", x.style.top = "0", x.style.width = "1px", x.style.height = "1px", x.style.border = "0", x.style.opacity = "0", x.style.pointerEvents = "none", x;
}
function Nx() {
  return _r;
}
function gr() {
  const e = Nx();
  return {
    verificationUrl: new URL(px, e).toString(),
    allowedOrigin: new URL(e).origin
  };
}
function Mx(e, x, t) {
  let r = !1, c;
  e.getBoundingClientRect(), x.getBoundingClientRect();
  const C = () => {
    r || !e.isConnected || !x.isConnected || (e.style.background = "rgba(15,23,42,0.35)", e.style.opacity = "1", t === "bottom-sheet" && (x.style.transform = "translateY(0)"));
  }, y = requestAnimationFrame(() => {
    r || (c = requestAnimationFrame(C));
  });
  return () => {
    r = !0, cancelAnimationFrame(y), c !== void 0 && cancelAnimationFrame(c);
  };
}
function qx(e, x, t) {
  return new Promise((r) => {
    let c = !1;
    const C = () => {
      c || (c = !0, y.removeEventListener("transitionend", C), r());
    }, y = t === "bottom-sheet" ? x : e;
    y.addEventListener("transitionend", C), window.setTimeout(C, Bx + 80), requestAnimationFrame(() => {
      e.style.background = "rgba(15,23,42,0)", e.style.opacity = "0", t === "bottom-sheet" && (x.style.transform = "translateY(100%)");
    });
  });
}
function Wx(e) {
  const x = Be();
  return {
    href: _x(e, "new-control-style.css"),
    integrity: `sha256-${x.cssSha256}`,
    version: x.version
  };
}
function Kx(e = {}) {
  const x = e.document ?? document, t = e.id ?? Ax, r = x.getElementById(t);
  if (r instanceof x.defaultView.HTMLLinkElement)
    return r;
  const c = Wx(e.baseUrl), C = x.createElement("link");
  return C.id = t, C.rel = "stylesheet", C.href = c.href, C.integrity = c.integrity, C.dataset.assistanceMobileAuthOfficialCssVersion = c.version, x.head.appendChild(C), C;
}
function jx(e) {
  const x = typeof e.appId == "string" ? e.appId.trim() : "";
  if (!x)
    throw new Error("AssistanceMobileAuth: appId is required since 0.2.0");
  const t = wr(e.ui, { warn: Mn }), r = Nn(t), c = typeof e.onBeforeLogin == "function", C = typeof e.onStateChange == "function", y = Xn(e.formHeaderImg);
  let h;
  if (e.container || e.authParams) {
    if (!e.container || !e.authParams)
      throw new Error("AssistanceMobileAuth legacy authorize mode requires container and authParams");
    mx(), bx(e.container), h = Dr();
  }
  let E, o, s, A;
  function a() {
    return E ?? (E = Fn()), E;
  }
  function l(n = o) {
    var i, f, p, D;
    if (n) {
      if (o !== n) {
        n.shell.remove();
        return;
      }
      (i = n.keyboardAvoidance) == null || i.dispose(), n.keyboardAvoidance = void 0, (f = n.disposeViewportFrame) == null || f.call(n), n.disposeViewportFrame = void 0, (p = n.cancelPendingEnterAnimation) == null || p.call(n), n.cancelPendingEnterAnimation = void 0, (D = n.disposeMessageListener) == null || D.call(n), n.disposeMessageListener = void 0, n.shell.remove(), document.body.style.overflow = n.previousBodyOverflow, o = void 0;
    }
  }
  function u(n, i) {
    if (n.settled) {
      l(n);
      return;
    }
    const f = n.reject;
    n.settled = !0, l(n), f == null || f(i);
  }
  async function v(n) {
    var i, f;
    (i = n.cancelPendingEnterAnimation) == null || i.call(n), n.cancelPendingEnterAnimation = void 0, (f = n.disposeViewportFrame) == null || f.call(n), n.disposeViewportFrame = void 0, await qx(n.shell, n.frame, n.presentation), l(n);
  }
  function d(n) {
    var i;
    if (String(n.code) !== "103000") {
      (i = e.onError) == null || i.call(e, n);
      return;
    }
    a().initControl({
      styleOption: bn(e.styleOption),
      beforeSubmit: () => !0,
      authReady: e.onAuthReady,
      success: e.onSuccess,
      error: e.onError
    });
  }
  const g = {
    authorize() {
      if (!e.container || !e.authParams)
        throw new Error("AssistanceMobileAuth authorize requires container and authParams");
      const n = yn(e.authParams.authType), i = n === e.authParams.authType ? e.authParams : { ...e.authParams, authType: n }, f = h ?? Dr();
      h = f, f.then(() => {
        a().showAuthPage({
          data: i,
          success: d,
          error: e.onError
        });
      }).catch((p) => {
        var F;
        const D = p instanceof Error ? p : new Error(String(p));
        (F = e.onError) == null || F.call(e, { code: "sdk-script-load-failed", message: D.message });
      });
    },
    clear(n) {
      a().clearControl(n);
    },
    open(n) {
      return g.openVerification(n);
    },
    openVerification(n) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth requires a browser window and document"));
      const i = o;
      i && u(i, new Error("Assistance auth replaced"));
      const f = Ar(), p = gr(), D = gx(x), F = D === "ginkgo-v23-viewport-modal" ? { heightMode: "fixed", height: "100%", maxHeight: "none" } : Ux(e), m = Wn({
        closable: e.closable,
        useCustomKeyboard: e.useCustomKeyboard,
        heightMode: F.heightMode
      }), P = Er({
        verificationUrl: p.verificationUrl,
        sessionId: f,
        request: n,
        expectsUiConfig: r,
        appId: x,
        parentOrigin: window.location.origin
      }), { shell: B, positioningLayer: b } = Sx(D), w = Ix(
        P,
        e.authWindowTitle ?? "移动认证验证窗口",
        F,
        D
      );
      b.appendChild(w);
      const _ = {
        sessionId: f,
        shell: B,
        frame: w,
        previousBodyOverflow: document.body.style.overflow,
        settled: !1,
        presentation: D
      };
      if (D === "ginkgo-v23-viewport-modal" ? _.disposeViewportFrame = kx({
        targetWindow: window,
        frame: w,
        positioningLayer: b
      }) : F.heightMode === "auto" && (_.keyboardAvoidance = lx({
        targetWindow: window,
        frame: w,
        positioningLayer: b
      })), o = _, document.body.style.overflow = "hidden", document.body.appendChild(B), _.keyboardAvoidance && !m.useCustomKeyboard && Hx(B)) {
        const M = zx(w);
        M !== null && _.keyboardAvoidance.update({
          height: M,
          keyboardFocused: !0
        });
      }
      _.cancelPendingEnterAnimation = Mx(B, w, D);
      const z = w.contentWindow, L = () => {
        !r || !z || z.postMessage(
          Qn(f, t),
          p.allowedOrigin
        );
      }, $ = () => {
        z == null || z.postMessage(
          de(
            Ir,
            f,
            {
              styleOption: mn(e.styleOption) ?? {},
              agreements: yx(e.agreements),
              iframeOptions: m,
              beforeLoginNotificationEnabled: c,
              stateChangeEnabled: C,
              ...y ? { formHeaderImg: y } : {}
            }
          ),
          p.allowedOrigin
        );
      };
      return new Promise((M, O) => {
        _.reject = O;
        const N = (T) => {
          _.settled || (_.settled = !0, v(_).then(T));
        };
        _.disposeMessageListener = Br(
          window,
          f,
          {
            onReady: () => {
              var T;
              o === _ && ($(), L(), (T = e.onReady) == null || T.call(e));
            },
            onStateChange: (T) => {
              o !== _ || _.settled || (pr(e.onStateChange, "onStateChange", T), T.type === "idLast4Complete" && pr(e.onBeforeLogin, "onBeforeLogin"));
            },
            onSuccess: (T) => N(() => {
              var S;
              (S = e.onSuccess) == null || S.call(e, T), M(T);
            }),
            onCancel: (T) => N(() => {
              var S;
              (S = e.onCancel) == null || S.call(e, T), O(new Error("Assistance auth cancelled"));
            }),
            onError: (T) => N(() => {
              var S;
              (S = e.onError) == null || S.call(e, T), O(new Error(`Assistance auth error: ${T.message}`));
            }),
            // 非终态通知：纯透传，不 settle、不关弹窗、不 reject —— 终态语义不变。
            // settled 之后不再透传：关闭动画期间迟到的通知对调用方已无意义（流程已终结）。
            onErrorNotice: (T) => {
              var S;
              o === _ && !_.settled && ((S = e.onErrorNotice) == null || S.call(e, T));
            },
            onPhoneReady: (T) => {
              var S;
              o === _ && !_.settled && ((S = e.onPhoneReady) == null || S.call(e, T));
            },
            onResize: (T) => {
              o !== _ || D === "ginkgo-v23-viewport-modal" || m.heightMode !== "auto" || !_.keyboardAvoidance || _.keyboardAvoidance.update(T);
            },
            onClose: () => N(() => {
              var T;
              (T = e.onClose) == null || T.call(e), O(new Error("Assistance auth closed"));
            })
          },
          p.allowedOrigin,
          {
            expectedSource: z,
            expectedSourceTypes: [Ee]
          }
        );
      });
    },
    precheck(n) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth precheck requires a browser window and document"));
      if (s)
        return s;
      const i = n.timeoutMs ?? Fx, f = Ar(), p = gr(), D = Er({
        verificationUrl: p.verificationUrl,
        sessionId: f,
        request: { scene: n.scene, requestId: n.requestId },
        mode: "probe",
        appId: x
      }), F = Ox(D), m = new Promise((P) => {
        let B = !1, b, w;
        const _ = (z) => {
          B || (B = !0, w !== void 0 && clearTimeout(w), b == null || b(), F.remove(), P(z));
        };
        A = () => _({ eligible: !1, reason: "unknown" }), b = Br(
          window,
          f,
          { onProbeResult: (z) => _(z) },
          p.allowedOrigin
        ), w = setTimeout(() => _({ eligible: !1, reason: "unknown" }), i), document.body.appendChild(F);
      }).finally(() => {
        s = void 0, A = void 0;
      });
      return s = m, m;
    },
    close() {
      const n = o;
      if (n != null && n.frame.contentWindow && n.frame.contentWindow.postMessage(de(Ce, n.sessionId), "*"), n && !n.settled && n.reject) {
        n.settled = !0;
        const i = n.reject;
        v(n).then(() => {
          var f;
          (f = e.onClose) == null || f.call(e), i(new Error("Assistance auth closed"));
        });
        return;
      }
      l(n);
    },
    destroy() {
      A == null || A();
      const n = o;
      n && u(n, new Error("Assistance auth destroyed"));
    }
  };
  return g;
}
export {
  jx as createAssistanceMobileAuthSdk,
  Wx as getAssistanceMobileAuthOfficialCssAsset,
  Kx as injectAssistanceMobileAuthOfficialCss
};
