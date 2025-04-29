import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function SellItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState("");
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");

  //debug
  useEffect(() => {
    console.log(userID);
  }, [userID]);

  //list out all available brand
  useEffect(() => {
    const getBrand = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_item_brand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setBrandList(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    getBrand();
  }, []);

  //list out all product category
  useEffect(() => {
    const getCategory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_item_category",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategoryList(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };

    getCategory();
  }, []);

  async function addItem() {
    if (!productName) {
      alert("Please enter a product name.");
      return;
    }
    if (!brand) {
      alert("Please choose a brand.");
      return;
    }
    let finalBrand = brand;
    if (brand === "Others") {
      const otherBrand = prompt(
        "You have selected others for brand, please provide a brand name."
      );
      if (otherBrand) {
        finalBrand = otherBrand;
      } else {
        alert("New brand name is required.");
        return;
      }
    }

    let finalCategory = category;
    if (!category) {
      alert("Please choose a category.");
      return;
    }
    if (category === "Others") {
      const otherCategory = prompt(
        "You have selected others for category, please provide a category name."
      );
      if (otherCategory) {
        finalCategory = otherCategory;
      } else {
        alert("New category name is required.");
        return;
      }
    }
    if (!productPrice) {
      alert("Please enter a price.");
      return;
    }
    if (!productDescription) {
      alert("Please enter some product description.");
      return;
    }
    if (!productImages) {
      alert("Please provide some product images.");
      return;
    }

    console.log("Brand being sent:", finalBrand);
    console.log("Category being sent:", finalCategory);
    try {
      const response = await fetch("http://localhost:8000/add_item_to_market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productPrice,
          brand: finalBrand,
          category: finalCategory,
          productDescription,
          productImages,
          sellerID: userID,
        }),
      });
      if (response.ok) {
        alert(
          "Item added to the cart. Please note that the item stock amount has not been added. Redirecting you to add stock amount."
        );
        navigate("/AddStock", { state: { username, userType, userID } });
      } else {
        alert("Item not added to the cart");
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-md py-4 px-6 flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Logo"
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            ShopSphere
          </h1>
          <button className="text-sm bg-white text-pink-500 px-2 py-1 rounded-full shadow-md font-medium animate-bounce">
            🎉 Big Deals!
          </button>
        </div>
        <div className="flex space-x-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <div>
              <span>Logged in as: </span>
              <strong className="text-blue-700">{username}</strong> (
              <span className="text-purple-500">{userType}</span>)
            </div>
          </motion.div>
        </div>
      </div>
      <button
        className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
        onClick={() =>
          navigate("/loginSuccess", { state: { username, userType, userID } })
        }
      >
        Back
      </button>
      <div className="flex flex-col items-center p-6">
        <div className="text-4xl font-bold text-orange-400 animate-pulse">
          Add item to the market
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 14 }}
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-10 space-y-4"
        >
          <div className="flex flex-col gap-2 items-center">
            <label className="font-medium text-gray-700 mb-1">
              Product name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
              }}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
            ></input>
            <label className="font-medium text-gray mb-1">
              Choose a brand:
            </label>
            <select
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
            >
              {(() => {
                let rows = [];
                rows.push(
                  <option key="" value="">
                    Please select a brand
                  </option>
                );
                for (let index = 0; index < brandList.length; index++) {
                  if (brandList.length > 0) {
                    rows.push(
                      <option key={index} value={brandList[index]}>
                        {brandList[index]}
                      </option>
                    );
                  }
                }
                rows.push(
                  <option key="Others" value="Others">
                    Others
                  </option>
                );
                return rows;
              })()}
            </select>
            <label className="font-medium text-gray-700 mb-1">
              Choose a category
            </label>
            <select
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue0499 outline-none transition-all duration-300 hover:shadow-md"
            >
              {(() => {
                let rows = [];
                rows.push(
                  <option key="" value="">
                    Please select a category
                  </option>
                );
                for (let index = 0; index < categoryList.length; index++) {
                  if (categoryList.length > 0) {
                    rows.push(
                      <option key={index} value={categoryList[index]}>
                        {categoryList[index]}
                      </option>
                    );
                  }
                }
                rows.push(
                  <option key="Others" value="Others">
                    Others
                  </option>
                );
                return rows;
              })()}
            </select>
            <label className="font-medium text-gray-700 mb-1">
              Product price (RM)
            </label>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
            ></input>
            <label className="text-gray-700 font-medium mb-1">
              Product description:
            </label>
            <textarea
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Enter item description"
              width="150px"
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
            ></textarea>
            <label className="text-gray-700 font-medium mb-1">
              Product image
            </label>
            <input
              type="text"
              value={productImages}
              onChange={(e) => setProductImages(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
            ></input>
            <motion.button
              disabled={!productName || !brand || !category || !productPrice}
              onClick={() => {
                addItem();
                navigate("/loginSuccess", {
                  state: { username, userType, userID },
                });
              }}
              className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Submit
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
