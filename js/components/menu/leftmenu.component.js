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
