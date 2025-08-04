import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Icon,
  Text,
  Image,
  Flex,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormControl,
  FormLabel,
  ModalFooter,
  Input,
  useToast,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import { FaRegUser } from "react-icons/fa";
import { GoThumbsup } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation
import { RiCalendarScheduleLine } from "react-icons/ri";
import { IoDocumentTextOutline, IoPower } from "react-icons/io5";
import theme from "../theme";
import { logout, logoutFromAllDevices } from "../actions/userActions";
import { addDevice } from "../actions/cameraActions";
import MyProfile from "../components/Modals/MyProfile";
import { TbCoinRupee, TbInfoCircle } from "react-icons/tb";

const menuItems = [
  { icon: FaRegUser, label: "My account", action: "My Profile" },
  { icon: RiCalendarScheduleLine, label: "Events", path: "/events" },
  { icon: IoDocumentTextOutline, label: "Reports", path: "/reports" },
  // { icon: TbCoinRupee, label: "Subscription", path: "/subscription" },
  // { icon: GoThumbsup, label: "Help and feedback", path: "/help" },
  { icon: TbInfoCircle, label: "About ArcisAI", path: "/about" },
];

const Others = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeModal, setActiveModal] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const textColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );
  const logoutClick = async () => {
    await logout();
    navigate("/login");
  };

  const openModal = (modal) => {
    setActiveModal(modal);
    onOpen();
    if (modal === "My Profile") {
      setIsProfileOpen(true); // Open the My Profile modal
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    onClose();
  };

  const handleAddDevice = async () => {
    // Logic to handle adding a new device
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

  const handleLogoutFromAllDevices = async () => {
    alert("Are you sure you want to Logout from all devices...");
    const response = await logoutFromAllDevices();
    navigate("/login");
  };

  return (
    <Box
      bg={useColorModeValue("white", "custom.darModeBg")}
      color={useColorModeValue("custom.lightModeText", "custom.darkModeText")}
      p={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Header */}
      <Flex
        textAlign="center"
        mb={6}
        justifyContent="center"
        alignItems="center"
        direction={"column"}
        mt={10}
      >
        <Image
          src="/images/ArcisAiLogo.png"
          // boxSize={6}
          width={"30%"}
          height={"auto"}
          alt="ArcisAI Logo"
        //   objectFit={"contain"}
        />
        <br />
        <Button
          w="60%"
          variant="outline"
          mt={6}
          color={useColorModeValue(
            theme.colors.custom.lightModeText,
            theme.colors.custom.darkModeText
          )}
          borderColor={theme.colors.custom.primary}
          onClick={() => {
            openModal("addNewDevice");
          }}
        >
          Add new device
        </Button>
      </Flex>

      {/* Menu Items */}
      <VStack align="stretch" spacing={5} w="100%" p={2} flex={0}>
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path}>
            <Flex
              align="center"
              p={1}
              _hover={{
                // Add background color on hover if needed
                "& > *": {
                  color: textColor, // Set hover color to white for both icon and text
                  fontWeight: "700", // Optional: Change font weight on hover for both icon and text
                },
              }}
              onClick={() => openModal(item.action)}
            >
              <Box
                color="custom.bottomNavText"
                fontSize="23px"
                filter="none"
                p={0}
              >
                <Icon as={item.icon} />{" "}
                {/* Use Chakra UI's Icon component to render the icon */}
              </Box>
              <Text
                fontWeight="normal"
                fontSize="18px"
                ml={4}
                color="custom.bottomNavText"
                fontStyle="normal"
                lineHeight="normal"
                letterSpacing="-0.28px"
              >
                {item.label}
              </Text>
            </Flex>
          </Link>
        ))}

        <Flex
          align="center"
          w="full"
          p={1} // Increased padding for better spacing
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "red.50" }} // Enhance hover for logout
          transition="all 0.2s ease"
          onClick={() => {
            openModal("logout");
          }}
        >
          <Icon as={IoPower} boxSize={5} color="red.600" />
          <Text fontSize="lg" color="red.600" fontWeight="semibold" ml={4}>
            Logout
          </Text>
        </Flex>
      </VStack>

      {isOpen && activeModal === "My Profile" && (
        <MyProfile isOpen={isOpen} onClose={onClose} />
      )}

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
        size={{ base: "sm", md: "xl" }} // Set smaller modal for mobile
      >
        <ModalOverlay />
        <ModalContent
          p={{ base: 4, md: 6 }} // Reduce padding on mobile
          borderRadius="8px"
          boxShadow="lg"
          bg={useColorModeValue("white", "gray.800")}
        >
          <ModalHeader
            textAlign="center"
            fontSize={{ base: "lg", md: "xl" }} // Adjust font size for mobile
            fontWeight="bold"
            color={useColorModeValue("black", "white")}
          >
            Oh no! You're leaving... Are you sure?
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" align="center" justify="center" mt={4}>
              <Icon
                as={IoPower}
                color="red.500"
                boxSize={{ base: "40px", md: "50px" }}
                mb={4}
              />
              <Text
                textAlign="center"
                color={useColorModeValue("gray.800", "gray.200")}
                fontSize={{ base: "sm", md: "md" }} // Adjust font size for mobile
              >
                You will be signed out of your account. If you have unsaved
                changes, they will be lost.
              </Text>
            </Flex>
          </ModalBody>
          <Box>
            {" "}
            <Flex gap={4} mt={2} justifyContent="center">
              <Button
                onClick={onClose}
                w={{ base: "120px", md: "150px" }} // Adjust width for mobile
                border="1px"
                background="0"
                color="red.500"
                borderColor="red.500"
                _hover={{ background: "none" }}
              >
                Cancel
              </Button>

              <Button
                w={{ base: "120px", md: "150px" }} // Adjust width for mobile
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
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Others;
