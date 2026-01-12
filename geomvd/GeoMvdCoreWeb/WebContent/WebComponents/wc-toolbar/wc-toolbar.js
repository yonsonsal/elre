class WCToolbar extends HTMLElement {	
	
	constructor() {
		super();
	}
	
	// Se llama cada vez que el elemento se inserta en el DOM.
	// Es similar al componentWillMount de React.js.
	connectedCallback () {
		this.updateButtons();
	}
	
	// Se llama cuando el componente es eliminado del DOM.
	// Es similar al componentWillUnmount de React.js.
	disconnectedCallback() {
	}
	
	// Se llama cuando un atributo del elemento es agregado, removido, actualziado o remplazado.
	// Es similar al componentWillReciveProps, shouldComponentUpdate y componentDidUpdate de React.js.
	attributeChangedCallback(name, oldValue, newValue) {
	}
	
	// Se llama cada vez que el elemento es movido a un nuevo documento.
	// Solo se llamará cuando en la página haya un iframe.
	adoptedCallback() {
    }
	
	set buttons(value) {
		this._buttons = value;
		this.updateButtons();
	}
  
	get buttons() {
		return this._buttons;
	}
	
	set showOnHover(value) {
		this._showOnHover = value;
	}
  
	get showOnHover() {
		return this._showOnHover;
	}
	
	updateButtons() {
		let that = this;
		this.innerHTML = this.renderHTML();
		
		if(this.innerHTML){
			let buttons = JSON.parse(this._buttons);
			if (buttons && buttons.length > 0) {
				let buttonsAmount = buttons.length;
				
				let showOnHover = this.getAttribute('showOnHover') && this.getAttribute('showOnHover').toUpperCase() == "TRUE";
				
				if (showOnHover) {
					$('.botonMenuAcciones').hover(
			                function () {
			                    $('.btnAccion').addClass('animacionVer');
			                    $('.btnMenu').addClass('animacionVer');
			                    var contenedorBotonAcciones = $('.contenedorBotonesAcciones');
			                    $(contenedorBotonAcciones).width(90);
			                    $(contenedorBotonAcciones).height(70 + (70 * buttonsAmount));
			                }
			        );
			        $('.contenedorBotonesAcciones').mouseleave(
			                function () {
			                    $('.btnAccion').removeClass('animacionVer');
			                    $('.btnMenu').removeClass('animacionVer');
			                    var contenedorBotonAcciones = $('.contenedorBotonesAcciones');
			                    $(contenedorBotonAcciones).width(0);
			                    $(contenedorBotonAcciones).height(0);
			                }
			        );
				} else {
					this.menuOpened = false;
				}
				
		        $('.btnAccion').click(
	                function () {
	                    const WCToolbarButtonClick = new CustomEvent("WCToolbarButtonClick", {
	        				detail: this.id
	        		    });
	        		    that.dispatchEvent(WCToolbarButtonClick);
	                }
		        );
		        $('.btnSubAccion').click(
	                function () {
	                    const WCToolbarButtonClick = new CustomEvent("WCToolbarButtonClick", {
	        				detail: this.id
	        		    });
	        		    that.dispatchEvent(WCToolbarButtonClick);
	                }
		        );
		        $('.btnMenu').hover(
	                function () {
	                	let elementId = this.id;
	                	if (elementId) {
	                		$(`.btnFather-${elementId}`).addClass('animacionVer');
	                		$(`#subMenuActionsContainer-${elementId}`).removeClass('subMenuActionsContainerHidden');
	                	}
	                }
		        );

		        $('.subMenuActionsContainer').mouseleave(
		                function () {
		                	$(this).addClass('subMenuActionsContainerHidden');
		                	let elementId = this.id;
		                	let firstDashIndex = elementId.indexOf('-');
		                	if (firstDashIndex > -1) {
		                		let buttonId = elementId.substring((firstDashIndex+1));
		                		$(`.btnFather-${buttonId}`).removeClass('animacionVer');
		                	}
		                }
		        );
		        
		        this._botonMenuAcciones = $("#botonMenuAcciones");
				
				this._botonMenuAcciones.click(function () {
					if (!showOnHover) {
						if (that.menuOpened) {
							$('.btnAccion').removeClass('animacionVer');
							$('.btnMenu').removeClass('animacionVer');
		                    var contenedorBotonAcciones = $('.contenedorBotonesAcciones');
		                    $(contenedorBotonAcciones).width(0);
		                    $(contenedorBotonAcciones).height(0);
						} else {
							$('.btnAccion').addClass('animacionVer');
							$('.btnMenu').addClass('animacionVer');
		                    var contenedorBotonAcciones = $('.contenedorBotonesAcciones');
		                    $(contenedorBotonAcciones).width(90);
		                    $(contenedorBotonAcciones).height(70 + (70 * buttonsAmount));
						}
						that.menuOpened = !that.menuOpened;
					}
		            return false;
		        });	
			}
		}
	}
	
	renderHTML() {
		let html = ``;
		
		if (this._buttons) {
			let buttons = JSON.parse(this._buttons);
		
			if (buttons && buttons.length > 0) {
				
				html += this.toolbarStyle();

				html += `
				    <div class="contenedorBotonesAcciones" style="width:0px; height:0px;">
				    
				        <button
				        	class="botonMenuAcciones"
				        	id="botonMenuAcciones"
				        	data-toggle="tooltip"
				        	title="Menú"
				        >
				            <i class="fa fa-bars"></i>
				        </button>
		        `;
				
				buttons.forEach((btn, index) => {
					let transition = 0.5 + (0.2 * index);
					let marginTop = 60 + (60 * index);
					if (btn.type.toUpperCase() == "OPTION") {
						html += `
							<button
					        	id="${btn.id}"
					        	class="btnAccion${btn.customClass ? (" " + btn.customClass) : ""}"
					        	data-toggle="tooltip"
					        	data-placement="left"
					        	title="${btn.tooltipText}"
					        	style="margin-top:${marginTop}px; transition:${transition}s;"
				        	>
					            <i class="fa ${btn.faIcon}"></i>
					        </button>
						`;
					} else if (btn.type.toUpperCase() == "MENU") {
						let actionsContainerWidth = (btn.buttons.length * 65) + 50;
						html += `
							<button
					        	id="${btn.id}"
					        	class="btnMenu${btn.customClass ? (" " + btn.customClass) : ""}"
					        	data-toggle="tooltip"
					        	data-placement="left"
					        	title="${btn.tooltipText}"
					        	style="margin-top:${marginTop}px; transition:${transition}s;"
				        	>
					            <i class="fa ${btn.faIcon}"></i>
					        </button>
						`;

						html += `<div title="${btn.tooltipText}" id="subMenuActionsContainer-${btn.id}" class="subMenuActionsContainer subMenuActionsContainerHidden contenedorBotonAcciones-${btn.id}" style="position:absolute; right:15px; top:${marginTop}px; z-index: 2; width:${actionsContainerWidth}px; height:50px;">`;
						btn.buttons.forEach((_btn, _index) => {
							let _transition = 0.5 + (0.2 * _index);
							let _marginRight = 55 + (55 * _index);
							html += `
								<button
						        	id="${_btn.id}"
						        	class="btnSubAccion btnFather-${btn.id}${_btn.customClass ? (" " + _btn.customClass) : ""}"
						        	data-toggle="tooltip"
						        	data-placement="left"
						        	title="${_btn.tooltipText}"
						        	style="margin-top:0px; margin-right:${_marginRight}px; transition:${_transition}s;"
					        	>
						            <i class="fa ${_btn.faIcon}"></i>
						        </button>
							`;
						}); 
						
						html += `</div>`;
					}
				});
				
				html += `
				    </div>
				`;
			}
		}
		
		return html;
	}
	
	toolbarStyle() {
		return `
		<style>
			.contenedorBotonesAcciones {
			    position:absolute;
			    right:0px;
			    top:15px;
			    z-index: 2;
			}
			
			.botonMenuAcciones {
			    width:40px;
			    height:40px;
			    border-radius:100%;
			    background:#003366;
			    right:0;
			    top:0;
			    position:absolute;
			    margin-right:15px;
			    /*margin-top:15px;*/
			    border:none;
			    outline:none;
			    color:#FFF;
			    font-size:20px;
			    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
			    transition:.3s;
			}
			
			span {
			    transition:.5s;
			}
			
			.botonMenuAcciones:hover span {
			    transform:rotate(360deg);
			}
			
			.botonMenuAcciones:active{
			    transform:scale(1.1);
			}
			
			.btnMenu,
			.btnSubAccion,
			.btnAccion {
			    width:40px;
			    height:40px;
			    border-radius:100%;
			    border:none;
			    color:#FFF;
			    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
			    font-size:20px;
			    outline:none;
			    position:absolute;
			    right:0;
			    top:0;
			    transform:scale(0);
			    background:#B99444;
			}
			
			.btnMenu,
			.btnAccion {
				margin-right:15px;
			}
			
			.animacionVer {
			    transform:scale(1);
			}
			
			.subMenuActionsContainerHidden {
				width: 0 !important;
				height: 0 !important;
			}
			
			.btnAccion.disabled,
			.btnSubAccion.disabled {
            	background: rgba(111, 121, 134, .9);
            	cursor: not-allowed;
            }
            
		</style>
	`;
	}
}

window.customElements.define('wc-toolbar', WCToolbar)
