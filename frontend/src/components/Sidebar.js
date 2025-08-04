import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  useColorModeValue,
  Divider,
  Tooltip,
  Image,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TbDeviceCctv } from "react-icons/tb";
import {
  RiCalendarScheduleLine,
  RiCheckboxMultipleBlankLine,
  RiInformation2Line,
  RiMoneyRupeeCircleLine,
} from "react-icons/ri";
import { IoDocumentTextOutline, IoSettingsOutline } from "react-icons/io5";
import { SiOpenai } from "react-icons/si";

function Sidebar({ isSidebarExpanded, setSidebarExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(
    localStorage.getItem("selectedItem") || "Dashboard"
  );
  const textColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );

  const filterColor = useColorModeValue(
    "brightness(0) invert(0)",
    "brightness(0) invert(1)"
  );

  // Arraylist of menu items
  const menuItems = [
    {
      label: "Dashboard",
      icon: <MdOutlineSpaceDashboard />,
      path: "/dashboard",
    },
    { label: "Camera", icon: <TbDeviceCctv />, path: "/cameras" },
    {
      label: "Multiscreen",
      icon: <RiCheckboxMultipleBlankLine />,
      path: "/multiple",
    },
    { label: "Events", icon: <RiCalendarScheduleLine />, path: "/events" },
    { label: "Events", icon: <RiCalendarScheduleLine />, path: "/events" },
    { label: "Reports", icon: <IoDocumentTextOutline />, path: "/reports" },

    // {
    //   label: "Plans",
    //   icon: <RiMoneyRupeeCircleLine />,
    //   path: "/subscription",
    // },
    { label: "About Arcis", icon: <RiInformation2Line />, path: "/about" },
    // { label: "Settings", icon: <IoSettingsOutline />, path: "/settings" },
  ];

  // Update selectedItem in state and localStorage
  const handleItemClick = (label, path) => {
    setSelectedItem(label);
    localStorage.setItem("selectedItem", label); // Save selected item to localStorage
  };

  // Redirect to /dashboard on first load if no other path is selected
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/login");
      setSelectedItem("Dashboard");
    } else {
      const foundItem = menuItems.find(
        (item) => item.path === location.pathname
      );
      if (foundItem) {
        setSelectedItem(foundItem.label);
      }
    }
  }, [location, navigate]);

  return (
    <Flex>
      <Box
        as="nav"
        boxShadow="1px 2px 20px 1px rgba(0, 0, 0, 0.25)"
        w={
          isSidebarExpanded
            ? ["100%", "150px", "214px"]
            : ["80px", "80px", "80px"]
        }
        transition="width 0.4s ease"
        h="80vh"
        p={isSidebarExpanded ? 3 : 3}
        position="fixed"
        top="100px"
        left="20px"
        zIndex="1000"
        borderRadius="8px"
        bg={useColorModeValue("white", "#231F1F")}
        flexShrink={0}
      >
        {/* Menu Items */}
        <VStack align="start" spacing={6} p={isSidebarExpanded ? 2 : 2}>
          {menuItems.map((item, index) => (
            <Tooltip
              label={item.label || item.labelSrc}
              hasArrow
              placement="right"
              isDisabled={isSidebarExpanded} // Show tooltip only when the sidebar is not expanded
              key={index}
            >
              <Link
                to={item.path}
                key={index}
                onClick={() => handleItemClick(item.label, item.path)}
                style={{ width: "100%" }}
              >
                <Flex
                  cursor="pointer"
                  align="center"
                  w="full"
                  bg={
                    selectedItem === item.label
                      ? "custom.primary"
                      : "transparent"
                  }
                  p={1.5}
                  borderRadius="8px"
                  _hover={{
                    // Add background color on hover if needed
                    "& > *": {
                      color: textColor, // Set hover color to white for both icon and text
                      fontWeight: "700", // Optional: Change font weight on hover for both icon and text
                      filter: filterColor, // Turns the entire box content black
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  <Box
                    color={
                      selectedItem === item.label
                        ? "custom.selectedBottomNavText"
                        : "custom.bottomNavText"
                    }
                    fontSize="23px"
                    filter={
                      selectedItem === item.label
                        ? "saturate(1%) brightness(20%)"
                        : "none"
                    }
                    // p={1}
                  >
                    {item.iconSrc ? (
                      <Image
                        src={item.iconSrc}
                        alt={`${item.label} Icon`}
                        boxSize="30px"
                      />
                    ) : (
                      item.icon
                    )}
                  </Box>

                  {isSidebarExpanded && (
                    <Text
                      ml={item.labelSrc ? 3 : 4}
                      sx={{
                        color:
                          selectedItem === item.label
                            ? "custom.selectedBottomNavText"
                            : "custom.bottomNavText",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: selectedItem === item.label ? "700" : "400",
                        lineHeight: "normal",
                        letterSpacing: "-0.28px",
                      }}
                    >
                      {item.label || item.labelSrc}
                    </Text>
                  )}
                </Flex>
              </Link>
            </Tooltip>
          ))}
          <Divider />
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            opacity={0.5}
          >
            {/* {isSidebarExpanded && ( */}
            <Text
              // ml={4}
              sx={{
                fontSize: "14px",
                fontStyle: "normal",

                lineHeight: "normal",
                letterSpacing: "-0.28px",
              }}
            >
              v0.9.32
            </Text>
            {/* )} */}
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
}

export default Sidebar;
