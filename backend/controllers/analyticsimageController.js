const AnalyticsImage = require("../models/analyticsimage");
const StreamDetails = require("../models/cameraModel");
// const { sendMailattachment } = require("../utils/sendEmail");
const semaphore = require("../utils/semaphore");
// const Settings = require("../models/Settings"); // Assuming Settings model is not used in the provided code
const messageMapping = {
  1: "Facial recognition",
  2: "Human Detection",
  3: "Fire & Smoke Detection",
  4: "Automatic Number Plate Recognition",
  5: "PPE kit Violation",
  6: "Object Detection",
  7: "Detecting phone usage while driving",
  8: "Monitoring head movements",
  9: "Eyes closing",
  10: "Yawning while driving",
  11: "No Seatbelt usage",
  12: "Identifying conversations with passengers",
  13: "Emotion detection",
  14: "No_Uniform",
  15: "Smoking Detection",
  16: "Unauthorized Entry detection",
  17: "Line Crossing",
  18: "Vactant Parking",
  19: "HeatMap for crowd",
  20: "Head count",
  21: "Person counting and Time analyisis in Tickt Kiosk",
  22: "Crowd Object Detection",
  23: "UnAuthorized Parking",
  24: "Human Activity detection",
  25: "Person counting and Time analysis in Ticket scanning area",
  26:"line crossing",
  27:"entry/exit",
  28:"Pre-stamped",
  29:"Medical PPE kit violation",
  30:"Gender Detection",
  31: "Object detection (Pen,Watch,Mobile)",
  32:"Fall Detection",
  33:"Sack Loading",
  34:"Sack Unloading",
  35:"Tampering Detection",
  36: "Handwash Violation",
  38: "Gloves Violation",
};

function renderSendTime(currentsendtime){
    let somevariable = currentsendtime.split("-");
    if(somevariable.length != 7 || somevariable[0].length != 4){
      return new Date("Nothing")
    }
    return new Date(Date.UTC(
      parseInt(somevariable[0]),
      parseInt(somevariable[1]) - 1,
      parseInt(somevariable[2]),
      parseInt(somevariable[3]),
      parseInt(somevariable[4]),
      parseInt(somevariable[5]),
    ));
}

const saveAnalyticsImage = async (req, res) => {
  try {
    await semaphore.acquire(); // Ensure only one request processes at a time

    const { cameradid, sendtime, imgurl, an_id, ImgCount, numberplateid, person_name, male_count, female_count } = req.body;

    if (!cameradid || !sendtime || !imgurl || !an_id || !ImgCount) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let newCorrectTime = renderSendTime(sendtime);

    if (newCorrectTime == 'Invalid Date'){
      return res.status(535).json({ 
        success: false, 
        message: "Server does not read this Date and Time",
        suggestion: `Send the date in format YYYY-mm-DD-HH-MM-SS-000`, 
        recievedTimeString: `${sendtime}` });
    }

    const streamDetail = await StreamDetails.findOne({ deviceId: cameradid });

    if (!streamDetail) {
      return res.status(404).json({ success: false, message: "Camera ID not found in streamdetails table" });
    }

    const analyticsImage = new AnalyticsImage({
      cameradid,
      sendtime: newCorrectTime,
      msg: messageMapping[an_id] || "No Event Occurred",
      imgurl,
      an_id,
      ImgCount,
      numberplateid: numberplateid,
      person_name: person_name,
      male_count: male_count,
      female_count: female_count
    });

    await analyticsImage.save();

    lastAnalyticsImage = analyticsImage; // Store the latest image, overwriting the previous one

    const currentTime = Date.now();
   // const intervalEndTime = intervalStartTime + EMAIL_INTERVAL;


    //if (currentTime >= intervalEndTime) {
      // Send only the last image if available
    //   if (lastAnalyticsImage) {
    //     sendMailWithRetry(lastAnalyticsImage).catch(err => { // Send the last image
    //       console.error("Failed to send batched email:", err);
    //     });
    //     lastAnalyticsImage = null; // Clear the last image after sending
    //   }

    //  intervalStartTime = intervalEndTime; // Update interval start time for the next interval

   // }


    res.status(201).json({ success: true, message: "Data saved successfully, email sending in background if interval reached", data: analyticsImage });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    semaphore.release();
  }
};
const getAnalyticsImages = async (req, res) => {
  try {
    const { email, date } = req.query; // Get email and date from query parameters

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Validate the date format (dd-mm-yyyy)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: "Invalid date format.  Use dd-mm-yyyy." });
    }

    // Convert the date string to a JavaScript Date object (start of the day)
    const [day, month, year] = date.split("/");
    const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);  // UTC
    const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);  // UTC

    const analyticsImages = await AnalyticsImage.aggregate([
      {
        $lookup: {
          from: "camera",
          let: { cameraDid: "$cameradid" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$deviceId", "$$cameraDid"] },
                    { $eq: ["$email", email] },
                  ],
                },
              },
            },
            { $project: { _id: 0, deviceId: 1, email: 1,CameraName:1 } },
          ],
          as: "camera",
        },
      },
      { $unwind: { path: "$camera", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $and: [
            { camera: { $ne: null } },
            {
              sendtime: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          ],
        },
      },
      {
        $sort: { sendtime: -1 },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Records fetched successfully", data: analyticsImages });
  } catch (error) {
    console.error("Error fetching analytics images:", error);
    return res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};
const getZoneWiseCounts = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const zoneMappings = {
      'Parking': [3, 4, 5, 15, 18, 22, 23],
      'Entry & Ticket area': [3, 5, 15, 19, 20, 21, 22, 24, 25],
      'Passage Area': [3, 5, 15, 19, 20, 22, 24],
      'Staff Operations': [1, 5, 15, 16],
      'Platform': [3, 5, 15, 17, 19, 20, 21, 22, 24],
      'Tunnel': [3, 5, 22]
    };

    // Optimized MongoDB query with indexing
    const cameras = await AnalyticsImage.aggregate([
      {
        $match: { cameradid: { $exists: true } } // Filter early
      },
      {
        $lookup: {
          from: "cameradetails",
          localField: "cameradid",
          foreignField: "deviceId",
          as: "cameraDetails"
        }
      },
      {
        $match: { "cameraDetails.email": email } // Filter after lookup
      },
      {
        $group: { _id: "$an_id", count: { $sum: 1 } } // Aggregate counts
      }
    ]);

    // Convert to map for quick lookup
    const anIdCounts = Object.fromEntries(cameras.map(({ _id, count }) => [_id, count]));

    // Calculate zone-wise counts efficiently
    const zoneCounts = Object.entries(zoneMappings).map(([zone, ids]) => ({
      zone,
      totalCameras: ids.reduce((sum, id) => sum + (anIdCounts[id] || 0), 0)
    }));

    res.status(200).json({ success: true, zoneCounts });
  } catch (error) {
    console.error('Error fetching zone counts:', error);
    res.status(500).json({ message: "Error fetching zone counts", error: error.message });
  }
};

module.exports = { saveAnalyticsImage, getAnalyticsImages, getZoneWiseCounts };