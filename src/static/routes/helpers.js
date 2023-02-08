const Helpers = {
  clearContainer: function(container) {
    while (container.firstChild) {
      container.removeChild(container.lastChild);
    }
  },

  formatDate: function(date) {
    return date.getFullYear() + '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
      date.getDate().toString().padStart(2, '0') + ' ' +
      date.getHours().toString().padStart(2, '0') + ':' +
      date.getMinutes().toString().padStart(2, '0') + ':' +
      date.getSeconds().toString().padStart(2, '0');
  },

  valueOrEmpty: function(value) {
    if (value != null) { return value; }
    const elem = document.createElement('i');
    elem.innerText = 'Empty';
    return elem;
  },

  formatDecimals: function(value) {
    let formatted = value.toFixed(2);
    return formatted.endsWith('.00') ? formatted.substring(0, formatted.length - 3) : formatted;
  },
};
