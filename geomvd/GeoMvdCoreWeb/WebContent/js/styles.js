/*
 * Styles 
 * */
function mousePositionStyle() {
	return `
		<style>
			.custom-mouse-position {
				position: absolute;
				top: auto;
				right: auto;
				bottom: 5px;
				right: 10px;
				font-size: small;
				background-color: RGBA(255, 255, 255, .75);
			    padding-right: 5px;
			    padding-left: 5px;
			    border-radius: 3px;
			}
		</style>
	`;
}

function measureStyle() {
	return `
		<style>
			.tooltip {
				position: relative;
				background: rgba(0, 0, 0, 0.5);
				border-radius: 4px;
				color: white;
				padding: 4px 8px;
				opacity: 0.7;
				white-space: nowrap;
			}
			.tooltip-measure {
				opacity: 1;
				font-weight: bold;
			}
			.tooltip-static {
				font-weight: bold;
				border: 1px solid white;
			}
			.tooltip-static-line {
				color: white;
				background-color: #ff0000;
			}
			.tooltip-static-polygon {
				color: black;
				background-color: #ffcc33;
			}
			.tooltip-static-polygon,
			.tooltip-static-line {
				z-index: 0;
			}
			.tooltip-measure:before,
			.tooltip-static:before {
				border-top: 6px solid rgba(0, 0, 0, 0.5);
				border-right: 6px solid transparent;
				border-left: 6px solid transparent;
				content: "";
				position: absolute;
				bottom: -6px;
				margin-left: -7px;
				left: 50%;
			}
			.tooltip-static-polygon:before {
				border-top-color: #ffcc33;
			}
			.tooltip-static-line:before {
				border-top-color: #ff0000;
			}
		</style>
	`;
}

function overviewMapStyle() {
	return `
		<style>
			.ol-custom-overviewmap,
		    .ol-custom-overviewmap.ol-uncollapsible {
		    	bottom: 25px;
		      	left: auto;
		      	right: 10px;
		      	top: auto;
		    }
		
		    .ol-custom-overviewmap:not(.ol-collapsed)  {
		        border: 1px solid black;
		    }
		
		    .ol-custom-overviewmap .ol-overviewmap-map {
		        border: none;
		        width: 300px;
		    }
		
		    .ol-custom-overviewmap .ol-overviewmap-box {
		    	border: 2px solid red;
		    }
		
		    .ol-custom-overviewmap:not(.ol-collapsed) button{
		        bottom: 1px;
		        left: auto;
		        right: 1px;
		        top: auto;
		    }
		
		    .ol-rotate {
		    	top: 170px;
		        right: 0;
		    }
		</style>
	`;
}

function scaleLineStyle() {
	return `
	<style>
		.ol-custom-scale-line {
	        top: 35px;
	        right: auto;
	        bottom: auto;
	        left: 30px;
		}
	</style>
`;
}

function sidebarLyerSwitcherStyle() {
	return `
		<style>
			* {
				margin: 0;
				padding: 0;
				font-family: sans-serif;
				border:0;
				-webkit-box-sizing: border-box;
				-moz-box-sizing: border-box;
				-ms-box-sizing: border-box;
				box-sizing: border-box;
			}

			a:link,
			a:visited,
			a:active,
			a:hover {
				text-decoration: none;outline:0;
			}

			#control-sidebar-layer-switcher {
				cursor: pointer;
				width: 43px;
				height: 43px;
				background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACE1BMVEX///8A//8AgICA//8AVVVAQID///8rVVVJtttgv98nTmJ2xNgkW1ttyNsmWWZmzNZYxM4gWGgeU2JmzNNr0N1Rwc0eU2VXxdEhV2JqytQeVmMhVmNoydUfVGUgVGQfVGQfVmVqy9hqy9dWw9AfVWRpydVry9YhVmMgVGNUw9BrytchVWRexdGw294gVWQgVmUhVWPd4N6HoaZsy9cfVmQgVGRrytZsy9cgVWQgVWMgVWRsy9YfVWNsy9YgVWVty9YgVWVry9UgVWRsy9Zsy9UfVWRsy9YgVWVty9YgVWRty9Vsy9aM09sgVWRTws/AzM0gVWRtzNYgVWRuy9Zsy9cgVWRGcHxty9bb5ORbxdEgVWRty9bn6OZTws9mydRfxtLX3Nva5eRix9NFcXxOd4JPeINQeIMiVmVUws9Vws9Vw9BXw9BYxNBaxNBbxNBcxdJexdElWWgmWmhjyNRlx9IqXGtoipNpytVqytVryNNrytZsjZUuX210k5t1y9R2zNR3y9V4lp57zth9zdaAnKOGoaeK0NiNpquV09mesrag1tuitbmj1tuj19uktrqr2d2svcCu2d2xwMO63N+7x8nA3uDC3uDFz9DK4eHL4eLN4eIyYnDX5OM5Z3Tb397e4uDf4uHf5uXi5ePi5+Xj5+Xk5+Xm5+Xm6OY6aHXQ19fT4+NfhI1Ww89gx9Nhx9Nsy9ZWw9Dpj2abAAAAWnRSTlMAAQICAwQEBgcIDQ0ODhQZGiAiIyYpKywvNTs+QklPUlNUWWJjaGt0dnd+hIWFh4mNjZCSm6CpsbW2t7nDzNDT1dje5efr7PHy9PT29/j4+Pn5+vr8/f39/f6DPtKwAAABTklEQVR4Xr3QVWPbMBSAUTVFZmZmhhSXMjNvkhwqMzMzMzPDeD+xASvObKePPa+ffHVl8PlsnE0+qPpBuQjVJjno6pZpSKXYl7/bZyFaQxhf98hHDKEppwdWIW1frFnrxSOWHFfWesSEWC6R/P4zOFrix3TzDFLlXRTR8c0fEEJ1/itpo7SVO9Jdr1DVxZ0USyjZsEY5vZfiiAC0UoTGOrm9PZLuRl8X+Dq1HQtoFbJZbv61i+Poblh/97TC7n0neCcK0ETNUrz1/xPHf+DNAW9Ac6t8O8WH3Vp98f5lCaYKAOFZMLyHL4Y0fe319idMNgMMp+zWVSybUed/+/h7I4wRAG1W6XDy4XmjR9HnzvDRZXUAYDFOhC1S/Hh+fIXxen+eO+AKqbs+wAo30zDTDvDxKoJN88sjUzDFAvBzEUGFsnADoIvAJzoh2BZ8sner+Ke/vwECuQAAAABJRU5ErkJggg==');
				background-repeat: no-repeat;
				background-position: 2px;
				background-color: white !important;
				border-radius: 5px;
				border: solid #0071BC 2px;
				position: absolute;
				z-index: 1;
				left: 260px;
				bottom: 10px;
				text-align: center;
				transition: left .5s;
			}
			
			#control-sidebar-layer-switcher div::after {
				content: "»";
				color: #0071BC;
				position: absolute;
				top: -3px;
				left: 4px;
			}
			
			#control-sidebar-layer-switcher.active div::after {
				content: "«";
				color: #0071BC;
				position: absolute;
				top: -3px;
				left: 4px;
			}
			
			#control-sidebar-layer-switcher.active {
				transition: left .5s;
			}
			
			#sidebar-layer-switcher {
				z-index: 1;
				background:#f2f2f2;
				position: absolute;
				left:-250px;
				top:0;
				width: 250px;
				height: -webkit-calc(100% - 38px);
        		height:    -moz-calc(100% - 38px);
        		height:         calc(100% - 38px);
				overflow-y: scroll;
				transition: left .5s;
				resize: horizontal;
				min-width: 250px;
				
			}
			
			#botonBuscar{
			    background-color: #0071bc;
			    color: #cbdde6;
			    border-color: transparent;
			    border-radius: 0px;
			    width: 100%;
				
			}
			/*
			#layer-switcher-find {
				width: auto;
				top: auto;
				bottom: 0px;
				left: 3px;
				position: relative;
				border: #0071bc 2px solid;
				background: #cbdde6;
			}*/
			
			#layer-switcher-find {
				width: 250px;
				top: auto;
				bottom: 0px;
				left: 0px;
				position: fixed;
				border: #0071bc 2px solid;
				background: #cbdde6;
				transition: left .5s;
			}
			
			#likecalles {
			    margin-top: 5px;
			    width: 100%;
			    font-size: 9pt;
		 	}
		 	
		 	.findInputtext {
			 	width: 100%;
			    height: 23px;
			    margin-top: 5px;
			    font-size: 9pt;
			    text-align: center;
			}
			
			#find {
			    float: right;
			    margin: 5px;
			    height: 22px;
			    width: 60px;
			    background-color: #BBB;
			}
			
			#deletefind {
			    margin: 5px;
			    height: 22px;
			    width: 60px;
			    background-color: #BBB;
			}
			
			#sidebar-layer-switcher.active {
				-webkit-box-shadow: 5px 0px 10px 0px rgba(0,113,188,0.9);
				-moz-box-shadow: 5px 0px 10px 0px rgba(0,113,188,0.9);
				box-shadow: 5px 0px 10px 0px rgba(0,113,188,0.9);
			}
			
			.layer-switcher-group:not(.hidden-layer-switcher-group) {
				margin-bottom: 15px;
			}
			
			.hidden-layer-switcher-group > .layer-switcher-layer-container {
				display: none;
			}
			
			.layer-switcher-group-title-text {
				font-size: small;
				display: inline-block;
				width: 95%;
			}
			
			.layer-switcher-group-title-icon {
				display: inline-block;
				width: 5%;
			}
			
			.layer-switcher-group-title > .layer-switcher-group-title-icon::after {
				content: "▲ ";
			}
			
			.hidden-layer-switcher-group > .layer-switcher-group-title > .layer-switcher-group-title-icon::after {
				content: "▼ ";
			}
			
			.layer-switcher-group-title {
				font-weight: 600;
				margin-bottom: 2px;
			    display: block;
			    background-color: #CBDDE6;
			    color: #0071BC;
			    cursor: pointer;
			    padding: 5px;
			}
			
			.layer-switcher-layer-container {
				padding: 0 5px;
				margin-top: 3px;
			}
			
			.layer-switcher-checkbox,
			.layer-switcher-radio {
				margin: 4px 5px 0 0 !important;
				position: absolute;
			}
			
			.layer-switcher-layer-title {
				display: block;
				font-weight: 500;
				cursor: pointer;
				font-size: small;
				margin-left: 15%;
			}
			
			.layer-switcher-layer-selector {
				width: 10%;
				margin-left: 5%;
				border-radius: 5px;
				display: inline-block;
				text-align: center;
				font-size: small;
			}
			
			.layer-switcher-layer-selector-disabled {
				background-color: lightgrey;
				cursor: not-allowed;
				color: grey;
			}
			
			.layer-switcher-layer-selector-active {
				background-color: limegreen;
				cursor: pointer;
				color: black;
			}
			
			.layer-switcher-layer-selector-inactive {
				background-color: #ffbbb9;
				cursor: pointer;
				color: black;
			}
			
			.layer-switcher-layer-reference-hidden {
				display: none;
			}
			
			.layer-switcher-layer-reference {
				padding-left: 8%;
				width: 100%;
			}
			
			.layer-switcher-layer-reference:not(.layer-switcher-layer-reference-hidden) {
				display: inline-block;
			}
			
			.layer-switcher-layer-reference > img {
				max-width: 92%;
				height: auto;
			}
			
			#map-container {
				display:inline;
				float:left;
				width:100%;
				transition: margin-left .5s;
			}
			
			.layer-switcher-contextual-menu-selector {
				width: 65%;
				display: inline-block;
			}
			
			.layer-switcher-layer-is-filtered {
				background-color: #ffc107;
				color: black;
				cursor: pointer;
			}
			
			.layer-switcher-layer-is-filtered:not(.layer-switcher-layer-is-filtered-hidden) {
				display: inline-block;
			}
			
			.layer-switcher-layer-is-filtered.layer-switcher-layer-is-filtered-hidden {
				display: none;
			}
			
			.dropdown-menu,
			.dropdown-menu * {
				font-size: small;
			}
			li.dropdown-submenu:hover > ul.dropdown-menu {
			    display: block;
			}
			.dropdown-submenu {
			    position:relative;
			}
			.dropdown-submenu>.dropdown-menu {
		        top: 100%;
			    left: -1px;
			    margin-top: 1px;
			}
			.cursor-pointer {
				cursor: pointer !important;
			}
			
			.dropdown-menu:not(.dropdown-menu-submenu) {
				max-width: 155%;
				width: 155%;
			}
			
			.dropdown-menu.dropdown-menu-submenu {
				max-width: 101%;
				width: 101%;
			}
			
			.badge-warning {
				background-color: #ffc107;
				color: black;
				display: block;
				font-size: small;
				cursor: pointer;
			}
			
			.badge-warning:hover {
				color: #FFFFFF;
				background-color: #c59400;
			}
		</style>
	`;
}

function generalInfoStyle() {
	return `
	<style>
		#general-info {
			position: absolute;
		    z-index: 1;
		    right: 82px;
		    top: 5px;
		    background-color: rgba(0,60,136,.7);
		    border-radius: 5px;
		    border: 1px solid white;
		    padding: 5px;
		}
		
		.general-info-line {
			font-size: small;
			color: white;
		}
		
		.general-info-line-label {
			width: 140px;
			display: inline-block;
		}
		
		.general-info-line-data {
			display: inline-block;
		}
		
		#clear-selected-mode {
			margin-left: 5px;
			font-size: x-small;
			display: inline-block;
		}
		
		.clear-selected-mode-hidden,
		.clear-selected-mode-hidden > i {
			visibility: hidden !important;
		}
	</style>
	`;
}

function pendingChangesStyle() {
	return `
	<style>
		#pending-changes {
			position: absolute;
		    z-index: 1;
		    left: 40px;
		    top: 40px;
		    background-color: rgba(0,60,136,.7);
		    color: white;
		    border-radius: 5px;
		    border: 1px solid white;
		    padding: 5px;
		    font-size: small;
		    transition: top .5s, left .5s;
		}
		
		#pending-changes p {
			text-align: center;
			font-weight: bold;
		}
		
		#pending-changes > table,
		#pending-changes tr,
		#pending-changes th,
		#pending-changes td {
			border: 1px solid white;
		}
		
		#pending-changes td {
			color: black;
		}
		
		#pending-changes th,
		#pending-changes td {
			text-align: center;
			padding: 0 5px;
		}
		
		#pending-changes tr.PENDING {
			background-color: rgba(255,255,42,0.85);
		}
		#pending-changes tr.PROCESSED {
			background-color: rgba(90,255,48,.85);
		}
		#pending-changes tr.WITH_ERROR {
			background-color: rgba(255,48,69,.85);
		}
	</style>
	`;
}

function generalModalStyle() {
	return `
		<style>
			#general-modal-dialog.modal-full {
				width: 90% !important;
			}
		</style>
		`;
}

function secondaryMenuStyle() {
	return `
        <style>
            #new-buttons-container {
                position: absolute;
                right: 80px;
                top:15px;
                z-index: 2;
            }
            
            .secondary-menu-button {
                width: 40px;
                height: 40px;
                border-radius: 100%;
                background: rgba(0,60,136,.9);
                border: none;
                outline: none;
                color: rgba(255,255,255,1);
                font-size: 20px;
                cursor: pointer;
            }
            
            .secondary-menu-button.mr-15 {
            	margin-right: 15px;
            }
            
            .secondary-menu-button.disabled {
            	background: rgba(111, 121, 134, .9);
            	cursor: not-allowed;
            }
            
            .secondary-menu-button:not(.disabled):hover {
                box-shadow: 0 0 20px rgba(0,60,136,.7), 0 0 20px rgba(0,60,136,.7)
            }
            
            .secondary-menu-button {
                margin-left: 10px;
            }
            
            .secondary-menu-button.activated {
            	background: rgba(92, 184, 92, .9);
            }
            
        </style>
	`;
}