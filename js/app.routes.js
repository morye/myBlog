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