var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var prettyjson = require('prettyjson');

var options = {
  noColor: true
};

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(util.format(d) + '\n\r\n\r');
  log_stdout.write(util.format(d) + '\n\r');
};

var getInfoType = function(data){

    var properties = ["body type","number of doors","designer","wheelbase","track/tread (front)","track/tread (rear)","length","width","height","ground clearance","length:wheelbase ratio","kerb weight","weight distribution","fuel tank capacity","drag coefficient","frontal area","cda","engine type","engine manufacturer","engine code","cylinders","capacity","bore/stroke ratio","maximum power output","specific output","maximum torque","specific torque","engine construction","sump","compression ratio","fuel system","bmep (brake mean effective pressure)","maximum rpm","crankshaft bearings","engine coolant","unitary capacity","aspiration","compressor","intercooler","catalytic converter","acceleration 0-80km/h (50mph)","acceleration 0-60mph","acceleration 0-100km/h","acceleration 0-160km/h (100mph)","standing quarter-mile","standing kilometre","maximum speed","power-to-weight ratio","weight-to-power ratio","fuel consumption","universal consumption (calculated from the above)","litres per 100km","km per litre","uk mpg","us mpg","carbon dioxide emissions","carfolio calculated ","ved band","Effizienz (DE)","engine position","engine layout","drive wheels","torque split","steering","turns lock-to-lock","turning circle","front suspension","rear suspension","wheel size front","wheel size rear","tyres front","tyres rear","brakes f/r","front brake diameter","rear brake diameter","gearbox","top gear ratio","final drive ratio"];
    var irrelevants = ["data","bodywork","dimensions & weights","aerodynamics","engine","performance","fuel consumption","chassis","general"];

    if (properties.indexOf(data.toLowerCase()) != -1){
        return "property";
    }
    else if (irrelevants.indexOf(data.toLowerCase()) != -1){
        return "irrelevant";
    }
    else {
        return "value";
    }

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

                                                var car = {};

                                                if ($('.Year')[0]){
                                                    car = {
                                                        make: make,
                                                        model: $('.model')[0].children[0].data,
                                                        year: $('.Year')[0].children[0].data
                                                    };
                                                }
                                                else {
                                                    car = {
                                                        make: make,
                                                        model: $('.model')[0].children[0].data,
                                                        year: $('.modelyear')[0].children[0].data
                                                    };
                                                }

                                                var info = [];

                                                $('th').each(function(index){
                                                    for (var i = 0; i < $(this)[0].parent.children.length; i++){
                                                        if ($(this)[0].parent.children[i].data && /\S/.test($(this)[0].parent.children[i].data)){
                                                            info.push($(this)[0].parent.children[i].data);
                                                        }
                                                        else if ($(this)[0].parent.children[i].children) {
                                                            for (var j = 0; j < $(this)[0].parent.children[i].children.length; j++){
                                                                if ($(this)[0].parent.children[i].children[j].data && /\S/.test($(this)[0].parent.children[i].children[j].data)){
                                                                    info.push($(this)[0].parent.children[i].children[j].data);
                                                                }
                                                                else if ($(this)[0].parent.children[i].children[j].children){
                                                                    for (var k = 0; k < $(this)[0].parent.children[i].children[j].children.length; k++){
                                                                        if ($(this)[0].parent.children[i].children[j].children[k].data && /\S/.test($(this)[0].parent.children[i].children[j].children[k].data)){
                                                                            info.push($(this)[0].parent.children[i].children[j].children[k].data);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return;
                                                });

                                                for (var i = 0; i < info.length; i++){
                                                    if (getInfoType(info[i]) == "property"){
                                                        if (getInfoType(info[i + 1]) == "value"){
                                                            car[info[i].replace(/\r/g, "").replace(/\n/g, "").toLowerCase()] = info[i + 1].replace(/\r/g, "").replace(/\n/g, "").toLowerCase();
                                                        }
                                                        else {
                                                            car[info[i].replace(/\r/g, "").replace(/\n/g, "").toLowerCase()] = "";
                                                        }
                                                    }
                                                }

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

                                                if (bore && stroke){
                                                   car["Bore x Stroke".toLowerCase()] = bore + " x " + stroke; 
                                                }
                                                else {
                                                    car["Bore x Stroke".toLowerCase()] = '';
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

var getModelsFromPage = function(page, callback){

    var models = [];

    request("http://www.carfolio.com/specifications/", function(err, response, html){

        if (err){

            console.log(err);
            return;

        }
        else {

            var $ = cheerio.load(html);

            var modelCount = 0;

            request("http://www.carfolio.com/specifications/" + page, function(err, response, html){

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

            request("http://www.carfolio.com/specifications/" + page, function(err, response, html){

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

                                    var car = {};

                                    if ($('.Year')[0]){
                                        car = {
                                            make: $('.manufacturer')[0].children[0].data,
                                            model: $('.model')[0].children[0].data,
                                            year: $('.Year')[0].children[0].data
                                        };
                                    }
                                    else {
                                        car = {
                                            make: $('.manufacturer')[0].children[0].data,
                                            model: $('.model')[0].children[0].data,
                                            year: $('.modelyear')[0].children[0].data
                                        };
                                    }

                                    var info = [];

                                    $('th').each(function(index){
                                        for (var i = 0; i < $(this)[0].parent.children.length; i++){
                                            if ($(this)[0].parent.children[i].data && /\S/.test($(this)[0].parent.children[i].data)){
                                                info.push($(this)[0].parent.children[i].data);
                                            }
                                            else if ($(this)[0].parent.children[i].children) {
                                                for (var j = 0; j < $(this)[0].parent.children[i].children.length; j++){
                                                    if ($(this)[0].parent.children[i].children[j].data && /\S/.test($(this)[0].parent.children[i].children[j].data)){
                                                        info.push($(this)[0].parent.children[i].children[j].data);
                                                    }
                                                    else if ($(this)[0].parent.children[i].children[j].children){
                                                        for (var k = 0; k < $(this)[0].parent.children[i].children[j].children.length; k++){
                                                            if ($(this)[0].parent.children[i].children[j].children[k].data && /\S/.test($(this)[0].parent.children[i].children[j].children[k].data)){
                                                                info.push($(this)[0].parent.children[i].children[j].children[k].data);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        return;
                                    });

                                    for (var i = 0; i < info.length; i++){
                                        if (getInfoType(info[i]) == "property"){
                                            if (getInfoType(info[i + 1]) == "value"){
                                                car[info[i].replace(/\r/g, "").replace(/\n/g, "").toLowerCase()] = info[i + 1].replace(/\r/g, "").replace(/\n/g, "").toLowerCase();
                                            }
                                            else {
                                                car[info[i].replace(/\r/g, "").replace(/\n/g, "").toLowerCase()] = "";
                                            }
                                        }
                                    }

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

                                    if (bore && stroke){
                                       car["Bore x Stroke".toLowerCase()] = bore + " x " + stroke; 
                                    }
                                    else {
                                        car["Bore x Stroke".toLowerCase()] = '';
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

    });

};

var getAllModels = function(callback){

    request("http://www.carfolio.com/specifications/", function(err, response, html){

        if (err){

            console.log(err);
            return;

        }
        else {

            var $ = cheerio.load(html);

            var models = [];

            $('.man').each(function(index){
                if (models.indexOf($(this)[0].children[0].children[0].data) == -1){
                    models.push($(this)[0].children[0].children[0].data);
                }
            });

            callback(models);

        }

    });


};

// getAllModels(function(models){
    
// });

// var makeToGetModelsFor = "Ace";

// getModelsOfMake(makeToGetModelsFor, function(models){
//     try {
//        fs.mkdirSync(__dirname + "/Automobiles"); 
//     }
//     catch (e){

//     }
//     try {
//        fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "")); 
//     }
//     catch (e){
        
//     }
//     for (var i = 0; i < models.length; i++){
//         try {
//            fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].model.replace(/\//g, "").replace(/\\/g, "")); 
//         }
//         catch (e){

//         }
//         fs.writeFileSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].model.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].year + ".json", prettyjson.render(JSON.stringify(models[i]), options));
//     }
// });

// var pageToGetModelsFor = "models/?man=6916";
// var makeToGetModelsFor = "Adams";

// getModelsFromPage(pageToGetModelsFor, function(models){
//     try {
//        fs.mkdirSync(__dirname + "/Automobiles"); 
//     }
//     catch (e){

//     }
//     try {
//        fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "")); 
//     }
//     catch (e){
        
//     }
//     for (var i = 0; i < models.length; i++){
//         try {
//            fs.mkdirSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].model.replace(/\//g, "").replace(/\\/g, "")); 
//         }
//         catch (e){

//         }
//         fs.writeFileSync(__dirname + "/Automobiles/" + makeToGetModelsFor.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].model.replace(/\//g, "").replace(/\\/g, "") + "/" + models[i].year + ".json", prettyjson.render(JSON.stringify(models[i]), options));
//     }
// });