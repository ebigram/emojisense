"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiProvider = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fuzzaldrin = __importStar(require("fuzzaldrin"));
class EmojiProvider {
    constructor() {
        this.wordRegex = /::?[\w\d_\+-]+$/;
        this.properties = {};
        this.keys = [];
    }
    loadProperties() {
        return fs.readFile(path.resolve(__dirname, '..', 'properties.json'), (error, content) => {
            if (error) {
                return;
            }
            this.properties = JSON.parse(content);
            return this.keys = Object.keys(this.properties);
        });
    }
    ;
    getSuggestions(editor) {
        let replacementPrefix;
        let prefix = this.getPrefix(editor);
        if (!((prefix != null ? prefix.length : Number) >= 2)) {
            return [];
        }
        ;
        if (prefix.charAt(1) === ':') {
            replacementPrefix = prefix;
            prefix = prefix.slice(1);
        }
        const unicodeEmojis = this.getUnicodeEmojiSuggestions(prefix);
        return unicodeEmojis;
    }
    ;
    getPrefix(cm) {
        const cursor = cm.getCursor();
        const token = cm.getTokenAt(cursor, true);
        const currentWord = `:${token.string}`; //prepend ':'
        const regexMatch = currentWord.match(this.wordRegex);
        const match = regexMatch ? regexMatch[0] : ':';
        return match;
    }
    ;
    getUnicodeEmojiSuggestions(prefix) {
        const words = fuzzaldrin.filter(this.keys, prefix.slice(1));
        return Array.from(words).map((word) => ({
            text: this.properties[word].emoji,
            replacementPrefix: prefix,
            rightLabel: word
        }));
    }
    ;
}
exports.EmojiProvider = EmojiProvider;
