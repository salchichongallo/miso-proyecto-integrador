import { InstitutionalClient } from '../../../services/customers/institutional-client.interface';

export interface RegisterSellerRequest {
  name: string;
  email: string;
  institutions: InstitutionalClient[];
}
