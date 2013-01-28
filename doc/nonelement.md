Non-element schema
==================
This describes how to represent things that aren't elements as elements. Whether
a client interprets these is up to it and should probably be a setting which can
be toggled on a per-document basis.

Namespace
---------
These are supposed to be globally unique; a common method is to put the year of issue into a URL the issuer owns.

    http://ns.berigora.net/2013/larus/nonelements

<code>comment<code>
-------------------
**Appears: **Anywhere
**Contents: **Character data only
**Attributes: **None

Represents a comment. The characters within the comment become the text contents of the element

<code>pi</code>
---------------
**Appears: **Anywhere
**Contents: **Character data only
**Attributes: **<code>target</code>

Represents a processing instruction. The target, that is, the token immediately after the <? in normal XML, is represented as the <code>target</code> attribute. Thus

    <?foo bar baz barrow?>

becomes

    <pi target="foo">bar baz barrow</pi>

<code>doctype</code>
--------------------
**Appears: **Once, at the start of the document (before the root element, technically)
**Contents: **<code>elementdecl</code>, <code>attlistdecl</code>, <code>entitydecl</code>, <code>notationdecl</code>, <code>pi</code>, <code>comment</code>
**Attributes: **<code>name</code>, <code>system</code>, <code>public</code>

Represents a doctype declaration. Larus doesn't actually follow these, but they're in the XML standard and required for proper representation of some common formats. Note that entities are not used by the rest of Larus, so the declarations are only for completeness.

The <code>name</name> attribute contains the name of the root element, whilst <code>system</code> and <code>public</code> are the system and public identfiers--the SYSTEM and PUBLIC keywords can be inferred from whether just <code>system</code> is present (implies SYSTEM), or both are present (implies PUBLIC). Hence:

    <!DOCTYPE document SYSTEM "nonelement.dtd">
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

become, respectively,

    <doctype name="document"/>
    <doctype name="HTML" public="-//W3C//DTD HTML 4.01//EN" system="http://www.w3.org/TR/html4/strict.dtd"/>

There is a nearly one to one mapping between the children of this element and the productions in the XML specification, so I will not repeat exactly what they mean here.