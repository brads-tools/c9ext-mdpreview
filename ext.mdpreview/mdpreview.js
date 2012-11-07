/**
 * Your extension for Cloud9 IDE!
 * 
 * Loads an iFrame inside a file tab
 */
define(function(require, exports, module) {

    var ide = require("core/ide");
    var ext = require("core/ext");
    var editors = require("ext/editors/editors");
    var menus = require("ext/menus/menus");
    var markup = require("text!./mdpreview.xml");
    var _showdown = require("./res/showdown.js").Showdown;
    var markdown = new _showdown.converter();

    module.exports = ext.register("ext/mdpreview/mdpreview", {
        name: "MDPreview v0.3",
        dev: "Bradley Matusiak",
        alone: true,
        type: ext.EDITOR,
        deps: [editors],
        markup: markup,
        fileExtensions: ["#!mdpreview","md"],
        docs : {},
        nodes: [],

        init: function() {
            var editor = window.barmdpreview;

            this.container = editor.firstChild.firstChild.$ext;

            //Nothing to save
            ide.addEventListener("beforefilesave", function(e) {
                var page = window.tabEditors.getPage();
                return !(page && page.$doc && (page.$doc.previewer || page.$doc.inited));
            });

            editor.show();

            this.barmdpreview = this.amlEditor = editor;
        },

        mdpreviewClicked: function() {
            this.createNewMarkdownPreview(window.tabEditors.getPage());
        },

        createNewMarkdownPreview: function(page) {
            var $path = page.id + "." + this.fileExtensions[0];
            editors.gotoDocument({
                path: $path,
                type: "nofile"
            });
        },

        renderMarkdown: function(markdownText) {
            var html = markdown.makeHtml(markdownText);
            return html;
        },

        setDocument: function(doc) {
            
            if (!doc.previewer && !doc.inited) {
                
                var path = doc.getNode().getAttribute("path");
                
                if(this.docs[path] && this.docs[path].previewer){
                    var _doc = this.docs[path];
                    this.container.innerHTML = this.renderMarkdown(_doc.previewer.$doc.getValue());
                    this.barmdpreview.setProperty("value", apf.escapeXML(_doc.session));
                    this.curentDoc = _doc;
                    this.focus();
                }else{
                    this.docs[path] = doc;
                    
                    doc.session = path;
                    doc.previewer = window.tabEditors.getPage();
                    doc.inited = true;
                    doc.editor = this;
    
                    this.container.innerHTML = this.renderMarkdown(doc.previewer.$doc.getValue());
                    this.barmdpreview.setProperty("value", apf.escapeXML(doc.session));
                    
                    this.curentDoc = doc;
                    doc.dispatchEvent("init");
                }
            }
            else if (doc.previewer) {
                this.curentDoc = doc;
                this.container.innerHTML = this.renderMarkdown(doc.previewer.$doc.getValue());
                this.barmdpreview.setProperty("value", apf.escapeXML(doc.session));

                this.focus();
            }
        },

        focus: function() {
            var page = window.tabEditors.getPage();
            if (!page) return;
            var node = page.$doc.getNode();
            if(node.getAttribute("name").indexOf(this.fileExtensions[0]) >= 2){
                var path = node.getAttribute("path");
                node.setAttribute("name", "Preview: " + apf.getFilename(path).split("."+this.fileExtensions[0])[0]);
            }
        },

        hook: function() {
            var _self = this;
            this.nodes.push(
            menus.addItemByPath("Tools/Preview as Markdown", new apf.item({
                onclick: function() {
                    _self.mdpreviewClicked();
                },
                isAvailable: function(editor) {
                    return true;
                }
            }), 0));
            
        },

        enable: function() {
            this.nodes.each(function(item) {
                item.enable();
            });
        },

        disable: function() {
            this.nodes.each(function(item) {
                item.disable();
            });
        },

        destroy: function() {
            this.nodes.each(function(item) {
                item.destroy(true, true);
            });
            this.nodes = [];
            this.docs = {};
        }
    });

});