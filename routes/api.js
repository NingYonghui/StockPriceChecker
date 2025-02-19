'use strict';
const stockData = require("../model.js")
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// get the stock as json object and destructing it into  { symbol, latestPrice: parseFloat(latestPrice) };
const GetStock = async (stock) => {   
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await response.json();
  return { symbol, latestPrice: parseFloat(latestPrice) };  
};

// search for the stock in the databse
const FindStock = async (stock) => {
  try {
    const foundStock = await stockData.findOne({ stock: stock });
    return !!foundStock; // Returns true if stock is found, false otherwise
  } catch (err) {
    console.error("Error finding stock:", err);
    return false; // Return false in case of error
  }
};

// create a stock if it doesn t exist 
const CreateStock = async (stock, latestPrice, like, ips) => {
  try {
    const newStock = new stockData({
      stock: stock,
      price: latestPrice,
      likes: like === 'true' ? 1 : 0 || 0,  // Set likes based on the like param
      ips: ips ? [ips] : []             // Add the IP if provided
    });
    
    await newStock.save(); // Save the stock to the database
    return newStock;
  } catch (error) {
    console.error('Error creating stock:', error);
    throw new Error('Error creating stock');
  }
};

// SaveStock it update the  stock data  if it s found or  create  it 

const SaveStock = async (stock, latestPrice, ip, like) => { 
  try {
    const foundStock = await FindStock(stock);

    if (foundStock) {
      let updateQuery;
      if (like === "true") {
        // Add IP to ips array if 'like' is true
        updateQuery = { $addToSet: { ips: ip }, $set: { price: latestPrice } };
      } else if (like === "false") {
        // Remove IP from ips array if 'like' is false
        updateQuery = { $pull: { ips: ip }, $set: { price: latestPrice } };
      } else {
        // Just update the price if no 'like' or 'unlike' operation
        updateQuery = { $set: { price: latestPrice } };
      }

      // Update the stock
      await stockData.findOneAndUpdate(
        { stock: stock },
        updateQuery,
        { new: true } // Return the updated document
      );

      // After updating, retrieve the updated stock to get the updated ips array
      const updatedStock = await stockData.findOne({ stock: stock });

      // Update likes to the length of ips array
      await stockData.updateOne(
        { stock: stock },
        { $set: { likes: updatedStock.ips.length } }
      );

      // Return the updated stock
      return updatedStock;
    } else {
      // If stock doesn't exist, create a new one
      return await CreateStock(stock, latestPrice, like, ip);
    }
  } catch (error) {
    console.error('Error saving stock:', error);
    throw new Error('Error saving stock');
  }
};






module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;

      // Handling the case where multiple stocks are provided (for comparison)
      if (Array.isArray(stock)) {
        try {
          const firstStock = await GetStock(stock[0]);
          const secondStock = await GetStock(stock[1]);

          if (firstStock.symbol && secondStock.symbol) {
            // Save both stocks
            await SaveStock(firstStock.symbol, firstStock.latestPrice, req.ip, like);
            await SaveStock(secondStock.symbol, secondStock.latestPrice, req.ip, like);

            // Get the number of likes for both stocks
            const firstStockData = await stockData.findOne({ stock: firstStock.symbol });
            const secondStockData = await stockData.findOne({ stock: secondStock.symbol });

            const firstStockLikes = firstStockData.ips.length;
            const secondStockLikes = secondStockData.ips.length;

            // Return relative likes
            res.json({
              stockData: [
                {
                  stock: firstStock.symbol,
                  price: firstStock.latestPrice,
                  rel_likes: firstStockLikes - secondStockLikes
                },
                {
                  stock: secondStock.symbol,
                  price: secondStock.latestPrice,
                  rel_likes: secondStockLikes - firstStockLikes
                }
              ]
            });
          } else {
            res.json({
              stockData: [
                { error: "invalid symbol", likes: 0 },
                { error: "invalid symbol", likes: 0 }
              ]
            });
          }
        } catch (error) {
          console.error("Error handling multiple stocks:", error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        // Single stock case
        try {
          const { symbol, latestPrice } = await GetStock(stock);

          if (!symbol) {
            res.json({ stockData: { error: "invalid symbol", likes: 0 } });
          } else {
            // Save the stock
            await SaveStock(symbol, latestPrice, req.ip, like);

            // Find the stock data to get the number of likes
            const stockDataEntry = await stockData.findOne({ stock: symbol });

            if (stockDataEntry) {
              res.json({
                stockData: {
                  stock: symbol,
                  price: latestPrice,
                  likes: stockDataEntry.ips.length
                }
              });
            } else {
              res.json({ stockData: { error: "stock not found", likes: 0 } });
            }
          }
        } catch (error) {
          console.error("Error handling single stock:", error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
};
