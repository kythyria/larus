/**
 * QName
 * 
 * Represents a qualified name ala the XML Namespaces specification. No prefixes here, just namespace URIs directly.
 * 
 * Properties
 *      readonly namespace
 *          URI of the namespace part of this name
 *      readonly localname
 *          Local part of the name.
 * 
 * Static methods
 *      revive(jsn)
 *          Function to pass to JSON.parse to get a QName from its JSON representation.
 **/
define("qname",[],function(){
    var QName = function(namespace, localname)
    {
        this.__defineGetter__("namespace",function(){return namespace;});
        this.__defineGetter__("localname",function(){return localname;});
    };
    
    QName.revivify = function(jsn)
    {
        return new QName(jsn.namespace, jsn.localname);
    };
    
    return QName;
});