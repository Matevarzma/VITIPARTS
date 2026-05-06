import { Link } from "react-router-dom";

import { resolveImageUrl } from "../services/images";
import { getBrandPlaceholder } from "../services/placeholders";

function BrandCard({ brand }) {
  const brandId = brand._id || brand.id;
  const brandImage =
    resolveImageUrl(brand.image) || getBrandPlaceholder(brand.name);
  

  return (
    <Link to={`/brands/${brandId}`} className="car-card brand-card">
      <div className="car-card-media">
        <img src={brandImage} alt={brand.name} />
      </div>

      <div className="car-card-body">
        <p className="car-card-brand">ბრენდი</p>
        <h3 className="car-card-title">{brand.name}</h3>
        
        
      </div>
    </Link>
  );
}

export default BrandCard;
