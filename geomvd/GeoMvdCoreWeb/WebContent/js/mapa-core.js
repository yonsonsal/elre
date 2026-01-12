let that = this;

window.onload = function () {
    $(document).ready(function () {
        let map = document.querySelector("wc-map");
        map.addEventListener('WCMapSingleClick', that.WCMapSingleClick);
    }, false);
};

function WCMapSingleClick(e) {
	console.log("[mapa-core.js] - WCMapSingleClick | e.detail: " + e.detail);
}

// jquery extend function
$.extend({
    redirectPost: function (location, args) {
        var form = '';
        $.each(args, function (key, value) {
            form += '<input type="hidden" name="' + key + '" value="' + value + '"/>';
        });
        $('<form action="' + location + '" method="POST">' + form + '</form>').appendTo($(document.body)).submit();
    }
});
