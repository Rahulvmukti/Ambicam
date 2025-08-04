import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import axios from "axios";
import moment from 'moment';
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
         ModalCloseButton, Button, useDisclosure,  Text,  useMediaQuery, Box,
         Input, InputGroup, InputLeftElement, Select } from '@chakra-ui/react';
import { color } from "framer-motion";

const LayoutContext = createContext({
  setHeaderVisible: () => {},
  setSidebarVisible: () => {},
});

const AnalyticsImage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEvent, setSelectedEvent] = useState(""); // for select tag
  const [cameraSearchTerm, setCameraSearchTerm] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const tableRef = useRef(null);
  const email = localStorage.getItem("email");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cameraIds, setCameraIds] = useState([]);
  const [isFilterChange, setIsFilterChange] = useState(false);
  const [eventOptions, setEventOptions] = useState({
   // 1: "Facial recognition", 2: "Human Detection", 3: "Fire & Smoke Detection", 4: "Automatic Number Plate Recognition",
  //  5: "PPE kit Violation", 6: "Object Detection", 7: "Detecting phone usage while driving", 8: "Monitoring head movements",
  //  9: "Eyes closing", 10: "Yawning while driving", 11: "No Seatbelt usage", 12: "Identifying conversations with passengers",
  //  13: "Emotion detection", 14: "No_Uniform", 15: "Smoking Detection", 16: "Unauthorized Entry detection",
  //  17: "Line Crossing", 18: "Vactant Parking", 19: "HeatMap for crowd", 20: "Head count",
  //  21: "Person counting and Time analyisis in Tickt Kiosk", 22: "Crowd Object Detection", 23: "UnAuthorized Parking",
  //  24: "Human Activity detection", 25: "Person counting and Time analysis in Ticket scanning area",29: "Medical PPE Kit Violation",
         // 5: "PPE kit Violation",32:"Fall Detection",1: "Facial recognition",3: "Fire & Smoke Detection",
           31: "Object detection (Pen,Watch,Mobile)",36: "Handwash Violation",38: "Gloves Violation",3: "Fire & Smoke Detection",5: "PPE kit detection",28: "EVM Violation",
  40: "Max Person",
  });

  // Use useCallback to memoize fetchData
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate ? selectedDate.format('DD/MM/YYYY') : moment().format('DD/MM/YYYY'); // Use moment object
      const url = `${process.env.REACT_APP_URL || process.env.REACT_APP_LOCAL_URL}/analyticsimage/getanalyticsimages?email=${email}&date=${formattedDate}`;
      const response = await axios.get(url);

      if (response.data && response.data.data) {
        const analyticsData = response.data.data;

        if (Array.isArray(analyticsData)) {
          const validData = analyticsData.filter(
            (item) =>
              item &&
              item.imgurl &&
              item.sendtime &&
              item.cameradid &&
              item.camera?.deviceId &&
              item.camera?.email
          );
          setData(validData);

          // Update cameraIds efficiently after fetching data
          const newCameraIds = [...new Set(validData.map((item) => item.cameradid))];
          setCameraIds(newCameraIds);

        } else {
          console.warn("API returned data is not an array:", analyticsData);
          setData([]);
          setCameraIds([]); // Reset cameraIds
        }
      } else {
        console.warn("API response is missing 'data' or is malformed:", response.data);
        setData([]);
        setCameraIds([]); // Reset cameraIds
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      setFirstLoadComplete(true);
    }
  }, [email, selectedDate]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 20000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  const filterData = useCallback(() => {
    // Start with the full dataset received from the API
    let results = data;
  
    // --- Apply Filters Sequentially ---
  
    // 1. Filter by Date (if a date is selected)
    if (selectedDate) {
      // Get the target calendar day string (YYYY-MM-DD) from the selected date
      // (User selects a local day, we filter based on the corresponding UTC calendar day)
      const targetDayString = selectedDate.format("YYYY-MM-DD");
  
      results = results.filter(item => {
        // Parse the item's timestamp as UTC
        const itemDateUTC = moment.utc(item.sendtime);
        // Get the item's calendar day string in UTC
        const itemDayString = itemDateUTC.format("YYYY-MM-DD");
        // Keep the item if its UTC calendar day matches the target day
        return itemDayString === targetDayString;
      });
    }
  
    // 2. Filter by Camera Search Term (if a search term is provided)
    if (cameraSearchTerm) {
      // Prepare the search term (lowercase for case-insensitive comparison)
      const searchTermLower = cameraSearchTerm.toLowerCase();
      results = results.filter(item =>
        // Check if the item's camera ID includes the search term
        item.cameradid?.toLowerCase().includes(searchTermLower) // Added optional chaining for safety
      );
    }
  
    // 3. Filter by Selected Event Type (if an event type is selected)
    if (selectedEvent) {
      // Parse the selected event value string into an integer
      // Provide radix 10 for explicit base-10 conversion
      const eventId = parseInt(selectedEvent, 10);
  
      // Ensure eventId is a valid number before filtering
      if (!isNaN(eventId)) {
         results = results.filter(item => item.an_id === eventId);
      } else {
          console.warn("Selected event ID is not a valid number:", selectedEvent);
      }
    }
  
    // --- Update State ---
  
    // Reset to the first page whenever filters change
    setCurrentPage(1);
    // Update the state with the final filtered data
    setFilteredData(results);
  
  }, [data, selectedDate, cameraSearchTerm, selectedEvent]); // Dependencies remain correct

  useEffect(() => {
    filterData();
  }, [data, selectedDate, cameraSearchTerm, selectedEvent, filterData]);

  const formatDate = useCallback((dateString) => {
    const date = moment(dateString);
    return date.format('DD-MM-YYYY HH:mm:ss');
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };


  const handleCameraSearchChange = (event) => {
    setCameraSearchTerm(event.target.value);
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };

  const handleImageClick = (imgUrl) => {
    setModalImage(imgUrl);
    onOpen();
  };

  const closeModal = () => {
    setModalImage(null);
    onClose();
  };

  const currentEventMap = eventOptions;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const getVisiblePageNumbers = () => {
    const visiblePages = [];
    visiblePages.push(1);

    if (currentPage > 3) {
      visiblePages.push("...");
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      visiblePages.push(i);
    }

    if (totalPages - 2 > currentPage) {
      visiblePages.push("...");
    }

    visiblePages.push(totalPages);

    return visiblePages;
  };

  const visiblePages = getVisiblePageNumbers();

  const goToPage = (pageNumber) => {
    if (typeof pageNumber === "number" && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const showCountColumn = (anId, selectedEvent) => {
    return (selectedEvent !== "" && (anId === 20 || anId === 21));
  };

  const showNumberPlateColumn = (selectedEvent) => {
    return selectedEvent === "4";
  };

  const showPersonNameColumn = (selectedEvent) => {
    return selectedEvent === "1";
  };

  const shouldShowPagination = filteredData.length > recordsPerPage;

  // Date selection component
  const DateSelector = () => {
    const [weekStart, setWeekStart] = useState(selectedDate.clone().startOf('week'));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = weekStart.clone().add(i, 'days');
      days.push(date);
    }

    const handlePrevWeek = () => {
      setWeekStart(weekStart.clone().subtract(1, 'week'));
    };

    const handleNextWeek = () => {
      setWeekStart(weekStart.clone().add(1, 'week'));
    };

    const handleDayClick = (date) => {
      handleDateChange(date);
    };

    return (
      <div style={dateSelectorStyles.container}>
        <button onClick={handlePrevWeek} style={dateSelectorStyles.navButton}>
          <FaChevronLeft />
        </button>
        {days.map((day) => (
          <div
            key={day.format('YYYY-MM-DD')}
            style={{
              ...dateSelectorStyles.dayContainer,
              border: '1px solid grey', // Add border color here
              ...(selectedDate.isSame(day, 'day') ? dateSelectorStyles.selectedDayContainer : {}),
            }}
            onClick={() => handleDayClick(day)}
          >
            <div style={dateSelectorStyles.dayOfWeek}>{day.format('ddd')}</div>
            <div style={dateSelectorStyles.dayOfMonth}>{day.format('D')}</div>
          </div>
        ))}
        <button onClick={handleNextWeek} style={dateSelectorStyles.navButton}>
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <Box minHeight="100vh" padding="4">
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent maxWidth="90%" maxHeight="90%" backgroundColor="#c8d6e5" border="1px solid #4a5568">
          <ModalCloseButton />
          <ModalBody display="flex" justifyContent="center" alignItems="center">
            <img
              src={modalImage}
              alt="Enlarged View"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "5px"
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <div style={{...styles.container }}>
        <div style={styles.header}>
          <h1 style={{...styles.heading }}>Cloud Events</h1>
          <div style={styles.headerRight}>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={styles.filterRow}>
            <div style={styles.filterColumn}>
              <label style={{...styles.filterLabel, marginLeft:'700px',marginBottom:"-5px"}}>
               Select Date:
              </label>
              <DateSelector />
            </div>

            <div style={styles.filterColumn}>
                <label style={{ ...styles.filterLabel }}>
                 Search Event Type:
               </label>
                <Select
                  placeholder=""
                  value={selectedEvent}
                  onChange={handleEventChange}
                 // style={styles.filterInputSmall}
                  backgroundColor="white"
                 color='black'
                >
                 <option value="">
                  All Events
                </option>
                  {Object.entries(eventOptions).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Select>
            </div>

            {/* Search Camera */}
            <div style={styles.filterColumn}>
              <label style={{ ...styles.filterLabel }}>
                Search Camera ID:
              </label>
              <InputGroup>
               
                <Input
                  type="text"
                  placeholder="Search Camera ID"
                  value={cameraSearchTerm}
                  onChange={handleCameraSearchChange}
                  style={styles.filterInputSmall}
                />
              </InputGroup>
            </div>
          </div>
        </div>

        {loading ? (
          <Text textAlign="center" fontSize="lg" color="teal.300">Loading images...</Text>
        ) : error ? (
          <Text textAlign="center" fontSize="lg" color="red.500">Error: {error}</Text>
        ) : filteredData.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.400">No analytics images found for the selected criteria.</Text>
        ) : (
          <div style={styles.imageGridContainer}>
            {currentRecords.map((item, index) => (
              <div key={item._id} style={styles.imageCard}>
                <img
                  src={item.imgurl}
                  alt="Analytics"
                  style={styles.gridImage}
                  onClick={() => handleImageClick(item.imgurl)}
                />
               <div style={styles.imageInfo}>
                  <Text fontSize="sm" color="--chakra-colors-custom-primary">Device: {item.cameradid}</Text>
                  <Text fontSize="sm" color="--chakra-colors-custom-primary">Type: {currentEventMap[item.an_id] || "Unknown Event"}</Text>
                  <Text fontSize="sm" color="--chakra-colors-custom-primary">Time: 
                    {item.an_id === 20
                      ? moment(item.sendtime)          // Start with original time
                        .subtract(5, 'hours')      // First, subtract 5 hours
                        .subtract(30, 'minutes')   // Subtract 30 minutes
                        .add(5, 'hours')           // Then, add 5 hours back
                        .add(30, 'minutes')        // Add 30 minutes back
                        .format('DD-MM-YYYY HH:mm:ss') // Format the final result
                      : moment(item.sendtime)          // For other an_ids
                        .subtract(5, 'hours')      // Subtract 5 hours
                        .subtract(30, 'minutes')   // Subtract 30 minutes
                        .format('DD-MM-YYYY HH:mm:ss') // Format the result
                    }</Text>
                </div>
              </div>
            ))}
          </div>
        )}

        {shouldShowPagination && filteredData.length > 0 && (
          <div style={styles.pagination}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                display: currentPage === 1 ? "none" : "inline-block",
                backgroundColor: '#c8d6e5', color: 'white', border: '1px solid #718096'
              }}
            >
              Prev
            </button>

            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {typeof page === "number" ? (
                  <button
                    onClick={() => goToPage(page)}
                    style={{
                      ...styles.pageButton,
                      borderRadius: "5px",
                      backgroundColor: '#c8d6e5', color: 'white', border: '1px solid #718096',
                      ...(currentPage === page ? {...styles.activePageButton, backgroundColor: '#c8d6e5'} : {}),
                      "&:hover": { backgroundColor: "#c8d6e5" },
                    }}
                  >
                    {page}
                  </button>
                ) : (
                  <span style={{...styles.ellipsis, color: 'white'}}>...</span>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                display: currentPage === totalPages ? "none" : "inline-block",
                backgroundColor: '#4a5568', color: 'white', border: '1px solid #718096'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Box>
  );
};

const dateSelectorStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '5px',
    padding: '5px',
    marginLeft:'670px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.2em',
    padding: '5px',
    cursor: 'pointer',
    bordercolor:'grey'
  },
  dayContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '5px',
    bordercolor:'grey',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#c8d6e5',
    },
  },
  selectedDayContainer: {
    backgroundColor: '#c8d6e5',
  },
  dayOfWeek: {
    fontSize: '0.8em',
    bordercolor:'grey'
  },
  dayOfMonth: {
    fontSize: '1em',
    fontWeight: 'bold',
    bordercolor:'grey'
  },
};

const styles = {
  container: { maxWidth: "1600px", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-40px" },
  headerRight: { display: "flex", alignItems: "center" },
  heading: { textAlign: "left", fontSize: "25px", fontWeight: "bold" },
  filters: { marginBottom: "20px" },
  filterRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" },
  filterColumn: { display: "flex", flexDirection: "column", marginRight: "10px" },
  filterLabel: { display: "flex", marginBottom: "1px", fontWeight: "bold", display: "block", marginRight: "100px", bordercolor:'Black' },
  filterInput: {  padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #718096", width: "250px", boxSizing: "border-box", backgroundColor:"#c8d6e5" },
  filterInputSmall: { padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #718096", width: "150px", boxSizing: "border-box", color: "Black", backgroundColor:"#c8d6e5", marginTop: "5px" },
  smallFilterColumn: { maxWidth: '180px' },
  imageGridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
  },
  imageCard: {
    backgroundColor: '#c8d6e5',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  gridImage: {
    position:'relative',
    width: '100%',
    height: 'auto',
    display: 'block',
    cursor: 'pointer',
  },
  imageInfo: {
    padding: '15px',
  },
  modal: { position: "fixed", top: "-58%", left: "-11%", right: "-30%", bottom: "-40%", backgroundColor: "#c8d6e5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "400px" },
  modalContent: { maxWidth: "80%", maxHeight: "80%" },
  modalImage: { width: "100%", height: "auto" },
  closeButton: { position: "fixed", top: "10px", right: "10px", border: "none", color: "Black", fontSize: "20px", cursor: "pointer", zIndex: 1001, padding: "70px 68px", borderRadius: "50%" },
  loading: { textAlign: "center", fontSize: "18px", color: "#007bff" },
  error: { textAlign: "center", fontSize: "18px", color: "red" },
  noRecords: { textAlign: "center", fontSize: "18px", color: "#555" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", marginBottom: "20px" },
  paginationButton: { margin: "0 5px", padding: "10px 15px", cursor: "pointer", fontSize: "16px", border: "1px solid #c8d6e5", borderRadius: "5px", backgroundColor: "transparent", color: "black", paddingLeft: "15px", paddingRight: "15px", "&:hover": { backgroundColor: "#c8d6e5" } },
  pageButton: { margin: "0 5px", padding: "10px 15px", cursor: "pointer", fontSize: "16px", border: "1px solid #c8d6e5", backgroundColor: "transparent", color: "black", minWidth: "40px", textAlign: "center", paddingLeft: "15px", paddingRight: "15px" },
  activePageButton: { backgroundColor: "#c8d6e5", color: "white" },
  ellipsis: { margin: "0 10px", fontSize: "16px" },
  pageNumber: { margin: "0 10px", fontSize: "16px" },
};

export default AnalyticsImage;