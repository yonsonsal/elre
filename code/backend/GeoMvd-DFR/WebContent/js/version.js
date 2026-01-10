var releaseVersion="0.6.0";
console.log('Cargando DFR version ' + releaseVersion);
let forceDisableCache = true;
if (forceDisableCache)
	var buildVersion = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
else
	var buildVersion=2;