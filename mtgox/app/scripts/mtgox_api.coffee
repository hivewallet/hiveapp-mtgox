class Mtgox

  API = 'https://data.mtgox.com/api/1/'
  
  apiUrl =
    getMoneyInfo:                     "generic/private/orders"
    
  @hmac_512 = (message, secret) ->
    shaObj = new jsSHA(message, "TEXT");
    hmac = shaObj.getHMAC(secret, "B64", "SHA-512", "B64");
    return hmac

  @login = (user, password) ->
    success = false
    results = ""
    $.ajax(
      type: "POST"
      async: false
      url: apiUrl.getBalance
      data:
        user: (user or "")
        password: (password or "")
    ).done((response) ->
      if response["error"]
        results = "wrong user or password"
      else
        success = true
        results = response
    ).fail (response) ->
      results = response

    success: success
    results: results
    
  @getMoneyInfo = (apiKey, secret) ->
    
    # Doesn't work yet. 
    nonce = ((new Date()).getTime()*1000).toString()
    console.log(secret)
    RestSign = @hmac_512(apiUrl.getMoneyInfo + "\0" + "nonce=" + nonce, secret)
    console.log(RestSign)
    RestSign = btoa(RestSign)
    
    success = false
    results = ""
    $.ajax(
      type: "POST"
      dataType: "json"
      beforeSend: (xhr) ->
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.setRequestHeader('Rest-Key', apiKey)
        xhr.setRequestHeader('Rest-Sign', RestSign)
        xhr.setRequestHeader('User-Agent', 'Mozilla/4.0 (compatible; MtGox node.js client)')
      async: false
      data:
        nonce: nonce
      
      url: API + apiUrl.getMoneyInfo
      #headers: 
      #  'Rest-Key': apiKey
      #  'Rest-Sign': RestSign
    ).done((response) ->
      console.log(response)
      if response["error"]
        results = "wrong user or password"
      else
        success = true
        results = response
    ).fail (response) ->
      results = response

    success: success
    results: results

this.angular.module('Mtgox', [])
this.angular.module('Mtgox').factory 'MtgoxApi', -> Mtgox