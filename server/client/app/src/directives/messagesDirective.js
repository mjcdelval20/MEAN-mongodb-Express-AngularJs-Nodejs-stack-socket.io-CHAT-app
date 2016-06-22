
(function() {
    angular.module('starterApp')

        .directive('messageDirective', function () {

            return {

                link: function (scope, element, attrs) {

                        console.log(element);
                }

            }

        });
})();