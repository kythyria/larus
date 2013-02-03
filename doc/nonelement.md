Non-element schema
==================
This describes how to represent things that aren't elements as elements. Whether
a client interprets these is up to it and should probably be a setting which can
be toggled on a per-document basis.

Note that references to "character data" do not distinguish text inserted directly and a CDATA, since Larus doesn't.

Namespace
---------
These are supposed to be globally unique; a common method is to put the year of issue into a URL the issuer owns. The zero is a version number, in case of non backwards compatible changes.

    http://ns.berigora.net/2013/larus/nonelements/0

<code>comment</code>
-------------------
**Appears:** Anywhere

**Attributes:** None

**Contents:** Character data only

Represents a comment. The characters within the comment become the text contents of the element

<code>pi</code>
---------------
**Appears:** Anywhere

**Attributes:** <code>target</code>

**Contents:** Character data only

Represents a processing instruction. The target, that is, the token immediately after the <? in normal XML, is represented as the <code>target</code> attribute. Thus

    <?foo bar baz barrow?>

becomes

    <pi target="foo">bar baz barrow</pi>

DTD schema
==========
Defines how to represent an XML DTD as XML rather than the peculiar DTD syntax. This is a lot less terse, but avoids any special-casing. Larus also doesn't do anything with it except preserve it for application use.

Namespace
---------
    
    http://ns.berigora.net/2013/larus/doctype

<code><doctype></code>
--------------------
**Appears:** Once, at the start of the document (before the root element, technically)

**Attributes:** <code>name</code>, <code>system</code>, <code>public</code>

**Contents:** Any combination, or none, of <code><elementdecl></code>, <code><attlistdecl></code>, <code><entitydecl></code>, <code><notationdecl/></code>, <code><pi></code>, <code><comment></code>

Represents a doctype declaration. Larus doesn't actually follow these, but they're in the XML standard and required for proper representation of some common formats. Note that entities are not used by the rest of Larus, so the declarations are only for completeness.

The <code>name</name> attribute contains the name of the root element, whilst <code>system</code> and <code>public</code> are the system and public identfiers--the SYSTEM and PUBLIC keywords can be inferred from whether just <code>system</code> is present (implies SYSTEM), or both are present (implies PUBLIC). It is not an error for both to be absent. Hence:

    <!DOCTYPE document SYSTEM "nonelement.dtd">
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
    <!DOCTYPE html>

become, respectively,

    <doctype name="document" system="nonelement.dtd"/>
    <doctype name="HTML" public="-//W3C//DTD HTML 4.01//EN" system="http://www.w3.org/TR/html4/strict.dtd"/>
    <doctype name="html"/>

There is a nearly one to one mapping between the children of this element and the productions in the XML specification, so I will not repeat exactly what they mean here.

<code><notationdecl/></code>
-------------------------
**Appears:** In <code><doctype></code> elements.

**Attributes:** <code>name<code/>, <code>system</code>, <code>public</code>

**Contents:** None

Represents a notation, which is (so far as the editor of this document can tell) somewhat similar in concept to a mime type--it identifies the format of data that is not XML. Both the <code>system</code> and <code>public</code> attributes are optional: If the only former is present, the keyword SYSTEM is implied, if only the latter, the PUBLIC keyword.

<code><entitydecl></code>
-----------------------
**Appears:** In <code><doctype></code> elements.

**Attributes:** <code>name</code>, <code>type</code>, <code>system</code>, <code>public</code>, <code>notation</code>

**Contents:** Anything except a double quote symbol "

The <code>type</code> attribute is optional, and can have either "general" (the default) or "parameter" as values (the latter is the %entity syntax used inside of DTDs). The <code>system</code> and <code>public</code> attributes form an external identifier as in <code><notationdecl></code>. <code>notation</code> refers to a <code><notationdecl></code> element, and is only permitted when <code>type="general"</code>. If an external identifier is given, this element must be empty.

<code><attlistdecl></code>
------------------------
**Appears:** In <code><doctype></code> elements.

**Attributes:** <code>element</code>

**Contents:** Zero or more <code><attdef></code>

Defines a list of attributes. <code><element></code> is mandatory and identifies which <code><elementdecl></code> this attribute list is paired with.

<code><attdef></code>
-------------------
**Appears:** In an <code><attlistdecl></code> element

**Attributes:** <code>name</code>, <code>type</code>, <code>presence</code>, <code>default</code>

**Contents:** Zero or more <code><attvalue></code>

Defines an attribute. The <code>type</code> attribute has one of the values (case insensitive)

    CDATA ID IDREF IDREFS ENTITY ENTITIES NMTOKEN NMTOKENS NOTATION ENUM

All but the last of these correspond to those given in the XML specification for the <code>AttType</code> production. The last, <code>ENUM</code> corresponds to the production but does not have a keyword (it corresponds to the <code>Enumeration</code> production). If <code>type="notation"</code> or <code>type="enum"</code>, then the element must contain at least one <code>attvalue</code> element.

The <code>presence</code> attribute corresponds to the three strings in the <code>DefaultDecl</code> production in the XML specifciation, thus taking the following three values (case insensitive)

    REQUIRED IMPLIED FIXED

The <code>default</code> attribute specifies the default, or, in the case of <code>presence="fixed"</code>, only value.

<code><attvalue></code>
---------------------
**Appears:** In <code><attdef></code> elements

**Attributes:** None

**Contents:** Anything except left angle bracket, ampersand, or double quote.

Defines a possible value of a notation or enum attribute. If notation, must match the name of a valid <code><notationdecl></code>

<code><elementdecl></code>
------------------------
**Appears:** In <code><doctype></code> elements.

**Attributes:** <code>name</code>

**Contents:** One of <code><any/></code>, <code><seq></code>, <code><or></code>, or nothing at all.

Defines an element. The various children correspond to the contentspec production. No child elements means the element must be empty, whilst the <code><any></code> element permits arbitrary content.

<code><seq></code>, <code><or></code>
---------------------------------
**Appears:** In <code><elementdecl></code>, <code><seq></code>, or <code><or></code>

**Attributes:** <code>count</code>

**Contents:** <code><elemref></code>, <code><seq></code>, <code><or></code>, <code><pcdata/></code>

Represent the <code>(elem,elem)</code> and <code>(elem|elem)</code> constructs in an element declaration respectively. That is, a sequence of elements, or a choice of one. The <code>count</code> attribute corresponds to the appended sigil:

    * atleastzero
    + atleastonce
    ? atmostonce

<code><elemref></code>
--------------------
**Appears:** In <code><seq></code>, or <code><or></code>

**Attributes:** <code>name</code>, <code>count</code>

**Contents:** None

Indicates the presence of an element is acceptable at this point in an element's content model. Correspondingly, the <code>name</code> attribute gives the name of the element being permitted, whilst <code>count</code> is the same as on the previous two elements.

<code><pcdata/></code>
-------------------
**Appears:** In <code><elementdecl></code>, <code><seq></code>, or <code><or></code>

**Attributes:** None

**Contents:** None

Indicates character data is permitted at this point in an element's content model. There is no count specifier, since that wouldn't make sense (and the XML spec effectively only permits <code>atleastzero</code> anyway)

<code><any/></code>
----------------
**Appears:** In <code><elementdecl/></code>

**Attributes:** None

**Contents:** None

Indicates that anything is permitted as the child of an element.
