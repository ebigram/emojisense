import * as fs from 'fs';
import * as path from 'path';
import * as fuzzaldrin from 'fuzzaldrin';
import CodeMirror from 'codemirror';
import { Result } from './index';


export class EmojiProvider {
	wordRegex = /::?[\w\d_\+-]+$/;
	properties = {};
	keys = [];

	loadProperties() {
		return fs.readFile(path.resolve(__dirname, '..', 'properties.json'), (error: any, content: any) => {
			if (error) { return; }
			this.properties = JSON.parse(content);
			return this.keys = Object.keys(this.properties);
		});
	};

	getSuggestions(editor: CodeMirror.Editor): Result[] {
		let replacementPrefix: string;
		let prefix = this.getPrefix(editor);
		if (!((prefix != null ? prefix.length : Number) >= 2)) { return []; };

		if (prefix.charAt(1) === ':') {
			replacementPrefix = prefix;
			prefix = prefix.slice(1);
		}

		const unicodeEmojis = this.getUnicodeEmojiSuggestions(prefix);
		return unicodeEmojis;
	};

	getPrefix(cm: CodeMirror.Editor): string {
		const cursor = cm.getCursor();
		const token = cm.getTokenAt(cursor, true);
		const currentWord = `:${token.string}`; //prepend ':'
		const regexMatch = currentWord.match(this.wordRegex);
		const match = regexMatch ? regexMatch[0] : ':';
		return match;
	};

	getUnicodeEmojiSuggestions(prefix: string): Result[] {
		const words = fuzzaldrin.filter(this.keys, prefix.slice(1));
		return Array.from(words).map((word: string) => (
			{
				text: this.properties[word].emoji,
				replacementPrefix: prefix,
				rightLabel: word
			}));
	};
}
