/***
 * DomUtils
 * 
 * General DOM-related helper functions.
 * 
 * Static methods
 *      createElementDocument(doc,elemspec...)
 *          Creates an element for the given document
 *      createElement(elemspec...)
 *          Creates an element for the default document
 *      keyFromEvent(evt: KeyboardEvent)
 *          Returns a string indicating the key pressed in evt.
 *          Currently only works for alphabetic keys.
 * 
 * Elemspec
 *      This is varargs, minimum length one. The first item must be a string,
 *      the second can be string, element, or an object.
 *      
 *      The first item is the name of the element to create.
 * 
 *      The second, if it is an object, is the attributes of the object.
 * 
 *      The remaining items are a mixture of DOMElements and strings, the latter
 *      representing text nodes.
 */

define("domutils",[],function(){
    var ced;
    
    ced = function(doc,name)
    {
        var args = [].slice.call(arguments);
        var el = doc.createElement(name);
        var elemspec = args.slice(1);
        
        if(elemspec.length == 1) return el;
        
        elemspec.shift();
        
        if (!(elemspec[0] instanceof Node) && !(elemspec[0] instanceof String))
        {
            for (var j in elemspec[0])
            {
                el.setAttribute(j, elemspec[0][j]);
            }
            elemspec.shift();
        }
        elemspec.forEach(function(i)
        {
            if (typeof i == "string") i = doc.createTextNode(i);
            el.appendChild(i)
        });
        
        return el;
    };
    
    var ce = function(name)
    {
        var arglist = [document].concat([].slice.call(arguments));
        return ced.apply(this, arglist);
    }
    
    var keys =
    {
        65:"A",
        66:"B",
        67:"C",
        68:"D",
        69:"E",
        70:"F",
        71:"G",
        72:"H",
        73:"I",
        74:"J",
        75:"K",
        76:"L",
        77:"M",
        78:"N",
        79:"O",
        80:"P",
        81:"Q",
        82:"R",
        83:"S",
        84:"T",
        85:"U",
        86:"V",
        87:"W",
        88:"X",
        89:"Y",
        90:"Z",
    };
    
    var keyEventKey = function(evt)
    {
        return keys[evt.keyCode]
    };
    
    return { createElementDocument: ced, createElement: ce,};
});