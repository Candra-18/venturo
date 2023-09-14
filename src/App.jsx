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
  const [quantities, setQuantities] = useState({});
  const [transaksi, setTransaksi] = useState([]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const TambahKeranjang = (nama, harga, id, img) => {
    const newItem = { name: nama, img: img, id: id, harga: harga };
    setKeranjang([...keranjang, newItem]);
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
      const response = await axios.get(`https://tes-mobile.landa.id/api/vouchers?kode=${kode}`);
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
  const handleCancel = async (id) => {
    try {
      const cancelResponse = await axios.post(`https://tes-mobile.landa.id/api/order/cancel/${id}`);
      if (cancelResponse.data.status_code === 200) {
        const filteredTransaksi = transaksi.filter((item) => item.id !== id);
        setTransaksi(filteredTransaksi);
        alert("Order berhasil Cancel");
      } else {
        alert("Data gagal ditemukan");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };
  const submitOrder = async () => {
    const items = keranjang.map((item, index) => ({
      id: item.id,
      harga: item.harga,
      catatan: catatan ? catatan : "Order this",
    }));

    const orderData = {
      nominal_diskon: voucherNominal.toString(),
      nominal_pesanan: adjustedTotalHarga.toString(),
      items: items,
    };
    // const orderData = {
    //   nominal_diskon: "50000",
    //   nominal_pesanan: "10000",
    //   items,
    // };
    console.log(orderData);
    const dummy = {
      nominal_diskon: "50000",
      nominal_pesanan: "100000",
      items: [
        { id: 1, harga: 10000, catatan: "Tes" },
        { id: 2, harga: 10000, catatan: "Tes" },
        { id: 3, harga: 10000, catatan: "Tes" },
      ],
    };
    // const orderData = {
    //   nominal_diskon: "50000",
    //   nominal_pesanan: "100000",
    //   items: [
    //     { id: 1, harga: 10000, catatan: "Tes" },
    //     { id: 2, harga: 10000, catatan: "Tes" },
    //     { id: 3, harga: 10000, catatan: "Tes" },
    //   ],
    // };

    try {
      const response = await axios.post("https://tes-mobile.landa.id/api/order", orderData);
      if (response.data.status_code === 200) {
        const newTransaksi = { id: response.data.id, response: response.data.status_code };
        setTransaksi([...transaksi, newTransaksi]);
        setKeranjang([]);
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
        <div className="row d-flex justify-content-center align-items-center" style={{ marginTop: "20px" }}>
          <Card onCardClick={TambahKeranjang} />
        </div>
        <hr className="mt-2" />
        <h1 className="mt-2 mb-5">Transaksi</h1>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Id</th>

              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                {/* <td>Otto</td> */}
                <td>
                  <button className="btn btn-danger" onClick={() => handleCancel(item.id)}>
                    Cancel Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="App">
          <div className={`side-panel ${isVisible ? "visible" : ""}`}>
            <button className="btn btn-den" onClick={toggleVisibility}>
              X
            </button>
            <div className="row mx-4">
              {keranjang.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="card mb-3" style={{ maxWidth: "450px" }}>
                    <div className="row g-0">
                      <div className="col-md-4">
                        <img className="img-fluid align-self-center  " src={item.img} alt={item.id} style={{ maxWidth: "100px", maxHeight: "100px" }} />
                      </div>
                      <div className="col-md-8">
                        <div className="card-body">
                          <h5 className="card-title">{item.name}</h5>
                          <p className="card-text">Rp. {item.harga}</p>
                          <div className="row">
                            <div className="col">
                              <p className="card-text">{catatan}</p>
                            </div>
                            <div className="col">
                              <div className="d-flex align-items-center">
                                <button onClick={() => tambahQuantity(item.id)} className="bg-info border-0 ml-2">
                                  +
                                </button>
                                <span className="mr-2 px-2">{quantities[item.id] || 0}</span>
                                <button onClick={() => kurangQuantity(item.id)} className="bg-info border-0 ">
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <input className="mb-4" type="text" placeholder="Masukan Catatan Disini ...." onChange={(e) => setCatatan(e.target.value)} />
                </React.Fragment>
              ))}
            </div>
            <div className="mx-4">
              <label htmlFor="" className="mt-4">
                Tambahkan Voucher
              </label>
              <br></br>
              <input
                className="w-100 mt-2"
                type="text"
                placeholder="Masukan Vouchermu Disini ...."
                onChange={(e) => {
                  fetchVoucherData(e.target.value);
                }}
              />
            </div>
            <div className="voucher-message">{voucherMessage}</div>
            <div className="row mt-5 mx-4">
              <div className="col-5">
                <p className="text-start">Total</p>
              </div>
              <div className="col-5">
                <p className="text-right">Rp. {adjustedTotalHarga < 0 ? "0" : adjustedTotalHarga}</p>
              </div>
            </div>
            <button type="button" className="btn btn-primary w-100 mx-4" onClick={submitOrder}>
              Buat Pesanan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
