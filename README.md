# leaflet-multi-maps
>


## Description
Plugin and css to allow multi Leaflet maps on same page
There are 11 different modes with 1-5 maps displayed in equal width-height-ratio

## Installation
### bower
`bower install https://github.com/FCOO/leaflet-multi-maps.git --save`

Using [modernizr-mediaquery](https://github.com/FCOO/modernizr-mediaquery) that must be included manually

## Demo
http://FCOO.github.io/leaflet-multi-maps/demo/ 

The demo also shows how to create miniature versions of the selected multi-map setup using [jquery-screen-ratio](https://github.com/FCOO/jquery-screen-ratio)

## Usage

    var myLeafletMultiMaps = L.multiMaps( "containerId" );
    var map = myLeafletMultiMaps.addMap( optionsForMap );
    //Set options and layers for 1. map

    map = myLeafletMultiMaps.addMap( optionsForMap );
    //Set options and layers for 2. map
    ...

    myLeafletMultiMaps.set( '2-1-1' ); //Set to display 4 maps (2 small and 2 big)


### Display-modes
There are 11 different modes displaying 1-5 maps

If the browser is in landscape mode it is by columns. If it is in portrait mode it is by rows.

There are five columns/rows containing the five maps.
Witch columns/rows and amps that are visible is set by `.set( id )` where the possible values of `id` is given below.

The contents of the five columns/rows are:

    1. col/row     : 2 or 3 small maps
    2. - 4. col/row: 1 map
    5. col/row     : 2 small maps


| Id | Maps | Description |
| :--: | :--: | :-- |
| `"1"` | 1 | 1 map (default) |
| `"1-1"` | 2 | 2 maps |
| `"1-1-1"` | 3 | 3 maps |
| `"2-1"` | 3 | 2 small and 1 big map |
| `"3-1"` | 4 | 3 small and 1 big map |
| `"2-2"` | 4 | 4 equal sized maps |
| `"2-1-1"` | 4 | 2 small and 2 big maps|
| `"2-1-2"` | 5 | 2 small, 1 big, and 2 small maps |
| `"1-2"` | 3 | 1 big and 2 small maps |
| `"1-3"` | 4 | 1 big and 3 small maps |
| `"1-1-2"` | 4 | 2 big and 2 small maps |



### Methods

    L.multiMaps( containerSelector ): Constructor        

    .addMap( options ): Add a new map with options and return the map-object
    .set( id ): Sets the display mode. Possible values for id is given above


### Events
One of two events are fired on the maps when the map is hidden or displayed when `set(id)` is called:
	`showInMultiMaps` and `hideInMultiMaps`

## Icon-font
Icon-font for the different display modes are available.

    <i class="famm-1-1-2"></i>
    //OR
    <i class="famm-1-1-2-p"></i>

The `landscape` icon are automatic transformed to portrait mode when `portrait`-class is added to `<html>`

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/leaflet-multi-maps/LICENSE).

Copyright (c) 2016 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk
