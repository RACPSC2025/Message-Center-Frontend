# get_configuration_amatia_express

Documento canónico de este tema:

- ../get_configuration_amatia_express.md

Resumen rapido:

- Endpoint: GET /message_center_api/legal_api/get_configuration_amatia_express
- Slice: src/stores/platformConfigSlice.js
- Hook de acceso: src/hooks/usePlatformConfig.js
- Integracion en navegacion: src/config/generalConfig.js y src/routes/RoutesFile.js
- Integracion en LegalMatriz:
	- permissions.create_requirement -> visibilidad boton create_legal_requirement (SpeedDial)
	- permissions.create_article -> visibilidad tab create_legal_requirement (OptionsDrawer)
	- permissions.create_article -> visibilidad boton Add_articles en src/features/articles/Articles.js
	- features.analysis_ia -> visibilidad columna analysis_with_amatia y tab analysis_of_regulation
	- features.compliance_view -> visibilidad tab compliance
	- navegacion entre tabs por tabId centralizado en src/features/MessageCenterLegalMatriz/tabIds.js
