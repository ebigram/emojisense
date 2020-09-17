"use strict";
// @ts-nocheck
'use babel';

var _eventKit = require("event-kit");

const CodeMirror = require('codemirror');

const app = require('electron').remote.app;

const modulePath = app.getAppPath() + '/node_modules/';

require(modulePath + 'codemirror/addon/hint/show-hint');

const {
  EmojiProvider
} = require('./EmojiProvider');

const R = require('ramda');

class EmojiSense {
  constructor() {
    this.ep = new EmojiProvider();
  }

  activate() {
    this.ep.loadProperties();
    console.log("activate");
    const editoHandler = R.curry(this.handleEditorDidLoad)(this.ep);
    global.inkdrop.onEditorLoad(editoHandler.bind(this));
  }

  deactivate() {
    /** @type {CodeMirror.Editor} editor **/
    const editor = inkdrop.getActiveEditor();

    if (this.disposables) {
      this.disposables.dispose();
    }
  }
  /**
   * @param {{ cm: CodeMirror.Editor }} editor
   */


  handleEditorDidLoad(ep, editor) {
    const {
      cm
    } = editor;
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const start = token.start;
    const end = cursor.ch;
    const line = cursor.line;
    const disposables = new _eventKit.CompositeDisposable();
    console.log("editor loaded");
    const handleCompletor = R.curry(this.handleComplete)(ep);
    cm.on("keyup", function (cm, event) {
      //event.stopPropogation()
      console.log("keyup!");

      if (!cm.state.completionActive &&
      /*Enables keyboard navigation in autocomplete list*/
      event.key === ':' && event.keyCode != 13) {
        /*Enables keyboard navigation in autocomplete list*/
        //  disposables.add(new Disposable(this.handleComplete))
        codeMirror.showHint({
          hint: handleCompletor
        });
      }
    });
    this.disposables = disposables;
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
    const line = cursor.line;
    console.log("complete");
    const results = ep.getSuggestions(cm);
    console.log(results);
    return {
      list: results.length ? createHints(results, cursor) : ['something1', 'something2'],
      from: CodeMirror.Pos(line, start),
      to: CodeMirror.Pos(line, end)
    };
  }

}

module.exports = new EmojiSense();
//# sourceMappingURL=emojisense.js.map