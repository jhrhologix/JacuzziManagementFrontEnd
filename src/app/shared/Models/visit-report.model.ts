export interface VisitReport {
  id: number;
  clientId: number;
  clientFullName: string;
  city: string;
  issueClassLabel: string;
  poolSpecialistAbbreviation: string;
  completed: boolean;
  visitDuration: number;
  visitDate: string;
} 