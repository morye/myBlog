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