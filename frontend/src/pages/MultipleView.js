import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Select,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { getMultipleCameras } from "../actions/cameraActions";
import Player from "../components/Player";
import NoCameraFound from "../components/NoCameraFound";
import { PullToRefreshify } from "react-pull-to-refreshify";
import Loading from "../components/Loading";
import MobileHeader from "../components/MobileHeader";
import ChatPanel from "./ChatPanel";
import { BsArrowsFullscreen } from "react-icons/bs";
import ChakraPagination from "../components/ChakraPagination";

function MultipleView() {
  const isMobile = window.innerWidth < 768;
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [gridOption, setGridOption] = useState("2x2"); // Default option
  const [gridLayout, setGridLayout] = useState("repeat(2, 1fr)"); //
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [refreshing, setRefreshing] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false); // Fullscreen state
  const containerRef = useRef(null); // Ref for the container
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 100 : 4);
  const width = useBreakpointValue({ base: "100%" });
  const [camerasTab, setCamerasTab] = useState("My Cameras");
  const tabBg = useColorModeValue("#F1EFFE", "#5F4BB6");
  const tabActiveColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );
  const tabInactiveColor = useColorModeValue("#65758B", "custom.tabDarkMode");
  const bgColor = useColorModeValue("custom.primary", "custom.darkModePrimary");
  const textColor = useColorModeValue(
    "custom.lightModeText",
    "custom.darkModeText"
  );

  const selectedTab = useColorModeValue(
    "custom.primary",
    "custom.darkModePrimary"
  );

  // handle method for FullScreen
  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!isFullScreen) {
      container?.requestFullscreen?.() ||
        container?.mozRequestFullScreen?.() ||
        container?.webkitRequestFullscreen?.() ||
        container?.msRequestFullscreen?.();
      container.style.overflow = "hidden";
    } else {
      document.exitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  };

  // handle method to render text at time of Refreshing
  function renderText(pullStatus, percent) {
    switch (pullStatus) {
      case "pulling":
        return (
          <div style={{ display: "flex", alignItems: "center", height: 50 }}>
            <Loading percent={percent} />
            <div
              style={{ whiteSpace: "nowrap", marginLeft: "8px" }}
            >{`Pull down`}</div>
          </div>
        );

      case "canRelease":
        return `Release`;

      case "refreshing":
        return "Refreshing...";

      case "complete":
        return "Refresh succeed";

      default:
        return "";
    }
  }

  // pull to refresh mobile view
  const refreshMultipleCameras = () => {
    return new Promise(async (resolve) => {
      setRefreshing(true);
      try {
        // Wait for 2 seconds before calling fetchMultipleCameras
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchMultipleCameras(); // Fetch new camera data after the delay
        resolve(); // Resolve the promise once the fetch is done
      } catch (error) {
        console.error("Error during camera refresh:", error);
      } finally {
        setRefreshing(false); // Stop the refreshing state after the fetch is complete
      }
    });
  };

  // fetch multiple View  cameras details
  const fetchMultipleCameras = async () => {
    try {
      const response = await getMultipleCameras(activePage, itemsPerPage);
      setCameras(response.data || []);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    } finally {
      setIsLoading(false); // Stop loading when data is fetched
    }
  };

  // function to set index of main camera in mobile view
  const setMainCameraIndex = (index) => {
    if (index >= 0 && index < cameras.data.length) {
      setCurrentCameraIndex(index);
    }
  };

  // function to set player Size
  const getResponsivePlayerStyle = () => ({
    width,
    height: "auto",
    aspectRatio: "16 / 9",
    borderRadius: "8px",
  });

  // funtion to handle grid change
  const handleGridChange = (event) => {
    const value = event.target.value;
    setGridOption(value);
    switch (value) {
      case "2x2":
        setGridLayout("repeat(2, 1fr)");
        setActivePage(1);
        setItemsPerPage(4);
        break;
      case "3x3":
        setGridLayout("repeat(3, 1fr)");
        setActivePage(1);
        setItemsPerPage(9);
        break;
      // case "4x4":
      //   setGridLayout("repeat(4, 1fr)");
      //   setItemsPerPage(16);
      //   break;
      default:
        setGridLayout("repeat(2, 1fr)"); // Fallback to 3x3 grid
        setActivePage(1);
        setItemsPerPage(4);
    }
  };

  // funtion to handle page change
  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // funtion to fetch data initially
  useEffect(() => {
    fetchMultipleCameras();
  }, []);

  // useEffect for FullScreen
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, []);

  // useEffect for Pagination
  useEffect(() => {
    fetchMultipleCameras();
  }, [itemsPerPage, activePage]);

  return (
    <Box
      maxW="1440px"
      mx="auto"
      p={3}
      height={isMobile ? "calc(100vh - 90px)" : "auto"}
    >
      {/* Tabs for Camera view */}
      <Flex
        align="center"
        justifyContent="space-between"
        w="100%"
        mt={{ base: "12", md: "0" }}
      >
        {/* Centered Tabs */}
        <Tabs
          variant="filled"
          bg={useColorModeValue(
            "custom.tabInactiveLightBg",
            "custom.tabInactiveDarkBg"
          )}
          borderRadius="10px"
          boxShadow="1px 1px 10px 0px rgba(0, 0, 0, 0.13) inset"
          mx="auto"
          // minH="35px"
          h={{ base: "auto", md: "auto" }}
          w={{ base: "100%", md: "30%" }} // Full width on mobile
          onChange={(index) =>
            setCamerasTab(["My Cameras", "Shared Cameras"][index])
          }
        >
          <TabList>
            <Tab
              _selected={{
                bg: selectedTab,
                color: tabActiveColor,
                borderRadius: "10px",
                fontWeight: "bold",
              }}
              px={{ base: 0, md: 6 }}
              py={1.5}
              borderRadius="full"
              color={tabInactiveColor}
              h="full" // Ensure full height for consistency
              w={{ base: "50%", md: "50%" }} // Full width on mobile
            >
              Multiple
            </Tab>
            <Tab
              _selected={{
                bg: selectedTab,
                color: tabActiveColor,
                borderRadius: "10px",
                fontWeight: "bold",
              }}
              px={{ base: 0, md: 6 }}
              py={1.5}
              borderRadius="full"
              color={tabInactiveColor}
              w={{ base: "50%", md: "50%" }} // Full width on mobile
              h="full" // Ensure full height for consistency
            >
              AI Multiple
            </Tab>
          </TabList>
        </Tabs>
      </Flex>

      {/* Mobile Header */}
      <MobileHeader title="Multiscreen" />

      {camerasTab === "My Cameras" ? (
        <>
          {isLoading ? (
            // Skeleton Loader
            <SimpleGrid columns={3} spacing={4} mt={{ base: "12", md: "2" }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <GridItem key={index}>
                  <Skeleton height="242px" borderRadius="8px" />
                  <SkeletonText noOfLines={3} spacing="4" />
                </GridItem>
              ))}
            </SimpleGrid>
          ) : cameras.data.length > 0 ? (
            <>
              {/* Mobile View */}
              {isMobile && (
                <PullToRefreshify
                  refreshing={refreshing}
                  onRefresh={refreshMultipleCameras}
                  renderText={renderText}
                >
                  <Box mt={{ base: "2", md: "0" }}>
                    {isLoading ? (
                      // Skeleton Loader for Main Camera View
                      <Skeleton height="172px" borderRadius="8px" />
                    ) : (
                      // Main Camera View
                      cameras.data
                        .slice(currentCameraIndex, currentCameraIndex + 1)
                        .map((camera) => (
                          <Box
                            key={camera.deviceId}
                            borderRadius="md"
                            p={1}
                            mb={2}
                            // mt={10}
                            width="100%"
                            maxW="100%"
                          >
                            <Box position="relative">
                              {camera.status === "online" ? (
                                <Player
                                  device={camera}
                                  initialPlayUrl={
                                    camera?.plan === "LIVE"
                                      ? `https://${camera?.deviceId}.${camera?.p2purl}/flv/live_ch0_0.flv?verify=${camera?.token}`
                                      : `wss://${camera?.mediaUrl}/jessica/DVR/${camera?.deviceId}.flv`
                                  }
                                  width="100%"
                                  style={getResponsivePlayerStyle()}
                                  height="100%"
                                  showControls={false}
                                />
                              ) : (
                                <Text>Camera NOT FOUND</Text>
                              )}
                              {/* {camera.status === "online" && (
                                // <Box
                                //   position="absolute"
                                //   top="2"
                                //   right="2"
                                //   bg="#95DA25"
                                //   borderRadius="full"
                                //   h="13px"
                                //   w="13px"
                                //   aria-label="Active status indicator"
                                // />
                              )} */}
                            </Box>
                            <HStack
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Text fontWeight="bold" fontSize="small" p={1}>
                                {camera.name}
                              </Text>
                            </HStack>
                          </Box>
                        ))
                    )}
                    {/* Mobile Grid */}
                    <Box overflowY="auto" maxH="auto" pb={0}>
                      <SimpleGrid columns={2} spacing={4}>
                        {isLoading
                          ? // Skeleton Loader for Grid Items in Mobile View
                            Array.from({ length: 6 }).map((_, index) => (
                              <GridItem key={index}>
                                <Skeleton height="242px" borderRadius="8px" />
                                <SkeletonText noOfLines={2} spacing="4" />
                              </GridItem>
                            ))
                          : cameras.data.map((camera, index) => (
                              <GridItem key={camera.deviceId}>
                                <Box
                                  onClick={() => setMainCameraIndex(index)}
                                  borderRadius="md"
                                  p={1}
                                  mb={0}
                                  width="100%"
                                >
                                  <Box position="relative">
                                    {camera.status === "online" ? (
                                      <Player
                                        device={camera}
                                        initialPlayUrl={
                                          camera?.plan === "LIVE"
                                            ? `https://${camera?.deviceId}.${camera?.p2purl}/flv/live_ch0_0.flv?verify=${camera?.token}`
                                            : `wss://${camera?.mediaUrl}/jessica/DVR/${camera?.deviceId}.flv`
                                        }
                                        width="100%"
                                        style={getResponsivePlayerStyle()}
                                        height="100%"
                                        showControls={false}
                                      />
                                    ) : (
                                      <Text>Camera NOT FOUND</Text>
                                    )}
                                    {/* {camera.status === "online" && (
                                      <Box
                                        position="absolute"
                                        top="2"
                                        right="2"
                                        bg="#95DA25"
                                        borderRadius="full"
                                        h="13px"
                                        w="13px"
                                        aria-label="Active status indicator"
                                      />
                                    )} */}
                                  </Box>
                                </Box>
                                <HStack
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Text fontWeight="bold" fontSize="xs" p={1}>
                                    {camera.name}
                                  </Text>
                                </HStack>
                              </GridItem>
                            ))}
                      </SimpleGrid>
                    </Box>
                  </Box>
                </PullToRefreshify>
              )}

              {/* Desktop View */}
              {!isMobile && (
                <Box maxW="1440px" mx="auto" mt={0}>
                  {/* Header */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexDirection={{ base: "column", md: "row" }}
                  >
                    <Text
                      fontSize={{ base: "lg", md: "2xl" }}
                      fontWeight="bold"
                    >
                      Multiscreen
                    </Text>
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      gap={2}
                      // width={'100%'}
                    >
                      {/* <ChakraPagination
                        activePage={activePage}
                        totalPages={cameras.totalPages}
                        onPageChange={handlePageChange}
                      /> */}

<Flex align="center" justify="center">
  <Button
    size="sm"
    onClick={() => handlePageChange(activePage - 1)}
    isDisabled={activePage === 1}
    mr={2}
  >
    Previous
  </Button>
 
  {/* Show page numbers */}
  {Array.from({ length: cameras.totalPages }, (_, i) => i + 1)
    .filter(page =>
      page === 1 ||
      page === cameras.totalPages ||
      (page >= activePage - 1 && page <= activePage + 1)
    )
    .map((page, index, array) => (
      <React.Fragment key={page}>
        {index > 0 && array[index - 1] !== page - 1 && (
          <Text mx={2}>...</Text>
        )}
        <Button
          size="sm"
          colorScheme={activePage === page ? "purple" : "gray"}
          variant={activePage === page ? "solid" : "outline"}
          onClick={() => handlePageChange(page)}
          mx={1}
        >
          {page}
        </Button>
      </React.Fragment>
    ))}
 
  <Button
    size="sm"
    onClick={() => handlePageChange(activePage + 1)}
    isDisabled={activePage === cameras.totalPages}
    ml={2}
  >
    Next
  </Button>
</Flex>
                      <Select
                        bg={bgColor}
                        width={{ base: "100%", md: "120px" }}
                        mt={{ base: 2 }}
                        marginBottom={"0"}
                        value={gridOption}
                        onChange={handleGridChange}
                        _hover={{ borderColor: "gray.400" }}
                        borderRadius={"8px"}
                      >
                        <option value="2x2">2x2 Grid</option>
                        <option value="3x3">3x3 Grid</option>
                        {/* <option value="4x4">4x4 Grid</option> */}
                      </Select>

                      <Tooltip
                        label="Fullscreen"
                        aria-label="Fullscreen Tooltip"
                      >
                        <IconButton
                          bg={bgColor}
                          borderRadius={"8px"}
                          icon={<BsArrowsFullscreen />}
                          onClick={toggleFullScreen}
                          boxSize={"10"}
                          variant="outline"
                          aria-label="Fullscreen"
                          _hover={{ borderColor: "gray.400" }}
                        />
                      </Tooltip>
                    </Flex>
                  </Box>

                  {/* Responsive Grid */}
                  <Grid
                    templateColumns={gridLayout}
                    gap={isFullScreen ? 2 : 6}
                    width="100%"
                    pt={2}
                    borderRadius="md"
                    boxShadow="sm"
                    ref={containerRef}
                    overflow={isFullScreen ? "auto" : "hidden"}
                  >
                    {isLoading
                      ? // Skeleton Loader for Grid Items in Desktop View
                        Array.from({ length: 9 }).map((_, index) => (
                          <GridItem key={index}>
                            <Skeleton height="242px" borderRadius="8px" />
                            <SkeletonText noOfLines={2} spacing="4" />
                          </GridItem>
                        ))
                      : cameras.data.map((camera) => (
                          <Box key={camera.deviceId} position="relative">
                            <Box position="relative">
                              {camera.status === "online" ? (
                                <Player
                                  device={camera}
                                  initialPlayUrl={
                                    camera?.plan === "LIVE"
                                      ? `https://${camera?.deviceId}.${camera?.p2purl}/flv/live_ch0_0.flv?verify=${camera?.token}`
                                      : `wss://${camera?.mediaUrl}/jessica/DVR/${camera?.deviceId}.flv`
                                  }
                                  width="100%"
                                  style={getResponsivePlayerStyle()}
                                  height="100%"
                                  showControls={false}
                                />
                              ) : (
                                <Text
                                  fontSize="lg"
                                  fontWeight="semibold"
                                  textAlign="center"
                                  p={4}
                                  color="red.500"
                                >
                                  Camera NOT FOUND
                                </Text>
                              )}
                              {/* {camera.status === "online" && (
                                <Box
                                  position="absolute"
                                  top="2"
                                  right="2"
                                  bg="#95DA25"
                                  borderRadius="full"
                                  h="13px"
                                  w="13px"
                                  aria-label="Active status indicator"
                                /> */}
                              {/* )} */}
                            </Box>
                            <HStack
                              justifyContent="space-between"
                              alignItems="center"
                              display={isFullScreen ? "none" : "flex"}
                            >
                              <Text fontWeight="bold" fontSize="sm" p={1}>
                                {camera.name}
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                  </Grid>
                </Box>
              )}
            </>
          ) : (
            <>
              {isMobile ? (
                <PullToRefreshify
                  refreshing={refreshing}
                  onRefresh={refreshMultipleCameras}
                  renderText={renderText}
                >
                  <NoCameraFound
                    title="Online"
                    description="Check camera connection/plug or contact our support."
                  />
                </PullToRefreshify>
              ) : (
                <NoCameraFound
                  title="Online"
                  description="Check camera connection/plug or contact our support."
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          <ChatPanel />
        </>
      )}
    </Box>
  );
}

export default MultipleView;
