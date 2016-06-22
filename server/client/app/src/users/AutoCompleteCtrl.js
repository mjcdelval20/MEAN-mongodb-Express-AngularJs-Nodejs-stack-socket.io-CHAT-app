(function () {
    //'use strict';
    angular
        .module('users')
        .controller('ContactChipDemoCtrl', ['userService', 'socketio', 'authenticService', '$scope', '$q', '$timeout', DemoCtrl]);

    function DemoCtrl (userService, socketio, authenticService, $scope, $q, $timeout, $http) {

        console.log('Im executing AutoCompleteCtrl');
        var self = this;
        var pendingSearch, cancelSearch = angular.noop;
        var cachedQuery, lastSearch;
        self.allContacts = [];
        //self.contacts = [self.allContacts[0]];
        self.asyncContacts = [];
        self.filterSelected = true;
        self.querySearch = querySearch;
        self.delayedQuerySearch = delayedQuerySearch;
        self.addContact = addContact;
        self.destroySocket = destroySocket;

        /**
         * Search for contacts; use a random delay to simulate a remote call
         **/

        socketio.initsocket();

        function destroySocket(){

            console.log('destroysocket');
            socketio.emit('forceDisconnect');
        }

        socketio.on('conversationCreated', function(convObj){

            var currentUser = authenticService.getCurrentUser();

            currentUser.conversations.push(convObj);

        });

        function addContact(){

            if(self.asyncContacts.length == 1){

                var reg = /\/([A-Z0-9_-]{1,}\.(?:png|jpg|gif|jpeg))/i;
                var currentUser = authenticService.getCurrentUser();
                var selectedContact = self.asyncContacts[0];

                var newContact = {
                    isgroup : false,
                    //image : selectedContact.image.match(reg)[1], // apply match method of regex getting image name only
                    image : selectedContact.image,
                    name : selectedContact.name,
                    namereq : currentUser.name,
                    imagereq : currentUser.image,
                    requestby : currentUser._id,
                    gotrequest : selectedContact._id,
                    userid : currentUser._id,
                    confirmed : false,
                    ids : [selectedContact._id, currentUser._id]

                };


                authenticService.createConversation.post(newContact, function(res, headers){

                    var contact = res.conv;

                    contact._lowername = contact.name.toLowerCase();

                    $scope.data.currentUser.conversations.push(contact);
                    authenticService.setCurrentUser($scope.data.currentUser);
                    authenticService.getcurrentforGroupContacts().push(contact);

                    var infoConv = {

                        ids : [selectedContact._id, currentUser._id],
                        convObj : contact,
                        convId : contact._id
                    };
                    socketio.emit("newConvCreated", infoConv);

                    self.asyncContacts = [];// clean search contacts after one is added

                })
            }
        }

        function querySearch (criteria) {

            cachedQuery = cachedQuery || criteria;


            return cachedQuery ? self.allContacts.filter(createFilterFor(cachedQuery)) : [];
            //return cachedQuery ? self.allContacts : [];
        }

        /**
         * Async search for contacts
         * Also debounce the queries; since the md-contact-chips does not support this
         */

        function delayedQuerySearch(criteria) {
            cachedQuery = criteria;
            if ( !pendingSearch || !debounceSearch() )  {
                cancelSearch();
                return pendingSearch = $q(function(resolve, reject) {
                    // Simulate async search... (after debouncing)
                    cancelSearch = reject;
                    $timeout(function() {
                        resolve( self.querySearch());
                        refreshDebounce();
                    }, Math.random() * 500, true)
                });
            }
            return pendingSearch;
        }

        function refreshDebounce() {
            lastSearch = 0;
            pendingSearch = null;
            cancelSearch = angular.noop;
        }

        /**
         * Debounce if querying faster than 300ms
         */

        function debounceSearch() {

            var now = new Date().getMilliseconds();
            lastSearch = lastSearch || now;
            return ((now - lastSearch) < 300);

        }

        /**
         * Create filter function for a query string
         */

        function createFilterFor(query) {

            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(contact) {
                return (contact._lowername.indexOf(lowercaseQuery) != -1);
                //return true;
            };
        }


        function loadContacts(){

            var user = $scope.data.currentUser;

            authenticService.requestAllContacts.get({ id: user._id}).$promise.then(function(res){

                authenticService.setAllContacts(res.users);
                var contacts = authenticService.getAllContacts();

                //console.log(contacts);
                contacts.map(function (c, index){

                    c._lowername = c.name.toLowerCase();


                    return c;

                });

                self.allContacts = contacts;
                return contacts;

            });


        }

        loadContacts();
    }
})();