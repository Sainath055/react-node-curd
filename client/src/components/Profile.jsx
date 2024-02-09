import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const initialData = {
  name: "",
  contact: "",
  dob: "",
  age: "",
  password: "",
};

const form_items = [
  { label: "Name", type: "text", name: "name" },
  { label: "Contact", type: "number", name: "contact" },
  { label: "DOB", type: "date", name: "dob" },
  { label: "Age", type: "number", name: "age" },
  { label: "Password", type: "text", name: "password" },
];

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [update, setUpdate] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const loadData = async () => {
    setLoading(true);

    const storedToken = localStorage.getItem("profile");

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);

        const isTokenExpired = decodedToken.exp * 1000 < Date.now();
        if (isTokenExpired) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("profile");
          setToken(null);
        } else {
          setUserData(decodedToken);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        alert("Failed to verify token. Please log in again.");
        localStorage.removeItem("profile");
        setToken(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    const userEmail = userData.email;

    if (
      formData.name.trim() === "" ||
      formData.contact.length === 0 ||
      formData.dob === "" ||
      formData.age.length === 0 ||
      formData.password.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3306/update?email=${encodeURIComponent(userEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            contact: formData.contact,
            dob: formData.dob,
            age: formData.age,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user data");
      }

      const responseData = await response.json();
      const { token, message } = responseData;

      localStorage.setItem("profile", JSON.stringify(token));
      setUpdate(false);
      setFormData(initialData);

      alert(message);
      loadData();
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("profile");
    window.location.href = "/";
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h2>
        {update ? "Update" : "Your "} Profile {update && `- ${userData.email}`}
      </h2>

      {token && userData ? (
        <div>
          <>
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
            <p>Contact: {userData.contact}</p>
            <p>Date of Birth: {new Date(userData.dob).toLocaleDateString()}</p>
            <p>Age: {userData.age}</p>
          </>
          {update && (
            <>
              <div className="update_form">
                {form_items.map((each) => {
                  const name = each.name;
                  return (
                    <div key={each.name}>
                      <label>{each.label}:</label>
                      <input
                        type={each.type}
                        value={formData[name]}
                        onChange={(e) =>
                          setFormData({ ...formData, [name]: e.target.value })
                        }
                      />
                    </div>
                  );
                })}

                <div className="form_btns_grp">
                  <button onClick={handleSubmit}>Save</button>

                  <button onClick={() => setFormData(initialData)}>
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            style={{ marginRight: "20px" }}
            onClick={() => setUpdate(!update)}
          >
            {update ? "Cancel" : "Update"}
          </button>

          {!update && <button onClick={logout}>Logout</button>}
        </div>
      ) : (
        <div>
          <p>No user session found</p>
          <a href="/login">Login</a> <br></br>
          <a href="/register">Register</a>
        </div>
      )}
    </div>
  );
};

export default Profile;
