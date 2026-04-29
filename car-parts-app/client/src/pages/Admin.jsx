import { useEffect, useMemo, useState } from "react";

import {
  clearStoredAdminToken,
  hasStoredAdminToken,
  setStoredAdminToken,
} from "../services/auth";
import {
  createCar,
  createPartForCar,
  deleteCarById,
  deletePartById,
  getAdminSession,
  getApiErrorMessage,
  getCars,
  getPartsByCarId,
  isUnauthorizedError,
  loginAdmin,
} from "../services/api";
import { getCarPlaceholder } from "../services/placeholders";

const initialCarForm = {
  brand: "",
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
  const [cars, setCars] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [carForm, setCarForm] = useState(initialCarForm);
  const [partForm, setPartForm] = useState(initialPartForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [carsLoading, setCarsLoading] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
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

  const resetAdminState = () => {
    setCars([]);
    setParts([]);
    setSelectedCarId("");
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
      logoutAdminUser("Your admin session expired. Please sign in again.");
      return;
    }

    setPageError(getApiErrorMessage(error, fallbackMessage));
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
      handleProtectedError(error, "Could not load admin catalog data.");
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
      handleProtectedError(error, "Could not load parts for this car.");
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
          logoutAdminUser("Please sign in to access the admin area.");
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
        getApiErrorMessage(error, "Could not sign in to the admin area.")
      );
    } finally {
      setAuthSubmitting(false);
      setAuthChecking(false);
    }
  };

  const handleLogout = () => {
    logoutAdminUser("You have been signed out of admin.");
  };

  const handleCreateCar = async (event) => {
    event.preventDefault();

    try {
      setSubmittingCar(true);
      setPageError("");
      setNotice("");

      const createdCar = await createCar(carForm);

      setCarForm(initialCarForm);
      setNotice(`Car "${createdCar.brand} ${createdCar.model}" was added.`);
      await loadCars(createdCar._id);
    } catch (error) {
      handleProtectedError(error, "Could not create car.");
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleDeleteCar = async (car) => {
    const shouldDelete = window.confirm(
      `Delete ${car.brand} ${car.model}? This will also remove its parts.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError("");
      setNotice("");

      await deleteCarById(car._id);
      setNotice(`Car "${car.brand} ${car.model}" was deleted.`);
      await loadCars(car._id === selectedCarId ? "" : selectedCarId);
    } catch (error) {
      handleProtectedError(error, "Could not delete car.");
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
      setNotice("Part added to the selected car.");
      await loadParts(selectedCarId);
    } catch (error) {
      handleProtectedError(error, "Could not create part.");
    } finally {
      setSubmittingPart(false);
    }
  };

  const handleDeletePart = async (part) => {
    const shouldDelete = window.confirm(`Delete part "${part.name}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError("");
      setNotice("");

      await deletePartById(part._id);
      setNotice(`Part "${part.name}" was deleted.`);
      await loadParts(selectedCarId);
    } catch (error) {
      handleProtectedError(error, "Could not delete part.");
    }
  };

  const selectedCarImage = selectedCar
    ? selectedCar.image?.trim() ||
      getCarPlaceholder(`${selectedCar.brand} ${selectedCar.model}`)
    : getCarPlaceholder("SELECT A CAR");

  if (authChecking) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="status-panel">
            <h3>Checking admin access...</h3>
            <p>
              The app is verifying whether you already have an active admin
              session.
            </p>
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
              <p className="eyebrow">Admin Login</p>
              <h1>Only you can manage the catalog</h1>
              <p>
                Public visitors can browse cars and parts, but only the configured
                admin account can create, edit, or delete catalog data.
              </p>

              {authError ? (
                <div className="auth-error">
                  <strong>Access denied</strong>
                  <p>{authError}</p>
                </div>
              ) : null}

              <form className="auth-form" onSubmit={handleLogin}>
                <label className="admin-field">
                  <span>Username</span>
                  <input
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginFormChange}
                    required
                  />
                </label>

                <label className="admin-field">
                  <span>Password</span>
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
                  {authSubmitting ? "Signing in..." : "Sign In"}
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
            <p className="eyebrow">Admin</p>
            <h1>Add cars and manage parts</h1>
            <p>
              Signed in as <strong>{adminUsername}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </section>

        {notice ? (
          <div className="status-panel admin-notice">
            <h3>Update saved</h3>
            <p>{notice}</p>
          </div>
        ) : null}

        {pageError ? (
          <div className="status-panel status-panel-error">
            <h3>Admin request failed</h3>
            <p>{pageError}</p>
          </div>
        ) : null}

        <div className="admin-layout">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">Add Car</p>
                <h2>Create a new car entry</h2>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleCreateCar}>
              <label className="admin-field">
                <span>Brand</span>
                <input
                  name="brand"
                  value={carForm.brand}
                  onChange={handleCarFormChange}
                  placeholder="Mercedes-Benz"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Model</span>
                <input
                  name="model"
                  value={carForm.model}
                  onChange={handleCarFormChange}
                  placeholder="CLS-Class C218"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Year</span>
                <input
                  name="year"
                  value={carForm.year}
                  onChange={handleCarFormChange}
                  placeholder="2015-2017"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Image URL</span>
                <input
                  name="image"
                  value={carForm.image}
                  onChange={handleCarFormChange}
                  placeholder="https://example.com/car.jpg"
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>Description</span>
                <textarea
                  name="description"
                  value={carForm.description}
                  onChange={handleCarFormChange}
                  rows="4"
                  placeholder="Short description for this car"
                />
              </label>

              <button
                className="admin-button"
                type="submit"
                disabled={submittingCar}
              >
                {submittingCar ? "Adding car..." : "Add Car"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">Cars</p>
                <h2>Manage existing cars</h2>
              </div>
              <span className="admin-count">{cars.length} total</span>
            </div>

            {carsLoading ? (
              <div className="admin-empty">
                <h3>Loading cars...</h3>
                <p>The admin page is requesting the car list.</p>
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
                          Manage Parts
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button-danger"
                          onClick={() => handleDeleteCar(car)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">
                <h3>No cars have been added yet</h3>
                <p>Create your first car with the form on the left.</p>
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel-wide">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">Manage Parts</p>
              <h2>Parts for the selected car</h2>
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
                    {selectedCar.description || "No description available."}
                  </p>
                </div>
              </div>

              <div className="admin-layout admin-layout-parts">
                <section className="admin-subpanel">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="eyebrow">Add Part</p>
                      <h3>Create a part for this car</h3>
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleCreatePart}>
                    <label className="admin-field">
                      <span>Part Name</span>
                      <input
                        name="name"
                        value={partForm.name}
                        onChange={handlePartFormChange}
                        placeholder="Front bumper"
                        required
                      />
                    </label>

                    <label className="admin-field">
                      <span>Code</span>
                      <input
                        name="code"
                        value={partForm.code}
                        onChange={handlePartFormChange}
                        placeholder="158800012"
                        required
                      />
                    </label>

                    <label className="admin-field">
                      <span>Price</span>
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
                      <span>Category</span>
                      <select
                        name="category"
                        value={partForm.category}
                        onChange={handlePartFormChange}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Condition</span>
                      <select
                        name="condition"
                        value={partForm.condition}
                        onChange={handlePartFormChange}
                      >
                        {conditions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Image URL</span>
                      <input
                        name="image"
                        value={partForm.image}
                        onChange={handlePartFormChange}
                        placeholder="https://example.com/part.jpg"
                      />
                    </label>

                    <label className="admin-field admin-field-full">
                      <span>Description</span>
                      <textarea
                        name="description"
                        value={partForm.description}
                        onChange={handlePartFormChange}
                        rows="4"
                        placeholder="Short description for this part"
                      />
                    </label>

                    <button
                      className="admin-button"
                      type="submit"
                      disabled={submittingPart}
                    >
                      {submittingPart ? "Adding part..." : "Add Part"}
                    </button>
                  </form>
                </section>

                <section className="admin-subpanel">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="eyebrow">Current Parts</p>
                      <h3>Parts saved for this car</h3>
                    </div>
                    <span className="admin-count">{parts.length} total</span>
                  </div>

                  {partsLoading ? (
                    <div className="admin-empty">
                      <h3>Loading parts...</h3>
                      <p>The selected car&apos;s parts are being loaded.</p>
                    </div>
                  ) : parts.length > 0 ? (
                    <div className="admin-list">
                      {parts.map((part) => (
                        <article key={part._id} className="admin-part-item">
                          <div className="admin-part-summary">
                            <span className="admin-part-code">{part.code}</span>
                            <h4>{part.name}</h4>
                            <p>
                              {part.category} | {part.condition} | $
                              {Number(part.price || 0).toLocaleString()}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => handleDeletePart(part)}
                          >
                            Delete Part
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <h3>No parts added yet</h3>
                      <p>Add the first part for this car using the form.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            <div className="admin-empty">
              <h3>Create or select a car first</h3>
              <p>Select a car above to start managing its parts.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Admin;
