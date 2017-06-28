/* global Module */

/* Magic Mirror
 * Module: MMM-Forismatic-Quotes
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-Forismatic-Quotes", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000,
		animationSpeed: 5000,
		lang: "en",
		key: 123456,
		apiURL: "http://api.forismatic.com/api/1.0/"
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;
		
		var urlApi = this.config.apiURL + "?method=getQuote&format=json&lang=" + this.config.lang + "&key=" + this.config.key;

		var retry = true;
		
		var str_key = self.config.key.toString();
		
		if (this.config.key.length() > 6) {
			Log.error(self.name, "Max key length is 6.");
		}
		
		if (this.config.lang != "en" || "ru") {
			Log.error(self.name, "Please enter a supported language into the config.");
		}

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader('User-Agent', 'Super Agent/0.0.1');
		dataRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			var wrapperDataRequest = document.createElement("div");
			
			var wrapperDataRequestQuote = document.createElement("div");
			wrapperDataRequestQuote.innerHTML = this.quoteText;
			wrapperDataRequestQuote.className = "bold xlarge bright align-left";
			
			var wrapperDataRequestAuthor = document.createElement("div");
			wrapperDataRequestAuthor.innerHTML = this.quoteAuthor;
			wrapperDataRequestAuthor.className = "regular medium normal align-right";
			
			var wrapperDataRequestLink = document.createElement("div");
			wrapperDataRequestLink.innerHTML = this.quoteLink;
			wrapperDataRequestLink.className = "thin xsmall dimmed align-right";
			
			wrapperDataRequest.appendChild(wrapperDataRequestQuote);
			wrapperDataRequest.appendChild(wrapperDataRequestAuthor);
			wrapperDataRequest.appendChild(wrapperDataRequestLink);
			
			wrapper.appendChild(wrapperDataRequest);
		}
		return wrapper;
	},

	processData: function (data) {
		
		if (!data || !data.quoteText) {
			// Did not receive usable new data.
			return;
		}
		
		this.quoteText = data.quoteText;
		this.quoteAuthor = data.quoteAuthor;
		this.quoteLink = data.quoteLink;
		
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},
});
