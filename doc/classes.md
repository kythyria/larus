namespace DOM
{
    enum DocState
    {
        Idle = 0,
        Pending = 1,
        Unreconcilable = 2
    }
    
    interface Atom
    {
        string toString();
        static Atom fromName(string s);
    }
    
    interface QName
    {
        Atom namespace;
        Atom localname;
    }
    
    interface Document
    {
        DocState opsPending;
        int revision;
        
        DocumentView getCurrent();
        DocumentView getRevision(int revnum);
    }
    
    interface DocumentView : Parent
    {
        readonly bool isLive;
        readonly bool isEditable;
        Document getDocument();
        
        readonly ElementNode realRoot;
        ElementNode root;
        
        ElementNode getElementById(ElemId id);
        //ElementNode[] getElementByXpath(string path);
        //ElementNode[] getElementByCss(string selector);
        
        Dictionary<string, Atom> prefixes;
        
        ElementNode createElement(QName name);
        
        Range createRange(Node start, Node end);
        Fragment createFragment();
        
        void addEventListener(type, listener);
        void addEventListener(type, listener);
        
        MutationObserver createMutationObserver(callback);
    }

    enum NodeAddressType
    {
        Regular = 0;
        RealRoot = 1;
        LogicalRoot = 2;
        Id = 3;
    }
    
    interface NodeAddressComponent
    {
        NodeAddressType type;
        int childNum;
        string id;
    }
    
    interface NodeAddress : Array
    {
        string toString(); //Emit the serialised form!
    }
    
    interface Range : IInsertable
    {
        NodeAddress start;
        NodeAddress end;
        
        Fragment removeFromDocument();
        void delete();
    }
    
    interface Node
    {
        readonly Node parent;
        readonly NodeAddress address;
        readonly DocumentView ownerDocument;   
    }
    
    interface Parent : IInsertable
    {
        void appendChild(IInsertable fragment);
        void prependChild(IInsertable fragment);
        
        void insertAfter(Node n, IInsertable fragment);
        void insertBefore(Node n, IInsertable fragment);
        
        void removeChild(Node n);
        
        void replaceChild(Node original, IInsertable newNodes);
        
        NodeCollection children;
        
        string textContent;
    }
    
    interface Element : Parent, Node
    {
        string getAttribute(QName attr);
        void setAttribute(QName attr, string value);
        void deleteAttribute(QName attr);
        
        void eachAttribute(function(name, value) callback);
        
        QName name;
    }
    
    interface CharNode : Node
    {
        string character;
        string getNeighbours();
    }
    
    // This is just a parent for Node, Range, etc.
    interface IInsertable
    {
        
    }
    
    interface Fragment : IInsertable, Parent
    {
        
    }
}

namespace Mutations
{
    enum MutType
    {
        insert = 0;
        delete = 1;
        move = 2;
        setAttribute = 3;
        delAttribute = 4;
        mergeInsert = 5;
    }
    
    interface Mutation
    {
        MutType type;
        NodeAddress target;
        string childId; //For mergeInsert
        
        int position;
        int length; // Move/delete only
        NodeAddress destination; //Move only
        int destPosition; //Move only
        
        //For setAttribute and delAttribute
        QName attributeName;
        string newValue;
        
        //For insert
        union { string, Element } inserted[];
    }
}