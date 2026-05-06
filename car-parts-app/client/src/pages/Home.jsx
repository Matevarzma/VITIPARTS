import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import BrandCard from "../components/BrandCard";
import { getApiErrorMessage, getBrands } from "../services/api";

const HOME_BANNER_IMAGE = "/home-banner.png";

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
              "ბრენდების ჩატვირთვა ვერ მოხერხდა."
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

  return (
    <section className="page-section">
      <div className="container">
        <section className="catalog-banner">
          <div className="catalog-banner-visual">
            <img
              src={HOME_BANNER_IMAGE}
              alt="VITIPARTS banner"
            />
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="eyebrow">ბრენდების კატალოგი</p>
            
          </div>
          <p className="section-copy">
            {searchTerm
              ? `ნაჩვენებია ${brands.length}-დან ${filteredBrands.length} ბრენდი მოთხოვნისთვის: "${searchTerm}".`
              : "აირჩიეთ სასურველი ბრენდი"}
          </p>
        </div>

        {isLoading ? (
          <div className="status-panel">
            <h3>ბრენდები იტვირთება...</h3>
            <p>მთავარი გვერდი ხელმისაწვდომი ბრენდების სიას ითხოვს.</p>
          </div>
        ) : error ? (
          <div className="status-panel status-panel-error">
            <h3>ბრენდების კატალოგი ვერ ჩაიტვირთა</h3>
            <p>{error}</p>
            <p className="status-note">
              დარწმუნდით, რომ backend სერვერი მუშაობს `5000` პორტზე და MongoDB
              დაკავშირებულია.
            </p>
          </div>
        ) : brands.length > 0 ? (
          filteredBrands.length > 0 ? (
            <div className="brands-grid">
              {filteredBrands.map((brand) => (
                <BrandCard key={brand._id || brand.id} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>თქვენს ძებნას შესაბამისი ბრენდები ვერ მოიძებნა</h3>
              <p>სცადეთ სხვა ბრენდის სახელი ან საკვანძო სიტყვა.</p>
            </div>
          )
        ) : (
          <div className="empty-state">
            <h3>ბრენდები ჯერ არ არის დამატებული</h3>
            <p>კატალოგის დასაწყებად ადმინის გვერდიდან პირველი ბრენდი დაამატეთ.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
