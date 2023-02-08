// TODO: DELETEME
const Local = {
  onClearDB: async function() {
    Backend.post('/api/debug/clear-db').send();
  },

  onSelectAll: async function() {
    Backend.post('/api/debug/select-all', {query: document.getElementById('select-all-query').value}).send();
  },

  onInsert: async function() {
    Backend.post('/api/debug/insert', {query: document.getElementById('insert-query').value}).send();
  },

  onUpdate: async function() {
    Backend.post('/api/debug/update', {query: document.getElementById('update-query').value}).send();
  },

  onDelete: async function() {
    Backend.post('/api/debug/delete', {query: document.getElementById('delete-query').value}).send();
  },

  onLoad: async function() {
    Templates.init(Templates.BUTTON, {
      type: 'info',
      title: 'Clear DB',
      onClick: Local.onClearDB,
    }).then(x => x.replaceTag('clear-db-btn'));

    Templates.init(Templates.BUTTON, {
      type: 'info',
      title: 'Select all',
      onClick: Local.onSelectAll,
    }).then(x => x.replaceTag('select-all-btn'));

    Templates.init(Templates.BUTTON, {
      type: 'info',
      title: 'Insert',
      onClick: Local.onInsert,
    }).then(x => x.replaceTag('insert-btn'));

    Templates.init(Templates.BUTTON, {
      type: 'info',
      title: 'Update',
      onClick: Local.onUpdate,
    }).then(x => x.replaceTag('update-btn'));

    Templates.init(Templates.BUTTON, {
      type: 'info',
      title: 'Delete',
      onClick: Local.onDelete,
    }).then(x => x.replaceTag('delete-btn'));
  },
};

window.addEventListener('load', Local.onLoad);
