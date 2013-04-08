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
 
define(["dictionary","domutils","contextmenu","rangearray"], function(Dictionary,DomUtils,ContextMenu,RangeArray) {
    var e = DomUtils.createElement;
    
    var LxeQname = function(editor, name)
    {
        var mynode, nsnode, nsepnode, lpnode;
        
        mynode = e("span",{class: "lxe-qname"});
        
        if(editor.prefixForNamespace(name.namespace) !== "")
        {
            nsnode = e("span",{class: "lxe-nsname"}, editor.prefixForNamespace(name.namespace));
            nsepnode = e("span", {"class":"lxe-nssep"}, ":");
            
            mynode.appendChild(nsnode);
            mynode.appendChild(nsepnode);
        }
        
        lpnode = e("span",{"class":"lxe-localname"}, name.localname);
        
        this.__defineGetter("node",function(){return mynode;});
    };
    
    var LxeAttribute = function(editor, elem, name, initialValue)
    {
        var mynode, qname, separator, value, state, cmenu;
        
        cmenu = [
            {
                name: "Edit",
                default: true,
                callback: function()
                {
                    startEdit();
                }
            },
            {
                name: "Delete",
                callback: function()
                {
                    editor.emitChange({
                        type: "delAttribute",
                        address: elem.address,
                        attributeName: name,
                    });
                }
            }
        ];
        
        var startEdit = function(evt)
        {
            value.setAttribute("class","lxe-attribute editing");
            value.contentEditable = true;
            value.focus();
            value.addEventListener("blur", stopEdit);
            
            state = "editing";
        };
        
        var stopEdit = function(evt)
        {
            value.removeEventListener("blur",stopEdit);
            
            var newContent = value.textContent;
            editor.emitChange({
                type: "setAttribute",
                address: elem.address,
                attributeName: name,
                newValue: newContent
            });
            
            value.contentEditable = false;
            state = "idle";
        };
        
        var onClick = function(evt)
        {
            if(evt.button == 2)
            {
                ContextMenu.show(cmenu);
                return false;
            }
            else if(evt.button == 1)
            {
                if (state=="idle")
                {
                    startEdit();
                    return false;
                }
            }
        };
        
        var removeFromDocument = function()
        {
            mynode.parent.removeChild(mynode);
        };
        
        mynode = e("span", {class: "lxe-attribute", "data-name-prefix": name.namespace, "data-name-localname": name.localname});
        mynode.addEventHandler("click",onClick)
        
        qname = new LxeQname(editor, name);
        
        mynode.appendChild(qname.node);
        
        separator = e("span", {"class":"lxe-attrsep"});
        
        mynode.appendChild(separator);
        
        value = e("span", {"class":"lxe-attrval"}, initialValue ? initialValue : "");
        
        mynode.appendChild(value);
        
        this.__defineGetter__("name",function() {return name;});
        this.__defineGetter__("value", function(){return value.textContent;});
        this.__defineSetter__("value", function(val){return value.textContent = val;});
        this.__defineGetter__("node", function(){return mynode;});
        this.removeFromDocument = removeFromDocument;
        
        state = "idle";
    };
    
    var LxeEndTag = function(editor, element, name)
    {
        var mynode, tago, etag, qname, tagc;
        
        qname = new LxeQname(name);
        
        mynode = e("span", {class: "lxe-endtag"},
            tago = e("span",{class:"lxe-tago"},"<"),
            etag = e("span",{class:"lxe-etag"},"/"),
            qname.node,
            tagc = e("span",{class:"lxe-tagc"},">")
        );
        this.__defineGetter__("node", function(){ return mynode;});
    };
    
    var LxeStartTag = function(editor, element, name)
    {
        var mynode, tago, qname, tagc, attributes;
        
        attributes = new Dictionary();
        
        var onMutationEvent = function(mut)
        {
            switch(mut.type)
            {
                case "setAttribute":
                    if (attributes.hasKey(mut.attributeName))
                    {
                        attributes.get(mut.attributeName).value = mut.newValue;
                    }
                    else
                    {
                        var a = new LxeAttribute(editor, element, mut.attributeName, mut.newValue);
                        attributes.set(mut.attributeName, a);
                        mynode.insertBefore(a.node, tagc);
                    }
                    break;
                case "delAttribute":
                    if(attributes.hasKey(mut.attributeName))
                    {
                        attributes.remove(mut.attributeName).removeFromDocument();
                    }
                    break;
                default:
                    break;
            }
        };
        
        var cmenu = [
            {
                name: "Delete element",
                callback: function()
                {
                    editor.emitChange({
                        type: "delete",
                        address: element.address
                    });
                }
            },
            {
                name: "New Attribute...",
                callback: function()
                {
                    var nmtext = window.prompt("Attribute name");
                    var qname = editor.qnameFromString(nmtext);
                    
                    var val = window.prompt("Attribute value");
                    
                    editor.emitChange({
                        type: "setAttribute",
                        address: element.address,
                        attributeName: qname,
                        newValue: val
                    });
                }
            }
        ];
        
        var onClick = function(evt)
        {
            if(evt.button == 2)
            {
                ContextMenu.show(cmenu);
                return false;
            }
            else if (evt.button == 1)
            {
                editor.setCursorByAddress(element.address);
                return false;
            }
        };
        
        
        qname = new LxeQname(name);
        tago = e("span",{class:"lxe-tago"},"<");
        tagc = e("span",{class:"lxe-tagc"},">");
        mynode = e("span",{class:"lxe-starttag"}, tago, qname.node, tagc);
        mynode.addEventHandler("click", onClick);
        
        this.__defineGetter__("node", function(){return mynode;});
        this.__defineGetter__("attributes", function(){return attributes;});
        this.handleChange = onMutationEvent;   
    };
    
    var LxeElement = function(editor, parent, name)
    {
        var mynode, attributes, starttag, endtag, contents, address;
        
        var onMutationEvent = function(mut)
        {
            switch(mut.type)
            {
                case "setAttribute":
                case "delAttribute":
                    starttag.handleChange(mut);
                    break;
                case "insert":
                    doInsert(mut);
                    break;
                case "delete":
                    doDelete(mut);
                    break;
                case "move":
                    doMove(mut);
                    break;
            }
        };
        
        mynode = e("div", {class: "lxe-element"});
        this.handleChange = onMutationEvent;
    };
    
    /****
     * emitChange() emits a mutation *and* processes it internally
     * handleChange() just does the internal processsing.
     ****/
});