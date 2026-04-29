import { Link } from "react-router-dom";

import { getBrandPlaceholder } from "../services/placeholders";

function BrandCard({ brand }) {
  const brandId = brand._id || brand.id;
  const brandImage = brand.image?.trim() || getBrandPlaceholder(brand.name);
  const brandDescription =
    brand.description?.trim() || "ამ ბრენდში არსებული მანქანების ნახვა.";

  return (
    <Link to={`/brands/${brandId}`} className="car-card">
      <div className="car-card-media">
        <img src={brandImage} alt={brand.name} />
      </div>

      <div className="car-card-body">
        <p className="car-card-brand">ბრენდი</p>
        <h3 className="car-card-title">{brand.name}</h3>
        <p className="car-card-year">{brandDescription}</p>
        <span className="car-card-link">მანქანების ნახვა</span>
      </div>
    </Link>
  );
}

export default BrandCard;
