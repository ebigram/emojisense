import * as emoji from 'emoji-images';
import { EmojiProvider } from "./EmojiProvider";
declare module Emoji {
  class EmojiProvider {
    loadProperties(): void;
    getSuggestions(editor: CodeMirror.Editor): Result[];
  }

  type Result = {
    text: string,
    replacementPrefix: string,
    rightLabel: string
  }
}
export = Emoji