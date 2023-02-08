const Backend = {
  FORMDATA: 'form-data',
  JSON: 'json',

  _call: class {
    _onSuccessCallback = null;
    _onFailureCallback = Backend.onFailure;
    _finallyCallback = null;

    url;
    parameters;
    method;
    type;

    constructor(url, parameters, method, type) {
      this.url = url;
      this.parameters = parameters;
      this.method = method;
      this.type = type;
    }

    onSuccess(callback) {
      this._onSuccessCallback = callback;
      return this;
    }

    onFailure(callback) {
      this._onFailureCallback = callback;
      return this;
    }

    finally(callback) {
      this._finallyCallback = callback;
      return this;
    }

    _sendPost() {
      const payload = {
        method: 'POST',
        body: this.parameters,
      };

      if (this.type === Backend.JSON) {
        payload.body = JSON.stringify(payload.body);
        payload.headers = {'Content-Type': 'application/json'};
      } else if (this.type === Backend.FORMDATA) {
        // Noop
      }

      return fetch(this.url, payload);
    }

    _sendDelete() {
      return fetch(this.url, {
        method: 'DELETE',
        body: JSON.stringify(this.parameters),
        headers: {'Content-Type': 'application/json'},
      });
    }

    _sendGet() {
      const url = new URL(this.url, window.location.href);
      for (const key in this.parameters) {
        if (this.parameters[key] == null) { continue; }
        const value = this.parameters[key].toString();
        if (value.length === 0) { continue; }
        url.searchParams.set(key, value);
      }

      return fetch(url.toString(), {
        method: 'GET',
      });
    }

    getData() {
      return this.parameters;
    }

    setData(data) {
      this.parameters = data;
    }

    async send() {
      let fetched = null;
      if (this.method === 'POST') {
        fetched = await this._sendPost();
      } else if (this.method === 'GET') {
        fetched = await this._sendGet();
      } else if (this.method === 'DELETE') {
        fetched = await this._sendDelete();
      } else {
        throw new Error('Unknown method "' + this.method + '"');
      }

      const response = new Backend._response(fetched.status, await fetched.json());
      if (response.failed()) {
        await this.triggerOnFailure(response);
      } else if (response.succeeded()) {
        await this.triggerOnSuccess(response);
      }

      return response;
    }

    async triggerOnSuccess(response) {
      if (this._onSuccessCallback != null) {
        await Promise.resolve(this._onSuccessCallback(response));
      }

      await this.triggerFinally(response);
    }

    async triggerOnFailure(response) {
      if (this._onFailureCallback != null) {
        await Promise.resolve(this._onFailureCallback(response));
      }

      await this.triggerFinally(response);
    }

    async triggerFinally(response) {
      if (this._finallyCallback != null) {
        await Promise.resolve(this._finallyCallback(response));
      }
    }
  },

  _response: class {
    _status;
    _response;

    constructor(status, response) {
      this._status = status;
      this._response = response;
    }

    status() {
      return this._status;
    }

    errors() {
      return this._response.errors ?? [];
    }

    results() {
      return this._response.results ?? [];
    }

    resultsJSON() {
      return this._response.results_json ?? {};
    }

    redirectTo() {
      return this._response.redirect_to ?? '';
    }

    failed() {
      return this.errors().length > 0;
    }

    succeeded() {
      return !this.failed();
    }
  },

  post: function(url, parameters = {}, type = Backend.JSON) {
    return new Backend._call(url, parameters, 'POST', type);
  },

  delete: function(url, parameters = {}) {
    return new Backend._call(url, parameters, 'DELETE');
  },

  get: function(url, parameters = {}) {
    return new Backend._call(url, parameters, 'GET', Backend.JSON);
  },

  onFailure: function(err) {
    Local.onError(err);
  },

  redirectTo: function(url) {
    if (url instanceof Backend._response) {
      url = url.redirectTo();
    }

    window.location.href = url;
  },
};
