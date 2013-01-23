Requirements
============
(this document is as much a rationale as requirements, technically)

Whilst to be useful Larus must be more than a set of algorithms for performing synchronisation, nonetheless those algorithms are the core. Hence, they will be considered first.

Firstly, an application must never be presented with an ill-formed document. Ideally, the algorithms and structures used will not permit the formation of such a document in the first place. Whether this is done by validation or by ensuring that nothing can represent an ill-formed document is irrelevant to an application except insofar as it affects the operations available.

Speaking of operations, a set must be defined of operations which must be supported. This rests in turn on deciding what model these operations act upon, which will govern the choice of concrete representations, and of the algorithms that operate on them.

Simplifying XML
---------------
Unlike its predecessor, XML is not tremendously complicated, and we can safely make it less so without much loss of power. In particular, removing all the parts relating to DTDs will eliminate a great deal of the grammar. This has the downside that entity references cannot be resolved, however the use of entities that expand to anything other than single characters is rare, and so not much is lost, since one-character entities are normally used to insert characters that would otherwise be awkward to use, either because normal keyboards don't have them, or because they would confuse the parser.

Since any useful implementation would likely represent tags as something other than a string starting with a left angle bracket, and entities other than numeric character references or the five built in to XML, are impossible since there's no DTD, it follows that there is no need for the five built in entities either. Thus the only required entities are numeric character references, and if we declare the document encoding to always be Unicode-based, those aren't required either, since there are no unrepresentable characters that we care about.

Comments and processing instructions form a bigger issue. Both are technically not elements, but occur in the same places, plus outside the root element (PIs seldom occur *inside* it, in fact). To eliminate them, observe that those outside the root element can be considered metadata, which is probably better stored as a document in its own right, or by wrapping the original document in another element. Both of these approaches eliminate the requirement for a root element to have siblings, in which case comments and processing instructions can simply be elements with a special name (XML namespaces permit reserving a name for this purpose without fear of potential conflict).

Namespaces
----------
Having eliminated some of the complicated bits of XML, we then add a new one, by baking the concept of namespaces into it. More precisely, rather than define attribute and tag names as strings, define them as pairs of strings:

    {namespace, localname}

These may of course be interned in practice, since namespaces are invariably given long identifiers to promote uniqueness. However, that is an implementation detail, as is how this will be presented to applications, let alone users. A system which is likely stable under all reasonable mutations of a document is to assume that a non-root element created with no namespace has its namespace copied from its parent.

As well, some means for storing short names for namespaces should probably be devised, in order to facilitate emitting actual XML, as well as displaying documents for human perusal. Most likely by retaining the xmlns:prefix attributes, which would otherwise be unnecessary here (and the xmlns= form would complicate attempts to define a move node operation).

Operations
----------
The object of Larus is to support multiuser editing of XML. Hence, the operations available to applications should be the widest set. Exactly which are feasible, either at all, or in combination with other operations, is unclear at this point, so this is more of a wishlist.

The obvious basic operations are:

* Create element
* Delete element
* Set attribute
* Delete attribute
* Insert text
* Delete text

As has been previously observed by others, it is horribly inefficient, not to mention provoking of race conditions in a multi-user environment (or requiring of transactions, which may have their own drawbacks), to move an element around in the tree by deleting it and reinserting it elsewhere, since it requires reinserting the element's attributes and content.

* Move element
* Move text

Though the latter, come to think of it, is a supercase of the former in some representations (if elements are special characters).

If a form of transactions can be created, then having a “Move text” operation suffices to split and merge elements, by combining a move and an element creation or deletion. This is especially desirable when supporting WYSIWYG rich text editing tools, since those make it easy to generate splits and merges, often into three pieces, when formatting text.

[This paper](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.100.74&rep=rep1&type=pdf) (hereafter referred to as [DSL]) describes algorithms for the type of system being created here, though with one caveat that makes it unsuitable for the case, which SGML and XML are suitable for, of markup languages in which the majority of the document is text, as it does not appear to address the insertion of individual characters. 

However, since part of the premise of [DSL] is to adapt an algorithm for operating on buffers of text to manipulate the children of a tree node, it is quite simple to define that each text node contains a single character. The paper as written technically permits text nodes to have attributes, which is not entirely a bad thing: Google Wave and Etherpad both use a similar technique to represent rich text formatting and in the latter's case the author who inserted the character. It does add the requirement of set attribute and clear attribute operations that affect ranges of characters, though (and possibly the separation of those attributes from those applied to elements).

Proposed data model
-------------------
A *Node* is either a *Text Node* or an *Element*.

A *Text Node* is a *Character* and possibly an *Attribute List*. The character is effectively immutable, unlike the list. It may be reasonable to permit entire graphemes to be considered single characters (the unicode standard encourages this).

A *Character* is a character as defined in Unicode. No sensible mutations exist.

A *String* is, well, a string of Unicode characters. Normally *String*s are altered by replacing them entirely.

An *Attribute List* is a dictionary in which the keys are *Name*s and the values are *String*s. This is mutated by setting key/value pairs (setting a nonexistent key creates it) and deleting them.

A *Name* is a pair of *String*s, the first of which is a namespace, and the second of which is a local name. Essentially, this is what [[XMLNS]](http://www.w3.org/TR/xml-names/) calls a QName without the indirection afforded by the short prefixes used there. It seems reasonable that these or their component strings be internable, to avoid repeating them all over the place.

An *Element* is the most complex data item: It is a *Name*, an *Attribute List*, and a linear array of *Node*s. The *Name* is the name of the element, and immutable. The *Attribute List* is the elements attributes, and ordinarily mutable. The array of nodes is mutated by mutating the nodes themselves, adding or deleting nodes, or moving groups of nodes. If *Text Node*s have attributes, *Element*s gain a second *Attribute List* that works the same as the one *Text Node*s have.

*Text Node*s having attributes is not really XML, but is potentially useful to specify who inserted a node, and to implement character-level rich-text formatting with a WYSIWYG editor (it also makes Larus a superset of Etherpad in terms of data model, which would be a good thing). Possibly it would be possible to replace this kind of attribute with elements to indicate when they change, which would require less storage, but I'm not sure if it's less likely to preserve the user's intention in all situations than simply specifying them on each one.

Document Wrapper Schema
-----------------------
This was mentioned above as a way of dealing with comments and processing instructions that are outside the root element. Possibly, additional metadata can be stuffed in there. In any case, the basic concept is fairly simple: The root element of the document is a larus:root, which contains the real root element, and anywhere in the document that a comment or PI exists, they are represented by larus:comment and larus:pi elements, the latter having a target attribute that specifies the PI's target.

It seems reasonable that any built-in metadata that Larus supports would be placed there too, with a restricted structure, so that search indexers can find and parse it easily. This is placed in a larus:metadata element, in some manner.

Access Control
--------------
Whilst for some purposes allowing anyone to edit anything may be reasonable, this is not always desirable: It may be that a document is meant to be world-readable but only a few people are trusted to edit it, or the document may be not for public consumption at all. Hence, access control is desirable.

It does not take a complex system to be useful: levels of "view", "edit" and "change ACL", with each including the level below, and allowing anonymous users to be given view or edit access, seems to be sufficient; certainly Google Docs, a reasonably successful collaboration system, uses it without issue. Hence, this seems sufficient. If it is not, then delegating the question of who may do what to an external system is the easiest way out and permits integration into other software with its own ideas about that (though in that case changing ACLs should probably only be done through the external system).
