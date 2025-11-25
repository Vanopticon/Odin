export interface User {
    id?: string;
    username?: string;
    displayName?: string;
    // role names assigned to the user
    roles?: string[];
    // explicit permission names assigned to the user
    permissions?: string[];
}

export const ANONYMOUS_USER: User = {
    id: undefined,
    username: 'anonymous',
    displayName: 'Guest',
    roles: [],
    permissions: []
};
