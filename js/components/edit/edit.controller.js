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