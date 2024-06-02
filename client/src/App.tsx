import LandingPage from "./components/LandingPage";
import NavBar from "./NavBar/NavBar";
import RegisterPage from "./components/auth/RegisterPage";
import Profile from "./components/profile"
import LoginPage from "./components/auth/LoginPage";
import logo from "./assets/logo.png"

const App = () => {
  let items = ["Home", "Text", "Videochat", "Profile"]
  return (
    <div>
      <NavBar brandName="StudyBuddy" imageSrcPath={logo}
    navItems={items} />
    </div>
  )
}

export default App;
