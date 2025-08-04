import React, { useEffect, useRef, useState } from "react";
import JessibucaPlayer from "react-jessibuca";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Button,
  ModalFooter,
  useDisclosure,
  Box,
  Flex,
} from "@chakra-ui/react";

// import styles from "./Dashboard.module.css";
import axios from "axios";
import PlayerControls from "./PlayerControls";
// import Controls from "../../pages/Dashboard/DeviceView/Controls";
import ImageMask from "./ImageMask";
import { useLocation } from "react-router-dom";
import CameraPTZ from "./CameraPTZ";

const Player = ({
  device,
  initialPlayUrl,
  className,
  style,
  showControls,
  width,
  height,
  status,
}) => {
  // console.log('initial',initialPlayUrl)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playUrl, setPlayUrl] = useState(initialPlayUrl);
  const jessibucaRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null); // For JessibucaPlayer reference
  const [error, setError] = useState(null);
  const showOperateBtns = true;
  const forceNoOffscreen = false;
  const { isOpen, onOpen, onClose } = useDisclosure(); // Initialize useDisclosure to manage modal state
  const [screenshotUrl, setScreenshotUrl] = useState(null); // State to hold the screenshot URL
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [showCameraPTZ, setShowCameraPTZ] = useState(false);
  const location = useLocation();
  const [zoomIndex, setZoomIndex] = useState(0);
  const [volume, setVolume] = useState(50); // Initial volume (50%)
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Update playUrl when initialPlayUrl changes
    if (initialPlayUrl) {
      setPlayUrl(initialPlayUrl);
    }
  }, [initialPlayUrl]);

  // useEffect(() => {
  //   // Initialize Jessibuca player on mount if URL contains "hdl"
  //   if (playUrl && playUrl.includes("hdl")) {
  //     create();
  //   }

  //   // Cleanup Jessibuca instance on unmount
  //   return () => {
  //     destroy();
  //   };
  // }, []);

  useEffect(() => {
    // Logic to handle tab change
    return () => {
      destroy(); // Cleanup player when the component unmounts or tab changes
    };
  }, [location]); // Runs whenever the location changes

  useEffect(() => {
    const handlePlayUrlChange = async () => {
      if (jessibucaRef.current) {
        await destroy(); // Destroy the existing instance first
      }
      if (playUrl) {
        if (playUrl.includes("hdl"&&"jessica")) {
          create();
          // setTimeout(play, 200);
          play();
        } else {
          // play();
          setIsPlaying(true);
        }
      }
    };

    handlePlayUrlChange();
    // console.log("PlayURLRAHUL", playUrl);
  }, [playUrl]);

  const create = () => {
    if (
      !containerRef.current ||
      !(containerRef.current instanceof HTMLElement)
    ) {
      console.error("Invalid container reference");
      return;
    }

    jessibucaRef.current = new window.JessibucaPro({
      container: containerRef.current,
      decoder: "/js/decoder-pro.js",
      useMSE: true,
      videoBuffer: 0.2, // Buffer length
      isResize: false,
      text: "ArcisAI",
      loadingText: "Loading",
      debug: false,
      debugLevel: "debug",
      // zooming: true,
      // showBandwidth: showControls, // Show bandwidth
      operateBtns: {
        //   ptz: showControls,
        //   fullscreen: showControls,
        //   screenshot: showControls,
        //   play: showControls,
        //   audio: showControls,
        //   record: showControls,
        // zoom:true,
      },
      forceNoOffscreen: forceNoOffscreen,
      isNotMute: true,
    });

    if (jessibucaRef.current.on) {
      jessibucaRef.current.on("ptz", (arrow) => {
        // console.log(device.deviceid)
        const ptzParams = {
          "-step": 0,
          "-act": arrow,
          "-speed": 3,
          "-presetNUM": 1,
          deviceId: `${device.deviceId}.torqueverse.dev`, // Replace with actual deviceId
        };
        const authHeader = "Basic " + btoa(`admin:`);
        const response = axios.post(
          "https://adiance-portal-backend-7d9tj.ondigitalocean.app/p2p/ptz",
          ptzParams,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          }
        );
        //   console.log('PTZ Status:', response.data);
        // console.log('ptz', arrow);
      });
    } else {
      console.warn(
        "JessibucaPro does not support event listeners in this way."
      );
    }
  };

  const play = () => {
    if (jessibucaRef.current && playUrl) {
      // Play the new video URL
      jessibucaRef.current.play(playUrl);
      setIsPlaying(true);
    } else {
      containerRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (jessibucaRef.current) {
      jessibucaRef.current.pause();
      setIsPlaying(false);
    } else {
      containerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const destroy = async () => {
    if (jessibucaRef.current) {
      await jessibucaRef.current.destroy(); // Properly destroy the instance
      jessibucaRef.current = null; // Clear the reference
      setIsPlaying(false);
    }
  };

  const handleFullscreen = async () => {
    try {
      if (jessibucaRef.current) {
        // Assuming setFullscreen does not return a promise
        jessibucaRef.current.setFullscreen(true);
      } else {
        containerRef.current.setFullscreen(true); //handle fullscreen for Jessibuca
      }
    } catch (error) {
      setError("Fullscreen failed: " + error.message);
    }
  };

  const handleRecording = async () => {
    try {
      if (jessibucaRef.current) {
        if (isRecording) {
          await jessibucaRef.current.stopRecordAndSave();
          setIsRecording(false);
        } else {
          await jessibucaRef.current.startRecord();
          setIsRecording(true);
        }
      } else {
        if (isRecording) {
          await containerRef.current.stopRecordAndSave();
          setIsRecording(false);
        } else {
          const fileName = `${new Date().toISOString().replace(/[:.-]/g, "")}`; // Example: recording_20240118T103045Z

          await containerRef.current.startRecord(fileName, "mp4");
          setIsRecording(true);
        }
      }
    } catch (error) {
      setError("Recording failed: " + error.message);
    }
  };

  // Zoom In
  const zoomIn = () => {
    if (jessibucaRef.current) {
      console.log("Zooming In...");
      try {
        // Check if the zoom method exists
        if (jessibucaRef.current.expandZoom) {
          jessibucaRef.current.player.zooming = true;

          jessibucaRef.current.expandZoom();
          setZoomIndex(zoomIndex + 1);
        } else {
          console.error("expandZoom method not found.");
        }
      } catch (error) {
        console.error("Zoom In failed:", error);
      }
    } else {
      console.warn("Player is not initialized");
    }
  };

  // Zoom Out
  const zoomOut = () => {
    if (jessibucaRef.current) {
      console.log("Zooming Out...");
      try {
        // Check if the zoom method exists
        if (jessibucaRef.current.narrowZoom) {
          setZoomIndex(zoomIndex - 1);
          jessibucaRef.current.narrowZoom();
        } else {
          console.error("narrowZoom method not found.");
        }
      } catch (error) {
        console.error("Zoom Out failed:", error);
      }
    } else {
      console.warn("Player is not initialized");
    }
  };

  useEffect(() => {
    if (zoomIndex === 1) {
      jessibucaRef.current.player.zooming = false;
    }
  }, [zoomIndex]);

  const handleScreenshot = () => {
    try {
      if (jessibucaRef.current) {
        const file = jessibucaRef.current.screenshot("test", "blob");
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "screenshot.png"; // Set desired filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const file = containerRef.current.screenshot("test", "blob"); // screenShot for Jessibuca
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "screenshot.png"; // Set desired filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Screenshot failed:", error.message);
      setError("Screenshot failed: " + error.message);
    }
  };

  // const handleSegmentation = () => {
  //   try {
  //     if (jessibucaRef.current) {
  //       const file = jessibucaRef.current.screenshot('test', 'blob');
  //       const url = URL.createObjectURL(file);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = 'screenshot.png'; // Set desired filename
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(url);
  //     } else {
  //       console.warn('Player is not initialized');
  //     }
  //   } catch (error) {
  //     console.error('Screenshot failed:', error.message);
  //     setError('Screenshot failed: ' + error.message);
  //   }
  // }

  const handleSegmentation = () => {
    try {
      if (jessibucaRef.current) {
        const file = jessibucaRef.current.screenshot("test", "blob"); // Capture the screenshot as a Blob
        const url = URL.createObjectURL(file); // Create a URL for the Blob
        console.log(" screenshot url :: ", url);
        setScreenshotUrl(url); // Set the screenshot URL in state
        setIsModalOpen(true); // Open the modal
        onOpen();
      } else {
        console.warn("Player is not initialized");
      }
    } catch (error) {
      console.error("Screenshot failed:", error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl); // Cleanup the object URL
      setScreenshotUrl(null); // Clear the screenshot URL from state
    }
  };

  const handleSend = () => {
    // Your send logic here
    console.log("Image sent:", screenshotUrl);
    closeModal(); // Optionally close the modal after sending
  };

  const handleUrlChange = (newUrl) => {
    setPlayUrl(newUrl); // Update the playUrl dynamically
  };

  const toggleCameraPTZ = () => {
    setShowCameraPTZ((prevState) => !prevState);
  };

  const handleVolumeChange = (val) => {
    setVolume(val); // Update state for UI slider
    if (jessibucaRef.current) {
      const normalizedVolume = val / 100; // Jessibuca expects volume in range 0-1
      jessibucaRef.current.player.volume = normalizedVolume; // Set volume directly on the player
      if (normalizedVolume === 0) setIsMuted(true);
      else setIsMuted(false);
    } else {
      const normalizedVolume = val / 100; // Jessibuca expects volume in range 0-1
      containerRef.current.player.volume = normalizedVolume; // Set volume directly on the player
      if (normalizedVolume === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (jessibucaRef.current) {
      if (isMuted) {
        jessibucaRef.current.player.volume = volume / 100; // Restore previous volume
      } else {
        jessibucaRef.current.player.volume = 0; // Mute the player
      }
      setIsMuted(!isMuted); // Toggle mute state
    } else {
      if (isMuted) {
        containerRef.current.player.volume = volume / 100; // Restore previous volume
      } else {
        containerRef.current.player.volume = 0; // Mute the player
      }
      setIsMuted(!isMuted); // Toggle mute state
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause(); // Pause the player
    } else {
      await destroy(); // Destroy the current player instance
      create(); // Recreate the player container
      play(); // Start playing the video
    }
  };
  
  return (
    <>
      {showCameraPTZ && <CameraPTZ deviceId={device.deviceId} />}
      {playUrl && playUrl.includes("hdl"&& "jessica") ? (
        // Render JessibucaPro
        <Box display="flex" justifyContent="center" className="container-shell">
          <Box
            id="container"
            ref={containerRef}
            className={className}
            style={style}
          ></Box>
        </Box>
      ) : playUrl && playUrl.includes("record") ? (
        <Box position="relative" width={width} height={height}>
          <video
            style={style}
            // controls
            autoPlay
            muted
            src={playUrl}
          />
        </Box>
      ) : (
        // Render JessibucaPlayer as a fallback for other URLs
        <JessibucaPlayer
          ref={containerRef}
          decodeMode="useMSE"
          // style={{ width: '1220px', height: '720px' }}
          style={style}
          // className={styles.deviceImage}
          // controls={true}
          muted={isMuted}
          loadingText="loading"
          src={playUrl}
          decoder="/decoder.js"
        />
      )}

      {/* {showControls && (
        <Controls
          device={device}
          onFullscreen={handleFullscreen}
          onScreenshot={handleScreenshot}
          onRecording={handleRecording}
          isRecording={isRecording}
          onSegment={handleSegmentation}
        />
      )} */}

      {showControls && (
        <PlayerControls
          device={device}
          onFullscreen={handleFullscreen}
          onScreenshot={handleScreenshot}
          onRecording={handleRecording}
          isRecording={isRecording}
          onSegment={handleSegmentation}
          // play={play} // Pass play function as a prop
          // pause={pause} // Pass pause function as a prop
          handlePlayPause={handlePlayPause} // Pass handlePlayPause function as a prop
          isPlaying={isPlaying} // Pass isPlaying state as a prop if needed
          handleSegmentation={handleSegmentation}
          onUrlChange={handleUrlChange}
          status={status}
          toggleCameraPTZ={toggleCameraPTZ}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          handleVolumeChange={handleVolumeChange}
          toggleMute={toggleMute}
          volume={volume}
          isMuted={isMuted}
        />
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Screenshot with Segmentation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render the ImageMask component inside the modal */}
            <Box position="relative" width="100%">
              <ImageMask screenshotUrl={screenshotUrl} device={device} />
            </Box>

            {/* Button after ImageMask */}
            <Flex justifyContent="flex-end" mt="20px"></Flex>
            <Flex justifyContent="flex-end" mt="20px"></Flex>
            <Flex justifyContent="flex-end" mt="20px"></Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Player;
