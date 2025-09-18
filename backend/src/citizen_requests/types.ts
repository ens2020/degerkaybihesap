export type AccidentInput = {
  citizenName: string;
  email: string;
  licensePlate: string;
  accidentDate: string;
  description?: string;
};

export type CitizenRequest = AccidentInput & {
  id: string;
  status: 'pending' | 'awaiting_payment' | 'paid';
  documentText?: string;
  petitionId?: string;
  petitionPath?: string;
  createdBy: 'citizen' | 'professional';
};

export type PetitionPayload = {
  citizenName: string;
  licensePlate: string;
  accidentDate: string;
  description?: string;
  email: string;
};
