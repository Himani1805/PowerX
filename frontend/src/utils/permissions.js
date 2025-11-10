export const canEditLead = (user, lead) => {
  if (!user || !lead) return false;
  return user.role === 'ADMIN' || 
         user.role === 'MANAGER' || 
         lead.ownerId === user.id;
};

export const canDeleteLead = (user, lead) => {
  if (!user || !lead) return false;
  return user.role === 'ADMIN' || lead.createdById === user.id;
};