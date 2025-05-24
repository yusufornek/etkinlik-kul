
import { Event } from "@/data/events";
import { formatDate } from "@/lib/utils";

/**
 * Etkinliği kullanıcının takvimine eklemek için gerekli URL'yi oluşturur
 */
export const createCalendarUrl = (event: Event): string => {
  // Genel veriler
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.address || event.location);
  
  // Tarih formatları
  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Varsayılan olarak 2 saat
  
  // ISO formatında tarihler
  const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  // Google Takvim URL'si
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${startIso}/${endIso}`;
  
  // Outlook (Microsoft takvim) için iCal URL'si
  const outlookUrl = `https://outlook.office.com/calendar/action/compose?subject=${title}&body=${description}&location=${location}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`;
  
  // Apple Takvim için iCal URL'si
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.address || event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  const icalUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  
  return {
    google: googleUrl,
    outlook: outlookUrl,
    apple: icalUrl,
    title: event.title,
    date: formatDate(event.date),
    time: event.time
  };
};

/**
 * Takvime ekle fonksiyonu
 */
export const addToCalendar = (type: 'google' | 'outlook' | 'apple', event: Event): void => {
  const urls = createCalendarUrl(event);
  
  if (type === 'apple') {
    // Apple Takvim için indirilebilir bir dosya
    const link = document.createElement('a');
    link.href = urls.apple;
    link.download = `${event.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Google ve Outlook için yeni pencerede açma
    window.open(urls[type], '_blank');
  }
};
