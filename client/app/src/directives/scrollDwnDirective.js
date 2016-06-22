(function(){

    angular.module('users')
        .directive('scrollBottom', ['$timeout', function($timeout){

          return {
           scope : { scrollBottom : "="},
           link: function($scope, $element){

                $scope.$watchCollection('scrollBottom', function(newValue){

                    if(newValue){

                        $timeout(function(){  // Timeout to make sure the digest cicle is finished

                                $element[0].scrollTop = $element[0].scrollHeight;
                        }, 0);

                    }
                });
           }
          }

        }]);
})();