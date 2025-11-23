function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

export function shortDateFormatter(date) {
  function join(date, options, separator) {
    function format(option) {
      let formatter = new Intl.DateTimeFormat("es", option);
      return formatter.format(date);
    }
    return options.map(format).join(separator);
  }
  let options = [{ day: "numeric" }, { month: "long" }];
  
  let dateMid = join(new Date(date), options, " ");

  let day = new Date(date).getDate();
  let formattedDay = day < 10 ? `0${day}` : day;

  dateMid = dateMid.replace(day, formattedDay);
  let eventDate = capitalizeWords(dateMid);
  return eventDate;
}

export function dateFormatter(date) {
  function join(date, options, separator) {
    function format(option) {
      let formatter = new Intl.DateTimeFormat("es", option);
      return formatter.format(date);
    }
    return options.map(format).join(separator);
  }

  let options = [{ day: "numeric" }, { month: "long" }];
  let dateSta = join(new Date(date), [{ weekday: "long" }], " ");
  let dateMid = join(new Date(date), options, " ");
  
  let eventDate = dateSta.charAt(0).toUpperCase() + dateSta.slice(1) + " " + capitalizeWords(dateMid);
  return eventDate;
}

export function datetimeFormatter(date) {
  const dateObj = new Date(date);

  let weekday = dateObj.toLocaleDateString('es', { weekday: 'long' });
  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  const formattedDate = `${weekday} ${day}/${month}/${year} -- ${hours}.${minutes}hs`;
  return formattedDate;
}