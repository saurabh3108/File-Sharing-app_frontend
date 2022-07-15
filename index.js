const dropZone = document.querySelector(".drop-zone");
const browsebtn = document.querySelector(".browsebtn");
const fileinput = document.querySelector("#fileinput");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-Progress");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURL = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const host = " https://inshare-files.herokuapp.com/"; //it will change after backend
const uploadURL = host + "api/files"; //gateway
//const uploadURL = host + "api/files";  //for email, vid 56.15min
const emailURL = host + "api/files/send"; //2:24 hr

const maxAllowedSize = 100 * 1024 * 1024; //100mb

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  //console.log("dragging");
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  // console.log("dragging");
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", e => {
  // console.log("dragging");
  e.preventDefault();
  dropZone.classList.remove("dragged");
  //console.log(e.dataTransfer.files);
  const files = e.dataTransfer.files;
  //console.log(files);
  if (files.length) {
    fileinput.files = files;
    uploadFile(); //upload function called
  }
});

fileinput.addEventListener("change", () => {
  uploadFile();
});

browsebtn.addEventListener("click", () => {
  fileinput.click();
});

copyBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Link copied");
});

////////////////////////////////////////////////upload function/////////
const uploadFile = () => {
  if (fileinput.files.length > 1) {
    resetFileInput();
    showToast("One file at a time, buddy !!");
    return;
  }
  const file = fileinput.files[0];

  if (file.size > maxAllowedSize) {
    showToast("Exceeds 100mb");
    resetFileInput();
    return;
  }

  progressContainer.style.display = "block";

  const formData = new FormData();
  formData.append("myfile", file); //some backend concept

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    //when event khatam hua
    // console.log(xhr.readyState);

    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      showLink(JSON.parse(xhr.response)); //parse lagane se javascript object bngya
    }
  };

  xhr.upload.onprogress = updateProgress; //progress of upload batayega///////////////////////////
  xhr.upload.onerror = () => {
    resetFileInput();
    showToast(`Error in upload: ${xhr.statusText}`);
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = e => {
  /////progress fnt
  //  console.log(e);
  const percent = Math.round((e.loaded / e.total) * 100);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
};

const showLink = ({ file: url }) => {
  console.log(url);
  resetFileInput(); //remove previous input
  emailForm[2].removeAttribute("disabled"); //now button is showing
  progressContainer.style.display = "none"; //1:36 hr
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

const resetFileInput = () => {
  fileinput.value = "";
};

emailForm.addEventListener("submit", e => {
  e.preventDefault();
  console.log("Submit form");
  const url = fileURL.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value
  };

  emailForm[2].setAttribute("disabled", "true");
  console.table(formData);

  fetch(emailURL, {
    method: "POST", //data sending
    headers: {
      "Content-Type": "application/json" //as json
    },
    body: JSON.stringify(formData) //JS object changes into JSON
  })
    .then(res => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("Email sent");
      }
    });
});

let toastTimer;
const showToast = msg => {
  toast.innerText = msg;
  toast.style.transform = "translate(-50%,0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%,60px)";
  }, 2000);
};
