import * as fs from 'fs';
import * as path from 'path';
import * as fuzzaldrin from 'fuzzaldrin';
import * as emoji from 'emoji-images';

module.exports = {
	selector: '.source.gfm, .text.md, .text.restructuredtext, .text.html, .text.slim, .text.plain, .text.git-commit, .comment, .string, .source.emojicode',

	wordRegex: /::?[\w\d_\+-]+$/,
	emojiFolder: 'node_modules/emoji-images/pngs',
	properties: {},
	keys: [],

	loadProperties() {
		return fs.readFile(path.resolve(__dirname, '..', 'properties.json'), (error: any, content: any) => {
			if (error) { return; }

			this.properties = JSON.parse(content);
			return this.keys = Object.keys(this.properties);
		});
	},

	getSuggestions(editor: CodeMirror.Editor) {
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
	},

	getPrefix(cm: CodeMirror.Editor): string[] {
		const cursor = cm.getCursor();
		const token = cm.getTokenAt(cursor);
		const start = token.start;
		const end = cursor.ch;
		const line = cursor.line;
		const currentWord = token.string;
		return currentWord.match(this.wordRegex);

	},

	getUnicodeEmojiSuggestions(prefix: { slice: (arg0: number) => any; }) {
		const words = fuzzaldrin.filter(this.keys, prefix.slice(1));
		return Array.from(words).map((word: string | number) => (
			{
				text: this.properties[word].emoji,
				replacementPrefix: prefix,
				rightLabel: word
			}));
	},

	getMarkdownEmojiSuggestions(prefix: any, replacementPrefix: any) {
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
					text: word,
					replacementPrefix: replacementPrefix || prefix,
					rightLabelHTML: emojiImageElement
				});
			}
			return result;
		})();
	}
};
