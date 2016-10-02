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

var getModelsOfMake = function(make){

    request("http://www.carfolio.com/specifications/", function(err, response, html){

        if (err){

            console.log(err);
            return;

        }
        else {

            var $ = cheerio.load(html);

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

                                                $('th').each(function(index){
                                                    if ($(this)[0].children[0]){
                                                        if ($(this)[0].children[0].data && /\S/.test($(this)[0].children[0].data)){
                                                            console.log($('title')[0].children[0].data);
                                                            console.log($(this)[0].children[0].data);
                                                            if (!$(this)[0].parent.children[2]){
                                                                console.log($(this)[0].parent.children[1].children[0].data);
                                                            }
                                                            else if (!$(this)[0].parent.children[2].children){
                                                                //console.log("1");
                                                                if (!$(this)[0].parent.children[3]){
                                                                    //console.log("o");
                                                                    console.log(!$(this)[0].parent.children);
                                                                }
                                                                else if (!$(this)[0].parent.children[3].children[0]){
                                                                    //console.log("n");
                                                                    //console.log($(this)[0].parent.children);
                                                                    console.log("");
                                                                }
                                                                else {
                                                                    //console.log("e");
                                                                    console.log($(this)[0].parent.children[3].children[0].data);
                                                                }
                                                            }
                                                            else if (!$(this)[0].parent.children[2].children[0]){
                                                                //console.log("2");
                                                                console.log("");
                                                                //console.log($(this)[0].parent.children[2]);
                                                            }
                                                            else {
                                                                console.log($(this)[0].parent.children[2].children[0].data);
                                                            }
                                                        }
                                                        else {
                                                            if ($(this)[0].children[0].name == 'strong' && $(this)[0].children[0].children[0]){
                                                                console.log($(this)[0].children[0].children[0].data);
                                                                console.log($(this)[0].parent.children[3].children[0].children[0].data);
                                                            }
                                                        }
                                                    }
                                                });
                                                
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

getModelsOfMake("W Motors");