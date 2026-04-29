import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CarCard from "../components/CarCard";
import { getApiErrorMessage, getCars } from "../services/api";
import { getBannerPlaceholder } from "../services/placeholders";

function Home() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTerm = searchParams.get("search")?.trim() || "";
  const normalizedSearch = searchTerm.toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const loadCars = async () => {
      try {
        setIsLoading(true);
        setError("");

        const carsData = await getCars();

        if (isMounted) {
          setCars(carsData);
        }
      } catch (requestError) {
        if (isMounted) {
          setCars([]);
          setError(
            getApiErrorMessage(
              requestError,
              "Could not load cars from the backend."
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCars();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCars = useMemo(() => {
    if (!normalizedSearch) {
      return cars;
    }

    return cars.filter((car) => {
      const searchableText = [
        car.brand,
        car.model,
        car.year,
        car.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [cars, normalizedSearch]);

  const featuredCar = filteredCars[0] || cars[0];
  const bannerImage = featuredCar?.image?.trim()
    ? featuredCar.image
    : getBannerPlaceholder(
        featuredCar
          ? `${featuredCar.brand} ${featuredCar.model}`
          : "VITIPARTS catalog"
      );

  return (
    <section className="page-section">
      <div className="container">
        <section className="catalog-banner">
          <div className="catalog-banner-visual">
            <img
              src={bannerImage}
              alt={
                featuredCar
                  ? `${featuredCar.brand} ${featuredCar.model}`
                  : "Catalog banner"
              }
            />
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="eyebrow">Car Catalog</p>
            <h2>Choose your car first</h2>
          </div>
          <p className="section-copy">
            {searchTerm
              ? `Showing ${filteredCars.length} of ${cars.length} cars for "${searchTerm}".`
              : "Browse by brand, model, and year, then open the matching parts catalog."}
          </p>
        </div>

        {isLoading ? (
          <div className="status-panel">
            <h3>Loading cars...</h3>
            <p>The homepage is requesting the vehicle catalog from the backend.</p>
          </div>
        ) : error ? (
          <div className="status-panel status-panel-error">
            <h3>Could not load the car catalog</h3>
            <p>{error}</p>
            <p className="status-note">
              Make sure the backend server is running on port 5000 and MongoDB is
              connected.
            </p>
          </div>
        ) : cars.length > 0 ? (
          filteredCars.length > 0 ? (
            <div className="cars-grid">
              {filteredCars.map((car) => (
                <CarCard key={car._id || car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No cars match your search</h3>
              <p>Try a different brand, model, or year in the search bar.</p>
            </div>
          )
        ) : (
          <div className="empty-state">
            <h3>No cars available yet</h3>
            <p>Add your first car from the admin page to start the catalog.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
