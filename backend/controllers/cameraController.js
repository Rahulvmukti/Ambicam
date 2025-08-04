const Camera = require("../models/cameraModel");
const plan = require("../models/planModel");
const Stream = require("../models/streamModel");
const User = require("../models/userModel");
const axios = require("axios");
const https = require("https");
const { setCache, getCache, deleteCache } = require('./cacheController')
const basicAuth = `Basic ${Buffer.from(`admin:admin`).toString("base64")}`;
const apiUrl = "https://p2p.vmukti.com:8500/api/proxy/tcp";
const emsUrl = "https://etaems.arcisai.io:5000/api";
let globalProxies = []; // Global variable for proxy data

// Create an httpsAgent with custom settings
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Set to true if you want to verify certificates, or false for self-signed certificates
});

// Function to fetch and store proxy statuses in global memory and Redis
const fetchProxies = async () => {
    try {
        console.log("Fetching proxy statuses...");

        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: { Authorization: basicAuth },
        });

        if (response.data && response.data.proxies) {
            globalProxies = response.data.proxies; // Update only if valid data is received
            console.log("Proxy data updated.");
        } else {
            console.warn("Warning: No valid proxy data received. Retaining old data.");
        }
    } catch (error) {
        console.error("Error fetching proxies:", error.message);
        console.log("Continuing with previously stored proxy data.");
    }
};

// Run fetchProxies every 30 seconds
setInterval(fetchProxies, 10000);
// Initial fetch on server start
fetchProxies();

exports.getAllCameras = async (req, res) => {
    // Retrieve pagination, search, and status filter parameters from the query
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const search = req.query.search || ""; // Search parameter for `name`
    const statusFilter = req.query.status || ""; // Filter by online/offline status
    // const isDefaultCacheKey = search === "" && statusFilter === "";
    // const cacheKey = `cameras:${userId}:page=${page}:limit=${limit}`;
    // console.log("check", cacheKey);
    try {
        // Check if the data is cached in Redis
        // if (isDefaultCacheKey) {
        //     const cachedData = await getCache(cacheKey);
        //     if (cachedData) {
        //         console.log("Cache hit for cameras:", cacheKey);

        //         // Parse cached data
        //         let responseData = JSON.parse(cachedData);

        //         // Update status from globalProxies in real-time
        //         responseData.cameras = responseData.cameras.map((camera) => {
        //             const proxy = globalProxies.find((proxy) => proxy.name === camera.deviceId);
        //             return { ...camera, status: proxy ? proxy.status : "offline" };
        //         });

        //         return res.status(200).json(responseData);
        //     }
        // }

        // Define the aggregation pipeline to fetch cameras
        const matchStage = {
            $match: {
                userId: userId,
                ...(search && { name: { $regex: search, $options: "i" } }), // Match by `name` if search is provided
            },
        };

        const projectStage = {
            $project: {
                _id: 1,
                name: 1,
                deviceId: 1,
                isp2p: 1,
                productType: 1,
                lastImage: 1,
                timestamp: 1,
            },
        };

        // Execute the aggregation pipeline
        const cameras = await Camera.aggregate([matchStage, projectStage]);

        if (!cameras.length) {
            return res.status(400).json({
                success: false,
                message: "No cameras found",
            });
        }

        // Match each camera with its corresponding proxy status
        const updatedCameras = cameras.map((camera) => {
            const proxy = globalProxies.find((proxy) => proxy.name === camera.deviceId);
            return { ...camera, status: proxy ? proxy.status : "offline" };
        });

        // Filter cameras based on the status filter if provided
        const filteredCameras = statusFilter
            ? updatedCameras.filter((camera) => camera.status === statusFilter)
            : updatedCameras;

        // Calculate total count for filtered cameras
        const totalCount = filteredCameras.length;

        // Apply pagination to the filtered cameras
        const paginatedCameras = filteredCameras.slice(
            (page - 1) * limit,
            page * limit
        );

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        const responseData = {
            success: true,
            cameras: paginatedCameras,
            page,
            limit,
            total: totalCount,
            totalPages,
        };

        // Store response in cache only if both search and statusFilter are empty
        // if (isDefaultCacheKey) {
        //     await setCache(cacheKey, JSON.stringify(responseData), 86400);
        // }

        // Return the paginated and filtered results
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Function to format the date according to Indian Standard Time
const getFormattedDate = () => {
    const options = {
        timeZone: "Asia/Kolkata",
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
    };

    // Create a new Date object for the current time
    const date = new Date();

    // Format the date and time using Intl.DateTimeFormat for DD/MM/YY HH:MM:SS
    const formattedDateTime = new Intl.DateTimeFormat("en-GB", options).format(
        date
    );

    // Split the formatted date and time
    const [datePart, timePart] = formattedDateTime.split(", ");
    const dateParts = datePart.split("/");

    // Combine the date and time into the desired format
    const [day, month, year] = dateParts;

    return `${day}/${month}/${year} ${timePart}`;
};

// create a new camera
exports.addDevice = async (req, res) => {
    try {
        const { name, deviceId, isp2p } = req.body;

        const created_date = getFormattedDate();
        console.log(created_date);
        const userId = req.user.id;
        const useremail = req.user.email;

        // check deviceId is already exist or not
        const existingCamera = await axios.post(
            `${emsUrl}/camera/check-p2p-camera-exists`,
            {
                deviceId: deviceId,
            },
            {
                httpsAgent: httpsAgent, // Add the HTTPS agent to the request config
            }
        );

        console.log(existingCamera);
        if (existingCamera.data.exist === false) {
            return res.status(400).json({
                success: false,
                message: "Device ID Not Exists",
            });
        }

        // check deviceId is already exist or not
        const existingCamera1 = await Camera.findOne({ deviceId });
        if (existingCamera1) {
            return res.status(400).json({
                success: false,
                message: "Device ID added already",
            });
        }

        const result = await Camera.updateOne(
            { deviceId: deviceId }, // Filter to find the camera by deviceId (or any other unique identifier)
            {
                $set: {
                    userId,
                    email: useremail,
                    name,
                    created_date,
                    isp2p,
                    productType: existingCamera.data.data,
                },
            },
            { upsert: true } // Optional: creates a new document if no matching document is found
        );

        await deleteCache(`cameras:${userId}`);
        // Fetch the camera's plan
        const cameraPlan = await plan.findOne({ deviceId }).select("storagePlan");

        // Determine the plan to update
        const planToUpdate = cameraPlan?.storagePlan || "LIVE"; // If storagePlan exists, use it; otherwise, default to "LIVE"

        // Update or upsert the stream document
        const updateStream = await Stream.updateOne(
            { deviceId: deviceId }, // Filter to find the camera by deviceId (or any other unique identifier)
            {
                $set: {
                    plan: planToUpdate,
                },
            },
            { upsert: true } // Optional: creates a new document if no matching document is found
        );

        res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get stream details
exports.getStreamDetails = async (req, res) => {
    try {
        const { deviceId } = req.query;

        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Device ID is required",
            });
        }

        // const cacheKey = `stream:${deviceId}`;

        // // Check if data is in Redis
        // const cachedData = await getCache(cacheKey);
        // if (cachedData) {
        //     return res.status(200).json(JSON.parse(cachedData));
        // }

        const streamData = await Stream.aggregate([
            { $match: { deviceId: deviceId } }, // Match the deviceId
            {
                $project: {
                    _id: 0,
                    deviceId: 1,
                    mediaUrl: 1,
                    p2purl: 1,
                    plan: 1,
                    quality: 1,
                    token: 1,
                },
            },
        ]);

        if (!streamData.length) {
            return res.status(404).json({
                success: false,
                message: "No stream found",
            });
        }

        //find the camera name from deviceId
        const camera = await Camera.findOne({ deviceId });
        const cameraName = camera.name;

        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                Authorization: basicAuth,
            },
        });

        const proxies = response.data.proxies;

        // Match each camera with its corresponding proxy status
        const updatedCameras = streamData.map((camera) => {
            const proxy = proxies.find((proxy) => proxy.name === camera.deviceId);
            return {
                ...camera,
                cameraName,
                status: proxy ? proxy.status : "Unknown",
            };
        });

        const responseData = {
            success: true,
            streamData: updatedCameras,
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a camera by id
exports.updateCamera = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const updatedCamera = await Camera.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!updatedCamera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found",
            });
        }
        res.status(200).json({
            success: true,
            data: updatedCamera,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// share a camera
exports.shareCamera = async (req, res) => {
    try {
        const { email, deviceId } = req.body;

        const camera = await Camera.findOne({ deviceId });

        if (!camera) {
            return res.status(400).json({
                success: false,
                message: "Camera not found",
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        if (camera.userId !== req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to share this camera",
            });
        }

        camera.sharedWith.push({ email, userId: existingUser._id });
        await camera.save();

        res.status(200).json({
            success: true,
            message: "Camera shared successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get shared camera
exports.getSharedCamera = async (req, res) => {
    try {

        // const cachedSharedCameras = await getCache(`sharedCameras:${req.user.id}`);
        // if (cachedSharedCameras) {
        //     return res.status(200).json({ success: true, data: JSON.parse(cachedSharedCameras).data });
        // }

        const sharedCameras = await Camera.find({ 'sharedWith.email': req.user.email }).select('name deviceId').lean();

        if (!sharedCameras) {
            return res.status(400).json({
                success: false,
                message: 'No shared cameras found',
            });
        }

        // Fetch proxies
        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                'Authorization': basicAuth,
            },
        });

        const proxies = response.data.proxies;

        // Match each camera with its corresponding proxy status
        const updatedCameras = sharedCameras.map(camera => {
            const proxy = proxies.find(proxy => proxy.name === camera.deviceId);
            return {
                ...camera,
                status: proxy ? proxy.status : 'Unknown'
            };
        });

        const totalCount = updatedCameras.length;
        // await setCache(`sharedCameras:${req.user.id}`, JSON.stringify({ data: updatedCameras, total: totalCount }), 86400);
        res.status(200).json({
            success: true,
            data: updatedCameras,
            total: totalCount
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// fetch shared emails of a camera
exports.getSharedEmails = async (req, res) => {
    try {
        const { deviceId } = req.query;

        // const cachedSharedEmails = await getCache(`sharedEmails:${deviceId}`);
        // if (cachedSharedEmails) {
        //     return res.status(200).json({ success: true, data: JSON.parse(cachedSharedEmails) });
        // }

        const camera = await Camera.findOne({ deviceId });
        if (!camera) {
            return res.status(400).json({
                success: false,
                message: 'Camera not found',
            });
        }

        if (camera.userId !== req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You are not authorized to access this camera',
            });
        }

        const sharedEmails = camera.sharedWith.map(user => user.email);
        // await setCache(`sharedEmails:${deviceId}`, JSON.stringify(sharedEmails), 86400);
        res.status(200).json({
            success: true,
            data: sharedEmails,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// remove shared camera
exports.removeSharedCamera = async (req, res) => {
    try {
        const { email, deviceId } = req.body;
        const userId = req.user.id;

        // Fetch the camera by deviceId
        const camera = await Camera.findOne({ deviceId });
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found",
            });
        }

        // Check if the user is the owner or part of sharedWith
        const isOwner = camera.userId === userId;
        const sharedUser = camera.sharedWith.find((user) => user.userId === userId);

        if (!isOwner && !sharedUser) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this camera",
            });
        }

        // Check if the email being removed is part of sharedWith
        const userToRemove = camera.sharedWith.find((user) => user.email === email);
        if (!userToRemove) {
            return res.status(404).json({
                success: false,
                message: "Shared user not found",
            });
        }

        // Update the sharedWith list to remove the user
        camera.sharedWith = camera.sharedWith.filter(
            (user) => user.email !== email
        );
        await camera.save();

        return res.status(200).json({
            success: true,
            message: "Camera removed from shared list",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// remove user camera
exports.removeUserCamera = async (req, res) => {
    const { deviceId } = req.body;
    try {
        const userId = req.user.id;
        const camera = await Camera.findOne({ deviceId });
        if (!camera) {
            return res.status(400).json({
                success: false,
                message: "Camera not found",
            });
        }
        if (camera.userId !== userId) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to remove this camera",
            });
        }

        await Camera.deleteOne({ deviceId });
        await Stream.deleteOne({ deviceId });
        await deleteCache(`cameras:${userId}`);
        res.status(200).json({
            success: true,
            message: "Camera removed successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getMultiplePageCamera = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get pagination parameters from the query
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 9; // Default to 10 items per page
        const skip = (page - 1) * limit;

        // Fetch all cameras for the user
        const cameraInfo = await Camera.find({ userId })
            .select('name deviceId')
            .lean();

        const deviceIds = cameraInfo.map(camera => camera.deviceId);

        // Fetch stream details
        const streamDetails = await Stream.find({ deviceId: { $in: deviceIds } })
            .select('deviceId mediaUrl p2purl plan quality token')
            .lean();

        // Fetch proxy details
        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                'Authorization': basicAuth,
            },
        });

        const proxies = response.data.proxies;

        // Match each camera with its corresponding proxy status
        const updatedCameras = cameraInfo.map(camera => {
            const proxy = proxies.find(proxy => proxy.name === camera.deviceId);
            return {
                ...camera,
                status: proxy ? proxy.status : 'Unknown',
            };
        });

        // Filter for online cameras
        const onlineCameras = updatedCameras.filter(
            (camera) => camera.status === "online"
        );

        // Count total online cameras
        const totalOnlineCameras = onlineCameras.length;

        // Apply pagination to online cameras
        const paginatedCameras = onlineCameras
            .slice(skip, skip + limit)
            .map(camera => {
                const stream = streamDetails.find(stream => stream.deviceId === camera.deviceId);
                return {
                    ...camera,
                    ...stream,
                };
            });

        return res.status(200).json({
            success: true,
            data: paginatedCameras,
            total: totalOnlineCameras,
            page,
            limit,
            totalPages: Math.ceil(totalOnlineCameras / limit),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// get Online camera for edge event
exports.getOnlineCamera = async (req, res) => {
    try {
        const userId = req.user.id;

        const cameraInfo = await Camera.find({ userId }).select('name deviceId').lean();

        const deviceIds = cameraInfo.map(camera => camera.deviceId);

        const streamDetails = await Stream.find({ deviceId: { $in: deviceIds } }).select('deviceId p2purl').lean();

        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                'Authorization': basicAuth,
            },
        });

        const proxies = response.data.proxies;

        // Match each camera with its corresponding proxy status
        const updatedCameras = cameraInfo.map(camera => {
            const proxy = proxies.find(proxy => proxy.name === camera.deviceId);
            return {
                ...camera,
                status: proxy ? proxy.
                    status : 'Unknown'
            }
        });
        const onlineCameras = updatedCameras.filter(
            (camera) => camera.status === "online"
        );

        const cameraDetails = onlineCameras.map(camera => {
            const stream = streamDetails.find(stream => stream.deviceId === camera.deviceId);
            return {
                ...camera,
                ...stream,
            };
        });

        return res.status(200).json({
            success: true,
            data: cameraDetails,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// dashboard data
exports.dashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // fetch status
        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                'Authorization': basicAuth,
            },
        });
        const proxies = response.data.proxies;

        // get online camera
        const cameraInfo = await Camera.find({ userId }).select('name deviceId sharedWith').lean();
        const planInfo = await plan.find({ userId }).select('plan ai_name').lean();
        // Match each camera with its corresponding proxy status
        const updatedCameras = cameraInfo.map(camera => {
            const proxy = proxies.find(proxy => proxy.name === camera.deviceId);
            return {
                ...camera,
                status: proxy ? proxy.status : 'Unknown'
            };
        });

        // get online camera
        const onlineCameras = updatedCameras.filter(
            (camera) => camera.status === "online"
        );
        // total cameras
        const totalCamera = cameraInfo.length;
        const totalOnlineCameras = onlineCameras.length;
        const totalOfflineCameras = cameraInfo.length - totalOnlineCameras;

        // total shared cameras
        const totalSharedCameras = cameraInfo.filter(camera => camera.sharedWith?.length > 0).length;

        // total ai camera count
        const totalAiCamera = planInfo.filter(plan => plan.ai_name?.length > 0).length;

        return res.status(200).json({
            success: true,
            data: {
                totalCamera,
                totalOnlineCameras,
                totalOfflineCameras,
                totalSharedCameras,
                totalAiCamera
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}


// last image setup
exports.saveDeviceImage = async (req, res) => {
    const { deviceId, imageUrl, timestamp } = req.body;
    console.log('body response', req.body);
    if (!deviceId || !imageUrl || !timestamp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const camera = await Camera.findOne({ deviceId });
        if (camera) {
            // Update existing camera's imageUrl and timestamp fields
            camera.lastImage = imageUrl;
            camera.timestamp = timestamp;
            await camera.save();
        } else {
            // If the camera doesn't exist, return an error or handle accordingly
            return res.status(404).json({ error: 'Camera not found' });
        }
        console.log('Camera image updated successfully', camera);
        res.status(200).json({ message: 'Camera image updated successfully' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
}