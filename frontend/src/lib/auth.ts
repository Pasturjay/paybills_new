export const isAdmin = (user: any) => {
    return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
};
