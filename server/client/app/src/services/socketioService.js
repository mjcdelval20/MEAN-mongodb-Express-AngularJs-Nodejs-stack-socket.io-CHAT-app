
    angular.module('users')
        .factory('socketio', function ($rootScope, $location) {
        //var socket = io.connect('http://localhost:8080');

            var socket;
            //= io('http://localhost:8080', {
            //    // Send auth token on connection, you will need to DI the Auth service above
            //    // 'query': 'token=' + Auth.getToken(),
            //    'force new connection': true
            //    //path: '/socket.io-client'
            //
            //});
            console.log($location);
            function initSocket(){

                console.log('initsocket executed');
                socket = io.connect('', {
                    // Send auth token on connection, you will need to DI the Auth service above
                    // 'query': 'token=' + Auth.getToken(),

                    'force new connection': true
                    //path: '/socket.io-client'

                });

            }

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            },
            initsocket : initSocket
        };
    });
