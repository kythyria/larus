Okay, take two of the requirements document, sticking to requirements this time.

Synchronisation core
--------------------
The part that does the heavy lifting. This should be a pair of libraries that communicate via a reliable, in-order, message-oriented channel (the implementation of this channel is not something they are concerned with). The client library should present a reasonably conventional interface for mutating the data, such as a DOM-esque one. It's somewhat more optional for the server library to provide this, since server-side applications could be written as bots.

 * Represent XML losslessly, at least for the majority of formats in use
 * Enforce well-formedness
 * Don't make validity checks mandatory (but implementing them is okay)
 * Permit multiple users to edit the same document whilst automatically resolving merge conflicts.
 * Be fast enough to give the appearance of being near-real-time (ideally, be able to see individual keystrokes).
 * Permit moving elements and characters which form a contiguous block of siblings in a single operation. 
 * Provide a way of doing rich text editing (because people WILL want that) that minimises potential for mis-resolving conflicts.

The bit about the majority of formats is simply because XML has a number of features that are seldom used but nonetheless would have to be represented for true round-trip losslessness. Named entities (as opposed to those that work by character code) are arbitrarily declared to be actually prohibited, mostly because the author of this document can't see a way to a) build sensible UIs to deal with them in all places they're permitted, and b) represent them without actually adding support for them.

Servers and clients
-------------------
Given the sync core, the next step is for a component which can cope with more than one document.

 * Assign unique identifiers to documents
 * Access control at a document level 
 * Keep track of metadata about the documents (probably not much, but friendly name and type are required)
 * Recording--efficiently--that groups of documents form a logically connected bundle (this might simply be by a careful choice of identifiers)
 * Optionally, storing binary attachments somewhere.
 * Handle authentication of users against whatever authentication service is configured (flat file, database, external service)

Network layer
-------------
This has to provide the aforementioned reliable, in-order, message-oriented channel. As such, it's not hugely different from any other such channel.

 * Multiplexed operation, that is, logically distinct channels over the same underlying link.
 * Support for very large messages without unduly reducing latency
 * Support for large numbers of small messages, without ridiculous overhead.
 * Minimal dependency on things like odd ports being open, or UDP being available.
 * Reasonable behaviour when connected to a network that is not HTTP-clean.
 * SSL (optional, but very, very nice to have)
 * Functionality for one-to-many multicast messages (technically optional, but something similar will turn up /somewhere/ in the system).