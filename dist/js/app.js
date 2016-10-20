/**
 * Created by mkim on 10/12/16.
 */

(function(Obj){
    window.App = Obj.App || {};
    window.App.Global = {
        rootPath: "./js"
    };

})(typeof window !== "undefined" ? window : this);
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

/**
 * Created by mkim on 10/12/16.
 */
'use strict';
app.config(['$routeProvider','appConst', function($routeProvider, appConst) {

    $routeProvider
        .when('/main', {
            controller:'MainController',
            templateUrl: App.Global.rootPath+'/components/main/index.html'
        })
        .when('/edit/:id', {
            controller:'EditController',
            templateUrl: App.Global.rootPath+'/components/edit/edit.html'
        })
        .when('/delete/:id', {
            controller:'deleteController',
            templateUrl: App.Global.rootPath+'/components/delete/delete.html'
        })
        .otherwise({
            redirectTo:'/main'
        });
}]);
/**
 * Created by mkim on 10/12/16.
 */

'use strict';
app.controller('loadingController', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.isLoading = false;
    $scope.isError = false;

    $scope.$watch(function() {
            return $rootScope.loading;
        }, function(newValue) {
            if (newValue == 1){
                $scope.isLoading = true;
                $scope.isError = false;
            } else if (newValue == 2) {
                $scope.isLoading = false;
                $scope.isError = true;
            } else if (newValue == 3) {
                $scope.isLoading = false;
                $scope.isError = true;
            } else {
                $scope.isLoading = false;
                $scope.isError = false;
            }
        }
    );
}]);
/**
 * Created by mkim on 10/12/16.
 */

app.directive("loading",function() {
    return {
        restrict: 'E',
        templateUrl: App.Global.rootPath+"/components/core/loading/loading.html"
    }
});

app.directive("loadPending",['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element){
            scope.$watch(function() {
                    return $rootScope.loading;
                }, function(newValue, oldValue) {
                    if (newValue == 1) {
                        element.removeClass("show").addClass("hide");
                    } else {
                        element.removeClass("hide").addClass("show");
                    }

                }
            );
        }
    }
}]);
/**
 * Created by mkim on 10/12/16.
 */

'use strict';

app.component("userControl", {
    controller: 'userControlController',
    templateUrl: App.Global.rootPath+"/components/core/userControl/userControl.html"
});
/**
 * Created by mkim on 10/12/16.
 */

'use strict';

app.controller('userControlController', ['$scope', '$window', 'userAccessService', 'appConst', function($scope, $window, userAccessService, appConst) {

    this.userInfo = userAccessService.userInformation.getInfo();

    $scope.$on(appConst.Events.AuthUser, function(evt, info){
        this.userInfo = info;
    }.bind(this));
}]);
/**
 * Created with IntelliJ IDEA.
 * User: Morye
 * Date: 10/12/16
 * Time: 7:10 PM
 * To change this template use File | Settings | File Templates.
 */

app.controller('EditController',['$scope','$q', 'editService', 'appConst', '$routeParams', function($scope, $q, editService, appConst, $routeParams){

    this.data = {};

    $q.when(editService.fetch($routeParams.id)).then(function(response){
        this.data = response.data;
    }.bind(this));

}]);
/**
 * Created with IntelliJ IDEA.
 * User: Morye
 * Date: 10/12/16
 * Time: 7:13 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';
app.factory('editService', ['$http', '$q', '$rootScope', 'appConst', function($http, $q, $rootScope, appConst) {

    var request = {
        method: 'GET',
        url:appConst.api.prod
    };
    return {
        fetch: function(id) {

            var deferred = $q.defer();
            request.url += id;
            $http(request).then(function(response){
                deferred.resolve(response);
            }, function(response){
                deferred.reject();
                $rootScope.loading = 0;
            });

            return deferred.promise;
        }
    }

}]);
/**
 * Created by mkim on 10/12/16.
 */

app.controller('MainController',['$scope','$q', 'postService',
    function($scope, $q, postService){

        this.data = {};

        $q.when(postService.fetch()).then(function(response){
            this.data = response.data;
        }.bind(this));

    }]);
/**
 * Created with IntelliJ IDEA.
 * User: Morye
 * Date: 10/12/16
 * Time: 6:14 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';
app.factory('postService', ['$http', '$q', '$rootScope', 'appConst', function($http, $q, $rootScope, appConst) {

    var request = {
        method: 'GET',
        url:appConst.api.prod
    };
    return {
        fetch: function(options) {

            var deferred = $q.defer();

            $http(request).then(function(response){
                deferred.resolve(response);
            }, function(response){
                deferred.reject();
                $rootScope.loading = 0;
            });

            return deferred.promise;
        }
    }

}]);
/**
 * Created by mkim on 10/12/16.
 */

app.directive('leftMenu', ['$location', '$route', function ($location, $route) {
    return {
        restrict: 'E',
        templateUrl: App.Global.rootPath+'/components/menu/leftMenu.html',
        link: function(scope, element, attrs) {

            scope.menuList = [
                {
                    url: "#/main",
                    label: "Posts"
                },
                {
                    url: "#/past/1",
                    label: "Past Posts"
                }
            ];

            scope.isActive = function (selected) {
                return (selected === '#'+$location.path());
            };
        }
    };
}]);

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
/**
 * Created by mkim on 10/12/16.
 */
'use strict';
app.factory('utilityService', ['appConst', function(appConst) {

    // utilityService contains utility functions for dashboardApp
    var _Array = {
        // check if item exists in array and return boolean value
        inArray: function (item, array) {
            return (-1 !== array.indexOf(item));
        },
        sum: function(obj) {
            var sum = 0;
            for (var prop in obj) {
                sum = (typeof obj[prop] === 'number' && prop != 'id') ? sum + obj[prop] : sum;
            }
            return sum;
        },
        // sorts the object array by comparing string value at 'prop'
        sort: function(options) {
            if (!Array.isArray(options.array) || !options.array.length) return options.array;
            var _orderBy = (options.orderBy == "asc" || options.orderBy == "des") ? options.orderBy : "asc";
            if (typeof options.array[0] === 'object' && options.prop in options.array[0]) {
                options.array.sort(function(a, b){
                    return (_orderBy == "asc") ? ((a[options.prop] < b[options.prop]) ? 1 : (a[options.prop] > b[options.prop]) ? -1 : 0) :
                        ((a[options.prop] > b[options.prop]) ? 1 : (a[options.prop] < b[options.prop]) ? -1 : 0);
                });
            }
        },
        // check if prop exists in object array
        hasPropInArray: function (array, prop) {
            for (var i=0; i<array.length; i++){
                for(var p in array[i]) {
                    if (array[i][p] == prop) return true;
                }
            }
            return false;
        }
    };

    var _Number = {
        getLength: function(number) {
            return number.toString().length;
        }
    };

    var _String = {
        toCamel: function(value) {
            if (!value) return "";
            if (value.length == 1) return value[0].toUpperCase();
            return value[0].toUpperCase() + value.slice(1).toLowerCase();
        }
    };

    return {
        Array: _Array,
        Number: _Number,
        String: _String
    };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdsb2JhbC5qcyIsImFwcC5tb2R1bGUuanMiLCJhcHAucm91dGVzLmpzIiwiY29yZS9sb2FkaW5nL2xvYWRpbmcuY29udHJvbGxlci5qcyIsImNvcmUvbG9hZGluZy9sb2FkaW5nLmRpcmVjdGl2ZS5qcyIsImNvcmUvdXNlckNvbnRyb2wvdXNlckNvbnRyb2wuY29tcG9uZW50LmpzIiwiY29yZS91c2VyQ29udHJvbC91c2VyQ29udHJvbC5jb250cm9sbGVyLmpzIiwiZWRpdC9lZGl0LmNvbnRyb2xsZXIuanMiLCJlZGl0L2VkaXQuc2VydmljZS5qcyIsIm1haW4vbWFpbi5jb250cm9sbGVyLmpzIiwibWFpbi9tYWluLnNlcnZpY2UuanMiLCJtZW51L2xlZnRtZW51LmNvbXBvbmVudC5qcyIsInJlbmFtZS5qcyIsInVzZXJBY2Nlc3Muc2VydmljZS5qcyIsInV0aWxpdHkuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1raW0gb24gMTAvMTIvMTYuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKE9iail7XHJcbiAgICB3aW5kb3cuQXBwID0gT2JqLkFwcCB8fCB7fTtcclxuICAgIHdpbmRvdy5BcHAuR2xvYmFsID0ge1xyXG4gICAgICAgIHJvb3RQYXRoOiBcIi4vanNcIlxyXG4gICAgfTtcclxuXHJcbn0pKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB0aGlzKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBta2ltIG9uIDEwLzEyLzE2LlxyXG4gKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZSddKTtcclxuXHJcbmFwcC5jb25zdGFudCgnYXBwQ29uc3QnLCB7XHJcbiAgICByb290UGF0aDogXCIvXCIsXHJcbiAgICBFdmVudHM6IHtcclxuICAgICAgICBBdXRoVXNlcjogXCJldmVudEF1dGhVc2VyXCIsXHJcbiAgICAgICAgRWRpdFBvc3Q6IFwiZWRpdFBvc3RcIlxyXG4gICAgfSxcclxuICAgIGFwaToge1xyXG4gICAgICAgIHByb2Q6IFwiaHR0cDovL3Jlc3RlZGJsb2cuaGVyb2t1YXBwLmNvbS9tb3J5ZS9hcGkvXCIsXHJcbiAgICAgICAgZGV2OiBcIi9hc3NldHMvanNvbi9cIlxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFwcC5ydW4oWyd1c2VyQWNjZXNzU2VydmljZScsICckaW5qZWN0b3InLCAnYXBwQ29uc3QnLCAnJHdpbmRvdycsICckcm9vdFNjb3BlJywgZnVuY3Rpb24odXNlckFjY2Vzc1NlcnZpY2UsICRpbmplY3RvciwgYXBwQ29uc3QsICR3aW5kb3csICRyb290U2NvcGUpIHtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIHVzZXJBY2Nlc3NTZXJ2aWNlLnVzZXJBdXRob3JpemF0aW9uLnN5bmNocm9ub3VzQXV0aG9yaXplKCk7XHJcbiAgICB9IGNhdGNoKGUpe1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL3Jlc2V0IGxvYWRlciB3aGVuIHJvdXRlIGNoYW5nZXMgdG8gcHJldmVudCBpdCBmcm9tIGdldHRpbmcgc3R1Y2tcclxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSAwO1xyXG4gICAgIH0pO1xyXG59XSk7XHJcblxyXG5hcHAuZmFjdG9yeSgnYXBwSW50ZXJjZXB0b3InLCBbJyRxJywnJHJvb3RTY29wZScsICckaW5qZWN0b3InLCAnYXBwQ29uc3QnLFxyXG4gICAgZnVuY3Rpb24gKCRxLCAkcm9vdFNjb3BlLCAkaW5qZWN0b3IsIGFwcENvbnN0KSB7XHJcbiAgICAgICAgdmFyICRleGNlcHRpb25IYW5kbGVyID0gJGluamVjdG9yLmdldChcIiRleGNlcHRpb25IYW5kbGVyXCIpO1xyXG5cclxuICAgICAgICB2YXIgaW50ZXJjZXB0b3IgPSB7XHJcbiAgICAgICAgICAgIC8vIHJlcXVlc3Qgc3VjY2Vzc1xyXG4gICAgICAgICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uIChjb25maWcpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRvbid0IHNob3cgbG9hZGluZyB3aGlsZSBkb3dubG9hZFxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5kYXRhICYmIGNvbmZpZy5kYXRhLmZpbGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghL1xcLihodG1sfGh0bXx0eHQpJC8udGVzdChjb25maWcudXJsKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIHJlc3BvbnNlIHN1Y2Nlc3NcclxuICAgICAgICAgICAgJ3Jlc3BvbnNlJzogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHJlc3BvbnNlLmRhdGEgJiYgYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzVGV4dCA9PT0gXCJPS1wiICYmICEvXFwuKGh0bWx8aHRtfHR4dCkkLy50ZXN0KHJlc3BvbnNlLmNvbmZpZy51cmwpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdyZXF1ZXN0RXJyb3InOiBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSAyO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSAzO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNlc3Npb24gdGltZW91dFxyXG4gICAgICAgICAgICAgICAgaWYgKHJlamVjdGlvbi5zdGF0dXMgPT09IDQwMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRleGNlcHRpb25IYW5kbGVyKHJlamVjdGlvbiwgVFZEYXNoYm9hcmQuRXJyb3IuU2Vzc2lvbl9UaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gaW50ZXJjZXB0b3I7XHJcbiAgICB9XSkuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xyXG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2FwcEludGVyY2VwdG9yJyk7XHJcbiAgICB9XSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1raW0gb24gMTAvMTIvMTYuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbmFwcC5jb25maWcoWyckcm91dGVQcm92aWRlcicsJ2FwcENvbnN0JywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsIGFwcENvbnN0KSB7XHJcblxyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL21haW4nLCB7XHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6J01haW5Db250cm9sbGVyJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IEFwcC5HbG9iYWwucm9vdFBhdGgrJy9jb21wb25lbnRzL21haW4vaW5kZXguaHRtbCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvZWRpdC86aWQnLCB7XHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6J0VkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IEFwcC5HbG9iYWwucm9vdFBhdGgrJy9jb21wb25lbnRzL2VkaXQvZWRpdC5odG1sJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9kZWxldGUvOmlkJywge1xyXG4gICAgICAgICAgICBjb250cm9sbGVyOidkZWxldGVDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IEFwcC5HbG9iYWwucm9vdFBhdGgrJy9jb21wb25lbnRzL2RlbGV0ZS9kZWxldGUuaHRtbCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5vdGhlcndpc2Uoe1xyXG4gICAgICAgICAgICByZWRpcmVjdFRvOicvbWFpbidcclxuICAgICAgICB9KTtcclxufV0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1raW0gb24gMTAvMTIvMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5hcHAuY29udHJvbGxlcignbG9hZGluZ0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlKSB7XHJcblxyXG4gICAgJHNjb3BlLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmlzRXJyb3IgPSBmYWxzZTtcclxuXHJcbiAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHJvb3RTY29wZS5sb2FkaW5nO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA9PSAxKXtcclxuICAgICAgICAgICAgICAgICRzY29wZS5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzRXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdWYWx1ZSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNFcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3VmFsdWUgPT0gMykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzRXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzRXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn1dKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBta2ltIG9uIDEwLzEyLzE2LlxyXG4gKi9cclxuXHJcbmFwcC5kaXJlY3RpdmUoXCJsb2FkaW5nXCIsZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6IEFwcC5HbG9iYWwucm9vdFBhdGgrXCIvY29tcG9uZW50cy9jb3JlL2xvYWRpbmcvbG9hZGluZy5odG1sXCJcclxuICAgIH1cclxufSk7XHJcblxyXG5hcHAuZGlyZWN0aXZlKFwibG9hZFBlbmRpbmdcIixbJyRyb290U2NvcGUnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpe1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRyb290U2NvcGUubG9hZGluZztcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJzaG93XCIpLmFkZENsYXNzKFwiaGlkZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5hZGRDbGFzcyhcInNob3dcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1dKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBta2ltIG9uIDEwLzEyLzE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmFwcC5jb21wb25lbnQoXCJ1c2VyQ29udHJvbFwiLCB7XHJcbiAgICBjb250cm9sbGVyOiAndXNlckNvbnRyb2xDb250cm9sbGVyJyxcclxuICAgIHRlbXBsYXRlVXJsOiBBcHAuR2xvYmFsLnJvb3RQYXRoK1wiL2NvbXBvbmVudHMvY29yZS91c2VyQ29udHJvbC91c2VyQ29udHJvbC5odG1sXCJcclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbWtpbSBvbiAxMC8xMi8xNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5hcHAuY29udHJvbGxlcigndXNlckNvbnRyb2xDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHdpbmRvdycsICd1c2VyQWNjZXNzU2VydmljZScsICdhcHBDb25zdCcsIGZ1bmN0aW9uKCRzY29wZSwgJHdpbmRvdywgdXNlckFjY2Vzc1NlcnZpY2UsIGFwcENvbnN0KSB7XHJcblxyXG4gICAgdGhpcy51c2VySW5mbyA9IHVzZXJBY2Nlc3NTZXJ2aWNlLnVzZXJJbmZvcm1hdGlvbi5nZXRJbmZvKCk7XHJcblxyXG4gICAgJHNjb3BlLiRvbihhcHBDb25zdC5FdmVudHMuQXV0aFVzZXIsIGZ1bmN0aW9uKGV2dCwgaW5mbyl7XHJcbiAgICAgICAgdGhpcy51c2VySW5mbyA9IGluZm87XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgd2l0aCBJbnRlbGxpSiBJREVBLlxyXG4gKiBVc2VyOiBNb3J5ZVxyXG4gKiBEYXRlOiAxMC8xMi8xNlxyXG4gKiBUaW1lOiA3OjEwIFBNXHJcbiAqIFRvIGNoYW5nZSB0aGlzIHRlbXBsYXRlIHVzZSBGaWxlIHwgU2V0dGluZ3MgfCBGaWxlIFRlbXBsYXRlcy5cclxuICovXHJcblxyXG5hcHAuY29udHJvbGxlcignRWRpdENvbnRyb2xsZXInLFsnJHNjb3BlJywnJHEnLCAnZWRpdFNlcnZpY2UnLCAnYXBwQ29uc3QnLCAnJHJvdXRlUGFyYW1zJywgZnVuY3Rpb24oJHNjb3BlLCAkcSwgZWRpdFNlcnZpY2UsIGFwcENvbnN0LCAkcm91dGVQYXJhbXMpe1xyXG5cclxuICAgIHRoaXMuZGF0YSA9IHt9O1xyXG5cclxuICAgICRxLndoZW4oZWRpdFNlcnZpY2UuZmV0Y2goJHJvdXRlUGFyYW1zLmlkKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG59XSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgd2l0aCBJbnRlbGxpSiBJREVBLlxyXG4gKiBVc2VyOiBNb3J5ZVxyXG4gKiBEYXRlOiAxMC8xMi8xNlxyXG4gKiBUaW1lOiA3OjEzIFBNXHJcbiAqIFRvIGNoYW5nZSB0aGlzIHRlbXBsYXRlIHVzZSBGaWxlIHwgU2V0dGluZ3MgfCBGaWxlIFRlbXBsYXRlcy5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcbmFwcC5mYWN0b3J5KCdlZGl0U2VydmljZScsIFsnJGh0dHAnLCAnJHEnLCAnJHJvb3RTY29wZScsICdhcHBDb25zdCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgJHJvb3RTY29wZSwgYXBwQ29uc3QpIHtcclxuXHJcbiAgICB2YXIgcmVxdWVzdCA9IHtcclxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgIHVybDphcHBDb25zdC5hcGkucHJvZFxyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZmV0Y2g6IGZ1bmN0aW9uKGlkKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICByZXF1ZXN0LnVybCArPSBpZDtcclxuICAgICAgICAgICAgJGh0dHAocmVxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSAwO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1dKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBta2ltIG9uIDEwLzEyLzE2LlxyXG4gKi9cclxuXHJcbmFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsWyckc2NvcGUnLCckcScsICdwb3N0U2VydmljZScsXHJcbiAgICBmdW5jdGlvbigkc2NvcGUsICRxLCBwb3N0U2VydmljZSl7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IHt9O1xyXG5cclxuICAgICAgICAkcS53aGVuKHBvc3RTZXJ2aWNlLmZldGNoKCkpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgfV0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIHdpdGggSW50ZWxsaUogSURFQS5cclxuICogVXNlcjogTW9yeWVcclxuICogRGF0ZTogMTAvMTIvMTZcclxuICogVGltZTogNjoxNCBQTVxyXG4gKiBUbyBjaGFuZ2UgdGhpcyB0ZW1wbGF0ZSB1c2UgRmlsZSB8IFNldHRpbmdzIHwgRmlsZSBUZW1wbGF0ZXMuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5hcHAuZmFjdG9yeSgncG9zdFNlcnZpY2UnLCBbJyRodHRwJywgJyRxJywgJyRyb290U2NvcGUnLCAnYXBwQ29uc3QnLCBmdW5jdGlvbigkaHR0cCwgJHEsICRyb290U2NvcGUsIGFwcENvbnN0KSB7XHJcblxyXG4gICAgdmFyIHJlcXVlc3QgPSB7XHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICB1cmw6YXBwQ29uc3QuYXBpLnByb2RcclxuICAgIH07XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGZldGNoOiBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgJGh0dHAocmVxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSAwO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1dKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBta2ltIG9uIDEwLzEyLzE2LlxyXG4gKi9cclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2xlZnRNZW51JywgWyckbG9jYXRpb24nLCAnJHJvdXRlJywgZnVuY3Rpb24gKCRsb2NhdGlvbiwgJHJvdXRlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6IEFwcC5HbG9iYWwucm9vdFBhdGgrJy9jb21wb25lbnRzL21lbnUvbGVmdE1lbnUuaHRtbCcsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcblxyXG4gICAgICAgICAgICBzY29wZS5tZW51TGlzdCA9IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiIy9tYWluXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiUG9zdHNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiIy9wYXN0LzFcIixcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJQYXN0IFBvc3RzXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24gKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNlbGVjdGVkID09PSAnIycrJGxvY2F0aW9uLnBhdGgoKSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB0bGkgb24gMi8xNS8xNi5cclxuICovXHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1raW0gb24gMTAvMTIvMTYuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbmFwcC5mYWN0b3J5KCd1c2VyQWNjZXNzU2VydmljZScsIFsnJHdpbmRvdycsICckcm9vdFNjb3BlJywgJ2FwcENvbnN0JywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHdpbmRvdywgJHJvb3RTY29wZSwgYXBwQ29uc3QsICR0aW1lb3V0KSB7XHJcbiAgICB2YXIgX3JlZGlyZWN0VW5hdXRob3JpemVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91bmF1dGhvcml6ZSc7XHJcbiAgICB9O1xyXG4gICAgdmFyIF91c2VySW5mbyA9IHt9O1xyXG5cclxuICAgIHZhciB1c2VyQXV0aG9yaXphdGlvbiA9IHtcclxuICAgICAgICBzeW5jaHJvbm91c0F1dGhvcml6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsICcvYXNzZXRzL2pzb24vY3VycmVudFVzZXIuanNvbicsIGZhbHNlKTsgIC8vIGBmYWxzZWAgbWFrZXMgdGhlIHJlcXVlc3Qgc3luY2hyb25vdXNcclxuICAgICAgICAgICAgICAgIHJlcXVlc3Quc2VuZChudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgX3JlZGlyZWN0VW5hdXRob3JpemVkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXNlckluZm9ybWF0aW9uLmNsZWFySW5mbygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZVRleHQgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIHVzZXJJbmZvcm1hdGlvbi5zZXRJbmZvKHJlc3BvbnNlVGV4dC51c2VySW5mbyk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoYXBwQ29uc3QuRXZlbnRzLkF1dGhVc2VyLCB1c2VySW5mb3JtYXRpb24uZ2V0SW5mbygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF9yZWRpcmVjdFVuYXV0aG9yaXplZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgdXNlckluZm9ybWF0aW9uID0ge1xyXG4gICAgICAgIHNldEluZm86IGZ1bmN0aW9uKGluZm8pIHtcclxuICAgICAgICAgICAgaWYgKGluZm8pIHtcclxuICAgICAgICAgICAgICAgIF91c2VySW5mbyA9IGluZm87XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRJbmZvOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gX3VzZXJJbmZvO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xlYXJJbmZvOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX3VzZXJJbmZvID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHVzZXJBdXRob3JpemF0aW9uOiB1c2VyQXV0aG9yaXphdGlvbixcclxuICAgICAgICB1c2VySW5mb3JtYXRpb246IHVzZXJJbmZvcm1hdGlvblxyXG4gICAgfTtcclxufV0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1raW0gb24gMTAvMTIvMTYuXHJcbiAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbmFwcC5mYWN0b3J5KCd1dGlsaXR5U2VydmljZScsIFsnYXBwQ29uc3QnLCBmdW5jdGlvbihhcHBDb25zdCkge1xyXG5cclxuICAgIC8vIHV0aWxpdHlTZXJ2aWNlIGNvbnRhaW5zIHV0aWxpdHkgZnVuY3Rpb25zIGZvciBkYXNoYm9hcmRBcHBcclxuICAgIHZhciBfQXJyYXkgPSB7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgaXRlbSBleGlzdHMgaW4gYXJyYXkgYW5kIHJldHVybiBib29sZWFuIHZhbHVlXHJcbiAgICAgICAgaW5BcnJheTogZnVuY3Rpb24gKGl0ZW0sIGFycmF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoLTEgIT09IGFycmF5LmluZGV4T2YoaXRlbSkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VtOiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICBzdW0gPSAodHlwZW9mIG9ialtwcm9wXSA9PT0gJ251bWJlcicgJiYgcHJvcCAhPSAnaWQnKSA/IHN1bSArIG9ialtwcm9wXSA6IHN1bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3VtO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gc29ydHMgdGhlIG9iamVjdCBhcnJheSBieSBjb21wYXJpbmcgc3RyaW5nIHZhbHVlIGF0ICdwcm9wJ1xyXG4gICAgICAgIHNvcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wdGlvbnMuYXJyYXkpIHx8ICFvcHRpb25zLmFycmF5Lmxlbmd0aCkgcmV0dXJuIG9wdGlvbnMuYXJyYXk7XHJcbiAgICAgICAgICAgIHZhciBfb3JkZXJCeSA9IChvcHRpb25zLm9yZGVyQnkgPT0gXCJhc2NcIiB8fCBvcHRpb25zLm9yZGVyQnkgPT0gXCJkZXNcIikgPyBvcHRpb25zLm9yZGVyQnkgOiBcImFzY1wiO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuYXJyYXlbMF0gPT09ICdvYmplY3QnICYmIG9wdGlvbnMucHJvcCBpbiBvcHRpb25zLmFycmF5WzBdKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfb3JkZXJCeSA9PSBcImFzY1wiKSA/ICgoYVtvcHRpb25zLnByb3BdIDwgYltvcHRpb25zLnByb3BdKSA/IDEgOiAoYVtvcHRpb25zLnByb3BdID4gYltvcHRpb25zLnByb3BdKSA/IC0xIDogMCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKGFbb3B0aW9ucy5wcm9wXSA+IGJbb3B0aW9ucy5wcm9wXSkgPyAxIDogKGFbb3B0aW9ucy5wcm9wXSA8IGJbb3B0aW9ucy5wcm9wXSkgPyAtMSA6IDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHByb3AgZXhpc3RzIGluIG9iamVjdCBhcnJheVxyXG4gICAgICAgIGhhc1Byb3BJbkFycmF5OiBmdW5jdGlvbiAoYXJyYXksIHByb3ApIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgcCBpbiBhcnJheVtpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJheVtpXVtwXSA9PSBwcm9wKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX051bWJlciA9IHtcclxuICAgICAgICBnZXRMZW5ndGg6IGZ1bmN0aW9uKG51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyLnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIF9TdHJpbmcgPSB7XHJcbiAgICAgICAgdG9DYW1lbDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT0gMSkgcmV0dXJuIHZhbHVlWzBdLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVswXS50b1VwcGVyQ2FzZSgpICsgdmFsdWUuc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgQXJyYXk6IF9BcnJheSxcclxuICAgICAgICBOdW1iZXI6IF9OdW1iZXIsXHJcbiAgICAgICAgU3RyaW5nOiBfU3RyaW5nXHJcbiAgICB9O1xyXG59XSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
