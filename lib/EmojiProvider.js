"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiProvider = void 0;
var fs = _interopRequireWildcard(require("fs"));
var path = _interopRequireWildcard(require("path"));
var fuzzaldrin = _interopRequireWildcard(require("fuzzaldrin"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class EmojiProvider {
  constructor() {
    _defineProperty(this, "wordRegex", /::?[\w\d_\+-]+$/);
    _defineProperty(this, "properties", {});
    _defineProperty(this, "keys", []);
  }
  loadProperties() {
    return fs.readFile(path.resolve(__dirname, "..", "properties.json"), (error, content) => {
      if (error) {
        return;
      }
      this.properties = JSON.parse(content);
      return this.keys = Object.keys(this.properties);
    });
  }
  getSuggestions(editor) {
    let replacementPrefix;
    let prefix = this.getPrefix(editor);
    if (!((prefix != null ? prefix.length : Number) >= 2)) {
      return [];
    }
    if (prefix.charAt(1) === ":") {
      replacementPrefix = prefix;
      prefix = prefix.slice(1);
    }
    const unicodeEmojis = this.getUnicodeEmojiSuggestions(prefix);
    return unicodeEmojis;
  }
  getPrefix(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor, true);
    const currentWord = `:${token.string}`; //prepend ':'
    const regexMatch = currentWord.match(this.wordRegex);
    const match = regexMatch ? regexMatch[0] : ":";
    return match;
  }
  getUnicodeEmojiSuggestions(prefix) {
    const words = fuzzaldrin.filter(this.keys, prefix.slice(1));
    return Array.from(words).map(word => ({
      text: this.properties[word].emoji,
      replacementPrefix: prefix,
      rightLabel: word
    }));
  }
}
exports.EmojiProvider = EmojiProvider;