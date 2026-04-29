import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import BrandCard from "../components/BrandCard";
import { getApiErrorMessage, getBrands } from "../services/api";
import {
  getBannerPlaceholder,
  getBrandPlaceholder,
} from "../services/placeholders";

function Home() {
  const [searchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTerm = searchParams.get("search")?.trim() || "";
  const normalizedSearch = searchTerm.toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const loadBrands = async () => {
      try {
        setIsLoading(true);
        setError("");

        const brandsData = await getBrands();

        if (isMounted) {
          setBrands(brandsData);
        }
      } catch (requestError) {
        if (isMounted) {
          setBrands([]);
          setError(
            getApiErrorMessage(
              requestError,
              "Could not load brands from the backend."
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBrands = useMemo(() => {
    if (!normalizedSearch) {
      return brands;
    }

    return brands.filter((brand) => {
      const searchableText = [brand.name, brand.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [brands, normalizedSearch]);

  const featuredBrand = filteredBrands[0] || brands[0];
  const bannerImage = featuredBrand?.image?.trim()
    ? featuredBrand.image
    : featuredBrand
      ? getBrandPlaceholder(featuredBrand.name)
      : getBannerPlaceholder("VITIPARTS");

  return (
    <section className="page-section">
      <div className="container">
        <section className="catalog-banner">
          <div className="catalog-banner-visual">
            <img
              src={bannerImage}
              alt={featuredBrand ? featuredBrand.name : "Catalog banner"}
            />
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="eyebrow">Brand Catalog</p>
            <h2>Choose a brand first</h2>
          </div>
          <p className="section-copy">
            {searchTerm
              ? `Showing ${filteredBrands.length} of ${brands.length} brands for "${searchTerm}".`
              : "Browse the available brands first, then choose the car you need."}
          </p>
        </div>

        {isLoading ? (
          <div className="status-panel">
            <h3>Loading brands...</h3>
            <p>The homepage is requesting the available car brands.</p>
          </div>
        ) : error ? (
          <div className="status-panel status-panel-error">
            <h3>Could not load the brand catalog</h3>
            <p>{error}</p>
            <p className="status-note">
              Make sure the backend server is running on port 5000 and MongoDB is
              connected.
            </p>
          </div>
        ) : brands.length > 0 ? (
          filteredBrands.length > 0 ? (
            <div className="cars-grid">
              {filteredBrands.map((brand) => (
                <BrandCard key={brand._id || brand.id} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No brands match your search</h3>
              <p>Try a different brand name or keyword in the search bar.</p>
            </div>
          )
        ) : (
          <div className="empty-state">
            <h3>No brands available yet</h3>
            <p>Add your first brand from the admin page to start the catalog.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
