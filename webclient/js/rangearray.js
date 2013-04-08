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
 *      point.
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
 *      Returns the object that index is within
 * 
 *   set(index,value)
 *      Replaces whatever index is within with value
 * 
 *   insert(index,value)
 *      Inserts value at index. Attempts to merge the item with the items to each
 *      side of it. If index is negative, start from the end such that -1 inserts
 *      after the last item.
 *   
 *   splice(index,array)
 *      Inserts the contents of another Array or RangeArray at index. If inserted
 *      mid-item, that item is split and the array compacted after insertion.
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

define([],function(){
    return function()
    {
        /****
         * The array is stored as an array of [position,length,value] tuples.
         ****/
         var contents = [];
    };
});