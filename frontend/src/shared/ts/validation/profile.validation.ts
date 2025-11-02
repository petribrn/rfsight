import Joi from 'joi';

const HttpDetailsSchema = Joi.object({
  port: Joi.number().integer().default(80).label('Porta HTTP').messages({
    'number.base': '{{#label}} deve ser um número.',
    'number.integer': '{{#label}} deve ser um número inteiro.',
  }),
  method: Joi.string()
    .valid('GET', 'PATCH', 'PUT', 'POST', 'DELETE')
    .required()
    .label('Método HTTP')
    .messages({
      'any.only': '{{#label}} deve ser um dos seguintes: {#valids}.',
      'any.required': '{{#label}} é obrigatório.',
      'string.base': '{{#label}} deve ser um texto.',
    }),
  successStatusCode: Joi.number()
    .integer()
    .default(200)
    .label('Código de Status de Sucesso')
    .messages({
      'number.base': '{{#label}} deve ser um número.',
      'number.integer': '{{#label}} deve ser um número inteiro.',
    }),
  path: Joi.string().required().label('Caminho').messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  }),
  pathVariables: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
    )
    .optional()
    .allow(null)
    .label('Variáveis de Caminho')
    .messages({
      'object.base': '{{#label}} deve ser um objeto.',
    }),
  payloadType: Joi.string()
    .valid('file', 'text/plain', 'text/json')
    .optional()
    .allow(null)
    .label('Tipo de Payload')
    .messages({
      'any.only': '{{#label}} deve ser um dos seguintes: {#valids}.',
      'string.base': '{{#label}} deve ser um texto.',
    }),
  responseType: Joi.string()
    .valid('text/plain', 'text/json', 'boolean', 'blank')
    .required()
    .label('Tipo de Resposta')
    .messages({
      'any.only': '{{#label}} deve ser um dos seguintes: {#valids}.',
      'any.required': '{{#label}} é obrigatório.',
      'string.base': '{{#label}} deve ser um texto.',
    }),
  responseMapping: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
    .allow(null)
    .label('Mapeamento da Resposta')
    .messages({
      'object.base': '{{#label}} deve ser um objeto.',
    }),
});

// Schema for SshDetails
const SshDetailsSchema = Joi.object({
  port: Joi.number().integer().default(22).label('Porta SSH').messages({
    'number.base': '{{#label}} deve ser um número.',
    'number.integer': '{{#label}} deve ser um número inteiro.',
  }),
  command: Joi.string().required().label('Comando SSH').messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'any.required': '{{#label}} é obrigatório.',
  }),
});

// Schema for a single Action
export const ActionSchema = Joi.object({
  actionType: Joi.string()
    .valid('monitor', 'manage')
    .required()
    .label('Tipo de Ação')
    .messages({
      'any.only': '{{#label}} deve ser "monitor" ou "manage".',
      'any.required': '{{#label}} é obrigatório.',
      'string.base': '{{#label}} deve ser um texto.',
    }),
  protocol: Joi.string()
    .valid('http', 'ssh')
    .required()
    .label('Protocolo')
    .messages({
      'any.only': '{{#label}} deve ser "http" ou "ssh".',
      'any.required': '{{#label}} é obrigatório.',
      'string.base': '{{#label}} deve ser um texto.',
    }),
  sshDetails: SshDetailsSchema.optional().allow(null),
  httpDetails: HttpDetailsSchema.optional().allow(null),
})
  .when(Joi.object({ protocol: Joi.valid('http') }).unknown(), {
    then: Joi.object({
      httpDetails: Joi.required().messages({
        'any.required':
          'Detalhes HTTP são obrigatórios quando o protocolo é "http".',
      }),
      sshDetails: Joi.valid(null).required().messages({
        // sshDetails MUST be null
        'any.only': 'Detalhes SSH devem ser nulos quando o protocolo é "http".',
        // Required ensures it's explicitly set to null, not just absent
        'any.required':
          'Detalhes SSH devem ser definidos como nulos quando o protocolo é "http".',
      }),
    }),
  })
  .when(Joi.object({ protocol: Joi.valid('ssh') }).unknown(), {
    then: Joi.object({
      sshDetails: Joi.required().messages({
        'any.required':
          'Detalhes SSH são obrigatórios quando o protocolo é "ssh".',
      }),
      httpDetails: Joi.valid(null).required().messages({
        // httpDetails MUST be null
        'any.only': 'Detalhes HTTP devem ser nulos quando o protocolo é "ssh".',
        'any.required':
          'Detalhes HTTP devem ser definidos como nulos quando o protocolo é "ssh".',
      }),
    }),
  })
  .label('Ação')
  .messages({
    'object.base': '{{#label}} deve ser um objeto.',
  });

// Schema for the collection of Actions within a Profile
export const ProfileActionsSchema = Joi.object()
  .pattern(
    Joi.string().required().label('Nome da Ação'),
    ActionSchema.required()
  )
  .required()
  .label('Ações do Perfil')
  .messages({
    'object.base': '{{#label}} deve ser um objeto.',
    'any.required': '{{#label}} é obrigatório.',
    'object.unknown': 'Chave de ação inválida: {#key}',
  });

export const ProfileNameSchema = Joi.string()
  .min(3)
  .required()
  .label('Nome')
  .messages({
    'string.empty': '{{#label}} não deve estar vazio.',
    'string.base': '{{#label}} deve ser um texto.',
    'string.min': '{{#label}} deve ter no mínimo {#limit} caracteres.',
    'any.required': '{{#label}} é obrigatório.',
  });

// Schema for the entire Profile
export const ProfileSchema = Joi.object({
  name: ProfileNameSchema,
  actions: ProfileActionsSchema,
});

// Optional: Schema for ProfileUpdate (allows partial updates)
export const ProfileUpdateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .optional() // Name is optional for updates
    .label('Nome')
    .messages({
      'string.empty': '{{#label}} não deve estar vazio.',
      'string.base': '{{#label}} deve ser um texto.',
      'string.min': '{{#label}} deve ter no mínimo {#limit} caracteres.',
    }),
  actions: Joi.object().optional().label('Ações do Perfil').messages({
    'object.base': '{{#label}} deve ser um objeto.',
    'object.unknown': 'Chave de ação inválida: {#key}',
  }),
})
  .min(1) // Require at least one field to be present for an update
  .messages({
    'object.min':
      'Pelo menos um campo (nome ou ações) deve ser fornecido para atualização.',
  });
