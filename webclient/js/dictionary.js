define([],function(){
    return function()
    {
        var store = {};
        var keys = [];
        
        var decorate = function(key)
        {
            return "+$$" + key.toString();
        }
        
        var get = function(key)
        {
            return store[decorate(key)];
        };
        
        var set = function(key, value)
        {
            if(keys.indexOf(key)==-1) keys.push(key);
            return store[decorate(key)] = value;
        };
        
        var forEach = function(fn)
        {
            keys.forEach(function(i){
                fn(i, get(i));
            });
        };
        
        var remove = function(key)
        {
            var idx = keys.indexOf(key);
            if (idx == -1) return;
            
            keys.splice(idx,1);
            var removed = get(key);
            delete store[decorate(key)];
            return removed;
        };
        
        var hasKey(k)
        {
            return keys.indexOf(k) != -1;
        };
        
        this.get = get;
        this.set = set;
        this.forEach = forEach;
        this.remove = remove;
    };
});