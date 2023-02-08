window.addEventListener('load', () => {
  const onLogout = () => {
    Modals.show(Modals.LOADING, {title: 'Logging out...'});
    Backend.post('/api/logout').onSuccess(Backend.redirectTo).onFailure((response) => {
      Backend.onFailure(response);
      Modals.hide(Modals.LOADING);
    }).send();
  };

  Templates.init(Templates.BUTTON, {type: null, title: 'Logout', onClick: onLogout})
    .then(x => x.replaceTag('logout-btn', document.getElementById('menu')));
});
