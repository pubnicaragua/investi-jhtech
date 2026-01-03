// Configuración de logging - SIEMPRE habilitado para debugging
export const ENABLE_LOGS = true;

// Wrapper para console.log
export const devLog = (...args: any[]) => {
  if (ENABLE_LOGS) {
    console.log(...args);
  }
};

// Wrapper para console.error que siempre imprime (errores críticos)
export const errorLog = (...args: any[]) => {
  console.error(...args);
};

// Wrapper para console.warn
export const warnLog = (...args: any[]) => {
  if (ENABLE_LOGS) {
    console.warn(...args);
  }
};
