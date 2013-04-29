This document starts small and works up. So we will start with some data types.

Atomic data types
=================
Character
---------
All characters are unicode. Being indivisible lumps, there isn't much else to say about them.

Atom
----
This is a sequence of *character*s that is considered an indivisible lump, so the only operation on an *atom* is to replace it with another one, if that. *Atom*s may be interned for efficient storage and transport.

Name
----
These are simply pairs of atoms, the first being a namespace, and the second a name within the namespace. The sheer number of these involved in the average interesting XML document is the primary reason that interning atoms is worthwhile. Although being technically a compound type, if not an interesting one, there isn't any reason for them to be considered divisible, so they're more like fancy atoms.

Tree Nodes
==========
These are the primary building blocks of a Larus document, and represent both elements and text characters, the latter of which are strictly leaves. They are, in fact, leaves each enclosing a single *character*.

Element nodes are more complicated. Each one has a name, which is a *Name*, and an optional identifier. It has an unordered collection of attributes, which are pairs of *Name* and *Atom*. Finally, each has an ordered list of children, which are identified positionally.

Note that identifiers may be application/user defined, in which case two sites may attempt to create an element with the same identifier, and it manifests as an xml:id attribute in accordance with [XMLID](http://www.w3.org/TR/xml-id/). There are also two magic values that never conflict with any other identifiers: the *real root* and *logical root* identifiers. Being the logical root does not prevent an element from having a user-defined identifier.

The real root is taken as always existing. Trying to create it is not a sensible operation.

Addressing
----------
This is taken from [DSL-OtSgml] with a slight modification. The address of a tree node is a list, which MUST start with an identifier (usually the real or logical root identifier), and the remaining entries of which are either numbers or identifiers.

To resolve an address, first locate the node which the first entry indicates. For each subseqent entry, select the corresponding node: if a number, it indicates the nth child of the current node, if an identifier, it indicates the child of the current node that has that identifier. Usually this is more efficiently represented by simply giving the identifier as the first entry, as identifiers are scoped to the whole document.

This allows nonexistent nodes to be addressed, which is intentional, although it is in error to specify a child of a nonexistent node. The real root identifier is always guaranteed to refer to a node that exists.

Mutating the tree
-----------------
Any given operations can be classed as either structural or non-structural, depending on whether the number or arrangement of the nodes in the tree is changed or not. Since characters are individual nodes, the majority of operations are structural.

Operations on the same part of the tree are made to fit together by transforming according to the following: An operation is a function that maps from a document to a modified version of that document. A non-commutative composition operator ◦ exists such that for operations B and A, and document d, B(A(d)) = (A ◦ B)(d). There is then the transformation function tf(C,S) where C and S are operations starting from the same document, and t(C,S) = {C',S'} such that S'(C(d)) = C'(S(d)).

Operations
==========
Each operation that travels over the network is composed of a sequence of the following operations:

 * insert(address, position, element or character sequence)
 * delete(address, position, length)
 * setAttribute(address, name, value)
 * delAttribute(address, name)
 * move(address, position, length, address)
 * mergeInsert(address, identifier, element)

In order, these add one or more nodes to the document, remove one or more nodes, set or remove attributes on elements, and execute an atomic cut and paste. Note that insert and delete have the position of 

insert()
--------
The first argument to this is an address specifying the location at which the second will be inserted, and must not end in an identifier. Correspondingly, it doesn't have to exist yet, whilst if it does, the new data is inserted preceding whatever is already there.

The third argument is an element or, alternatively, a sequence of characters. There are actually two types of insert, insertText and insertElement. In the former, the thing to be inserted is a string, in the latter, a qname.

delete()
--------
The first argument specifies the location of the first and, if the second is absent, only node to erase. If the second is provided, then it must refer to a sibling of the first node (ie, both addresses must be identical bar the last entry), and both must exist for anything useful to happen.

setAttribute()
--------------
This sets an attribute on an element (creating it if it doesn't exist yet); hence the address must not only exist but be an element. The second argument is the name of the attribute, and the third is the entire value of the attribute, which replaces any previous value.

delAttribute()
--------------
This removes an attribute entirely, so its arguments are the same as the first two of setAttribute().

move()
------
This atomically removes the nodes given by the first two arguments (which must exist and be siblings, the same as for delete()), and inserts them at the location given by the third. All children and attributes of any elements are brought along for the ride.

mergeInsert()
------------------
This is a slightly peculiar one: it is similar to insert() except that the address identifies the parent of the affected node, and the second parameter is a user-defined identifier. The operation is a no-op if a node with that identifier already exists, otherwise the element is inserted somewhere among the children of the node the address identifies, and given that identifier.

Transforming operations
=======================
Determining if transformation is needed
---------------------------------------
This step is required since operations that affect separate subtrees can be transformed to themselves. Specifically, there is a potential for transformation being required if, having normalised the paths to hang off the real root, either is a prefix of the other (or they are the same, of course).

Hence:

    function collide(a,b)
        for (i = 0; i < a.length; i++)
            return [:prefix, i] if i == b.length  // b is a prefix of a
            return [:different] if a[i] != b[i]   // unrelated paths
        end
        return [:same_path] if b.length == a.length //same path
        return [:suffix]  //a is a prefix of b
    end

Transformations that could possibly collide
-------------------------------------------
      |             |              Second               
      |             |  i  |  d  | sa  | da  | mo  | mi  
      +-------------+-----+-----+-----+-----+-----+-----
    F |insert       |  x  |  x  |  x  |  x  |  x  |  x
    i |delete       |  x  |  x  |  x  |  x  |  x  |  x
    r |setAttribute |     |     |  x  |  x  |     |     
    s |delAttribute |     |     |  x  |  x  |     |     
    t |move         |  x  |  x  |  x  |  x  |  x  |  x
      |mergeInsert  |  x  |  x  |  x  |  x  |  x  |  x

Fortunately, there's a decent amount of commonality here. A move is like a delete followed by an insert, whilst a mergeInsert is either an insert or a noop.