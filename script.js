console.log("Use deviceId query param to request a specific device.");
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(() => {
    listDevices();
  })
  .catch((error) => {
    // Access to video and audio devices denied
    // Add your code here to handle the denied access or show an error message
    console.error("Error accessing video and audio devices:", error);
  });
  navigator.permissions.query({name: 'microphone'})
  .then((permissionObj) => {
   console.log(permissionObj.state);
  })
  .catch((error) => {
   console.log('Got error :', error);
  })
 
  navigator.permissions.query({name: 'camera'})
  .then((permissionObj) => {
   console.log(permissionObj.state);
  })
  .catch((error) => {
   console.log('Got error :', error);
  })
  function listDevices(){

    navigator.mediaDevices
      .enumerateDevices()
      // .then((devices) =>
      //   devices.filter((d) => d.kind === "videoinput" || d.kind === "audioinput")
      // )
      .then((devices) => {
        console.log(devices);
        const videoDDL = document.querySelector("#videoDeviceId");
        var audioDDL = document.querySelector("#audioDeviceId");
        while (videoDDL.length > 0) {
          videoDDL.remove(videoDDL.length-1);
        }
        while (audioDDL.length > 0) {
          audioDDL.remove(audioDDL.length-1);
        }
        for (const device of devices) {
          if (device.kind === "videoinput") {
            videoDDL.options[videoDDL.options.length] = new Option(
              device.label,
              device.deviceId
            );
          }
          if (device.kind === "audioinput") {
            audioDDL.options[audioDDL.options.length] = new Option(
              device.label,
              device.deviceId
            );
          }
          // devices
          // .map((d) => {
          //   return "[" + d.kind + "] " + d.label + ": " + d.deviceId;
          // })
          // .join("\n\n")
        }
      });
  }

const urlParams = new URLSearchParams(window.location.search);
const videoDeviceId = urlParams.get("deviceId");
const videoDeviceLabelSearch = urlParams.get("deviceLabel");
const audioDeviceId = urlParams.get("audioDeviceId");

function showSettingsPopup() {
  listDevices();
  const settingsPopup = document.querySelector(".settings-popup");
  settingsPopup.style.display = "block";
}

function hideSettingsPopup() {
  const settingsPopup = document.querySelector(".settings-popup");
  settingsPopup.style.display = "none";
}

function onSaveSettings() {
  const videoDeviceId = document.querySelector("#videoDeviceId").value;
  const audioDeviceId = document.querySelector("#audioDeviceId").value;
  const deviceLabel = document.querySelector("#videoDeviceId").text;

  const url = new URL(window.location.href);
  url.searchParams.set("deviceId", videoDeviceId);
  url.searchParams.set("audioDeviceId", audioDeviceId);
  url.searchParams.set("deviceLabel", deviceLabel);

  window.location.href = url.toString();
}

async function startVideo() {
  // find video device by label search
  let foundDevice = null;
  if (videoDeviceLabelSearch) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    foundDevice = devices.find((d) => d.label.includes(videoDeviceLabelSearch));
  }

  const constraints = {
    video: { width: 1920, height: 1080 },
    audio: false,
  };

  const finalVideoDeviceId = videoDeviceId || foundDevice.deviceId;

  if (finalVideoDeviceId) {
    constraints.video.deviceId = { exact: finalVideoDeviceId };
  }

  if (audioDeviceId) {
    constraints.audio = {
      deviceId: { exact: audioDeviceId },
      autoGainControl: false,
      echoCancellation: false,
      googAutoGainControl: false,
      noiseSuppression: false,
    };
  }

  console.log({ constraints });

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  document.querySelector("video").srcObject = stream;
}

function enterFullscreen() {
  const element = document.documentElement;

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

startVideo();
