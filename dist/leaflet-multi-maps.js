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


    //Default update-function
    function multiMaps_update( index, map, $container ){
        if (map){
            $container.append( $(map.getContainer())  );
            map._onResize();
        }
    }

    //Extend base leaflet class
    L.MultiMaps = L.Class.extend({
        setups   : multiMapsSetups,
        setupList: multiMapsSetupList,
        setup    : null,

        //Default options
        options: {
            VERSION: "1.2.0",
            id     : multiMapsSetupList[0].id,
            border : true,
        },

        //initialize
        initialize: function( container, options ) {

            L.setOptions(this, options);

            this.$container = container instanceof $ ? container : $(container);
            this.mapList    = [];
            this.update     = options && options.update ? options.update : multiMaps_update;

            this.build( this.$container );
            this.set( this.options.id );
        },

        //build - build the html inside container
        build: function( container ){
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
            var $container = container instanceof $ ? container : $(container);

            $container.addClass('multi-map-outer-container');
            if (!this.options.border)
                $container.addClass('no-border');

            var $col = $('<div class="multi-map-sub-container multi-map-1"></div>');
            $col
                .append( $('<div class="multi-map-container multi-map-1-1"></div>') )
                .append( $('<div class="multi-map-container multi-map-1-2"></div>') )
                .append( $('<div class="multi-map-container multi-map-1-3"></div>') );

            $container
                .append( $col)
                .append( $('<div class="multi-map-container multi-map-2"></div>') )
                .append( $('<div class="multi-map-container multi-map-3"></div>') )
                .append( $('<div class="multi-map-container multi-map-4"></div>') );

            $col = $('<div class="multi-map-sub-container multi-map-5"></div>');
            $col
                .append( $('<div class="multi-map-container multi-map-5-1"></div>') )
                .append( $('<div class="multi-map-container multi-map-5-2"></div>') );

            $container.append( $col);

        },


        addMap: function ( options ){
            var map = L.map( $('<div/>')[0], options );
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
            if (!this.setups[id])
                return;

            var $html = $('html');
            //Reset from previous setup
            if (this.setup)
                $html.removeClass( this.setup.className );

            this.options.id = id;
            this.setup = this.setups[id];

            $html.addClass( this.setup.className );

            this.updateSubMaps();

        },

        //updateSubMaps
        updateSubMaps: function () {
            var i,
                map,
                $map_container;

            //Remove the maps (if any) from its current container
            for (i=0; i<this.mapList.length; i++ ){
                map = this.mapList[i];
                $map_container = $(map.getContainer());

                if ($map_container.parent().length )
                    $map_container.detach();
            }

            //Call this.update for all visible sub-maps
            for (i=0; i<this.setup.mapClassNamePostfix.length; i++ )
                this.update.call( this,
                    /*index     :*/ i,
                    /*map       :*/ this.mapList && (i < this.mapList.length) ? this.mapList[i] : null,
                    /*$container:*/ this.$container.find('.multi-map-'+this.setup.mapClassNamePostfix[i] )
                );
        }

    });

    L.multiMaps = function ( container, options ) {
        return new L.MultiMaps( container, options );
    };

}(jQuery, L, this, document));



