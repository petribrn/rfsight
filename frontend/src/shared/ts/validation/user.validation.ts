import Joi from 'joi';
import {
  EmailSchema,
  FirstNameSchema,
  LastNameSchema,
  PermissionSchema,
  UsernameSchema,
  UserOrganizationSchema,
} from './register.validation';

export const UserUpdateSchema = Joi.object({
  username: UsernameSchema,
  email: EmailSchema,
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  permission: PermissionSchema,
  organizationId: UserOrganizationSchema,
});
