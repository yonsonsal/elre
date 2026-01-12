function openInNewTab(url, delay) {
	setTimeout(function() {
		var win = window.open(url, '_blank');
		win.focus();
	}, delay);
}

function waitforZip(cant, delay) {
	setTimeout(function() {
		if (urlsFile.length < cant){
			waitforZip(cant, delay)
		}
		else{
			files = new Array();
			descargarArchivo(0);
		}
	}, delay);
}

function descargarArchivo(i){
	$.ajax(
    	{
        	url : urlsFile[i][1],
			success : function (data) 
			{
				if (urlsFile.length == (i + 1)){
					files.push([urlsFile[i][0],data]);
					createZip();
				}
				else{
					files.push([urlsFile[i][0],data]);
					descargarArchivo(i +1);
				}
			}
		}
	);
}

function createZip(){
	let zip = new JSZip();
	
	while (files.length > 0){
		var aux = files.pop();
		zip.file(aux[0], aux[1]);
	}
	
	// Genera el archivo zip de forma asíncrona

	zip.generateAsync({type: "blob", binary : true, compression: "DEFLATE"})
		.then(function(content) {

	    // Descargar el archivo Zip
			var hoy = new Date();
			var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
			var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
			

			saveAs(content, "reporte" + fecha + "_" + hora + ".zip");

	});
	
}

function isJsonParsable(value) {
	try {
		JSON.parse(value);
	} catch (e) {
		return false;
	}
	return true;
}

function saveToZip (filename, urls) {
    const zip = new JSZip()
    const folder = zip.folder(filename)
    urls.forEach((url)=> {
        const blobPromise = fetch(url).then(r => {
            if (r.status === 200) return r.blob()
            return Promise.reject(new Error(r.statusText))
        })
        const name = url.substring(url.lastIndexOf('/'))
        folder.file(name, blobPromise)
    })

    zip.generateAsync({type:"blob"})
        .then(blob => saveAs(blob, filename+".zip"))
        .catch(e => console.log(e));
}

function compareBoxExtent(box1, extent2){
	if (box1 != undefined){
		box1 = box1.substring(4,box1.length-1).replace(","," ");
		let extent1 = box1.split(" ");
		return compareExtents(extent1, extent2);
	}
	return false;
}

//retorna true si extent1 y extent2 tienen espacios en común
//en caso contrario retorna false
function compareExtents(extent1, extent2){
	const xmin1 = extent1[0];
	const ymin1 = extent1[1];
	const xmax1 = extent1[2];
	const ymax1 = extent1[3];
	
	const xmin2 = extent2[0];
	const ymin2 = extent2[1];
	const xmax2 = extent2[2];
	const ymax2 = extent2[3];
	
	if (xmin1 < xmin2 && xmax1 > xmin2){
		if (ymin1 < ymin2)
			return (ymax1 > ymin2);
		else
			return (ymin1 < ymax2);
	}
	
	if (xmin1 > xmin2 && xmin1 < xmax2){
		if (ymin1 < ymin2)
			return (ymax1 > ymin2);
		else
			return (ymin1 < ymax2);
	}
	
	return false;
}
