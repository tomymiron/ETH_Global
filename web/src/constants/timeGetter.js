function getCurrentLanguage() {
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'es';
    const languageCode = browserLang.split('-')[0];
    return languageCode || 'es';
  } catch {
    return 'es';
  }
}

function getTimeTranslations() {
  const language = getCurrentLanguage();
  
  const translations = {
    'es': { // Spanish
      hours: "hs",
      minutes: "m",
      seconds: "s",
      days: "d",
      months: "M",
      years: "años",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'en': { // English
      hours: "h",
      minutes: "m",
      seconds: "s",
      days: "d",
      months: "M",
      years: "y",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'pt': { // Portuguese
      hours: "h",
      minutes: "m",
      seconds: "s",
      days: "d",
      months: "M",
      years: "a",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'fr': { // French
      hours: "h",
      minutes: "m",
      seconds: "s",
      days: "j",
      months: "M",
      years: "a",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'de': { // German
      hours: "h",
      minutes: "m",
      seconds: "s",
      days: "T",
      months: "M",
      years: "J",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'it': { // Italian
      hours: "h",
      minutes: "m",
      seconds: "s",
      days: "g",
      months: "M",
      years: "a",
      am: "AM",
      pm: "PM",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'ar': { // Arabic
      hours: "س",
      minutes: "د",
      seconds: "ث",
      days: "ي",
      months: "ش",
      years: "س",
      am: "ص",
      pm: "م",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'zh': { // Chinese
      hours: "时",
      minutes: "分",
      seconds: "秒",
      days: "天",
      months: "月",
      years: "年",
      am: "上午",
      pm: "下午",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    },
    'ja': { // Japanese
      hours: "時",
      minutes: "分",
      seconds: "秒",
      days: "日",
      months: "月",
      years: "年",
      am: "午前",
      pm: "午後",
      separator: " | ",
      dateSeparator: " -- ",
      unknown: "???"
    }
  };
  
  // Return translations for the current language, fallback to Spanish
  return translations[language] || translations['es'];
}

// Helper function to get locale for DateTimeFormat
function getLocaleForLanguage(language) {
  const localeMap = {
    'es': 'es-ES',    // Spanish
    'en': 'en-US',    // English
    'pt': 'pt-BR',    // Portuguese (Brazil)
    'fr': 'fr-FR',    // French
    'de': 'de-DE',    // German
    'it': 'it-IT',    // Italian
    'ar': 'ar-SA',    // Arabic (Saudi Arabia)
    'zh': 'zh-CN',    // Chinese (Simplified)
    'ja': 'ja-JP'     // Japanese
  };
  
  return localeMap[language] || 'es-ES';
}

export function shortDate(date) {
    try{
        const t = getTimeTranslations();
        const language = getCurrentLanguage();
        const locale = getLocaleForLanguage(language);
        
        function join(date, options, separator) {
          function format(option) {
              let formatter = new Intl.DateTimeFormat(locale, option);
              return formatter.format(date);
          }
          return options.map(format).join(separator);
        }
        let options = [{ day: "numeric" }, { month: "numeric" }, { year: "numeric" }];
        let dateMid = join(new Date(date), options, "/");
        let dateEnd = date.slice(-8, -3);
        let eventDate = dateMid + t.separator + dateEnd + t.hours;
        return eventDate;
    }catch(err){
        const t = getTimeTranslations();
        return t.unknown;
    }
}

export function dateOnlyFormatter(date) {
  try {
    const t = getTimeTranslations();
    const language = getCurrentLanguage();
    const locale = getLocaleForLanguage(language);
    
    const datePart = date.split(' ')[0];
    const [year, month, day] = datePart.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) throw new Error('Invalid date');
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC'
    });
    const formatted = formatter.format(utcDate);

    const [weekday, ...rest] = formatted.split(' ');
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const capitalizedRest = rest.map((word, i) => {
      if (i === 2) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });

    return `${capitalizedWeekday} ${capitalizedRest.join(' ')}`;
  } catch (err) {
    console.log(err);
    const t = getTimeTranslations();
    return t.unknown;
  }
}

export function dateFullFormatter(date) {
  try {
    const t = getTimeTranslations();
    const language = getCurrentLanguage();
    const locale = getLocaleForLanguage(language);
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
    
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
    const formatted = formatter.format(dateObj);
    const [weekday, ...rest] = formatted.split(' ');
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const time = date.slice(-8, -3);
    
    return `${capitalizedWeekday} ${rest.join('/')}${t.dateSeparator}${time}${t.hours}`.replace(",", "");
  } catch (err) {
    console.log(err);
    const t = getTimeTranslations();
    return t.unknown;
  }
}

export function timeSince(date) {
  if (!date) {
    const t = getTimeTranslations();
    return t.unknown;
  }

  let utcDate;
  if (typeof date === "string" && date.length >= 19) {
    const [datePart, timePart] = date.split(" ");
    if (!datePart || !timePart) {
      const t = getTimeTranslations();
      return t.unknown;
    }
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  } else utcDate = new Date(date);

  if (isNaN(utcDate.getTime())) {
    const t = getTimeTranslations();
    return t.unknown;
  }

  const now = new Date();
  const elapsedSeconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000);

  const t = getTimeTranslations();
  const INTERVALS = [
    { seconds: 31536000, label: t.years },
    { seconds: 2592000, label: t.months },
    { seconds: 86400, label: t.days },
    { seconds: 3600, label: t.hours },
    { seconds: 60, label: t.minutes }
  ];

  for (const { seconds, label } of INTERVALS) {
    const interval = elapsedSeconds / seconds;
    if (interval >= 1) return Math.floor(interval) + label;
  }

  return Math.abs(Math.floor(elapsedSeconds)) + t.seconds;
}

export function formatTime12h (time) {
  if (!time) return "";
  const t = getTimeTranslations();
  
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  const isPM = hour >= 12;
  let displayHour = hour % 12 === 0 ? 12 : hour % 12;
  let suffix = isPM ? t.pm : t.am;
  displayHour = hour;
  suffix = hour >= 12 ? t.pm : t.am;
  return `${displayHour}${minute !== "00" ? `:${minute}` : ""}${suffix}`;
};