/**
 * Your extension for Cloud9 IDE!
 * 
 * Inserts a context menu item under the "Edit" menu, which, when
 * clicked, displays a simple window with a "Close" button.
 */
define(function(require, exports, module) {

var ext = require("core/ext");

var menus = require("ext/menus/menus");
var markup = require("text!./popout.xml");
var _showdown = require("./showdown.js").Showdown;
var markdown = new _showdown.converter();

module.exports = ext.register("ext/popout/popout", {
    name     : "Splitview Popout",
    dev      : "Bradley Matusiak",
    alone    : true,
    deps     : [],
    type     : ext.GENERAL,
    markup   : markup,
    nodes : [],
    previews : {},

    init : function(){
        var _self = this;
        
        this.nodes.push(
            menus.addItemByPath("Tools/Markdown Viewer Popout", new apf.item({
                onclick : function(){
                    _self.createNewFileiFrame();
                },
                isAvailable : function(editor){
                    if(window.tabEditors.getPage().name.toString().substr(-3) == ".md")
                    return true;
                }
            }), 5400)
        );
    },

    createNewFileiFrame : function(){
        var self = this;
        var url = require.toUrl("./popout.html");
        var curPage = window.tabEditors.getPage();
        
        if(!self.previews[curPage.id]){
            self.previews[curPage.id] = {};
        }
        
        var thisPopout = self.previews[curPage.id];
        
        if(thisPopout.window && !thisPopout.closed){
            thisPopout.window.focus();
        }else{
            thisPopout.window = window.open(url, curPage.id, 'resizable=yes,height=600,width=800', false);
            thisPopout.window.onload= function(){
                thisPopout.closed = false;
                
                thisPopout.window.onunload = function(){
                    thisPopout.closed = true;
                    
                };
                
                if(thisPopout.window.$Popout){
                    //popout setup
                    thisPopout.window.$Popout(function(_editor,setMarkdown){
                        
                        _editor.setValue(curPage.$doc.getValue());
                        _editor.getSession().setMode("ace/mode/markdown");
                        
                        thisPopout.editor = _editor;
                        thisPopout.editing = curPage;
                        
                        var crossChange = false;
                        setMarkdown(markdown.makeHtml(_editor.getValue()+"<div id='spacer'></div>"));
                        _editor.on("change", function(e){
                            if(!crossChange){
                                crossChange = true;
                                curPage.$doc.setValue(_editor.getValue()); 
                                
                                crossChange = false;
                            }
                            setMarkdown(markdown.makeHtml(_editor.getValue()+"<div id='spacer'></div>"));
                            
                        });
                        curPage.$doc.acedoc.on("change", function(e){
                            if(!crossChange){
                                crossChange = true;
                                _editor.setValue(curPage.$doc.getValue());
                                _editor.getSelection().clearSelection();
                                crossChange = false;
                            }
                        });
                    });
                    
                

                }
            };
        }
    },
    
    hook : function(){
        ext.initExtension(this);
    },

    enable : function(){
        this.nodes.each(function(item){
            item.enable();
        });
    },

    disable : function(){
        this.nodes.each(function(item){
            item.disable();
        });
    },

    destroy : function(){
        this.nodes.each(function(item){
            item.destroy(true, true);
        });
        this.nodes = [];
    }
});

});