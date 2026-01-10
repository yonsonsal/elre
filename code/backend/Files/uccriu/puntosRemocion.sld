<StyledLayerDescriptor version="1.0.0">
	<NamedLayer>
		<Name>Remociones</Name>
			<UserStyle>
				<FeatureTypeStyle>

					<Rule>
					   <Title>Afe</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>ADM. FERROCARRILES DEL ESTADO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>

<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>

									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#000000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Antel</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
								<Or>
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>A.N.TEL.</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>AM WIRELESS URUGUAY S.A.</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>TELSTAR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Or>

							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#00FF00</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Bse</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>BANCO DE SEGUROS DEL ESTADO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#800000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Equital</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>EQUITAL S.A.</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FF00FF</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						


					<Rule>
					   <Title>Imm</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>MUNICIPIO DE MONTEVIDEO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#F29F0D</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Gas</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
								<Or>
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>DISTRIBUIDORA DE GAS DE MONTEVIDEO S.A. - GRUPO PETROBRAS</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>GASODUCTO CRUZ DEL SUR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Or>

							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FFFF00</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Ose</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							<Or>					
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>OSE</Literal>
								</PropertyIsEqualTo>		
								
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>OBRAS SANITARIAS DEL ESTADO</Literal>
								</PropertyIsEqualTo>																
							</Or>					
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>

								<Mark>

									<WellKnownName>triangle</WellKnownName>									

 									<Stroke> 
										<CssParameter name="stroke">#0000FF</CssParameter>							
										<CssParameter name="stroke-width">2</CssParameter>										

									</Stroke>

								</Mark>
								
								<Size>12</Size>

							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Ute</Title>
						<Filter>
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>U.T.E.</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FF0000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>						
					  <Title>Otros</Title>				   	
						<Filter>					
						  <And>
								<PropertyIsEqualTo>
									<PropertyName>tipo_remocion</PropertyName>
									<Literal>ACERA</Literal>
								</PropertyIsEqualTo>		

						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>ADM. FERROCARRILES DEL ESTADO</Literal>
									</PropertyIsEqualTo>		
								</Not>							

						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>A.N.TEL.</Literal>
									</PropertyIsEqualTo>		
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>AM WIRELESS URUGUAY S.A.</Literal>
									</PropertyIsEqualTo>		
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>TELSTAR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Not>							
						  	<Not> 								  	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>BANCO DE SEGUROS DEL ESTADO</Literal>
									</PropertyIsEqualTo>									  								  	
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>EQUITAL S.A.</Literal>
									</PropertyIsEqualTo>		
						  	</Not> 	
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>MUNICIPIO DE MONTEVIDEO</Literal>
									</PropertyIsEqualTo>		
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>DISTRIBUIDORA DE GAS DE MONTEVIDEO S.A. - GRUPO PETROBRAS</Literal>
									</PropertyIsEqualTo>		
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>GASODUCTO CRUZ DEL SUR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Not>							

						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>OSE</Literal>
									</PropertyIsEqualTo>		
								</Not>							
								<Not>															
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>OBRAS SANITARIAS DEL ESTADO</Literal>
									</PropertyIsEqualTo>																
								</Not>							
						  	<Not> 	
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>U.T.E.</Literal>
									</PropertyIsEqualTo>		
								</Not>																
							</And>

						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>triangle</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#C0C0C0</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Size>12</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						


					<Rule>
					   <Title>Afe</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>	
							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>ADM. FERROCARRILES DEL ESTADO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#000000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						


					<Rule>
					   <Title>Antel</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>	
								<Or>
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>A.N.TEL.</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>AM WIRELESS URUGUAY S.A.</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>TELSTAR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Or>

							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
									
 									<Stroke> 
										<CssParameter name="stroke">#00FF00</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Bse</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>BANCO DE SEGUROS DEL ESTADO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
												
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#800000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Equital</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>							
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>EQUITAL S.A.</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FF00FF</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>									
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						


					<Rule>
					   <Title>Imm</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>								
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>MUNICIPIO DE MONTEVIDEO</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#F29F0D</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Gas</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>	
								<Or>
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>DISTRIBUIDORA DE GAS DE MONTEVIDEO S.A. - GRUPO PETROBRAS</Literal>
									</PropertyIsEqualTo>		

									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>GASODUCTO CRUZ DEL SUR S.A.</Literal>
									</PropertyIsEqualTo>		
								</Or>

							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FFFF00</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Ose</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>							
								<Or>
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>OBRAS SANITARIAS DEL ESTADO</Literal>
									</PropertyIsEqualTo>		
									
									<PropertyIsEqualTo>
										<PropertyName>propietario</PropertyName>
										<Literal>OSE</Literal>
									</PropertyIsEqualTo>		
									
								</Or>	
							</And>
						</Filter>
						
<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#0000FF</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

					<Rule>
					   <Title>Ute</Title>
						<Filter>
						  <And>
							  <Not> 
									<PropertyIsEqualTo>
										<PropertyName>tipo_remocion</PropertyName>
										<Literal>ACERA</Literal>
									</PropertyIsEqualTo>		
								</Not>								
								<PropertyIsEqualTo>
									<PropertyName>propietario</PropertyName>
									<Literal>U.T.E.</Literal>
								</PropertyIsEqualTo>		
							</And>
						</Filter>

<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->
						
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#FF0000</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						
					
					<Rule>
					  <Title>Otros</Title>	

						<Filter>					  

								<And>
								  <Not> 
										<PropertyIsEqualTo>
											<PropertyName>tipo_remocion</PropertyName>
											<Literal>ACERA</Literal>
										</PropertyIsEqualTo>		
									</Not>															

									<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>ADM. FERROCARRILES DEL ESTADO</Literal>
										</PropertyIsEqualTo>		
									</Not>							

						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>A.N.TEL.</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>AM WIRELESS URUGUAY S.A.</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>TELSTAR S.A.</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 								  	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>BANCO DE SEGUROS DEL ESTADO</Literal>
										</PropertyIsEqualTo>									  								  	
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>EQUITAL S.A.</Literal>
										</PropertyIsEqualTo>		
						  		</Not> 	
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>MUNICIPIO DE MONTEVIDEO</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>DISTRIBUIDORA DE GAS DE MONTEVIDEO S.A. - GRUPO PETROBRAS</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>GASODUCTO CRUZ DEL SUR S.A.</Literal>
										</PropertyIsEqualTo>		
									</Not>							
									<Not>															
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>OBRAS SANITARIAS DEL ESTADO</Literal>
										</PropertyIsEqualTo>																
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>OSE</Literal>
										</PropertyIsEqualTo>		
									</Not>							
						  		<Not> 	
										<PropertyIsEqualTo>
											<PropertyName>propietario</PropertyName>
											<Literal>U.T.E.</Literal>
										</PropertyIsEqualTo>		
									</Not>																
								</And>
						</Filter>

<!--						<MaxScaleDenominator>8000</MaxScaleDenominator>						-->

						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>square</WellKnownName>									
 									
 									<Stroke> 
										<CssParameter name="stroke">#C0C0C0</CssParameter>										
										<CssParameter name="stroke-width">2</CssParameter>										
									</Stroke>

								</Mark>
								
								<Rotation>45</Rotation>
								
								<Size>11</Size>
							</Graphic>						
						</PointSymbolizer>
					</Rule>						

				</FeatureTypeStyle>
			</UserStyle>

	</NamedLayer>
</StyledLayerDescriptor>
