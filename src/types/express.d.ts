declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'member' | 'trainer';
      };
    }
  }
}

export {};
