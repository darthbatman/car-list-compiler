var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n\r\n\r');
  log_stdout.write(util.format(d) + '\n\r');
};

var getModelsOfMake = function(make, callback){

    var models = [];

    request("http://www.carfolio.com/specifications/", function(err, response, html){

        if (err){

            console.log(err);
            return;

        }
        else {

            var $ = cheerio.load(html);

            var modelCount = 0;

            $('.man').each(function(index){
                if ($(this)[0].attribs.href.indexOf("models/") != -1){
                    if ($(this)[0].children[0].children[0].data == make){
                        request("http://www.carfolio.com/specifications/" + $(this)[0].attribs.href, function(err, response, html){

                            if (err){

                                console.log(err);
                                return;

                            }
                            else {

                                var $ = cheerio.load(html);

                                $('a').each(function(index){
                                    if ($(this)[0].attribs.href.indexOf("car/") != -1 && $(this)[0].attribs.href.indexOf("specifications/") == -1){
                                        modelCount++;
                                    }
                                });

                            }

                        });
                    }
                }
            });

            $('.man').each(function(index){
                if ($(this)[0].attribs.href.indexOf("models/") != -1){
                    if ($(this)[0].children[0].children[0].data == make){
                        request("http://www.carfolio.com/specifications/" + $(this)[0].attribs.href, function(err, response, html){

                            if (err){

                                console.log(err);
                                return;

                            }
                            else {

                                var $ = cheerio.load(html);

                                $('a').each(function(index){
                                    if ($(this)[0].attribs.href.indexOf("car/") != -1 && $(this)[0].attribs.href.indexOf("specifications/") == -1){
                                        request("http://www.carfolio.com/specifications/models/" + $(this)[0].attribs.href, function(err, response, html){

                                            if (err){

                                                console.log(err);
                                                return;

                                            }
                                            else {

                                                var $ = cheerio.load(html);

                                                var car = {
                                                    make: make,
                                                    model: $('.model')[0].children[0].data,
                                                    year: $('.Year')[0].children[0].data
                                                };

                                                $('th').each(function(index){
                                                    if ($(this)[0].children[0]){
                                                        if ($(this)[0].children[0].data && /\S/.test($(this)[0].children[0].data)){
                                                            //console.log($(this)[0].children[0].data);
                                                            if (!$(this)[0].parent.children[2]){
                                                                car[$(this)[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[1].children[0].data;
                                                                //console.log($(this)[0].parent.children[1].children[0].data);
                                                            }
                                                            else if (!$(this)[0].parent.children[2].children){
                                                                if (!$(this)[0].parent.children[3]){
                                                                    car[$(this)[0].children[0].data.toLowerCase()] = "";
                                                                    //console.log("");
                                                                }
                                                                else if (!$(this)[0].parent.children[3].children[0]){
                                                                    car[$(this)[0].children[0].data.toLowerCase()] = "";
                                                                    //console.log("");
                                                                }
                                                                else {
                                                                    if ($(this)[0].children[0].data.toLowerCase().indexOf("kerb weight") != -1){
                                                                        car[$(this)[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[3].children[0].children[0].data;
                                                                        //console.log($(this)[0].parent.children[3].children[0].children[0].data);
                                                                    }
                                                                    else {
                                                                        if ($(this)[0].children[0].data.toLowerCase().indexOf("stroke ratio") != -1){
                                                                            car[$(this)[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[3].children[0].children[0].data;
                                                                            //console.log($(this)[0].parent.children[3].children[0].children[0].data);
                                                                        }
                                                                        else {
                                                                            car[$(this)[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[3].children[0].data;
                                                                            //console.log($(this)[0].parent.children[3].children[0].data);
                                                                        }  
                                                                    }
                                                                }
                                                            }
                                                            else if (!$(this)[0].parent.children[2].children[0]){
                                                                car[$(this)[0].children[0].data.toLowerCase()] = "";
                                                                //console.log("");
                                                            }
                                                            else {
                                                                car[$(this)[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[2].children[0].data;
                                                                //console.log($(this)[0].parent.children[2].children[0].data);
                                                            }
                                                        }
                                                        else {
                                                            if ($(this)[0].children[0].name == 'strong' && $(this)[0].children[0].children[0]){
                                                                //console.log($(this)[0].children[0].children[0].data);
                                                                if (!$(this)[0].parent.children[3].children[0].children){
                                                                    car[$(this)[0].children[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[3].children[0].data;
                                                                    //console.log($(this)[0].parent.children[3].children[0].data);
                                                                }
                                                                else if (!$(this)[0].parent.children[3].children[0].children[0]){
                                                                    car[$(this)[0].children[0].children[0].data.toLowerCase()] = "";
                                                                    //console.log("");
                                                                }
                                                                else {
                                                                    car[$(this)[0].children[0].children[0].data.toLowerCase()] = $(this)[0].parent.children[3].children[0].children[0].data;
                                                                    //console.log($(this)[0].parent.children[3].children[0].children[0].data);
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                    
                                                //console.log("Bore x Stroke");
                                                var bore = undefined;
                                                var stroke = undefined;
                                                $('a').each(function(index){
                                                    if ($(this)[0].attribs.href.indexOf("bore") != -1){
                                                        if (!bore){
                                                            bore = $(this)[0].attribs.href.substring($(this)[0].attribs.href.lastIndexOf("=") + 1);
                                                        }
                                                        else {
                                                            stroke = $(this)[0].attribs.href.substring($(this)[0].attribs.href.lastIndexOf("=") + 1);
                                                        }
                                                    }
                                                });
                                                //console.log(bore + " x " + stroke);
                                                if (bore && stroke){
                                                   car["Bore x Stroke".toLowerCase()] = bore + " x " + stroke; 
                                                }
                                                else {
                                                    car["Bore x Stroke".toLowerCase()] = '';
                                                }
                                                for (var key in car) {
                                                  if (car.hasOwnProperty(key)) {
                                                    if (key == 'carfolio.com id' || key == 'carfolio calculated ' || key == 'production total' || key == 'model code' || key == 'model family' || key == 'rac rating' || key == 'insurance classification' || key == 'tax band'){
                                                        delete car[key];
                                                    }
                                                    else if (!car[key]){
                                                        car[key] = '';
                                                    }
                                                    else {
                                                        car[key] = car[key].replace(/\n/g, "");
                                                    }
                                                  }
                                                }
                                                models.push(car);
                                                if (models.length == modelCount){
                                                    callback (models);
                                                }
                                                
                                            }

                                        });
                                    }
                                });
                                
                            }

                        });
                    }
                }
            });
            
        }

    });

};

var makeToGetModelsFor = "Ferrari";

getModelsOfMake(makeToGetModelsFor, function(models){
    try {
       fs.mkdirSync(__dirname + "/Automobiles"); 
    }
    catch (e){

    }
    try {
       fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor); 
    }
    catch (e){
        
    }
    for (var i = 0; i < models.length; i++){
        try {
           fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor + "/" + models[i].model); 
        }
        catch (e){
            
        }
        fs.writeFileSync(__dirname + "/Automobiles/" + makeToGetModelsFor + "/" + models[i].model + "/" + models[i].year + ".json", JSON.stringify(models[i]));
    }
});