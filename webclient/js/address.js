/****
 * Address class.
 * 
 * Due to Javascript not allowing overloads, -1 is used to represent the real root, and strings any id-based components.
 * 
 * Additional methods:
 * 
 *      isParentOf(other)
 *          True if this is a prefix of other.
 * 
 *      childIndex(addr)
 *          If we are a parent of addr, return the component which indicates which
 *          of our immediate children is or contains the node addr refers to.
 * 
 *      addrOfChild(childidx)
 *          Return an address referring to the childidx'th child of the node this one refers to.
 * 
 *      toJSON()
 *          Return an Array that can be reconstituted into an Address.
 * 
 *      siblingOf(addr)
 *          check if two addresses are siblings.
 * 
 *      component(i)
 *          The i'th component of the address.
 *      normalise()
 *          Return an address with everything before the last id or real root removed.
 * 
 * Properties:
 *      myIndex
 *          The number of this node's position among its siblings.
 *      startPoint
 *          The id of the node this address uses as a reference point. Either Address.realRoot
 *          or the leafmost id in the address.
 *      parent
 *          The address of this node's parent, or null if none can be determined from the address alone.
 *      length
 *          The number of components in this adddress
 * 
 * Static Properties:
 *      realRoot
 *          Address referring to the real root of the document.
 * 
 * Constructor:
 *      Address(ary)
 *          Construct an Address out of ary, which must be in the format toArray() returns.
 */
 define([],function(){
    var Address = function()
    {
        var components  = arguments[0] ? arguments[0] : [-1];
        
        this.isParentOf = function(addr)
        {
            if(addr.length < this.length) return false;
            
            for(var i = 0; i < this.length; i++)
            {
                if (addr.component(i) != this.component(i)) return false;
            }
            return true;
        };
        
        this.childIndex = function(addr)
        {
            if(this.isParentOf(addr))
            {
                return addr.component(this.length);
            }
        };
        
        this.addrOfChild = function(idx)
        {
            return new Address(components.concat([idx]));
        };
        
        this.toJSON = function()
        {
            return components;
        };
        
        this.siblingOf = function(addr)
        {
            if (addr.length != this.length) return false;
            
            for(var i = 0; i < this.length-1; i++) //Not the last item, since that's what tells we're siblings
            {
                if (this.component(i) != addr.component(i)) return false;
            }
        };
        
        this.component = function(i)
        {
            return components[i];
        };
        
        this.normalise = function()
        {
            for (var i = components.length-1; i >= 0; i--)
            {
                if (typeof(components[i]) == "string" || components[i] == -1)
                {
                    return new Array(components.slice(i));
                }
            }
        };
        
        var getStartPoint = function()
        {
            
            for (var i = this.length-1; i >= 0; i--)
            {
                if (typeof(components[i]) == "string" || components[i] == -1) { return components[i] }
            }
        };
        
        var getParent = function()
        {
            if (this.length == 1)
            {
                return null;
            }
            
            return new Address(components.slice(0,-1));
        };
        
        var getLength = function()
        {
            return components.length;
        }
        
        this.__defineGetter__("myIndex",function(){return components[components.length-1]});
        this.__defineGetter__("startPoint", getStartPoint);
        this.__defineGetter__("parent", getParent);
        this.__defineGetter__("length", getLength);
    };
    
    Address.revive = function(jsn) { return new Address(jsn); };
    
    Object.defineProperty(Address, "realRoot", {value: new Address([-1])} );
    
    return Address;
 });