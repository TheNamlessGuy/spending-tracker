Templates.register(class extends BaseTemplate {
  static keys = ['COLORPICKER'];

  static templateFile = './body.html';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        rgb:  {default: null, types: ['string']},
        rgba: {default: null, types: ['string']},
        hex:  {default: null, types: ['string']},
        hsl:  {default: null, types: ['string']},
        hsla: {default: null, types: ['string']},

        title:    {default: null,  types: ['string', 'null']},
        required: {default: false, types: ['boolean']},
        alpha:    {default: false, types: ['boolean']}, // TODO

        onChange: {default: null, types: ['function']},
      },
    };
  }

  elements = {
    title: {
      container: null,
      display: null,
      required: null,
    },

    color: {
      container: null,
      display: null,
    },

    popover: {
      container: null,
      slider: {
        h: {
          display: null,
          selector: null,
          value: null,
        },
        s: {
          display: null,
          selector: null,
          value: null,
        },
        l: {
          display: null,
          selector: null,
          value: null,
        },
      },
    },
  };

  _setTitle(value) {
    this.elements.title.container.classList.toggle('hidden',    value == null);
    this.elements.color.container.classList.toggle('titleless', value == null);

    this.elements.title.display.innerText = value;
  }

  _setRequired(value) {
    this.elements.title.required.classList.toggle('hidden', !value);
  }

  _hsla = null;
  _onChangeCallback = null;
  _setHSLA(value) {
    if (
      value.h === this._hsla?.h &&
      value.s === this._hsla?.s &&
      value.l === this._hsla?.l &&
      value.a === this._hsla?.a
    ) {
      return;
    }

    this._hsla = value;
    if (this._onChangeCallback) { this._onChangeCallback(); }

    this.elements.color.display.innerText = this.hex();
    this.elements.color.container.style.backgroundColor = this.toString.hsla();

    this._generateSlider_h().forEach(x => this.elements.popover.slider.h.display.style.background = x);
    this._generateSlider_s().forEach(x => this.elements.popover.slider.s.display.style.background = x);
    this._generateSlider_l().forEach(x => this.elements.popover.slider.l.display.style.background = x);

    this.elements.popover.slider.h.value.update({value: this._hsla.h});
    this.elements.popover.slider.s.value.update({value: this._hsla.s});
    this.elements.popover.slider.l.value.update({value: this._hsla.l});

    this._setSliderSelectors();
  }

  _setSliderSelectors() {
    let box = this.elements.popover.slider.h.display.getBoundingClientRect();
    let percentage = this._hsla.h / 360;
    this.elements.popover.slider.h.selector.style.left = ((box.width * percentage) - 2) + 'px'; // - 2 = 1px(border) + 1px(width)

    box = this.elements.popover.slider.s.display.getBoundingClientRect();
    percentage = this._hsla.s / 100;
    this.elements.popover.slider.s.selector.style.left = ((box.width * percentage) - 2) + 'px';

    box = this.elements.popover.slider.l.display.getBoundingClientRect();
    percentage = this._hsla.l / 100;
    this.elements.popover.slider.l.selector.style.left = ((box.width * percentage) - 2) + 'px';
  }

  _togglePopover(to = null) {
    if (to == null) {
      this.elements.popover.container.classList.toggle('hidden');
    } else {
      this.elements.popover.container.classList.toggle('hidden', to);
    }

    if (!this.elements.popover.container.classList.contains('hidden')) {
      this.elements.popover.container.focus();
      this._setSliderSelectors();
    }
  }

  _onPopoverFocusLoss(e) {
    if (e.relatedTarget && this.elements.popover.container.contains(e.relatedTarget)) {
      return;
    }

    this._togglePopover(true);
  }

  _onSliderInputChange_h() {
    let value = this.elements.popover.slider.h.value.value();
    if (value == null) { value = this._hsla.h; }
    else if (value > 360) { value = 360; }
    else if (value < 0) { value = 0; }

    const hsla = JSON.parse(JSON.stringify(this._hsla));
    hsla.h = value;
    this._setHSLA(hsla);
  }

  _onMouseEvent_h(e, click) {
    if (!click && e.buttons !== 1) { return; }
    const width = this.elements.popover.slider.h.display.getBoundingClientRect().width;
    let percentage = e.offsetX / width;
    if (percentage > 1) { percentage = 1; }
    else if (percentage < 0) { percentage = 0; }

    const value = JSON.parse(JSON.stringify(this._hsla));
    value.h = percentage * 360;
    this._setHSLA(value);
  }

  _onSliderInputChange_s() {
    let value = this.elements.popover.slider.s.value.value();
    if (value == null) { value = this._hsla.s; }
    else if (value > 100) { value = 100; }
    else if (value < 0) { value = 0; }

    const hsla = JSON.parse(JSON.stringify(this._hsla));
    hsla.s = value;
    this._setHSLA(hsla);
  }

  _onMouseEvent_s(e, click) {
    if (!click && e.buttons !== 1) { return; }
    const width = this.elements.popover.slider.s.display.getBoundingClientRect().width;
    let percentage = e.offsetX / width;
    if (percentage > 1) { percentage = 1; }
    else if (percentage < 0) { percentage = 0; }

    const value = JSON.parse(JSON.stringify(this._hsla));
    value.s = percentage * 100;
    this._setHSLA(value);
  }

  _onSliderInputChange_l() {
    let value = this.elements.popover.slider.l.value.value();
    if (value == null) { value = this._hsla.l; }
    else if (value > 100) { value = 100; }
    else if (value < 0) { value = 0; }

    const hsla = JSON.parse(JSON.stringify(this._hsla));
    hsla.l = value;
    this._setHSLA(hsla);
  }

  _onMouseEvent_l(e, click) {
    if (!click && e.buttons !== 1) { return; }
    const width = this.elements.popover.slider.l.display.getBoundingClientRect().width;
    let percentage = e.offsetX / width;
    if (percentage > 1) { percentage = 1; }
    else if (percentage < 0) { percentage = 0; }

    const value = JSON.parse(JSON.stringify(this._hsla));
    value.l = percentage * 100;
    this._setHSLA(value);
  }

  async onInit(input) {
    this._onChangeCallback = input.onChange;

    this.elements.title.container = this.element.getElementsByClassName('title-container')[0];
    this.elements.title.display = this.elements.title.container.getElementsByClassName('title')[0];
    this.elements.title.required = this.elements.title.container.getElementsByClassName('required')[0];

    this.elements.color.container = this.element.getElementsByClassName('color-display-container')[0];
    this.elements.color.display = this.elements.color.container.getElementsByClassName('color-display')[0];

    this.elements.popover.container = this.element.getElementsByClassName('popover')[0];

    this.elements.popover.slider.h.display  = this.elements.popover.container.getElementsByClassName('slider-h')[0];
    this.elements.popover.slider.h.display.addEventListener('mousemove', (e) => this._onMouseEvent_h(e, false));
    this.elements.popover.slider.h.display.addEventListener('click', (e) => this._onMouseEvent_h(e, true));
    this.elements.popover.slider.h.selector = this.elements.popover.slider.h.display.getElementsByClassName('slider-selector')[0];
    this.elements.popover.slider.h.value = await Templates.init(Templates.INPUT, {
      value: 0,
      type: 'number',
      onEnter: () => this._onSliderInputChange_h(),
      onBlur: (e) => { this._onSliderInputChange_h(); this._onPopoverFocusLoss(e); },
      width: '3ch',
      cssClasses: ['slider-value'],
    });
    this.elements.popover.slider.h.value.replaceTag('slider-value-h', this.elements.popover.container);

    this.elements.popover.slider.s.display  = this.elements.popover.container.getElementsByClassName('slider-s')[0];
    this.elements.popover.slider.s.display.addEventListener('mousemove', (e) => this._onMouseEvent_s(e, false));
    this.elements.popover.slider.s.display.addEventListener('click', (e) => this._onMouseEvent_s(e, true));
    this.elements.popover.slider.s.selector = this.elements.popover.slider.s.display.getElementsByClassName('slider-selector')[0];
    this.elements.popover.slider.s.value = await Templates.init(Templates.INPUT, {
      value: 0,
      type: 'number',
      onEnter: () => this._onSliderInputChange_s(),
      onBlur: (e) => { this._onSliderInputChange_s(); this._onPopoverFocusLoss(e); },
      width: '3ch',
      cssClasses: ['slider-value'],
    });
    this.elements.popover.slider.s.value.replaceTag('slider-value-s', this.elements.popover.container);

    this.elements.popover.slider.l.display  = this.elements.popover.container.getElementsByClassName('slider-l')[0];
    this.elements.popover.slider.l.display.addEventListener('mousemove', (e) => this._onMouseEvent_l(e, false));
    this.elements.popover.slider.l.display.addEventListener('click', (e) => this._onMouseEvent_l(e, true));
    this.elements.popover.slider.l.selector = this.elements.popover.slider.l.display.getElementsByClassName('slider-selector')[0];
    this.elements.popover.slider.l.value = await Templates.init(Templates.INPUT, {
      value: 0,
      type: 'number',
      onEnter: () => this._onSliderInputChange_l(),
      onBlur: (e) => { this._onSliderInputChange_l(); this._onPopoverFocusLoss(e); },
      width: '3ch',
      cssClasses: ['slider-value'],
    });
    this.elements.popover.slider.l.value.replaceTag('slider-value-l', this.elements.popover.container);

    this.elements.color.container.addEventListener('click', () => this._togglePopover());
    this.elements.popover.container.addEventListener('blur', (e) => this._onPopoverFocusLoss(e));

    this._setTitle(input.title);
    this._setRequired(input.required);

    if (input.rgb) {
      this._setHSLA(this.convert.rgb.to.hsla(input.rgb));
    } else if (input.rgba) {
      this._setHSLA(this.convert.rgba.to.hsla(input.rgba));
    } else if (input.hsl) {
      this._setHSLA(this.convert.hsl.to.hsla(input.hsl));
    } else if (input.hsla) {
      this._setHSLA(input.hsla);
    } else if (input.hex) {
      this._setHSLA(this.convert.hex.to.hsla(input.hex));
    }
  }

  async onUpdate(input) {
    if ('onChange' in input) {
      this._onChangeCallback = input.onChange;
    }

    if ('title' in input) {
      this._setTitle(input.title);
    }

    if ('required' in input) {
      this._setRequired(input.required);
    }

    if ('rgb' in input) {
      this._setHSLA(this.convert.rgb.to.hsla(input.rgb));
    }

    if ('rgba' in input) {
      this._setHSLA(this.convert.rgba.to.hsla(input.rgba));
    }

    if ('hsl' in input) {
      this._setHSLA(this.convert.hsl.to.hsla(input.hsl));
    }

    if ('hsla' in input) {
      this._setHSLA(input.hsla);
    }

    if ('hex' in input) {
      this._setHSLA(this.convert.hex.to.hsla(input.hex));
    }
  }

  _generateSlider_h() {
    let retval = 'linear-gradient(left';
    for (let h = 0; h <= 360; h += 10) {
      retval += `, hsla(${h}, ${this._hsla.s}%, ${this._hsla.l}%, ${this._hsla.a})`;
    }
    retval += ')';

    return [
      retval,
      '-webkit-' + retval,
      '-moz-' + retval,
    ];
  }

  _generateSlider_s() {
    let retval = 'linear-gradient(left';
    for (let s = 0; s <= 100; s += 20) {
      retval += `, hsla(${this._hsla.h}, ${s}%, ${this._hsla.l}%, ${this._hsla.a})`;
    }
    retval += ')';

    return [
      retval,
      '-webkit-' + retval,
      '-moz-' + retval,
    ];
  }

  _generateSlider_l() {
    let retval = 'linear-gradient(left';
    for (let l = 0; l <= 100; l += 20) {
      retval += `, hsla(${this._hsla.h}, ${this._hsla.s}%, ${l}%, ${this._hsla.a})`;
    }
    retval += ')';

    return [
      retval,
      '-webkit-' + retval,
      '-moz-' + retval,
    ];
  }

  convert = {
    hsl: { to: {
      hsla: (value) => {
        value = JSON.parse(JSON.stringify(value));
        value.a = 1;
        return value;
      },
      rgb: (value) => {
        return this.convert.rgba.to.rgb(this.convert.hsl.to.rgba(value));
      },
      rgba: (value) => {
        return this.convert.hsla.to.rgba(this.convert.hsl.to.hsla(value));
      },
      hex: (value) => {
        return this.convert.rgb.to.hex(this.convert.hsl.to.rgb(value));
      },
    }},

    rgb: { to: {
      hsl: (value) => {
        return this.convert.rgba.to.hsl(this.convert.rgb.to.rgba(value));
      },
      hsla: (value) => {
        return this.convert.rgba.to.hsla(this.convert.rgb.to.rgba(value));
      },
      rgba: (value) => {
        value = JSON.parse(JSON.stringify(value));
        value.a = 1;
        return value;
      },
      hex: (value) => {
        let retval = '#';
        retval += value.r.toString(16).toUpperCase().padStart(2, '0');
        retval += value.g.toString(16).toUpperCase().padStart(2, '0');
        retval += value.b.toString(16).toUpperCase().padStart(2, '0');
        return retval;
      },
    }},

    hsla: { to: {
      hsl: (value) => {
        value = JSON.parse(JSON.stringify(value));
        delete value.a;
        return value;
      },
      rgb: (value) => {
        return this.convert.rgba.to.rgb(this.convert.hsla.to.rgba(value));
      },
      rgba: (value) => { // https://github.com/o-klp/hsl_rgb_converter/blob/master/converter.js
        const retval = {r: null, g: null, b: null, a: value.a};

        value = JSON.parse(JSON.stringify(value));
        value.s /= 100;
        value.l /= 100;

        const chroma = (1 - Math.abs((2 * value.l) - 1)) * value.s;
        let hueP = value.h / 60;
        const secondComponent = chroma * (1 - Math.abs((hueP % 2) - 1));
        hueP = Math.floor(hueP);

        if (hueP === 0) {
          retval.r = chroma;
          retval.g = secondComponent;
          retval.b = 0;
        } else if (hueP === 1) {
          retval.r = secondComponent;
          retval.g = chroma;
          retval.b = 0;
        } else if (hueP === 2) {
          retval.r = 0;
          retval.g = chroma;
          retval.b = secondComponent;
        } else if (hueP === 3) {
          retval.r = 0;
          retval.g = secondComponent;
          retval.b = chroma;
        } else if (hueP === 4) {
          retval.r = secondComponent;
          retval.g = 0;
          retval.b = chroma;
        } else if (hueP === 5) {
          retval.r = chroma;
          retval.g = 0;
          retval.b = secondComponent;
        }

        const lAdjust = value.l - (chroma / 2);
        retval.r += lAdjust;
        retval.g += lAdjust;
        retval.b += lAdjust;

        retval.r = Math.round(retval.r * 255);
        retval.g = Math.round(retval.g * 255);
        retval.b = Math.round(retval.b * 255);

        return retval;
      },
      hex: (value) => {
        return this.convert.rgb.to.hex(this.convert.hsla.to.rgb(value));
      },
    }},

    rgba: { to: {
      hsl: (value) => {
        return this.convert.hsla.to.hsl(this.convert.rgba.to.hsla(value));
      },
      hsla: (value) => { // https://stackoverflow.com/a/9493060
        value = JSON.parse(JSON.stringify(value));

        value.r /= 255;
        value.g /= 255;
        value.b /= 255;

        const max = Math.max(value.r, value.g, value.b);
        const min = Math.min(value.r, value.g, value.b);

        const tmp = (max + min) / 2;
        const retval = {h: tmp, s: tmp, l: tmp, a: value.a};

        if (max === min) {
          retval.h = 0;
          retval.s = 0;
        } else {
          const d = max - min;
          retval.s = retval.l >= 0.5 ? d / (2 - (max - min)) : d / (max + min);
          if (max === value.r) {
            retval.h = ((value.g - value.b) / d + 0) * 60;
          } else if (max === value.g) {
            retval.h = ((value.b - value.r) / d + 2) * 60;
          } else if (max === value.b) {
            retval.h = ((value.r - value.g) / d + 4) * 60;
          }
        }

        retval.s *= 100;
        retval.l *= 100;
        return retval;
      },
      rgb: (value) => {
        value = JSON.parse(JSON.stringify(value));
        delete value.a;
        return value;
      },
      hex: (value) => {
        return this.convert.rgb.to.hex(this.convert.rgba.to.rgb(value));
      },
    }},

    hex: { to: {
      hsl: (value) => {
        return this.convert.hsla.to.hsl(this.convert.hex.to.hsla(value));
      },
      hsla: (value) => {
        return this.convert.rgba.to.hsla(this.convert.hex.to.rgba(value));
      },
      rgb: (value) => {
        if (value.length === 4) {
          return {
            r: parseInt(value.substring(1, 2).repeat(2), 16),
            g: parseInt(value.substring(2, 3).repeat(2), 16),
            b: parseInt(value.substring(3, 4).repeat(2), 16),
          };
        }

        return {
          r: parseInt(value.substring(1, 3), 16),
          g: parseInt(value.substring(3, 5), 16),
          b: parseInt(value.substring(5, 7), 16),
        };
      },
      rgba: (value) => {
        return this.convert.rgb.to.rgba(this.convert.hex.to.rgb(value));
      },
    }},
  };

  toString = {
    hsl: () => {
      const value = this.hsl();
      return `hsl(${value.h}, ${value.s}%, ${value.l}%)`;
    },
    hsla: () => {
      const value = this.hsla();
      return `hsla(${value.h}, ${value.s}%, ${value.l}%, ${value.a})`;
    },
    rgb: () => {
      const value = this.rgb();
      return `rgb(${value.r}, ${value.g}, ${value.b})`;
    },
    rgba: () => {
      const value = this.rgba();
      return `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;
    },
    hex: () => {
      return this.hex();
    },
  };

  hsl() {
    return this.convert.hsla.to.hsl(this._hsla);
  }

  hsla() {
    return JSON.parse(JSON.stringify(this._hsla));
  }

  hex() {
    return this.convert.hsla.to.hex(this._hsla);
  }

  rgb() {
    return this.convert.hsla.to.rgb(this._hsla);
  }

  rgba() {
    return this.convert.hsla.to.rgba(this._hsla);
  }
});
