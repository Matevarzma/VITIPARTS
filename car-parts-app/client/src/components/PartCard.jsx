import { getPartPlaceholder } from "../services/placeholders";

function formatPrice(price) {
  const safePrice = Number(price) || 0;
  return `$${safePrice.toLocaleString()}`;
}

function PartCard({ part }) {
  const partImage =
    part.image?.trim() || getPartPlaceholder(part.code || part.name);
  const partDescription =
    part.description?.trim() || "Original catalog part for the selected car.";

  return (
    <article className="part-card">
      <div className="part-card-media">
        <img src={partImage} alt={part.name} />
      </div>

      <div className="part-card-body">
        <div className="part-card-topline">
          <span className="part-card-code">{part.code}</span>
          <span className="part-card-condition">{part.condition}</span>
        </div>
        <h3 className="part-card-name">{part.name}</h3>
        <p className="part-card-meta">{part.category}</p>
        <p className="part-card-description">{partDescription}</p>
        <p className="part-card-price">{formatPrice(part.price)}</p>
      </div>
    </article>
  );
}

export default PartCard;
