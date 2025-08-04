import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  textDecoration,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { login, sendOtp, verifyOtp } from "../actions/userActions";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { verifytok } from "../actions/userActions";
import { BsQuestionCircle } from "react-icons/bs";
import theme from "../theme";
// import { registerPushNotifications } from '../actions/notification';
// import io from 'socket.io-client';

const Login = () => {
  const [email, setEmail] = useState(""); // Unified field for email or mobile
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [isMobileNumber, setIsMobileNumber] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue("custom.primary", "custom.darkModePrimary");

  const textColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );
  const showToast = (msg, status) => {
    toast({
      description: msg,
      status: status,
      duration: 3000,
      position: "bottom-left",
      isClosable: true,
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value.toLowerCase()); // Convert to lowercase

    // Check if the input is a mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    setIsMobileNumber(mobileRegex.test(value));
    setIsOtpSent(false); // Reset OTP sent status when input changes
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      const sendOtpResult = await sendOtp(email); // Assuming the sendOtp function exists
      if (sendOtpResult.success) {
        showToast("OTP sent successfully", "success");
        setIsOtpSent(true);
      } else {
        setErrorMessage("Failed to send OTP. Please try again.");
        showToast("Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      console.log("Email:", email, otp);
      const verifyResult = await verifyOtp(email, otp); // Assuming the verifyOtp function exists
      if (verifyResult.success) {
        localStorage.setItem("name", verifyResult.name);
        localStorage.setItem("email", verifyResult.email);
        // Perform any login redirection logic
        navigate("/dashboard");
        showToast("OTP verified successfully. Logging in...", "success");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        showToast("Invalid OTP", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!email || (!password && !isMobileNumber)) {
      setErrorMessage("Please enter all required fields.");
      return;
    }

    try {
      setErrorMessage("");
      setIsLoading(true); // Show loader during login

      const loginResult = await login(email, password);
      console.log("Login result:", loginResult);
      if (loginResult.success) {
        // localStorage.setItem('email', loginResult.user.email);
        navigate("/dashboard");
        showToast("Logged in Successfully", "success");
        localStorage.setItem("name", loginResult.name);
        localStorage.setItem("email", loginResult.email);
        localStorage.setItem("role", loginResult.role);
        // registerPushNotifications();
        // socket.on('notification', (data) => {
        //   setNotifications((prev) => [...prev, data]);
        // });
      } else {
        setErrorMessage(loginResult.data);
        showToast(loginResult.data, "error");
      }
    } catch (error) {
      setErrorMessage("Failed to login. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const [loginVisible, setLoginVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Verify token
      const verifyTok = await verifytok();
      // console.log(verifyTok);

      // Handle token verification result
      if (verifyTok === null) {
        setLoginVisible(true);
      } else {
        navigate("/dashboard");
      }
    };

    checkLoginStatus();
    // Check for small screen based on window height
    function handleResize() {
      setIsSmallScreen(window.innerHeight < 676);
    }

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Grid
      h="100vh"
      templateColumns={{ base: "1fr", md: "1fr 1fr" }} // Single column on mobile, two columns on desktop
      bg={useColorModeValue("white", "#231F1F")}
    >
      {/* Image section - only visible on md (tablet) and larger */}
      <Box
        // display={{ base: "none", md: "block" }} // Hide image section on mobile
        // bg="gray.100"
        display={{ base: "none", md: "flex" }}
        // justifyContent={'center'}
        alignItems={"center"}
        bg={useColorModeValue("white", "#231F1F")}
        h="100%"
      >
        <Image
          src={"./images/sideImage2.png"}
          alt="Login Image"
          objectFit="contain"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          h="80vh"
          // w="100%"
        />
      </Box>

      {/* Form section */}
      <Flex
        justify="center"
        align="center"
        p={8}
        bg={useColorModeValue("white", "#231F1F")}
      >
        <Box w="100%" maxW="400px">
          {/* Add Image Above the Heading */}
          <Box
            mb={1}
            display={{ base: "flex", md: "none" }}
            justifyContent={"space-between"}
            alignItems={"center"}
            width={"100%"}
          >
            <Box flex="0 0 65%" display="flex" justifyContent="center">
              <Image
                src="/images/ArcisAiLogo.png"
                alt="Arcis Logo"
                boxSize={"120px"}
                margin={"0 0 0 auto"}
                objectFit={"contain"}
              />
            </Box>

            <IconButton
              icon={<BsQuestionCircle size="26px" opacity={0.5} />}
              aria-label="Help"
              variant="plain" // Navigate back in browser history
              display={{ base: "block", md: "none" }}
            />
          </Box>

          <Flex
            justifyContent={{ base: "center", md: "space-between" }}
            alignItems={"center"}
            mb={3}
          >
            <Heading
              as="h2"
              size="lg"
              textAlign={{ base: "center", md: "left" }}
            >
              Welcome Back
            </Heading>
            <IconButton
              icon={<BsQuestionCircle size="26px" opacity={0.5} />}
              aria-label="Help"
              variant="plain" // Navigate back in browser history
              display={{ base: "none", md: "block" }}
            />
          </Flex>
          <Text
            mb={4}
            textAlign={{ base: "center", md: "left" }}
            color={"#65758B"}
          >
            Welcome Back! Please enter your details to get access to your
            digital vision.
          </Text>

          {/* Form */}
          <Box as="form">
            <Text>Email/Mobile number</Text>
            <Input
              type="text"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email or mobile number"
              mb={4}
              _focus={{
                borderColor: theme.colors.custom.primary, // Custom purple border color on focus
                boxShadow: ` 0 0 0 1px ${theme.colors.custom.primary}`, // Custom purple box shadow
              }}
            />

            {!isMobileNumber && (
              <>
                <Text>Password</Text>
                <InputGroup mb={1}>
                  <Input
                    _focus={{
                      borderColor: theme.colors.custom.primary, // Custom purple border color on focus
                      boxShadow: ` 0 0 0 1px ${theme.colors.custom.primary}`, // Custom purple box shadow
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <ViewIcon /> : <ViewOffIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      size="lg"
                      variant="plain"
                    />
                  </InputRightElement>
                </InputGroup>

                <Text mb={4} color={"red.500"}>
                  {errorMessage && <Text>{errorMessage}</Text>}
                </Text>
              </>
            )}

            <Box>
              {isMobileNumber && !isOtpSent && (
                <Button
                  bg={bgColor}
                  color="custom.lightModeText" // Optional: Set the text color
                  loadingText="Sending OTP..."
                  width="100%"
                  onClick={handleSendOtp}
                >
                  Send OTP
                </Button>
              )}

              {isOtpSent && (
                <>
                  <Box mb={4}>
                    <Text htmlFor="otp">Enter OTP</Text>
                    <Input
                      type="text"
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </Box>
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    width="100%"
                  >
                    {isLoading ? "Verifying OTP..." : "Verify OTP"}
                  </Button>
                </>
              )}

              {!isMobileNumber && (
                <Button
                  type="submit"
                  color={textColor}
                  bg={bgColor}
                  loadingText="Logging in..."
                  onClick={handleLogin}
                  width="100%"
                  mb={3}
                >
                  Sign in
                </Button>
              )}
            </Box>

            {!isMobileNumber && (
              <Flex justify="space-between" align="center" mt={1} mb={4}>
                <Checkbox
                  sx={{
                    "& .chakra-checkbox__control": {
                      _checked: {
                        bg: "#C8D6E5", // Background color when checked
                        borderColor: "#C8D6E5", // Border color when checked
                        color: "black",
                      },
                    },
                  }}
                >
                  Remember for 30 days
                </Checkbox>
                <Link
                  to={"/forgotPassword"}
                  style={{ color: "#65758B", fontWeight: "bolder" }}
                >
                  Forgot password
                </Link>
              </Flex>
            )}

            <Text textAlign="center" mb={2} mt={2}>
              Don’t have an account?{" "}
              <Link
                to="/signup"
                style={{ color: "#65758B", fontWeight: "bolder" }}
              >
                Get started
              </Link>
            </Text>
            {/* <Box textAlign="center">OR</Box>
            <Button
              w="100%"
              variant={"ghost"}
              colorScheme="gray"
              leftIcon={
                <Image src="https://img.icons8.com/color/16/000000/google-logo.png" />
              }
            >
              Sign in with Google
            </Button> */}
          </Box>
        </Box>
      </Flex>
    </Grid>
  );
};

export default Login;

