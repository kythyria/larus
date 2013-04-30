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

insert and delete
-----------------
