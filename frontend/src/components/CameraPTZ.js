import { Box, IconButton, useColorModeValue } from "@chakra-ui/react";
import {
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import axios from "axios";
import React, { useState, useEffect } from "react";

const CameraPTZ = ({ deviceId }) => {
  const bgColor = useColorModeValue(
    "rgba(0, 0, 0, 0.6)",
    "rgba(255, 255, 255, 0.6)"
  );
  const iconColor = useColorModeValue("#fff", "#000");

  const [topPosition, setTopPosition] = useState("70%");
  const [rightPosition, setRightPosition] = useState("7%");

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 321) {
        setTopPosition("7%");
        setRightPosition("1%");
      } else if (screenWidth < 376) {
        setTopPosition("16%");
        setRightPosition("1%");
      } else if (screenWidth < 481) {
        setTopPosition("21%");
        setRightPosition("1%");
      } else if (screenWidth < 769) {
        setTopPosition("38%");
        setRightPosition("1%");
      } else if (screenWidth < 1025) {
        setTopPosition("47%");
        setRightPosition("1%");
      } else {
        setTopPosition("60%");
        setRightPosition("1%");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const handlePTZControl = async (direction) => {
    const username = "admin";
    const password = "";
    const moveDuration = 1000;

    const actionMap = {
      LEFT: "left",
      RIGHT: "right",
      UP: "up",
      DOWN: "down",
    };

    if (!actionMap[direction]) return;

    const ptzParams = {
      "-step": 0,
      "-act": actionMap[direction],
      "-speed": "2",
      "-presetNUM": 1,
      deviceId: `${deviceId}.torqueverse.dev`,
    };

    const authHeader = "Basic " + btoa(`${username}:${password}`);

    try {
      await axios.post(
        "https://adiance-portal-backend-7d9tj.ondigitalocean.app/p2p/ptz",
        ptzParams,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, moveDuration));

      const stopParams = {
        "-step": 0,
        "-act": "stop",
        "-speed": "2",
        "-presetNUM": 1,
        deviceId: `${deviceId}.torqueverse.dev`,
      };

      await axios.post(
        "https://adiance-portal-backend-7d9tj.ondigitalocean.app/p2p/ptz",
        stopParams,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      );
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <Box
      position="absolute"
      top={topPosition}
      right={rightPosition}
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      gridTemplateRows="repeat(3, 1fr)"
      gap="5px"
      alignItems="center"
      justifyContent="center"
      zIndex={100}
    >
      <Box />
      <IconButton
        aria-label="Move Up"
        icon={<FiArrowUp />}
        onClick={() => handlePTZControl("UP")}
        bg={bgColor}
        color={iconColor}
        borderRadius="full"
        w={{ base: "30px", md: "44px" }} // Slightly bigger on mobile
        h={{ base: "30px", md: "44px" }} // Keep it circular
        minW="unset"
      />
      <Box />
      <IconButton
        aria-label="Move Left"
        icon={<FiArrowLeft />}
        onClick={() => handlePTZControl("LEFT")}
        bg={bgColor}
        color={iconColor}
        borderRadius="full"
        w={{ base: "30px", md: "44px" }} // Slightly bigger on mobile
        h={{ base: "30px", md: "44px" }} // Keep it circular
        minW="unset"
      />
      <Box />
      <IconButton
        aria-label="Move Right"
        icon={<FiArrowRight />}
        onClick={() => handlePTZControl("RIGHT")}
        bg={bgColor}
        color={iconColor}
        borderRadius="full"
        w={{ base: "30px", md: "44px" }} // Slightly bigger on mobile
        h={{ base: "30px", md: "44px" }} // Keep it circular
        minW="unset"
      />
      <Box />
      <IconButton
        aria-label="Move Down"
        icon={<FiArrowDown />}
        onClick={() => handlePTZControl("DOWN")}
        bg={bgColor}
        color={iconColor}
        borderRadius="full"
        w={{ base: "30px", md: "44px" }} // Slightly bigger on mobile
        h={{ base: "30px", md: "44px" }} // Keep it circular
        minW="unset"
      />
      <Box />
    </Box>
  );
};

export default CameraPTZ;
