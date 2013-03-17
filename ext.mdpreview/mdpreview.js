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
    var markup = '<a:application xmlns:a="http://ajax.org/2005/aml">'+
                    '<a:bar id="barmdpreview" flex="1" anchors="0 0 0 0" visible="false">'+
                    '<div style="overflow:scroll;width:100%;height:100%;background-color:white;">'+
                    '<div class="markdownPreview" style="padding:15px;"></div>'+
                    //'<link rel="stylesheet" href="http://yandex.st/highlightjs/7.3/styles/default.min.css">'+
                    //'<style>.markdownPreview code {color:red;}</style>'+
                    '<style>.markdownPreview{color:black;background-color:white;}</style>'+
                    '<style>pre code{display:block;padding:.5em;background:#f0f0f0}pre code,pre .subst,pre .tag .title,pre .lisp .title,pre .clojure .built_in,pre .nginx .title{color:black}pre .string,pre .title,pre .constant,pre .parent,pre .tag .value,pre .rules .value,pre .rules .value .number,pre .preprocessor,pre .ruby .symbol,pre .ruby .symbol .string,pre .aggregate,pre .template_tag,pre .django .variable,pre .smalltalk .class,pre .addition,pre .flow,pre .stream,pre .bash .variable,pre .apache .tag,pre .apache .cbracket,pre .tex .command,pre .tex .special,pre .erlang_repl .function_or_atom,pre .markdown .header{color:#800}pre .comment,pre .annotation,pre .template_comment,pre .diff .header,pre .chunk,pre .markdown .blockquote{color:#888}pre .number,pre .date,pre .regexp,pre .literal,pre .smalltalk .symbol,pre .smalltalk .char,pre .go .constant,pre .change,pre .markdown .bullet,pre .markdown .link_url{color:#080}pre .label,pre .javadoc,pre .ruby .string,pre .decorator,pre .filter .argument,pre .localvars,pre .array,pre .attr_selector,pre .important,pre .pseudo,pre .pi,pre .doctype,pre .deletion,pre .envvar,pre .shebang,pre .apache .sqbracket,pre .nginx .built_in,pre .tex .formula,pre .erlang_repl .reserved,pre .prompt,pre .markdown .link_label,pre .vhdl .attribute,pre .clojure .attribute,pre .coffeescript .property{color:#88F}pre .keyword,pre .id,pre .phpdoc,pre .title,pre .built_in,pre .aggregate,pre .css .tag,pre .javadoctag,pre .phpdoc,pre .yardoctag,pre .smalltalk .class,pre .winutils,pre .bash .variable,pre .apache .tag,pre .go .typename,pre .tex .command,pre .markdown .strong,pre .request,pre .status{font-weight:bold}pre .markdown .emphasis{font-style:italic}pre .nginx .built_in{font-weight:normal}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:.5}</style>'+
                    '</div>'+
                    '</a:bar>'+
                    '</a:application>';
                    
    
    var hljs;
    require(["./highlight.js/highlight.js"],function(_hl){
        hljs = _hl;
    });
    var marked = require("./marked.js");
    
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
            var _self = this;
            marked.setOptions({
                gfm: true,
                pedantic: false,
                sanitize: true,
                // callback for code highlighter
                highlight: function(code, lang) {
                    if(hljs.AVAIL_LANGUAGES[lang] && !hljs.LANGUAGES[lang]){
                        hljs.GET_LANGUAGES(lang,function(){
                            console.log("loaded",lang);   
                            _self.reRenderDoc();
                        });
                    }
                    if (hljs && hljs.LANGUAGES[lang]) {
                        return hljs.highlight(lang, code).value;
                    }
                    return code;
                }
            });
            var editor = window.barmdpreview;

            this.container = editor.firstChild.firstChild.$ext;

            //Nothing to save
            ide.addEventListener("beforefilesave", function(e) {
                var page = window.tabEditors.getPage();
                return !(page && page.$doc && (page.$doc.previewer || page.$doc.inited));
            });
            this.barmdpreview = this.amlEditor = editor;
            this.barmdpreview.focus = this.focus;
            
            editor.show();
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
            var html = marked(markdownText);
            //var html = markdown.makeHtml(markdownText);
            return html;
        },

        reRenderDoc: function() {
            var _doc = this.curentDoc;
            this.container.innerHTML = this.renderMarkdown(_doc.previewer.$doc.getValue());
            this.barmdpreview.setProperty("value", apf.escapeXML(_doc.session));
        },
        
        setDocument: function(doc) {
            var _self = this;
            if (!doc.previewer && !doc.inited) {
                
                var path = doc.getNode().getAttribute("path");
                
                if(this.docs[path] && this.docs[path].previewer){
                    var _doc = this.docs[path];
                    this.container.innerHTML = this.renderMarkdown(_doc.previewer.$doc.getValue());
                    this.barmdpreview.setProperty("value", apf.escapeXML(_doc.session));
                    this.curentDoc = _doc;
                    //this.focus();
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

                //this.focus();
            }
        },

        focus: function() {
            var page = window.tabEditors.getPage();
            if (!page) return;
            var node = page.$doc.getNode();
            if(this.fileExtensions && node.getAttribute("name").indexOf(this.fileExtensions[0]) >= 2){
                var path = node.getAttribute("path");
                node.setAttribute("name", "Preview: " + apf.getFilename(path).split("."+this.fileExtensions[0])[0]);
            }
        },

        hook: function() {
            window.console.log("Markdown Preview c9ext loaded.");
            var _self = this;
            this.nodes.push(
            menus.addItemByPath("Tools/Preview Markdown", new apf.item({
                onclick: function() {
                    _self.mdpreviewClicked();
                },
                isAvailable: function(editor) {
                    if(window.tabEditors.getPage().name.toString().substr(-3) == ".md")
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