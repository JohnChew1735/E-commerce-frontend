import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function RefundTable() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [refund, setRefund] = useState([]);
  const [finalImage, setFinalImage] = useState([]);

  //get all refund record
  useEffect(() => {
    async function getRefundRecord() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_customer_refund_as_customer",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRefund(data.data);
        }
      } catch (error) {
        console.error("Error");
      }
    }
    getRefundRecord();
  }, [userID]);

  //converting images to proper format
  useEffect(() => {
    async function getProductImage() {
      if (refund.length > 0 && refund[0]?.product_images) {
        try {
          let imagesArray = [];
          for (let index = 0; index < refund.length; index++) {
            const product_images = await JSON.parse(
              refund[index].product_images
            );
            imagesArray.push(product_images[0]);
          }
          setFinalImage(imagesArray);
        } catch (error) {
          console.error("Error parsing product_images:", error);
        }
      }
    }
    getProductImage();
  }, [refund]);

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
        onClick={() => {
          navigate("/loginSuccess", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <center>
        <h1>Previous Refund</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td
                style={{
                  border: "1px solid black",
                  width: "400px",
                }}
              >
                Product Name
              </td>
              <td style={{ border: "1px solid black", width: "150px" }}>
                Quantity
              </td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                Price per item(RM)
              </td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                Discount from coins(RM)
              </td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                Total price paid(RM)
              </td>
              <td style={{ border: "1px solid black", width: "150px" }}>
                Order date
              </td>
              <td style={{ border: "1px solid black", width: "200px" }}>
                Status
              </td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                Refund reason
              </td>
              <td style={{ border: "1px solid black", width: "300px" }}>
                Refund image
              </td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let refundArray = [];
              for (let index = 0; index < refund.length; index++) {
                refundArray.push(
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid black",
                        alignItems: "center",
                        display: "flex",
                        padding: "18px",
                      }}
                    >
                      <img
                        src={finalImage[index] || null}
                        style={{
                          borderRadius: "5px",
                          height: "50px",
                          width: "50px",
                          objectFit: "cover",
                        }}
                        alt={refund[index].product_name}
                      ></img>
                      <strong> {refund[index].product_name}</strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <strong>{refund[index].quantity}</strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <strong>
                        RM{" "}
                        {Number(refund[index].price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <strong>
                        RM{" "}
                        {Number(
                          refund[index].discount_from_coins
                        ).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <strong>
                        RM{" "}
                        {(
                          Number(refund[index].price) *
                            Number(refund[index].quantity) -
                          Number(refund[index].discount_from_coins)
                        ).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(refund[index].order_date).toLocaleDateString(
                        "en-MY"
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {refund[index].request_for_refund ===
                      "Yes, pending approval" ? (
                        <button
                          style={{
                            backgroundColor: "orange",
                            color: "white",
                            borderRadius: "5px",
                            border: "none",
                            padding: "10px",
                          }}
                        >
                          Pending approval
                        </button>
                      ) : refund[index].request_for_refund === "Denied" ? (
                        <button
                          style={{
                            backgroundColor: "red",
                            borderRadius: "5px",
                            border: "none",
                            padding: "15px 15px",
                            fontSize: "15px",
                          }}
                        >
                          Denied
                        </button>
                      ) : refund[index].request_for_refund === "Approved" ? (
                        <button
                          style={{
                            backgroundColor: "green",
                            borderRadius: "5px",
                            border: "none",
                            padding: "15px 15px",
                            fontSize: "15px",
                          }}
                        >
                          Approved
                        </button>
                      ) : null}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <textarea
                        disabled
                        style={{ width: "220px", height: "72px" }}
                        value={refund[index].refund_reason}
                      ></textarea>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {refund[index].refund_image ? (
                        <img
                          src={refund[index].refund_image}
                          alt={refund[index.product_name]}
                          style={{
                            borderRadius: "5px",
                            height: "50px",
                            width: "50px",
                            objectFit: "cover",
                          }}
                        ></img>
                      ) : (
                        <p>No image attached</p>
                      )}
                    </td>
                  </tr>
                );
              }
              return refundArray;
            })()}
          </tbody>
        </table>
      </center>
    </div>
  );
}
