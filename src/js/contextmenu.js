define("contextmenu",["domutils"],function(DomUtils){
    var e = DomUtils.createElement;
    return {
        show: function(ctx)
        {
            var n, node = e("ul", {class:"ctx-menu"});
            ctx.forEach(function(i){
                n = e("li",i.name);
                if (i.default) n.setAttribute("class","ctx-defaultitem");
                n.addEventListener("click",function(){
                    node.parent.removeChild(node);
                    i.callback();
                });
                node.appendChild(n);
            });
            n = e("li",{class: "ctx-closebutton"},"Cancel")
            n.addEventListener("click",function(evt){
                node.parent.removeChild(node);
            });
            document.body.appendChild(node);
        }
    };
});