(function(){

    angular.module('users')
           .factory('authenticService', function($state, $resource){

            var currentUser = { name: "blablba"};
            var allcontacts = [];
            var currentforGroupContacts = [];
            var currentforGroupContactsStatic = [];

            function checkLoggedIn(){

                var token = window.localStorage.getItem("token");

                return token ? true : false;

            }

            return {
                register : $resource('./api/signup',{}, {

                    'save': {
                        method: 'POST'
                    }

                }),

                login : $resource('./api/authenticate',{}, {

                    'try': {
                        method: 'POST'
                    }

                }),
                acceptConv : $resource('./api/acceptconv',{}, {
                    'save': {
                        method: 'POST'
                    }

                }),
                sendMsg : $resource('./api/sendmessage', {}, {

                    'save': {

                        method : 'POST'
                    }
                }),

                getCurrentUser : function(){ return currentUser},
                setCurrentUser :  function(user){ currentUser = user; },

                getAllContacts : function(){ return allcontacts},
                setAllContacts :  function(contacts){


                    allcontacts = contacts;
                    },
                getcurrentforGroupContacts : function(){ return currentforGroupContacts},
                setcurrentforGroupContacts :  function(contacts){


                    currentforGroupContacts = contacts;
                },
                getcurrentforGroupContactsStatic : function(){ return currentforGroupContactsStatic},
                setcurrentforGroupContactsStatic :  function(contacts){


                    currentforGroupContactsStatic = contacts;
                },

                checkLoggedIn : checkLoggedIn,
                requestAllContacts : $resource('./api/getallcontacts/:id', {id:'@id'},{

                    'get': {

                        method: 'GET'
                    }

                }),
                createConversation : $resource('./api/createconv', {}, {

                    'post' : {

                        method: 'POST'
                    }
                }),
                addToConv : $resource('./api/addtoconv', {}, {

                    'post' : {

                        method: 'POST'
                    }
                })

            }

        })

    })();