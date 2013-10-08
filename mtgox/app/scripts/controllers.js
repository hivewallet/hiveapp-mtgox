var mtgoxApp = angular.module('hive-mtgox', ['Mtgox']);

mtgoxApp.directive( [ 'focus', 'blur', 'keyup', 'keydown', 'keypress', 'scroll' ].reduce( function ( container, name ) {
    var directiveName = 'ng' + name[ 0 ].toUpperCase( ) + name.substr( 1 );
    container[ directiveName ] = [ '$parse', function ( $parse ) {
        return function ( scope, element, attr ) {
            var fn = $parse( attr[ directiveName ] );
            element.bind( name, function ( event ) {
                scope.$apply( function ( ) {
                    fn( scope, {
                        $event : event
                    } );
                } );
            } );
        };
    } ];
    return container;
}, { } ) );

mtgoxApp.controller('MainCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
  // ---------------------
  $scope.credentials = {};
  $scope.user_balance = {};
  $scope.logOut = function() {
    $scope.credentials.login = "";
    $scope.credentials.password = "";
    $scope.popView();
    $rootScope.menuHidden = true;
  }
  $rootScope.api_key = $scope.api_key = '25b7fac9-b044-47ca-a8d7-5947ee6fd69d';
  $rootScope.secret = $scope.secret = '7b4EsNdChKP0fSBbQz24xgYxk0nHity5bhvgNbHfLItEIwhdw8qvtKJOSIABG4fB8qUi1WV2PdOcddMmPPMnlA==';
  $rootScope.menuHidden = true;
  $scope.showMenu = function() {
    return $rootScope.menuHidden;
  }
  // ---------------------
  $scope.lockView = false;
  $scope.views = [{
    partial: 'views/login.html',
    position: 'center'
  }];
  $scope.menuPartial = null;
  $scope.menuSelection = null;
  $scope.updatePositions = function(offset) {
    if ( offset == undefined )  offset = 0;
    var n = $scope.views.length-1+offset;
    var i;
    for( i in $scope.views ) {
      var view = $scope.views[i];
      view.position = i < n ? 'left' : i > n ? 'right' : 'center';
    }
  };
  $scope.pushView = function(viewName) {
    if ($scope.lockView)  return;
    $scope.lockView = true;
    $scope.views.push({
      partial: 'views/' + viewName + '.html',
      position: 'right'
    });
  };
  $scope.$on("pushView", function(name, partial) {
    $scope.pushView(partial);
  });
  $scope.popView = function() {
    if ($scope.lockView)  return;
    $scope.lockView = true;
    
    if ( $scope.views.length - 2 >= 0 ) {
      var view = $scope.views[$scope.views.length-2];
      view.position = 'left';
    }
    setTimeout(function(){
      $scope.updatePositions(-1);
      $scope.$apply();
    }, 50);
    setTimeout(function(){
      $scope.lockView = false;
      $scope.views.pop();
      $scope.$apply();
    }, 600);
  };
  $scope.$on("popView", function() {
    $scope.popView();
  });
  $scope.partialLoaded = function() {
    setTimeout(function(){
      $scope.$apply(function(){
        $scope.updatePositions();
      });
    }, 50);
    setTimeout(function(){
      $scope.$apply(function(){
        $scope.lockView = false;
        if ( $scope.views.length - 2 >= 0 ) {
          var view = $scope.views[$scope.views.length-2];
          view.position = 'left hidden';
        }
      });
    }, 1000);
  };
  $scope.$on("loadView", function(name, partial, menu, position) {
    if ( typeof menu != 'undefined' )
      $scope.menuPartial = 'views/' + menu + '.html';
    $scope.views = [{ partial: 'views/' + partial + '.html', position: position ? position : 'top'}];
    $scope.menuSelection = partial;
    isDown = false;
  });
  $scope.$on("loadMenu", function(name, partial) {
    $scope.menuPartial = 'views/' + partial + '.html';
  });
  $scope.loaderText = 'Loading...';
  $scope.$on("showLoader", function(name, text) {
    $scope.loaderText = text ? text : 'Loading...';
    $('body .loader').css({display: 'block'}).animate({opacity: 1}, 300);
    //$scope.$apply();
  });
  $scope.hideLoader = function() {
    $('body .loader').animate({opacity: 0}, function(){
      $('body .loader').css('display', 'none');
    });
  };
  $scope.$on("hideLoader", function() {
    $scope.hideLoader();
  });
  $(function(){
    var isDown = false;
    $('[data-push-view], [data-pop-view], [data-load-view], .back')
      .on('#main', 'touchstart mousedown', function(e){ 
        isDown = true;
      })
      .on('#main', 'touchmove mousemove', function(e){ 
        isDown = false;
      });
    $('[data-push-view]').on('#main', 'touchend mouseup', function(e){ 
      if (isDown) {
        $scope.pushView( $(this).data('pushView') );
        $scope.$apply();
        isDown = false;
        e.preventDefault();
      }
    });
    $('[data-pop-view], .back').on('#main', 'touchend mouseup', function(e){  
      if (isDown) {
        $scope.popView();
        $scope.$apply();
        isDown = false;
        e.preventDefault();
      }
    });
    $('[data-load-view]').on('#main', 'touchend mouseup', function(e){ 
      var partial = $(this).data('loadView');
      if (isDown && partial != $scope.menuSelection) {
        $scope.$apply(function(){
        $scope.views = [{ partial: 'views/' + partial + '.html', position: 'top'}];
        $scope.menuSelection = partial;
        });
        isDown = false;
      }
    });
    var hash = window.location.hash.replace('#/', '');
    if (hash.length) {
      $scope.pushView( hash );
      $scope.$apply();
    }
  });
}]);
  /*
  $scope.screens = [];
  $scope.getScreenClass = function(screen) {
    if ( !$scope.screens || $scope.screens.lenght ) return 'right';
    if ( $scope.screens[$scope.screens.length-1] == screen )
      return 'center';
    if ( $scope.screens.indexOf(screen) >= 0 )
      return 'left';
    return 'right';
  }
  $scope.pushView = function(screen) {
    $scope.screens.push(screen);
  }
  $scope.popView = function() {
    $scope.screens.pop();
  }
  $scope.$on('pushView', function(e, view){
    $scope.pushView(view);
  });
  */

mtgoxApp.controller('LoginCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
  $scope.logger = {};
  $scope.submitClick = function(event) {
    $scope.$emit('showLoader', 'Logging In...');
    /*
    var lgn = Mtgox.login($scope.credentials.login, $scope.credentials.password);
    if ( lgn.success ) {
      $rootScope.credentials = $scope.credentials;
      $rootScope.user_balance = lgn.results;
      $scope.pushView('home');
    } else {
      $scope.logger.color = "red";
      $scope.logger.msg = lgn.results;
    }
    */
    $scope.pushView('home');
    $scope.$emit('hideLoader');
  }
}]);

mtgoxApp.controller('HomeCtrl', ['$scope', '$http', '$rootScope', 'MtgoxApi', function($scope, $http, $rootScope, MtgoxApi) {
  $scope.getWalletInfo = function() {
    console.log('getWalletInfo');
    var rslt = MtgoxApi.getMoneyInfo($rootScope.api_key, $rootScope.secret);

    if ( rslt.success ) {
      console.log(rslt.results);
    } else {
      console.log('error');
      console.log(rslt.results);
      //$scope.logger.type = "wrong";
      //$scope.logger.msg = rslt.results;
      //$('.screen').animate({scrollTop : 0},500);
    }
    $scope.$emit('hideLoader');
  }
  $scope.initHome = function() {
    $rootScope.menuHidden = false;
    // $scope.getWalletInfo();
    // @up getWalletInfo() doesn't work. Mocked data below:
    $scope.wallets = {
      "BTC": {
          "Balance": 0,
          "Daily_Withdraw_Limit": 0,
          "Max_Withdraw": 0,
          "Monthly_Withdraw_Limit": 0,
          "Open_Orders": 0,
          "Operations": 1
      },
      "USD": {
          "Balance": 1,
          "Daily_Withdraw_Limit": 2,
          "Max_Withdraw": 3,
          "Monthly_Withdraw_Limit": 4,
          "Open_Orders": 5,
          "Operations": 6
      },
      "JPY": {
          "Balance": 2,
          "Daily_Withdraw_Limit": 3,
          "Max_Withdraw": 4,
          "Monthly_Withdraw_Limit": 5,
          "Open_Orders": 6,
          "Operations": 7
      },
      "EUR": {
          "Balance": 3,
          "Daily_Withdraw_Limit": 4,
          "Max_Withdraw": 5,
          "Monthly_Withdraw_Limit": 6,
          "Open_Orders": 7,
          "Operations": 8
      }
    }
    $scope.active_wallet = Object.keys($scope.wallets)[0];
    $scope.openSelection = false;
  }
  $scope.walletClass = function(currency) {
    if(currency == $scope.active_wallet)
      return 'active-wallet';
  }
  $scope.selectWallet = function(currency) {
    if(currency == $scope.active_wallet)
      $scope.openWalletSelection(true);
    $scope.active_wallet = currency;
  }
  $scope.openWalletSelection = function(open) {
    if(open)
      $scope.openSelection = true;
    else
      $scope.openSelection = false;
  }
}]);

mtgoxApp.controller('SellBuyCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
  $scope.initSellBuy = function() {
    $scope.active_tab = 'buy';
    $scope.buyBTC = {};
    $scope.sellBTC = {};
    $scope.buyBTC.usd = 98.16;
    $scope.buyBTC.btc = 0;
    $scope.sellBTC.usd = 97.86;
    $scope.sellBTC.btc = 0;
  }
  $scope.buyBTCResult = function() {
    return ($scope.buyBTC.btc * $scope.buyBTC.usd).toFixed(2);
  }
  $scope.sellBTCResult = function() {
    return ($scope.sellBTC.btc * $scope.sellBTC.usd).toFixed(2);
  }
}]);
mtgoxApp.controller('DepositCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
  $scope.initDeposit = function() {
  }
}]);
mtgoxApp.controller('WithdrawalCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
  $scope.initWithdrawal = function() {
  }
}]);
