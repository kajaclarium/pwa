import { useState, useContext } from "react";
import {
  TextField,
  Box,
  Tab,
  Button,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const Login = () => {
  const [value, setValue] = useState("1");
  const[login,setLogin]=useState(false);
  const[AccountName,setAccountName]=useState("");
  const navigate = useNavigate();
  const { login: authLogin, register: authRegister } =
    useContext(AuthContext);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  /* ------------------------------------------------------------------
      LOGIN (JWT BACKEND)
  ------------------------------------------------------------------ */
  async function handleLogin(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const email = form.get("uname");
    const password = form.get("upass");

    try {
      await authLogin(email, password); // ⬅ uses AuthContext

      setLogin(true);
      setAccountName(email);
      alert("Login successful");

      navigate("/"); // redirect after login
    } catch (err) {
      alert("Invalid Credentials");
      console.error(err);
    }
  }

  /* ------------------------------------------------------------------
      REGISTER (JWT BACKEND)
  ------------------------------------------------------------------ */
  async function handleRegister(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const username = form.get("username");
    const password = form.get("password");

    try {
      const data = await authRegister(username, password, username);

      alert("Registration Successful");
      setValue("1"); // switch back to login tab
    } catch (err) {
      alert("Registration Failed");
      console.error(err);
    }
  }

  return (
    <Box
      className="page-container"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 400,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome
        </Typography>

        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <TabList onChange={handleChange}>
              <Tab label="Sign In" value="1" />
              <Tab label="Sign Up" value="2" />
            </TabList>
          </Box>

          {/* LOGIN TAB */}
          <TabPanel value="1">
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="text"
                name="uname"
                sx={{ mb: 2, pt: 1 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="upass"
                sx={{ mb: 2, pt: 1 }}
                required
              />
              <Button
                variant="contained"
                type="submit"
                size="large"
                fullWidth
              >
                Sign In
              </Button>
            </form>
          </TabPanel>

          {/* REGISTER TAB */}
          <TabPanel value="2">
            <form onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="text"
                  name="username"
                  sx={{ mb: 2, pt: 1 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  sx={{ mb: 2, pt: 1 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  sx={{ mb: 2, pt: 1 }}
                  required
                />
                <Button
                  variant="contained"
                  type="submit"
                  color="success"
                  size="large"
                  fullWidth
                >
                  Create Account
                </Button>
              </Stack>
            </form>
          </TabPanel>
        </TabContext>
      </Paper>
    </Box>
  );
};

export default Login;
