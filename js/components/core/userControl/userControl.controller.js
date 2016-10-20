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