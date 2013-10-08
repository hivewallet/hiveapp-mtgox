(function() {
  var Mtgox;

  Mtgox = (function() {
    var API, apiUrl;

    function Mtgox() {}

    API = 'https://data.mtgox.com/api/1/';

    apiUrl = {
      getMoneyInfo: "generic/private/orders"
    };

    Mtgox.hmac_512 = function(message, secret) {
      var hmac, shaObj;
      shaObj = new jsSHA(message, "TEXT");
      hmac = shaObj.getHMAC(secret, "B64", "SHA-512", "B64");
      return hmac;
    };

    Mtgox.login = function(user, password) {
      var results, success;
      success = false;
      results = "";
      $.ajax({
        type: "POST",
        async: false,
        url: apiUrl.getBalance,
        data: {
          user: user || "",
          password: password || ""
        }
      }).done(function(response) {
        if (response["error"]) {
          return results = "wrong user or password";
        } else {
          success = true;
          return results = response;
        }
      }).fail(function(response) {
        return results = response;
      });
      return {
        success: success,
        results: results
      };
    };

    Mtgox.getMoneyInfo = function(apiKey, secret) {
      var RestSign, nonce, results, success;
      nonce = ((new Date()).getTime() * 1000).toString();
      console.log(secret);
      RestSign = this.hmac_512(apiUrl.getMoneyInfo + "\0" + "nonce=" + nonce, secret);
      console.log(RestSign);
      RestSign = btoa(RestSign);
      success = false;
      results = "";
      $.ajax({
        type: "POST",
        dataType: "json",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('Rest-Key', apiKey);
          xhr.setRequestHeader('Rest-Sign', RestSign);
          return xhr.setRequestHeader('User-Agent', 'Mozilla/4.0 (compatible; MtGox node.js client)');
        },
        async: false,
        data: {
          nonce: nonce
        },
        url: API + apiUrl.getMoneyInfo
      }).done(function(response) {
        console.log(response);
        if (response["error"]) {
          return results = "wrong user or password";
        } else {
          success = true;
          return results = response;
        }
      }).fail(function(response) {
        return results = response;
      });
      return {
        success: success,
        results: results
      };
    };

    return Mtgox;

  })();

  this.angular.module('Mtgox', []);

  this.angular.module('Mtgox').factory('MtgoxApi', function() {
    return Mtgox;
  });

}).call(this);
