import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [averageRate, setAverageRate] = useState({});

  //increase count of item
  const increaseClickCount = async (id) => {
    try {
      const result = await fetch("http://localhost:8000/increase_click_count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await result.json();
      console.log(data.message);
    } catch (error) {
      console.error("Error", error);
    }
  };

  //fetch top 10 items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await fetch("http://localhost:8000/get_all_items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!result.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await result.json();
        setItems(data.items[0]);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  //fetch item ratings
  useEffect(() => {
    if (items.length === 0) return;
    const ratingsMap = {};
    const fetchItemsRatings = async () => {
      for (let index = 0; index < items.length; index++) {
        try {
          const response = await fetch(
            "http://localhost:8000/get_average_ratings",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ item_id: items[index].id }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            ratingsMap[items[index].id] = data.averageRating;
          } else {
            ratingsMap[items[index].id] = "N/A";
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
      setAverageRate(ratingsMap);
    };
    fetchItemsRatings();
  }, [items]);

  //search item function
  const handleSearch = async () => {
    setSearchResults([]);

    if (!searchQuery.trim()) {
      alert("Please enter a search term.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/search_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.items[0]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error", error);
      alert("Server error");
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          navigate("/Signup");
        }}
      >
        Sign up for new users
      </button>
      <p></p>
      <button
        onClick={() => {
          navigate("/Login");
        }}
      >
        Login for existing users
      </button>
      <center>
        <p></p>
        Search for your item here: &nbsp;
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        ></input>{" "}
        &nbsp;
        <button onClick={handleSearch}>Search</button>
        <h1>Trending items</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black" }}>Name</th>
              <th style={{ border: "1px solid black" }}>Price(RM)</th>
              <th style={{ border: "1px solid black" }}>
                User Interest (Clicks)
              </th>
              <th style={{ border: "1px solid black" }}>
                Average User Ratings
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ border: "1px solid black" }}>
                  <Link
                    to={`/product/${item.id}`}
                    style={{ textDecoration: "none", color: "black" }}
                    onClick={() => increaseClickCount(item.id)}
                  >
                    {item.name}
                  </Link>
                </td>
                <td style={{ border: "1px solid black" }}>
                  RM{item.price.toFixed(2).toLocaleString()}
                </td>
                <td style={{ border: "1px solid black" }}>{item.clicked}</td>
                <td style={{ border: "1px solid black" }}>
                  {!averageRate[item.id] || isNaN(averageRate[item.id])
                    ? 0
                    : Number(averageRate[item.id]).toFixed(1)}
                  &nbsp;stars
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Search Results:</h2>
        {searchResults.length > 0 ? (
          <table
            style={{
              width: "80%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid black" }}>Name</th>
                <th style={{ border: "1px solid black" }}>Price (RM)</th>
                <th style={{ border: "1px solid black" }}>Clicks</th>
                <th style={{ border: "1px solid black" }}>
                  Average User Ratings
                </th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid black" }}>
                    <Link
                      to={`/product/${item.id}`}
                      style={{ textDecoration: "none", color: "black" }}
                      onClick={() => increaseClickCount(item.id)}
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    RM{item.price.toFixed(2).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid black" }}>{item.clicked}</td>
                  <td style={{ border: "1px solid black" }}>
                    {averageRate[item.id]}&nbsp;stars
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </center>
    </div>
  );
}
