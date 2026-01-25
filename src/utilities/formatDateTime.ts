export const formatDateTime = (timestamp: string): string => {
  const now = new Date()
  let date = now
  if (timestamp) date = new Date(timestamp)
  
  // Deutsches Datumsformat verwenden
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  
  return new Intl.DateTimeFormat('de-DE', options).format(date)
}

export const formatDateTimeLong = (timestamp: string): string => {
  const date = new Date(timestamp)
  
  // Langes deutsches Datumsformat
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  
  return new Intl.DateTimeFormat('de-DE', options).format(date)
}

export const formatDateTimeWithTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  
  // Deutsches Datum mit Uhrzeit
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return new Intl.DateTimeFormat('de-DE', options).format(date)
}
