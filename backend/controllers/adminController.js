const Order = require("../models/Order");

exports.getSalesData = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSales: { $sum: "$products.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          productName: { $arrayElemAt: ["$productDetails.name", 0] },
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json(salesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales data" });
  }
};
