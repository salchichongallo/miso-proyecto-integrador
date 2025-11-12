export type MyClientsResponse = InstitutionalClient[];

export interface InstitutionalClient {
  client_id: string;
  country: string;
  level: string;
  location: string;
  name: string;
  specialty: string;
  tax_id: string;
  tax_id_encrypted: string;
}
