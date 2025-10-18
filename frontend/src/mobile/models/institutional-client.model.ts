export interface CreateInstitutionalClientRequest {
  name: string;
  tax_id: string;
  country: string;
  level: string;
  specialty: string;
  location: string;
}

export interface InstitutionalClientData {
  client_id: string;
  name: string;
  tax_id: string;
  country: string;
  level: string;
  specialty: string;
  location: string;
  message: string;
}

export interface CreateInstitutionalClientResponse {
  mssg: string;
  vendor: InstitutionalClientData;
}
