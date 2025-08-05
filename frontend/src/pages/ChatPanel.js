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
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getMultipleCameras } from "../actions/cameraActions";
import Player from "../components/Player";
import NoCameraFound from "../components/NoCameraFound";
import { PullToRefreshify } from "react-pull-to-refreshify";
import Loading from "../components/Loading";
import { BsArrowsFullscreen } from "react-icons/bs";

function ChatPanel() {
  const isMobile = window.innerWidth < 768;
  const [cameras, setCameras] = useState({ data: [], totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 100 : 4);
  const [gridOption, setGridOption] = useState("2x2");
  const [gridLayout, setGridLayout] = useState("repeat(2, 1fr)");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const width = useBreakpointValue({ base: "100%" });
  const bgColor = useColorModeValue("custom.primary", "custom.darkModePrimary");

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

  const fetchMultipleCameras = async () => {
    setIsLoading(true);
    try {
      const response = await getMultipleCameras(activePage, itemsPerPage, "AI");
      setCameras(response.data || { data: [], totalPages: 0 });
    } catch (error) {
      console.error("Error fetching AI cameras:", error);
      setCameras({ data: [], totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // --- KEY CHANGE: Filter the response data on the frontend ---
  // We use useMemo to only re-calculate this list when the camera data changes.
  const filteredCameras = useMemo(() => {
    if (!cameras.data) {
      return []; // Return an empty array if there's no data
    }
    // Return a new array containing only cameras where plan is 300
    // Using String() handles both number (300) and string ("300") values
    return cameras.data.filter(camera => String(camera.plan) === 'DVR-300');
  }, [cameras.data]);


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

  const refreshMultipleCameras = () => {
    return new Promise(async (resolve) => {
      setRefreshing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchMultipleCameras();
        resolve();
      } catch (error) {
        console.error("Error during camera refresh:", error);
      } finally {
        setRefreshing(false);
      }
    });
  };

  const getResponsivePlayerStyle = () => ({
    width,
    height: "auto",
    aspectRatio: "16 / 9",
    borderRadius: "8px",
  });

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
      default:
        setGridLayout("repeat(2, 1fr)");
        setActivePage(1);
        setItemsPerPage(4);
    }
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  useEffect(() => {
    fetchMultipleCameras();
  }, [itemsPerPage, activePage]);

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
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
    };
  }, []);

  return (
    <Box>
      {isLoading ? (
        <SimpleGrid columns={{base: 2, md: 3}} spacing={4} mt={{ base: "4", md: "2" }}>
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <GridItem key={index}>
              <Skeleton height={{base: "120px", md:"242px"}} borderRadius="8px" />
              <SkeletonText mt="4" noOfLines={2} spacing="4" />
            </GridItem>
          ))}
        </SimpleGrid>
      // --- Use the new filtered list for rendering ---
      ) : filteredCameras.length > 0 ? (
        <>
          {isMobile ? (
            <PullToRefreshify
              refreshing={refreshing}
              onRefresh={refreshMultipleCameras}
              renderText={renderText}
            >
              <SimpleGrid columns={2} spacing={4} mt={4}>
                {/* --- Map over filteredCameras --- */}
                {filteredCameras.map((camera) => (
                  <GridItem key={camera.deviceId}>
                    <Box position="relative">
                      {camera.status === "online" ? (
                        <Player
                          device={camera}
                          initialPlayUrl={
                            camera?.plan === "LIVE"
                              ? `https://${camera?.deviceId}.${camera?.p2purl}/flv/live_ch0_0.flv?verify=${camera?.token}`
                              : `wss://${camera?.mediaUrl}/jessica/DVR/${camera?.deviceId}-AI.flv`
                          }
                          width="100%"
                          style={getResponsivePlayerStyle()}
                          height="100%"
                          showControls={false}
                        />
                      ) : (
                        <Text>Camera NOT FOUND</Text>
                      )}
                    </Box>
                    <HStack>
                      <Text fontWeight="bold" fontSize="xs" p={1}>
                        {camera.name}
                      </Text>
                    </HStack>
                  </GridItem>
                ))}
              </SimpleGrid>
            </PullToRefreshify>
          ) : (
            <Box maxW="1440px" mx="auto" mt={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexDirection={{ base: "column", md: "row" }}
              >
                <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                  AI Multiscreen
                </Text>
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  gap={2}
                >
                  <Flex align="center" justify="center">
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(activePage - 1)}
                      isDisabled={activePage === 1}
                      mr={2}
                    >
                      Previous
                    </Button>
                    {/* Pagination still uses totalPages from the original API response */}
                    {Array.from({ length: cameras.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === cameras.totalPages ||
                          (page >= activePage - 2 && page <= activePage + 2)
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
                    mt={{ base: 2, md: 0 }}
                    value={gridOption}
                    onChange={handleGridChange}
                    _hover={{ borderColor: "gray.400" }}
                    borderRadius={"8px"}
                  >
                    <option value="2x2">2x2 Grid</option>
                    <option value="3x3">3x3 Grid</option>
                  </Select>
                  <Tooltip label="Fullscreen" aria-label="Fullscreen Tooltip">
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
                {/* --- Map over filteredCameras --- */}
                {filteredCameras.map((camera) => (
                  <Box key={camera.deviceId} position="relative">
                    <Box position="relative">
                      {camera.status === "online" ? (
                        <Player
                          device={camera}
                          initialPlayUrl={
                            camera?.plan === "LIVE"
                              ? `https://${camera?.deviceId}.${camera?.p2purl}/flv/live_ch0_0.flv?verify=${camera?.token}`
                              : `wss://${camera?.mediaUrl}/jessica/DVR/${camera?.deviceId}-AI.flv`
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
        <NoCameraFound
          title="No Matching AI Cameras Found"
          description="There are no cameras available with the specified plan."
        />
      )}
    </Box>
  );
}

export default ChatPanel;
