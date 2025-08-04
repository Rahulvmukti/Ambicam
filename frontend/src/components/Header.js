import React, { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Button,
  Switch,
  Badge,
  ChakraProvider,
  Text,
  useColorMode,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Divider,
  Icon,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Img,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { TbUser } from "react-icons/tb";
import { SlLock } from "react-icons/sl";
import { CgLogOff } from "react-icons/cg";
import {
  logout,
  logoutFromAllDevices,
  userProfile,
} from "../actions/userActions";
import { useNavigate } from "react-router-dom";
import theme from "../theme";
import { FaRegBell, FaRegUser } from "react-icons/fa6";
import { PiListBulletsBold } from "react-icons/pi";
import { IoPower } from "react-icons/io5";
import { addDevice } from "../actions/cameraActions";
import MyProfile from "./Modals/MyProfile";
import { SiOpenai } from "react-icons/si";

const Header = ({
  toggleTextVisibility,
  isSidebarExpanded,
  setSidebarExpanded,
}) => {
  //   const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeModal, setActiveModal] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [profileDetails, setProfileDetails] = useState("");
  const textColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );
  const toast = useToast();
  // const theme = useTheme();
  const navigate = useNavigate();
  //   const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  const logoutClick = async () => {
    await logout();
    navigate("/login");
  };

  const handleLogoutFromAllDevices = async () => {
    alert("Are you sure you want to Logout from all devices...");
    const response = await logoutFromAllDevices();
    navigate("/login");
  };

  const openModal = (modal) => {
    setActiveModal(modal);
    onOpen();
  };

  const closeModal = () => {
    setActiveModal(null);
    onClose();
  };

  const handleAddDevice = async () => {
    // Logic to handle adding a new device
    if (!cameraName.trim() || !deviceId.trim()) {
      // Display an error or feedback to the user
      alert("Both fields are required to add a device.");
      return;
    }
    try {
      const response = await addDevice(cameraName, deviceId);
      console.log("Device added:", response);
      toast({
        title: "Device Added",
        description: "Device added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add device",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // const fetchUserDetails = async () => {
  //   try {
  //     const response = await userProfile();
  //     console.log(response);
  //     setProfileDetails(response.user);
  //   } catch (error) {
  //     console.error("Error fetching user Details:", error);
  //   }
  // };

  const openProfileModal = (modal) => {
    setActiveModal(modal);
    onOpen();
  };

  const closeProfileModal = () => {
    setActiveModal(null);
    onClose();
  };

  return (
    <Box
      px={6}
      shadow="md"
      w="100%"
      h="75px"
      position={"fixed"}
      boxShadow="0px 2px 20px 1px rgba(0, 0, 0, 0.25)"
      bg={useColorModeValue("white", "#231F1F")}
      color={textColor}
    >
      <Flex h={20} alignItems="center" justifyContent="space-between">
        {/* Company Logo - Left Side */}
        <Flex alignItems="center" gap={4}>
          <IconButton
            size="lg"
            variant="ghost"
            aria-label="Open sidebar"
            colorScheme="white"
            icon={
              // <Image
              //   src="./images/slider.png"
              //   boxSize="24px"
              //   onClick={handleSidebarToggle}
              // />
              <PiListBulletsBold
                fontSize="27px"
                onClick={handleSidebarToggle}
              />
            }
          />
          <Image
            src="/images/ArcisAiLogo.png"
            alt="ArcisAI Logo"
            boxSize="40px"
            w="107px"
            h="24px"
            onClick={() => navigate("/dashboard")}
            cursor={"pointer"}
          />
        </Flex>

        {/* Center Section */}
        <Flex alignItems="center" justifyContent="space-between" gap={6}>
          <Button
            variant="outline"
            // colorScheme="purple"
            //   backgroundColor={"#BF83FC"}
            size="md"
            px={6}
            borderRadius="md"
            _hover={{ bg: theme.colors.custom.primary }}
            transition="all 0.2s"
            fontWeight="normal"
            // color={"black"}
            color={useColorModeValue(
              theme.colors.custom.lightModeText,
              theme.colors.custom.darkModeText
            )}
            onClick={() => {
              openModal("addNewDevice");
            }}
            borderColor={theme.colors.custom.primary}
          >
            Add New Device
          </Button>

          {/* Right Section */}
          <Flex alignItems="center" gap={3}>
            <Text>Light</Text>
            <Switch
              size="md"
              // colorScheme="purple"
              isChecked={colorMode === "dark"} // Bind Switch to the color mode state
              onChange={toggleColorMode}
              sx={{
                "& .chakra-switch__track": {
                  backgroundColor: colorMode === "dark" ? "#54637A" : "#C8D6E5", // Custom track color
                },
                "& .chakra-switch__thumb": {
                  backgroundColor: colorMode === "dark" ? "#C8D6E5" : "#54637A", // Custom thumb color
                },
              }}
            />

            <Text>Dark</Text>
          </Flex>

          <Box position="relative" display="inline-block">
            <Box cursor={"pointer"}>
              <FaRegBell size="20px" />
            </Box>

            {/* Badge: Only show if there are notifications */}
            {/* <Badge
                position="absolute"
                top="0"
                right="0"
                bg="red.500"
                color="white"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="0.75em"
                fontWeight="bold"
                transform="translate(5%, -5%)"
                boxShadow="0 0 5px rgba(0, 0, 0, 0.3)"
              >
                12
              </Badge> */}
          </Box>

          <Menu bg={useColorModeValue("custom.primary", "custom.darModeBg")}>
            <MenuButton
              as={Button}
              p={0}
              variant="outlined"
              cursor="pointer"
              border={0}
              background="none"
            >
              <Box>
                <FaRegUser size="20px" />
              </Box>
            </MenuButton>

            <MenuList
              zIndex="1"
              borderRadius="md" // Use Chakra's predefined sizes for consistency
              boxShadow="md" // Use a slightly stronger shadow for depth
              padding={2} // Use a smaller padding for a more compact look
              h="auto"
            >
              <MenuItem
                background="none"
                border={0}
                display="flex"
                // alignItems="center"
                justifyContent="center"
                opacity={0.8}
              >
                {localStorage.getItem("name")}
              </MenuItem>
              <Divider my={1} w={"100%"} /> {/* Divider added */}
              <MenuItem
                background="none"
                border={0}
                _hover={{
                  bg: "gray.200",
                  color: "black",
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }} // Add hover effect
                display="flex" // Ensure icons and text are aligned
                alignItems="center" // Center the items vertically
                onClick={() => openProfileModal("My Profile")}
              >
                My Profile
              </MenuItem>
              <MenuItem
                background="none"
                border={0}
                _hover={{
                  bg: "gray.200",
                  color: "black",
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }} // Add hover effect
                display="flex" // Ensure icons and text are aligned
                alignItems="center" // Center the items vertically
              >
                Billings and Services
              </MenuItem>
              {/* <MenuItem
                background="none"
                border={0}
                _hover={{
                  bg: "gray.200",
                  color: "black",
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }} // Add hover effect
                display="flex" // Ensure icons and text are aligned
                alignItems="center" // Center the items vertically
              >
                Action History
              </MenuItem> */}
              <MenuItem
                background="none"
                border={0}
                _hover={{
                  bg: "gray.100",
                  color: "black",
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }} // Add hover effect
                display="flex"
                alignItems="center"
                onClick={() => navigate("/changePassword")}
              >
                Change Password
              </MenuItem>
              <Divider my={1} w={"100%"} /> {/* Divider added */}
              <MenuItem
                background="none"
                border={0}
                icon={<CgLogOff fontSize="20px" />}
                onClick={() => {
                  openModal("logout");
                }}
                color="red.600" // Use Chakra's color palette for consistency
                _hover={{
                  bg: "red.50",
                  color: "red.800",
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }} // Add hover effect
                display="flex"
                alignItems="center"
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {/* Add Device Id Modal */}
      <Modal
        onClose={onClose}
        isOpen={isOpen && activeModal === "addNewDevice"}
        isCentered
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent
          bg={useColorModeValue("white", theme.colors.custom.darkModeBg)}
          color={"black"}
        >
          <ModalHeader
            textAlign={"center"}
            p={1}
            mt={4}
            color={useColorModeValue(
              theme.colors.custom.lightModeText,
              theme.colors.custom.darkModeText
            )}
          >
            Add New Device
          </ModalHeader>
          <ModalBody pb={6} textAlign="center">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              width="100%"
              //   padding="10px"
              p={1}
            >
              <FormControl width="350px" mt={5}>
                <FormLabel
                  htmlFor="device-name"
                  textAlign="start"
                  color={useColorModeValue(
                    theme.colors.custom.lightModeText,
                    theme.colors.custom.darkModeText
                  )}
                >
                  Enter Device Name:
                </FormLabel>
                <Input
                  id="device-name"
                  placeholder="Device Name"
                  borderColor="gray"
                  borderRadius="10px"
                  color={textColor}
                  px={4}
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: theme.colors.custom.primary, // Custom purple border color on focus
                    boxShadow: `0 0 0 1px ${theme.colors.custom.primary}`, // Custom purple box shadow
                  }}
                />
              </FormControl>

              <FormControl width="350px" mt={4}>
                <FormLabel
                  htmlFor="device-id"
                  textAlign="start"
                  color={useColorModeValue(
                    theme.colors.custom.lightModeText,
                    theme.colors.custom.darkModeText
                  )}
                >
                  Enter Device ID:
                </FormLabel>
                <Input
                  id="device-id"
                  placeholder="Device ID"
                  borderColor="gray"
                  borderRadius="10px"
                  color={textColor}
                  px={4}
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: theme.colors.custom.primary, // Custom purple border color on focus
                    boxShadow: `0 0 0 1px ${theme.colors.custom.primary}`, // Custom purple box shadow
                  }}
                />
              </FormControl>

              <Text
                fontSize="sm"
                mt={2}
                textAlign="start"
                color="gray.500"
                width="350px"
              >
                Find this ID in your mail
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter marginRight={"10px"} justifyContent={"space-evenly"}>
            <Button
              onClick={onClose}
              w="150px"
              border="1px"
              background="0"
              color="red.500"
              borderColor="red.500"
              _hover={{ background: "none" }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddDevice}
              w="150px"
              background={useColorModeValue(
                theme.colors.custom.primary,
                theme.colors.custom.darkModePrimary
              )}
              color={useColorModeValue(
                theme.colors.custom.lightModeText,
                theme.colors.custom.darkModeText
              )}
              isDisabled={!cameraName.trim() || !deviceId.trim()} // Disable if fields are empty
              fontWeight={"normal"}
              _hover={{
                backgroundColor: useColorModeValue(
                  theme.colors.custom.darkModePrimary,
                  theme.colors.custom.primary
                ),
                color: useColorModeValue(
                  theme.colors.custom.darkModeText,
                  theme.colors.custom.lightModeText
                ),
              }}
            >
              Save Device
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={isOpen && activeModal === "logout"}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          pt={3} // Add padding to the modal content
          pr={3}
          pl={3}
          pb={1}
          borderRadius="8px" // Add border radius for rounded corners
          boxShadow="lg" // Add shadow for a floating effect
          // maxW="400px" // Limit width for better responsiveness
          bg={useColorModeValue("white", "gray.800")}
        >
          <ModalHeader
            textAlign="center"
            fontSize="xl"
            fontWeight="bold"
            color={useColorModeValue("black", "white")}
          >
            Oh no! You're leaving... Are you sure?
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" align="center" justify="center" mt={4}>
              <Icon as={IoPower} color="red.500" boxSize="50px" mb={4} />
              <Text
                textAlign="center"
                color={useColorModeValue("gray.800", "gray.200")}
                fontSize="md"
              >
                You will be signed out of your account. If you have unsaved
                changes, they will be lost.
              </Text>
            </Flex>
          </ModalBody>
          <Box>
            <Flex gap={4} mt={2} justifyContent="center">
              <Button
                onClick={onClose}
                w="150px"
                border="1px"
                background="0"
                color="red.500"
                borderColor="red.500"
                _hover={{ background: "none" }}
              >
                Cancel
              </Button>

              <Button
                w={"150px"}
                background={useColorModeValue(
                  theme.colors.custom.primary,
                  theme.colors.custom.darkModePrimary
                )}
                color={useColorModeValue(
                  theme.colors.custom.lightModeText,
                  theme.colors.custom.darkModeText
                )}
                fontWeight="normal"
                _hover={{
                  backgroundColor: useColorModeValue(
                    theme.colors.custom.darkModePrimary,
                    theme.colors.custom.primary
                  ),
                  color: useColorModeValue(
                    theme.colors.custom.darkModeText,
                    theme.colors.custom.lightModeText
                  ),
                }}
                onClick={logoutClick}
                borderRadius="6px"
              >
                Logout
              </Button>
            </Flex>
          </Box>
          <Divider mt={2} />
          <Flex justifyContent={"center"}>
            <Button
              p={0}
              colorScheme="red"
              variant="ghost"
              textDecoration={"underline"}
              size="sm"
              w={"200px"}
              onClick={() => handleLogoutFromAllDevices()}
            >
              Logout from All Devices
            </Button>
          </Flex>
          {/* <ModalFooter justifyContent="center" >
          </ModalFooter> */}
        </ModalContent>
      </Modal>

      {/* My Profile MOdal */}
      {isOpen && activeModal === "My Profile" && (
        <MyProfile isOpen={isOpen} onClose={onClose} />
      )}
    </Box>
  );
};

export default Header;
