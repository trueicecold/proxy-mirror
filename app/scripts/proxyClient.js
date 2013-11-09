(function(){

    var proxyClient = angular.module('proxyMirrorApp.proxyClient', []);

    var SessionStorage = function (proxy){
        var that = this,
            sessionHash = {};
        this.proxy = proxy;
        this.sessions = [];

        proxy.on('session.start', function(session){
            sessionHash[session.id] = session;
            that.sessions.push(session);
        });
    };

    var ProxyConnection = function(socket){
        Observable(this);
        var that = this;
        socket.on('connect', function(){
            that.state = 'connected';
        });

        socket.on('session.start', function(session){
            that.trigger('session.start', [session]);
        })
    };

    proxyClient.service('socket', function ($rootScope) {
        var socket = io.connect();
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
            }
        };
    });


    proxyClient.service('proxy', function(socket){
        var proxyConnection = new ProxyConnection(socket);
        return proxyConnection;
    });

    proxyClient.service('sessionStorage', function(proxy){
        var sessionStorage = new SessionStorage(proxy);

        return  sessionStorage;
    });

}());