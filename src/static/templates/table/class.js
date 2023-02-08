Templates.registerType('--table-column', (value) => {
  return Templates.valueIsObject(value, {
    name:    ['string'],
    display: ['function'],
  });
});

Templates.registerType('--table-button--display', (value) => {
  return Templates.valueIsObject(value, {
    icon:    ['string',      'null'],
    text:    ['string',      'null'],
    type:    ['button-type', 'null'],
    tooltip: ['string',      'null'],
  });
});

Templates.registerType('--table-button', (value) => {
  return Templates.valueIsObject(value, {
    display: ['--table-button--display'],
    onClick: ['function'],
  });
});

Templates.register(class extends BaseTemplate {
  static keys = ['TABLE'];

  static template = '<div></div>';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        items:   {required: true, types: ['*[]']},
        columns: {required: true, types: ['--table-column[]']},
        buttons: {default: null,  types: ['--table-button[]']}, // TODO

        onRowCreated:  {default: null, types: ['function']}, // TODO
        onCellCreated: {default: null, types: ['function']}, // TODO
      },
    };
  }

  _setupTable(columns, hasButtons) {
    const size = hasButtons ? '5fr' : '1fr';

    let template = 'repeat(' + columns.length + ', ' + size + ')';
    if (hasButtons) {
      template += ' 1fr';
    }

    this.element.style.gridTemplateColumns = template;
  }

  async _setupHeader(columns, hasButtons) {
    for (let i = 0; i < columns.length; ++i) {
      const cell = document.createElement('div');
      cell.classList.add('table-cell', 'table-header-cell');
      if (i === 0) { cell.classList.add('tl'); }
      else if (!hasButtons && i === columns.length - 1) { cell.classList.add('tr', 'rightmost'); }

      cell.innerText = columns[i].name;
      this.element.appendChild(cell);
    }

    if (hasButtons) {
      const cell = document.createElement('div');
      cell.classList.add('table-cell', 'table-header-cell', 'table-button-cell', 'tr', 'rightmost');
      this.element.appendChild(cell);
    }
  }

  async _setupNoItemRow(columns, hasButtons) {
    const width = columns.length + 1 + (hasButtons ? 1 : 0); // For some reason, 1/4 covers 3 cells
    const div = document.createElement('div');
    div.classList.add('table-cell', 'table-empty-cell', 'rightmost', 'bl', 'br', 'table-row-even');
    div.style.gridColumn = `1/${width}`;
    div.innerText = 'No items available';
    this.element.appendChild(div);
  }

  async _setupRows(items, columns, hasButtons, buttons) {
    for (let i = 0; i < items.length; ++i) {
      const tableRowType = 'table-row-' + (i % 2 === 0 ? 'even' : 'odd');
      for (let c = 0; c < columns.length; ++c) {
        const cell = document.createElement('div');
        cell.classList.add('table-cell', tableRowType);
        if (!hasButtons && c === columns.length - 1) {
          cell.classList.add('rightmost');
          if (i === items.length - 1) {
            cell.classList.add('br');
          }
        } else if (c === 0 && i === items.length - 1) {
          cell.classList.add('bl');
        }

        const display = await Promise.resolve(columns[c].display(items[i]));
        if (display instanceof HTMLElement) {
          cell.appendChild(display);
        } else if (display instanceof BaseTemplate) {
          display.appendTo(cell);
        } else {
          cell.innerText = display;
        }

        this.element.appendChild(cell);
      }

      if (hasButtons) {
        const cell = document.createElement('div');
        cell.classList.add('table-cell', tableRowType, 'table-button-cell', 'br', 'rightmost');

        for (const button of buttons) {
          const onClick = button.onClick ? (() => button.onClick(items[i])) : null;
          const template = await Templates.init(Templates.BUTTON, {
            title: button.display.text,
            icon: button.display.icon,
            type: button.display.type,
            tooltip: button.display.tooltip,
            onClick: onClick,
          });
          template.appendTo(cell);
        }

        this.element.appendChild(cell);
      }
    }
  }

  async onInit(input) {
    const hasButtons = input.buttons != null;

    this._setupTable(input.columns, hasButtons);
    await this._setupHeader(input.columns, hasButtons);
    if (input.items.length > 0) {
      await this._setupRows(input.items, input.columns, hasButtons, input.buttons);
    } else {
      await this._setupNoItemRow(input.columns, hasButtons);
    }
  }
});
