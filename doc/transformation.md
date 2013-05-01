Detecting when operations need to be transformed
================================================
Given two operations A and B.

If A's address (as indicated in the target attribute) has a prefix in common with B's address, then A and B potentially collide. A potential collision is not an actual collision if when the longer address is truncated to the length of the shorter, they are not equal.

Transformations
===============

getAttribute and setAttribute with themselves
---------------------------------------------
The two attribute-setting operations can only collide if they operate on the exact same element. This is resolved by determining one to "win", and transforming the other to be a no-op. Providing the arbitration function executes consistently, so will the transformation.

insert and the attribute operations
-----------------------------------
If the attribute operation's target node is a higher-numbered sibling of the inserted or removed nodes, or one of the target's parents are, the component corresponding to sibling in question must be incremented by the number of inserted nodes.

If it is a lower-numbered sibling, neither operation is changed.

delete and the attribute operations
-----------------------------------
This is the same as with insert (barring that a decrementing occurrs rather than incrementing), with the additional caveat that if the target node of the attribute operation or a parent thereof is within the deleted range, the attribute operation becomes a no-op.

insert to the left of delete/insert
----------------------------
The delete must be shifted rightwards by the size of the insert to account for it. Same deal if the rightmost operation is an insert.

delete to the left of insert/delete
----------------------------
Similarly, shift the insert leftwards by the size of the deletion. Note that even if the deletion is longer than the insertion the insertion cannot become a noop, as this would be surprising and make inconsistent results easier to achieve.

If both deletions refer to the same spot, the shorter one becomes a noop.

mergeInsert
-----------
If the other operation, or a previous operation, has created the element the mergeInsert was going to insert, it becomes a noop. Otherwise, it is treated like a normal insert.

move
----
Firstly, the operation's destination and destPosition properties need to be transformed against the move as if they were an insert being transformed against a delete.

Then, internally split it into a delete followed by an insertion and transform both operations appropriately. The reassembled operation is the transformed move.