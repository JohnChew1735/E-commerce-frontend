import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
      <p>
        Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
        <span style={{ color: "purple" }}>{userType}</span>)
      </p>
      <button
        onClick={() =>
          navigate("/loginSuccess", { state: { username, userType, userID } })
        }
      >
        Back
      </button>
      <center>
        <h1>Add item to the market</h1>
        <p></p>
        Product
        name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={productName}
          onChange={(e) => {
            setProductName(e.target.value);
          }}
        ></input>
        <p></p>
        <label>
          Choose a
          brand:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </label>
        <select
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
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
        <p></p>
        <label>
          Choose a category: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;
        </label>
        <select
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
        <p></p>
        Product price
        (RM):&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
        ></input>
        <p></p>
        Product
        description:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <textarea
          type="text"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Enter item description"
          width="150px"
        ></textarea>
        <p></p>
        Product
        image:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={productImages}
          onChange={(e) => setProductImages(e.target.value)}
        ></input>
        <p></p>
        <button
          onClick={() => {
            addItem();
            navigate("/loginSuccess", {
              state: { username, userType, userID },
            });
          }}
        >
          Submit
        </button>
      </center>
    </div>
  );
}
