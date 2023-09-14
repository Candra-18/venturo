import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "./component/card.jsx";
import "./app.css";

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [keranjang, setKeranjang] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [voucherNominal, setVoucherNominal] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [adjustedTotalHarga, setDdjustedTotalHarga] = useState(0);
  // State untuk quantity
  const [quantities, setQuantities] = useState({});

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const TambahKeranjang = (nama, harga, id, img) => {
    const newItem = { name: nama, img: img, id: id, harga: harga };
    setKeranjang([...keranjang, newItem]);
    // Default quantity untuk item baru adalah 1
    setQuantities({ ...quantities, [id]: 1 });
  };

  const tambahQuantity = (id) => {
    const newQuantities = { ...quantities };
    newQuantities[id] = (newQuantities[id] || 0) + 1;
    setQuantities(newQuantities);
  };

  const kurangQuantity = (id) => {
    const newQuantities = { ...quantities };
    if (newQuantities[id] > 0) {
      newQuantities[id] -= 1;
      setQuantities(newQuantities);
    }
  };

  useEffect(() => {
    const totalHarga = keranjang.reduce((acc, item) => {
      const quantity = quantities[item.id] || 0;
      return acc + item.harga * quantity;
    }, 0);

    if (totalHarga - voucherMessage < 0) {
      setDdjustedTotalHarga(0);
    } else {
      setDdjustedTotalHarga(totalHarga - voucherNominal);
    }
  }, [voucherNominal, keranjang, quantities]);

  const fetchVoucherData = async (kode) => {
    try {
      const response = await axios.get(
        `https://tes-mobile.landa.id/api/vouchers?kode=${kode}`
      );
      if (response.data.status_code === 200) {
        console.log(response.data.datas?.nominal);
        setVoucherNominal(response.data.datas?.nominal);
        setVoucherMessage("");
      } else {
        setVoucherMessage("Voucher tidak tersedia");
      }
    } catch (error) {
      console.log(error);
      setVoucherMessage("An error occurred");
    }
  };

  const submitOrder = async () => {
    const orderData = {
      nominal_diskon: voucherNominal.toString(),
      nominal_pesanan: adjustedTotalHarga.toString(),
      items: keranjang,
    };

    try {
      const response = await axios.post(
        "https://tes-mobile.landa.id/api/order",
        orderData
      );
      if (response.data.status_code === 200) {
        alert("Order berhasil dibuat");
      } else {
        alert("Data gagal ditemukan");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  return (
    <>
      <div className="container-fluid m-0 p-0 mb-6">
        <div className="container">
          <nav className="navbar navbar-light">
            <a className="navbar-brand" href="#">
              Main Course
            </a>
            <button className="btn btn-light" onClick={toggleVisibility}>
              Keranjang
            </button>
          </nav>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Card onCardClick={TambahKeranjang} />
        </div>
        <div className="App">
          <div className={`side-panel ${isVisible ? "visible" : ""}`}>
            <div className="row mx-4">
              {keranjang.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="col-2 mt-4">
                    <img className="img-fluid" src={item.img} alt={item.id} />
                  </div>
                  <div className="col-8 mt-4">
                    <h6>{item.name}</h6>
                    <p>Rp. {item.harga}</p>
                    <p>{catatan}</p>
                    {/* Tampilkan quantity */}
                    <div>
                      Quantity: {quantities[item.id] || 0}
                      <button onClick={() => tambahQuantity(item.id)}>
                        Tambah
                      </button>
                      <button onClick={() => kurangQuantity(item.id)}>
                        Kurang
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Masukan Catatan Disini ...."
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </React.Fragment>
              ))}
            </div>
            <hr />
            <label htmlFor="">Tambahkan Voucher</label>
            <input
              type="text"
              placeholder="Masukan Vouchermu Disini ...."
              onChange={(e) => {
                fetchVoucherData(e.target.value);
              }}
            />
            <div className="voucher-message">{voucherMessage}</div>
            <div className="row mt-5 mx-4">
              <div className="col-5">
                <p className="text-start">Total</p>
              </div>
              <div className="col-5">
                <p className="text-right">
                  Rp. {adjustedTotalHarga < 0 ? "0" : adjustedTotalHarga}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary w-100 mx-4"
              onClick={submitOrder}
            >
              Buat Pesanan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;