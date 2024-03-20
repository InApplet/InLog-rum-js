(function () {

    // se o host for igual a http://learn1.inapplet.com:3000
    if (window.location.hostname == 'learn1.inapplet.com') {
        window.inlog_rum_host = "http://learn1.inapplet.com:3000"
    } else {
        window.inlog_rum_host = "https://receiver.rum.inlog.inapplet.com"
    }

    async function getIP2() {
        let response = await fetch('https://freeipapi.com/api/json/')
        let data = response.status === 200 ? response.json() : false
        return data;
    }

    async function getIP1() {
        let response = await fetch('https://ipapi.co/json/')
        let data = response.status === 200 ? response.json() : false
        return data;
    }

    async function loadCountry() {
        let data_res = {}
        let data1 = await getIP1()

        if (data1 != false) {
            return data1['country_code']
        }

        let data2 = await getIP2()

        if (data2 != false) {
            return data2['countryCode']
        }

        return false
    }

    let rum = {}

    async function loadData() {

        rum['domain'] = window.location.hostname
        let path = window.location.pathname.replace(/\/$/, '')
        if (path == '') {
            path = '/'
        }
        rum['path'] = path;

        try {
            rum['memory_used_mb'] = window.performance.memory.usedJSHeapSize / 1024 / 1024
            rum['memory_used_mb'] = parseFloat(rum['memory_used_mb'].toFixed(2));
        } catch (error) { }

        const paintTimings = performance.getEntriesByType('paint');
        for (const pt of paintTimings) {
            let pt_name = pt.name.replace('-', '_')
            pt_name = pt_name.replace('-', '_')
            rum[pt_name] = parseFloat(pt.startTime.toFixed(2));
        }

        let country = await loadCountry()

        if (country != false) {
            rum['country'] = country
        }

        // https://developer.mozilla.org/en-US/docs/Web/Performance/Navigation_and_resource_timings
        performance.getEntriesByType("navigation").forEach((navigation) => {

            rum['redirect_time'] = navigation.redirectEnd - navigation.redirectStart;
            rum['dns_time'] = navigation.domainLookupEnd - navigation.domainLookupStart;
            rum['tcp_time'] = navigation.connectEnd - navigation.connectStart;
            rum['ssl_time'] = navigation.requestStart - navigation.secureConnectionStart;
            rum['ttfb_time'] = navigation.responseStart - navigation.requestStart;
            rum['response_time'] = navigation.responseEnd - navigation.responseStart;
            rum['dom_time'] = navigation.domComplete - navigation.domInteractive;
            rum['window_load_time'] = navigation.loadEventEnd - navigation.loadEventStart;
            rum['content_transfer_size'] = navigation.transferSize / 1024;
            rum['content_decoded_size'] = navigation.decodedBodySize / 1024;
            rum['content_encoded_ratio'] = 1 - navigation.transferSize / navigation.decodedBodySize;

            rum['redirect_time'] = parseFloat(rum['redirect_time'].toFixed(2));
            rum['dns_time'] = parseFloat(rum['dns_time'].toFixed(2));
            rum['tcp_time'] = parseFloat(rum['tcp_time'].toFixed(2));
            rum['ssl_time'] = parseFloat(rum['ssl_time'].toFixed(2));
            rum['ttfb_time'] = parseFloat(rum['ttfb_time'].toFixed(2));
            rum['response_time'] = parseFloat(rum['response_time'].toFixed(2));
            rum['dom_time'] = parseFloat(rum['dom_time'].toFixed(2));
            rum['window_load_time'] = parseFloat(rum['window_load_time'].toFixed(2));
            rum['content_transfer_size'] = parseFloat(rum['content_transfer_size'].toFixed(4));
            rum['content_decoded_size'] = parseFloat(rum['content_decoded_size'].toFixed(4));
            rum['content_encoded_ratio'] = parseFloat(rum['content_encoded_ratio'].toFixed(4));

            let data = {}

            data = rum

            var endpoint = inlog_rum_host + '/v1/log/?project_id=' + window.inlog_project_id;
            var blob = new Blob([JSON.stringify(data)], { type: 'application/json; charset=UTF-8' });
            navigator.sendBeacon(endpoint, blob);
        });
    }

    function deviceType() {
        if (screen.width >= 1200) {
            return 3 // desktop
        } else if (screen.width < 768) {
            return 1 // mobile
        } else {
            return 2 // tablet
        }
    }

    var parser = new UAParser();
    let browser = parser.getBrowser();
    rum['browser_name'] = browser.name;
    rum['browser_version'] = browser.major;

    let os = parser.getOS();
    rum['os_name'] = os.name;
    rum['os_version'] = os.version;

    rum['device_type'] = deviceType()

    function showFID(data) {
        sendVitals(1, data.value)
    }

    function showLCP(data) {
        sendVitals(2, data.value)
    }

    function showCLS(data) {
        sendVitals(3, data.value)
    }

    function sendVitals(metric_id, value) {

        let data = {}
        data['metric_id'] = metric_id
        data['value'] = value
        data['domain'] = window.location.hostname

        let path = window.location.pathname.replace(/\/$/, '')
        if (path == '') {
            path = '/'
        }
        data['path'] = path;

        var endpoint = inlog_rum_host + '/v1/vitals/?project_id=' + window.inlog_project_id;
        var blob = new Blob([JSON.stringify(data)], { type: 'application/json; charset=UTF-8' });
        navigator.sendBeacon(endpoint, blob);
    }

    if (browser.name == 'Chrome') {
        webVitals.onCLS(showCLS);
        webVitals.onFID(showFID);
        webVitals.onLCP(showLCP);
    }

    if (document.readyState === 'complete') {
        loadData()
    } else {
        window.addEventListener('load', (event) => {
            setTimeout(() => {
                loadData()
            }, 0)
        })
    }
})();