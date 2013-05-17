define("dictionary",[],function(){
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
        
        var hasKey = function(k)
        {
            return keys.indexOf(k) != -1;
        };
        
        var rassoc = function(v)
        {
            for(var i = 0; i < keys.length; i++)
            {
                if(get(keys[i])==v) return keys[i];
            }
            return undefined;
        }
        
        this.get = get;
        this.set = set;
        this.forEach = forEach;
        this.remove = remove;
        this.hasKey = hasKey;
        this.rassoc = rassoc;
    };
});