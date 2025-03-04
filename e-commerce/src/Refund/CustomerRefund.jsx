import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function CustomerRefund() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [refund, setRefund] = useState([]);
  const [finalImage, setFinalImage] = useState([]);

  //get customer refund request as seller
  useEffect(() => {
    async function getRefundRecord() {
      const response = await fetch(
        "http://localhost:8000/get_customer_refund_as_seller",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userID }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data.data);
        setRefund(data.data);
      }
    }
    getRefundRecord();
  }, [userID]);

  //convert image to proper format
  useEffect(() => {
    let productArray = [];
    for (let index = 0; index < refund.length; index++) {
      const convertedImages = JSON.parse(refund[index].product_images);
      productArray.push(convertedImages[0]);
    }
    setFinalImage(productArray);
  }, [refund]);

  //setting the request to approved/denied
  async function setRequest(
    responseType,
    orderID,
    item_id,
    quantity,
    customer_id,
    coinsUsed
  ) {
    if (responseType === "Approved") {
      const userConfirm = window.confirm(
        "Are you sure about approving this customer refund?"
      );

      if (userConfirm) {
        try {
          const response = await fetch(
            "http://localhost:8000/increase_customer_coins_more_than_10coins",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID: customer_id, coinsUsed }),
            }
          );
          if (response.ok) {
            try {
              const response = await fetch(
                "http://localhost:8000/set_request_for_refund_to_approved",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID }),
                }
              );
              if (response.ok) {
                console.log(orderID, item_id, quantity, customer_id);
                try {
                  const response = await fetch(
                    "http://localhost:8000/update_stock_flow_for_customer",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        item_id,
                        amount: quantity,
                        inOrOut: "In",
                        customerID: customer_id,
                      }),
                    }
                  );
                  if (response.ok) {
                    alert("Customer refund increased stock amount.");
                    window.location.reload();
                  }
                } catch (error) {
                  console.error(
                    "Error updating customer refund to increase stock quantity"
                  );
                }
              } else {
                alert("Customer refund request not updated");
              }
            } catch (error) {
              console.error("Error", error);
            }
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
    }
    if (responseType === "Denied") {
      const userConfirm = window.confirm(
        "Are you sure about denying this customer refund?"
      );
      if (userConfirm) {
        try {
          const response = await fetch(
            "http://localhost:8000/set_request_for_refund_to_denied",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID }),
            }
          );
          if (response.ok) {
            alert("Customer refund request denied");
            window.location.reload();
          } else {
            alert("Customer refund request not denied");
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
    }
  }

  //debug
  useEffect(() => {
    console.log(refund);
  }, [refund]);
  return (
    <div>
      <p>
        Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
        <span style={{ color: "purple" }}>{userType}</span>)
      </p>
      <button
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/loginSuccess", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <center>
        <h1>Customer refund</h1>
        <table
          style={{
            width: "80%",
            textAlign: "center",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}> Customer name</td>
              <td style={{ border: "1px solid black", width: "250px" }}>
                {" "}
                Product image
              </td>
              <td style={{ border: "1px solid black", width: "250px" }}>
                {" "}
                Product name
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                {" "}
                Product price
              </td>
              <td style={{ border: "1px solid black", width: "150px" }}>
                {" "}
                Product quantity
              </td>
              <td style={{ border: "1px solid black", width: "150px" }}>
                {" "}
                Discount from coins
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                Product price total
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                Order date
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                {" "}
                User Rating
              </td>
              <td style={{ border: "1px solid black" }}> Refund reason</td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                {" "}
                Refund image
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                {" "}
                Action
              </td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let customerRefund = [];
              for (let index = 0; index < refund.length; index++) {
                customerRefund.push(
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid black",
                        width: "100px",
                        verticalAlign: "middle",
                      }}
                    >
                      {refund[index].customer_name}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <img
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                        src={finalImage[index] || null}
                        alt={refund[index].product_name}
                      ></img>
                    </td>
                    <td
                      style={{
                        cursor: "pointer",

                        border: "1px solid black",
                        verticalAlign: "middle",
                      }}
                      onClick={() => {
                        navigate(`/product/${refund[index].item_id}`, {
                          state: { username, userID, userType },
                        });
                      }}
                    >
                      {refund[index].product_name}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      RM {""}
                      {Number(refund[index].price).toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {refund[index].quantity}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      RM
                      {Number(refund[index].discount_from_coins).toLocaleString(
                        "en-MY",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      RM{""}
                      {(
                        Number(refund[index].quantity) *
                          Number(refund[index].price) -
                        Number(refund[index].discount_from_coins)
                      ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(refund[index].order_date).toLocaleDateString(
                        "en-MY"
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {!refund[index].user_rating
                        ? "0.0"
                        : refund[index].user_rating}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <textarea
                        style={{ width: "242px", height: "59px" }}
                        value={refund[index].refund_reason}
                        disabled
                      ></textarea>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {refund[index].refund_image ? (
                        <img
                          src={refund[index].refund_image}
                          alt={refund[index].product_name}
                          style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "5px",
                            objectFit: "Fit",
                          }}
                        ></img>
                      ) : (
                        <p>Customer did not attach any image</p>
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {refund[index].request_for_refund === "Approved" ? (
                        <button
                          style={{
                            backgroundColor: "green",
                            padding: "5px",
                            borderRadius: "5px",
                            color: "white",
                            height: "60px",
                            width: "100px",
                          }}
                        >
                          Approved
                        </button>
                      ) : refund[index].request_for_refund === "Denied" ? (
                        <button
                          style={{
                            backgroundColor: "red",
                            padding: "5px",
                            borderRadius: "5px",
                            color: "white",
                            height: "60px",
                            width: "100px",
                          }}
                        >
                          Denied
                        </button>
                      ) : (
                        <>
                          <button
                            style={{
                              backgroundColor: "green",
                              padding: "5px",
                              color: "white",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setRequest(
                                "Approved",
                                refund[index].id,
                                refund[index].item_id,
                                refund[index].quantity,
                                refund[index].customer_id,
                                refund[index].discount_from_coins
                              );
                            }}
                          >
                            Approve
                          </button>
                          <p></p>
                          <button
                            style={{
                              backgroundColor: "red",
                              padding: "5px",
                              color: "white",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setRequest("Denied", refund[index].id);
                            }}
                          >
                            Deny
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              }

              return customerRefund.length > 0 ? (
                customerRefund
              ) : (
                <tr>
                  <td style={{ border: "1px solid black" }} colSpan="9">
                    No customer refund at the moment
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </center>
    </div>
  );
}
