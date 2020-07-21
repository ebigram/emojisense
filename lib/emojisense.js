'use babel';
import CodeMirror from "codemirror";
const app = require('electron').remote.app;
const modulePath = app.getAppPath() + '/node_modules/';
require(modulePath + 'codemirror/addon/hint/show-hint');
require(modulePath + 'codemirror/addon/hint/javascript-hint');
require(modulePath + 'codemirror/addon/hint/anyword-hint');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/anyword-hint');

//require('./complete-emoji.js');
//const { CodeMirrorEditor } = require("@textcomplete/codemirror");
//const cm = CodeMirror(myElement);
//const editor = new CodeMirrorEditor(cm);
//const textcomplete = new Textcomplete(editor, strategies, option);
module.exports = {
    activate() {

        // @ts-ignore
        global.inkdrop.onEditorLoad(this.handleEditorDidLoad.bind(this));
    },

    deactivate() {
        // @ts-ignore
        const { cm } = global.inkdrop.getActiveEditor();

        if (cm) {
        }

    },
    handleEditorDidLoad(editor) {
        /** @type {CodeMirror.Editor} cm */
        const cm = editor.cm;

        // スニペットの配列
        const snippets = [
            { text: 'const', displayText: 'const declarations' },
            { text: 'let', displayText: 'let declarations' },
            { text: 'var', displayText: 'var declarations' },
        ];
        //    cm.setOption('lineNumbers', false);
        // keymap を指定
        //TODO: implement hinter here
        // @ts-ignore
        // CodeMirror.registerHelper("gfm", "complete-emoji", anyword);
        // keymap を指定
        var complete = function () {
            const cursor = cm.getCursor();
            const token = cm.getTokenAt(cursor);
            const start = token.start;
            const end = cursor.ch;
            const line = cursor.line;
            const currentWord = token.string;

            // 入力した文字列をスニペット配列から探す
            const list = snippets.filter(function (item) {
                return item.text.indexOf(currentWord) >= 0;
            });

            return {
                list: list.length ? list : snippets,
                from: CodeMirror.Pos(line, start),
                to: CodeMirror.Pos(line, end)
            };
        };

        cm.on("keyup",
            /**  @param {KeyboardEvent} event **/

            function (cm, event) {
                if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
                    event.key == ':' &&
                    event.keyCode != 13) {        /*Enter - do not open autocomplete list just after item has been selected in it*/
                    // @ts-ignore
                    inkdrop.commands.dispatch(document.body, "user:autocomplete");
                }
            });

        // @ts-ignore
        inkdrop.commands.add(document.body, {
            'user:autocomplete': () => {
                CodeMirror.showHint(cm, complete
                );
            }
        });
    }
};
