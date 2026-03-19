export interface AdkEvent {
  id: number;
  leaderName: string;
  meetingDate: string;
  meetingTime: string;
  storeName: string;
  address: string;
  state: string;
  city: string;
  leaderMobile: string;
  storeMobile: string;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdkEventFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdkEventPayload {
  leaderName: string;
  meetingDate: string;
  meetingTime: string;
  storeName: string;
  address: string;
  state: string;
  city: string;
  leaderMobile: string;
  storeMobile: string;
  notes?: string;
}
