/*** Cambiar tamaño a los divs ****/

/*** Cambiar tamaño a los divs ****/

( function( $, D, W ){
	/*** Crear objeto ***/
	$.resize_panels = $.resize_panels || {};
	
	$.resize_panels.defauls = {
		/*** Options ***/
		options : {
			maxS : 150,
			minS : 100,
			autoSize : false,
			limit_size : false,
			
			axis : "y", // x - y
			separator : null,
			first_panel : null,
			last_panel : null,
			wrap_content : null,
			control : "first", // first - last
			
			animate : true,
			speed : 350,
			easing : "",
			
			/*** Eventos ***/
			onError		: function(){},
			ondragstart	: function(){},
			ondrag		: function(){},
			ondragend	: function(){}
		}
	};
	
	/*** Is string ***/
	var isString = function( str ) {
			return $.type( str ) === "string";
		},		
		/*** Is percent ***/
		isPercent = function( str ) {
			return isString( str ) && str.indexOf('%') > 0;
		},
		/*** Is number ***/
		isNumber = function( Numero ){
			/**** Comprobar se el Numero si es un Número ****/
			return !isNaN( parseFloat( Numero ) );
		};
	
	/*** Plugin jquery ****/
	$.fn.resize_panels = function( options ){
		/*** Verificar selector ***/
		if( !this || this.length == 0 )
			return this;
		
		/*** Retornar elemento ***/
		return this.each( function( ) {
            /*** Options ****/
			var padre = $( this ), _self = this,
				_opt		= $.extend( {}, $.resize_panels.defauls.options, options || {} ),
				settings	= $.extend( {}, _opt,  padre.data() || {} );
			
			/**** Establecer opciones ****/
			padre.data( "resize_panels", settings );
			
			/*** Opciones ***/
			if( settings.autoSize === true )
				settings.limit_size = true;
			
			/*** Elementos ****/
			var separator = $( settings.separator, padre ),
				first_panel = $( settings.first_panel, padre ),
				last_panel = $( settings.last_panel, padre ),
				wrap_content = $( settings.wrap_content, padre ),
				
				/*** Variables de Tamaño. ***/
				padre_s, separator_s, first_panel_s, last_panel_s, distance,
				end_size, last_size, size_first_panel, max_size, min_size, _prop_f, _prop_l,
				axis_y = settings.axis == "y" ? true : false,
				
				/*** Comprobar easing ***/
				easing = jQuery.easing[ settings.easing ] == "undefined" ? "" : settings.easing;
				
			/*** Elementos Necesarios ***/
			if( ( !last_panel || last_panel.length == 0 ) ||
				( !first_panel || first_panel.length == 0 ) ||
				( !separator || separator.length == 0 ) ||
				( settings.autoSize && ( !wrap_content || wrap_content.length == 0 ) ) ){
				
				/*** Error ***/
				if( $.isFunction( settings.onError ) )
					settings.onError.apply( _self, [ "No se ha podido establecer los elementos necesarios!", settings ]);
					
				return;
			}
			
			/** Actualizar evento ***/
			function update_event ( evt, dd ){
				// starting mouse position
				evt.startX = dd.pageX;
				evt.startY = dd.pageY;
				
				// current distance dragged
				evt.deltaX = evt.pageX - dd.pageX;
				evt.deltaY = evt.pageY - dd.pageY;
				
				// original element position
				evt.originalX = dd.offset.left;
				evt.originalY = dd.offset.top;
				
				// adjusted element position
				evt.offsetX = evt.originalX + evt.deltaX; 
				evt.offsetY = evt.originalY + evt.deltaY;
				
				return evt;
			}
			
			/*** Iniciar drag ****/
			function int_drag( evt, plugin ){
				/*** Variables de Tamaño. ***/
				padre_s = padre[ axis_y ? "height" : "width" ](),
				separator_s = separator[ axis_y ? "outerHeight" : "outerWidth" ](),
				first_panel_s = size_first_panel = first_panel[ axis_y ? "outerHeight" : "outerWidth" ](),
				last_panel_s = last_panel[ axis_y ? "outerHeight" : "outerWidth" ]();
				
				
				if( !plugin ){
					/*** Posicion original del elemento ****/
					evt.offset = separator.offset();
					
					/*** Guardar datos ***/
					separator.data( "evt_org", evt );
				}
				
				/**** Llamar funcion de inicio ***/
				if( $.isFunction( settings.ondragstart ) )
					settings.ondragstart.apply( _self, [ evt, settings ]);
				
			}
			
			function get_size( ){
				/*** Tamaño del primer div ***/
				if( distance >= 0 )
					/*** subio el cursor o lo corrio a la izq ***/
					end_size = Math.max( Math.min( first_panel_s - distance, padre_s ), 0 );
					
				else 
					/*** Bajó el cursor o lo corrio a la derecha. ***/
					end_size = Math.max( Math.min( first_panel_s + ( distance * -1 ), padre_s - separator_s ), 0 );
				
				/*** Maximo y mínimo tamaño ***/
				max_size = settings.maxS,
				min_size = settings.minS;
				
				// maxS : 150, minS, autoSize : true 
				if( settings.autoSize === true && wrap_content && wrap_content.eq( settings.control == "first" ? 0 : 1 ).length > 0 ){
					/*** Averiguar el Tamaño del div ***/
					max_size = wrap_content.eq( settings.control == "first" ? 0 : 1 )[ axis_y ? "outerHeight" : "outerWidth" ]();
					
					if( min_size >= max_size )
						min_size = 0; //parseFloat( max_size / 2 );
				} 
				
				if( settings.limit_size === true ){
					/*** auto ajustar tamaño ***/
					if( settings.control == "first" ){
						/**** Tamaño del primer panel ****/
						end_size = Math.min( Math.max( end_size, min_size ), max_size );
					
						/*** Tamaño del segundo div ***/
						last_size = padre_s - end_size - separator_s;
				
					} else {						
						/**** Tamaño del segundo panel ****/
						last_size = Math.min( Math.max( padre_s - end_size - separator_s, min_size ), max_size );
						
						/*** Tamaño del primer panel ***/
						end_size = padre_s - last_size - separator_s;
					}
				
				} else {
					/*** Tamaño del segundo div ***/
					last_size = padre_s - end_size - separator_s;
				}	
			}
			
			/*** Event drag ****/
			function drag( evt, plugin ){
				/**** Importante para evitar la seleccion del texto ****/
				try {  if ( evt.preventDefault ) evt.preventDefault();
				else if( evt.returnValue ) evt.returnValue = false;
				} catch( exception ) { };
				
				/*** Actualizar variables ***/					
				if( !plugin ) 
					evt = update_event( evt, separator.data( "evt_org" ) );
					
				/*** Distancia recorrida con el mouse ***/
				distance = axis_y ? ( evt.startY - evt.pageY ) : ( evt.startX - evt.pageX );
				
				/*** Organizar tamaños ***/
				get_size();
				
				/*** Mover separador ***/
				_animate( evt, true );
			}
			
			/*** Termino la arrastrada ****/
			function end_drag( evt, plugin ){
				/*** Eliminar datos ***/				
				if( !plugin ) separator.removeData( "evt_org" );
				
				/**** Llamar funcion de inicio ***/
				if( $.isFunction( settings.ondragend ) )
					settings.ondragend.apply( _self, [ evt, settings ]);
			}
			
			function _animate( evt, _drag ){
				/*** Tamaños anteriores ***/
				size_first_panel = first_panel[ axis_y ? "height" : "width" ]();
				
				if( size_first_panel !== end_size ){
					/*** Animar divs ***/
					if( settings.animate === true && !_drag ){
						
						try {
							/*** Crear objeto ***/
							_prop_f = eval( '_prop_f={"' + ( axis_y ? "height" : "width" ) + '":"' + end_size + "px" + '"};' );
							_prop_l = eval( '_prop_l={"' + ( axis_y ? "height" : "width" ) + '":"' + last_size + "px" + '"};' );
						
						} catch ( e ) {
							/*** Error al crear los objetos ****/
							return false;	
						};
						
						/*** Animar primer panel ***/
						first_panel.animate( _prop_f, {
							duration: settings.speed,
							easing: easing,
							queue: false,
							complete: function(){
								/**** Llamar funcion de drag ***/
								if( $.isFunction( settings.ondrag ) )
									settings.ondrag.apply( _self, [ evt, settings, end_size, last_size, separator_s ]);
							}
						});
						
						/*** Animar segundo panel ***/
						last_panel.animate( _prop_l, {
							duration: settings.speed,
							easing: easing,
							queue: false
						});
					
					} else {						
						/** Actualizo Tamaños ***/
						if( typeof $.fn[ axis_y ? "setOuterHeight" : "setOuterWidth" ] !== "undefined" ){						
							first_panel[ axis_y ? "setOuterHeight" : "setOuterWidth" ]( end_size );
							last_panel[ axis_y ? "setOuterHeight" : "setOuterWidth" ]( last_size );
						
						} else {
							/** Actualizo Tamaños ***/
							first_panel.css( axis_y ? "height" : "width", end_size );
							last_panel.css( axis_y ? "height" : "width", last_size );
						}
						
						/**** Llamar funcion de drag ***/
						if( $.isFunction( settings.ondrag ) )
							settings.ondrag.apply( _self, [ evt, settings, end_size, last_size, separator_s ]);			
					}
				}
			}
			
			/*** Asignar eventos ****/
			if( typeof $.fn["drag"] !== "undefined" ){
				/*** Asignar eventos con el plugin ***/
				separator
					.bind( "dragstart", int_drag )
					.bind( "drag", drag )					
					.bind( "dragend", end_drag );
			
			} else {
								
				/*** Mouse move ***/
				function mousemove( evt ){
					/*** Actualizar variables ***/					
					evt = update_event( evt, separator.data( "evt_org" ) );
		
					/*** Llamar funcion ***/					
					drag.apply( this, [ evt, true ]); //drag( evt, true );
				}
				
				function mouseup( evt ){
					/*** Eliminar evento ***/
					$( document ).unbind( ".resize" );
					
					/*** Eliminar datos ***/

					separator.removeData( "evt_org" );
					
					/*** Llamar funcion ***/
					end_drag.apply( this, [ evt, true ]); // end_drag( evt, true );
				}
				
				/*** Mouse down ***/
				function mousedown ( evt ){
					/**** Importante para evitar la seleccion del texto ****/
					try {  if ( evt.preventDefault ) evt.preventDefault();
					else if( evt.returnValue ) evt.returnValue = false;
					} catch( exception ) { };
					
					/*** Posicion original del elemento ****/
					evt.offset = separator.offset();
					
					/*** Guardar datos ***/
					separator.data( "evt_org", evt );
					
					/*** Asignar eventos al document ****/
					$( document )
						.bind( "mouseup.resize", mouseup )
						/**** Evento mousemove ****/
						.bind( "mousemove.resize", mousemove );
										
					/*** Llamar funcion ***/					
					int_drag.apply( this, [ evt, true ]); // int_drag( evt, true );
				}
				
				/*** Asignar eventos con jquery ***/
				separator.bind( "mousedown", mousedown );				
			}
			
			padre.bind({
				 /*** Actualizar variables ****/
				 update_settings :  function( evt, _options ){ 					
					_opt = $.extend( {}, settings || $.resize_panels.defauls.options, _options || {} ),
					settings = $.extend( {}, _opt,  padre.data() || {} );
					
					/**** Establecer opciones ****/
					padre.data( "resize_panels", settings );
					
					/*** Opciones ***/
					if( settings.autoSize === true )
						settings.limit_size = true;
					
					/*** Comprobar easing ***/
					easing = jQuery.easing[ settings.easing ] == "undefined" ? "" : settings.easing;
				
					/*** Actualizar variable ***/
					axis_y = settings.axis == "y" ? true : false;				
				},
				
				/*** Mover separador ****/
				move_to : function( evt, valor ){
					/** Variables ****/
					var size_parent = padre[ axis_y ? "outerHeight" : "outerWidth" ](), size_to_move,
						current_posicion = //first_panel[ axis_y ? "outerHeight" : "outerWidth" ]();
							separator.offset()[ axis_y ? "top" : "left" ] - padre.offset()[ axis_y ? "top" : "left" ];						
						
					/*** Verificar valor ***/
					if( isPercent( valor || 0 ) ){
						/*** Obtener valor ***/
						valor = parseFloat( valor, 10 );
						
						if( valor > 100 ){
							/*** Tamaño maximo para mover ***/
							size_to_move = 	size_parent;
						
						} else {
							/*** Calcular tamaño por porcentage ***/
							size_to_move = parseFloat( ( valor * size_parent ) / 100 );
						}
						
					} else if ( isNumber( valor ) ){
						/*** Obtener valor ***/
						valor = size_to_move = parseFloat( valor, 10 );
						
						if( valor > size_parent ){
							/*** El valor es mayor que la altura del contenedor ****/
							size_to_move = size_parent;						
						}
					}
					
					if( size_to_move && isNumber( size_to_move ) ){
						/*** Variables de Tamaño. ***/
						padre_s = padre[ axis_y ? "height" : "width" ](),
						separator_s = separator[ axis_y ? "outerHeight" : "outerWidth" ](),
						first_panel_s = size_first_panel = first_panel[ axis_y ? "outerHeight" : "outerWidth" ](),
						last_panel_s = last_panel[ axis_y ? "outerHeight" : "outerWidth" ]();
				
						/*** Mover contenedor ***/
						distance = current_posicion - size_to_move - ( separator_s / 2 );
						
						/*** Organizar tamaños ***/
						get_size();
						
						/*** Mover separador ***/
						_animate( evt, false );
					}
				}
			});
			
        });
	}
	
	$.fn.setOuterHeight = function( value, margins ){
		/*** Verificar selector ***/
		if( !this || this.length == 0 )
			return this;
		
		/*** Is number ***/
		var isNumber = function( Numero ){
			/**** Comprobar se el Numero si es un Número ****/
			return !isNaN( parseFloat( Numero ) );
		}
		
		/*** El valor no es un número ***/
		if( !isNumber( value ) )
			return this;
		
		else
			/*** Convertir a integro ***/ 
			value = parseFloat( value );
			
		/*** Retornar elemento ***/
		return this.each( function( ) {
			/*** Variables ****/
			var elemento = $( this ), Height = 0, prop,
				factores = [ "border-top-width", "padding-top", "padding-bottom", "border-bottom-width" ];
			
			if( margins === true )
				factores.push( "margin-top", "margin-bottom" );
			
			/*** Recorrer propiedades css ***/
			$.each( factores, function( index, val ){
				/*** Aumentar altura ***/
				prop = elemento.css( val );
				Height = Height + ( isNumber( prop ) ? parseFloat( prop ) : 0 )
				
			});
			
			if( ( value - Height ) <= 0 )
				Height = 0;
			
			else
				/** Altura del elemento sin la margin, el borde y el padding ***/
				Height = value - Height;
			
			/*** Establecer altura ***/
			elemento.height( Height );
			
		});
	}
	
	$.fn.setOuterWidth = function( value, margins ){
		/*** Verificar selector ***/
		if( !this || this.length == 0 )
			return this;
		
		/*** Is number ***/
		var isNumber = function( Numero ){
			/**** Comprobar se el Numero si es un Número ****/
			return !isNaN( parseFloat( Numero ) );
		}
		
		/*** El valor no es un número ***/
		if( !isNumber( value ) )
			return this;
		
		else
			/*** Convertir a integro ***/ 
			value = parseFloat( value );
		
		/*** Retornar elemento ***/
		return this.each( function( ) {
			/*** Variables ****/
			var elemento = $( this ), Width = 0, prop,
				factores = [ "border-left-width", "padding-left", "padding-right", "border-right-width" ];
			
			if( margins === true )
				factores.push( "margin-left", "margin-right" );
			
			/*** Recorrer propiedades css ***/
			$.each( factores, function( index, val ){
				/*** Aumentar Tamaño ***/
				prop = elemento.css( val );
				Width = Width + ( isNumber( prop ) ? parseFloat( prop ) : 0 )
				
			});
			
			if( ( value - Width ) <= 0 )
				Width = 0;
			
			else
				/** Ancho del elemento sin el margin, el borde y el padding ***/
				Width = value - Width;
			
			/*** Establecer Tamaño ***/
			elemento.width( Width );
			
		});
	}
	
})( jQuery, document, window );