/**
 * Fakepipe
 * 
 * This presents the ChangePipe interface that EditComponent expects, with the caveat
 * that it doesn't actually send mutations anywhere except a textarea, while incoming
 * mutations are drawn from an input line.
 * 
 * Constructor
 *      FakePipe(if: DOMElement)
 *          Create a FakePipe, putting its UI in if
 * 
 * Properties
 *      node: readonly DOMElement
 *          The element the FakePipe's UI is in
 *      handleChange: function(m: mutation)->void
 *          Callback invoked each time the FakePipe is given a mutation by the user
 * 
 * Methods
 *      emitChange(m: mutation)
 *          Called to dispatch a mutation (to the log, in this case).
 **/
 
define("fakepipe",["domutils", "mutation", "address"],function(DomUtils, Mutation, Address){
    return function(mynode)
    {
        var e = DomUtils.createElementDocument.bind(DomUtils, mynode.ownerDocument);
        var textarea, button, inputline, callback;
        
        var onSubmit = function(evt)
        {
            var mut = Mutation.revivify(JSON.parse(inputline.value));
            textarea.value += "\n<< " + inputline.value;
            callback(mut);
            inputline.value = "";
            evt.preventDefault();
            return false;
        };
        
        this.emitChange = function(mut)
        {
            textarea.value += "\n>> " + JSON.stringify(mut);
        };
        
        mynode.appendChild(textarea = e("textarea"));
        mynode.appendChild(e("br"));
        mynode.appendChild(inputline = e("input", {type:"text"}));
        mynode.appendChild(e("br"));
        mynode.appendChild(button = e("button","send"));
        
        mynode.classList.add("fp-fakepipe");
        button.addEventListener("click",onSubmit);
        
        this.__defineGetter__("node", function(){return mynode;});
        this.__defineGetter__("handleChange", function(){return callback;});
        this.__defineSetter__("handleChange", function(val){callback = val; return val;});
    };
});