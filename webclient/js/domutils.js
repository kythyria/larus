define([],function(){
    var ced;
    
    ced = function(doc,name)
    {
        var el = doc.createElement(name);
        
        if(arguments.length == 1) return el;
        
        arguments.shift();
        
        if (!(arguments[0] instanceof Node))
        {
            for (var j in arguments[0])
            {
                el.setAttribute(j[0], j[1]);
            }
            arguments.shift();
        }
        arguments.forEach(function(i)
        {
            if (typeof i == "string") i = doc.createTextNode(i);
            el.appendChild(i)
        });
        
        return el;
    };
    
    var ce = function(name)
    {
        ced.apply(this, arguments);
    }
    
    return { createElementDocument: ced, createElement: ce,};
});