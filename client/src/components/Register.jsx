import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const initialData = {
  name: "",
  email: "",
  contact: "",
  dob: "",
  age: "",
  password: "",
};

const register_items = [
  { label: "Name", type: "text", name: "name" },
  { label: "Email", type: "email", name: "email" },
  { label: "Password", type: "text", name: "password" },
  { label: "Contact", type: "number", name: "contact" },
  { label: "DOB", type: "date", name: "dob" },
  { label: "Age", type: "number", name: "age" },
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    const storedToken = localStorage.getItem("profile");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);

        const isTokenExpired = decodedToken.exp * 1000 < Date.now();
        if (!isTokenExpired) {
          window.location.href = "/profile";
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (
      formData.name.trim() === "" ||
      formData.email.trim() === "" ||
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
      const response = await fetch(`http://localhost:3306/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          dob: formData.dob,
          age: formData.age,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register user");
      }

      const responseData = await response.json();
      const { message, redirectUrl } = responseData;

      setFormData(initialData);
      alert(message);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error registering user :", error);
      alert("Failed to register user. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <h2>Register </h2>
      <div className="update_form">
        {register_items.map((each) => {
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
          <button onClick={handleSubmit}>Create</button>

          <button onClick={() => setFormData(initialData)}>Clear</button>
        </div>
      </div>
    </>
  );
};

export default Register;
