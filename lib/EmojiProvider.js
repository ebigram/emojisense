"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiProvider = void 0;

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

var fuzzaldrin = _interopRequireWildcard(require("fuzzaldrin"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
//# sourceMappingURL=EmojiProvider.js.map