'use babel'
const CodeMirror = require('codemirror')
const app = require('electron').remote.app
const modulePath = app.getAppPath() + '/node_modules/'
require(`${modulePath}codemirror/addon/hint/show-hint`)
require('codemirror/addon/hint/show-hint')
const { EmojiProvider } = require('./EmojiProvider')
module.exports = {


/**
 * @param {CodeMirror.Position} textCursor
 * @returns {CodeMirror.Hint[]}
 * @param {any[]} list
 */
createHints(list, textCursor) {
    const /**
         * @param {{ text: any rightLabel: any }} elem
         * @param {any} idx
         * @param {any} arr
         */
 hints = list.map((elem, idx, arr) => ({

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
            const token = cm.getTokenAt(textCursor)
            const line = textCursor.line
            cm.getDoc().replaceRange(cur.text, { line: line, ch: token.start - 1}, { line: line, ch: token.end })
        }
        //render?: (element: HTMLLIElement, data: Hints, cur: Hint) => void
        //to?: Position
    }))
    return hints
}
    ,
    activate() {
        // @ts-ignore
        global.inkdrop.onEditorLoad(this.handleEditorDidLoad.bind(this))
    },

    deactivate: function () {
        /** @type {CodeMirror.Editor} editor **/
        const editor = global.inkdrop.getActiveEditor()
        if (editor) {
            editor.off(':', () => {
            })
        }
    },


    handleComplete(ep, cm) {
        const cursor = cm.getCursor()
        const token = cm.getTokenAt(cursor)
        const start = token.start
        const end = cursor.ch
        const line = cursor.line

        const results = ep.getSuggestions(cm)
        return {
            list: results.length ? this.createHints(results, cursor) : [],
            from: CodeMirror.Pos(line, start),
            to: CodeMirror.Pos(line, end),
        }
    },
    /**
     * @param {{ cm: CodeMirror.Editor }} editor
     */
    handleEditorDidLoad(editor) {
        /** @type {CodeMirror.Editor} cm */
        const cm = editor.cm
        const ep = new EmojiProvider()
        ep.loadProperties()

        cm.on("keyup",
            /** @param {KeyboardEvent} event **/
            function (cm, event) {
                if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
                    event.key == ':' &&
                    event.keyCode != 13) {
                    /*Enter - do not open autocomplete list just after item has been selected in it*/
                    // @ts-ignore
                    inkdrop.commands.dispatch(document.body, "user:autocomplete")
                    event.stopPropagation()
                }
            })

        // @ts-ignore
        inkdrop.commands.add(document.body, {
            'user:autocomplete': () => {
                CodeMirror.showHint(cm, ()=> this.handleComplete(ep,cm))
            }
        }
        )
    }

}