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