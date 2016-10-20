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