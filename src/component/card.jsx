import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";

const Card = ({ onCardClick }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://tes-mobile.landa.id/api/menus");
        console.log(response.data.datas);
        setData(response.data.datas);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <div className="row">
        {data.map((item, index) => (
          <div className="col-3 mb-5" key={index}>
            <div className="card h-100 mx-2 mt-4 card_style">
              <img src={item.image} alt={item.title} className="card-img-top" />
              <div className="card-body">
                <img className="img-fluid mb-3" src={item.gambar} style={{ height: "16rem" }} alt={item.id} />
                <h5 className="card-title">{item.nama}</h5>
                <p className="card-text">Rp. {item.harga}</p>
                
                <div className="d-flex justify-content-center ">
                <button type="button" onClick={() => onCardClick(item.nama, item.harga, item.id, item.gambar)} className="btn btn-outline-primary  ">
                      Tambahkan Ke Keranjang
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Card.propTypes = {
  onCardClick: PropTypes.func.isRequired,
};

export default Card;
