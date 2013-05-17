/**
 * Mutation
 * 
 * This is a stub, since Mutation works quite well as a plain old JS object, bar
 * that we need somewhere to put the revivify() function.
 **/
 
define("mutation",["qname","address"],function(QName, Address) {
    return {
        revivify: function(jsn) {
            if (jsn.target) { jsn.target = Address.revivify(jsn.target); }
            if (jsn.destination) { jsn.destination = Address.revivify(jsn.destination); }
            if (jsn.attributeName) { jsn.attributeName = QName.revivify(jsn.attributeName); }
            
            return jsn;
        }
    };
});