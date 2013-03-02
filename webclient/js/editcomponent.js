/*
 * XML editing component.
 * 
 * Constructor:
 *   LxeEditorWidget(panel)
 *   Where panel is the element which the editor is initialised in.
 *
 * Methods:
 *   lew.setDocumentView(doc)
 *     Change the editor to contain a new DocumentView. Note that calling this method wipes out the cursor positioning information, selection, scroll position, etc.
 *   lew.closeDocumentView()
 *     Stop using the current DocumentView, emptying the display, clearing callbacks, and so forth.
 *   lew.deleteSelection()
 *     Erase currently selected nodes.
 *   lew.getSelectedNodes()
 *   lew.setSelectedNodes(Range)
 *     Get/set a Range corresponding to the user's selection
 *   lew.getCursorPosition()
 *   lew.setCursorPosition(NodeAddress)
 *     Manipulate cursor position
 *   lew.insertBlankElement()
 *     Insert a blank element at the current cursor position.
 *   lew.insertAttribute()
 *     Begin inserting an attribute at the element the selection point is within.
 *   lew.insertComment()
 *   lew.insertPI()
 *     Insert a comment or processing instruction at the nearest point to the cursor that one may be inserted (prefers to go up the tree)
 *   lew.setTheme(url)
 *     Replace the theme CSS.
 *   
 */
 
define([], function() {
    
    //Class that wraps MutationObserver in order to create dummy events when observe is called.
    //This saves explicit tree-walking code in the caller, since the events walk the tree.
    //Note that it does not let you create
    var WalkingMutationObserver = function(doc, callback)
    {
        var realobserver = doc.createMutationObserver(callback);
        var observeoptions;
        var doneinitialobserve = false;
        var queue = [];
        
        var recurse = function(targetNode)
        {
            targetNode.eachAttribute(function(name, value){
                queue.push({
                    type:          "attribute",
                    target:        targetNode,
                    addedNodes:    null,
                    removedNodes:  null,
                    attributeName: name
                });
            });
            
            if (targetNode.children.length > 0)
            {
                queue.push({type:"childnodes", target: targetNode, addedNodes: targetNode.children, previousSibling: null, nextSibling: null,});
                targetNode.children.forEach(recurse);
            }
        };
        
        var initialobserve = function(target)
        {
            if(doneinitialobserve) return;
            
            recurse(target);
            
            callback(queue);
            queue = [];
            doneinitialobserve = true;
        };
        
        this.observe = function(target, options)
        {
            observeoptions = options;
            initialobserve(target);
            return realobserver.observe(callback, options);
        };
        
        this.disconnect = function()
        {
            return realobserver.disconnect();
        };
        
        this.takeRecords = function()
        {
            return realobserver.takeRecords();
        };
    };
    
    var LxeQname = function(editor, name)
    {
        var mynode, nsnode, nsepnode, lpnode;
        
        mynode = editor.document().createElement("span");
        mynode.setAttribute("class","lxe-qname");
        
        if(editor.prefixForNamespace(name.namespace) != "")
        {
            nsnode = editor.document().createElement("span");
            nsnode.setAttribute("class","lxe-nsname");
            nsnode.appendChild(editor.document().createTextNode(editor.prefixForNamespace(name.namespace)));
            
            nsepnode = editor.document().createElement("span");
            nsepnode.setAttribute("class","lxe-nssep");
            nsepnode.appendChild(editor.document().createTextNode(name.localname));
            
            mynode.appendChild(nsnode);
            mynode.appendChild(nsepnode);
        }
        
        var lpnode = editor.document().createElement("span");
        lpnode.setAttribute("class","lxe-localname")
    };
    
    var LxeAttribute = function(editor, elem, name, initialValue)
    {
        var mynode, qname, value;
        
        (function() {
            mynode = editor.document().createElement("span");
            mynode.setAttribute("class","lxe-attribute");
            mynode.setAttribute("data-name-prefix", name.namespace);
            mynode.setAttribute("data-name-localname", name.localname);
            
            qname = new LxeQname(editor, name);
            
            mynode.appendChild(qname.getNode());
        )();
    };
    
    /*
      Widget representing an element. Knows how to make its little subtree in the UI, do the hide and show, etc.
      
      methods:
        setAttribute(name, val)
        delAttribute(name)
        insertChild(num)
        delChild(num,num)
        insertText(str)
        processMutation(mut)
      It then generates mutations as appropriate. Doesn't need to know about moves or mergeinserts, those get exploded or eaten before they get here.
    */
    var LxeElement = function(editor, parent)
    {
        var mynode, starttag, attributes;
        this.processMutation = function(mut)
        {
            switch(mut.type)
            {
                case "insert":
                    break;
                case "delete":
                    break;
                case "setAttribute":
                    if(attributes.hasKey(mut.attributeName))
                    {
                        attributes.get(mut.attributeName).setValue(mut.newValue);
                    }
                    else
                    {
                        var att = new LxeAttribute(editor, this, mut.attributeName, mut.newValue);
                        starttag.insertBefore(starttag.lastChild, att.getElement());
                    }
                    break;
                case "delAttribute":
                    var att = attributes.remove(mut.attributeName);
                    att.removeFromDisplay();
                    break;
            }
        };
    };
    
    return function(editorwindow)
    {
        //private variables;
        var docview, docobserver, gutter, doccontainer;
        var elemtoui = {};
        var editEnabled = false;
        
        var onMutationEvent = function(eventList)
        {
            eventList.forEach(function(i){
                switch(i.type)
                {
                    case "attribute":
                        var stag = elemtoui[i.target.address].querySelectorAll();
                }
            });
        };
        
        this.closeDocumentView = function()
        {
            while(doccontainer.hasChildNodes())
            {
                doccontainer.removeChild(doccontainer.firstChild);
            }
        };
        
        this.setDocumentView = function(doc)
        {
            this.closeDocumentView();
            docview = doc.getCurrent();
            editEnabled = docview.isEditable;
            docobserver = new MutationObserver(docview,onMutationEvent);
        }
        
        (function()
        {
            gutter = document.createElement("div");
            gutter.setAttribute("class","lxe-gutter");
            editorwindow.appendChild(gutter);
            
            doccontainer = document.createElement("div");
            doccontainer.setAttribute("class", "lxe-doctcontainer");
        })();
    };
});