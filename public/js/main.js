(function (func) {
    var reports,
        tServices,
        tAlerts,
        tStatus,
        tStatusCount,
        statusData,
        sortedReports,
        blueCol,
        redCol,
        greenCol,
        yellowCol,
        purpleCol;

    func(window.jQuery, window, document);
})(function ($, window, document) {
    reports = data.service_reports;
    tServices = reports.length;
    tAlerts = data.total_alerts;
    tStatus = data.status;
    statusData = [];
    sortedReports = [];
    blueCol = "#1ca8dd";
    redCol = "#d73f70";
    yellowCol = "#f2e934";
    purpleCol = "#9f86ff";
    greenCol = "#59e3c2";

    // Get sum per status
    var jsonStatusData = {};
    var statusColors = { 200: blueCol, 500: greenCol, 501: redCol };
    reports.forEach(function (report) {
        if (!jsonStatusData.hasOwnProperty(report.status_code)) {
            jsonStatusData[report.status_code] = {};
            jsonStatusData[report.status_code]["status_code"] =
                report.status_code;
            jsonStatusData[report.status_code]["color"] =
                statusColors[report.status_code];
            jsonStatusData[report.status_code]["amount"] = 1;
        } else jsonStatusData[report.status_code]["amount"] += 1;
    });
    tStatusCount = jsonStatusData[tStatus].amount;
    statusData = jsonToArr(jsonStatusData);

    getSortedArray();

    function getSortedArray() {
        // Sort reports by host name alphabetically
        sortedReports[0] = reports.slice(0);
        sortedReports[0].sort(function (a, b) {
            var valA = a.host.name.toUpperCase();
            var valB = b.host.name.toUpperCase();
            return valA < valB ? -1 : valA > valB ? 1 : 0;
        });

        // Sort reports by alerts count
        sortedReports[1] = reports.slice(0);
        sortedReports[1].sort(function (a, b) {
            var valA = a.total_alerts;
            var valB = b.total_alerts;
            return valA > valB ? -1 : valA < valB ? 1 : 0;
        });

        // Sort reports by "service enabled"
        sortedReports[2] = reports.slice(0);
        sortedReports[2].sort(function (a, b) {
            var valA = a.host.enabled;
            var valB = b.host.enabled;
            return valA === valB ? 0 : valA ? -1 : 1;
        });

        // Sort reports by "jwt enabled"
        sortedReports[3] = reports.slice(0);
        sortedReports[3].sort(function (a, b) {
            var valA = a.host.auth_schema_jwt;
            var valB = b.host.auth_schema_jwt;
            return valA === valB ? 0 : valA ? -1 : 1;
        });

        // Sort reports by "oauth2 enabled"
        sortedReports[4] = reports.slice(0);
        sortedReports[4].sort(function (a, b) {
            var valA = a.host.auth_schema_oauth2;
            var valB = b.host.auth_schema_oauth2;
            return valA === valB ? 0 : valA ? -1 : 1;
        });

        // Sort reports by "block guest access"
        sortedReports[5] = reports.slice(0);
        sortedReports[5].sort(function (a, b) {
            var valA = a.host.block_guest_access;
            var valB = b.host.block_guest_access;
            return valA === valB ? 0 : valA ? -1 : 1;
        });

        // Sort reports by "firewall enabled"
        sortedReports[6] = reports.slice(0);
        sortedReports[6].sort(function (a, b) {
            var valA = a.host.options.waf_enabled;
            var valB = b.host.options.waf_enabled;
            return valA === valB ? 0 : valA ? -1 : 1;
        });
    }

    // Convert json to array
    function jsonToArr(jsonData) {
        var res = [];
        for (var element in jsonData) res.push(jsonData[element]);
        return res;
    }
});
