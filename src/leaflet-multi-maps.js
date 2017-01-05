/****************************************************************************
    leaflet-multi-maps.js, 

    (c) 2016, FCOO

    https://github.com/FCOO/leaflet-multi-maps
    https://github.com/FCOO

****************************************************************************/
(function ($, L/*, window, document, undefined*/) {
    "use strict";
/*
There are 11 differents setups
NAME  col#1  col#2  col#3  col#4  col#5
----- ------ ------ ------ ------ ------ 
1            show   
1-1          show   show
1-1-1        show   show   show
2-1   show 2 show
3-1   show 3 show
2-2   show 2                      show 
2-1-1 show 2 show   show
2-1-2 show 2 show                 show

1-2   = 2-1 + multi-map-reverse
1-3   = 3-1 + multi-map-reverse
1-1-2 = 2-1-1 + multi-map-reverse

*/
    var multiMapsSetups = {
        //id       maps      className                                       mapClassNamePostfix = [] postfix of className of element where to append the map
        '1'    : { maps: 1,  className: 'multi-map-1',                       mapClassNamePostfix: ['2'                              ] },
        '1-1'  : { maps: 2,  className: 'multi-map-1-1',                     mapClassNamePostfix: ['2',   '3'                       ] },
        '1-1-1': { maps: 3,  className: 'multi-map-1-1-1',                   mapClassNamePostfix: ['3',   '2',   '4'                ] },
        '2-1'  : { maps: 3,  className: 'multi-map-2-1',                     mapClassNamePostfix: ['2',   '1-1', '1-2'              ] },
        '1-2'  : { maps: 3,  className: 'multi-map-2-1 multi-map-reverse',   mapClassNamePostfix: ['2',   '1-1', '1-2'              ] },
        '2-2'  : { maps: 4,  className: 'multi-map-2-2',                     mapClassNamePostfix: ['1-1', '1-2', '5-1', '5-2'       ] },
        '3-1'  : { maps: 4,  className: 'multi-map-3-1',                     mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3'       ] },
        '1-3'  : { maps: 4,  className: 'multi-map-3-1 multi-map-reverse',   mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3'       ] },
        '2-1-1': { maps: 4,  className: 'multi-map-2-1-1',                   mapClassNamePostfix: ['2',   '3',   '1-1', '1-2'       ] },
        '1-1-2': { maps: 4,  className: 'multi-map-2-1-1 multi-map-reverse', mapClassNamePostfix: ['2',   '3',   '1-1', '1-2'       ] },
        '2-1-2': { maps: 5,  className: 'multi-map-2-1-2',                   mapClassNamePostfix: ['2',   '1-1', '1-2', '5-1', '5-2'] }
    };

    var multiMapsSetupList = [];
    $.each( multiMapsSetups, function( id, setup ){
        multiMapsSetupList.push( $.extend( {id: id}, setup ) );
    });



    //Extend base leaflet class
    L.MultiMaps = L.Class.extend({
        setups   : multiMapsSetups,
        setupList: multiMapsSetupList,
        mapList  : [],
        setup    : null,
    
        //Default options
        options: {
            VERSION: "{VERSION}",
            id     : multiMapsSetupList[0].id
        },

        //initialize
        initialize: function( container, options ) {
            L.setOptions(this, options);

            this.$container = container instanceof $ ? container : $(container);

            /*
            Build the element inside $container to hold the different maps

            <div class="multi-map-sub-container multi-map-1">
                <div class="multi-map-container multi-map-1-1"></div>
                <div class="multi-map-container multi-map-1-2"></div>
                <div class="multi-map-container multi-map-1-3"></div>
            </div>    
            <div class="multi-map-container multi-map-2"></div>
            <div class="multi-map-container multi-map-3"></div>
            <div class="multi-map-container multi-map-4"></div>
            <div class="multi-map-sub-container multi-map-5">
                <div class="multi-map-container multi-map-5-1"></div>
                <div class="multi-map-container multi-map-5-2"></div>
            </div>    
            */
            this.$container.addClass('multi-map-outer-container');

            var $col = $('<div class="multi-map-sub-container multi-map-1"></div>');
            $col
                .append( $('<div class="multi-map-container multi-map-1-1"></div>') )
                .append( $('<div class="multi-map-container multi-map-1-2"></div>') )
                .append( $('<div class="multi-map-container multi-map-1-3"></div>') );

            this.$container
                .append( $col)
                .append( $('<div class="multi-map-container multi-map-2"></div>') )
                .append( $('<div class="multi-map-container multi-map-3"></div>') )
                .append( $('<div class="multi-map-container multi-map-4"></div>') );

            $col = $('<div class="multi-map-sub-container multi-map-5"></div>');
            $col
                .append( $('<div class="multi-map-container multi-map-5-1"></div>') )
                .append( $('<div class="multi-map-container multi-map-5-2"></div>') );

            this.$container.append( $col);

            this.set( this.options.id );            
        },


        addMap: function ( options ){
            var $container = $('<div></div>'),
                map = L.map( $container[0], options );
            this.mapList.push( map );

            return map;
        },

        removeMap: function (map){
            for (var i=0; i<this.mapList.length; i++ )
                if (this.mapList[i] === map){
                    map.remove();
                    this.mapList.splice(i, 1);
                    this.set( this.options.id );
                }
        },

        //set
        set: function ( id ) {
            var map, 
                $map_container,
                $map_container_container;

            if (!this.setups[id])
                return;

            var $html = $('html');
            //Reset from previous setup
            if (this.setup)
                $html.removeClass( this.setup.className );
            
            this.options.id = id;
            this.setup = this.setups[id];

            $html.addClass( this.setup.className );

            for (var i=0; i<this.mapList.length; i++ ){
                map = this.mapList[i];
                $map_container = $(map._container);
    
                //Remove the map from its current container
                if ($map_container.parent().length )
                    $map_container.detach();

                if (this.setup.mapClassNamePostfix.length > i){
                    $map_container_container = $('.multi-map-'+this.setup.mapClassNamePostfix[i]);
                    $map_container_container.append ( $map_container );
                    map._onResize();
                }
            }
        }

    });

    L.multiMaps = function ( options ) {
        return new L.MultiMaps( options );
    };

}(jQuery, L, this, document));



