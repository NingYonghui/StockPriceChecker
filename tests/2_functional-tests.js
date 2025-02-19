const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite("5 functional get request tests", function () {
        test("Viewing one stock: GET request to /api/stock-prices/", function (done) {
            chai.request(server)
              .get("/api/stock-prices")
              .set("content-type", "application/json")
              .query({ stock: "AAPL" })
              .end(function (err, res) {
                // Assertions
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, "AAPL");
                assert.exists(res.body.stockData.price, "AAPL has a price");
                assert.isString(res.body.stockData.stock, "Symbol is a string");
                assert.isNumber(res.body.stockData.price, "Price is a number");
                done();
              });
          });
        
        test("Viewing one stock and liking it: GET request to /api/stock-prices/",function (done){
            chai.request(server)
              .get("/api/stock-prices")
              .set("content-type", "application/json")
              .query({ stock: "AB", like: true })
              .end(function (err, res) {
                // Assertions
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, "AB");
                assert.equal(res.body.stockData.likes, 1);
                assert.exists(res.body.stockData.price, "AB has a price");
                assert.isString(res.body.stockData.stock, "Symbol is a string");
                assert.isNumber(res.body.stockData.price, "Price is a number");
                assert.isNumber(res.body.stockData.likes, "Likes is a number");
                done();
              });
        });

        test("Viewing the same stock and liking it again: GET request to /api/stock-prices/",function (done){
            chai.request(server)
              .get("/api/stock-prices")
              .set("content-type", "application/json")
              .query({ stock: "AB", like: true })
              .end(function (err, res) {
                // Assertions
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, "AB");
                assert.equal(res.body.stockData.likes, 1);
                assert.exists(res.body.stockData.price, "AB has a price");
                assert.isString(res.body.stockData.stock, "Symbol is a string");
                assert.isNumber(res.body.stockData.price, "Price is a number");
                assert.isNumber(res.body.stockData.likes, "Likes is a number");
                done();
              });
        });

        test("Viewing two stocks: GET request to /api/stock-prices/",function (done){
            chai.request(server)
              .get("/api/stock-prices")
              .set("content-type", "application/json")
              .query({ stock: ["AAPL", "AB"] })
              .end(function (err, res) {
                // Assertions
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, "AAPL");
                assert.exists(res.body.stockData[0].price, "AAPL has a price");
                assert.equal(res.body.stockData[1].stock, "AB");
                assert.exists(res.body.stockData[1].price, "AB has a price");
                assert.isString(res.body.stockData[0].stock, "Symbol is a string");
                assert.isNumber(res.body.stockData[0].price, "Price is a number");
                assert.isString(res.body.stockData[1].stock, "Symbol is a string");
                assert.isNumber(res.body.stockData[1].price, "Price is a number");
                done();
              });
        });

        test("Viewing two stocks and liking them: GET request to /api/stock-prices/",function (done){
            chai.request(server)
              .get("/api/stock-prices")
              .set("content-type", "application/json")
              .query({ stock: ["AAPL", "AB"], like: true })
              .end(function (err, res) {
                // Assertions
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, "AAPL");
                assert.exists(res.body.stockData[0].price, "AAPL has a price");
                assert.exists(res.body.stockData[0].rel_likes, "AAPL has rel_likes");
                assert.equal(res.body.stockData[1].stock, "AB");
                assert.exists(res.body.stockData[1].price, "AB has a price");
                assert.exists(res.body.stockData[1].rel_likes, "AB has rel_likes");
                assert.isString(res.body.stockData[0].stock, "Symbol is a string");
                assert.isNumber(res.body.stockData[0].price, "Price is a number");
                assert.isNumber(res.body.stockData[0].rel_likes, "rel_likes is a number");
                assert.isString(res.body.stockData[1].stock, "Symbol is a string");
                assert.isNumber(res.body.stockData[1].price, "Price is a number");
                assert.isNumber(res.body.stockData[1].rel_likes, "rel_likes is a number");
                done();
              });
        });
    });
});
