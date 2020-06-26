/****************************************************************************
    leaflet-multi-maps.js,

    (c) 2016, FCOO

    https://github.com/FCOO/leaflet-multi-maps
    https://github.com/FCOO

****************************************************************************/
(function ($, L/*, window, document, undefined*/) {
    "use strict";
/*
In landscape mode it is by columns. In portrait mode it is by rows.
The order of the columns is changed when class 'multi-map-reverse' is added
1. col     : 2-4 small maps
2. - 4. col: 1 map
5. col     : 2 small maps

There are 17 differents setups
NAME  col#1  col#2  col#3  col#4  col#5
----- ------ ------ ------ ------ ------
1            show
1-1          show   show
1-1-1        show   show   show
2-1   show 2 show
3-1   show 3 show
2-2   show 2                      show 2
2-1-1 show 2 show   show
2-1-2 show 2 show                 show 2
3-1-1 show 3 show   show
3-2   show 3                      show 2
4-1   show 4 show

1-2   = 2-1 + multi-map-reverse
1-3   = 3-1 + multi-map-reverse
1-1-2 = 2-1-1 + multi-map-reverse
1-1-3 = 3-1-1 + multi-map-reverse
2-3   = 3-2 + multi-map-reverse
1-4   = 4-1 + multi-map-reverse
*/
    var defaultId = '1',
        multiMapsSetups = {
        //id       maps      className                                       mapClassNamePostfix = [] postfix of className of element where to append the map
        '1'    : { maps: 1,  className: 'multi-map-1',                       mapClassNamePostfix: ['2'                              ] },

        '1-1'  : { maps: 2,  className: 'multi-map-1-1',                     mapClassNamePostfix: ['2',   '3'                       ] },

        '2-1'  : { maps: 3,  className: 'multi-map-2-1',                     mapClassNamePostfix: ['2',   '1-1', '1-2'              ] },
        '1-1-1': { maps: 3,  className: 'multi-map-1-1-1',                   mapClassNamePostfix: ['3',   '2',   '4'                ] },
        '1-2'  : { maps: 3,  className: 'multi-map-2-1 multi-map-reverse',   mapClassNamePostfix: ['2',   '1-1', '1-2'              ] },

        '3-1'  : { maps: 4,  className: 'multi-map-3-1',                     mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3'       ] },
        '2-1-1': { maps: 4,  className: 'multi-map-2-1-1',                   mapClassNamePostfix: ['2',   '3',   '1-1', '1-2'       ] },
        '2-2'  : { maps: 4,  className: 'multi-map-2-2',                     mapClassNamePostfix: ['1-1', '1-2', '5-1', '5-2'       ] },
        '1-1-2': { maps: 4,  className: 'multi-map-2-1-1 multi-map-reverse', mapClassNamePostfix: ['2',   '3',   '1-1', '1-2'       ] },
        '1-3'  : { maps: 4,  className: 'multi-map-3-1 multi-map-reverse',   mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3'       ] },

        '4-1'  : { maps: 5,  className: 'multi-map-4-1',                     mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3', '1-4'] },
        '3-1-1': { maps: 5,  className: 'multi-map-3-1-1',                   mapClassNamePostfix: ['2',   '3',   '1-1', '1-2', '1-3'] },
        '3-2'  : { maps: 5,  className: 'multi-map-3-2',                     mapClassNamePostfix: ['5-1', '5-2', '1-1', '1-2', '1-3'] },
        '2-1-2': { maps: 5,  className: 'multi-map-2-1-2',                   mapClassNamePostfix: ['2',   '1-1', '1-2', '5-1', '5-2'] },
        '2-3'  : { maps: 5,  className: 'multi-map-3-2 multi-map-reverse',   mapClassNamePostfix: ['5-1', '5-2', '1-1', '1-2', '1-3'] },
        '1-1-3': { maps: 5,  className: 'multi-map-3-1-1 multi-map-reverse', mapClassNamePostfix: ['2',   '3',   '1-1', '1-2', '1-3'] },
        '1-4'  : { maps: 5,  className: 'multi-map-4-1 multi-map-reverse',   mapClassNamePostfix: ['2',   '1-1', '1-2', '1-3', '1-4'] },
    };

    //Default update-function
    function multiMaps_update( index, map, $container ){
        if (map){
            map._multiMapsIndex = index;
            $(map.getContainer())
                .detach()
                .appendTo( $container );
            map._onResize();
        }
    }

    //Extend base leaflet class
    L.MultiMaps = L.Class.extend({
        setup: null,

        //Default options
        options: {
            VERSION: "2.0.1",
            id     : defaultId,
            border : true,
            local  : false,
            maxMaps: 5
        },

        //initialize
        initialize: function( container, options ) {
            L.setOptions(this, options);

            this.options.maxMaps = Math.min(5, this.options.maxMaps || 5);
            var _this = this;

            this.prefix = this.options.local ? 'local-' :'global-';
            this.setups = {};
            this.setupList = [];
            $.each( multiMapsSetups, function( id, setup ){
                setup = $.extend( {id: id}, setup );
                if (setup.maps <= _this.options.maxMaps){
                    _this.setups[id] = setup;
                    _this.setupList.push(setup);
                }
            });

            this.$container = container instanceof $ ? container : $(container);
            if (this.options.local){
                this.$container.addClass('multi-map-body');
                this.$container = $('<div/>').appendTo(this.$container);
            }

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

            $container.addClass('multi-map-outer-container ' + this.prefix+'multi-map-outer-container');
            if (!this.options.border)
                $container.addClass('no-border');
            var $col = $('<div class="multi-map-sub-container '+this.prefix+'multi-map-1"></div>');
            $col
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-1-1"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-1-2"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-1-3"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-1-4"></div>') );

            $container
                .append( $col)
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-2"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-3"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-4"></div>') );

            $col = $('<div class="multi-map-sub-container '+this.prefix+'multi-map-5"></div>');
            $col
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-5-1"></div>') )
                .append( $('<div class="multi-map-container '+this.prefix+'multi-map-5-2"></div>') );

            $container.append( $col);

            //this.$tempContainer = container for all maps not displayed
            this.$tempContainer =
                $('<div/>')
                    .addClass('multi-map-container-hidden')
                    .appendTo( $container );


        },


        addMap: function ( options ){
            var $div = $('<div/>').appendTo( this.$tempContainer ),
                map = L.map( $div.get(0), options );
            map.isVisibleInMultiMaps = false;
            map.fire('hideInMultiMaps');

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

            var $setupContainer  = this.options.local ? this.$container.parent() : $('body');

            //Reset from previous setup
            if (this.setup)
                $setupContainer.removeClass( this.prefix + this.setup.className );

            this.options.id = id;
            this.setup = this.setups[id];

            $setupContainer.addClass( this.prefix + this.setup.className );

            this.updateSubMaps();
        },

        //updateSubMaps
        updateSubMaps: function () {
            var _this = this;

            //Move the maps from its current container to this.$tempContainer
            $.each(this.mapList, function(index, map){
                var $map_container = $(map.getContainer());

                if ($map_container.parent().get(0) !== _this.$tempContainer.get(0))
                    $map_container
                        .detach()
                        .appendTo( _this.$tempContainer );
            });

            //Fire event "showInMultiMaps" or "hideInMultiMaps" for all maps (if any)
            var visibleMaps = this.setup.mapClassNamePostfix.length;
            $.each(this.mapList, function(index, map){
                var isVisible = (index < visibleMaps);
                if (map.isVisibleInMultiMaps != isVisible){
                    map.isVisibleInMultiMaps = isVisible;
                    map.fire(isVisible ? 'showInMultiMaps' : 'hideInMultiMaps');
                }
            });

            //Call this.update for all visible sub-maps
            $.each(this.setup.mapClassNamePostfix, function(index, mapClassNamePostfix){
                _this.update.call( _this,
                    /*index     :*/ index,
                    /*map       :*/ _this.mapList && _this.mapList[index] ? _this.mapList[index] : null,
                    /*$container:*/ _this.$container.find('.'+ _this.prefix + 'multi-map-' + mapClassNamePostfix )
                );
            });
        }

    });

    L.multiMaps = function ( container, options ) {
        return new L.MultiMaps( container, options );
    };

}(jQuery, L, this, document));