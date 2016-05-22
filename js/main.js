var flagConsole = false,
    battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
    interval, canvas, context, clockRadius,
    step_ts = 0,
    thirtyCheck = 0,
    currentDate = '0',
    tz1 = 'US/Pacific', 
    tz1abbr = 'PDT',
    tz2 = 'Asia/Tokyo',
    tz2abbr = 'JST',
    timeOffset = 0, 
    tz1_24h = '12',
    tz2_24h = '12',
    tempDisplay = 'Fahrenheit',
    accentColor = '#BDE52A',
    weatherAPI = 'api-key-from-wu';

function loadWeatherData() {
	var options = {
			enableHighAccuracy : true,
			maximumAge : 0,
			timeout : 50000 },
		temperature, wword, xmlhttp, xmlDoc,
		str_weather = document.getElementById('weather'),
		str_wword = document.getElementById('weather_word'),
		XML_BASE = "http://api.wunderground.com/api/",
		XML_ADDRESS;
	
	function successCallback(position) {
		XML_ADDRESS = XML_BASE + weatherAPI + "/conditions/q/" + position.coords.latitude + "," + position.coords.longitude + ".xml";
		//alert(position.coords.latitude + " and " + position.coords.longitude);
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", XML_ADDRESS, false);
		
		xmlhttp.onreadystatechange = function() {
		    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		        xmlDoc = xmlhttp.responseXML;
		        if (tempDisplay == 'Celsius') {
		            temperature = xmlDoc.getElementsByTagName('temp_c')[0].childNodes[0].nodeValue;
		            temperature = Math.round(temperature) + "°C";
		        } else {
		            temperature = xmlDoc.getElementsByTagName('temp_f')[0].childNodes[0].nodeValue;
		            temperature = Math.round(temperature) + "°F";		        	
		        }
	            localStorage.setItem('com.dendriticspine.awatch.temp', temperature);
	            wword = xmlDoc.getElementsByTagName('weather')[0].childNodes[0].nodeValue;
	            localStorage.setItem('com.dendriticspine.awatch.weather', wword);
	            str_wword.innerHTML = wword;
	            str_weather.innerHTML = temperature;
		        xmlhttp = null;
		    }
		};
		xmlhttp.send(); 
	}
	function failureCallback(error) {
		temperature = localStorage['com.dendriticspine.awatch.temp'];
		wword = localStorage['com.dendriticspine.awatch.wword'];
        str_wword.innerHTML = wword;
        str_weather.innerHTML = temperature;
	}
	if (weatherAPI == 'api-key-from-wu') {
        str_wword.innerHTML = 'at sky.';
        str_weather.innerHTML = 'Look';
	} else {
		navigator.geolocation.getCurrentPosition(successCallback, failureCallback, options);
	}
}

function settingsFromFile() {
	var file, awatchSettings;
	function onsuccess(dir) {
		file = dir.resolve('awatchdata.txt');
 		if (file.isDirectory === false) {
			file.readAsText(
			function(str) { 
				awatchSettings = str.split(",");
				tz1 = awatchSettings[0];
				tz2 = awatchSettings[1];
				timeOffset = awatchSettings[2];
				accentColor = awatchSettings[3];
				weatherAPI = awatchSettings[4];
				tz1abbr = awatchSettings[5];
				tz2abbr = awatchSettings[6];
				if (awatchSettings.length == 10) {
					tz1_24h = awatchSettings[7];
					tz2_24h = awatchSettings[8];
					tempDisplay = awatchSettings[9];
				}
			    document.getElementById('str_tz').innerHTML = tz1abbr;
			    document.getElementById('tz2_tz').innerHTML = tz2abbr;
			    document.getElementById('battery_rec').style.color = accentColor;
			    document.getElementById('weather').style.color = accentColor;
			    document.getElementById('weather_word').style.color = accentColor;
			    loadWeatherData();
			}, null, 'UTF-8' );
		}
	}
	tizen.filesystem.resolve('documents', onsuccess, null, 'r');
}

function updateTime() {
    var date;
    date = tizen.time.getCurrentDateTime().toTimezone(tz1);
    date.setMinutes(date.getMinutes() + parseInt(timeOffset,10));
    if (date.getMinutes() <= 30 && thirtyCheck !== 1) {
    	loadWeatherData();
    	thirtyCheck = 1;
    }
    if (date.getMinutes() > 31) {
    	thirtyCheck = 0;
    }
    if (date.getDate() != currentDate) {
	//if (date.getHours() == 23 && date.getMinutes() >= 58) {
	    localStorage.setItem('com.dendriticspine.awatch.stepcount', step_ts);
	    currentDate = date.getDate();
	}
    return date;
}

function displayWeekDay(date) {
    var str_day = document.getElementById('str_day'),
        get_day = date.getDay(),
        str_allday,
        arr_day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        arr_month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 
        get_date = date.getDate(),
        month = date.getMonth();

    str_allday = arr_day[get_day] + ', ' + arr_month[month] + ' ' + get_date;
    str_day.innerHTML = str_allday;
}

function displayWeekDay2(date2) {
    var tz2_day = document.getElementById('tz2_day'),
        get_day2 = date2.getDay(),
        tz2_allday,
        arr_day2 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        get_date2 = date2.getDate(),
        month2 = date2.getMonth() + 1;

    tz2_allday = arr_day2[get_day2] + ' ' + month2 + '/' + get_date2;
    tz2_day.innerHTML = tz2_allday;
}

function displayTime() {
    var str_hours = document.getElementById('str_hours'),
        str_console = document.getElementById('str_console'),
        str_minutes = document.getElementById('str_minutes'),
        str_ampm = document.getElementById('str_ampm'),
        tz2_hour = document.getElementById('tz2_hour'),
        tz2_min = document.getElementById('tz2_min'),
        tz2_ampm = document.getElementById('tz2_ampm'),
        date, hours, date2, hours2, minutes;

    date = updateTime();
    //date = tizen.time.getCurrentDateTime();
    hours = date.getHours();
    minutes = date.getMinutes();
    date2 = date.toTimezone(tz2);
    hours2 = date2.getHours();
    
    if (minutes < 10) {
        str_minutes.innerHTML = '0' + minutes;
        tz2_min.innerHTML = '0' + minutes;
    } else {
    	str_minutes.innerHTML = minutes;
    	tz2_min.innerHTML = minutes;
    }
    
    if (tz1_24h == '12') {
	    if (hours > 12) {
	    	hours = hours - 12;
	    	str_hours.innerHTML = hours;
	    	str_ampm.innerHTML = 'PM';
	    } else if (hours == 12) {
	    	str_hours.innerHTML = hours;
	    	str_ampm.innerHTML = 'PM';
	    } else if (hours == 0) {
	    	str_hours.innerHTML = '12';
	    	str_ampm.innerHTML = 'AM';
	    } else {
	    	str_hours.innerHTML = hours;
	        str_ampm.innerHTML = 'AM';
	    } 
    } else {
    	str_ampm.innerHTML = '';
    	if (hours < 10) {
	    	str_hours.innerHTML = '0' + hours;
    	} else {
    		str_hours.innerHTML = hours;
    	}
    }
    
    if (tz2_24h == '12') {
	    if (hours2 > 12) {
	    	hours2 = hours2 - 12;
	    	tz2_hour.innerHTML = hours2;
	    	tz2_ampm.innerHTML = 'PM';
	    } else if (hours2 == 12) {
	    	tz2_hour.innerHTML = hours2;
	    	tz2_ampm.innerHTML = 'PM';
	    } else if (hours2 == 0) {
	    	tz2_hour.innerHTML = '12';
	    	tz2_ampm.innerHTML = 'AM';
	    } else {
	        tz2_ampm.innerHTML = 'AM';
	        tz2_hour.innerHTML = hours2;
	    }
    } else {
    	tz2_ampm.innerHTML = '';
    	if (hours2 < 10) {
    		tz2_hour.innerHTML = '0' + hours2;
    	} else {
    		tz2_hour.innerHTML = hours2;
    	}
    }

    displayWeekDay(date);
    displayWeekDay2(date2);
    
    if (flagConsole) {
        str_console.style.visibility = 'visible';
        flagConsole = false;
    } else {
        str_console.style.visibility = 'hidden';
        flagConsole = true;
    }
}

function initDigitalWatch() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	interval = setInterval(displayTime, 500);
}

function renderAmbientDots() {
    context.save();
    // Assigns the clock creation location in the middle of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);
    context.beginPath();		// Render center dot
    context.fillStyle = '#000000';
    context.strokeStyle = '#c8c6c8';
    context.lineWidth = 4;
    context.arc(0, 0, 7, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
    context.closePath();
}

function renderNeedle(angle, radius) {
    context.save();
    context.rotate(angle);
    context.beginPath();
    context.lineWidth = 4;
    context.strokeStyle = '#c8c6c8';
    context.moveTo(6, 0);
    context.lineTo(radius, 0);
    context.closePath();
    context.stroke();
    context.closePath();
    context.restore();
}

function ambientDigitalWatch() {
    clearInterval(interval);
    
    var angleH, radiusH, angleM, radiusM, dtstring,
    	date, hours, minutes, seconds, hour, minute, day,
        full_day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    	date = updateTime();
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();
        hour = hours + minutes / 60;
        minute = minutes + seconds / 60;
        day = date.getDay();
        dtstring = (date.getMonth()+1) + '.' + date.getDate() + '.' + date.getFullYear();
    
    // Erase the previous time
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    renderAmbientDots();
    
    //renderHourNeedle(hour);
    angleH = (hour - 3) * (Math.PI * 2) / 12;
    radiusH = clockRadius * 0.55;
    renderNeedle(angleH, radiusH);
    
    //renderMinuteNeedle(minute);
    angleM = (minute - 15) * (Math.PI * 2) / 60;
    radiusM = clockRadius * 0.75;
    renderNeedle(angleM, radiusM);
    
    context.restore();
    context.font = '25px Courier';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#c8c6c8';
    context.fillText(dtstring, clockRadius, clockRadius + (clockRadius * 0.7));
    context.fillText(full_day[day], clockRadius, clockRadius + (clockRadius * 0.5));
}

function getBatteryState() {
    var battery_level = Math.floor(battery.level * 100),
    	battery_rec = document.getElementById('battery_rec'),
    	battery_fill = document.getElementById('battery_fill'); 
    battery_rec.innerHTML = battery_level + '%';
    battery_fill.style.width = 20*(battery_level/100) + 'px';    
}

function onStepChange(pedometerInfo) {
	var str_sdist = document.getElementById('step_dist'), step_diff;
	step_diff = localStorage['com.dendriticspine.awatch.stepcount'];
	step_ts = pedometerInfo.accumulativeTotalStepCount;
	if (step_diff == 0) {
		localStorage.setItem('com.dendriticspine.awatch.stepcount', step_ts);
		step_diff = step_ts;
	}
	str_sdist.innerHTML = (step_ts - step_diff);
}

function bindEvents() {
	tizen.humanactivitymonitor.setAccumulativePedometerListener(onStepChange);
    battery.addEventListener('chargingchange', getBatteryState);
    battery.addEventListener('chargingtimechange', getBatteryState);
    battery.addEventListener('dischargingtimechange', getBatteryState);
    battery.addEventListener('levelchange', getBatteryState);

    // add eventListener for ambient mode changed
    window.addEventListener('ambientmodechanged', function(e) {
        if (e.detail.ambientMode === true) {
        	document.getElementById('live_watch').style.visibility = 'hidden';
        	document.getElementById('str_console').style.visibility = 'hidden';
            ambientDigitalWatch();
        } else {
            initDigitalWatch();
        	document.getElementById('live_watch').style.visibility = 'visible';
        }
    }); 
    
    // add eventListener for time tick (occurs once/min)
    window.addEventListener('timetick', function() { ambientDigitalWatch(); });
}

window.onload = function() {
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === 'back') {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });
    
    settingsFromFile();
    canvas = document.querySelector("#myCanvas");
    context = canvas.getContext('2d');
    clockRadius = document.body.clientWidth / 2;
    canvas.width = document.body.clientWidth;
    canvas.height = canvas.width;
    localStorage.setItem('com.dendriticspine.awatch.stepcount', 0);
    localStorage.setItem('com.dendriticspine.awatch.temp', 0);
    localStorage.setItem('com.dendriticspine.awatch.weather', Error);
    initDigitalWatch();
    bindEvents();
    getBatteryState();
};
