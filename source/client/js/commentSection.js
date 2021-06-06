const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector(".video-comments-form");
const createCommentBtn = form.querySelector("button");
const deleteCommentBtn = document.querySelector("#video-comment__delete-btn");

const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const videoId = videoContainer.dataset.videoid;
  let text = textarea.value;
  if (text === "") {
    return;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text }),
  }).then((response) => {
    console.log(response);
  });
  const commentTag = document.querySelector(".video-comments__list");
  let newElement = document.createElement("li");
  newElement.innerHTML = `${text}`;
  commentTag.appendChild(newElement);
  textarea.value = "";
  // window.location.reload();
};

const handleCommentDelete = () => {
  const commentId = deleteCommentBtn.dataset.commentid;
  fetch(`/api/videos/${commentId}/comment/delete`, {
    method: "POST",
  }).then((response) => {
    window.location.reload();
  });
};

createCommentBtn.addEventListener("click", handleSubmit);

if (deleteCommentBtn === null) {
} else {
  deleteCommentBtn.addEventListener("click", handleCommentDelete);
}
