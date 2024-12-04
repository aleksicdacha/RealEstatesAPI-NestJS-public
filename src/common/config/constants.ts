export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultSecret',
};

export const VALID_SEARCH_FIELDS = ['username', 'role', 'id'];