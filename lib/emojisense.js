"use strict";
"use babel";

const _eventKit = require("event-kit");
const CodeMirror = require("codemirror");
const app = require("@electron/remote").app;
const modulePath = app.getAppPath() + "/node_modules/";
require(modulePath + "codemirror/addon/hint/show-hint"); //require("codemirror/addon/hint/show-hint")

const {
  EmojiProvider
} = require("./EmojiProvider");
const R = require("ramda");
class EmojiSense {
  constructor() {
    this.ep = new EmojiProvider();
  }
  activate() {
    this.ep.loadProperties();
    this.disposables = new _eventKit.CompositeDisposable(); //console.log("activate")

    const editoHandler = R.curry(this.handleEditorDidLoad)(this.ep);
    global.inkdrop.onEditorLoad(editoHandler.bind(this));
  }
  deactivate() {
    if (this.disposables) {
      this.disposables.dispose();
    }
  }

  /**
   * @param ep
   * @param {{ cm: CodeMirror.Editor }} editor
   */

  handleEditorDidLoad(ep, editor) {
    const {
      cm
    } = editor; //console.log("editor loaded")

    const handleCompletor = R.curry(this.handleComplete)(ep);
    cm.on('inputRead', (cmEditor, event) => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      if (!cmEditor.state.completionActive && event.key !== "Enter"
      /*Enables keyboard navigation in autocomplete list*/) {
        const cursor = cmEditor.getCursor();
        const token = cmEditor.getTokenAt(cursor);
        /**@typedef {CodeMirror} codeMirror */
        if (token.string.startsWith(":")) codeMirror.showHint({
          cmEditor,
          hint: handleCompletor,
          completeSingle: false //closeCharacters: /\ \/>/
        });
      } else return CodeMirror.Pass;
      //event.preventDefault();
    }, true);
  }
  handleComplete(ep, cm) {
    /**
     * @param {CodeMirror.Position} textCursor
     * @returns {CodeMirror.Hint[]}
     * @param {any[]} list
     */
    function createHints(list, textCursor) {
      const hints = list.map((elem, idx, arr) => ({
        text: elem.text,
        displayText: `${elem.text} ${elem.rightLabel}`,
        /**@param {HTMLLIElement} e
         @param {CodeMirror.Hint} cur */
        //render: (e, data, cur) => { e.appendChild(cur.) }
        //from?: Position

        /** Called if a completion is picked. If provided *you* are responsible for applying the completion */

        /**@param {CodeMirror.Editor} cm
         * @param {CodeMirror.Hints} data
         * @param {CodeMirror.Hint} cur
         */
        hint: (cm, data, cur) => {
          /**@type {CodeMirror.Token} token*/
          const token = cm.getTokenAt(textCursor);
          const line = textCursor.line;
          cm.getDoc().replaceRange(cur.text, {
            line: line,
            ch: token.start - 1
          }, {
            line: line,
            ch: token.end
          });
        } //render?: (element: HTMLLIElement, data: Hints, cur: Hint) => void
        //to?: Position
      }));

      return hints;
    }
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const start = token.start;
    const end = cursor.ch;
    const line = cursor.line; //console.log("complete")

    const results = ep.getSuggestions(cm); //console.log(results)

    return {
      list: results.length ? createHints(results, cursor) : [],
      from: CodeMirror.Pos(line, start),
      to: CodeMirror.Pos(line, end)
    };
  }
}
module.exports = new EmojiSense();