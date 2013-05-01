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
 
define(["dictionary","domutils","contextmenu","address","qname"], function(Dictionary,DomUtils,ContextMenu,Address,Qname) {
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
    
    var LxeCharacter = function(editor, parent, char)
    {
        var myIndex;
        var mynode = e("span",char);
        
        var removeFromDocument = function()
        {
            mynode.parent.removeChild(mynode);
        };
        
        var onClick = function(evt)
        {
            if (evt.button == 1)
            {
                editor.setCursorByAddress(this.address);
                return false;
            }
        };
        
        var getAddress = function()
        {
            if (!parent) return Address.realRoot;
            
            return parent.address.addrOfChild(myIndex);
        };
        
        this.__defineGetter__("myIndex", function(){return myIndex;});
        this.__defineSetter__("myIndex", function(val){myIndex = val; return val});
        this.__defineGetter__("address", getAddress);
        this.__defineGetter__("node", function(){return mynode;});
        this.__defineGetter__("char", function(){return char;});
        this.removeFromDocument = removeFromDocument;
    };
    
    var LxeElement = function(editor, parent, name)
    {
        var mynode, starttag, contenttag, endtag, contents, myIndex;
        
        var updatePositions = function(startingFrom)
        {
            for (var i = startingFrom; i < contents.length; i++)
            {
                contents[i].address.myIndex = i;
            }
        };
        
        var doInsertElement = function(mut)
        {
            var elem = new LxeElement(editor, this, mut.inserted);
            
            if(mut.position >= contents.length)
            {
                contents.push(elem);
                contenttag.appendChild(elem.node);
            }
            else
            {
                 contents.splice(mut.position, 0, elem);
                 contenttag.insertBefore(elem.node,contenttag.children[mut.position]);
            }
            
            updatePositions(mut.position);
        };
        
        var doInsertText = function(mut)
        {
            var i; //scope is per-function >_>
            if(mut.childPosition >= contents.length)
            {
                for(i = 0; i < mut.inserted.length; i++)
                {
                    var c = new LxeCharacter(editor, this, mut.inserted[i]);
                    contents.push(c);
                    contenttag.appendChild(c);
                }
            }
            else
            {
                var chars = [];
                for(i = 0; i < mut.inserted.length; i++)
                {
                    chars.push(new LxeCharacter(editor, this, mut.inserted[i]));
                    contenttag.insertBefore(chars[i],contenttag.children[mut.position]);
                }
                Array.splice.apply(contents, [mut.position, 0].concat(chars));
            }
            
            updatePositions(mut.position);
        };
        
        var doDelete = function(mut)
        {
            var length = mut.length ? mut.length : 1;
            var removed = contents.splice(mut.position, length);
            removed.forEach(function(i){i.removeFromDocument();});
            updatePositions(mut.position);
            return removed;
        };
        
        var doMove = function(mut)
        {
            var removed = doDelete(mut);
            editor.handleChange({
                type: "completeMove",
                address: mut.destination,
                position: mut.destPosition,
                payload: removed
            });
            
        };
        
        var completeMove = function(mut)
        {
            for(var i = 0; i <= mut.payload.length; i++)
            {
                i.parent = this;
                if(mut.position+i >= contents.length)
                {
                    contents.push(mut.payload[i]);
                    contenttag.appendChild(mut.payload[i].node);
                }
                else
                {
                    contents.splice(mut.position+i,0,mut.payload[i]);
                    contenttag.insertBefore(mut.payload[i],contenttag.children[mut.position+i]);
                }
            }
            updatePositions(mut.position);
        };
        
        var onMutationEvent = function(mut)
        {
            if (this.address.isParentOf(mut.address))
                return contents[this.address.childIndex(mut.address)].handleChange(mut);
            
            switch(mut.type)
            {
                case "setAttribute":
                case "delAttribute":
                    starttag.handleChange(mut);
                    break;
                case "insertElement":
                    doInsertElement(mut);
                    break;
                case "insertText":
                    doInsertText(mut);
                    break;
                case "delete":
                    doDelete(mut);
                    break;
                case "move":
                    doMove(mut);
                    break;
                case "completeMove": // This isn't a real op, it's just so I don't have to code the addressing logic twice.
                    completeMove(mut);
                    break;
            }
        };
        
        var removeFromDocument = function()
        {
            mynode.parent.removeChild(mynode);
        };
        
        var getAddress = function()
        {
            if (!parent) return Address.realRoot;
            
            return parent.address.addrOfChild(myIndex);
        };
        
        var setId = function(newid)
        {
            
        };
        
        starttag = new LxeStartTag(editor, this, name);
        contenttag = e("div", {class: "lxe-elementcontent"});
        endtag = LxeEndTag(editor, this, name);
        mynode = e("div", {class: "lxe-element"}, starttag.node, contenttag, endtag.node);
        
        this.handleChange = onMutationEvent;
        this.removeFromDocument = removeFromDocument;
        this.__defineGetter__("myIndex", function(){return myIndex;});
        this.__defineSetter__("myIndex", function(val){myIndex = val; return val});
        this.__defineGetter__("address", getAddress);
        this.__defineGetter__("node", function(){return mynode;});
    };
    
    /****
     * Methods
     *      prefixForNamespace(ns)
     *          return a short prefix to describe the namespace: the h in xmlns:h="http://www.w3.org/1999/xhtml"
     *          If there's no such prefix, return the empty string.
     * 
     *      emitChange()
     *          emits a mutation *and* processes it internally
     * 
     *      handleChange()
     *          just does the internal processing.
     *      
     *      qnameFromString(str, defaultns)
     *          Takes a string of the form "prefix:local" and returns a qname for it.
     *          If there is no prefix, use defaultns as the namespace.
     * 
     * Properties:
     *      cursorPosition
     *          get or set where the cursor is.
     * 
     *      selectionStart
     *          start of the selection
     * 
     *      selectionEnd
     *          end of the selection
     * 
     *      changePipe
     *          Object with an emitChange() method which is called every time the
     *          editor generates a mutation, and a handleChange property which is
     *          a callback to notify the editor of incoming mutations.
     *          
     * 
     * Because it's actually simpler, a vilike interface:
     * Normal mode:
     *      a and d to move like left and right arrows
     *      w and s to jump in and out of the proximate element.
     *      q to mark the first position
     *      e to mark the second
     *      r to clear the selection
     *      
     *      m to move the selection to the cursor position
     *      j to insert text
     *      k to insert element
     * 
     *      u to append text (insert after current position)
     *      i to append element
     * 
     *      d to delete the selection (or the current item if no selection).
     * 
     * Note that the editor swaps the start and end of selection if otherwise end would be before start.
     * After all, the alternative would be to reject them entirely.
     ****/
     
    return function()
    {
        var selectStart, selectEnd, cursorPos, mynode, prefixes, changePipe, rootElement;
        
        this.handleChange = function(mut)
        {
            rootElement.handleChange(mut);
        };
        
        this.emitChange = function(mut)
        {
            changePipe.emitChange(mut);
            this.handleChange(mut);
        };
        
        this.qnameFromString = function(str, defaultns)
        {
            var m = /^([^:]*):(.*)$/.exec(str);
            if(m)
            {
                var ns = prefixes.rassoc(m[1]);
                var ln = m[2];
                return new Qname(ns,ln);
            }
            else
            {
                return new Qname(defaultns, str);
            }
        }
        
        this.prefixForNamespace = function(ns)
        {
            var prefix = prefixes.get(ns);
            return prefix ? prefix : "";
        }
        
        var onKeyPress = function(evt)
        {
            switch(DomUtils.keyEventkey(evt.key))
            {
                case "W":
                    
                case "A":
                    
                case "S":
                    
                case "D":
                
                case "Q":
                    
                case "E":
                    
                case "R":
                    
                case "M":
                    
                case "J":
                    
                case "K":
                    
                
            }
        }
        
        prefixes = new Dictionary();
        
        //Really these should be loaded from a configuration or something.
        prefixes.set("http://www.w3.org/XML/1998/namespace","xml"); //Except for this one, which MUST be present as per the XML namespace spec.
        prefixes.set("http://ns.berigora.net/2013/larus/structural/0","larus");
        prefixes.set("http://ns.berigora.net/2013/larus/doctype/0","dtd")
        prefixes.set("http://www.w3.org/1999/xhtml","html");
    };
});