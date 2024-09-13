console.log("Use deviceId query param to request a specific device.");
var selectedDevices = {};
var vid = document.querySelector("video");
var constraints = {
  video: { width: 1920, height: 1080 },
  audio: true,
};
// var mouseTimeout;
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(() => {
    listDevices();
    loadSettings();
  })
  .catch((error) => {
    // Access to video and audio devices denied
    // Add your code here to handle the denied access or show an error message
    console.error("Error accessing video and audio devices:", error);
  });
navigator.permissions.query({ name: 'microphone' })
  .then((permissionObj) => {
    console.log(permissionObj.state);
  })
  .catch((error) => {
    console.log('Got error :', error);
  })

navigator.permissions.query({ name: 'camera' })
  .then((permissionObj) => {
    console.log(permissionObj.state);
  })
  .catch((error) => {
    console.log('Got error :', error);
  })
function listDevices() {

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
        videoDDL.remove(videoDDL.length - 1);
      }
      while (audioDDL.length > 0) {
        audioDDL.remove(audioDDL.length - 1);
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

function showSettingsPopup() {
  listDevices();
  const settingsPopup = document.querySelector(".settings-popup");
  settingsPopup.style.display = "block";
}

function hideSettingsPopup() {
  const settingsPopup = document.querySelector(".settings-popup");
  settingsPopup.style.display = "none";
}


function showToolbar() {
  const toolbar = document.querySelector(".toolbar");
  toolbar.style.opacity = "1";
}

function hideToolbar() {
  const toolbar = document.querySelector(".toolbar");
  toolbar.style.opacity = "0";
}

// document.onmousemove = function () {
//   clearTimeout(mouseTimeout);
//   if (document.querySelector(".toolbar").style.visibility === "hidden") {
//     document.querySelector(".toolbar").style.visibility = "visible";
//     return;
//   }
//   mouseTimeout = setTimeout(function () {
//     document.querySelector(".toolbar").style.visibility = "hidden";
//   }, 5000);
// }

function onsubmit(e) {
  e.preventDefault();
  onSaveSettings();
  hideSettingsPopup();
}
function onSaveSettings() {
  const videoDeviceId = document.querySelector("#videoDeviceId").value;
  const audioDeviceId = document.querySelector("#audioDeviceId").value;
  const deviceLabel = document.querySelector("#videoDeviceId").text;

  selectedDevices.videoDeviceId = videoDeviceId;
  selectedDevices.audioDeviceId = audioDeviceId;
  selectedDevices.deviceLabel = deviceLabel;
  localStorage.setItem('selected_devices', JSON.stringify(selectedDevices));
  loadSettings();
}

function loadSettings() {
  const settings = localStorage.getItem('selected_devices');
  if (settings) {
    selectedDevices = JSON.parse(settings);
    startVideo();
  } else {
    showSettingsPopup();
  }
}

async function startVideo() {
  // find video device by label search
  let foundDevice = null;
  if (selectedDevices.deviceLabel) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    foundDevice = devices.find((d) => d.label.includes(selectedDevices.deviceLabel));
  }

  const finalVideoDeviceId = selectedDevices.videoDeviceId || foundDevice.deviceId;

  if (finalVideoDeviceId) {
    constraints.video.deviceId = { exact: finalVideoDeviceId };
  }

  if (selectedDevices.audioDeviceId) {
    constraints.audio = {
      deviceId: { exact: selectedDevices.audioDeviceId },
      autoGainControl: false,
      echoCancellation: false,
      googAutoGainControl: false,
      noiseSuppression: false,
    };
  }
  await setVideoParameters();
}
async function setVideoParameters() {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  vid.srcObject = stream;
  console.log(constraints);
  vid.width = constraints.video.width;
  vid.style.width = constraints.video.width + "px";
  if (!document.fullscreenElement) {
    vid.height = constraints.video.height;
    vid.style.height = constraints.video.height + "px";
  } else {
    vid.height = vid.style.height = undefined;
  }
}
function toggleFullscreen() {
  if (document.fullscreenElement) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}
function changeSize(factor) {
  constraints.video.width += factor;
  constraints.video.height += factor;
  setVideoParameters();
  document.getElementById("infoBar").innerText = `${constraints.video.width}x${constraints.video.height}`;
}
function exitFullscreen() {
  if (vid.exitFullscreen) {
    vid.exitFullscreen();
  } else if (vid.mozCancelFullScreen) {
    vid.mozCancelFullScreen();
  } else if (vid.msExitFullscreen) {
    vid.msExitFullscreen();
  } else if (vid.webkitExitFullscreen) {
    vid.webkitExitFullscreen();
  }
}
function enterFullscreen() {
  const element = vid;

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
function getScreenSize() {
  return { width: screen.width, height: screen.height };
}
function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}
var form = document.getElementById("settingsForm");
form.addEventListener('submit', onsubmit);

addEventListener("fullscreenchange", async (event) => {
  document.fullscreenElement ? hideToolbar() : showToolbar();
  if (document.fullscreenElement) {
    constraints.video.width = screen.width;
    constraints.video.height = screen.height;
  } else {
    constraints.video.width = window.innerWidth;
    constraints.video.height = constraints.video.height = window.innerHeight - 50;
  }
  await setVideoParameters();
});