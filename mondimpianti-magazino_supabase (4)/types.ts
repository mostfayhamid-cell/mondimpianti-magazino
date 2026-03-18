
export type TransactionType = 'IN' | 'OUT';

export interface Part {
  pn: string;
  description: string;
  minStock?: number;
  location?: string;
  active: boolean;
}

export interface Person {
  personId: string;
  fullName: string;
  department?: string;
  active: boolean;
}

export interface Transaction {
  txId: string;
  timestamp: string;
  type: TransactionType;
  pn: string;
  qty: number;
  takenById?: string;
  receivedFrom?: string;
  note?: string;
  dttFile?: string;
}

export interface PartWithStock extends Part {
  stock: number;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'SYSTEM';
  pn?: string;
  read: boolean;
}

export enum View {
  RECEIVE = 'Carico',
  PARTS = 'Inventario',
  PEOPLE = 'Personale',
  WITHDRAW = 'Scarico',
  HISTORY = 'Storico',
  NOTIFICATIONS = 'Notifiche',
  DOCUMENTS = 'Archivio DDT'
}

export interface User {
  email: string;
  password?: string;
  fullName: string;
}
