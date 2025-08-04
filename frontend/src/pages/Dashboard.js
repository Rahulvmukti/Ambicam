import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Image,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  theme,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import CustomCard from "../components/CustomCard";
import { BsCurrencyDollar } from "react-icons/bs";
import BarChartComponent from "../components/BarChartComponent";
import PieChartComponent from "../components/PieChartComponent";
import CameraStatusChart from "../components/CameraStatusChart";
import { SiOpenai } from "react-icons/si";
import { dashboardData } from "../actions/cameraActions";
import MobileHeader from "../components/MobileHeader";
import { getFutureEvents } from "../actions/aiActions";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const barChartOptions = {
    chart: {
      type: "bar",
      height: "100%",
      background: "transparent",
      stacked: false,
      // toolbar: {
      //   show: false
      // }
    },
    colors: [theme.colors.blue[500], theme.colors.green[500]],

    // title is sent separately...

    // title: {
    //   text: 'Monthly Sales Data Comparison',
    //   align: 'left',
    // },
    fill: {
      opacity: 1,
      type: "solid",
    },
    grid: {
      strokeDashArray: 1,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
      ],
    },
    legend: {
      position: "top",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30px",
      },
    },
  };
  const barChartTitle = "Monthly Sales Data Comparison";
  const barChartSeries = [
    {
      name: "Sales 2023",
      data: [65, 59, 80, 81, 56, 55, 65],
    },
    // ,
    // {
    //   name: 'Sales 2024',
    //   data: [75, 69, 70, 91, 66, 65],
    // },
  ];

  const pieChartOptions = {
    chart: {
      type: "pie",
      height: "100%",
    },
    // colors: ['#775DD0', '#3F51B5'],
    colors: [theme.colors.blue[500], theme.colors.purple[500]],
    labels: ["green", "purple"],
    title: {
      text: "Votes Distribution",
      align: "left",
    },
    legend: {
      position: "top",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
  };

  const pieChartSeries = [12, 19];

  const [totalCameras, setTotalCameras] = useState(0);
  const [onlineCamera, setOnlineCamera] = useState(0);
  const [offlineCamera, setOfflineCamera] = useState(0);
  const [sharedCamera, setSharedCamera] = useState(0);
  const [aiCamera, setAiCamera] = useState(0);
  const [futureEvents, setFutureEvents] = useState([]);
  const fetchDashboardData = async () => {
    try {
      const repsonse = await dashboardData();
      setTotalCameras(repsonse.data.totalCamera);
      setOnlineCamera(repsonse.data.totalOnlineCameras);
      setOfflineCamera(repsonse.data.totalOfflineCameras);
      setSharedCamera(repsonse.data.totalSharedCameras);
      setAiCamera(repsonse.data.totalAiCamera);
      console.log("dashboardData", repsonse);
    } catch (error) {
      console.log("error", error);
    }
  };

  // fetch ai future alerts

  const handleFetchFuture = async () => {
    try {
      const response = await getFutureEvents();
      console.log("fetchFutureAlerts", response.data);
      setFutureEvents(response.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  // UseEffect

  useEffect(() => {
    fetchDashboardData();
    handleFetchFuture();
  }, []);

  const data = [
    {
      cameraName: "Basement gate no. 4",
      deviceId: "41515-5151-515",
      date: "24/10/2024",
    },
  ];

  const bgColor = useColorModeValue("custom.primary", "custom.darkModePrimary");

  const navigate = useNavigate();

  const handleSubscription = () => {
    navigate("/subscription");
  };

  return (
    <Box p={3} maxW="1440px" mx="auto" mb={{ base: "20", md: "5" }}>
      {/* Mobile Header */}
      <MobileHeader title="Dashboard" />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 4, md: 6 }}
        mt={{ base: "12", md: "0" }}
        mb={2}
      >
        <Text
          display={{ base: "none", md: "block" }}
          fontSize={{ base: "lg", md: "2xl" }}
          fontWeight="bold"
          textAlign={{ base: "center", md: "left" }}
        >
          Dashboard
        </Text>

        {/* <Flex justifyContent={"space-between"} gap={4}>
          <Select
            value={selectedEventType}
            onChange={handleEventTypeChange}
            placeholder="Select Event Type"
          >
            {reports.eventTypeCounts &&
              Object.keys(reports.eventTypeCounts).map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
          </Select>

          <Select
            placeholder="Select Device"
            value={selectedDevice}
            onChange={handleDeviceChange}
          // width={{ base: "full", md: "225px" }}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.deviceId}
              </option>
            ))}
          </Select>

          <Popover>
            <PopoverTrigger>
              <IconButton
                aria-label="Select Date"
                icon={<CalendarIcon />}
                variant="outline"
                colorScheme="teal"
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex> */}
      </Box>

      <Grid
        width="100%"
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        margin="0% 0% 2%"
      >
        <CustomCard
          title="Total Cameras"
          value={totalCameras}
          sanand="55539"
          color="black"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Online Cameras"
          value={onlineCamera}
          sanand="55539"
          color="#7BC111"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Offline Cameras"
          value={offlineCamera}
          sanand="55539"
          color="#EF4343"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Shared Cameras"
          value={sharedCamera}
          sanand="55539"
          color="purple.500"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
      </Grid>

      <Grid
        width="100%"
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(2, 1fr)",
          xl: "repeat(2, 1fr)",
        }}
        gap={6}
        // padding="0% 2%"
        // height="500px"
      >
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            {/* <BarChartComponent
              options={barChartOptions}
              series={barChartSeries}
              title={barChartTitle}
            /> */}
            <CustomCard
              title="AI Cameras"
              value={aiCamera}
              sanand="55539"
              color="purple.500"
              bcolor="white"
              IconComponent={BsCurrencyDollar}
              height={"210px"}
            />
          </Box>
        </Box>
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            {/* <PieChartComponent
              options={pieChartOptions}
              series={pieChartSeries}
            /> */}
            <CameraStatusChart
              onlineCamera={onlineCamera}
              offlineCamera={offlineCamera}
            />
          </Box>
        </Box>
      </Grid>

      <Box
        // padding="2% 2% 1%"
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
      >
        {futureEvents?.length !== 0 && (
          <Box
            fontWeight={700}
            margin={"20px 0"}
            display={"flex"}
            alignItems={"center"}
          >
            <SiOpenai size={22} />
            &nbsp;
            <Text>AI Future Alerts</Text>
          </Box>
        )}

        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
        >
          <Table variant="simple" colorScheme="gray">
            <Thead>
              {futureEvents?.length !== 0 && (
                <Tr>
                  <Th>Sr.No.</Th>
                  <Th>Device ID</Th>
                  <Th>Condition</Th>
                  <Th>Active</Th>
                </Tr>
              )}
            </Thead>
            <Tbody>
              {(futureEvents?.length ? futureEvents : []).map((item, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{item.deviceId}</Td>
                  <Td>{item.rule_json?.condition ?? "N/A"}</Td>
                  <Td>
                    <div
                      style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "50%",
                        backgroundColor:
                          item.is_active === 1 ? "#7BC111" : "#FF6262",
                      }}
                    ></div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Optional message for no data */}
        {(!futureEvents?.length || futureEvents?.length === 0) && (
          <Box textAlign="center" mt="4">
            <Text>No future alerts available.</Text>
          </Box>
        )}
      </Box>

      <Box
        margin="2% 0%"
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
        position={"relative"}
      >
        {/* <Box
          fontWeight={700}
          padding={"20px 0"}
          display={"flex"}
          alignItems={"center"}
        >
          <SiOpenai />
          &nbsp;
          <Text>AI Cameras Updates</Text>
        </Box> */}
        <Image src={"./images/DashboardBanner.png"} alt="Dashboard" />
        <Button
          position="absolute"
          bottom={{ base: "10px", md: "12px", lg: "30px" }} // Adjusts position based on screen size
          left={{ base: "5%", md: "2.5%", lg: "3%" }} // Centers on smaller screens
          width={{ base: "150px", md: "180px", lg: "200px" }} // Button size adapts
          fontSize={{ base: "sm", md: "md" }} // Text adapts for smaller screens
          padding={{ base: "8px", md: "10px" }} // Adjust padding for better UX
          background={bgColor}
          borderRadius="8px"
          display={{ base: "none", md: "block" }}
          onClick={handleSubscription}
          _hover={"none"}
        >
          Subscribe Now
        </Button>
      </Box>

      {/* <Box position="relative" margin="2% 0%" height="auto" width="100%">
        <Image
          src={"./images/DashboardBanner.png"}
          alt="Dashboard"
          width="100%"
        />
      </Box> */}
    </Box>
  );
};

export default Dashboard;
