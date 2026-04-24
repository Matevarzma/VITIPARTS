import { useEffect, useState } from "react";

import CarCard from "../components/CarCard";
import { getApiErrorMessage, getCars } from "../services/api";
import { getBannerPlaceholder } from "../services/placeholders";

function Home() {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const featuredCar = cars[0];
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
            <img src={bannerImage} alt="Catalog banner" />
          </div>
        </section>

        <div className="section-heading">
          <div>
            
            
          </div>

   
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
          <>
            

            <div className="cars-grid">
              {cars.map((car) => (
                <CarCard key={car._id || car.id} car={car} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No cars available yet</h3>
            <p>Add your first car from the admin page after we build that step.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
