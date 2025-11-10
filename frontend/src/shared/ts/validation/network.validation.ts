import Joi from 'joi';

export const NetworkNameSchema = Joi.string()
  .min(3)
  .required()
  .label('Nome da rede')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const NetworkCidrSchema = Joi.string()
  .required()
  .ip({ version: 'ipv4', cidr: 'required' })
  .label('CIDR da Rede')
  .messages({
    'string.ip': '{{#label}} deve ser um endereço válido.',
    'string.ipVersion': '{{#label}} deve ser um endereço IPv4.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const NetworkTypeSchema = Joi.string()
  .min(3)
  .required()
  .label('Tipo da rede')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const NetworkLocationSchema = Joi.string()
  .min(3)
  .required()
  .label('Localização da rede')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const NetworkOrganizationSchema = Joi.string()
  .required()
  .label('Organização da rede')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const NetworkSchema = Joi.object({
  name: NetworkNameSchema,
  network_type: NetworkTypeSchema,
  network_cidr: NetworkCidrSchema,
  location: NetworkLocationSchema,
  organizationId: NetworkOrganizationSchema,
});

export const NetworkUpdateSchema = Joi.object({
  name: NetworkNameSchema.optional(),
  network_type: NetworkTypeSchema.optional(),
  network_cidr: NetworkCidrSchema.optional(),
  location: NetworkLocationSchema.optional(),
  organizationId: NetworkOrganizationSchema.optional(),
})
  .min(1) // Require at least one field to be present for an update
  .messages({
    'object.min':
      'Pelo menos um campo (nome ou ações) deve ser fornecido para atualização.',
  });;
