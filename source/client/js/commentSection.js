const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
  event.preventDefault();
  const video = videoContainer.dataset.videoid;
  let text = textarea.value;
  JSON.stringify(text);
  fetch(`/api/videos/${video}/comment`, {
    method: "POST",
    body: JSON.stringify({ text: "hellow", rating: 5 }),
  });
};

btn.addEventListener("click", handleSubmit);
