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
                register : $resource('http://localhost:3000/api/signup',{}, {

                    'save': {
                        method: 'POST'
                    }

                }),

                login : $resource('http://localhost:3000/api/authenticate',{}, {

                    'try': {
                        method: 'POST'
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
                requestAllContacts : $resource('http://localhost:3000/api/getallcontacts', {},{

                    'get': {

                        method: 'GET'
                    }

                }),
                createConversation : $resource('http://localhost:3000/api/createconv', {}, {

                    'post' : {

                        method: 'POST'
                    }
                }),
                addToConv : $resource('http://localhost:3000/api/addtoconv', {}, {

                    'post' : {

                        method: 'POST'
                    }
                })

            }

        })

    })();