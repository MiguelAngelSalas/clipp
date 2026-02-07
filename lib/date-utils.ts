// lib/date-utils.ts

/** * Retorna la fecha en formato YYYY-MM-DD 
 * Útil para poner como value en inputs de tipo date
 */
export const formatDateLocal = (date: Date | string) => {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  // 'en-CA' es un truco estándar para obtener formato YYYY-MM-DD rápido
  return d.toLocaleDateString('en-CA');
};

/** * Formatea la hora para mostrar al usuario (HH:mm) 
 * CORREGIDO: Fuerza la zona horaria de Argentina (-3) 🇦🇷
 * * Ejemplo:
 * Entra: 2026-02-06T22:30:00Z (Hora guardada en Neon/UTC)
 * Sale: "19:30" (Hora correcta en Buenos Aires)
 */
export const formatTimeDisplay = (dateIso: string | Date) => {
  if (!dateIso) return "--:--";
  
  try {
    const d = new Date(dateIso);

    // Usamos Intl para forzar la zona horaria de Buenos Aires
    // Esto arregla el desfase de 3 horas que tenías
    const formatter = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Formato 24hs (ej: 19:30, no 07:30 p.m.)
      timeZone: "America/Argentina/Buenos_Aires" 
    });

    return formatter.format(d);
  } catch (e) {
    console.error("Error formateando hora:", e);
    return "--:--";
  }
};