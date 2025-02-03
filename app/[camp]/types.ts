export interface Room {
  id: string;
  campId: string;
  number: string;
  capacity: number;
  project: string;
  workers: Worker[];
  availableBeds: number;
}

export interface Worker {
  id: string;
  name: string;
  registrationNumber: string;
  project: string;
  roomId?: string;
  entryDate: string;
  [key: string]: string | undefined;
}

export interface Camp {
  id: string;
  name: string;
  description: string;
  userEmail: string;
} 