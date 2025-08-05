import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getStreamDetails,
  setImageUrl,
  setImageUrll,
} from "../actions/cameraActions";
import Player from "../components/Player";
import axios from "axios";
import MobileHeader from "../components/MobileHeader";
import { RiArrowGoBackLine } from "react-icons/ri";
import { CiStreamOn } from "react-icons/ci";

const CameraView = () => {
  const [device, setDevice] = useState([]);
  const { deviceId } = useParams();
  const location = useLocation();
  const { status } = location.state || {}; // Safely access status
  const navigate = useNavigate();
  const width = useBreakpointValue({ base: "100%" });
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control hooks
  const [isToggled, setIsToggled] = React.useState(false); // Track switch state
  const [videoUrl, setVideoUrl] = useState([]);
  const [noStream, setNoStream] = useState(false);
  const getResponsivePlayerStyle = () => ({
    width,
    height: "auto",
    aspectRatio: "16 / 9",
    borderRadius: "8px",
  });
  const tabActiveColor = useColorModeValue("#141E35", "#65758B");
  const tabInactiveColor = useColorModeValue("#BCB4DA", "#8E8D9F");
  const colorMode = useColorModeValue("light", "dark");
  const textColor = useColorModeValue(
    "custom.secondaryTextColor",
    "custom.darkModeText"
  );
  const url =
    // device?.plan === "LIVE"
    //   ? `https://${device.deviceId}.${device.p2purl}/flv/live_ch0_0.flv?verify=${device.token}`
    //   : `https://${device.mediaUrl}/hdl/DVR/${device.deviceId}.flv`;

      device?.plan === "DVR-300"
         ? `wss://${device.mediaUrl}/jessica/DVR/${device.deviceId}-AI.flv`
         : `wss://${device.mediaUrl}/jessica/DVR/${device.deviceId}.flv`;

  // Function to fetch stream details
  const fetchStreamDetails = async (deviceId) => {
    try {
      const response = await getStreamDetails(deviceId);
      console.log("Get getStreamDetails", response);

      // Check if response contains streamData and set it to device state
      if (
        response.success &&
        response.streamData &&
        response.streamData.length > 0
      ) {
        setDevice(response.streamData[0]);
      } else {
        setDevice({});
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
    } finally {
      // setIsLoading(false); // Stop loading when data is fetched
    }
  };

  // Function to handle toggle switch
  const handleToggle = () => {
    setIsToggled(!isToggled); // Toggle the switch state
    if (!isToggled) {
      onOpen(); // Open the modal when toggled on
    } else {
      onClose(); // Close the modal if toggled off
    }
  };

  // Function to handle modal close
  const handleModalClose = () => {
    onClose();
    setIsToggled(false);
  };

  // function to handle back button click (snapshot)
  const handleBack = () => {
    try {
      // Perform your logic here
      console.log("handleBack function called"); // Log a message to indicate the function is called
      setImageUrll(deviceId); // Set the image URL or any other required action
    } catch (error) {
      console.error("Error in handleBack:", error); // Log the error for debugging
    } finally {
      navigate("/cameras"); // Navigate to the desired URL
    }
  };

  // Fetch stream details when the page loads
  useEffect(() => {
    fetchStreamDetails(deviceId);
  }, [deviceId]);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        const response = await axios.get(
          "https://zmedia.arcisai.io:443/rtmp/api/list"
        );
        const streamData = response.data;
        // console.log(response.data)
        // Filter and find the matching path where StreamName matches moniDevice

        const matchedPaths = streamData
          .filter((item) => item.StreamName === `RTSP-${device.deviceId}`) // Match StreamName with moniDevice
          .map((item) => item.Path); // Extract Path

        // console.log(matchedPaths)
        if (matchedPaths.length > 0) {
          setVideoUrl(matchedPaths);
          setNoStream(false); // Stream found
        } else {
          setVideoUrl([]);
          setNoStream(true); // No stream found
        }

        console.log("Matched Paths:", matchedPaths);
      } catch (error) {
        console.error("Error fetching stream data:", error);
        setNoStream(true); // Handle error case as no stream
      }
    };

    fetchStreamData();
  }, [device]);

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader title="Camera View" />

      <Box
        mt={{ base: "12", md: "0" }}
        mb={{ base: "20", md: "5" }}
        p={{ base: 3, md: 0 }}
        maxW="1440px"
        mx="auto"
        color={useColorModeValue("custom.lightModeText", "custom.darkModeText")}
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          p={{ base: 2, md: 3 }}
          borderBottom="1px solid"
          borderColor="gray.200"
          mb={4}
        >
          <Text
            display="flex"
            fontSize={{ base: "sm", md: "md" }}
            // color="gray.600"
          >
            <Box
              as="span"
              onClick={handleBack}
              cursor="pointer"
              _hover={{ color: "blue.500" }}
              fontWeight={"bold"}
            >
              Camera
            </Box>
            &nbsp;&#62;&nbsp;
            <Box as="span" color={textColor} fontWeight="medium">
              {device.cameraName}
            </Box>
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color={textColor}
            cursor="pointer"
            display="flex"
            alignItems="center"
            _hover={{ color: "blue.500" }}
            onClick={handleBack} // Update as per your back navigation function
          >
            <RiArrowGoBackLine style={{ marginRight: "8px" }} />
            Back
          </Text>
        </Flex>

        <Box
          position="relative"
          borderRadius="lg"
          // overflow="hidden"
          // mb={4}
          height={"auto"}
          aspectRatio="16/9"
          w="100%"
          // boxShadow="lg"
        >
          <Player
            device={device}
            initialPlayUrl={url}
            style={getResponsivePlayerStyle()}
            width="100%"
            height="100%"
            status={status}
            showControls={true}
            className=""
          />
        </Box>
      </Box>

      {/* Ai Stream Modal */}
      {isToggled && (
        <Modal isOpen={isOpen} onClose={handleModalClose} size="full">
          <ModalOverlay />
          <ModalContent bg="white">
            <ModalCloseButton
              position="absolute"
              top="10px"
              right="10px"
              zIndex="10"
              color={"Red"}
            />
            <ModalBody>
              <SimpleGrid columns={2} spacing={2}>
                <Player
                  device={device}
                  style={{ width: "48vw", height: "55vh" }}
                  initialPlayUrl={url}
                  showControls={false}
                />

                {/* Player */}
                {videoUrl.map((aiurl, index) => (
                  <>
                    <Player
                      key={index} // Ensure unique key for each player
                      device={device}
                      style={{ width: "48vw", height: "55vh" }}
                      initialPlayUrl={`https://zmedia.arcisai.io:443/hdl/${aiurl}.flv`} // Map each URL to the player
                      showControls={false}
                    />
                    {/* <Button onClick={() => handleCloseStream(aiurl)}>Close Stream</Button> */}
                  </>
                ))}
              </SimpleGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CameraView;
