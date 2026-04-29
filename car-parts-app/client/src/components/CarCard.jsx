import { Link } from "react-router-dom";

import { getCarPlaceholder } from "../services/placeholders";

function CarCard({ car }) {
  const carId = car._id || car.id;
  const carImage =
    car.image?.trim() || getCarPlaceholder(`${car.brand} ${car.model}`);

  return (
    <Link to={`/cars/${carId}`} className="car-card">
      <div className="car-card-media">
        <img src={carImage} alt={`${car.brand} ${car.model}`} />
      </div>

      <div className="car-card-body">
        <p className="car-card-brand">{car.brand}</p>
        <h3 className="car-card-title">{car.model}</h3>
        <p className="car-card-year">{car.year}</p>
        <span className="car-card-link">ნაწილების ნახვა</span>
      </div>
    </Link>
  );
}

export default CarCard;
