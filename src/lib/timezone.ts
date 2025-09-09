export function formatInKuwaitTime(date: Date | string, options: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
    }

    return dateObj.toLocaleString('en-GB', { // en-GB provides a good base for DD/MM/YYYY formats
      ...options,
      timeZone: 'Asia/Kuwait',
    });
}
