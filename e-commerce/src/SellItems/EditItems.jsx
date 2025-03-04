import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
      <p>
        Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
        <span style={{ color: "purple" }}>{userType}</span>)
      </p>
      <button
        onClick={() => {
          navigate("/MyItems", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <center>
        <h1>Edit item</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}>
                <strong>Product details</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Before changes</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Changes to be mades</strong>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black" }}>Product name</td>
              <td style={{ border: "1px solid black" }}>{myItems.name}</td>
              <td style={{ border: "1px solid black" }}>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                  }}
                ></input>
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Product price</td>
              <td style={{ border: "1px solid black" }}>
                RM
                {Number(myItems.price).toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td style={{ border: "1px solid black" }}>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => {
                    setProductPrice(e.target.value);
                  }}
                ></input>
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Product stock count</td>
              <td style={{ border: "1px solid black" }}>
                {myItems.stockCount}
              </td>
              <td style={{ border: "1px solid black" }}>
                Stock count cannot be edited for accuracy of stock inflow and
                outflow 😉
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Product brand</td>
              <td style={{ border: "1px solid black" }}>{brand}</td>
              <td style={{ border: "1px solid black" }}>
                <label>Choose a brand: &nbsp;&nbsp;</label>
                <select
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
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
            <tr>
              <td style={{ border: "1px solid black" }}>Product category</td>
              <td style={{ border: "1px solid black" }}>{category}</td>
              <td style={{ border: "1px solid black" }}>
                <label> Choose a category: &nbsp;&nbsp;</label>
                <select
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
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
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Product description</td>
              <td style={{ border: "1px solid black" }}>
                <textarea
                  style={{ width: "476px", height: "113px" }}
                  defaultValue={myItems.description}
                  disabled
                ></textarea>
              </td>
              <td style={{ border: "1px solid black" }}>
                <textarea
                  style={{ width: "476px", height: "113px" }}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                ></textarea>
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Product images</td>
              <td style={{ border: "1px solid black" }}>
                {(() => {
                  let images = [];
                  for (let index = 0; index < productImages.length; index++) {
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
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>
                  Please note that each url is being separated by a coma
                </strong>
                <p></p>
                <strong>
                  Thus, for each image link, please remember to add a coma
                  before each image link{" "}
                </strong>
                <textarea
                  style={{ width: "488px", height: "347px" }}
                  type="text"
                  value={newProductImages}
                  onChange={(e) => setNewProductImages(e.target.value)}
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
        <p></p>
        <button
          onClick={() => {
            updateItem();
          }}
        >
          Edit item
        </button>
      </center>
    </div>
  );
}
