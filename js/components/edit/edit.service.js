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