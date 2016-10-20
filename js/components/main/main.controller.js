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