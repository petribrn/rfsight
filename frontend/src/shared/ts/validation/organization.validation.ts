import Joi from 'joi';

export const OrganizationNameSchema = Joi.string()
  .min(3)
  .required()
  .label('Nome da organização')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const OrganizationIdSchema = Joi.string().label('Id da organização');

export const OrganizationSchema = Joi.object({
  name: OrganizationNameSchema,
  users: Joi.array().items(Joi.string()),
  networks: Joi.array().items(Joi.string()),
});

export const OrganizationUpdateSchema = Joi.object({
  organizationId: OrganizationIdSchema.required()
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  }),
  name: OrganizationNameSchema.optional(),
})
  .min(1)
  .messages({
    'object.min':
      'Pelo menos um campo deve ser fornecido para atualização.',
  });;
