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
		animationSpeed: 5,
		lang: "en",
		initialLoadDelay: 10,
		key: "123456"
		
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		
        this.url = "https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=" + this.config.lang + "&key=" + this.config.key;
        this.scheduleUpdate();
    },

		getQuote: function() {
        this.sendSocketNotification('GET_QUOTE', this.url);
    },

      socketNotificationReceived: function(notification, payload) {
        if (notification === "QUOTE_RESULT") {
            this.processQuote(payload);
            /* if (this.rotateInterval == null) {
                this.scheduleCarousel();
            } */
        }
        this.updateDom(this.config.initialLoadDelay);
    },

	scheduleUpdate: function() {
        setInterval(() => {
            this.getQuote();
        }, this.config.updateInterval);
        this.getQuote(this.config.initialLoadDelay);
    },

     processQuote: function(data) {
        this.today = data.Today;
        this.quote = data;
		console.log(this.quote);
        this.loaded = true;
    },


	getDom: function() {


		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}else{
			// If this.dataRequest is not empty
			 var quote = this.quote;
		 
		 
			var wrapperData = document.createElement("div");
			
			var Quote = document.createElement("div");
			Quote.innerHTML = quote.quoteText;
			Quote.className = "bold xlarge bright align-left";
			
			var QuoteAuthor = document.createElement("div");
			QuoteAuthor.innerHTML = quote.quoteAuthor;
			QuoteAuthor.className = "regular medium normal align-right";
			
			var QuoteLink = document.createElement("div");
			QuoteLink.innerHTML = quote.quoteLink;
			QuoteLink.className = "thin xsmall dimmed align-right";
			
			wrapperData.appendChild(Quote);
			wrapperData.appendChild(QuoteAuthor);
			wrapperData.appendChild(QuoteLink);
			
			wrapper.appendChild(wrapperData);
		}
		return wrapper;
	}
	
});