<StyledLayerDescriptor version="1.0.0">
	<NamedLayer>
		<Name>Ductos ANCAP (puntos)</Name>
			<UserStyle>
				<FeatureTypeStyle>
					<Rule>										
						<Title>Gasoducto 8 pulgadas </Title>
						<Filter>	
							<PropertyIsEqualTo>
								<PropertyName>name</PropertyName>
								<Literal>GASODUCTO</Literal>
							</PropertyIsEqualTo>											
						</Filter>
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>circle</WellKnownName>									
 									
									<Fill>
               							<CssParameter name="fill">#6E2C00</CssParameter>
             						</Fill>								

									<Stroke>
										<CssParameter name="stroke">#6E2C00</CssParameter>
										<CssParameter name="stroke-width">3</CssParameter>
									</Stroke>

								</Mark>
																
								<Size>9</Size>
							</Graphic>						
						</PointSymbolizer>
						<MaxScaleDenominator>100000</MaxScaleDenominator>
          			</Rule>
                                        
					<Rule>										
						<Title>Oleoducto 16 pulgadas </Title>
						<Filter>	
							<PropertyIsEqualTo>
								<PropertyName>name</PropertyName>
								<Literal>OLEODUCTO</Literal>
							</PropertyIsEqualTo>											
						</Filter>
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>circle</WellKnownName>	
									<Fill>
               							<CssParameter name="fill">#512E5F</CssParameter>
             						</Fill>								
 									
									<Stroke>
										<CssParameter name="stroke">#512E5F</CssParameter>
										<CssParameter name="stroke-width">3</CssParameter>
									</Stroke>

								</Mark>
																
								<Size>9</Size>
							</Graphic>						
						</PointSymbolizer>
						<MaxScaleDenominator>100000</MaxScaleDenominator>
          			</Rule>

					<Rule>										
						<Title>Poliducto 8 pulgadas </Title>
						<Filter>	
							<PropertyIsEqualTo>
								<PropertyName>name</PropertyName>
								<Literal>POLIDUCTO8</Literal>
							</PropertyIsEqualTo>											
						</Filter>
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>circle</WellKnownName>									
 									
									<Fill>
               							<CssParameter name="fill">#9A7D0A</CssParameter>
             						</Fill>								

									<Stroke>
										<CssParameter name="stroke">#9A7D0A</CssParameter>
										<CssParameter name="stroke-width">3</CssParameter>
									</Stroke>

								</Mark>
																
								<Size>9</Size>
							</Graphic>						
						</PointSymbolizer>
						<MaxScaleDenominator>100000</MaxScaleDenominator>
          			</Rule>


					<Rule>										
						<Title>Poliducto 12 pulgadas </Title>
						<Filter>	
							<PropertyIsEqualTo>
								<PropertyName>name</PropertyName>
								<Literal>POLIDUCTO12</Literal>
							</PropertyIsEqualTo>											
						</Filter>
						<PointSymbolizer>
							<Graphic>
								<Mark>
									<WellKnownName>circle</WellKnownName>									

									<Fill>
               							<CssParameter name="fill">#DC7633</CssParameter>
             						</Fill>								
 									
									<Stroke>
										<CssParameter name="stroke">#DC7633</CssParameter>
										<CssParameter name="stroke-width">3</CssParameter>
									</Stroke>


								</Mark>
																
								<Size>9</Size>
							</Graphic>						
						</PointSymbolizer>
						<MaxScaleDenominator>100000</MaxScaleDenominator>
          			</Rule>

				</FeatureTypeStyle>
			</UserStyle>
		</NamedLayer>
</StyledLayerDescriptor>