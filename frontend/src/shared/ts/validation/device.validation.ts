import Joi from 'joi';

export const DeviceMACAddressSchema = Joi.string()
  .allow(null)
  .allow('')
  .regex(
    /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$/
  )
  .label('Endereço MAC')
  .messages({
    'string.pattern.base': '{{#label}} deve ser um endereço MAC válido.',
    'string.min': '{{#label}} deve conter no mínimo 12 caracteres.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DeviceIpAddressSchema = Joi.string()
  .allow(null)
  .allow('')
  .ip({ version: 'ipv4', cidr: 'forbidden' })
  .label('Endereço IP')
  .messages({
    'string.ip': '{{#label}} deve ser um endereço válido.',
    'string.ipVersion': '{{#label}} deve ser um endereço IPv4.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DeviceUserSchema = Joi.string()
  .required()
  .label('Usuário')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DevicePasswdSchema = Joi.string()
  .required()
  .label('Senha')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DeviceNetworkIdSchema = Joi.string()
  .required()
  .label('Rede')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DeviceProfileIdSchema = Joi.string()
  .required()
  .label('Rede')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const DeviceAdoptSchema = Joi.object({
  mac_address: DeviceMACAddressSchema,
  ip_address: DeviceIpAddressSchema,
  user: DeviceUserSchema,
  password: DevicePasswdSchema,
  networkId: DeviceNetworkIdSchema,
  profileId: DeviceProfileIdSchema,
});
