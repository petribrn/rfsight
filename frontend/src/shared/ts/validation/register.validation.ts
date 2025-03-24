import Joi from 'joi';

export const UsernameSchema = Joi.string()
  .min(3)
  .max(8)
  .required()
  .label('Nome de usuário')
  .messages({
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'string.max': '{{#label}} deve conter no máximo 8 caracteres.',
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  });
export const EmailSchema = Joi.string()
  .email({ tlds: false })
  .required()
  .label('E-mail')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.email': '{{#label}} deve ser um e-mail válido.',
    'any.required': '{{#label}} é obrigatório.',
  });
export const FirstNameSchema = Joi.string()
  .min(3)
  .required()
  .label('Primeiro nome')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'any.required': '{{#label}} é obrigatório.',
  });
export const LastNameSchema = Joi.string()
  .min(3)
  .required()
  .label('Último nome')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'string.min': '{{#label}} deve conter no mínimo 3 caracteres.',
    'any.required': '{{#label}} é obrigatório.',
  });
export const PasswordSchema = Joi.string()
  .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^*-]).{8,}$/)
  .required()
  .label('Senha')
  .messages({
    'string.empty': '{{#label}} não deve estar vazia.',
    'string.pattern.base':
      '{{#label}} deve ter no máximo 8 caracteres. Sendo 1 número, 1 letra maiúscula e um caractere especial (#?!@$%^*-).',
    'any.required': '{{#label}} é obrigatória.',
  });

export const RegisterSchema = Joi.object({
  username: UsernameSchema,
  email: EmailSchema,
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  password: PasswordSchema,
  passwordConfirmation: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirmação de senha')
    .messages({
      'any.only': '{{#label}} e senha são diferentes.',
      'string.empty': '{{#label}} não deve estar vazia.',
      'any.required': '{{#label}} é obrigatória.',
    }),
});
