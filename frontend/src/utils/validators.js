/**
 * Utilidades de validación para formularios
 */

export const validators = {
  /**
   * Valida que un string no esté vacío
   */
  required: (value, fieldName = 'Este campo') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  /**
   * Valida email
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Email inválido';
    }
    return null;
  },

  /**
   * Valida longitud mínima
   */
  minLength: (value, length, fieldName = 'Este campo') => {
    if (value && value.length < length) {
      return `${fieldName} debe tener al menos ${length} caracteres`;
    }
    return null;
  },

  /**
   * Valida longitud máxima
   */
  maxLength: (value, length, fieldName = 'Este campo') => {
    if (value && value.length > length) {
      return `${fieldName} debe tener máximo ${length} caracteres`;
    }
    return null;
  },

  /**
   * Valida que sea un número
   */
  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Debe ser un número válido';
    }
    return null;
  },

  /**
   * Valida que sea un número positivo
   */
  positiveNumber: (value) => {
    const numError = validators.number(value);
    if (numError) return numError;
    if (value && Number(value) <= 0) {
      return 'Debe ser mayor a 0';
    }
    return null;
  },

  /**
   * Valida teléfono
   */
  phone: (value) => {
    const phoneRegex = /^[0-9\-+()\\s]+$/;
    if (value && !phoneRegex.test(value)) {
      return 'Teléfono inválido';
    }
    return null;
  },

  /**
   * Valida que el valor no tenga espacios en blanco
   */
  noSpaces: (value, fieldName = 'Este campo') => {
    if (value && /\s/.test(value)) {
      return `${fieldName} no puede contener espacios`;
    }
    return null;
  },

  /**
   * Valida contraseña fuerte
   */
  strongPassword: (value) => {
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const isLongEnough = value.length >= 8;

    if (!isLongEnough) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe incluir mayúsculas';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe incluir minúsculas';
    }
    if (!hasNumbers) {
      return 'La contraseña debe incluir números';
    }
    return null;
  }
};

/**
 * Validador de formulario completo
 * @param {Object} data - Datos del formulario
 * @param {Array} rules - Array de reglas [{field: 'nombre', validators: [fn1, fn2]}]
 * @returns {Object} Objeto con errores por campo
 */
export const validateForm = (data, rules) => {
  const errors = {};

  rules.forEach(rule => {
    const value = data[rule.field];
    rule.validators.forEach(validator => {
      const error = validator(value);
      if (error) {
        errors[rule.field] = error;
      }
    });
  });

  return errors;
};

/**
 * Verifica si there are validation errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
