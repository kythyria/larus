define([],function(){
    var ced;
    
    ced = function(doc,ary)
    {
        var el = doc.createElement(ary[0]);
        
        ary.slice(1).forEach(function(i)
        {
            switch(typeof(i))
            {
                case "object":
                    for (var j in i)
                    {
                        el.setAttribute(j[0], j[1]);
                    }
                    break;
                case "string":
                    el.appendChild(doc.createTextNode(i));
                    break;
                case "array":
                    el.appendChild(ced(doc,i));
                    break;
            }
        });
        
        return el;
    };
    
    var ce = function(ary)
    {
        ced(document,ary);
    }
    
    return { createElementDocument: ced, createElement: ce };
});