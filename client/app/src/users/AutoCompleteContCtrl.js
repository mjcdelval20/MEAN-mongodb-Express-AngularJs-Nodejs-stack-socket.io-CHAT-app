(function () {
    //'use strict';
    angular
        .module('users')
        .controller('AddContactCtrl', ['userService', 'authenticService', '$scope', '$q', '$timeout', DemoCtrl]);

    function DemoCtrl (userService, authenticService, $scope, $q, $timeout, $http) {

        console.log('Controller Contact');
        var self = this;
        var pendingSearch, cancelSearch = angular.noop;
        var cachedQuery, lastSearch;
        self.allContacts = loadContacts();
        //self.contacts = [self.allContacts[0]];
        self.asyncContacts = [];
        self.filterSelected = true;
        self.querySearch = querySearch;
        self.addContact = addContact;

        /**
         * Search for contacts; use a random delay to simulate a remote call
         */

        function addContact(){


            var converUser = $scope.data.selectedUser; //contact or group currently active


            if(self.asyncContacts.length == 1 && !converUser.isgroup){

                var selectedContact = self.asyncContacts[0]; // contact selected in search box

                if (!selectedContact.isgroup) {

                    var currentUser = authenticService.getCurrentUser(); // user with session active


                    if (currentUser._id == converUser.gotrequest){

                        converUser.idi = converUser.requestby;

                    } else { converUser.idi = converUser.gotrequest }

                    if (currentUser._id == selectedContact.gotrequest){

                        selectedContact.idi = selectedContact.requestby;

                    }else { selectedContact.idi = selectedContact.gotrequest }

                    var newContact = {

                        isgroup : true,
                        //image : selectedContact.image.match(reg)[1], // apply match method of regex getting image name only
                        image : 'https://s3-us-west-1.amazonaws.com/chatcontacts/group.png',
                        name : 'Group',
                        namereq : null,
                        imagereq : null,
                        requestby : null,
                        userid : null,
                        members: currentUser.name + ', ' + converUser.name + ', ' + selectedContact.name,
                        confirmed : true,
                        ids : [currentUser._id, converUser.idi, selectedContact.idi]

                    };

                    authenticService.createConversation.post(newContact, function (res, headers) {

                        var contact = res.conv;

                        contact._lowername = contact.name.toLowerCase();

                        $scope.data.currentUser.conversations.push(contact);
                        authenticService.setCurrentUser($scope.data.currentUser);
                        self.asyncContacts = []; // clean search contacts after one is added


                    })
                }
            }
            else if(self.asyncContacts.length == 1 && converUser.isgroup){

                console.log('jellow');


            }

        }
        function querySearch (criteria) {

            var currentContacts = authenticService.getCurrentUser();
            currentContacts = currentContacts.conversations;

            cachedQuery = criteria;

            //return cachedQuery ? self.allContacts.filter(createFilterFor(cachedQuery)) : [];
            return cachedQuery ? currentContacts.filter(createFilterFor(cachedQuery)) : [];
            //return cachedQuery ? self.allContacts : [];
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

            //var contacts = $scope.data.currentUser.conversations;
            var contacts = authenticService.getCurrentUser();

            contacts = contacts.conversations;

            contacts.map(function (c, index){


                c._lowername = c.name.toLowerCase();

                return c;
            });


            return contacts;
        }
    }
})();