/**
 * Created by mkim on 10/12/16.
 */
'use strict';
app.factory('userAccessService', ['$window', '$rootScope', 'appConst', '$timeout', function($window, $rootScope, appConst, $timeout) {
    var _redirectUnauthorized = function() {
        $window.location.href = '/unauthorize';
    };
    var _userInfo = {};

    var userAuthorization = {
        synchronousAuthorize: function() {
            var request = new XMLHttpRequest();
            try {
                request.open('GET', '/assets/json/currentUser.json', false);  // `false` makes the request synchronous
                request.send(null);
            }
            catch (e) {
                _redirectUnauthorized();
            }
            userInformation.clearInfo();

            if (request.status === 200) {
                var responseText = JSON.parse(request.responseText);
                userInformation.setInfo(responseText.userInfo);
                $rootScope.$broadcast(appConst.Events.AuthUser, userInformation.getInfo());
            }
            else {
                _redirectUnauthorized();
            }
        }
    };

    var userInformation = {
        setInfo: function(info) {
            if (info) {
                _userInfo = info;
                return true;
            }
            return false;
        },
        getInfo: function(){
            return _userInfo;
        },
        clearInfo: function() {
            _userInfo = {};
        }
    };

    return {
        userAuthorization: userAuthorization,
        userInformation: userInformation
    };
}]);