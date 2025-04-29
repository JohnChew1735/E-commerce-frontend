import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export function EditItems() {
  const location = useLocation();
  const { username, userType, userID, itemID } = location.state || {};
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productImages, setProductImages] = useState("");
  const [newProductImages, setNewProductImages] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [myItems, setMyItems] = useState({});

  //based on item id given, get all the details related to that product id
  useEffect(() => {
    async function getItemDetails() {
      const response = await fetch(
        "http://localhost:8000/get_product_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemID }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMyItems(data.details);
      }
    }
    getItemDetails();
  }, [itemID]);

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

  //convert array of images into each image link
  useEffect(() => {
    async function getMyItemsImages() {
      let arrayImages = myItems.images;
      try {
        arrayImages = JSON.parse(arrayImages);
      } catch (error) {
        console.error("Error parsing images:", error);
        arrayImages = [];
      }
      setProductImages(arrayImages);
    }

    getMyItemsImages();
  }, [myItems]);

  //get product brand from their brandID
  useEffect(() => {
    async function getBrandName() {
      const response = await fetch("http://localhost:8000/get_brand_name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandID: myItems.brandID }),
      });
      if (response.ok) {
        const data = await response.json();
        setBrand(data.data);
      }
    }
    getBrandName();
  }, [myItems]);

  //get product category from their categoryID
  useEffect(() => {
    async function getCategoryName() {
      const response = await fetch("http://localhost:8000/get_category_name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryID: myItems.categoryID }),
      });
      if (response.ok) {
        const data = await response.json();
        setCategory(data.data);
      }
    }
    getCategoryName();
  }, [myItems]);

  //update item
  async function updateItem() {
    if (!productName) {
      alert("Please enter a product name.");
      return;
    }
    if (!newBrand) {
      alert("Please choose a brand.");
      return;
    }
    let finalBrand = newBrand;
    if (newBrand === "Others") {
      const otherBrand = prompt(
        "You have selected others for category, please provide a category name."
      );
      if (otherBrand) {
        finalBrand = otherBrand;
      } else {
        alert("New brand name is required.");
        return;
      }
    }

    let finalCategory = newCategory;
    if (!newCategory) {
      alert("Please choose a category.");
      return;
    }
    if (newCategory === "Others") {
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
    if (!newProductImages) {
      alert("Please provide some product images.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/update_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productPrice,
          brand: finalBrand,
          category: finalCategory,
          productDescription,
          productImages: newProductImages,
          itemID,
        }),
      });
      if (response.ok) {
        alert(`Item${productName} is edited successfully.`);
        navigate("/MyItems", { state: { username, userType, userID } });
      } else {
        alert(`Item${productName} is not edited.`);
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
        onClick={() => {
          navigate("/MyItems", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <motion.div>
        <div className="flex flex-col gap-4 items-center px-20">
          <div className="text-3xl font-bold text-blue-700 animate-pulse mb-10">
            Edit item
          </div>
          <motion.table
            className="overflow-x-auto p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
          >
            <table className="min-w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-blue-100">
                  <td className="px-4 py-3 border">
                    <strong>Product details</strong>
                  </td>
                  <td className="px-4 py-3 border">
                    <strong>Before changes</strong>
                  </td>
                  <td className="px-4 py-3 border">
                    <strong>Changes to be mades</strong>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product name</td>
                  <td className="px-4 py-3 border">{myItems.name}</td>
                  <td className="px-4 py-3 border">
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product price</td>
                  <td className="px-4 py-3 border">
                    RM
                    {Number(myItems.price).toLocaleString("en-MY", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => {
                        setProductPrice(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></input>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product stock count</td>
                  <td className="px-4 py-3 border">{myItems.stockCount}</td>
                  <td className="px-4 py-3 border">
                    Stock count cannot be edited for accuracy of stock inflow
                    and outflow 😉
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product brand</td>
                  <td className="px-4 py-3 border">{brand}</td>
                  <td className="px-4 py-3 border">
                    <label>Choose a brand: &nbsp;&nbsp;</label>
                    <select
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product category</td>
                  <td className="px-4 py-3 border">{category}</td>
                  <td className="px-4 py-3 border">
                    <label> Choose a category: &nbsp;&nbsp;</label>
                    <select
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(() => {
                        let rows = [];
                        rows.push(
                          <option key="" value="">
                            Please select a category
                          </option>
                        );
                        for (
                          let index = 0;
                          index < categoryList.length;
                          index++
                        ) {
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
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product description</td>
                  <td className="px-4 py-3 border">
                    <textarea
                      className="w-full h-full"
                      defaultValue={myItems.description}
                      disabled
                    ></textarea>
                  </td>
                  <td className="px-4 py-3 border">
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">Product images</td>
                  <td className="px-4 py-3 border">
                    <Carousel
                      showThumbs={false}
                      autoPlay
                      infiniteLoop
                      className="w-full md:w-3/4 lg:w-2/3 mb-10"
                    >
                      {(() => {
                        let images = [];
                        for (
                          let index = 0;
                          index < productImages.length;
                          index++
                        ) {
                          images.push(
                            <img
                              key={index}
                              src={productImages[index]}
                              alt={productName}
                              style={{
                                width: "300px",
                                height: "300px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                            ></img>
                          );
                        }
                        return images;
                      })()}
                    </Carousel>
                  </td>
                  <td className="px-4 py-3 border">
                    <strong>
                      Please note that each url is being separated by a coma
                    </strong>
                    <p></p>
                    <strong>
                      Thus, for each image link, please remember to add a coma
                      before each image link{" "}
                    </strong>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={newProductImages}
                      onChange={(e) => setNewProductImages(e.target.value)}
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.table>
          <motion.button
            onClick={() => {
              updateItem();
            }}
            className="bg-blue-500 text-lg shadow-lg rounded-lg px-4 py-3 hover:bg-blue6400 transition-all duration:300 text-white font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Edit item
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
