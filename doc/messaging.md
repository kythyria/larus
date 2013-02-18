Addresses
=========
Every entity that can communicate--servers, users, instances of the synchronisation layer for a given document--has an address. It is advisable to use explicit hostnames everywhere even in a system that can't federate simply to allow virtual hosts.

Addresses are written in the usual URI format:

    larus://hostname/entity

A server is referred to by just a hostname. Users and documents are referred to by appending this as the path; by convention users have a tilde as the first path component, and documents a plus sign (this is probably going to change).

    larus://berigora.net/~/kythyria
    larus://berigora.net/+/pnw5keuapr2ztlyx

Subsequent components are subentities, such as when a user has multiple clients:

    larus://berigora.net/~/kythyria/eyrie

Exactly what relationship these have with the main entity is unclear so far. If there's *no* sigil in the path, it is a subentity of the server (in some sense, so are connected users).

Channels
========
These are to avoid repeating headers all the while; they're more like TCP connections than, say, channels in the IRC sense. An entity can request a channel with which to communicate with another entity, the channel is then given a short numeric identifier. Hence only the channel and message length need to be given. Channel 0 is reserved for non-channel messages.

Messages
========
A message is the unit of data transferred. Each message has a sender, a recipient, a length, and a type. All the messages in a channel have the same type as far as the message layer is concerned, but multiple channels can be used between a pair of entities, provided they have different types.

Multicast channels
==================
These implement one-to-many multicast with a one-to-one return path. An entity can have only one of these per message type.