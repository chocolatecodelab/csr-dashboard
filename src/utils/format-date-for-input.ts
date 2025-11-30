export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateForDisplay = (date: string | Date, locale: string = "id-ID") => {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getDefaultDateRange = (daysOffset: number = 30) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysOffset);
  
  return {
    startDate: formatDateForInput(today),
    endDate: formatDateForInput(futureDate),
  };
};