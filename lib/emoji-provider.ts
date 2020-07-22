'use babel'
import * as fs from 'fs';
import * as path from 'path';
import fuzzaldrin from 'fuzzaldrin';
import emoji from 'emoji-images';
import { Result } from './index';
import CodeMirror from 'codemirror';


export class EmojiProvider {
	wordRegex = /::?[\w\d_\+-]+$/;

	//@ts-ignore
	packagePath = inkdrop.packages.getActivePackage('inkdrop-emojisense').path;;
	emojiFolder = this.packagePath + '/node_modules/emoji-images/pngs';
	properties = {};
	keys = [];

	loadProperties() {
		return fs.readFile(path.resolve(__dirname, '..', 'properties.json'), (error: any, content: any) => {
			if (error) { return; }
			this.properties = JSON.parse(content);
			//@ts-ignore
			this.packagePath = inkdrop.packages.getActivePackage('inkdrop-emojisense').path;
			console.log('packagePath: ' + this.packagePath);
			return this.keys = Object.keys(this.properties);
		});
	};

	getSuggestions(editor: CodeMirror.Editor): Result[] {
		let replacementPrefix: string;
		let prefix = this.getPrefix(editor);
		if (!((prefix != null ? prefix.length : Number) >= 2)) { return []; }

		if (prefix.charAt(1) === ':') {
			const isMarkdownEmojiOnly = true;
			replacementPrefix = prefix;
			prefix = prefix.slice(1);
		}

		const unicodeEmojis = this.getUnicodeEmojiSuggestions(prefix);

		const markdownEmojis = this.getMarkdownEmojiSuggestions(prefix, replacementPrefix);

		return unicodeEmojis.concat(markdownEmojis);
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

	getMarkdownEmojiSuggestions(prefix: string, replacementPrefix: string): Result[] {
		const words = fuzzaldrin.filter(emoji.list, prefix);
		return (() => {
			const result = [];
			for (let word of Array.from(words)) {
				let emojiImageElement = emoji(word, this.emojiFolder, 20);
				if (emojiImageElement.match(/src="(.*\.png)"/)) {
					const uri = RegExp.$1;
					emojiImageElement = emojiImageElement.replace(uri, decodeURIComponent(uri));
				}

				result.push({
					text: emojiImageElement,
					replacementPrefix: replacementPrefix || prefix,
					rightLabel: emojiImageElement
				});
			}
			return result;
		})();
	};
}