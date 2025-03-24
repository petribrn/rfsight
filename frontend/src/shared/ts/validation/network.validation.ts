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
  location: NetworkLocationSchema,
  organizationId: NetworkOrganizationSchema,
});
