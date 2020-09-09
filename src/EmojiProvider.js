import * as fs from 'fs';
import * as path from 'path';
import * as fuzzaldrin from 'fuzzaldrin';
export class EmojiProvider {
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
