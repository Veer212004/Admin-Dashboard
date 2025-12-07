export interface Session {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  socketId: string;
  startedAt: string;
  endedAt?: string;
  ip?: string;
  device?: string;
  duration?: number;
}

export interface ActiveSession extends Session {
  duration: number;
}
