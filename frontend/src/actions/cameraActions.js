import axios from 'axios';
import { Base64 } from "js-base64";
const baseURL = `${process.env.REACT_APP_BASE_URL}/api/camera`;

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

instance.interceptors.response.use(
  response => {
    // If the response is successful, just return the response
    return response;
  },
  error => {
    // If the response has a status code of 401, redirect to the login page
    if (error.response && error.response.status === 401) {
      window.location.href = '/'; // Replace with your login route
    }
    // Otherwise, reject the promise with the error object
    return Promise.reject(error);
  }
);

const g_usr = "admin";
const g_pwd = "";
const imgAuth = Base64.encode(`${g_usr}:${g_pwd}`);
const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

export const addDevice = async (name, deviceId) => {
  try {
    const response = await instance.post("/addDevice", {
      name,
      deviceId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSingleCamera = async (deviceId) => {
  const params = {
    deviceId: deviceId,
  };
  try {
    const response = await instance.get(`/getSingleCamera`, {
      params: params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getAllCameras = async (page, itemsPerPage, search, status) => {
  console.log(
    "getAllCameras called with params:",
    page,
    itemsPerPage,
    search,
    status
  );
  const params = {
    page: page,
    limit: itemsPerPage,
    search: search,
    status: status,
  };
  try {
    const response = await instance.get(`/getAllCameras`, {
      params: params,
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response };
  }
};

export const getStreamDetails = async (deviceId) => {
  try {
    const response = await instance.get("/getStreamDetails", {
      params: { deviceId },
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response };
  }
};

export const updateCamera = async (cameraId, name) => {
  try {
    const response = await instance.put(`/updateCamera/${cameraId}`, { name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeUserCamera = async (deviceId) => {
  try {
    const response = await instance.post(`/removeUserCamera`, {
      deviceId: deviceId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//  Share Camera API's

export const getSharedEmails = async (deviceId) => {
  try {
    const response = await instance.get(`/getSharedEmails`, {
      params: {
        deviceId: deviceId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const shareCamera = async (deviceId, shareEmail) => {
  try {
    const response = await instance.post(`/shareCamera`, {
      email: shareEmail,
      deviceId: deviceId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSharedCamera = async () => {
  try {
    const response = await instance.get(`/getSharedCamera`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeSharedCamera = async (email, deviceId) => {
  try {
    const response = await instance.post(`/removeSharedCamera`, {
      email: email,
      deviceId: deviceId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMultipleCameras = async (page, limit) => {
  try {
    const response = await instance.get("/getMultiplePageCamera", {
      params: {
        page: page,
        limit: limit,
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    return { success: false, message: error.response };
  }
};

export const dashboardData = async () => {
  try {
    const response = await instance.get("/dashboardData");
    return response.data;
  } catch (error) {
    return { success: false, message: error.response };
  }
};

export const getOnlineCameras = async () => {
  try {
    const response = await instance.get("/getOnlineCamera");
    console.log(response);
    return response.data;
  } catch (error) {
    return { success: false, message: error.response };
  }
};

export const setImageUrl = (deviceid) => {
  const localStorageKey = `deviceImage_${deviceid}`;
  const storedImage = JSON.parse(localStorage.getItem(localStorageKey));
  console.log("storedImage:", storedImage);

  const fallbackImage = "https://ambicamdemo.vmukti.com/images/CameraCard.png";

  if (storedImage && getCurrentTimestamp() - storedImage.timestamp < 600) {
    return storedImage.imageUrl || fallbackImage;
  } else {
    const imageUrl = `https://${deviceid}.torqueverse.dev/snapshot?r=${Math.random()}&auth=${imgAuth}`;

    // Perform a quick image availability check
    const img = new Image();
    img.src = imageUrl;
    img.onerror = () => {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          imageUrl: fallbackImage,
          timestamp: getCurrentTimestamp(),
        })
      );
    };
    img.onload = () => {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          imageUrl,
          timestamp: getCurrentTimestamp(),
        })
      );
    };

    return imageUrl;
  }
};

export const setImageUrll = async (deviceId) => {
  const fallbackImage = "https://ambicamdemo.vmukti.com/images/CameraCard.png";
  const imageUrl = `https://mediastream.vmukti.com/snap/DVR/RTSP-${deviceId}`;
  console.log("imageUrl:", imageUrl);
  const saveImageToDB = async (imageUrl) => {
    try {
      await instance.post('/saveDeviceImage', {
        deviceId,
        imageUrl,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('Failed to save image to the database', error);
    }
  };

  // Check image availability
  const img = new Image();
  img.src = imageUrl;
  img.onerror = async () => {
    await saveImageToDB(fallbackImage);
  };
  img.onload = async () => {
    await saveImageToDB(imageUrl);
  };

  return imageUrl;
};
