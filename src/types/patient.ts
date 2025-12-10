export interface Patient {
  id: string;
  rut: string;
  name: string;
  phone?: string;
  age?: number;
  preferredRoom?: string;
  preferredDay?: string;
  preferredTime?: string;
  serviceType?: string;
  observations?: string;
}