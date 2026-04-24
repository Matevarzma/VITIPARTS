import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PartCard from "../components/PartCard";
import {
  getApiErrorMessage,
  getCarById,
  getPartsByCarId,
} from "../services/api";
import { getBannerPlaceholder } from "../services/placeholders";

function CarPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const loadCarPage = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [carData, partsData] = await Promise.all([
          getCarById(id),
          getPartsByCarId(id),
        ]);

        if (isMounted) {
          setCar(carData);
          setParts(partsData);
          setActiveCategory("All");
        }
      } catch (requestError) {
        if (isMounted) {
          setCar(null);
          setParts([]);
          setError(
            getApiErrorMessage(
              requestError,
              "Could not load this car and its parts."
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      loadCarPage();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const bannerImage = car?.image?.trim()
    ? car.image
    : getBannerPlaceholder(car ? `${car.brand} ${car.model}` : "CAR DETAILS");

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      parts
        .map((part) => part.category?.trim())
        .filter(Boolean)
    );

    return ["All", ...Array.from(uniqueCategories)];
  }, [parts]);

  const filteredParts = useMemo(() => {
    if (activeCategory === "All") {
      return parts;
    }

    return parts.filter((part) => part.category === activeCategory);
  }, [activeCategory, parts]);

  return (
    <section className="page-section">
      <div className="container">
        <Link to="/" className="back-link">
          უკან დაბრუნება
        </Link>

        {isLoading ? (
          <div className="status-panel">
            <h3>Loading car details...</h3>
            <p>The app is requesting the selected car and its parts list.</p>
          </div>
        ) : error ? (
          <div className="status-panel status-panel-error">
            <h3>Could not load this catalog page</h3>
            <p>{error}</p>
            <p className="status-note">
              Make sure the backend server is running and that this car exists in
              your database.
            </p>
          </div>
        ) : car ? (
          <>
            <section className="car-detail-shell">
              <div className="car-banner">
                <div className="car-banner-image">
                  <img src={bannerImage} alt={`${car.brand} ${car.model}`} />
                </div>

                <div className="car-info">
                  <p className="eyebrow">{car.brand}</p>
                  <h1>{car.model}</h1>
                  <p className="car-year">{car.year}</p>
                  <p className="car-description">
                    {car.description || "არ აქვს აღწერა."}
                  </p>
                </div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                
              </div>

            
            </div>

            {parts.length > 0 ? (
              <>
                <div className="filter-toolbar">
                  <div className="filter-toolbar-copy">
                    <p className="eyebrow">გაფილტვრა</p>
                    <h3>კატეგორიით მოძებნა</h3>
                  </div>

                  <div className="filter-pills">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`filter-pill ${
                          activeCategory === category ? "is-active" : ""
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="parts-toolbar">
                  <p className="parts-summary">
                    Showing <strong>{filteredParts.length}</strong> of{" "}
                    <strong>{parts.length}</strong> parts
                    {activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
                  </p>
                </div>

                {filteredParts.length > 0 ? (
                  <div className="parts-grid">
                    {filteredParts.map((part) => (
                      <PartCard key={part._id || part.id} part={part} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No parts in this category</h3>
                    <p>
                      Try another filter or add more parts for this car from the
                      admin page.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <h3>No parts found</h3>
                <p>This car exists, but there are no parts saved for it yet.</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>Car not found</h3>
            <p>The requested car could not be found.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CarPage;
