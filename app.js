var express = require('express');
var mongoose = require('mongoose');
var request = require("request");
var bodyParser  = require("body-parser");
var cron = require('node-cron');
var app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/portfolio_app_develop", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

var coinSchema = new mongoose.Schema({
  _id: Object,
  id: String,
  name: String,
  symbol: String,
  rank: Number,
  price_usd: Number,
  price_btc: Number,
  volume_usd_24h: Number,
  volume_btc_24h: Number,
  market_cap_usd: Number,
  market_cap_btc: Number,
  available_supply: Number,
  total_supply: Number,
  percent_change_1h: Number,
  percent_change_24h: Number,
  percent_change_7d: Number,
  last_updated: {type: Date}
});

var Coin = mongoose.model("Coin", coinSchema);
// var NewCoin = new Coin;

var options = {
  url: 'https://api.coinmarketcap.com/v1/ticker/',
  method: 'GET'
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    for (index = 0; index < info.length; ++index) {
      Coin.findOneAndUpdate({id:info[index].id}, info[index], {upsert: true, new: true, setDefaultsOnInsert: true}, function() {});
    }
  };
};

app.get("/", function(req, res){
  res.render("index");
})

app.get("/market", function(req, res){
  Coin.find({},function(err, allCoins) {
    if(err){
      console.log(err);
    } else {
      res.render("market", {coins: allCoins});
    }
  })
})

// request(options, callback);

cron.schedule('* * * * *', function(){
  console.log('running a task every minute');
  request(options, callback);
});

app.listen(3000, function(){
  console.log("Server has started!!!");
});
