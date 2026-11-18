export const canApproveRoyalty=({role,actor,creator,status})=>
 role==='director'&&typeof actor==='string'&&actor.length>0&&
 typeof creator==='string'&&creator.length>0&&actor.toLowerCase()!==creator.toLowerCase()&&status==='draft';
export const canCreateRoyalty=role=>['director','finance'].includes(role);
