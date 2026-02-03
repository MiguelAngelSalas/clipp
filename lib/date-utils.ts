// lib/date-utils.ts

/** Retorna la fecha en formato YYYY-MM-DD local */
export const formatDateLocal = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-CA');
};

/** Formatea la hora para mostrar al usuario (HH:mm) sin desfase UTC */
export const formatTimeDisplay = (dateIso: string | Date) => {
  try {
    const d = new Date(dateIso);
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutos = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutos}`;
  } catch (e) {
    return "--:--";
  }
};