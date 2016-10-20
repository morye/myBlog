/**
 * Created by mkim on 10/12/16.
 */
'use strict';
var app = angular.module('app', ['ngRoute']);

app.constant('appConst', {
    rootPath: "/",
    Events: {
        AuthUser: "eventAuthUser",
        EditPost: "editPost"
    },
    api: {
        prod: "http://restedblog.herokuapp.com/morye/api/",
        dev: "/assets/json/"
    }
});

app.run(['userAccessService', '$injector', 'appConst', '$window', '$rootScope', function(userAccessService, $injector, appConst, $window, $rootScope) {

    try {
        userAccessService.userAuthorization.synchronousAuthorize();
    } catch(e){

    }

    //reset loader when route changes to prevent it from getting stuck
    $rootScope.$on('$locationChangeStart', function() {
         $rootScope.loading = 0;
     });
}]);

app.factory('appInterceptor', ['$q','$rootScope', '$injector', 'appConst',
    function ($q, $rootScope, $injector, appConst) {
        var $exceptionHandler = $injector.get("$exceptionHandler");

        var interceptor = {
            // request success
            'request': function (config) {
                // don't show loading while download
                if (config.data && config.data.fileType) {
                    return config;
                }
                if (!/\.(html|htm|txt)$/.test(config.url)){
                    $rootScope.loading = 1;
                }
                return config;
            },
            // response success
            'response': function (response) {
                if ((response.data && angular.isObject(response.data)) ||
                    (response.status === 200 && response.statusText === "OK" && !/\.(html|htm|txt)$/.test(response.config.url))) {
                    $rootScope.loading = 0;
                }
                return response;
            },
            'requestError': function (rejection) {
                $rootScope.loading = 2;

                return $q.reject(rejection);
            },
            'responseError': function (rejection) {
                $rootScope.loading = 3;

                // session timeout
                if (rejection.status === 401) {
                    $exceptionHandler(rejection, TVDashboard.Error.Session_Timeout);
                    return rejection;
                }
                else {
                    return $q.reject(rejection);
                }
            }
        };
        return interceptor;
    }]).config(['$httpProvider',function($httpProvider) {
        $httpProvider.interceptors.push('appInterceptor');
    }]);
