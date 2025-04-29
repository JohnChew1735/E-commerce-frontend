import { BrowserRouter, Routes, Route } from "react-router-dom";
import process from "process";
import { Home } from "./Home/Home";
import { Signup } from "./SignUP/Signup";
import { Login } from "./Login/Login";
import { ForgetPasswordVerify } from "./Login/ForgetPasswordVerify";
import { ResetPassword } from "./Login/ResetPassword";
import { LoginSuccess } from "./Login/LoginSuccess";
import { ProductDetails } from "./ProductDetails/ProductDetails";
import { Orders } from "./Orders/Orders";
import { SellItems } from "./SellItems/SellItems.jsx";
import { MyItems } from "./MyItems/MyItems.jsx";
import { Ratings } from "./Ratings/Ratings.jsx";
import { EditItems } from "./SellItems/EditItems.jsx";
import { Refund } from "./Refund/Refund.jsx";
import { RefundTable } from "./Refund/RefundTable.jsx";
import { CustomerRefund } from "./Refund/CustomerRefund.jsx";
import { AddStock } from "./SellItems/AddStock.jsx";
import { StockFlow } from "./StockFlow/StockFlow.jsx";
import { DailyLogin } from "./DailyLogin/DailyLogin.jsx";
import { Profile } from "./Login/Profile.jsx";
import { Wishlist } from "./Wishlist/Wishlist.jsx";
import { WishlistTable } from "./Wishlist/WishlistTable.jsx";
import { PaymentSuccess } from "./components/PaymentSuccess.jsx";
import { PaymentFailed } from "./components/PaymentFailed.jsx";
import { PaymentPage } from "./components/PaymentPage.jsx";
import { CheckoutForm } from "./components/CheckoutForm.jsx";
import { Test } from "./test.jsx";

export function App() {
  if (typeof window !== "undefined") {
    window.process = process;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route
          path="/ForgetPasswordVerify"
          element={<ForgetPasswordVerify />}
        />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/loginSuccess" element={<LoginSuccess />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/Orders" element={<Orders />} />
        <Route path="/SellItems" element={<SellItems />} />
        <Route path="/MyItems" element={<MyItems />} />
        <Route path="/Ratings" element={<Ratings />} />
        <Route path="/EditItems" element={<EditItems />} />
        <Route path="/Refund" element={<Refund />} />
        <Route path="/RefundTable" element={<RefundTable />} />
        <Route path="/CustomerRefund" element={<CustomerRefund />} />
        <Route path="/AddStock" element={<AddStock />} />
        <Route path="/StockFlow" element={<StockFlow />} />
        <Route path="/DailyLogin" element={<DailyLogin />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Wishlist" element={<Wishlist />} />
        <Route path="/WishlistTable" element={<WishlistTable />} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/PaymentFailed" element={<PaymentFailed />} />
        <Route path="/PaymentPage" element={<PaymentPage />} />
        <Route path="/CheckoutForm" element={<CheckoutForm />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}
