<StyledLayerDescriptor version="1.0.0">
	<NamedLayer>
		<Name>Gasoducto Cruz del Sur</Name>
			<UserStyle>
				<Title>Gasoducto Cruz del Sur</Title>
				<FeatureTypeStyle>
					<Rule>
											
						<Title> Gasoducto </Title>
						<LineSymbolizer>
							<Stroke>
<!--  Todo referente a gas pasa a ser amarillo 18/11/2020
								<CssParameter name="stroke">#FF0000</CssParameter>
-->
								<CssParameter name="stroke">#FEC62F</CssParameter>
								<CssParameter name="stroke-width">3</CssParameter>
								<CssParameter name="stroke-dasharray">5 3</CssParameter>
							</Stroke>
						</LineSymbolizer>						

						<TextSymbolizer>
							<Label>
								<PropertyName>atencion</PropertyName>
							</Label>
							<LabelPlacement>
								<LinePlacement>
									<PerpendicularOffset>
       									10
    								</PerpendicularOffset>
								</LinePlacement>
							</LabelPlacement>
							<Font>
								<CssParameter name="font-family">Lucida Sans</CssParameter>
								<CssParameter name="font-size">14</CssParameter>
							</Font>
							<Fill>
<!--
								<CssParameter name="fill">#FF0000</CssParameter>
-->
								<CssParameter name="stroke">#FEC62F</CssParameter>
							</Fill>

<!--
							<VendorOption name="followLine">true</VendorOption>
         					<VendorOption name="maxAngleDelta">15</VendorOption>
         					<VendorOption name="maxDisplacement">20</VendorOption>
         					<VendorOption name="repeat">30</VendorOption>
-->

						</TextSymbolizer>


						<MaxScaleDenominator>100000</MaxScaleDenominator>						
          			</Rule>

				</FeatureTypeStyle>
			</UserStyle>
		</NamedLayer>
</StyledLayerDescriptor>
