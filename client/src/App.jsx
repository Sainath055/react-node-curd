import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Nav from "./components/Nav";

const App = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/register" Component={Register} />
        <Route path="/login" Component={Login} />
        <Route path="/profile" Component={Profile} />
        {/* Default route */}
        <Route exact path="/" Component={Nav} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
