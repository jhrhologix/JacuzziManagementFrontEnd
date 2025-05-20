export interface AdminModel {
    userId: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: number;
    roleName: string;
    isDeleted: boolean;
    isActive: boolean;
    isLocked: boolean;
    isEditing?: boolean;
    assignDays: number;
  }