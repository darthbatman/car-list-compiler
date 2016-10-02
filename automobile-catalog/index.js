var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
//Make -> Model -> Submodel -> Year -> Trim -> Specs and Image
var getAllMakes = function(callback){
	var options = {
		url: "http://www.automobile-catalog.com/auta_sp_browse_2.php",
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
		}
	}
	request(options, function(err, response, html){

		if (err){

            callback (err);

        }
        else {

        	var makes = [];
        	var $ = cheerio.load(html);
        	$('a').each(function(index){
        		if ($(this)[0].attribs.href) {
	        		if ($(this)[0].attribs.href.indexOf("list-") != -1){
	        			makes.push({
	        				make: $(this)[0].children[0].children[0].data,
	        				url: "http://www.automobile-catalog.com/" + $(this)[0].attribs.href
	        			});
	        		}
	        	}
	        });
        	callback(null, makes);

        }

    });
};

// getAllMakes(function(err, makes){
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(makes);
// 	}
// });

var getModels = function(makeURL, callback){
	var options = {
		url: makeURL,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
		}
	}
	request(options, function(err, response, html){

		if (err){

	        callback(err);

	    }
	    else {

	    	var models = [];
	    	var links = [];
	    	var names = [];
	    	var $ = cheerio.load(html);
	    	
	    	$('form').each(function(index){
        		if ($(this)[0].attribs.action.indexOf("/model/") != -1) {
        			links.push("http://www.automobile-catalog.com" + $(this)[0].attribs.action); //link for model
	        	}
	        });
	    	$('font').each(function(index){
        		if ($(this)[0].children.length == 3) {
        			names.push($(this)[0].children[0].data); //name of model
	        	}
	        });

	        for (var i = 0; i < links.length; i++){
	        	models.push({
	        		model: names[i],
	        		url: links[i]
	        	});
	        	if (i == links.length - 1){
	        		callback(null, models);
	        	}
	        }
	    }

	});
};

// getModels("http://www.automobile-catalog.com/list-abarth.html", function(err, models){
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(models);
// 	}
// });

var getSubmodels = function(modelURL, callback){
	var options = {
		url: modelURL,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
		}
	}
	request(options, function(err, response, html){

		if (err){

            callback (err);

        }
        else {

        	var submodels = [];
        	var $ = cheerio.load(html);
        	$('a').each(function(index){
        		if ($(this)[0].attribs.href.indexOf("make/") != -1){
        			if ($(this)[0].children[0].children[0]){
        				if ($(this)[0].children[0].children[0].children[0].data.indexOf("specs review") != -1){
        					submodels.push({
        						name: $(this)[0].children[0].children[0].children[0].data,
        						url: "http://www.automobile-catalog.com" + $(this)[0].attribs.href
        					});
        				}
        			}
        		}
	        });
        	callback(null, submodels);

        }

    });
};

// getSubmodels("http://www.automobile-catalog.com/model/dodge/challenger_3gen.html", function(err, submodels){
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(submodels);
// 	}
// });

var getTrims = function(modelURL, callback){
	var options = {
		url: modelURL,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
		}
	}
	request(options, function(err, response, html){

		if (err){

            callback (err);

        }
        else {

        	var trims = [];
        	var $ = cheerio.load(html);
        	fs.writeFile("index.html", html);
        	$('a').each(function(index){
        		if ($(this)[0].attribs.href.indexOf("car/") != -1){
        			if ($(this)[0].children[0]){
        				if ($(this)[0].children[0].children[0]){
        					if(!$(this)[0].parent.children[0].data){
        						if($(this)[0].children[0].children[0].data){
	        						trims.push({
	        							year: $(this)[0].children[0].children[0].data.split(" ")[0],
	        							trim: $(this)[0].children[0].children[0].data.substring(5),
	        							url: "http://www.automobile-catalog.com" + $(this)[0].attribs.href
	        						});
        						}
        					}
        				}
        			}
        		}
	        });
        	callback(null, trims);

        }

    });
};

// getTrims("http://www.automobile-catalog.com/make/dodge/challenger_3gen/challenger_3gen_se_coupe/2014.html", function(err, trims){
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(trims);
// 	}
// });

getModels("http://www.automobile-catalog.com/list-ac.html", function(err, models){
	if (err){
		console.log(err);
	}
	else {
		if (!fs.existsSync(__dirname + "/" + "AC")) {
		    fs.mkdirSync(__dirname + "/" + "AC");
		}
		for (var i = 0; i < models.length; i++){
			getSubmodels(models[i].url, function(err, submodels){
				if (err){
					console.log(err);
				}
				else {
					for (var j = 0; j < submodels.length; j++){
						getTrims(submodels[j].url, function(err, trims){
							if (err){
								console.log(err);
							}
							else {
								for (var k = 0; k < trims.length; k++){
									console.log(trims[k]);
									if (!fs.existsSync(__dirname + "/" + "AC" + "/" + trims[k].trim.replace(/\//g, " ").replace(/\\/g, " "))) {
									    fs.mkdirSync(__dirname + "/" + "AC" + "/" + trims[k].trim.replace(/\//g, " ").replace(/\\/g, " "));
									}
									if (!fs.existsSync(__dirname + "/" + "AC" + "/" + trims[k].trim.replace(/\//g, " ").replace(/\\/g, " ") + "/" + trims[k].year)) {
									    fs.mkdirSync(__dirname + "/" + "AC" + "/" + trims[k].trim.replace(/\//g, " ").replace(/\\/g, " ") + "/" + trims[k].year);
									}
								}
							}
						});
					}
				}
			});
		}
	}
});