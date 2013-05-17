/****
 * RangeArray is a peculiar thing: it's an ordered collection with integer keys like Array is, but a value can be
 * associated with an entire range of contiguous keys. That is:
 * 
 * ra = new RangeArray();
 * ra.set(0) = "foo";
 * ra.set(1,15) = "bar";
 * ra.set(16,4) = "baz";
 * 
 * ra.get(0); #=> "foo"
 * ra.get(8); #=> "bar"
 * ra.get(16); #=> "baz"
 * 
 * Methods exist for inserting an item of a given size and shifting subsequent items down to fit,
 * and requesting an item split itself so that an item can be inserted at the split point.
 * 
 * Constructor
 *   RangeArray(manipulator)
 *      see the manipulator property for what this argument is.
 * 
 * Properties
 *   manipulator
 *      Defines how to operate on items in the array
 *      {
 *          canMerge: function(item,item)->boolean,
 *          split: function(item,pos)->[item,item],
 *          merge: function(item,pos,item)->item,
 *          length: function(item)->integer,
 *          updatePosition: function(item, position)->void
 *      }
 * 
 *      canMerge returns if two items can be combined
 * 
 *      split takes an item and a position relative to the start of the item and
 *      returns an array containing the result of splitting the item at the given
 *      point. If splitting at 0 or past the end of item, return [item]
 * 
 *      merge takes two items and a position and inserts the second at the given
 *      position in the first, returning the merged item.
 *      For example:
 *          canMerge("foobar","quux") #=> true
 *          split("foobar",3) #=> ["foo","bar"]
 *          merge("foobar",3,"quux") #=> "fooquuxbar"
 *      
 *      length simply returns the length of its argument.
 *      
 *      updatePosition is used to tell an item whose position has changed its new
 *      position.
 * 
 * Methods
 *   get(index)
 *      Returns the object that index is within.
 * 
 *   set(index,value)
 *      Replaces whichever item index is within with value. If value is longer or
 *      shorter, subsequent items move accordingly. If inserted somewhere there's
 *      no item, act like insert()
 * 
 *   insert(index,value)
 *      Inserts value at index. Attempts to merge the item with the items to each
 *      side of it. If index is negative, start from the end such that -1 inserts
 *      after the last item.
 *   
 *   splice(index,array: {forEach: function(item)->void})
 *      Inserts the contents of another Array or RangeArray at index. If inserted
 *      mid-item, that item is split.
 *  
 *   remove(index)
 *      Removes the item at or around index
 * 
 *   find(callback)
 *      Finds the first index of the first item for which callback returns true;
 * 
 *   forEach(callback(item,index,length)->void)
 *      call callback for each item in order. Not each position, each item. Index
 *      and length being passed afterwards so that the first argument is the item
 *      like wih normal forEach.
 * 
 *   compact()
 *      Removes nils, then attempts to merge all mergeable items.
 * 
 *   push(item)
 *      Appends item to the end of the array. Really just a shorthand for calling
 *      insert(-1,item)
 ****/

define("rangearray",[],function(){
    return function(manipulator)
    {
        /***
         * values is an array of [length,value] arrays.
         * Holes are impossible, and they don't really matter for the intended use
         * anyway.
         */
        var values = [], totalLength = 0;
        var get,set,insert,splice,forEach,compact,push, recalcLengths;
        
        recalcLengths = function()
        {
            totalLength = values.map(function(i){return i[0];}).reduce(function(m,v){return m+v;});
        };
        
        //Positive indexes only!
        get = function(idx)
        {
            var incr = 0;
            
            for (var i = 0; i < values.length; i++)
            {
                if (incr <= idx && (incr + values[i][0]) > idx) return values[idx][1];
                else incr += values[i][0];
            }
            return undefined;
        };
        
        //Still positive indexes only!
        set = function(idx, value)
        {
            var incr = 0;
            
            for (var i = 0; i < values.length; i++)
            {
                if (incr <= idx && (incr + values[i][0]) > idx)
                {
                    values[idx] = [manipulator.length(value),value];
                    recalcLengths();
                    return value;
                }
                else incr += values[i][0];
            }
            values.push([manipulator.length(value), value]);
            recalcLengths();
            return value;
        };
        
        
        // For this, 0 is before the first item, -1 is after the last item.
        insert = function(idx,value)
        {
            if (idx < 0)
            {
                idx += totalLength + 1;
                idx = idx < 0 ? 0 : idx;
            }
        
            var currentPosition = 0;
            
            for (var i = 0; i < values.length; i++)
            {
                if (currentPosition <= idx && (currentPosition + values[i][0] > idx))
                {
                    var vals = manipulator.split(values[i][1],idx - currentPosition);
                    vals.splice(currentPosition==idx ? 0 : 1 ,0,value);
                    vals = vals.map(function(item){return [manipulator.length(item),item];});
                    Array.splice.apply(values,[i,1].concat(vals));
                    recalcLengths();
                    return value;
                }
                else currentPosition += values[i][0];
            }
            values.push([manipulator.length(value), value]);
            recalcLengths();
            return value;
            
        };
    };
});