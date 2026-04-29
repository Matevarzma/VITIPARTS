import { useEffect, useMemo, useState } from "react";

import {
  clearStoredAdminToken,
  hasStoredAdminToken,
  setStoredAdminToken,
} from "../services/auth";
import {
  createBrand,
  createCar,
  createPartForCar,
  deleteBrandById,
  deleteCarById,
  deletePartById,
  getAdminSession,
  getApiErrorMessage,
  getBrands,
  getCars,
  getPartsByCarId,
  isUnauthorizedError,
  loginAdmin,
} from "../services/api";
import {
  translateCategory,
  translateCondition,
} from "../services/catalogLabels";
import { getBrandPlaceholder, getCarPlaceholder } from "../services/placeholders";

const initialBrandForm = {
  name: "",
  image: "",
  description: "",
};

const initialCarForm = {
  brandId: "",
  model: "",
  year: "",
  image: "",
  description: "",
};

const initialPartForm = {
  name: "",
  code: "",
  price: "",
  category: "Engine",
  condition: "Used",
  image: "",
  description: "",
};

const initialLoginForm = {
  username: "admin",
  password: "",
};

const categories = ["Engine", "Body", "Interior"];
const conditions = ["New", "Used", "Refurbished"];

function Admin() {
  const [brands, setBrands] = useState([]);
  const [cars, setCars] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [brandForm, setBrandForm] = useState(initialBrandForm);
  const [carForm, setCarForm] = useState(initialCarForm);
  const [partForm, setPartForm] = useState(initialPartForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [submittingCar, setSubmittingCar] = useState(false);
  const [submittingPart, setSubmittingPart] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");

  const selectedCar = useMemo(
    () => cars.find((car) => car._id === selectedCarId) || null,
    [cars, selectedCarId]
  );

  const brandCarCounts = useMemo(() => {
    return cars.reduce((counts, car) => {
      const key = car.brandId || car.brand;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [cars]);

  const resetAdminState = () => {
    setBrands([]);
    setCars([]);
    setParts([]);
    setSelectedCarId("");
    setBrandForm(initialBrandForm);
    setCarForm(initialCarForm);
    setPartForm(initialPartForm);
    setPageError("");
    setNotice("");
  };

  const logoutAdminUser = (message = "") => {
    clearStoredAdminToken();
    setIsAuthenticated(false);
    setAdminUsername("");
    setAuthSubmitting(false);
    setAuthChecking(false);
    setAuthError(message);
    resetAdminState();
  };

  const handleProtectedError = (error, fallbackMessage) => {
    if (isUnauthorizedError(error)) {
      logoutAdminUser("ადმინის სესია ამოიწურა. გთხოვთ თავიდან შეხვიდეთ.");
      return;
    }

    setPageError(getApiErrorMessage(error, fallbackMessage));
  };

  const loadBrands = async (preferredBrandId = "") => {
    try {
      setBrandsLoading(true);
      setPageError("");

      const brandsData = await getBrands();
      setBrands(brandsData);

      setCarForm((currentForm) => {
        const fallbackBrandId =
          preferredBrandId || currentForm.brandId || brandsData[0]?._id || "";
        const matchingBrand = brandsData.find(
          (brand) => brand._id === fallbackBrandId
        );

        return {
          ...currentForm,
          brandId: matchingBrand ? matchingBrand._id : brandsData[0]?._id || "",
        };
      });
    } catch (error) {
      handleProtectedError(error, "ბრენდების ჩატვირთვა ვერ მოხერხდა.");
    } finally {
      setBrandsLoading(false);
    }
  };

  const loadCars = async (preferredCarId = "") => {
    try {
      setCarsLoading(true);
      setPageError("");

      const carsData = await getCars();
      setCars(carsData);

      if (carsData.length === 0) {
        setSelectedCarId("");
        return;
      }

      const fallbackSelectedId = preferredCarId || selectedCarId;
      const nextSelectedCar =
        carsData.find((car) => car._id === fallbackSelectedId) || carsData[0];

      setSelectedCarId(nextSelectedCar._id);
    } catch (error) {
      handleProtectedError(error, "მანქანების სიის ჩატვირთვა ვერ მოხერხდა.");
    } finally {
      setCarsLoading(false);
    }
  };

  const loadParts = async (carId) => {
    if (!carId) {
      setParts([]);
      return;
    }

    try {
      setPartsLoading(true);
      setPageError("");

      const partsData = await getPartsByCarId(carId);
      setParts(partsData);
    } catch (error) {
      handleProtectedError(error, "ამ მანქანის ნაწილების ჩატვირთვა ვერ მოხერხდა.");
      setParts([]);
    } finally {
      setPartsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const validateStoredSession = async () => {
      if (!hasStoredAdminToken()) {
        if (isMounted) {
          setAuthChecking(false);
        }
        return;
      }

      try {
        const session = await getAdminSession();

        if (isMounted) {
          setIsAuthenticated(true);
          setAdminUsername(session.username);
          setAuthError("");
        }
      } catch (error) {
        if (isMounted) {
          logoutAdminUser("გთხოვთ შეხვიდეთ ადმინის სივრცეში.");
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };

    validateStoredSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadBrands();
    loadCars();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadParts(selectedCarId);
  }, [isAuthenticated, selectedCarId]);

  const handleLoginFormChange = (event) => {
    const { name, value } = event.target;

    setLoginForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleBrandFormChange = (event) => {
    const { name, value } = event.target;

    setBrandForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleCarFormChange = (event) => {
    const { name, value } = event.target;

    setCarForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handlePartFormChange = (event) => {
    const { name, value } = event.target;

    setPartForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setAuthSubmitting(true);
      setAuthError("");

      const session = await loginAdmin(loginForm);

      setStoredAdminToken(session.token);
      setIsAuthenticated(true);
      setAdminUsername(session.username);
      setLoginForm((currentForm) => ({
        ...currentForm,
        password: "",
      }));
    } catch (error) {
      setAuthError(
        getApiErrorMessage(error, "ადმინის სივრცეში შესვლა ვერ მოხერხდა.")
      );
    } finally {
      setAuthSubmitting(false);
      setAuthChecking(false);
    }
  };

  const handleLogout = () => {
    logoutAdminUser("ადმინის პროფილიდან გამოხვედით.");
  };

  const handleCreateBrand = async (event) => {
    event.preventDefault();

    try {
      setSubmittingBrand(true);
      setPageError("");
      setNotice("");

      const createdBrand = await createBrand(brandForm);

      setBrandForm(initialBrandForm);
      setNotice(`ბრენდი "${createdBrand.name}" წარმატებით დაემატა.`);
      await loadBrands(createdBrand._id);
      await loadCars();
    } catch (error) {
      handleProtectedError(error, "ბრენდის დამატება ვერ მოხერხდა.");
    } finally {
      setSubmittingBrand(false);
    }
  };

  const handleCreateCar = async (event) => {
    event.preventDefault();

    try {
      setSubmittingCar(true);
      setPageError("");
      setNotice("");

      const createdCar = await createCar(carForm);

      setCarForm((currentForm) => ({
        ...initialCarForm,
        brandId: currentForm.brandId,
      }));
      setNotice(`მანქანა "${createdCar.brand} ${createdCar.model}" დაემატა.`);
      await loadCars(createdCar._id);
    } catch (error) {
      handleProtectedError(error, "მანქანის დამატება ვერ მოხერხდა.");
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleDeleteBrand = async (brand) => {
    const shouldDelete = window.confirm(
      `ნამდვილად გსურთ "${brand.name}" ბრენდის წაშლა? მასთან დაკავშირებული მანქანები და ნაწილებიც წაიშლება.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError("");
      setNotice("");

      await deleteBrandById(brand._id);
      setNotice(`ბრენდი "${brand.name}" წაიშალა.`);
      await loadBrands();
      await loadCars();
    } catch (error) {
      handleProtectedError(error, "ბრენდის წაშლა ვერ მოხერხდა.");
    }
  };

  const handleDeleteCar = async (car) => {
    const shouldDelete = window.confirm(
      `ნამდვილად გსურთ ${car.brand} ${car.model}-ის წაშლა? მასთან დაკავშირებული ნაწილებიც წაიშლება.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError("");
      setNotice("");

      await deleteCarById(car._id);
      setNotice(`მანქანა "${car.brand} ${car.model}" წაიშალა.`);
      await loadCars(car._id === selectedCarId ? "" : selectedCarId);
    } catch (error) {
      handleProtectedError(error, "მანქანის წაშლა ვერ მოხერხდა.");
    }
  };

  const handleCreatePart = async (event) => {
    event.preventDefault();

    if (!selectedCarId) {
      return;
    }

    try {
      setSubmittingPart(true);
      setPageError("");
      setNotice("");

      await createPartForCar(selectedCarId, {
        ...partForm,
        price: Number(partForm.price),
      });

      setPartForm(initialPartForm);
      setNotice("ნაწილი წარმატებით დაემატა არჩეულ მანქანას.");
      await loadParts(selectedCarId);
    } catch (error) {
      handleProtectedError(error, "ნაწილის დამატება ვერ მოხერხდა.");
    } finally {
      setSubmittingPart(false);
    }
  };

  const handleDeletePart = async (part) => {
    const shouldDelete = window.confirm(
      `ნამდვილად გსურთ "${part.name}" ნაწილის წაშლა?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError("");
      setNotice("");

      await deletePartById(part._id);
      setNotice(`ნაწილი "${part.name}" წაიშალა.`);
      await loadParts(selectedCarId);
    } catch (error) {
      handleProtectedError(error, "ნაწილის წაშლა ვერ მოხერხდა.");
    }
  };

  const selectedCarImage = selectedCar
    ? selectedCar.image?.trim() ||
      getCarPlaceholder(`${selectedCar.brand} ${selectedCar.model}`)
    : getCarPlaceholder("აირჩიეთ მანქანა");

  if (authChecking) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="status-panel">
            <h3>ადმინის წვდომა მოწმდება...</h3>
            <p>სისტემა ამოწმებს, გაქვთ თუ არა აქტიური ადმინის სესია.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="auth-shell">
            <section className="auth-card">
              <p className="eyebrow">ადმინის შესვლა</p>
              <h1>კატალოგის მართვა მხოლოდ თქვენ შეგიძლიათ</h1>
              <p>
                მომხმარებლებს შეუძლიათ ბრენდების, მანქანებისა და ნაწილების
                ნახვა, მაგრამ დამატება, შეცვლა და წაშლა მხოლოდ ადმინის ანგარიშით
                არის შესაძლებელი.
              </p>

              {authError ? (
                <div className="auth-error">
                  <strong>წვდომა უარყოფილია</strong>
                  <p>{authError}</p>
                </div>
              ) : null}

              <form className="auth-form" onSubmit={handleLogin}>
                <label className="admin-field">
                  <span>მომხმარებლის სახელი</span>
                  <input
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginFormChange}
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>პაროლი</span>
                  <input
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginFormChange}
                    required
                  />
                </label>

                <button
                  className="admin-button"
                  type="submit"
                  disabled={authSubmitting}
                >
                  {authSubmitting ? "შესვლა მიმდინარეობს..." : "შესვლა"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <section className="placeholder-panel admin-intro admin-intro-bar">
          <div>
            <p className="eyebrow">ადმინი</p>
            <h1>ბრენდების, მანქანებისა და ნაწილების მართვა</h1>
            <p>
              სისტემაში შესულია: <strong>{adminUsername}</strong>
            </p>
          </div>

          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={handleLogout}
          >
            გამოსვლა
          </button>
        </section>

        {notice ? (
          <div className="status-panel admin-notice">
            <h3>ცვლილება შენახულია</h3>
            <p>{notice}</p>
          </div>
        ) : null}

        {pageError ? (
          <div className="status-panel status-panel-error">
            <h3>მოთხოვნა ვერ შესრულდა</h3>
            <p>{pageError}</p>
          </div>
        ) : null}

        <div className="admin-layout">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">ბრენდის დამატება</p>
                <h2>ახალი ბრენდის შექმნა</h2>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleCreateBrand}>
              <label className="admin-field">
                <span>ბრენდის სახელი</span>
                <input
                  name="name"
                  value={brandForm.name}
                  onChange={handleBrandFormChange}
                  placeholder="Mercedes-Benz"
                  required
                />
              </label>

              <label className="admin-field">
                <span>სურათის ბმული</span>
                <input
                  name="image"
                  value={brandForm.image}
                  onChange={handleBrandFormChange}
                  placeholder="https://example.com/brand.jpg"
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>აღწერა</span>
                <textarea
                  name="description"
                  value={brandForm.description}
                  onChange={handleBrandFormChange}
                  rows="4"
                  placeholder="ბრენდის მოკლე აღწერა"
                />
              </label>

              <button
                className="admin-button"
                type="submit"
                disabled={submittingBrand}
              >
                {submittingBrand ? "ბრენდი ემატება..." : "ბრენდის დამატება"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">ბრენდები</p>
                <h2>შენახული ბრენდები</h2>
              </div>
              <span className="admin-count">სულ {brands.length}</span>
            </div>

            {brandsLoading ? (
              <div className="admin-empty">
                <h3>ბრენდები იტვირთება...</h3>
                <p>ადმინის გვერდი ბრენდების სიას ითხოვს.</p>
              </div>
            ) : brands.length > 0 ? (
              <div className="admin-list">
                {brands.map((brand) => {
                  const brandImage =
                    brand.image?.trim() || getBrandPlaceholder(brand.name);
                  const carCount = brandCarCounts[brand._id] || 0;

                  return (
                    <article key={brand._id} className="admin-car-item">
                      <div className="admin-brand-thumb">
                        <img src={brandImage} alt={brand.name} />
                      </div>

                      <div className="admin-car-summary">
                        <h3>{brand.name}</h3>
                        <p>
                          ამ ბრენდში {carCount} მანქანაა დამატებული
                        </p>
                      </div>

                      <div className="admin-car-actions">
                        <button
                          type="button"
                          className="admin-button admin-button-danger"
                          onClick={() => handleDeleteBrand(brand)}
                        >
                          წაშლა
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">
                <h3>ბრენდები ჯერ არ არის დამატებული</h3>
                <p>პირველი ბრენდი მარცხენა ფორმით დაამატეთ.</p>
              </div>
            )}
          </section>
        </div>

        <div className="admin-layout">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">მანქანის დამატება</p>
                <h2>ახალი მანქანის შექმნა</h2>
              </div>
            </div>

            {brands.length > 0 ? (
              <form className="admin-form" onSubmit={handleCreateCar}>
                <label className="admin-field">
                  <span>ბრენდი</span>
                  <select
                    name="brandId"
                    value={carForm.brandId}
                    onChange={handleCarFormChange}
                    required
                  >
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>მოდელი</span>
                  <input
                    name="model"
                    value={carForm.model}
                    onChange={handleCarFormChange}
                    placeholder="CLS-Class C218"
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>წელი</span>
                  <input
                    name="year"
                    value={carForm.year}
                    onChange={handleCarFormChange}
                    placeholder="2015-2017"
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>სურათის ბმული</span>
                  <input
                    name="image"
                    value={carForm.image}
                    onChange={handleCarFormChange}
                    placeholder="https://example.com/car.jpg"
                  />
                </label>

                <label className="admin-field admin-field-full">
                  <span>აღწერა</span>
                  <textarea
                    name="description"
                    value={carForm.description}
                    onChange={handleCarFormChange}
                    rows="4"
                    placeholder="მანქანის მოკლე აღწერა"
                  />
                </label>

                <button
                  className="admin-button"
                  type="submit"
                  disabled={submittingCar}
                >
                  {submittingCar ? "მანქანა ემატება..." : "მანქანის დამატება"}
                </button>
              </form>
            ) : (
              <div className="admin-empty">
                <h3>ჯერ ბრენდი შექმენით</h3>
                <p>მანქანის დასამატებლად საჭიროა მინიმუმ ერთი ბრენდი.</p>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">მანქანები</p>
                <h2>არსებული მანქანების მართვა</h2>
              </div>
              <span className="admin-count">სულ {cars.length}</span>
            </div>

            {carsLoading ? (
              <div className="admin-empty">
                <h3>მანქანები იტვირთება...</h3>
                <p>ადმინის გვერდი მანქანების სიას ითხოვს.</p>
              </div>
            ) : cars.length > 0 ? (
              <div className="admin-list">
                {cars.map((car) => {
                  const isSelected = car._id === selectedCarId;

                  return (
                    <article
                      key={car._id}
                      className={`admin-car-item ${isSelected ? "is-selected" : ""}`}
                    >
                      <div className="admin-car-summary">
                        <h3>
                          {car.brand} {car.model}
                        </h3>
                        <p>{car.year}</p>
                      </div>

                      <div className="admin-car-actions">
                        <button
                          type="button"
                          className="admin-button admin-button-secondary"
                          onClick={() => setSelectedCarId(car._id)}
                        >
                          ნაწილების მართვა
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button-danger"
                          onClick={() => handleDeleteCar(car)}
                        >
                          წაშლა
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">
                <h3>მანქანები ჯერ არ არის დამატებული</h3>
                <p>ბრენდის შექმნის შემდეგ დაამატეთ პირველი მანქანა.</p>
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel-wide">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">ნაწილების მართვა</p>
              <h2>არჩეული მანქანის ნაწილები</h2>
            </div>
          </div>

          {selectedCar ? (
            <div className="selected-car-shell">
              <div className="selected-car-card">
                <div className="selected-car-image">
                  <img
                    src={selectedCarImage}
                    alt={`${selectedCar.brand} ${selectedCar.model}`}
                  />
                </div>

                <div className="selected-car-details">
                  <p className="eyebrow">{selectedCar.brand}</p>
                  <h3>{selectedCar.model}</h3>
                  <p>{selectedCar.year}</p>
                  <p className="selected-car-description">
                    {selectedCar.description || "აღწერა არ არის დამატებული."}
                  </p>
                </div>
              </div>

              <div className="admin-layout admin-layout-parts">
                <section className="admin-subpanel">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="eyebrow">ნაწილის დამატება</p>
                      <h3>ამ მანქანისთვის ნაწილის შექმნა</h3>
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleCreatePart}>
                    <label className="admin-field">
                      <span>ნაწილის სახელი</span>
                      <input
                        name="name"
                        value={partForm.name}
                        onChange={handlePartFormChange}
                        placeholder="წინა ბამპერი"
                        required
                      />
                    </label>

                    <label className="admin-field">
                      <span>კოდი</span>
                      <input
                        name="code"
                        value={partForm.code}
                        onChange={handlePartFormChange}
                        placeholder="158800012"
                        required
                      />
                    </label>

                    <label className="admin-field">
                      <span>ფასი</span>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={partForm.price}
                        onChange={handlePartFormChange}
                        placeholder="850"
                        required
                      />
                    </label>

                    <label className="admin-field">
                      <span>კატეგორია</span>
                      <select
                        name="category"
                        value={partForm.category}
                        onChange={handlePartFormChange}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {translateCategory(category)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>მდგომარეობა</span>
                      <select
                        name="condition"
                        value={partForm.condition}
                        onChange={handlePartFormChange}
                      >
                        {conditions.map((condition) => (
                          <option key={condition} value={condition}>
                            {translateCondition(condition)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>სურათის ბმული</span>
                      <input
                        name="image"
                        value={partForm.image}
                        onChange={handlePartFormChange}
                        placeholder="https://example.com/part.jpg"
                      />
                    </label>

                    <label className="admin-field admin-field-full">
                      <span>აღწერა</span>
                      <textarea
                        name="description"
                        value={partForm.description}
                        onChange={handlePartFormChange}
                        rows="4"
                        placeholder="ნაწილის მოკლე აღწერა"
                      />
                    </label>

                    <button
                      className="admin-button"
                      type="submit"
                      disabled={submittingPart}
                    >
                      {submittingPart ? "ნაწილი ემატება..." : "ნაწილის დამატება"}
                    </button>
                  </form>
                </section>

                <section className="admin-subpanel">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="eyebrow">არსებული ნაწილები</p>
                      <h3>ამ მანქანისთვის შენახული ნაწილები</h3>
                    </div>
                    <span className="admin-count">სულ {parts.length}</span>
                  </div>

                  {partsLoading ? (
                    <div className="admin-empty">
                      <h3>ნაწილები იტვირთება...</h3>
                      <p>არჩეული მანქანის ნაწილები იტვირთება.</p>
                    </div>
                  ) : parts.length > 0 ? (
                    <div className="admin-list">
                      {parts.map((part) => (
                        <article key={part._id} className="admin-part-item">
                          <div className="admin-part-summary">
                            <span className="admin-part-code">{part.code}</span>
                            <h4>{part.name}</h4>
                            <p>
                              {translateCategory(part.category)} |{" "}
                              {translateCondition(part.condition)} | $
                              {Number(part.price || 0).toLocaleString("ka-GE")}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => handleDeletePart(part)}
                          >
                            წაშლა
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <h3>ნაწილები ჯერ არ არის დამატებული</h3>
                      <p>ამ მანქანისთვის პირველი ნაწილი ზემოთ მოცემული ფორმით დაამატეთ.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            <div className="admin-empty">
              <h3>ჯერ შექმენით ან აირჩიეთ მანქანა</h3>
              <p>ნაწილების სამართავად ზემოდან ერთი მანქანა აირჩიეთ.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Admin;
