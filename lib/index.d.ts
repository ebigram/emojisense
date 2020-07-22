import * as emoji from 'emoji-images';
import { EmojiProvider } from './emoji-provider';
declare module Emoji {
  declare class EmojiProvider {
    loadProperties(): void;
    getSuggestions(editor: CodeMirror.Editor): Result[];
  }

  declare type Result = {
    text: any,
    replacementPrefix: string,
    rightLabel: string
  }
}

export = Emoji;