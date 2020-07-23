'use babel';
import CodeMirror from 'codemirror';
const app = require('electron').remote.app;
const modulePath = app.getAppPath() + '/node_modules/';
require(`${modulePath}codemirror/addon/hint/show-hint`);
require('codemirror/addon/hint/show-hint');
import {
    EmojiProvider
} from './emoji-provider';


module.exports = {
    activate() {
        // @ts-ignore
        global.inkdrop.onEditorLoad(this.handleEditorDidLoad.bind(this));
    },

    deactivate() {
    },


    handleEditorDidLoad(editor) {
        /** @type {CodeMirror.Editor} cm */
        const cm = editor.cm;
        const ep = new EmojiProvider();
        ep.loadProperties();


        const complete = function () {
            const cursor = cm.getCursor();
            const token = cm.getTokenAt(cursor);
            const start = token.start;
            const end = cursor.ch;
            const line = cursor.line;

            const results = ep.getSuggestions(cm);
            return {
                list: results.length ? createHints(results, cursor) : [],
                from: CodeMirror.Pos(line, start),
                to: CodeMirror.Pos(line, end),
            };
        };

        cm.on("keyup",
            /** @param {KeyboardEvent} event **/
            function (cm, event) {
                if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
                    event.key == ':' &&
                    event.keyCode != 13) {
                    /*Enter - do not open autocomplete list just after item has been selected in it*/
                    // @ts-ignore
                    inkdrop.commands.dispatch(document.body, "user:autocomplete");
                }
            });

        // @ts-ignore
        inkdrop.commands.add(document.body, {
            'user:autocomplete': () => {
                CodeMirror.showHint(cm, complete);
            }
        });
    }

};
/**@param {Result[]} list 
 * @param {CodeMirror.Position} textCursor
 * @returns {CodeMirror.Hint[]} 
*/
function createHints(list, textCursor) {
    const hints = list.map((elem, idx, arr) => ({

        text: elem.text,
        displayText: `${elem.text} ${elem.rightLabel}`,
        /**@param {HTMLLIElement} e 
        @param {CodeMirror.Hint} cur */
        //render: (e, data, cur) => { e.appendChild(cur.); }
        //from?: Position;
        /** Called if a completion is picked. If provided *you* are responsible for applying the completion */
        /**@param {CodeMirror.Editor} cm 
         * @param {CodeMirror.Hints} data
         * @param {CodeMirror.Hint} cur
        */
        hint: (cm, data, cur) => {
            /**@type {CodeMirror.Token} token*/
            const token = cm.getTokenAt(textCursor);
            const line = textCursor.line;
            cm.getDoc().replaceRange(cur.text, { line: line, ch: token.start - 1 }, { line: line, ch: token.end });
        }
        //render?: (element: HTMLLIElement, data: Hints, cur: Hint) => void;
        //to?: Position;
    }));
    return hints;
}