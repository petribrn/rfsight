export type UserInfo = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  permission: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRow = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  permission: number;
  organizationInfo: {
    organizationId: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
