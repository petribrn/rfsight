import Joi from 'joi';

export const ResetEmailSchema = Joi.string()
  .email({ tlds: false })
  .required()
  .label('E-mail')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.email': '{{#label}} deve ser um e-mail válido.',
    'any.required': '{{#label}} é obrigatório.',
  });

export const RPasswordSchema = Joi.string()
  .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^*-]).{8,}$/)
  .required()
  .label('Senha')
  .messages({
    'string.empty': '{{#label}} não deve estar vazia.',
    'string.pattern.base':
      '{{#label}} deve ter no máximo 8 caracteres. Sendo 1 número, 1 letra maiúscula e um caractere especial (#?!@$%^*-).',
    'any.required': '{{#label}} é obrigatória.',
  });

export const ResetPasswordSchema = Joi.object({
  password: RPasswordSchema,
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
