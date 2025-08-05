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
  const [allCameras, setAllCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
      container?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  };

  const fetchAllCameras = async () => {
    setIsLoading(true);
    try {
      const response = await getMultipleCameras(1, 10000, "AI");
      setAllCameras(response.data.data || []);
    } catch (error) {
      console.error("Error fetching all AI cameras:", error);
      setAllCameras([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCameras = useMemo(() => {
    return allCameras.filter(camera => String(camera.plan) === 'DVR-300');
  }, [allCameras]);

  const totalPages = Math.ceil(filteredCameras.length / itemsPerPage);

  const paginatedCameras = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCameras.slice(startIndex, endIndex);
  }, [filteredCameras, currentPage, itemsPerPage]);

  // --- THIS FUNCTION WAS MISSING ---
  // It has been added back here.
  const getResponsivePlayerStyle = () => ({
    width,
    height: "auto",
    aspectRatio: "16 / 9",
    borderRadius: "8px",
  });
  // ------------------------------------

  const handleGridChange = (event) => {
    const value = event.target.value;
    setGridOption(value);
    switch (value) {
      case "2x2":
        setGridLayout("repeat(2, 1fr)");
        setItemsPerPage(4);
        break;
      case "3x3":
        setGridLayout("repeat(3, 1fr)");
        setItemsPerPage(9);
        break;
      default:
        setGridLayout("repeat(2, 1fr)");
        setItemsPerPage(4);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchAllCameras();
  }, []);

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

  // Omitted other useEffects and functions for brevity, they remain the same

  return (
    <Box>
      {isLoading ? (
        <SimpleGrid columns={{base: 2, md: 3}} spacing={4} mt={{ base: "4", md: "2" }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <GridItem key={index}>
              <Skeleton height={{base: "120px", md:"242px"}} borderRadius="8px" />
              <SkeletonText mt="4" noOfLines={2} spacing="4" />
            </GridItem>
          ))}
        </SimpleGrid>
      ) : paginatedCameras.length > 0 ? (
        <>
          {isMobile ? (
             <PullToRefreshify
             refreshing={refreshing}
             onRefresh={fetchAllCameras}
             renderText={renderText}
            >
            <SimpleGrid columns={2} spacing={4} mt={4}>
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
                        style={getResponsivePlayerStyle()} // This will now work
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
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage === 1}
                      mr={2}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <Text mx={2}>...</Text>
                          )}
                          <Button
                            size="sm"
                            colorScheme={currentPage === page ? "purple" : "gray"}
                            variant={currentPage === page ? "solid" : "outline"}
                            onClick={() => handlePageChange(page)}
                            mx={1}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage === totalPages || totalPages === 0}
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
                  >
                    <option value="2x2">2x2 Grid</option>
                    <option value="3x3">3x3 Grid</option>
                  </Select>
                  <Tooltip label="Fullscreen" aria-label="Fullscreen Tooltip">
                    <IconButton
                      bg={bgColor}
                      icon={<BsArrowsFullscreen />}
                      onClick={toggleFullScreen}
                      boxSize={"10"}
                      variant="outline"
                      aria-label="Fullscreen"
                    />
                  </Tooltip>
                </Flex>
              </Box>
              <Grid
                templateColumns={gridLayout}
                gap={isFullScreen ? 2 : 6}
                width="100%"
                pt={2}
                ref={containerRef}
              >
                {paginatedCameras.map((camera) => (
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
                         style={getResponsivePlayerStyle()} // This will also now work
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
