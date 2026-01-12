function getIdFiltroTurnosZonasRecorrido(turno) {
    let url = apiURL + "/servicedfr/turnos?turno=" + turno;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getIdFiltroViajesPlanificadosZonasRecorrido() {
    let url = apiURL + "/servicedfr/viajesPlanificados";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getCircuitosByMunicipio(municipio) {
    let url = apiURL + "/servicedfr/circuitosPorMunicipio?municipio=" + municipio;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getCircuitosPlanificadosByMunicipio(municipio) {
    let url = apiURL + "/servicedfr/circuitosPlanificadosPorMunicipio?municipio=" + municipio;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getMunicipiosParaRutasRecorridosPlanificados() {
    let url = apiURL + "/servicedfr/municipiosParaFiltroRutasRecorridoPlanificado";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getMunicipiosParaRutasRecorridos() {
    let url = apiURL + "/servicedfr/municipiosParaFiltroRutasRecorrido";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getTipoResiduoMobiliarioDecaux() {
    let url = apiURL + "/servicedfr/tiposResiduosParaFiltroMobiliarioDecaux";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getMunicipiosParaPosicionesRecorridos() {
    let url = apiURL + "/servicedfr/municipiosParaFiltroRutasRecorrido";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getCircuitosPosicionesRecorridoByMunicipio(municipio) {
    let url = apiURL + "/servicedfr/posicionesRecorridoPorMunicipio?municipio=" + municipio;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getMunicipiosParaPosicionesRecorridosHistorico() {
    let url = apiURL + "/servicedfr/municipiosParaFiltroPosicionesRecorridoHistorico";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getCircuitosPosicionesRecorridoHistoricoByMunicipio(municipio) {
    let url = apiURL + "/servicedfr/posicionesRecorridoHistoricoPorMunicipio?municipio=" + municipio;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            async: false,
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getCircuitosPlanif() {
    let url = apiURL + "/servicedfr/circuitosPlanificados";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}
