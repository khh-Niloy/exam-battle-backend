export enum Roles {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  ADMIN = "ADMIN",
}

export enum StudentGroup {
  SCIENCE = "SCIENCE",
  ARTS = "ARTS",
  COMMERCE = "COMMERCE",
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Roles;
  image?: string;
  studentInfo?: {
    instituteName: string;
    group: StudentGroup;
    class: string;
  };
}
