const FIELD_NAMES: Record<string, string> = {
  currency: 'Moneda',
  name: 'Nombre',
  amount: 'Monto',
  category_id: 'Categoría',
  account_id: 'Cuenta',
  card_id: 'Tarjeta',
  institution_id: 'Institución / Banco',
  brand_id: 'Red / Marca',
  billing_cycle: 'Ciclo de facturación',
  next_billing_date: 'Próxima fecha de cobro',
  start_date: 'Fecha de inicio',
  startDate: 'Fecha de inicio',
  end_date: 'Fecha de fin',
  endDate: 'Fecha de fin',
  duration_months: 'Meses a proyectar',
  type: 'Tipo',
  email: 'Correo electrónico',
  password: 'Contraseña',
  initial_balance: 'Saldo inicial',
  last_four: 'Últimos 4 dígitos',
  billing_day: 'Día de corte',
  payment_day: 'Día de pago',
  base_interest_rate: 'Tasa de interés',
  description: 'Descripción',
};

export function translateErrorMessage(rawMessage: string): string {
  let msg = rawMessage.trim();

  // Translate field names at the beginning of sentence
  for (const [field, translated] of Object.entries(FIELD_NAMES)) {
    const regex = new RegExp(`\\b${field}\\b`, 'gi');
    msg = msg.replace(regex, translated);
  }

  // Common Class-Validator string replacements
  msg = msg
    .replace(/should not be empty/gi, 'no puede estar vacío')
    .replace(/must be a string/gi, 'debe ser un texto válido')
    .replace(/must be a number string/gi, 'debe ser un número válido')
    .replace(/must be a number/gi, 'debe ser un número')
    .replace(/must be a positive number/gi, 'debe ser un número positivo')
    .replace(/must be a UUID/gi, 'debe ser una opción válida seleccionada')
    .replace(/must be a valid ISO 8601 date string/gi, 'debe ser una fecha válida')
    .replace(/must be a Date instance/gi, 'debe ser una fecha válida')
    .replace(/must not be less than (\d+)/gi, 'no puede ser menor a $1')
    .replace(/must not be greater than (\d+)/gi, 'no puede ser mayor a $1')
    .replace(/must be an email/gi, 'debe ser un correo electrónico válido')
    .replace(/must be longer than or equal to (\d+) characters/gi, 'debe tener al menos $1 caracteres')
    .replace(/must be one of the following values:(.*)/gi, 'debe ser una de las opciones válidas: $1');

  // Capitalize first letter
  return msg.charAt(0).toUpperCase() + msg.slice(1);
}

export function formatApiErrorMessage(errorPayload: unknown): string {
  if (!errorPayload) return 'Ha ocurrido un error inesperado.';

  if (typeof errorPayload === 'string') {
    return translateErrorMessage(errorPayload);
  }

  if (typeof errorPayload === 'object') {
    const errorObj = errorPayload as { message?: string | string[]; error?: string };
    if (Array.isArray(errorObj.message)) {
      return errorObj.message.map(translateErrorMessage).join('. ');
    }
    if (typeof errorObj.message === 'string') {
      return translateErrorMessage(errorObj.message);
    }
    if (errorObj.error) {
      return translateErrorMessage(errorObj.error);
    }
  }

  return 'Ocurrió un error en la solicitud.';
}
