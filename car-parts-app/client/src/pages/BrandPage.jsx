import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import CarCard from "../components/CarCard";
import {
  getApiErrorMessage,
  getBrandById,
  getCarsByBrandId,
} from "../services/api";
import {
  getBannerPlaceholder,
  getBrandPlaceholder,
} from "../services/placeholders";

function BrandPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [brand, setBrand] = useState(null);
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTerm = searchParams.get("search")?.trim() || "";
  const normalizedSearch = searchTerm.toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const loadBrandPage = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [brandData, carsData] = await Promise.all([
          getBrandById(id),
          getCarsByBrandId(id),
        ]);

        if (isMounted) {
          setBrand(brandData);
          setCars(carsData);
        }
      } catch (requestError) {
        if (isMounted) {
          setBrand(null);
          setCars([]);
          setError(
            getApiErrorMessage(
              requestError,
              "Could not load this brand and its cars."
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
      loadBrandPage();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const filteredCars = useMemo(() => {
    if (!normalizedSearch) {
      return cars;
    }

    return cars.filter((car) => {
      const searchableText = [car.brand, car.model, car.year, car.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [cars, normalizedSearch]);

  const bannerImage = brand?.image?.trim()
    ? brand.image
    : brand
      ? getBrandPlaceholder(brand.name)
      : getBannerPlaceholder("BRAND");

  return (
    <section className="page-section">
      <div className="container">
        <Link to="/" className="back-link">
          Back to brands
        </Link>

        {isLoading ? (
          <div className="status-panel">
            <h3>Loading brand details...</h3>
            <p>The app is requesting the selected brand and its cars list.</p>
          </div>
        ) : error ? (
          <div className="status-panel status-panel-error">
            <h3>Could not load this brand page</h3>
            <p>{error}</p>
            <p className="status-note">
              Make sure the backend server is running and that this brand exists
              in your database.
            </p>
          </div>
        ) : brand ? (
          <>
            <section className="car-detail-shell">
              <div className="car-banner">
                <div className="car-banner-image">
                  <img src={bannerImage} alt={brand.name} />
                </div>

                <div className="car-info">
                  <p className="eyebrow">Brand</p>
                  <h1>{brand.name}</h1>
                  <p className="car-description">
                    {brand.description ||
                      "Choose a car from this brand to open its parts catalog."}
                  </p>
                </div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <p className="eyebrow">Cars</p>
                <h2>Available cars for this brand</h2>
              </div>
              <p className="section-copy">
                {searchTerm
                  ? `Showing ${filteredCars.length} of ${cars.length} cars for "${searchTerm}".`
                  : "Choose one of the cars below to open its parts catalog."}
              </p>
            </div>

            {cars.length > 0 ? (
              filteredCars.length > 0 ? (
                <div className="cars-grid">
                  {filteredCars.map((car) => (
                    <CarCard key={car._id || car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No cars match your search</h3>
                  <p>Try a different model, year, or keyword in the search bar.</p>
                </div>
              )
            ) : (
              <div className="empty-state">
                <h3>No cars available for this brand yet</h3>
                <p>Add cars to this brand from the admin page.</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>Brand not found</h3>
            <p>The requested brand could not be found.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BrandPage;
