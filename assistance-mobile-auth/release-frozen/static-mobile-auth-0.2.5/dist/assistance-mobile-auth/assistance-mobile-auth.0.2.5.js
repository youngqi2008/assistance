var fe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function st(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function ct(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function r() {
      return this instanceof r ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(r) {
    var c = Object.getOwnPropertyDescriptor(e, r);
    Object.defineProperty(n, r, c.get ? c : {
      enumerable: !0,
      get: function() {
        return e[r];
      }
    });
  }), n;
}
var b0 = { exports: {} };
function ft(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var D0 = { exports: {} };
const ut = {}, dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ut
}, Symbol.toStringTag, { value: "Module" })), lt = /* @__PURE__ */ ct(dt);
var ht = D0.exports, ze;
function U() {
  return ze || (ze = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(ht, function() {
      var n = n || (function(r, c) {
        var A;
        if (typeof window < "u" && window.crypto && (A = window.crypto), typeof self < "u" && self.crypto && (A = self.crypto), typeof globalThis < "u" && globalThis.crypto && (A = globalThis.crypto), !A && typeof window < "u" && window.msCrypto && (A = window.msCrypto), !A && typeof fe < "u" && fe.crypto && (A = fe.crypto), !A && typeof ft == "function")
          try {
            A = lt;
          } catch {
          }
        var D = function() {
          if (A) {
            if (typeof A.getRandomValues == "function")
              try {
                return A.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof A.randomBytes == "function")
              try {
                return A.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, h = Object.create || /* @__PURE__ */ (function() {
          function s() {
          }
          return function(f) {
            var i;
            return s.prototype = f, i = new s(), s.prototype = null, i;
          };
        })(), C = {}, o = C.lib = {}, x = o.Base = /* @__PURE__ */ (function() {
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
              var f = h(this);
              return s && f.mixIn(s), (!f.hasOwnProperty("init") || this.init === f.init) && (f.init = function() {
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
              for (var f in s)
                s.hasOwnProperty(f) && (this[f] = s[f]);
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
        })(), p = o.WordArray = x.extend({
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
          init: function(s, f) {
            s = this.words = s || [], f != c ? this.sigBytes = f : this.sigBytes = s.length * 4;
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
            var f = this.words, i = s.words, F = this.sigBytes, g = s.sigBytes;
            if (this.clamp(), F % 4)
              for (var B = 0; B < g; B++) {
                var y = i[B >>> 2] >>> 24 - B % 4 * 8 & 255;
                f[F + B >>> 2] |= y << 24 - (F + B) % 4 * 8;
              }
            else
              for (var S = 0; S < g; S += 4)
                f[F + S >>> 2] = i[S >>> 2];
            return this.sigBytes += g, this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var s = this.words, f = this.sigBytes;
            s[f >>> 2] &= 4294967295 << 32 - f % 4 * 8, s.length = r.ceil(f / 4);
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
            var s = x.clone.call(this);
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
            for (var f = [], i = 0; i < s; i += 4)
              f.push(D());
            return new p.init(f, s);
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
            for (var f = s.words, i = s.sigBytes, F = [], g = 0; g < i; g++) {
              var B = f[g >>> 2] >>> 24 - g % 4 * 8 & 255;
              F.push((B >>> 4).toString(16)), F.push((B & 15).toString(16));
            }
            return F.join("");
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
            for (var f = s.length, i = [], F = 0; F < f; F += 2)
              i[F >>> 3] |= parseInt(s.substr(F, 2), 16) << 24 - F % 8 * 4;
            return new p.init(i, f / 2);
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
            for (var f = s.words, i = s.sigBytes, F = [], g = 0; g < i; g++) {
              var B = f[g >>> 2] >>> 24 - g % 4 * 8 & 255;
              F.push(String.fromCharCode(B));
            }
            return F.join("");
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
            for (var f = s.length, i = [], F = 0; F < f; F++)
              i[F >>> 2] |= (s.charCodeAt(F) & 255) << 24 - F % 4 * 8;
            return new p.init(i, f);
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
        }, d = o.BufferedBlockAlgorithm = x.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new p.init(), this._nDataBytes = 0;
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
            typeof s == "string" && (s = v.parse(s)), this._data.concat(s), this._nDataBytes += s.sigBytes;
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
            var f, i = this._data, F = i.words, g = i.sigBytes, B = this.blockSize, y = B * 4, S = g / y;
            s ? S = r.ceil(S) : S = r.max((S | 0) - this._minBufferSize, 0);
            var E = S * B, m = r.min(E * 4, g);
            if (E) {
              for (var _ = 0; _ < E; _ += B)
                this._doProcessBlock(F, _);
              f = F.splice(0, E), i.sigBytes -= m;
            }
            return new p.init(f, m);
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
            var s = x.clone.call(this);
            return s._data = this._data.clone(), s;
          },
          _minBufferSize: 0
        });
        o.Hasher = d.extend({
          /**
           * Configuration options.
           */
          cfg: x.extend(),
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
          _createHelper: function(s) {
            return function(f, i) {
              return new s.init(i).finalize(f);
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
            return function(f, i) {
              return new b.HMAC.init(s, i).finalize(f);
            };
          }
        });
        var b = C.algo = {};
        return C;
      })(Math);
      return n;
    });
  })(D0)), D0.exports;
}
var m0 = { exports: {} }, vt = m0.exports, Le;
function xe() {
  return Le || (Le = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(vt, function(n) {
      return (function(r) {
        var c = n, A = c.lib, D = A.Base, h = A.WordArray, C = c.x64 = {};
        C.Word = D.extend({
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
          init: function(o, x) {
            this.high = o, this.low = x;
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
        }), C.WordArray = D.extend({
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
          init: function(o, x) {
            o = this.words = o || [], x != r ? this.sigBytes = x : this.sigBytes = o.length * 8;
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
            for (var o = this.words, x = o.length, p = [], a = 0; a < x; a++) {
              var l = o[a];
              p.push(l.high), p.push(l.low);
            }
            return h.create(p, this.sigBytes);
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
            for (var o = D.clone.call(this), x = o.words = this.words.slice(0), p = x.length, a = 0; a < p; a++)
              x[a] = x[a].clone();
            return o;
          }
        });
      })(), n;
    });
  })(m0)), m0.exports;
}
var y0 = { exports: {} }, pt = y0.exports, Ie;
function At() {
  return Ie || (Ie = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(pt, function(n) {
      return (function() {
        if (typeof ArrayBuffer == "function") {
          var r = n, c = r.lib, A = c.WordArray, D = A.init, h = A.init = function(C) {
            if (C instanceof ArrayBuffer && (C = new Uint8Array(C)), (C instanceof Int8Array || typeof Uint8ClampedArray < "u" && C instanceof Uint8ClampedArray || C instanceof Int16Array || C instanceof Uint16Array || C instanceof Int32Array || C instanceof Uint32Array || C instanceof Float32Array || C instanceof Float64Array) && (C = new Uint8Array(C.buffer, C.byteOffset, C.byteLength)), C instanceof Uint8Array) {
              for (var o = C.byteLength, x = [], p = 0; p < o; p++)
                x[p >>> 2] |= C[p] << 24 - p % 4 * 8;
              D.call(this, x, o);
            } else
              D.apply(this, arguments);
          };
          h.prototype = A;
        }
      })(), n.lib.WordArray;
    });
  })(y0)), y0.exports;
}
var _0 = { exports: {} }, Ct = _0.exports, $e;
function Et() {
  return $e || ($e = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(Ct, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = r.enc;
        D.Utf16 = D.Utf16BE = {
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
            for (var o = C.words, x = C.sigBytes, p = [], a = 0; a < x; a += 2) {
              var l = o[a >>> 2] >>> 16 - a % 4 * 8 & 65535;
              p.push(String.fromCharCode(l));
            }
            return p.join("");
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
            for (var o = C.length, x = [], p = 0; p < o; p++)
              x[p >>> 1] |= C.charCodeAt(p) << 16 - p % 2 * 16;
            return A.create(x, o * 2);
          }
        }, D.Utf16LE = {
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
            for (var o = C.words, x = C.sigBytes, p = [], a = 0; a < x; a += 2) {
              var l = h(o[a >>> 2] >>> 16 - a % 4 * 8 & 65535);
              p.push(String.fromCharCode(l));
            }
            return p.join("");
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
            for (var o = C.length, x = [], p = 0; p < o; p++)
              x[p >>> 1] |= h(C.charCodeAt(p) << 16 - p % 2 * 16);
            return A.create(x, o * 2);
          }
        };
        function h(C) {
          return C << 8 & 4278255360 | C >>> 8 & 16711935;
        }
      })(), n.enc.Utf16;
    });
  })(_0)), _0.exports;
}
var S0 = { exports: {} }, Bt = S0.exports, Ue;
function o0() {
  return Ue || (Ue = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(Bt, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = r.enc;
        D.Base64 = {
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
            var o = C.words, x = C.sigBytes, p = this._map;
            C.clamp();
            for (var a = [], l = 0; l < x; l += 3)
              for (var u = o[l >>> 2] >>> 24 - l % 4 * 8 & 255, v = o[l + 1 >>> 2] >>> 24 - (l + 1) % 4 * 8 & 255, d = o[l + 2 >>> 2] >>> 24 - (l + 2) % 4 * 8 & 255, b = u << 16 | v << 8 | d, s = 0; s < 4 && l + s * 0.75 < x; s++)
                a.push(p.charAt(b >>> 6 * (3 - s) & 63));
            var f = p.charAt(64);
            if (f)
              for (; a.length % 4; )
                a.push(f);
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
            var o = C.length, x = this._map, p = this._reverseMap;
            if (!p) {
              p = this._reverseMap = [];
              for (var a = 0; a < x.length; a++)
                p[x.charCodeAt(a)] = a;
            }
            var l = x.charAt(64);
            if (l) {
              var u = C.indexOf(l);
              u !== -1 && (o = u);
            }
            return h(C, o, p);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function h(C, o, x) {
          for (var p = [], a = 0, l = 0; l < o; l++)
            if (l % 4) {
              var u = x[C.charCodeAt(l - 1)] << l % 4 * 2, v = x[C.charCodeAt(l)] >>> 6 - l % 4 * 2, d = u | v;
              p[a >>> 2] |= d << 24 - a % 4 * 8, a++;
            }
          return A.create(p, a);
        }
      })(), n.enc.Base64;
    });
  })(S0)), S0.exports;
}
var w0 = { exports: {} }, Ft = w0.exports, Oe;
function gt() {
  return Oe || (Oe = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(Ft, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = r.enc;
        D.Base64url = {
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
          stringify: function(C, o) {
            o === void 0 && (o = !0);
            var x = C.words, p = C.sigBytes, a = o ? this._safe_map : this._map;
            C.clamp();
            for (var l = [], u = 0; u < p; u += 3)
              for (var v = x[u >>> 2] >>> 24 - u % 4 * 8 & 255, d = x[u + 1 >>> 2] >>> 24 - (u + 1) % 4 * 8 & 255, b = x[u + 2 >>> 2] >>> 24 - (u + 2) % 4 * 8 & 255, s = v << 16 | d << 8 | b, f = 0; f < 4 && u + f * 0.75 < p; f++)
                l.push(a.charAt(s >>> 6 * (3 - f) & 63));
            var i = a.charAt(64);
            if (i)
              for (; l.length % 4; )
                l.push(i);
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
          parse: function(C, o) {
            o === void 0 && (o = !0);
            var x = C.length, p = o ? this._safe_map : this._map, a = this._reverseMap;
            if (!a) {
              a = this._reverseMap = [];
              for (var l = 0; l < p.length; l++)
                a[p.charCodeAt(l)] = l;
            }
            var u = p.charAt(64);
            if (u) {
              var v = C.indexOf(u);
              v !== -1 && (x = v);
            }
            return h(C, x, a);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function h(C, o, x) {
          for (var p = [], a = 0, l = 0; l < o; l++)
            if (l % 4) {
              var u = x[C.charCodeAt(l - 1)] << l % 4 * 2, v = x[C.charCodeAt(l)] >>> 6 - l % 4 * 2, d = u | v;
              p[a >>> 2] |= d << 24 - a % 4 * 8, a++;
            }
          return A.create(p, a);
        }
      })(), n.enc.Base64url;
    });
  })(w0)), w0.exports;
}
var k0 = { exports: {} }, bt = k0.exports, Ne;
function i0() {
  return Ne || (Ne = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(bt, function(n) {
      return (function(r) {
        var c = n, A = c.lib, D = A.WordArray, h = A.Hasher, C = c.algo, o = [];
        (function() {
          for (var v = 0; v < 64; v++)
            o[v] = r.abs(r.sin(v + 1)) * 4294967296 | 0;
        })();
        var x = C.MD5 = h.extend({
          _doReset: function() {
            this._hash = new D.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(v, d) {
            for (var b = 0; b < 16; b++) {
              var s = d + b, f = v[s];
              v[s] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360;
            }
            var i = this._hash.words, F = v[d + 0], g = v[d + 1], B = v[d + 2], y = v[d + 3], S = v[d + 4], E = v[d + 5], m = v[d + 6], _ = v[d + 7], k = v[d + 8], L = v[d + 9], z = v[d + 10], T = v[d + 11], M = v[d + 12], O = v[d + 13], N = v[d + 14], q = v[d + 15], w = i[0], H = i[1], P = i[2], R = i[3];
            w = p(w, H, P, R, F, 7, o[0]), R = p(R, w, H, P, g, 12, o[1]), P = p(P, R, w, H, B, 17, o[2]), H = p(H, P, R, w, y, 22, o[3]), w = p(w, H, P, R, S, 7, o[4]), R = p(R, w, H, P, E, 12, o[5]), P = p(P, R, w, H, m, 17, o[6]), H = p(H, P, R, w, _, 22, o[7]), w = p(w, H, P, R, k, 7, o[8]), R = p(R, w, H, P, L, 12, o[9]), P = p(P, R, w, H, z, 17, o[10]), H = p(H, P, R, w, T, 22, o[11]), w = p(w, H, P, R, M, 7, o[12]), R = p(R, w, H, P, O, 12, o[13]), P = p(P, R, w, H, N, 17, o[14]), H = p(H, P, R, w, q, 22, o[15]), w = a(w, H, P, R, g, 5, o[16]), R = a(R, w, H, P, m, 9, o[17]), P = a(P, R, w, H, T, 14, o[18]), H = a(H, P, R, w, F, 20, o[19]), w = a(w, H, P, R, E, 5, o[20]), R = a(R, w, H, P, z, 9, o[21]), P = a(P, R, w, H, q, 14, o[22]), H = a(H, P, R, w, S, 20, o[23]), w = a(w, H, P, R, L, 5, o[24]), R = a(R, w, H, P, N, 9, o[25]), P = a(P, R, w, H, y, 14, o[26]), H = a(H, P, R, w, k, 20, o[27]), w = a(w, H, P, R, O, 5, o[28]), R = a(R, w, H, P, B, 9, o[29]), P = a(P, R, w, H, _, 14, o[30]), H = a(H, P, R, w, M, 20, o[31]), w = l(w, H, P, R, E, 4, o[32]), R = l(R, w, H, P, k, 11, o[33]), P = l(P, R, w, H, T, 16, o[34]), H = l(H, P, R, w, N, 23, o[35]), w = l(w, H, P, R, g, 4, o[36]), R = l(R, w, H, P, S, 11, o[37]), P = l(P, R, w, H, _, 16, o[38]), H = l(H, P, R, w, z, 23, o[39]), w = l(w, H, P, R, O, 4, o[40]), R = l(R, w, H, P, F, 11, o[41]), P = l(P, R, w, H, y, 16, o[42]), H = l(H, P, R, w, m, 23, o[43]), w = l(w, H, P, R, L, 4, o[44]), R = l(R, w, H, P, M, 11, o[45]), P = l(P, R, w, H, q, 16, o[46]), H = l(H, P, R, w, B, 23, o[47]), w = u(w, H, P, R, F, 6, o[48]), R = u(R, w, H, P, _, 10, o[49]), P = u(P, R, w, H, N, 15, o[50]), H = u(H, P, R, w, E, 21, o[51]), w = u(w, H, P, R, M, 6, o[52]), R = u(R, w, H, P, y, 10, o[53]), P = u(P, R, w, H, z, 15, o[54]), H = u(H, P, R, w, g, 21, o[55]), w = u(w, H, P, R, k, 6, o[56]), R = u(R, w, H, P, q, 10, o[57]), P = u(P, R, w, H, m, 15, o[58]), H = u(H, P, R, w, O, 21, o[59]), w = u(w, H, P, R, S, 6, o[60]), R = u(R, w, H, P, T, 10, o[61]), P = u(P, R, w, H, B, 15, o[62]), H = u(H, P, R, w, L, 21, o[63]), i[0] = i[0] + w | 0, i[1] = i[1] + H | 0, i[2] = i[2] + P | 0, i[3] = i[3] + R | 0;
          },
          _doFinalize: function() {
            var v = this._data, d = v.words, b = this._nDataBytes * 8, s = v.sigBytes * 8;
            d[s >>> 5] |= 128 << 24 - s % 32;
            var f = r.floor(b / 4294967296), i = b;
            d[(s + 64 >>> 9 << 4) + 15] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, d[(s + 64 >>> 9 << 4) + 14] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, v.sigBytes = (d.length + 1) * 4, this._process();
            for (var F = this._hash, g = F.words, B = 0; B < 4; B++) {
              var y = g[B];
              g[B] = (y << 8 | y >>> 24) & 16711935 | (y << 24 | y >>> 8) & 4278255360;
            }
            return F;
          },
          clone: function() {
            var v = h.clone.call(this);
            return v._hash = this._hash.clone(), v;
          }
        });
        function p(v, d, b, s, f, i, F) {
          var g = v + (d & b | ~d & s) + f + F;
          return (g << i | g >>> 32 - i) + d;
        }
        function a(v, d, b, s, f, i, F) {
          var g = v + (d & s | b & ~s) + f + F;
          return (g << i | g >>> 32 - i) + d;
        }
        function l(v, d, b, s, f, i, F) {
          var g = v + (d ^ b ^ s) + f + F;
          return (g << i | g >>> 32 - i) + d;
        }
        function u(v, d, b, s, f, i, F) {
          var g = v + (b ^ (d | ~s)) + f + F;
          return (g << i | g >>> 32 - i) + d;
        }
        c.MD5 = h._createHelper(x), c.HmacMD5 = h._createHmacHelper(x);
      })(Math), n.MD5;
    });
  })(k0)), k0.exports;
}
var R0 = { exports: {} }, Dt = R0.exports, Me;
function _r() {
  return Me || (Me = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(Dt, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = c.Hasher, h = r.algo, C = [], o = h.SHA1 = D.extend({
          _doReset: function() {
            this._hash = new A.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(x, p) {
            for (var a = this._hash.words, l = a[0], u = a[1], v = a[2], d = a[3], b = a[4], s = 0; s < 80; s++) {
              if (s < 16)
                C[s] = x[p + s] | 0;
              else {
                var f = C[s - 3] ^ C[s - 8] ^ C[s - 14] ^ C[s - 16];
                C[s] = f << 1 | f >>> 31;
              }
              var i = (l << 5 | l >>> 27) + b + C[s];
              s < 20 ? i += (u & v | ~u & d) + 1518500249 : s < 40 ? i += (u ^ v ^ d) + 1859775393 : s < 60 ? i += (u & v | u & d | v & d) - 1894007588 : i += (u ^ v ^ d) - 899497514, b = d, d = v, v = u << 30 | u >>> 2, u = l, l = i;
            }
            a[0] = a[0] + l | 0, a[1] = a[1] + u | 0, a[2] = a[2] + v | 0, a[3] = a[3] + d | 0, a[4] = a[4] + b | 0;
          },
          _doFinalize: function() {
            var x = this._data, p = x.words, a = this._nDataBytes * 8, l = x.sigBytes * 8;
            return p[l >>> 5] |= 128 << 24 - l % 32, p[(l + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296), p[(l + 64 >>> 9 << 4) + 15] = a, x.sigBytes = p.length * 4, this._process(), this._hash;
          },
          clone: function() {
            var x = D.clone.call(this);
            return x._hash = this._hash.clone(), x;
          }
        });
        r.SHA1 = D._createHelper(o), r.HmacSHA1 = D._createHmacHelper(o);
      })(), n.SHA1;
    });
  })(R0)), R0.exports;
}
var H0 = { exports: {} }, mt = H0.exports, qe;
function pe() {
  return qe || (qe = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(mt, function(n) {
      return (function(r) {
        var c = n, A = c.lib, D = A.WordArray, h = A.Hasher, C = c.algo, o = [], x = [];
        (function() {
          function l(b) {
            for (var s = r.sqrt(b), f = 2; f <= s; f++)
              if (!(b % f))
                return !1;
            return !0;
          }
          function u(b) {
            return (b - (b | 0)) * 4294967296 | 0;
          }
          for (var v = 2, d = 0; d < 64; )
            l(v) && (d < 8 && (o[d] = u(r.pow(v, 1 / 2))), x[d] = u(r.pow(v, 1 / 3)), d++), v++;
        })();
        var p = [], a = C.SHA256 = h.extend({
          _doReset: function() {
            this._hash = new D.init(o.slice(0));
          },
          _doProcessBlock: function(l, u) {
            for (var v = this._hash.words, d = v[0], b = v[1], s = v[2], f = v[3], i = v[4], F = v[5], g = v[6], B = v[7], y = 0; y < 64; y++) {
              if (y < 16)
                p[y] = l[u + y] | 0;
              else {
                var S = p[y - 15], E = (S << 25 | S >>> 7) ^ (S << 14 | S >>> 18) ^ S >>> 3, m = p[y - 2], _ = (m << 15 | m >>> 17) ^ (m << 13 | m >>> 19) ^ m >>> 10;
                p[y] = E + p[y - 7] + _ + p[y - 16];
              }
              var k = i & F ^ ~i & g, L = d & b ^ d & s ^ b & s, z = (d << 30 | d >>> 2) ^ (d << 19 | d >>> 13) ^ (d << 10 | d >>> 22), T = (i << 26 | i >>> 6) ^ (i << 21 | i >>> 11) ^ (i << 7 | i >>> 25), M = B + T + k + x[y] + p[y], O = z + L;
              B = g, g = F, F = i, i = f + M | 0, f = s, s = b, b = d, d = M + O | 0;
            }
            v[0] = v[0] + d | 0, v[1] = v[1] + b | 0, v[2] = v[2] + s | 0, v[3] = v[3] + f | 0, v[4] = v[4] + i | 0, v[5] = v[5] + F | 0, v[6] = v[6] + g | 0, v[7] = v[7] + B | 0;
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
      })(Math), n.SHA256;
    });
  })(H0)), H0.exports;
}
var P0 = { exports: {} }, yt = P0.exports, We;
function _t() {
  return We || (We = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), pe());
    })(yt, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = r.algo, h = D.SHA256, C = D.SHA224 = h.extend({
          _doReset: function() {
            this._hash = new A.init([
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
        r.SHA224 = h._createHelper(C), r.HmacSHA224 = h._createHmacHelper(C);
      })(), n.SHA224;
    });
  })(P0)), P0.exports;
}
var T0 = { exports: {} }, St = T0.exports, Ke;
function Sr() {
  return Ke || (Ke = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), xe());
    })(St, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.Hasher, D = r.x64, h = D.Word, C = D.WordArray, o = r.algo;
        function x() {
          return h.create.apply(h, arguments);
        }
        var p = [
          x(1116352408, 3609767458),
          x(1899447441, 602891725),
          x(3049323471, 3964484399),
          x(3921009573, 2173295548),
          x(961987163, 4081628472),
          x(1508970993, 3053834265),
          x(2453635748, 2937671579),
          x(2870763221, 3664609560),
          x(3624381080, 2734883394),
          x(310598401, 1164996542),
          x(607225278, 1323610764),
          x(1426881987, 3590304994),
          x(1925078388, 4068182383),
          x(2162078206, 991336113),
          x(2614888103, 633803317),
          x(3248222580, 3479774868),
          x(3835390401, 2666613458),
          x(4022224774, 944711139),
          x(264347078, 2341262773),
          x(604807628, 2007800933),
          x(770255983, 1495990901),
          x(1249150122, 1856431235),
          x(1555081692, 3175218132),
          x(1996064986, 2198950837),
          x(2554220882, 3999719339),
          x(2821834349, 766784016),
          x(2952996808, 2566594879),
          x(3210313671, 3203337956),
          x(3336571891, 1034457026),
          x(3584528711, 2466948901),
          x(113926993, 3758326383),
          x(338241895, 168717936),
          x(666307205, 1188179964),
          x(773529912, 1546045734),
          x(1294757372, 1522805485),
          x(1396182291, 2643833823),
          x(1695183700, 2343527390),
          x(1986661051, 1014477480),
          x(2177026350, 1206759142),
          x(2456956037, 344077627),
          x(2730485921, 1290863460),
          x(2820302411, 3158454273),
          x(3259730800, 3505952657),
          x(3345764771, 106217008),
          x(3516065817, 3606008344),
          x(3600352804, 1432725776),
          x(4094571909, 1467031594),
          x(275423344, 851169720),
          x(430227734, 3100823752),
          x(506948616, 1363258195),
          x(659060556, 3750685593),
          x(883997877, 3785050280),
          x(958139571, 3318307427),
          x(1322822218, 3812723403),
          x(1537002063, 2003034995),
          x(1747873779, 3602036899),
          x(1955562222, 1575990012),
          x(2024104815, 1125592928),
          x(2227730452, 2716904306),
          x(2361852424, 442776044),
          x(2428436474, 593698344),
          x(2756734187, 3733110249),
          x(3204031479, 2999351573),
          x(3329325298, 3815920427),
          x(3391569614, 3928383900),
          x(3515267271, 566280711),
          x(3940187606, 3454069534),
          x(4118630271, 4000239992),
          x(116418474, 1914138554),
          x(174292421, 2731055270),
          x(289380356, 3203993006),
          x(460393269, 320620315),
          x(685471733, 587496836),
          x(852142971, 1086792851),
          x(1017036298, 365543100),
          x(1126000580, 2618297676),
          x(1288033470, 3409855158),
          x(1501505948, 4234509866),
          x(1607167915, 987167468),
          x(1816402316, 1246189591)
        ], a = [];
        (function() {
          for (var u = 0; u < 80; u++)
            a[u] = x();
        })();
        var l = o.SHA512 = A.extend({
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
          _doProcessBlock: function(u, v) {
            for (var d = this._hash.words, b = d[0], s = d[1], f = d[2], i = d[3], F = d[4], g = d[5], B = d[6], y = d[7], S = b.high, E = b.low, m = s.high, _ = s.low, k = f.high, L = f.low, z = i.high, T = i.low, M = F.high, O = F.low, N = g.high, q = g.low, w = B.high, H = B.low, P = y.high, R = y.low, W = S, K = E, I = m, $ = _, u0 = k, a0 = L, se = z, d0 = T, Q = M, G = O, B0 = N, l0 = q, F0 = w, h0 = H, ce = P, v0 = R, J = 0; J < 80; J++) {
              var Z, r0, g0 = a[J];
              if (J < 16)
                r0 = g0.high = u[v + J * 2] | 0, Z = g0.low = u[v + J * 2 + 1] | 0;
              else {
                var be = a[J - 15], x0 = be.high, p0 = be.low, Gr = (x0 >>> 1 | p0 << 31) ^ (x0 >>> 8 | p0 << 24) ^ x0 >>> 7, De = (p0 >>> 1 | x0 << 31) ^ (p0 >>> 8 | x0 << 24) ^ (p0 >>> 7 | x0 << 25), me = a[J - 2], s0 = me.high, A0 = me.low, Xr = (s0 >>> 19 | A0 << 13) ^ (s0 << 3 | A0 >>> 29) ^ s0 >>> 6, ye = (A0 >>> 19 | s0 << 13) ^ (A0 << 3 | s0 >>> 29) ^ (A0 >>> 6 | s0 << 26), _e = a[J - 7], Zr = _e.high, Qr = _e.low, Se = a[J - 16], Jr = Se.high, we = Se.low;
                Z = De + Qr, r0 = Gr + Zr + (Z >>> 0 < De >>> 0 ? 1 : 0), Z = Z + ye, r0 = r0 + Xr + (Z >>> 0 < ye >>> 0 ? 1 : 0), Z = Z + we, r0 = r0 + Jr + (Z >>> 0 < we >>> 0 ? 1 : 0), g0.high = r0, g0.low = Z;
              }
              var et = Q & B0 ^ ~Q & F0, ke = G & l0 ^ ~G & h0, rt = W & I ^ W & u0 ^ I & u0, tt = K & $ ^ K & a0 ^ $ & a0, nt = (W >>> 28 | K << 4) ^ (W << 30 | K >>> 2) ^ (W << 25 | K >>> 7), Re = (K >>> 28 | W << 4) ^ (K << 30 | W >>> 2) ^ (K << 25 | W >>> 7), ot = (Q >>> 14 | G << 18) ^ (Q >>> 18 | G << 14) ^ (Q << 23 | G >>> 9), it = (G >>> 14 | Q << 18) ^ (G >>> 18 | Q << 14) ^ (G << 23 | Q >>> 9), He = p[J], at = He.high, Pe = He.low, X = v0 + it, t0 = ce + ot + (X >>> 0 < v0 >>> 0 ? 1 : 0), X = X + ke, t0 = t0 + et + (X >>> 0 < ke >>> 0 ? 1 : 0), X = X + Pe, t0 = t0 + at + (X >>> 0 < Pe >>> 0 ? 1 : 0), X = X + Z, t0 = t0 + r0 + (X >>> 0 < Z >>> 0 ? 1 : 0), Te = Re + tt, xt = nt + rt + (Te >>> 0 < Re >>> 0 ? 1 : 0);
              ce = F0, v0 = h0, F0 = B0, h0 = l0, B0 = Q, l0 = G, G = d0 + X | 0, Q = se + t0 + (G >>> 0 < d0 >>> 0 ? 1 : 0) | 0, se = u0, d0 = a0, u0 = I, a0 = $, I = W, $ = K, K = X + Te | 0, W = t0 + xt + (K >>> 0 < X >>> 0 ? 1 : 0) | 0;
            }
            E = b.low = E + K, b.high = S + W + (E >>> 0 < K >>> 0 ? 1 : 0), _ = s.low = _ + $, s.high = m + I + (_ >>> 0 < $ >>> 0 ? 1 : 0), L = f.low = L + a0, f.high = k + u0 + (L >>> 0 < a0 >>> 0 ? 1 : 0), T = i.low = T + d0, i.high = z + se + (T >>> 0 < d0 >>> 0 ? 1 : 0), O = F.low = O + G, F.high = M + Q + (O >>> 0 < G >>> 0 ? 1 : 0), q = g.low = q + l0, g.high = N + B0 + (q >>> 0 < l0 >>> 0 ? 1 : 0), H = B.low = H + h0, B.high = w + F0 + (H >>> 0 < h0 >>> 0 ? 1 : 0), R = y.low = R + v0, y.high = P + ce + (R >>> 0 < v0 >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var u = this._data, v = u.words, d = this._nDataBytes * 8, b = u.sigBytes * 8;
            v[b >>> 5] |= 128 << 24 - b % 32, v[(b + 128 >>> 10 << 5) + 30] = Math.floor(d / 4294967296), v[(b + 128 >>> 10 << 5) + 31] = d, u.sigBytes = v.length * 4, this._process();
            var s = this._hash.toX32();
            return s;
          },
          clone: function() {
            var u = A.clone.call(this);
            return u._hash = this._hash.clone(), u;
          },
          blockSize: 1024 / 32
        });
        r.SHA512 = A._createHelper(l), r.HmacSHA512 = A._createHmacHelper(l);
      })(), n.SHA512;
    });
  })(T0)), T0.exports;
}
var z0 = { exports: {} }, wt = z0.exports, je;
function kt() {
  return je || (je = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), xe(), Sr());
    })(wt, function(n) {
      return (function() {
        var r = n, c = r.x64, A = c.Word, D = c.WordArray, h = r.algo, C = h.SHA512, o = h.SHA384 = C.extend({
          _doReset: function() {
            this._hash = new D.init([
              new A.init(3418070365, 3238371032),
              new A.init(1654270250, 914150663),
              new A.init(2438529370, 812702999),
              new A.init(355462360, 4144912697),
              new A.init(1731405415, 4290775857),
              new A.init(2394180231, 1750603025),
              new A.init(3675008525, 1694076839),
              new A.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var x = C._doFinalize.call(this);
            return x.sigBytes -= 16, x;
          }
        });
        r.SHA384 = C._createHelper(o), r.HmacSHA384 = C._createHmacHelper(o);
      })(), n.SHA384;
    });
  })(z0)), z0.exports;
}
var L0 = { exports: {} }, Rt = L0.exports, Ve;
function Ht() {
  return Ve || (Ve = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), xe());
    })(Rt, function(n) {
      return (function(r) {
        var c = n, A = c.lib, D = A.WordArray, h = A.Hasher, C = c.x64, o = C.Word, x = c.algo, p = [], a = [], l = [];
        (function() {
          for (var d = 1, b = 0, s = 0; s < 24; s++) {
            p[d + 5 * b] = (s + 1) * (s + 2) / 2 % 64;
            var f = b % 5, i = (2 * d + 3 * b) % 5;
            d = f, b = i;
          }
          for (var d = 0; d < 5; d++)
            for (var b = 0; b < 5; b++)
              a[d + 5 * b] = b + (2 * d + 3 * b) % 5 * 5;
          for (var F = 1, g = 0; g < 24; g++) {
            for (var B = 0, y = 0, S = 0; S < 7; S++) {
              if (F & 1) {
                var E = (1 << S) - 1;
                E < 32 ? y ^= 1 << E : B ^= 1 << E - 32;
              }
              F & 128 ? F = F << 1 ^ 113 : F <<= 1;
            }
            l[g] = o.create(B, y);
          }
        })();
        var u = [];
        (function() {
          for (var d = 0; d < 25; d++)
            u[d] = o.create();
        })();
        var v = x.SHA3 = h.extend({
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
            for (var d = this._state = [], b = 0; b < 25; b++)
              d[b] = new o.init();
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(d, b) {
            for (var s = this._state, f = this.blockSize / 2, i = 0; i < f; i++) {
              var F = d[b + 2 * i], g = d[b + 2 * i + 1];
              F = (F << 8 | F >>> 24) & 16711935 | (F << 24 | F >>> 8) & 4278255360, g = (g << 8 | g >>> 24) & 16711935 | (g << 24 | g >>> 8) & 4278255360;
              var B = s[i];
              B.high ^= g, B.low ^= F;
            }
            for (var y = 0; y < 24; y++) {
              for (var S = 0; S < 5; S++) {
                for (var E = 0, m = 0, _ = 0; _ < 5; _++) {
                  var B = s[S + 5 * _];
                  E ^= B.high, m ^= B.low;
                }
                var k = u[S];
                k.high = E, k.low = m;
              }
              for (var S = 0; S < 5; S++)
                for (var L = u[(S + 4) % 5], z = u[(S + 1) % 5], T = z.high, M = z.low, E = L.high ^ (T << 1 | M >>> 31), m = L.low ^ (M << 1 | T >>> 31), _ = 0; _ < 5; _++) {
                  var B = s[S + 5 * _];
                  B.high ^= E, B.low ^= m;
                }
              for (var O = 1; O < 25; O++) {
                var E, m, B = s[O], N = B.high, q = B.low, w = p[O];
                w < 32 ? (E = N << w | q >>> 32 - w, m = q << w | N >>> 32 - w) : (E = q << w - 32 | N >>> 64 - w, m = N << w - 32 | q >>> 64 - w);
                var H = u[a[O]];
                H.high = E, H.low = m;
              }
              var P = u[0], R = s[0];
              P.high = R.high, P.low = R.low;
              for (var S = 0; S < 5; S++)
                for (var _ = 0; _ < 5; _++) {
                  var O = S + 5 * _, B = s[O], W = u[O], K = u[(S + 1) % 5 + 5 * _], I = u[(S + 2) % 5 + 5 * _];
                  B.high = W.high ^ ~K.high & I.high, B.low = W.low ^ ~K.low & I.low;
                }
              var B = s[0], $ = l[y];
              B.high ^= $.high, B.low ^= $.low;
            }
          },
          _doFinalize: function() {
            var d = this._data, b = d.words;
            this._nDataBytes * 8;
            var s = d.sigBytes * 8, f = this.blockSize * 32;
            b[s >>> 5] |= 1 << 24 - s % 32, b[(r.ceil((s + 1) / f) * f >>> 5) - 1] |= 128, d.sigBytes = b.length * 4, this._process();
            for (var i = this._state, F = this.cfg.outputLength / 8, g = F / 8, B = [], y = 0; y < g; y++) {
              var S = i[y], E = S.high, m = S.low;
              E = (E << 8 | E >>> 24) & 16711935 | (E << 24 | E >>> 8) & 4278255360, m = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360, B.push(m), B.push(E);
            }
            return new D.init(B, F);
          },
          clone: function() {
            for (var d = h.clone.call(this), b = d._state = this._state.slice(0), s = 0; s < 25; s++)
              b[s] = b[s].clone();
            return d;
          }
        });
        c.SHA3 = h._createHelper(v), c.HmacSHA3 = h._createHmacHelper(v);
      })(Math), n.SHA3;
    });
  })(L0)), L0.exports;
}
var I0 = { exports: {} }, Pt = I0.exports, Ye;
function Tt() {
  return Ye || (Ye = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(Pt, function(n) {
      /** @preserve
      			(c) 2012 by Cédric Mesnil. All rights reserved.
      
      			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
      
      			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
      
      			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      			*/
      return (function(r) {
        var c = n, A = c.lib, D = A.WordArray, h = A.Hasher, C = c.algo, o = D.create([
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
        ]), x = D.create([
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
        ]), p = D.create([
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
        ]), a = D.create([
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
        ]), l = D.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), u = D.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), v = C.RIPEMD160 = h.extend({
          _doReset: function() {
            this._hash = D.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(g, B) {
            for (var y = 0; y < 16; y++) {
              var S = B + y, E = g[S];
              g[S] = (E << 8 | E >>> 24) & 16711935 | (E << 24 | E >>> 8) & 4278255360;
            }
            var m = this._hash.words, _ = l.words, k = u.words, L = o.words, z = x.words, T = p.words, M = a.words, O, N, q, w, H, P, R, W, K, I;
            P = O = m[0], R = N = m[1], W = q = m[2], K = w = m[3], I = H = m[4];
            for (var $, y = 0; y < 80; y += 1)
              $ = O + g[B + L[y]] | 0, y < 16 ? $ += d(N, q, w) + _[0] : y < 32 ? $ += b(N, q, w) + _[1] : y < 48 ? $ += s(N, q, w) + _[2] : y < 64 ? $ += f(N, q, w) + _[3] : $ += i(N, q, w) + _[4], $ = $ | 0, $ = F($, T[y]), $ = $ + H | 0, O = H, H = w, w = F(q, 10), q = N, N = $, $ = P + g[B + z[y]] | 0, y < 16 ? $ += i(R, W, K) + k[0] : y < 32 ? $ += f(R, W, K) + k[1] : y < 48 ? $ += s(R, W, K) + k[2] : y < 64 ? $ += b(R, W, K) + k[3] : $ += d(R, W, K) + k[4], $ = $ | 0, $ = F($, M[y]), $ = $ + I | 0, P = I, I = K, K = F(W, 10), W = R, R = $;
            $ = m[1] + q + K | 0, m[1] = m[2] + w + I | 0, m[2] = m[3] + H + P | 0, m[3] = m[4] + O + R | 0, m[4] = m[0] + N + W | 0, m[0] = $;
          },
          _doFinalize: function() {
            var g = this._data, B = g.words, y = this._nDataBytes * 8, S = g.sigBytes * 8;
            B[S >>> 5] |= 128 << 24 - S % 32, B[(S + 64 >>> 9 << 4) + 14] = (y << 8 | y >>> 24) & 16711935 | (y << 24 | y >>> 8) & 4278255360, g.sigBytes = (B.length + 1) * 4, this._process();
            for (var E = this._hash, m = E.words, _ = 0; _ < 5; _++) {
              var k = m[_];
              m[_] = (k << 8 | k >>> 24) & 16711935 | (k << 24 | k >>> 8) & 4278255360;
            }
            return E;
          },
          clone: function() {
            var g = h.clone.call(this);
            return g._hash = this._hash.clone(), g;
          }
        });
        function d(g, B, y) {
          return g ^ B ^ y;
        }
        function b(g, B, y) {
          return g & B | ~g & y;
        }
        function s(g, B, y) {
          return (g | ~B) ^ y;
        }
        function f(g, B, y) {
          return g & y | B & ~y;
        }
        function i(g, B, y) {
          return g ^ (B | ~y);
        }
        function F(g, B) {
          return g << B | g >>> 32 - B;
        }
        c.RIPEMD160 = h._createHelper(v), c.HmacRIPEMD160 = h._createHmacHelper(v);
      })(), n.RIPEMD160;
    });
  })(I0)), I0.exports;
}
var $0 = { exports: {} }, zt = $0.exports, Ge;
function Ae() {
  return Ge || (Ge = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r(U());
    })(zt, function(n) {
      (function() {
        var r = n, c = r.lib, A = c.Base, D = r.enc, h = D.Utf8, C = r.algo;
        C.HMAC = A.extend({
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
          init: function(o, x) {
            o = this._hasher = new o.init(), typeof x == "string" && (x = h.parse(x));
            var p = o.blockSize, a = p * 4;
            x.sigBytes > a && (x = o.finalize(x)), x.clamp();
            for (var l = this._oKey = x.clone(), u = this._iKey = x.clone(), v = l.words, d = u.words, b = 0; b < p; b++)
              v[b] ^= 1549556828, d[b] ^= 909522486;
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
            var x = this._hasher, p = x.finalize(o);
            x.reset();
            var a = x.finalize(this._oKey.clone().concat(p));
            return a;
          }
        });
      })();
    });
  })($0)), $0.exports;
}
var U0 = { exports: {} }, Lt = U0.exports, Xe;
function It() {
  return Xe || (Xe = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), pe(), Ae());
    })(Lt, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.Base, D = c.WordArray, h = r.algo, C = h.SHA256, o = h.HMAC, x = h.PBKDF2 = A.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: A.extend({
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
          init: function(p) {
            this.cfg = this.cfg.extend(p);
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
          compute: function(p, a) {
            for (var l = this.cfg, u = o.create(l.hasher, p), v = D.create(), d = D.create([1]), b = v.words, s = d.words, f = l.keySize, i = l.iterations; b.length < f; ) {
              var F = u.update(a).finalize(d);
              u.reset();
              for (var g = F.words, B = g.length, y = F, S = 1; S < i; S++) {
                y = u.finalize(y), u.reset();
                for (var E = y.words, m = 0; m < B; m++)
                  g[m] ^= E[m];
              }
              v.concat(F), s[0]++;
            }
            return v.sigBytes = f * 4, v;
          }
        });
        r.PBKDF2 = function(p, a, l) {
          return x.create(l).compute(p, a);
        };
      })(), n.PBKDF2;
    });
  })(U0)), U0.exports;
}
var O0 = { exports: {} }, $t = O0.exports, Ze;
function n0() {
  return Ze || (Ze = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), _r(), Ae());
    })($t, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.Base, D = c.WordArray, h = r.algo, C = h.MD5, o = h.EvpKDF = A.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: A.extend({
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
          init: function(x) {
            this.cfg = this.cfg.extend(x);
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
          compute: function(x, p) {
            for (var a, l = this.cfg, u = l.hasher.create(), v = D.create(), d = v.words, b = l.keySize, s = l.iterations; d.length < b; ) {
              a && u.update(a), a = u.update(x).finalize(p), u.reset();
              for (var f = 1; f < s; f++)
                a = u.finalize(a), u.reset();
              v.concat(a);
            }
            return v.sigBytes = b * 4, v;
          }
        });
        r.EvpKDF = function(x, p, a) {
          return o.create(a).compute(x, p);
        };
      })(), n.EvpKDF;
    });
  })(O0)), O0.exports;
}
var N0 = { exports: {} }, Ut = N0.exports, Qe;
function j() {
  return Qe || (Qe = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), n0());
    })(Ut, function(n) {
      n.lib.Cipher || (function(r) {
        var c = n, A = c.lib, D = A.Base, h = A.WordArray, C = A.BufferedBlockAlgorithm, o = c.enc;
        o.Utf8;
        var x = o.Base64, p = c.algo, a = p.EvpKDF, l = A.Cipher = C.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: D.extend(),
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
          createEncryptor: function(E, m) {
            return this.create(this._ENC_XFORM_MODE, E, m);
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
          createDecryptor: function(E, m) {
            return this.create(this._DEC_XFORM_MODE, E, m);
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
          init: function(E, m, _) {
            this.cfg = this.cfg.extend(_), this._xformMode = E, this._key = m, this.reset();
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
          process: function(E) {
            return this._append(E), this._process();
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
          finalize: function(E) {
            E && this._append(E);
            var m = this._doFinalize();
            return m;
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
            function E(m) {
              return typeof m == "string" ? S : g;
            }
            return function(m) {
              return {
                encrypt: function(_, k, L) {
                  return E(k).encrypt(m, _, k, L);
                },
                decrypt: function(_, k, L) {
                  return E(k).decrypt(m, _, k, L);
                }
              };
            };
          })()
        });
        A.StreamCipher = l.extend({
          _doFinalize: function() {
            var E = this._process(!0);
            return E;
          },
          blockSize: 1
        });
        var u = c.mode = {}, v = A.BlockCipherMode = D.extend({
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
          createEncryptor: function(E, m) {
            return this.Encryptor.create(E, m);
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
          createDecryptor: function(E, m) {
            return this.Decryptor.create(E, m);
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
          init: function(E, m) {
            this._cipher = E, this._iv = m;
          }
        }), d = u.CBC = (function() {
          var E = v.extend();
          E.Encryptor = E.extend({
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
            processBlock: function(_, k) {
              var L = this._cipher, z = L.blockSize;
              m.call(this, _, k, z), L.encryptBlock(_, k), this._prevBlock = _.slice(k, k + z);
            }
          }), E.Decryptor = E.extend({
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
            processBlock: function(_, k) {
              var L = this._cipher, z = L.blockSize, T = _.slice(k, k + z);
              L.decryptBlock(_, k), m.call(this, _, k, z), this._prevBlock = T;
            }
          });
          function m(_, k, L) {
            var z, T = this._iv;
            T ? (z = T, this._iv = r) : z = this._prevBlock;
            for (var M = 0; M < L; M++)
              _[k + M] ^= z[M];
          }
          return E;
        })(), b = c.pad = {}, s = b.Pkcs7 = {
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
          pad: function(E, m) {
            for (var _ = m * 4, k = _ - E.sigBytes % _, L = k << 24 | k << 16 | k << 8 | k, z = [], T = 0; T < k; T += 4)
              z.push(L);
            var M = h.create(z, k);
            E.concat(M);
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
          unpad: function(E) {
            var m = E.words[E.sigBytes - 1 >>> 2] & 255;
            E.sigBytes -= m;
          }
        };
        A.BlockCipher = l.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: l.cfg.extend({
            mode: d,
            padding: s
          }),
          reset: function() {
            var E;
            l.reset.call(this);
            var m = this.cfg, _ = m.iv, k = m.mode;
            this._xformMode == this._ENC_XFORM_MODE ? E = k.createEncryptor : (E = k.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == E ? this._mode.init(this, _ && _.words) : (this._mode = E.call(k, this, _ && _.words), this._mode.__creator = E);
          },
          _doProcessBlock: function(E, m) {
            this._mode.processBlock(E, m);
          },
          _doFinalize: function() {
            var E, m = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (m.pad(this._data, this.blockSize), E = this._process(!0)) : (E = this._process(!0), m.unpad(E)), E;
          },
          blockSize: 128 / 32
        });
        var f = A.CipherParams = D.extend({
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
          init: function(E) {
            this.mixIn(E);
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
          toString: function(E) {
            return (E || this.formatter).stringify(this);
          }
        }), i = c.format = {}, F = i.OpenSSL = {
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
          stringify: function(E) {
            var m, _ = E.ciphertext, k = E.salt;
            return k ? m = h.create([1398893684, 1701076831]).concat(k).concat(_) : m = _, m.toString(x);
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
          parse: function(E) {
            var m, _ = x.parse(E), k = _.words;
            return k[0] == 1398893684 && k[1] == 1701076831 && (m = h.create(k.slice(2, 4)), k.splice(0, 4), _.sigBytes -= 16), f.create({ ciphertext: _, salt: m });
          }
        }, g = A.SerializableCipher = D.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: D.extend({
            format: F
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
          encrypt: function(E, m, _, k) {
            k = this.cfg.extend(k);
            var L = E.createEncryptor(_, k), z = L.finalize(m), T = L.cfg;
            return f.create({
              ciphertext: z,
              key: _,
              iv: T.iv,
              algorithm: E,
              mode: T.mode,
              padding: T.padding,
              blockSize: E.blockSize,
              formatter: k.format
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
          decrypt: function(E, m, _, k) {
            k = this.cfg.extend(k), m = this._parse(m, k.format);
            var L = E.createDecryptor(_, k).finalize(m.ciphertext);
            return L;
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
          _parse: function(E, m) {
            return typeof E == "string" ? m.parse(E, this) : E;
          }
        }), B = c.kdf = {}, y = B.OpenSSL = {
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
          execute: function(E, m, _, k, L) {
            if (k || (k = h.random(64 / 8)), L)
              var z = a.create({ keySize: m + _, hasher: L }).compute(E, k);
            else
              var z = a.create({ keySize: m + _ }).compute(E, k);
            var T = h.create(z.words.slice(m), _ * 4);
            return z.sigBytes = m * 4, f.create({ key: z, iv: T, salt: k });
          }
        }, S = A.PasswordBasedCipher = g.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: g.cfg.extend({
            kdf: y
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
          encrypt: function(E, m, _, k) {
            k = this.cfg.extend(k);
            var L = k.kdf.execute(_, E.keySize, E.ivSize, k.salt, k.hasher);
            k.iv = L.iv;
            var z = g.encrypt.call(this, E, m, L.key, k);
            return z.mixIn(L), z;
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
          decrypt: function(E, m, _, k) {
            k = this.cfg.extend(k), m = this._parse(m, k.format);
            var L = k.kdf.execute(_, E.keySize, E.ivSize, m.salt, k.hasher);
            k.iv = L.iv;
            var z = g.decrypt.call(this, E, m, L.key, k);
            return z;
          }
        });
      })();
    });
  })(N0)), N0.exports;
}
var M0 = { exports: {} }, Ot = M0.exports, Je;
function Nt() {
  return Je || (Je = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Ot, function(n) {
      return n.mode.CFB = (function() {
        var r = n.lib.BlockCipherMode.extend();
        r.Encryptor = r.extend({
          processBlock: function(A, D) {
            var h = this._cipher, C = h.blockSize;
            c.call(this, A, D, C, h), this._prevBlock = A.slice(D, D + C);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(A, D) {
            var h = this._cipher, C = h.blockSize, o = A.slice(D, D + C);
            c.call(this, A, D, C, h), this._prevBlock = o;
          }
        });
        function c(A, D, h, C) {
          var o, x = this._iv;
          x ? (o = x.slice(0), this._iv = void 0) : o = this._prevBlock, C.encryptBlock(o, 0);
          for (var p = 0; p < h; p++)
            A[D + p] ^= o[p];
        }
        return r;
      })(), n.mode.CFB;
    });
  })(M0)), M0.exports;
}
var q0 = { exports: {} }, Mt = q0.exports, er;
function qt() {
  return er || (er = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Mt, function(n) {
      return n.mode.CTR = (function() {
        var r = n.lib.BlockCipherMode.extend(), c = r.Encryptor = r.extend({
          processBlock: function(A, D) {
            var h = this._cipher, C = h.blockSize, o = this._iv, x = this._counter;
            o && (x = this._counter = o.slice(0), this._iv = void 0);
            var p = x.slice(0);
            h.encryptBlock(p, 0), x[C - 1] = x[C - 1] + 1 | 0;
            for (var a = 0; a < C; a++)
              A[D + a] ^= p[a];
          }
        });
        return r.Decryptor = c, r;
      })(), n.mode.CTR;
    });
  })(q0)), q0.exports;
}
var W0 = { exports: {} }, Wt = W0.exports, rr;
function Kt() {
  return rr || (rr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Wt, function(n) {
      /** @preserve
       * Counter block mode compatible with  Dr Brian Gladman fileenc.c
       * derived from CryptoJS.mode.CTR
       * Jan Hruby jhruby.web@gmail.com
       */
      return n.mode.CTRGladman = (function() {
        var r = n.lib.BlockCipherMode.extend();
        function c(h) {
          if ((h >> 24 & 255) === 255) {
            var C = h >> 16 & 255, o = h >> 8 & 255, x = h & 255;
            C === 255 ? (C = 0, o === 255 ? (o = 0, x === 255 ? x = 0 : ++x) : ++o) : ++C, h = 0, h += C << 16, h += o << 8, h += x;
          } else
            h += 1 << 24;
          return h;
        }
        function A(h) {
          return (h[0] = c(h[0])) === 0 && (h[1] = c(h[1])), h;
        }
        var D = r.Encryptor = r.extend({
          processBlock: function(h, C) {
            var o = this._cipher, x = o.blockSize, p = this._iv, a = this._counter;
            p && (a = this._counter = p.slice(0), this._iv = void 0), A(a);
            var l = a.slice(0);
            o.encryptBlock(l, 0);
            for (var u = 0; u < x; u++)
              h[C + u] ^= l[u];
          }
        });
        return r.Decryptor = D, r;
      })(), n.mode.CTRGladman;
    });
  })(W0)), W0.exports;
}
var K0 = { exports: {} }, jt = K0.exports, tr;
function Vt() {
  return tr || (tr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(jt, function(n) {
      return n.mode.OFB = (function() {
        var r = n.lib.BlockCipherMode.extend(), c = r.Encryptor = r.extend({
          processBlock: function(A, D) {
            var h = this._cipher, C = h.blockSize, o = this._iv, x = this._keystream;
            o && (x = this._keystream = o.slice(0), this._iv = void 0), h.encryptBlock(x, 0);
            for (var p = 0; p < C; p++)
              A[D + p] ^= x[p];
          }
        });
        return r.Decryptor = c, r;
      })(), n.mode.OFB;
    });
  })(K0)), K0.exports;
}
var j0 = { exports: {} }, Yt = j0.exports, nr;
function Gt() {
  return nr || (nr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Yt, function(n) {
      return n.mode.ECB = (function() {
        var r = n.lib.BlockCipherMode.extend();
        return r.Encryptor = r.extend({
          processBlock: function(c, A) {
            this._cipher.encryptBlock(c, A);
          }
        }), r.Decryptor = r.extend({
          processBlock: function(c, A) {
            this._cipher.decryptBlock(c, A);
          }
        }), r;
      })(), n.mode.ECB;
    });
  })(j0)), j0.exports;
}
var V0 = { exports: {} }, Xt = V0.exports, or;
function Zt() {
  return or || (or = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Xt, function(n) {
      return n.pad.AnsiX923 = {
        pad: function(r, c) {
          var A = r.sigBytes, D = c * 4, h = D - A % D, C = A + h - 1;
          r.clamp(), r.words[C >>> 2] |= h << 24 - C % 4 * 8, r.sigBytes += h;
        },
        unpad: function(r) {
          var c = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= c;
        }
      }, n.pad.Ansix923;
    });
  })(V0)), V0.exports;
}
var Y0 = { exports: {} }, Qt = Y0.exports, ir;
function Jt() {
  return ir || (ir = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(Qt, function(n) {
      return n.pad.Iso10126 = {
        pad: function(r, c) {
          var A = c * 4, D = A - r.sigBytes % A;
          r.concat(n.lib.WordArray.random(D - 1)).concat(n.lib.WordArray.create([D << 24], 1));
        },
        unpad: function(r) {
          var c = r.words[r.sigBytes - 1 >>> 2] & 255;
          r.sigBytes -= c;
        }
      }, n.pad.Iso10126;
    });
  })(Y0)), Y0.exports;
}
var G0 = { exports: {} }, en = G0.exports, ar;
function rn() {
  return ar || (ar = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(en, function(n) {
      return n.pad.Iso97971 = {
        pad: function(r, c) {
          r.concat(n.lib.WordArray.create([2147483648], 1)), n.pad.ZeroPadding.pad(r, c);
        },
        unpad: function(r) {
          n.pad.ZeroPadding.unpad(r), r.sigBytes--;
        }
      }, n.pad.Iso97971;
    });
  })(G0)), G0.exports;
}
var X0 = { exports: {} }, tn = X0.exports, xr;
function nn() {
  return xr || (xr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(tn, function(n) {
      return n.pad.ZeroPadding = {
        pad: function(r, c) {
          var A = c * 4;
          r.clamp(), r.sigBytes += A - (r.sigBytes % A || A);
        },
        unpad: function(r) {
          for (var c = r.words, A = r.sigBytes - 1, A = r.sigBytes - 1; A >= 0; A--)
            if (c[A >>> 2] >>> 24 - A % 4 * 8 & 255) {
              r.sigBytes = A + 1;
              break;
            }
        }
      }, n.pad.ZeroPadding;
    });
  })(X0)), X0.exports;
}
var Z0 = { exports: {} }, on = Z0.exports, sr;
function an() {
  return sr || (sr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(on, function(n) {
      return n.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      }, n.pad.NoPadding;
    });
  })(Z0)), Z0.exports;
}
var Q0 = { exports: {} }, xn = Q0.exports, cr;
function sn() {
  return cr || (cr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), j());
    })(xn, function(n) {
      return (function(r) {
        var c = n, A = c.lib, D = A.CipherParams, h = c.enc, C = h.Hex, o = c.format;
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
          stringify: function(x) {
            return x.ciphertext.toString(C);
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
          parse: function(x) {
            var p = C.parse(x);
            return D.create({ ciphertext: p });
          }
        };
      })(), n.format.Hex;
    });
  })(Q0)), Q0.exports;
}
var J0 = { exports: {} }, cn = J0.exports, fr;
function fn() {
  return fr || (fr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(cn, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.BlockCipher, D = r.algo, h = [], C = [], o = [], x = [], p = [], a = [], l = [], u = [], v = [], d = [];
        (function() {
          for (var f = [], i = 0; i < 256; i++)
            i < 128 ? f[i] = i << 1 : f[i] = i << 1 ^ 283;
          for (var F = 0, g = 0, i = 0; i < 256; i++) {
            var B = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4;
            B = B >>> 8 ^ B & 255 ^ 99, h[F] = B, C[B] = F;
            var y = f[F], S = f[y], E = f[S], m = f[B] * 257 ^ B * 16843008;
            o[F] = m << 24 | m >>> 8, x[F] = m << 16 | m >>> 16, p[F] = m << 8 | m >>> 24, a[F] = m;
            var m = E * 16843009 ^ S * 65537 ^ y * 257 ^ F * 16843008;
            l[B] = m << 24 | m >>> 8, u[B] = m << 16 | m >>> 16, v[B] = m << 8 | m >>> 24, d[B] = m, F ? (F = y ^ f[f[f[E ^ y]]], g ^= f[f[g]]) : F = g = 1;
          }
        })();
        var b = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], s = D.AES = A.extend({
          _doReset: function() {
            var f;
            if (!(this._nRounds && this._keyPriorReset === this._key)) {
              for (var i = this._keyPriorReset = this._key, F = i.words, g = i.sigBytes / 4, B = this._nRounds = g + 6, y = (B + 1) * 4, S = this._keySchedule = [], E = 0; E < y; E++)
                E < g ? S[E] = F[E] : (f = S[E - 1], E % g ? g > 6 && E % g == 4 && (f = h[f >>> 24] << 24 | h[f >>> 16 & 255] << 16 | h[f >>> 8 & 255] << 8 | h[f & 255]) : (f = f << 8 | f >>> 24, f = h[f >>> 24] << 24 | h[f >>> 16 & 255] << 16 | h[f >>> 8 & 255] << 8 | h[f & 255], f ^= b[E / g | 0] << 24), S[E] = S[E - g] ^ f);
              for (var m = this._invKeySchedule = [], _ = 0; _ < y; _++) {
                var E = y - _;
                if (_ % 4)
                  var f = S[E];
                else
                  var f = S[E - 4];
                _ < 4 || E <= 4 ? m[_] = f : m[_] = l[h[f >>> 24]] ^ u[h[f >>> 16 & 255]] ^ v[h[f >>> 8 & 255]] ^ d[h[f & 255]];
              }
            }
          },
          encryptBlock: function(f, i) {
            this._doCryptBlock(f, i, this._keySchedule, o, x, p, a, h);
          },
          decryptBlock: function(f, i) {
            var F = f[i + 1];
            f[i + 1] = f[i + 3], f[i + 3] = F, this._doCryptBlock(f, i, this._invKeySchedule, l, u, v, d, C);
            var F = f[i + 1];
            f[i + 1] = f[i + 3], f[i + 3] = F;
          },
          _doCryptBlock: function(f, i, F, g, B, y, S, E) {
            for (var m = this._nRounds, _ = f[i] ^ F[0], k = f[i + 1] ^ F[1], L = f[i + 2] ^ F[2], z = f[i + 3] ^ F[3], T = 4, M = 1; M < m; M++) {
              var O = g[_ >>> 24] ^ B[k >>> 16 & 255] ^ y[L >>> 8 & 255] ^ S[z & 255] ^ F[T++], N = g[k >>> 24] ^ B[L >>> 16 & 255] ^ y[z >>> 8 & 255] ^ S[_ & 255] ^ F[T++], q = g[L >>> 24] ^ B[z >>> 16 & 255] ^ y[_ >>> 8 & 255] ^ S[k & 255] ^ F[T++], w = g[z >>> 24] ^ B[_ >>> 16 & 255] ^ y[k >>> 8 & 255] ^ S[L & 255] ^ F[T++];
              _ = O, k = N, L = q, z = w;
            }
            var O = (E[_ >>> 24] << 24 | E[k >>> 16 & 255] << 16 | E[L >>> 8 & 255] << 8 | E[z & 255]) ^ F[T++], N = (E[k >>> 24] << 24 | E[L >>> 16 & 255] << 16 | E[z >>> 8 & 255] << 8 | E[_ & 255]) ^ F[T++], q = (E[L >>> 24] << 24 | E[z >>> 16 & 255] << 16 | E[_ >>> 8 & 255] << 8 | E[k & 255]) ^ F[T++], w = (E[z >>> 24] << 24 | E[_ >>> 16 & 255] << 16 | E[k >>> 8 & 255] << 8 | E[L & 255]) ^ F[T++];
            f[i] = O, f[i + 1] = N, f[i + 2] = q, f[i + 3] = w;
          },
          keySize: 256 / 32
        });
        r.AES = A._createHelper(s);
      })(), n.AES;
    });
  })(J0)), J0.exports;
}
var ee = { exports: {} }, un = ee.exports, ur;
function dn() {
  return ur || (ur = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(un, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.WordArray, D = c.BlockCipher, h = r.algo, C = [
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
        ], x = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], p = [
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
        ], l = h.DES = D.extend({
          _doReset: function() {
            for (var b = this._key, s = b.words, f = [], i = 0; i < 56; i++) {
              var F = C[i] - 1;
              f[i] = s[F >>> 5] >>> 31 - F % 32 & 1;
            }
            for (var g = this._subKeys = [], B = 0; B < 16; B++) {
              for (var y = g[B] = [], S = x[B], i = 0; i < 24; i++)
                y[i / 6 | 0] |= f[(o[i] - 1 + S) % 28] << 31 - i % 6, y[4 + (i / 6 | 0)] |= f[28 + (o[i + 24] - 1 + S) % 28] << 31 - i % 6;
              y[0] = y[0] << 1 | y[0] >>> 31;
              for (var i = 1; i < 7; i++)
                y[i] = y[i] >>> (i - 1) * 4 + 3;
              y[7] = y[7] << 5 | y[7] >>> 27;
            }
            for (var E = this._invSubKeys = [], i = 0; i < 16; i++)
              E[i] = g[15 - i];
          },
          encryptBlock: function(b, s) {
            this._doCryptBlock(b, s, this._subKeys);
          },
          decryptBlock: function(b, s) {
            this._doCryptBlock(b, s, this._invSubKeys);
          },
          _doCryptBlock: function(b, s, f) {
            this._lBlock = b[s], this._rBlock = b[s + 1], u.call(this, 4, 252645135), u.call(this, 16, 65535), v.call(this, 2, 858993459), v.call(this, 8, 16711935), u.call(this, 1, 1431655765);
            for (var i = 0; i < 16; i++) {
              for (var F = f[i], g = this._lBlock, B = this._rBlock, y = 0, S = 0; S < 8; S++)
                y |= p[S][((B ^ F[S]) & a[S]) >>> 0];
              this._lBlock = B, this._rBlock = g ^ y;
            }
            var E = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = E, u.call(this, 1, 1431655765), v.call(this, 8, 16711935), v.call(this, 2, 858993459), u.call(this, 16, 65535), u.call(this, 4, 252645135), b[s] = this._lBlock, b[s + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function u(b, s) {
          var f = (this._lBlock >>> b ^ this._rBlock) & s;
          this._rBlock ^= f, this._lBlock ^= f << b;
        }
        function v(b, s) {
          var f = (this._rBlock >>> b ^ this._lBlock) & s;
          this._lBlock ^= f, this._rBlock ^= f << b;
        }
        r.DES = D._createHelper(l);
        var d = h.TripleDES = D.extend({
          _doReset: function() {
            var b = this._key, s = b.words;
            if (s.length !== 2 && s.length !== 4 && s.length < 6)
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            var f = s.slice(0, 2), i = s.length < 4 ? s.slice(0, 2) : s.slice(2, 4), F = s.length < 6 ? s.slice(0, 2) : s.slice(4, 6);
            this._des1 = l.createEncryptor(A.create(f)), this._des2 = l.createEncryptor(A.create(i)), this._des3 = l.createEncryptor(A.create(F));
          },
          encryptBlock: function(b, s) {
            this._des1.encryptBlock(b, s), this._des2.decryptBlock(b, s), this._des3.encryptBlock(b, s);
          },
          decryptBlock: function(b, s) {
            this._des3.decryptBlock(b, s), this._des2.encryptBlock(b, s), this._des1.decryptBlock(b, s);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        r.TripleDES = D._createHelper(d);
      })(), n.TripleDES;
    });
  })(ee)), ee.exports;
}
var re = { exports: {} }, ln = re.exports, dr;
function hn() {
  return dr || (dr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(ln, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.StreamCipher, D = r.algo, h = D.RC4 = A.extend({
          _doReset: function() {
            for (var x = this._key, p = x.words, a = x.sigBytes, l = this._S = [], u = 0; u < 256; u++)
              l[u] = u;
            for (var u = 0, v = 0; u < 256; u++) {
              var d = u % a, b = p[d >>> 2] >>> 24 - d % 4 * 8 & 255;
              v = (v + l[u] + b) % 256;
              var s = l[u];
              l[u] = l[v], l[v] = s;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(x, p) {
            x[p] ^= C.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function C() {
          for (var x = this._S, p = this._i, a = this._j, l = 0, u = 0; u < 4; u++) {
            p = (p + 1) % 256, a = (a + x[p]) % 256;
            var v = x[p];
            x[p] = x[a], x[a] = v, l |= x[(x[p] + x[a]) % 256] << 24 - u * 8;
          }
          return this._i = p, this._j = a, l;
        }
        r.RC4 = A._createHelper(h);
        var o = D.RC4Drop = h.extend({
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
            for (var x = this.cfg.drop; x > 0; x--)
              C.call(this);
          }
        });
        r.RC4Drop = A._createHelper(o);
      })(), n.RC4;
    });
  })(re)), re.exports;
}
var te = { exports: {} }, vn = te.exports, lr;
function pn() {
  return lr || (lr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(vn, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.StreamCipher, D = r.algo, h = [], C = [], o = [], x = D.Rabbit = A.extend({
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
              p.call(this);
            for (var u = 0; u < 8; u++)
              d[u] ^= v[u + 4 & 7];
            if (l) {
              var b = l.words, s = b[0], f = b[1], i = (s << 8 | s >>> 24) & 16711935 | (s << 24 | s >>> 8) & 4278255360, F = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, g = i >>> 16 | F & 4294901760, B = F << 16 | i & 65535;
              d[0] ^= i, d[1] ^= g, d[2] ^= F, d[3] ^= B, d[4] ^= i, d[5] ^= g, d[6] ^= F, d[7] ^= B;
              for (var u = 0; u < 4; u++)
                p.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            p.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var v = 0; v < 4; v++)
              h[v] = (h[v] << 8 | h[v] >>> 24) & 16711935 | (h[v] << 24 | h[v] >>> 8) & 4278255360, a[l + v] ^= h[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function p() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            C[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < C[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < C[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < C[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < C[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < C[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < C[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < C[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < C[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var v = a[u] + l[u], d = v & 65535, b = v >>> 16, s = ((d * d >>> 17) + d * b >>> 15) + b * b, f = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            o[u] = s ^ f;
          }
          a[0] = o[0] + (o[7] << 16 | o[7] >>> 16) + (o[6] << 16 | o[6] >>> 16) | 0, a[1] = o[1] + (o[0] << 8 | o[0] >>> 24) + o[7] | 0, a[2] = o[2] + (o[1] << 16 | o[1] >>> 16) + (o[0] << 16 | o[0] >>> 16) | 0, a[3] = o[3] + (o[2] << 8 | o[2] >>> 24) + o[1] | 0, a[4] = o[4] + (o[3] << 16 | o[3] >>> 16) + (o[2] << 16 | o[2] >>> 16) | 0, a[5] = o[5] + (o[4] << 8 | o[4] >>> 24) + o[3] | 0, a[6] = o[6] + (o[5] << 16 | o[5] >>> 16) + (o[4] << 16 | o[4] >>> 16) | 0, a[7] = o[7] + (o[6] << 8 | o[6] >>> 24) + o[5] | 0;
        }
        r.Rabbit = A._createHelper(x);
      })(), n.Rabbit;
    });
  })(te)), te.exports;
}
var ne = { exports: {} }, An = ne.exports, hr;
function Cn() {
  return hr || (hr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(An, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.StreamCipher, D = r.algo, h = [], C = [], o = [], x = D.RabbitLegacy = A.extend({
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
              p.call(this);
            for (var d = 0; d < 8; d++)
              v[d] ^= u[d + 4 & 7];
            if (l) {
              var b = l.words, s = b[0], f = b[1], i = (s << 8 | s >>> 24) & 16711935 | (s << 24 | s >>> 8) & 4278255360, F = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360, g = i >>> 16 | F & 4294901760, B = F << 16 | i & 65535;
              v[0] ^= i, v[1] ^= g, v[2] ^= F, v[3] ^= B, v[4] ^= i, v[5] ^= g, v[6] ^= F, v[7] ^= B;
              for (var d = 0; d < 4; d++)
                p.call(this);
            }
          },
          _doProcessBlock: function(a, l) {
            var u = this._X;
            p.call(this), h[0] = u[0] ^ u[5] >>> 16 ^ u[3] << 16, h[1] = u[2] ^ u[7] >>> 16 ^ u[5] << 16, h[2] = u[4] ^ u[1] >>> 16 ^ u[7] << 16, h[3] = u[6] ^ u[3] >>> 16 ^ u[1] << 16;
            for (var v = 0; v < 4; v++)
              h[v] = (h[v] << 8 | h[v] >>> 24) & 16711935 | (h[v] << 24 | h[v] >>> 8) & 4278255360, a[l + v] ^= h[v];
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function p() {
          for (var a = this._X, l = this._C, u = 0; u < 8; u++)
            C[u] = l[u];
          l[0] = l[0] + 1295307597 + this._b | 0, l[1] = l[1] + 3545052371 + (l[0] >>> 0 < C[0] >>> 0 ? 1 : 0) | 0, l[2] = l[2] + 886263092 + (l[1] >>> 0 < C[1] >>> 0 ? 1 : 0) | 0, l[3] = l[3] + 1295307597 + (l[2] >>> 0 < C[2] >>> 0 ? 1 : 0) | 0, l[4] = l[4] + 3545052371 + (l[3] >>> 0 < C[3] >>> 0 ? 1 : 0) | 0, l[5] = l[5] + 886263092 + (l[4] >>> 0 < C[4] >>> 0 ? 1 : 0) | 0, l[6] = l[6] + 1295307597 + (l[5] >>> 0 < C[5] >>> 0 ? 1 : 0) | 0, l[7] = l[7] + 3545052371 + (l[6] >>> 0 < C[6] >>> 0 ? 1 : 0) | 0, this._b = l[7] >>> 0 < C[7] >>> 0 ? 1 : 0;
          for (var u = 0; u < 8; u++) {
            var v = a[u] + l[u], d = v & 65535, b = v >>> 16, s = ((d * d >>> 17) + d * b >>> 15) + b * b, f = ((v & 4294901760) * v | 0) + ((v & 65535) * v | 0);
            o[u] = s ^ f;
          }
          a[0] = o[0] + (o[7] << 16 | o[7] >>> 16) + (o[6] << 16 | o[6] >>> 16) | 0, a[1] = o[1] + (o[0] << 8 | o[0] >>> 24) + o[7] | 0, a[2] = o[2] + (o[1] << 16 | o[1] >>> 16) + (o[0] << 16 | o[0] >>> 16) | 0, a[3] = o[3] + (o[2] << 8 | o[2] >>> 24) + o[1] | 0, a[4] = o[4] + (o[3] << 16 | o[3] >>> 16) + (o[2] << 16 | o[2] >>> 16) | 0, a[5] = o[5] + (o[4] << 8 | o[4] >>> 24) + o[3] | 0, a[6] = o[6] + (o[5] << 16 | o[5] >>> 16) + (o[4] << 16 | o[4] >>> 16) | 0, a[7] = o[7] + (o[6] << 8 | o[6] >>> 24) + o[5] | 0;
        }
        r.RabbitLegacy = A._createHelper(x);
      })(), n.RabbitLegacy;
    });
  })(ne)), ne.exports;
}
var oe = { exports: {} }, En = oe.exports, vr;
function Bn() {
  return vr || (vr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), o0(), i0(), n0(), j());
    })(En, function(n) {
      return (function() {
        var r = n, c = r.lib, A = c.BlockCipher, D = r.algo;
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
        var x = {
          pbox: [],
          sbox: []
        };
        function p(d, b) {
          let s = b >> 24 & 255, f = b >> 16 & 255, i = b >> 8 & 255, F = b & 255, g = d.sbox[0][s] + d.sbox[1][f];
          return g = g ^ d.sbox[2][i], g = g + d.sbox[3][F], g;
        }
        function a(d, b, s) {
          let f = b, i = s, F;
          for (let g = 0; g < h; ++g)
            f = f ^ d.pbox[g], i = p(d, f) ^ i, F = f, f = i, i = F;
          return F = f, f = i, i = F, i = i ^ d.pbox[h], f = f ^ d.pbox[h + 1], { left: f, right: i };
        }
        function l(d, b, s) {
          let f = b, i = s, F;
          for (let g = h + 1; g > 1; --g)
            f = f ^ d.pbox[g], i = p(d, f) ^ i, F = f, f = i, i = F;
          return F = f, f = i, i = F, i = i ^ d.pbox[1], f = f ^ d.pbox[0], { left: f, right: i };
        }
        function u(d, b, s) {
          for (let B = 0; B < 4; B++) {
            d.sbox[B] = [];
            for (let y = 0; y < 256; y++)
              d.sbox[B][y] = o[B][y];
          }
          let f = 0;
          for (let B = 0; B < h + 2; B++)
            d.pbox[B] = C[B] ^ b[f], f++, f >= s && (f = 0);
          let i = 0, F = 0, g = 0;
          for (let B = 0; B < h + 2; B += 2)
            g = a(d, i, F), i = g.left, F = g.right, d.pbox[B] = i, d.pbox[B + 1] = F;
          for (let B = 0; B < 4; B++)
            for (let y = 0; y < 256; y += 2)
              g = a(d, i, F), i = g.left, F = g.right, d.sbox[B][y] = i, d.sbox[B][y + 1] = F;
          return !0;
        }
        var v = D.Blowfish = A.extend({
          _doReset: function() {
            if (this._keyPriorReset !== this._key) {
              var d = this._keyPriorReset = this._key, b = d.words, s = d.sigBytes / 4;
              u(x, b, s);
            }
          },
          encryptBlock: function(d, b) {
            var s = a(x, d[b], d[b + 1]);
            d[b] = s.left, d[b + 1] = s.right;
          },
          decryptBlock: function(d, b) {
            var s = l(x, d[b], d[b + 1]);
            d[b] = s.left, d[b + 1] = s.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        r.Blowfish = A._createHelper(v);
      })(), n.Blowfish;
    });
  })(oe)), oe.exports;
}
var Fn = b0.exports, pr;
function gn() {
  return pr || (pr = 1, (function(e, t) {
    (function(n, r, c) {
      e.exports = r(U(), xe(), At(), Et(), o0(), gt(), i0(), _r(), pe(), _t(), Sr(), kt(), Ht(), Tt(), Ae(), It(), n0(), j(), Nt(), qt(), Kt(), Vt(), Gt(), Zt(), Jt(), rn(), nn(), an(), sn(), fn(), dn(), hn(), pn(), Cn(), Bn());
    })(Fn, function(n) {
      return n;
    });
  })(b0)), b0.exports;
}
var bn = gn();
const Dn = /* @__PURE__ */ st(bn);
function mn() {
  typeof window > "u" || window.CryptoJS || (window.CryptoJS = Dn);
}
class wr extends Error {
  constructor(t, n) {
    super(t), this.methodName = n, this.name = "MobileAuthSdkUnavailableError";
  }
}
function yn() {
  const e = window.YDRZAuthSF;
  if (!e)
    throw new wr("Mobile auth SDK global unavailable: window.YDRZAuthSF");
  return e;
}
function C0(e) {
  const n = yn()[e];
  if (typeof n != "function")
    throw new wr(
      `Mobile auth SDK method unavailable: ${String(e)}`,
      e
    );
  return n;
}
function Ar(e) {
  try {
    return JSON.stringify(
      e,
      (t, n) => typeof n == "function" ? "[Function]" : n,
      2
    );
  } catch (t) {
    return `[unserializable: ${t instanceof Error ? t.message : String(t)}]`;
  }
}
function _n() {
  return {
    showAuthPage(e) {
      Ar(e), C0("showAuthPage")(e);
    },
    initControl(e) {
      Ar(e), C0("initControl")(e);
    },
    clearControl(e) {
      C0("clearControl")(e);
    },
    getAuthResult(e) {
      C0("getAuthResult")(e);
    },
    updateSubmitBtnStatus(e) {
      C0("updateSubmitBtnStatus")(e);
    }
  };
}
const Sn = "0", wn = /* @__PURE__ */ new Set(["0", "1", "3", "4"]);
function kn(e) {
  const t = e?.trim() ?? "";
  return wn.has(t) ? t : Sn;
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
function Rn(e = {}) {
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
function de(e) {
  if (typeof e != "function") {
    if (e === null)
      return null;
    if (Array.isArray(e))
      return e.map(de).filter((t) => t !== void 0);
    if (typeof e == "object") {
      const t = {};
      for (const [n, r] of Object.entries(e)) {
        const c = de(r);
        c !== void 0 && (t[n] = c);
      }
      return t;
    }
    return e;
  }
}
function Hn(e) {
  if (!(!e || typeof e != "object"))
    return de(e);
}
const Pn = "https://ginkgo.chinaums.com", Tn = "/sign-pay-pro/";
function zn(e) {
  const t = e?.trim();
  if (!t || t === "/")
    return Tn;
  const n = /^https?:\/\//i.test(t) ? new URL(t).pathname : t;
  return `${(n.startsWith("/") ? n : `/${n}`).replace(/\/+$/, "")}/`;
}
function Ln(e, t) {
  const n = e?.trim();
  return n ? `${new URL(n).toString().replace(/\/+$/, "")}/` : new URL(t.replace(/^\/+/, ""), `${Pn}/`).toString();
}
const In = "/sign-pay-pro/assist/0.2.5/".trim() || "", $n = zn(In), kr = Ln("https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.5/", $n);
function Un(e) {
  return new URL(e.replace(/^\/+/, ""), kr).toString();
}
const ue = 50, On = ["headerTitle", "idTitle", "phoneTopNotice", "footerNote"], Nn = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, Mn = /^(?:[1-9]\d?(?:\.\d+)?px|(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)rem)$/;
function c0(e) {
  return typeof e == "object" && e !== null;
}
function V(e, t, n) {
  e?.warn?.({ path: t, reason: n });
}
function f0(e, t, n) {
  if (typeof e != "string") {
    V(n, t, "Expected a string.");
    return;
  }
  const r = e.trim();
  if (!r) {
    V(n, t, "Expected a non-empty string.");
    return;
  }
  return r;
}
function Rr(e, t, n) {
  const r = f0(e, t, n);
  if (r) {
    if (!Nn.test(r)) {
      V(n, t, "Expected #RGB or #RRGGBB.");
      return;
    }
    return r;
  }
}
function qn(e, t, n) {
  const r = f0(e, t, n);
  if (r) {
    if (!Mn.test(r)) {
      V(n, t, "Expected a px or rem font size.");
      return;
    }
    return r;
  }
}
function le(e, t, n) {
  const r = f0(e, t, n);
  if (r)
    try {
      const c = new URL(r);
      if (c.protocol !== "http:" && c.protocol !== "https:") {
        V(n, t, "Expected an http or https URL.");
        return;
      }
      return c.toString();
    } catch {
      V(n, t, "Expected a valid URL.");
      return;
    }
}
function Wn(e, t, n) {
  if (typeof e == "number" && Number.isFinite(e) && e > 0)
    return `${e}px`;
  if (typeof e == "string") {
    const r = e.trim(), c = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/.test(r) ? Number(r.slice(0, -2)) : Number.NaN;
    if (Number.isFinite(c) && c > 0)
      return r;
  }
  V(n, t, "Expected a positive px height.");
}
function Kn(e, t, n) {
  if (!c0(e)) {
    V(n, t, "Expected an object.");
    return;
  }
  const r = e.text === void 0 ? void 0 : f0(e.text, `${t}.text`, n), c = e.fontSize === void 0 ? void 0 : qn(e.fontSize, `${t}.fontSize`, n), A = e.color === void 0 ? void 0 : Rr(e.color, `${t}.color`, n);
  let D;
  e.bold !== void 0 && (typeof e.bold == "boolean" ? D = e.bold : V(n, `${t}.bold`, "Expected a boolean."));
  const C = Object.entries({ text: r, fontSize: c, color: A, bold: D }).filter(([, o]) => o !== void 0);
  return C.length ? Object.fromEntries(C) : void 0;
}
function Cr(e, t, n) {
  if (typeof e == "string") {
    const h = le(e, `${t}.url`, n);
    return h ? { url: h } : void 0;
  }
  if (!c0(e)) {
    V(n, t, "Expected a URL string or image object.");
    return;
  }
  const r = le(e.url, `${t}.url`, n);
  if (!r)
    return;
  const c = e.alt === void 0 ? void 0 : f0(e.alt, `${t}.alt`, n), A = e.height === void 0 ? void 0 : Wn(e.height, `${t}.height`, n), D = e.fit === "cover" || e.fit === "contain" ? e.fit : void 0;
  return e.fit !== void 0 && D === void 0 && V(n, `${t}.fit`, "Expected cover or contain."), {
    url: r,
    ...c ? { alt: c } : {},
    ...A ? { height: A } : {},
    ...D ? { fit: D } : {}
  };
}
function jn(e, t, n) {
  const r = `agreements[${t}]`;
  if (!c0(e)) {
    V(n, r, "Expected an object.");
    return;
  }
  const c = f0(e.title, `${r}.title`, n), A = le(e.url, `${r}.url`, n);
  return c && A ? { title: c, url: A } : void 0;
}
function Hr(e, t = {}) {
  if (e == null)
    return {};
  if (!c0(e))
    return V(t, "ui", "Expected an object."), {};
  const n = e.themeColor === void 0 ? void 0 : Rr(e.themeColor, "themeColor", t), r = {};
  if (e.texts !== void 0)
    if (c0(e.texts)) {
      const D = e.texts;
      On.forEach((h) => {
        if (h in D) {
          const C = Kn(D[h], `texts.${h}`, t);
          C && (r[h] = C);
        }
      });
    } else
      V(t, "texts", "Expected an object.");
  const c = {};
  if (e.images !== void 0)
    if (c0(e.images)) {
      const D = e.images.top === void 0 ? void 0 : Cr(e.images.top, "images.top", t), h = e.images.bottom === void 0 ? void 0 : Cr(e.images.bottom, "images.bottom", t);
      D && (c.top = D), h && (c.bottom = h);
    } else
      V(t, "images", "Expected an object.");
  let A;
  if (e.agreements !== void 0)
    if (Array.isArray(e.agreements)) {
      const D = e.agreements.map((h, C) => jn(h, C, t)).filter((h) => h !== void 0);
      A = D.slice(0, ue), D.length > ue && V(t, "agreements", `Only the first ${ue} valid agreements are used.`);
    } else
      V(t, "agreements", "Expected an array.");
  return {
    ...n ? { themeColor: n } : {},
    ...Object.keys(r).length ? { texts: r } : {},
    ...Object.keys(c).length ? { images: c } : {},
    ...A && A.length ? { agreements: A } : {}
  };
}
function Vn(e) {
  return !!(e.themeColor || e.texts && Object.keys(e.texts).length > 0 || e.images && Object.keys(e.images).length > 0 || e.agreements && e.agreements.length > 0);
}
function Yn(e) {
  `${e.path}${e.reason}`;
}
const Pr = "assistance-mobile-auth", Tr = "ASSISTANCE_AUTH_READY", zr = "ASSISTANCE_AUTH_PRESENTATION_READY", Lr = "ASSISTANCE_AUTH_SUCCESS", Ir = "ASSISTANCE_AUTH_CANCEL", $r = "ASSISTANCE_AUTH_ERROR", Ur = "ASSISTANCE_AUTH_ERROR_NOTICE", Ce = "ASSISTANCE_AUTH_CONFIG", Or = "ASSISTANCE_AUTH_PHONE_READY", Ee = "ASSISTANCE_AUTH_RESIZE", Be = "ASSISTANCE_AUTH_CLOSE", Nr = "ASSISTANCE_AUTH_PROBE_RESULT", ae = "ASSISTANCE_AUTH_STATE_CHANGE", Mr = "ASSISTANCE_AUTH_STYLE", Gn = {
  closable: !0,
  useCustomKeyboard: !0,
  heightMode: "auto"
};
function Xn(e, t = Gn) {
  return Y(e) ? {
    closable: typeof e.closable == "boolean" ? e.closable : t.closable,
    useCustomKeyboard: typeof e.useCustomKeyboard == "boolean" ? e.useCustomKeyboard : t.useCustomKeyboard,
    heightMode: e.heightMode === "auto" || e.heightMode === "fixed" ? e.heightMode : t.heightMode
  } : { ...t };
}
function Y(e) {
  return typeof e == "object" && e !== null;
}
function Zn(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function Qn(e) {
  return e === Tr || e === zr || e === Lr || e === Ir || e === $r || e === Ur || e === Ce || e === Or || e === Ee || e === Be || e === Nr || e === ae || e === Mr;
}
function Er() {
  return `assistance-auth-${typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
function Jn(e) {
  if (typeof e != "string" || !e.trim())
    return null;
  try {
    const t = new URL(e.trim());
    return t.protocol !== "http:" && t.protocol !== "https:" || t.username || t.password || t.pathname !== "/" || t.search || t.hash || t.origin === "null" ? null : t.origin;
  } catch {
    return null;
  }
}
function eo(e) {
  if (!(typeof e != "string" || !e.trim()))
    try {
      const t = new URL(e.trim());
      return t.protocol !== "http:" && t.protocol !== "https:" ? void 0 : t.toString();
    } catch {
      return;
    }
}
function Br(e) {
  if (!e || typeof e != "object")
    return null;
  const t = e, n = typeof t.src == "string" ? t.src.trim() : "";
  if (!n)
    return null;
  const r = { src: n };
  return typeof t.width == "string" && t.width.trim() && (r.width = t.width.trim()), typeof t.height == "string" && t.height.trim() && (r.height = t.height.trim()), r;
}
function Fr({
  sessionId: e,
  request: t,
  verificationUrl: n,
  pageImages: r,
  mode: c,
  layout: A,
  debugVConsole: D,
  expectsUiConfig: h,
  appId: C,
  parentOrigin: o
}) {
  const x = n ?? Un("verification"), p = new URL(x, typeof window < "u" ? window.location.href : "http://localhost");
  p.searchParams.set("assistanceAuthSessionId", e), C && p.searchParams.set("appId", C), h && p.searchParams.set("expectsUiConfig", "1"), c === "probe" && p.searchParams.set("mode", "probe"), A === "inline" && p.searchParams.set("layout", "inline"), D && p.searchParams.set("debugVConsole", "1");
  const a = Jn(o);
  c !== "probe" && a && p.searchParams.set("assistanceAuthParentOrigin", a), t?.scene && p.searchParams.set("scene", t.scene), t?.requestId && p.searchParams.set("requestId", t.requestId);
  const l = Br(r?.top);
  l && p.searchParams.set("topImage", JSON.stringify(l));
  const u = Br(r?.bottom);
  if (u && p.searchParams.set("bottomImage", JSON.stringify(u)), typeof window < "u") {
    const d = new URLSearchParams(window.location.search).get("flow");
    d && c !== "probe" && p.searchParams.set("flow", d);
  }
  return p.toString();
}
function he(e, t, n) {
  return {
    source: Pr,
    type: e,
    sessionId: t,
    payload: n
  };
}
function ro(e, t) {
  return Y(e) && e.source === Pr && Qn(e.type) && typeof e.sessionId == "string" && (!t || e.sessionId === t);
}
function qr(e) {
  return Y(e) && typeof e.message == "string" ? {
    code: typeof e.code == "string" ? e.code : void 0,
    message: e.message
  } : { message: "验证失败，请稍后重试。" };
}
function to(e) {
  const t = qr(e);
  return Y(e) ? {
    ...t,
    phase: e.phase === "resourceLoad" || e.phase === "showAuthPage" || e.phase === "initControl" ? e.phase : void 0,
    carrier: typeof e.carrier == "string" ? e.carrier : void 0
  } : t;
}
function no(e) {
  return Y(e) && Y(e.ui) ? { ui: Hr(e.ui) } : { ui: {} };
}
function oo(e, t) {
  return he(Ce, e, { ui: t });
}
const io = /1\d{2}\*{4}\d{4}/, ao = /1\d{10}/;
function xo(e) {
  return e.replace(/\s+/g, " ").trim();
}
function so(e) {
  if (!Y(e) || e.source !== "ydrzPhoneControl")
    return null;
  const n = (typeof e.maskedMobile == "string" ? e.maskedMobile.trim() : "").match(io)?.[0];
  if (!n)
    return null;
  let r = n;
  if (typeof e.rawText == "string") {
    const c = xo(e.rawText);
    if (!c.includes(n) || ao.test(c))
      return null;
    r = c;
  }
  return {
    maskedMobile: n,
    rawText: r,
    source: "ydrzPhoneControl"
  };
}
function co(e) {
  return !Y(e) || !Zn(e.height) ? null : {
    height: Math.ceil(e.height),
    ...typeof e.keyboardFocused == "boolean" ? { keyboardFocused: e.keyboardFocused } : {}
  };
}
function fo(e) {
  if (!Y(e) || e.status !== "success")
    return null;
  const t = typeof e.token == "string" ? e.token : "", n = typeof e.idLast4 == "string" ? e.idLast4 : "", r = typeof e.keyA == "string" ? e.keyA : "";
  return !t.trim() || !n.trim() || !r.trim() ? null : {
    status: "success",
    token: t,
    idLast4: n,
    keyA: r,
    requestId: typeof e.requestId == "string" ? e.requestId : void 0,
    message: typeof e.message == "string" ? e.message : void 0,
    mock: typeof e.mock == "boolean" ? e.mock : void 0
  };
}
const uo = ["ok", "wifi", "non-mobile", "ambiguous", "unknown"];
function lo(e) {
  const t = {};
  for (const n of ["YD", "CT", "CU"])
    typeof e[n] == "string" && (t[n] = e[n]);
  return Object.keys(t).length > 0 ? t : void 0;
}
function ho(e) {
  if (!Y(e))
    return { eligible: !1, reason: "unknown" };
  const t = uo.includes(e.reason) ? e.reason : "unknown";
  let n;
  if (Y(e.raw)) {
    const r = Y(e.raw.carriers) ? lo(e.raw.carriers) : void 0, c = e.raw.networkType, A = c === "wifi" || c === "cellular" || c === "unknown" ? c : void 0, D = {
      ...typeof e.raw.code == "string" ? { code: e.raw.code } : {},
      ...typeof e.raw.carrier == "string" ? { carrier: e.raw.carrier } : {},
      ...r ? { carriers: r } : {},
      ...A ? { networkType: A } : {}
    };
    Object.keys(D).length > 0 && (n = D);
  }
  return { eligible: t === "ok", reason: t, ...n ? { raw: n } : {} };
}
function vo(e) {
  return !Y(e) || !Y(e.event) ? null : e.event.type === "idLast4Complete" ? { type: "idLast4Complete" } : e.event.type === "idLast4Incomplete" ? { type: "idLast4Incomplete" } : null;
}
function gr(e, t, n, r, c) {
  const A = (D) => {
    if (!(r && D.origin !== r) && ro(D.data, t) && !(c && "expectedSource" in c && (!c.expectedSourceTypes || c.expectedSourceTypes.includes(D.data.type)) && D.source !== c.expectedSource))
      switch (D.data.type) {
        case Tr:
          n.onReady?.();
          break;
        case zr:
          n.onPresentationReady?.();
          break;
        case Lr:
          {
            const h = fo(D.data.payload);
            if (!h) {
              n.onError?.({
                code: "INVALID_SUCCESS_PAYLOAD",
                message: "验证结果返回异常，请稍后重试。"
              });
              break;
            }
            n.onSuccess?.(h);
          }
          break;
        case Ir:
          n.onCancel?.(D.data.payload);
          break;
        case $r:
          n.onError?.(qr(D.data.payload));
          break;
        case Ur:
          n.onErrorNotice?.(to(D.data.payload));
          break;
        case Ce:
          n.onConfig?.(no(D.data.payload));
          break;
        case Or:
          {
            const h = so(D.data.payload);
            h && n.onPhoneReady?.(h);
          }
          break;
        case Ee:
          {
            const h = co(D.data.payload);
            h && n.onResize?.(h);
          }
          break;
        case Be:
          n.onClose?.();
          break;
        case Nr:
          n.onProbeResult?.(ho(D.data.payload));
          break;
        case ae:
          {
            const h = vo(D.data.payload);
            h && n.onStateChange?.(h);
          }
          break;
      }
  };
  return e.addEventListener("message", A), () => e.removeEventListener("message", A);
}
const po = 12, Ao = 1, Co = 500;
function ie(e) {
  return Number.isFinite(e);
}
function Eo(e) {
  return ie(e) && e >= 0;
}
function Bo({
  targetWindow: e,
  frame: t,
  positioningLayer: n
}) {
  let r = "idle", c = 0, A = !1, D = 0, h, C, o = !1, x = !1, p;
  const a = () => {
    const B = e.visualViewport;
    return {
      top: B?.offsetTop ?? 0,
      height: B?.height ?? e.innerHeight
    };
  }, l = a().height, u = () => {
    h !== void 0 && (e.cancelAnimationFrame(h), h = void 0);
  }, v = () => {
    C !== void 0 && (e.clearTimeout(C), C = void 0);
  }, d = () => {
    D = 0, n.style.transform = "", delete t.dataset.assistanceAuthKeyboardConstrained, A && (t.style.height = `${c}px`);
  }, b = () => {
    const B = e.visualViewport ?? void 0;
    p !== B && (p?.removeEventListener("resize", F), p?.removeEventListener("scroll", F), p = B, o && (p?.addEventListener("resize", F), p?.addEventListener("scroll", F)));
  }, s = () => {
    o && (o = !1, e.removeEventListener("resize", F), p?.removeEventListener("resize", F), p?.removeEventListener("scroll", F), p = void 0);
  }, f = () => {
    r = "idle", u(), v(), s(), d();
  }, i = () => {
    if (h = void 0, x)
      return;
    if (b(), r === "idle") {
      d();
      return;
    }
    const B = a(), y = B.top + B.height, S = n.getBoundingClientRect();
    if (!ie(B.top) || !ie(B.height) || B.height <= 0 || !ie(S.bottom))
      return;
    const E = Math.max(
      1,
      Math.floor(B.height - po)
    ), m = Math.min(c, E);
    t.style.height = `${m}px`, m < c ? t.dataset.assistanceAuthKeyboardConstrained = "true" : delete t.dataset.assistanceAuthKeyboardConstrained;
    const _ = S.bottom + D;
    D = Math.max(0, Math.ceil(_ - y)), n.style.transform = D > 0 ? `translate3d(0, -${D}px, 0)` : "", r === "closing" && B.height >= l - Ao && f();
  };
  function F() {
    x || (b(), h === void 0 && (h = e.requestAnimationFrame(i)));
  }
  const g = () => {
    o || (o = !0, e.addEventListener("resize", F)), b();
  };
  return {
    update(B) {
      if (!x) {
        if (Eo(B.height) && (c = Math.ceil(B.height), A = !0), B.keyboardFocused === !0) {
          r = "focused", v(), g(), F();
          return;
        }
        if (B.keyboardFocused === !1 && r !== "idle") {
          const y = r !== "closing";
          r = "closing", g(), F(), y && (v(), C = e.setTimeout(
            f,
            Co
          ));
          return;
        }
        r === "idle" ? d() : F();
      }
    },
    dispose() {
      x = !0, u(), v(), s(), d();
    }
  };
}
const Wr = {
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
function Fo(e = Wr) {
  const t = [
    "version",
    "jsUrl",
    "cssUrl",
    "localCssPath",
    "cssSha256",
    "h5CssStrategy",
    "wrapperCssStrategy"
  ];
  for (const n of t)
    if (!e[n].trim())
      throw new Error(`Mobile official JSSDK metadata is missing ${n}`);
}
function go(e = {}) {
  return Wr;
}
const bo = "10037e6f9d903f86019ed8cfb6320365", Do = "8a9481c79c05c8bd019ed8d49fb81df2", Kr = [bo, Do], jr = "8a9481c79c05c8bd019f6f42956924a0", mo = {
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
}, yo = {
  "demo-brand-001": "demo-brand",
  [jr]: "chinaums-sheet-v23",
  ...Object.fromEntries(Kr.map((e) => [e, "chinaums-sheet-v23"]))
}, _o = new Map(
  Object.entries(yo).map(([e, t]) => [
    e,
    { appId: e, ...mo[t] }
  ])
);
function So(e, t) {
  if (typeof t != "string")
    return null;
  const n = t.trim();
  return n ? e.get(n) ?? null : null;
}
function wo(e, t) {
  return typeof e == "string" && e.trim(), So(_o, e);
}
function Vr(e) {
  const t = typeof e == "string" ? e.trim() : "";
  return t === jr && wo(t)?.skin === "chinaumsSheetV23";
}
function E0(e) {
  return typeof e == "string" && Kr.includes(e.trim());
}
function Fe() {
  return go();
}
const ko = "assistance-mobile-auth-official-css", Ro = "assistance-mobile-auth-frame-shell", Ho = "assistance-auth-frame-enter", Po = 280, To = "verification", zo = 12e3, Lo = "8a9481c79c05c8bd019ed8d7ab571df3";
function Io(e) {
  return Vr(e) || E0(e) ? "ginkgo-v23-viewport-modal" : "bottom-sheet";
}
function $o() {
  return !1;
}
function Uo(e, t) {
  return e === Lo && t === "inline";
}
function br(e, t, n) {
  if (e)
    try {
      const r = n ? e(n) : e();
      Promise.resolve(r).catch(() => {
        `${t}`;
      });
    } catch {
    }
}
function Oo(e) {
  return Array.isArray(e) ? e.filter(
    (t) => !!t && typeof t.name == "string" && typeof t.link == "string"
  ) : [];
}
function No(e) {
  if (typeof e != "string")
    return e;
  const t = document.querySelector(e);
  if (!t)
    throw new Error("AssistanceMobileAuth container not found");
  return t;
}
function Mo(e) {
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!(t instanceof HTMLElement))
    throw new Error("AssistanceMobileAuth inline renderTo not found");
  return t;
}
function qo(e) {
  if (!e.isConnected || !document.contains(e))
    throw new Error("AssistanceMobileAuth inline renderTo is no longer connected");
  return e;
}
const Dr = "assistance-mobile-auth-official-jssdk";
function Wo() {
  const e = Fe();
  if (Fo(e), !e.jsUrl.trim())
    throw new Error("Mobile official JSSDK remote jsUrl is missing");
}
function mr() {
  if (typeof window > "u" || typeof document > "u")
    return Promise.reject(new Error("Mobile official JSSDK requires a browser window and document"));
  if (mn(), window.YDRZAuthSF)
    return Promise.resolve();
  const e = Fe().jsUrl, t = document.getElementById(Dr);
  return t instanceof HTMLScriptElement ? t.dataset.assistanceMobileAuthLoaded === "true" && window.YDRZAuthSF ? Promise.resolve() : new Promise((n, r) => {
    t.addEventListener(
      "load",
      () => {
        t.dataset.assistanceMobileAuthLoaded = "true", n();
      },
      { once: !0 }
    ), t.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    );
  }) : new Promise((n, r) => {
    const c = document.createElement("script");
    c.id = Dr, c.async = !0, c.src = e, c.addEventListener(
      "load",
      () => {
        if (c.dataset.assistanceMobileAuthLoaded = "true", !window.YDRZAuthSF) {
          r(new Error("Mobile official JSSDK loaded but did not initialize window.YDRZAuthSF"));
          return;
        }
        n();
      },
      { once: !0 }
    ), c.addEventListener(
      "error",
      () => r(new Error(`Failed to load mobile official JSSDK script: ${e}`)),
      { once: !0 }
    ), document.head.appendChild(c);
  });
}
function Ko(e, t) {
  return `${e ? e.replace(/\/?$/, "/") : ""}vendor/${t}`;
}
function jo(e) {
  const t = document.createElement("div");
  t.id = Ro, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.dataset.assistanceAuthOverlay = "true", t.style.position = "fixed", t.style.inset = "0", t.style.zIndex = "2147483647", t.style.background = "rgba(15,23,42,0)", t.style.display = "flex", t.style.alignItems = "flex-end", t.style.justifyContent = "center", t.style.opacity = "0", t.style.transition = "opacity 220ms ease, background-color 220ms ease", t.style.willChange = "opacity, background-color";
  const n = document.createElement("div");
  return n.dataset.assistanceAuthPositioningLayer = "true", n.style.display = "flex", n.style.width = "100%", n.style.justifyContent = "center", n.style.willChange = "transform", e === "ginkgo-v23-viewport-modal" && (n.dataset.assistanceAuthViewportModal = "true", n.style.position = "fixed", n.style.left = "0", n.style.top = "0", n.style.height = "100vh"), t.appendChild(n), { shell: t, positioningLayer: n };
}
function Vo(e, t) {
  e.style.pointerEvents = "none", e.setAttribute("aria-hidden", "true"), e.inert = !0, e.removeAttribute("role"), e.removeAttribute("aria-modal"), t.setAttribute("aria-hidden", "true"), t.tabIndex = -1;
}
function Yo(e, t) {
  e.style.pointerEvents = "auto", e.removeAttribute("aria-hidden"), e.inert = !1, e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), t.removeAttribute("aria-hidden"), t.removeAttribute("tabindex");
}
function Go(e) {
  const t = e.visualViewport;
  return t && Number.isFinite(t.height) && t.height > 0 && Number.isFinite(t.offsetTop) && t.offsetTop >= 0 ? { height: `${t.height}px`, top: `${t.offsetTop}px` } : Number.isFinite(e.innerHeight) && e.innerHeight > 0 ? { height: `${e.innerHeight}px`, top: "0px" } : { height: typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? "100dvh" : "100vh", top: "0px" };
}
function Xo({
  targetWindow: e,
  frame: t,
  positioningLayer: n
}) {
  let r = !1, c;
  const A = () => {
    if (r)
      return;
    const C = Go(e);
    n.style.top = C.top, n.style.height = C.height, t.style.height = "100%";
  }, D = () => {
    const C = e.visualViewport ?? void 0;
    c !== C && (c?.removeEventListener("resize", A), c?.removeEventListener("scroll", A), c = C, c?.addEventListener("resize", A), c?.addEventListener("scroll", A));
  }, h = () => {
    D(), A();
  };
  return e.addEventListener("resize", h), h(), () => {
    r || (r = !0, e.removeEventListener("resize", h), c?.removeEventListener("resize", A), c?.removeEventListener("scroll", A), c = void 0);
  };
}
function Zo(e) {
  return /iPad|iPhone|iPod/i.test(e.userAgent) || e.platform === "MacIntel" && e.maxTouchPoints > 1;
}
function Qo(e) {
  if (!Zo(window.navigator))
    return !1;
  const t = document.createElement("input");
  t.type = "text", t.inputMode = "text", t.autocomplete = "off", t.tabIndex = -1, t.dataset.assistanceAuthKeyboardActivator = "true", t.setAttribute("autocapitalize", "characters"), t.setAttribute("autocorrect", "off"), t.style.position = "fixed", t.style.left = "0", t.style.bottom = "0", t.style.width = "1px", t.style.height = "1px", t.style.border = "0", t.style.padding = "0", t.style.opacity = "0.01", t.style.pointerEvents = "none", t.style.fontSize = "16px", t.style.color = "transparent", t.style.background = "transparent", t.style.caretColor = "transparent", e.appendChild(t);
  try {
    t.focus({ preventScroll: !0 });
  } catch {
    t.focus();
  }
  return document.activeElement === t;
}
function Jo(e) {
  return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("height", "100dvh") ? `${e}dvh` : `${e}vh`;
}
function ve(e) {
  return typeof e == "number" && Number.isFinite(e) && e > 0;
}
function ei(e) {
  const t = e.getBoundingClientRect().height;
  if (ve(t))
    return t;
  const n = /^(\d+(?:\.\d+)?)px$/.exec(e.style.height.trim())?.[1], r = n === void 0 ? Number.NaN : Number(n);
  return ve(r) ? r : null;
}
function ri(e, t) {
  return Yr(e) ?? t;
}
function Yr(e) {
  if (ve(e))
    return `${e}px`;
  if (typeof e != "string")
    return null;
  const t = e.trim();
  if (!t || /url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(t))
    return null;
  const n = "(?:px|vh|dvh|svh|lvh|%|rem)";
  if (new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d+)?${n}$`, "i").test(t))
    return t;
  const c = t.match(/^calc\((.*)\)$/i)?.[1];
  if (c && /^[\d\s.+\-*/()%a-z]+$/i.test(c)) {
    const A = new RegExp(`(?:0|[1-9]\\d*)(?:\\.\\d+)?${n}`, "gi"), D = c.replace(A, "");
    if (/^[\d\s.+\-*/()]*$/.test(D))
      return t;
  }
  return null;
}
const ti = "820px", ge = "420px";
function ni(e) {
  const t = Yr(e.authWindowHeight), n = t ? "fixed" : e.authWindowHeightMode === "auto" ? "auto" : "fixed";
  return {
    heightMode: n,
    height: t ?? (n === "auto" ? ge : Jo(92)),
    maxHeight: ri(e.authWindowMaxHeight, ti)
  };
}
function oi(e, t, n, r) {
  const c = document.createElement("iframe");
  return c.title = t, c.src = e, c.dataset.assistanceAuthFrame = "true", c.style.width = "100%", c.style.height = r === "ginkgo-v23-viewport-modal" ? "100%" : n.height, c.style.maxHeight = r === "ginkgo-v23-viewport-modal" ? "none" : n.maxHeight, c.style.border = "0", c.style.borderRadius = r === "ginkgo-v23-viewport-modal" ? "0" : "24px 24px 0 0", c.style.background = r === "ginkgo-v23-viewport-modal" ? "transparent" : "#fff", c.style.boxShadow = r === "ginkgo-v23-viewport-modal" ? "none" : "0 -16px 40px rgba(15,23,42,0.18)", r === "bottom-sheet" && (c.style.transform = "translateY(100%)", c.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)", c.style.willChange = "transform", c.className = Ho), c;
}
function ii(e, t, n = !1) {
  const r = document.createElement("iframe");
  return r.title = t, r.src = e, r.dataset.assistanceAuthFrame = "true", r.dataset.assistanceAuthInline = "true", r.style.display = "block", r.style.width = "100%", r.style.height = n ? "100%" : ge, r.style.maxHeight = "none", r.style.border = "0", r.style.borderRadius = "0", r.style.background = "transparent", r.style.boxShadow = "none", r.style.transform = "none", r.style.transition = "none", r;
}
function ai(e) {
  const t = document.createElement("iframe");
  return t.src = e, t.title = "", t.dataset.assistanceAuthProbe = "true", t.setAttribute("aria-hidden", "true"), t.tabIndex = -1, t.style.position = "fixed", t.style.left = "-99999px", t.style.top = "0", t.style.width = "1px", t.style.height = "1px", t.style.border = "0", t.style.opacity = "0", t.style.pointerEvents = "none", t;
}
function xi() {
  return kr;
}
function yr() {
  const e = xi();
  return {
    verificationUrl: new URL(To, e).toString(),
    allowedOrigin: new URL(e).origin
  };
}
function si(e, t, n, r = !1) {
  let c = !1, A;
  e.getBoundingClientRect(), t.getBoundingClientRect();
  const D = () => {
    c || !e.isConnected || !t.isConnected || (e.style.background = r ? "transparent" : "rgba(15,23,42,0.35)", e.style.opacity = "1", n === "bottom-sheet" && (t.style.transform = "translateY(0)"));
  }, h = requestAnimationFrame(() => {
    c || (A = requestAnimationFrame(D));
  });
  return () => {
    c = !0, cancelAnimationFrame(h), A !== void 0 && cancelAnimationFrame(A);
  };
}
function ci(e, t, n) {
  return new Promise((r) => {
    let c = !1;
    const A = () => {
      c || (c = !0, D.removeEventListener("transitionend", A), r());
    }, D = n === "bottom-sheet" ? t : e;
    D.addEventListener("transitionend", A), window.setTimeout(A, Po + 80), requestAnimationFrame(() => {
      e.style.background = "rgba(15,23,42,0)", e.style.opacity = "0", n === "bottom-sheet" && (t.style.transform = "translateY(100%)");
    });
  });
}
function fi(e) {
  const t = Fe();
  return {
    href: Ko(e, "new-control-style.css"),
    integrity: `sha256-${t.cssSha256}`,
    version: t.version
  };
}
function ui(e = {}) {
  const t = e.document ?? document, n = e.id ?? ko, r = t.getElementById(n);
  if (r instanceof t.defaultView.HTMLLinkElement)
    return r;
  const c = fi(e.baseUrl), A = t.createElement("link");
  return A.id = n, A.rel = "stylesheet", A.href = c.href, A.integrity = c.integrity, A.dataset.assistanceMobileAuthOfficialCssVersion = c.version, t.head.appendChild(A), A;
}
function di(e) {
  const t = typeof e.appId == "string" ? e.appId.trim() : "";
  if (!t)
    throw new Error("AssistanceMobileAuth: appId is required since 0.2.0");
  const n = e.display === "inline" ? "inline" : "modal", r = n === "inline" ? Mo(e.renderTo) : void 0, c = Hr(e.ui, { warn: Yn }), A = Vn(c), D = typeof e.onBeforeLogin == "function", h = typeof e.onStateChange == "function", C = eo(e.formHeaderImg);
  let o;
  if (e.container || e.authParams) {
    if (!e.container || !e.authParams)
      throw new Error("AssistanceMobileAuth legacy authorize mode requires container and authParams");
    Wo(), No(e.container), o = mr();
  }
  let x, p, a, l;
  function u() {
    return x ??= _n(), x;
  }
  function v(i = p) {
    if (i) {
      if (p !== i) {
        i.shell?.remove(), i.frame.remove();
        return;
      }
      i.keyboardAvoidance?.dispose(), i.keyboardAvoidance = void 0, i.disposeViewportFrame?.(), i.disposeViewportFrame = void 0, i.cancelPendingEnterAnimation?.(), i.cancelPendingEnterAnimation = void 0, i.disposeMessageListener?.(), i.disposeMessageListener = void 0, i.shell?.remove(), i.frame.remove(), i.presentation !== "inline" && (document.body.style.overflow = i.previousBodyOverflow ?? ""), p = void 0;
    }
  }
  function d(i, F) {
    if (i.settled) {
      v(i);
      return;
    }
    const g = i.reject;
    i.settled = !0, v(i), g?.(F);
  }
  async function b(i) {
    if (i.presentation === "inline") {
      v(i);
      return;
    }
    i.cancelPendingEnterAnimation?.(), i.cancelPendingEnterAnimation = void 0, i.disposeViewportFrame?.(), i.disposeViewportFrame = void 0, i.presented && i.shell && await ci(i.shell, i.frame, i.presentation), v(i);
  }
  function s(i) {
    if (String(i.code) !== "103000") {
      e.onError?.(i);
      return;
    }
    u().initControl({
      styleOption: Rn(e.styleOption),
      beforeSubmit: () => !0,
      authReady: e.onAuthReady,
      success: e.onSuccess,
      error: e.onError
    });
  }
  const f = {
    authorize() {
      if (!e.container || !e.authParams)
        throw new Error("AssistanceMobileAuth authorize requires container and authParams");
      const i = kn(e.authParams.authType), F = i === e.authParams.authType ? e.authParams : { ...e.authParams, authType: i }, g = o ?? mr();
      o = g, g.then(() => {
        u().showAuthPage({
          data: F,
          success: s,
          error: e.onError
        });
      }).catch((B) => {
        const y = B instanceof Error ? B : new Error(String(B));
        e.onError?.({ code: "sdk-script-load-failed", message: y.message });
      });
    },
    clear(i) {
      u().clearControl(i);
    },
    open(i) {
      return f.openVerification(i);
    },
    openVerification(i) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth requires a browser window and document"));
      const F = n === "inline" ? qo(r) : void 0, g = p;
      g && d(g, new Error("Assistance auth replaced"));
      const B = Er(), y = yr(), S = n === "inline" ? "inline" : Io(t), E = Uo(t, n), m = S === "inline" ? { heightMode: "auto", height: ge, maxHeight: "none" } : S === "ginkgo-v23-viewport-modal" ? { heightMode: "fixed", height: "100%", maxHeight: "none" } : ni(e), _ = Xn({
        closable: e.closable,
        useCustomKeyboard: e.useCustomKeyboard,
        heightMode: m.heightMode
      }), k = Fr({
        verificationUrl: y.verificationUrl,
        sessionId: B,
        request: i,
        expectsUiConfig: A,
        appId: t,
        parentOrigin: window.location.origin,
        ...S === "inline" ? { layout: "inline" } : {},
        debugVConsole: S === "inline" && $o()
      }), L = S === "inline" ? void 0 : jo(S), z = S === "inline" ? ii(
        k,
        e.authWindowTitle ?? "移动认证验证窗口",
        E
      ) : oi(
        k,
        e.authWindowTitle ?? "移动认证验证窗口",
        m,
        S
      );
      L?.positioningLayer.appendChild(z);
      const T = {
        sessionId: B,
        shell: L?.shell,
        frame: z,
        previousBodyOverflow: S === "inline" ? void 0 : document.body.style.overflow,
        settled: !1,
        presentation: S,
        presented: !1
      }, M = S !== "inline" && (Vr(t) || E0(t));
      M && Vo(T.shell, z), S === "ginkgo-v23-viewport-modal" ? T.disposeViewportFrame = Xo({
        targetWindow: window,
        frame: z,
        positioningLayer: L.positioningLayer
      }) : S !== "inline" && m.heightMode === "auto" && (T.keyboardAvoidance = Bo({
        targetWindow: window,
        frame: z,
        positioningLayer: L.positioningLayer
      })), p = T, S === "inline" ? F.appendChild(z) : document.body.appendChild(T.shell);
      const O = () => {
        T.settled || T.presented || !T.shell?.isConnected || !z.isConnected || (T.presented = !0, Yo(T.shell, z), document.body.style.overflow = "hidden", T.cancelPendingEnterAnimation = si(T.shell, z, S, E0(t)));
      };
      if (M || O(), T.keyboardAvoidance && !_.useCustomKeyboard && Qo(T.shell)) {
        const H = ei(z);
        H !== null && T.keyboardAvoidance.update({
          height: H,
          keyboardFocused: !0
        });
      }
      const N = z.contentWindow, q = () => {
        !A || !N || N.postMessage(
          oo(B, c),
          y.allowedOrigin
        );
      }, w = () => {
        N?.postMessage(
          he(
            Mr,
            B,
            {
              styleOption: Hn(e.styleOption) ?? {},
              agreements: Oo(e.agreements),
              iframeOptions: _,
              beforeLoginNotificationEnabled: D,
              stateChangeEnabled: h,
              ...C ? { formHeaderImg: C } : {}
            }
          ),
          y.allowedOrigin
        );
      };
      return new Promise((H, P) => {
        T.reject = P;
        let R;
        const W = (I) => {
          if (!T.settled) {
            if (T.settled = !0, clearTimeout(R), S === "inline") {
              I();
              return;
            }
            b(T).then(I);
          }
        }, K = (I) => {
          if (E0(t))
            try {
              e.onError?.(I);
            } catch {
            }
          else
            e.onError?.(I);
          P(new Error(`Assistance auth error: ${I.message}`));
        };
        if (T.disposeMessageListener = gr(
          window,
          B,
          {
            onReady: () => {
              p === T && (w(), q(), e.onReady?.());
            },
            onPresentationReady: () => {
              clearTimeout(R), M && O();
            },
            onStateChange: (I) => {
              p !== T || T.settled || (br(e.onStateChange, "onStateChange", I), I.type === "idLast4Complete" && br(e.onBeforeLogin, "onBeforeLogin"));
            },
            onSuccess: (I) => W(() => {
              e.onSuccess?.(I), H(I);
            }),
            onCancel: (I) => W(() => {
              e.onCancel?.(I), P(new Error("Assistance auth cancelled"));
            }),
            onError: (I) => W(() => K(I)),
            // 非终态通知：纯透传，不 settle、不关弹窗、不 reject —— 终态语义不变。
            // settled 之后不再透传：关闭动画期间迟到的通知对调用方已无意义（流程已终结）。
            onErrorNotice: (I) => {
              p === T && !T.settled && e.onErrorNotice?.(I);
            },
            onPhoneReady: (I) => {
              p === T && !T.settled && e.onPhoneReady?.(I);
            },
            onResize: (I) => {
              if (p === T && S === "inline") {
                E || (T.frame.style.height = `${I.height}px`);
                return;
              }
              p !== T || S === "ginkgo-v23-viewport-modal" || _.heightMode !== "auto" || !T.keyboardAvoidance || T.keyboardAvoidance.update(I);
            },
            onClose: () => W(() => {
              e.onClose?.(), P(new Error("Assistance auth closed"));
            })
          },
          y.allowedOrigin,
          {
            expectedSource: N,
            expectedSourceTypes: S === "inline" ? [ae, Ee] : [ae]
          }
        ), M && E0(t)) {
          R = setTimeout(() => W(() => {
            K({ code: "AUTH_READY_TIMEOUT", message: "认证页面初始化超时，请稍后重试。" });
          }), 15e3);
          const I = T.disposeMessageListener;
          T.disposeMessageListener = () => {
            clearTimeout(R), I?.();
          };
        }
      });
    },
    precheck(i) {
      if (typeof window > "u" || typeof document > "u")
        return Promise.reject(new Error("Assistance auth precheck requires a browser window and document"));
      if (a)
        return a;
      const F = i.timeoutMs ?? zo, g = Er(), B = yr(), y = Fr({
        verificationUrl: B.verificationUrl,
        sessionId: g,
        request: { scene: i.scene, requestId: i.requestId },
        mode: "probe",
        appId: t
      }), S = ai(y), E = new Promise((m) => {
        let _ = !1, k, L;
        const z = (T) => {
          _ || (_ = !0, L !== void 0 && clearTimeout(L), k?.(), S.remove(), m(T));
        };
        l = () => z({ eligible: !1, reason: "unknown" }), k = gr(
          window,
          g,
          { onProbeResult: (T) => z(T) },
          B.allowedOrigin
        ), L = setTimeout(() => z({ eligible: !1, reason: "unknown" }), F), document.body.appendChild(S);
      }).finally(() => {
        a = void 0, l = void 0;
      });
      return a = E, E;
    },
    close() {
      const i = p;
      if (i?.frame.contentWindow && i.frame.contentWindow.postMessage(he(Be, i.sessionId), "*"), i && !i.settled && i.reject) {
        i.settled = !0;
        const F = i.reject;
        b(i).then(() => {
          e.onClose?.(), F(new Error("Assistance auth closed"));
        });
        return;
      }
      v(i);
    },
    destroy() {
      l?.();
      const i = p;
      i && d(i, new Error("Assistance auth destroyed"));
    }
  };
  return f;
}
export {
  di as createAssistanceMobileAuthSdk,
  fi as getAssistanceMobileAuthOfficialCssAsset,
  ui as injectAssistanceMobileAuthOfficialCss
};
