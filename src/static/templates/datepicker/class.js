Templates.register(class extends BaseTemplate {
  static keys = ['DATEPICKER'];

  static templateFile = './body.html';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        title:    {default: null,  types: ['string', 'null']},
        value:    {default: 0,     types: ['number']},
        required: {default: false, types: ['boolean']},
        disabled: {default: false, types: ['boolean']}, // TODO
      },
    };
  }

  elements = {
    title: {
      container: null,
      field: null,
      required: null,
    },

    display: {
      container: null,
      field: null,
      btn: null,
    },

    popover: {
      container: null,
      header: {
        nextMonthBtn: null,
        lastMonthBtn: null,
        currentMonthDisplay: null,
      },
      body: {
        dateContainer: null,
      },
      time: {
        hour: {
          container: null,
          display: null,
          inc: null,
          dec: null,
        },
        minutes: {
          container: null,
          display: null,
          inc: null,
          dec: null,
        },
        seconds: {
          container: null,
          display: null,
          inc: null,
          dec: null,
        },
      },
    },
  };

  _firstDayPaddingConversionChart = [
    6, 0, 1, 2, 3, 4, 5, // JS thinks Sunday = day 0, the bastard
  ];

  _lastDayPaddingConversionChart = [
    0, 6, 5, 4, 3, 2, 1,
  ];

  _onPopoverDateClicked(date) {
    const value = new Date(this._displayedDate.getTime());
    value.setDate(date);
    this._setValue(value.getTime() / 1000);
  }

  _addPopoverDate(date) {
    const elem = document.createElement('div');
    elem.classList.add('popover-date');
    if (date != null) {
      elem.classList.add('actual-date');
      elem.innerText = date;

      if (this._displayedDate.getFullYear() === this._date.getFullYear() && this._displayedDate.getMonth() === this._date.getMonth() && date === this._date.getDate()) {
        elem.classList.add('selected');
      }

      elem.addEventListener('click', () => this._onPopoverDateClicked(date));
    }

    this.elements.popover.body.dateContainer.appendChild(elem);
  }

  _displayedDate = null;
  _displayPopoverMonth(date) {
    this._displayedDate = new Date(date.getTime());
    date = new Date(this._displayedDate.getTime());

    this.elements.popover.header.currentMonthDisplay.innerText = date.toLocaleString('default', {month: 'long'}) + ' ' + date.getFullYear();
    this._helpers.deleteChildren(this.elements.popover.body.dateContainer);

    date.setDate(1);
    for (let i = 0; i < this._firstDayPaddingConversionChart[date.getDay()]; ++i) {
      this._addPopoverDate(null);
    }

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; ++i) {
      this._addPopoverDate(i);
    }

    date.setDate(daysInMonth);
    for (let i = 0; i < this._lastDayPaddingConversionChart[date.getDay()]; ++i) {
      this._addPopoverDate(null);
    }

    this._displayPopoverTime();
  }

  _displayPopoverTime() {
    this.elements.popover.time.hour.display.innerText = this._displayedDate.getHours().toString().padStart(2, '0');
    this.elements.popover.time.minutes.display.innerText = this._displayedDate.getMinutes().toString().padStart(2, '0');
    this.elements.popover.time.seconds.display.innerText = this._displayedDate.getSeconds().toString().padStart(2, '0');
  }

  _modifyMonth(by) {
    const date = new Date(this._displayedDate.getTime());
    date.setMonth(date.getMonth() + by);
    this._displayPopoverMonth(date);
  }

  _modifyTime(which, by) {
    const date = new Date(this._displayedDate.getTime());
    if (which === 'hour') {
      date.setHours(date.getHours() + by);
    } else if (which === 'minutes') {
      date.setMinutes(date.getMinutes() + by);
    } else if (which === 'seconds') {
      date.setSeconds(date.getSeconds() + by);
    }
    this._setValue(date.getTime() / 1000);
  }

  _value = null;
  _date = null;
  _setValue(value) {
    this._value = value;
    this._date = new Date(value * 1000);
    this.elements.display.field.innerText = Helpers.formatDate(this._date);
    this._displayPopoverMonth(this._date);
  }

  _setTitle(value) {
    this.elements.title.container.classList.toggle('hidden', value == null);
    this.elements.display.field.classList.toggle('titleless', value == null);

    this.elements.title.field.innerText = value;
  }

  _setRequired(value) {
    this.elements.title.required.classList.toggle('hidden', !value);
  }

  _setDisabled(value) {
    // TODO
  }

  _togglePopover(to = null) {
    if (to == null) {
      this.elements.popover.container.classList.toggle('hidden');
    } else {
      this.elements.popover.container.classList.toggle('hidden', to);
    }

    if (!this.elements.popover.container.classList.contains('hidden')) {
      this.elements.popover.container.focus();
      this._displayPopoverMonth(this._date);
    }
  }

  async onInit(input) {
    this.elements.title.container = this.element.getElementsByClassName('title-container')[0];
    this.elements.title.field = this.elements.title.container.getElementsByClassName('title')[0];
    this.elements.title.required = this.elements.title.container.getElementsByClassName('required')[0];

    this.elements.display.container = this.element.getElementsByClassName('date-display-container')[0];
    this.elements.display.field = this.element.getElementsByClassName('date-display')[0];
    this.elements.display.btn = this.elements.display.container.getElementsByTagName('i')[0];

    this.elements.popover.container = this.element.getElementsByClassName('popover')[0];
    this.elements.popover.header.nextMonthBtn = this.elements.popover.container.getElementsByClassName('popover-next-month')[0];
    this.elements.popover.header.lastMonthBtn = this.elements.popover.container.getElementsByClassName('popover-last-month')[0];
    this.elements.popover.header.currentMonthDisplay = this.elements.popover.container.getElementsByClassName('popover-current-month')[0];
    this.elements.popover.body.dateContainer = this.elements.popover.container.getElementsByClassName('popover-date-container')[0];
    this.elements.popover.time.hour.container = this.elements.popover.container.getElementsByClassName('time-container-hour')[0];
    this.elements.popover.time.hour.display = this.elements.popover.time.hour.container.getElementsByClassName('time-display')[0];
    this.elements.popover.time.hour.inc = this.elements.popover.time.hour.container.getElementsByClassName('increase')[0];
    this.elements.popover.time.hour.dec = this.elements.popover.time.hour.container.getElementsByClassName('decrease')[0];
    this.elements.popover.time.minutes.container = this.elements.popover.container.getElementsByClassName('time-container-minutes')[0];
    this.elements.popover.time.minutes.display = this.elements.popover.time.minutes.container.getElementsByClassName('time-display')[0];
    this.elements.popover.time.minutes.inc = this.elements.popover.time.minutes.container.getElementsByClassName('increase')[0];
    this.elements.popover.time.minutes.dec = this.elements.popover.time.minutes.container.getElementsByClassName('decrease')[0];
    this.elements.popover.time.seconds.container = this.elements.popover.container.getElementsByClassName('time-container-seconds')[0];
    this.elements.popover.time.seconds.display = this.elements.popover.time.seconds.container.getElementsByClassName('time-display')[0];
    this.elements.popover.time.seconds.inc = this.elements.popover.time.seconds.container.getElementsByClassName('increase')[0];
    this.elements.popover.time.seconds.dec = this.elements.popover.time.seconds.container.getElementsByClassName('decrease')[0];

    this.elements.display.btn.addEventListener('click', () => this._togglePopover());
    this.elements.popover.container.addEventListener('focusout', () => this._togglePopover(true));
    this.elements.popover.header.nextMonthBtn.addEventListener('click', () => this._modifyMonth( 1));
    this.elements.popover.header.lastMonthBtn.addEventListener('click', () => this._modifyMonth(-1));
    this.elements.popover.time.hour.inc.addEventListener('click', () => this._modifyTime('hour',  1));
    this.elements.popover.time.hour.dec.addEventListener('click', () => this._modifyTime('hour', -1));
    this.elements.popover.time.minutes.inc.addEventListener('click', () => this._modifyTime('minutes',  1));
    this.elements.popover.time.minutes.dec.addEventListener('click', () => this._modifyTime('minutes', -1));
    this.elements.popover.time.seconds.inc.addEventListener('click', () => this._modifyTime('seconds',  1));
    this.elements.popover.time.seconds.dec.addEventListener('click', () => this._modifyTime('seconds', -1));

    this._setValue(input.value);
    this._setTitle(input.title);
    this._setRequired(input.required);
    this._setDisabled(input.disabled);
  }

  async onUpdate(input) {
    if ('title' in input) {
      this._setTitle(input.title);
    }

    if ('value' in input) {
      this._setValue(input.value);
    }

    if ('required' in input) {
      this._setRequired(input.required);
    }

    if ('disabled' in input) {
      this._setDisabled(input.disabled);
    }
  }

  value() {
    return this._value;
  }

  date() {
    return new Date(this._date.getTime());
  }

  displayValue() {
    return Helpers.formatDate(this._date);
  }
});
