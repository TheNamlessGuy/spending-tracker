/*const Local = {
  loadUsers: async function() {
    const userContainer = document.getElementById('user-container');
    Helpers.clearContainer(userContainer);
    const loading = await Templates.init(Templates.LOADING);
    loading.appendTo(userContainer);

    Backend.get('/api/models/user')
      .onSuccess(async (response) => {
        for (const user of response.results()) {
          const elem = await Templates.init(Templates.LOGIN.USER, {item: user, onClick: Local.onUserClicked});
          elem.appendTo(userContainer);
        }
      })
      .finally(() => {
        loading.remove();
      })
      .send();
  },

  onAddNewUser: function() {
    Modals.show(Modals.LOGIN.USER.NEW, {onSuccess: Local.loadUsers, onFailure: Backend.onFailure});
  },

  onUserClicked: function(user) {
    Modals.show(Modals.LOADING, {title: 'Logging in...'}, true);
    Backend.post('/api/login', {name: user.name}).onSuccess(Backend.redirectTo).onFailure((response) => {
      Backend.onFailure(response);
      Modals.hide(Modals.LOADING);
    }).send();
  },

  onLoad: function() {
    Templates.init(Templates.BUTTON, {type: 'info', title: 'Add new user', onClick: Local.onAddNewUser}).then(x => x.replaceTag('add-new-user-button'));
    Local.loadUsers();
  },
};*/

class Local extends BaseLocal {
  static backendRoute = '/api/models/user';

  static newItemButtonTitle = 'Add new user';
  static newItemButtonModalID = Modals.LOGIN.USER.NEW;

  static async onUserClicked(user) {
    Modals.show(Modals.LOADING, {title: 'Logging in...'}, true);
    Backend.post('/api/login', {name: user.name})
      .onSuccess(Backend.redirectTo)
      .onFailure((response) => Local.errors.add('Error while logging in', ...response.errors()))
      .finally(() => Modals.hide(Modals.LOADING))
      .send();
  }

  static async displayItems(items, container) {
    for (const item of items) {
      const template = await Templates.init(Templates.LOGIN.USER, {item: item, onClick: Local.onUserClicked.bind(Local)});
      template.appendTo(container);
    }
  }
}

window.addEventListener('load', Local.onLoad.bind(Local));
