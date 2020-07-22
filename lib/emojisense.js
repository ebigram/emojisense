'use babel';
import CodeMirror from 'codemirror';
const app = require('electron').remote.app;
const modulePath = app.getAppPath() + '/node_modules/';
require(`${modulePath}codemirror/addon/hint/show-hint`);
require('codemirror/addon/hint/show-hint');
import {
    EmojiProvider
} from './emoji-provider';

//TODO: cleanup on deactivate
//TODO: cleanup: comments
//TODO: cleanup: dead code
//TODO: cleanup: imports
//TODO: cleanup: refactor consistent naming
//TODO: get rid of forceReflow warnings
//TODO: a bit of JSDOC (optional)
//TODO: publishing: git
//TODO: publishing: docs
//TODO: publishing: add to plugin repo
//TODO: package versioning
//TODO: add text to drop-down menu
//TODO: correctly detect ':' autocompletion prompt
//TODO: add tsc compilation to npm build
//TODO: plugin naming consistency for modules/files/repo
//TODO: credit attribution to autocomplete emojis
//TODO: debugging
//TODO: remove unused packages
//TODO: remove console logs
//TODO: render HTML in markdown matches
//TODO: label emojis correctly
//TODO: render dropdown menu more compactly (list only top-k entries?)
//TODO: (optional) add real changelog/roadmap
//TODO: (optional) add GH issues/project
//TODO: (optional) cleanup git history
//TODO: (optional) let user specify type of emoji


module.exports = {
    activate() {
        // @ts-ignore
        global.inkdrop.onEditorLoad(this.handleEditorDidLoad.bind(this));
    },

    deactivate() {
        // @ts-ignore
        const {
            cm
        } = global.inkdrop.getActiveEditor();

        if (cm) { }

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
            const list = results.map(function (res, idx, arr) {
                return res;
            });
            return {
                list: list.length ? list : [],
                from: CodeMirror.Pos(line, start),
                to: CodeMirror.Pos(line, end)
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